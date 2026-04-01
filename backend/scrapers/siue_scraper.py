# SIUE Course Catalog Scraper
# See plan at .claude/plans/splendid-seeking-anchor.md for full implementation details

import requests
import sys
import time
import re
import os
from dotenv import load_dotenv
load_dotenv()

# SIUE Banner 9 API URLs (no auth required)
BASE_URL = "https://banner.siue.edu/StudentRegistrationSsb/ssb"
TERM_URL = f"{BASE_URL}/term/search"
SUBJECTS_URL = f"{BASE_URL}/classSearch/get_subject"
SEARCH_URL = f"{BASE_URL}/searchResults/searchResults"
DELAY = 1 # seconds
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; cougar-planner/1.0; +https://cougar-planner.com)"
}

TERM = os.getenv("SIUE_TERM")


def create_session():
    session = requests.Session()
    session.headers.update(HEADERS)

    # Initialize the term — Banner 9 requires this before any search
    response = session.post(
        f"{TERM_URL}?mode=search",
        data={"term": TERM},
        timeout=15,
    )
    response.raise_for_status()
    print(f"Session initialized for term {TERM}")
    return session


def fetch_subjects(session):
    response = session.get(
        SUBJECTS_URL,
        params={"searchTerm": "", "term": TERM, "offset": 1, "max": 500},
        timeout=15,
    )
    response.raise_for_status()
    subjects = [s["code"] for s in response.json()]
    print(f"Found {len(subjects)} subjects")
    return subjects

def fetch_courses(session, subject):
    # Re-initialize session context before each subject — Banner 9 sessions
    # degrade after many searches and start capping results at 10
    session.post(f"{TERM_URL}?mode=search", data={"term": TERM}, timeout=15)

    offset = 0
    all_sections = []
    totalCount = None

    while True:
        response = session.get(
            SEARCH_URL,
            params={"txt_subject": subject, "txt_term": TERM, "pageOffset": offset, "pageMaxSize": 500},
            timeout=15,
        )
        response.raise_for_status()
        payload = response.json()
        if totalCount is None:
            totalCount = payload["totalCount"]
        data = payload["data"]
        if not data:
            break
        all_sections.extend(data)
        offset += len(data)
        if offset >= totalCount:
            break

    return all_sections


def parse_section(section):
    faculty = section["faculty"]
    professor = faculty[0]["displayName"] if faculty else "Unknown"

    meetings = section["meetingsFaculty"]
    meeting_time = meetings[0]["meetingTime"] if meetings else {}

    return {
        "crn": section["courseReferenceNumber"],
        "subject": section["subject"],
        "course_number": section["courseNumber"],
        "title": section["courseTitle"],
        "credits": section["creditHours"],
        "capacity": section["maximumEnrollment"],
        "enrolled": section["enrollment"],
        "professor": professor,
        "start_time": meeting_time.get("beginTime"),
        "end_time": meeting_time.get("endTime"),
        "building": meeting_time.get("building"),
        "room": meeting_time.get("room"),
        "monday": meeting_time.get("monday"),
        "tuesday": meeting_time.get("tuesday"),
        "wednesday": meeting_time.get("wednesday"),
        "thursday": meeting_time.get("thursday"),
        "friday": meeting_time.get("friday"),
    }

def upsert_sections(sections):
    from app import create_app, db
    from app.models import Section, Course, Professor, Schedule
    app = create_app()
    with app.app_context():
        created = 0
        updated = 0
        skipped = 0
    
        for i, section in enumerate(sections, 1):
            try:
                data = parse_section(section)
                course = Course.query.filter_by(subject=data["subject"], number=data["course_number"]).first()
                if not course:
                    course = Course(subject=data["subject"], number=data["course_number"], name=data["title"], credits=data["credits"])
                    db.session.add(course)
                    db.session.flush()

                # Find or create Professor
                prof = Professor.query.filter_by(name=data["professor"]).first()
                if not prof:
                    prof = Professor(name=data["professor"])
                    db.session.add(prof)
                    db.session.flush()

                # Upsert Section
                existing = Section.query.filter_by(crn=data["crn"]).first()
                if existing:
                    existing.capacity = data["capacity"]
                    existing.enrolled = data["enrolled"]
                    existing.professor_id = prof.id
                    updated += 1
                else:
                    existing = Section(
                        crn=data["crn"],
                        course_id=course.id,
                        professor_id=prof.id,
                        semester=TERM,
                        capacity=data["capacity"],
                        enrolled=data["enrolled"],
                    )
                    db.session.add(existing)
                    db.session.flush()
                    created += 1

                # Upsert Schedule rows (one per day)
                Schedule.query.filter_by(section_id=existing.id).delete()
                for day in ["monday", "tuesday", "wednesday", "thursday", "friday"]:
                    if data.get(day):
                        db.session.add(Schedule(
                            section_id=existing.id,
                            day=day,
                            start_time=data["start_time"],
                            end_time=data["end_time"],
                            location=f"{data['building']} {data['room']}".strip(),
                        ))

                if i % 10 == 0:
                    db.session.commit()
                    print(f"  Saved {i}/{len(sections)} sections...")

            except Exception as e:
                print(f"  [ERROR] Section {i}: {e}", file=sys.stderr)
                db.session.rollback()
                skipped += 1

        db.session.commit()
        print(f"\nDone. Created: {created} | Updated: {updated} | Skipped: {skipped}")



if __name__ == "__main__":
    session = create_session()
    subjects = fetch_subjects(session)
    for subject in subjects:
        print(f"Fetching {subject} courses...")
        courses = fetch_courses(session, subject)
        upsert_sections(courses)
        time.sleep(DELAY)
        print(f"Done fetching {subject} courses")
    
       


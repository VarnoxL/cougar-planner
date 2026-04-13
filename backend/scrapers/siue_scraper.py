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
    raw_name = faculty[0]["displayName"] if faculty else "Unknown"
    if ", " in raw_name:
        last, first = raw_name.split(", ", 1)
        professor = f"{first} {last}"
    else:
        professor = raw_name

    meetings = []
    for m in section.get("meetingsFaculty", []):
        mt = m.get("meetingTime", {})
        meetings.append({
            "start_time": mt.get("beginTime"),
            "end_time": mt.get("endTime"),
            "building": mt.get("building"),
            "room": mt.get("room"),
            "monday": mt.get("monday"),
            "tuesday": mt.get("tuesday"),
            "wednesday": mt.get("wednesday"),
            "thursday": mt.get("thursday"),
            "friday": mt.get("friday"),
        })

    return {
        "crn": section["courseReferenceNumber"],
        "subject": section["subject"],
        "course_number": section["courseNumber"],
        "section_num": section.get("sequenceNumber"),
        "delivery_method": section.get("instructionalMethod"),
        "title": section["courseTitle"],
        "credits": section["creditHours"],
        "capacity": section["maximumEnrollment"],
        "enrolled": section["enrollment"],
        "professor": professor,
        "meetings": meetings,
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

                # Find professor — prefer matching by name against existing
                # RMP-sourced records. Fall back to creating a new row only if
                # no match exists at all, so we avoid duplicates when both
                # scrapers run.
                prof = Professor.query.filter_by(name=data["professor"]).first()
                if not prof:
                    # Try a looser match: "First Last" vs DB might have spacing diffs
                    prof = Professor.query.filter(Professor.name.ilike(data["professor"])).first()
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
                    existing.section_num = data["section_num"]
                    existing.delivery_method = data["delivery_method"]
                    updated += 1
                else:
                    existing = Section(
                        crn=data["crn"],
                        course_id=course.id,
                        professor_id=prof.id,
                        semester=TERM,
                        section_num=data["section_num"],
                        delivery_method=data["delivery_method"],
                        capacity=data["capacity"],
                        enrolled=data["enrolled"],
                    )
                    db.session.add(existing)
                    db.session.flush()
                    created += 1

                # Upsert Schedule rows (one per day per meeting slot)
                Schedule.query.filter_by(section_id=existing.id).delete()
                for meeting in data["meetings"]:
                    location = f"{meeting['building'] or ''} {meeting['room'] or ''}".strip()
                    for day in ["monday", "tuesday", "wednesday", "thursday", "friday"]:
                        if meeting.get(day):
                            db.session.add(Schedule(
                                section_id=existing.id,
                                day=day,
                                start_time=meeting["start_time"],
                                end_time=meeting["end_time"],
                                location=location,
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
    
       


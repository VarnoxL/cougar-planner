import re
from flask import Blueprint, jsonify, request
from sqlalchemy import case, func
from sqlalchemy.orm import joinedload
from ..models import Course, Section, Professor, Schedule
from .. import db

courses_bp = Blueprint("courses", __name__)


def _term_label(code):
    if len(code) == 6 and code.isdigit():
        year, suffix = code[:4], code[4:]
        names = {"35": "Fall", "25": "Summer", "15": "Spring"}
        term = names.get(suffix)
        if term:
            return f"{term} {year}"
    return code


@courses_bp.route("/api/semesters", methods=["GET"])
def list_semesters():
    rows = (
        db.session.query(Section.semester)
        .group_by(Section.semester)
        .having(func.max(Section.capacity) > 0)
        .order_by(Section.semester.desc())
        .all()
    )
    return jsonify([{"value": code, "label": _term_label(code)} for (code,) in rows if code])


@courses_bp.route("/api/courses", methods=["GET"])
def list_courses():
    subject = request.args.get("subject")
    search = request.args.get("search")

    query = Course.query

    if subject:
        query = query.filter(Course.subject.ilike(subject))
    if search:
        # Handle "SUBJECT NUMBER" format (e.g. "MATH 250", "cs 225")
        subject_num = re.match(r'^([a-zA-Z]+)\s+(\w+)$', search.strip())
        if subject_num:
            subj, num = subject_num.group(1), subject_num.group(2)
            query = query.filter(
                Course.subject.ilike(subj) &
                Course.number.ilike(f"{num}%")
            )
            query = query.order_by(Course.subject, Course.number)
        else:
            query = query.filter(
                Course.subject.ilike(f"{search}%") |
                Course.name.ilike(f"%{search}%") |
                Course.number.ilike(f"%{search}%")
            )
            query = query.order_by(
                case(
                    (Course.subject.ilike(f"{search}%"), 0),
                    else_=1
                ),
                Course.subject,
                Course.number,
            )

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    per_page = min(per_page, 100)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
        "results": [
            {
                "id": c.id,
                "subject": c.subject,
                "number": c.number,
                "name": c.name,
                "credits": c.credits,
                "description": c.description,
            }
            for c in pagination.items
        ],
    })


@courses_bp.route("/api/courses/<int:course_id>", methods=["GET"])
def get_course(course_id):
    course = Course.query.options(
        joinedload(Course.sections)
        .joinedload(Section.professor),
        joinedload(Course.sections)
        .joinedload(Section.schedules),
    ).get_or_404(course_id)

    sections = []
    for s in course.sections:
        professor = None
        if s.professor:
            professor = {
                "id": s.professor.id,
                "name": s.professor.name,
                "rating": s.professor.rating,
                "difficulty": s.professor.difficulty,
            }
        sections.append({
            "id": s.id,
            "crn": s.crn,
            "section_num": s.section_num,
            "semester": s.semester,
            "capacity": s.capacity,
            "enrolled": s.enrolled,
            "delivery_method": s.delivery_method,
            "professor": professor,
            "schedules": [
                {
                    "day": sch.day,
                    "start_time": sch.start_time,
                    "end_time": sch.end_time,
                    "location": sch.location,
                }
                for sch in s.schedules
            ],
        })

    return jsonify({
        "id": course.id,
        "subject": course.subject,
        "number": course.number,
        "name": course.name,
        "credits": course.credits,
        "description": course.description,
        "sections": sections,
    })

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import joinedload
from ..models import Course, Section, Professor, Schedule

courses_bp = Blueprint("courses", __name__)


@courses_bp.route("/api/courses", methods=["GET"])
def list_courses():
    subject = request.args.get("subject")
    search = request.args.get("search")

    query = Course.query

    if subject:
        query = query.filter(Course.subject.ilike(subject))
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            Course.name.ilike(pattern) | Course.number.ilike(pattern)
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

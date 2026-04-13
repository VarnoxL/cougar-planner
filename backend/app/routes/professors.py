from flask import Blueprint, jsonify, request
from sqlalchemy.orm import joinedload
from ..models import Professor, Section, Course, Review

professors_bp = Blueprint("professors", __name__)


@professors_bp.route("/api/professors", methods=["GET"])
def list_professors():
    department = request.args.get("department")
    min_rating = request.args.get("min_rating", type=float)

    query = Professor.query

    if department:
        query = query.filter(Professor.department.ilike(f"%{department}%"))
    if min_rating is not None:
        query = query.filter(Professor.rating >= min_rating)

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
                "id": p.id,
                "name": p.name,
                "department": p.department,
                "rating": p.rating,
                "difficulty": p.difficulty,
                "num_ratings": p.num_ratings,
                "would_take_again": p.would_take_again,
            }
            for p in pagination.items
        ],
    })


@professors_bp.route("/api/professors/<int:professor_id>", methods=["GET"])
def get_professor(professor_id):
    professor = Professor.query.options(
        joinedload(Professor.sections),
        joinedload(Professor.reviews).joinedload(Review.course),
    ).get_or_404(professor_id)

    # Distinct courses this professor has taught via sections
    course_ids = {s.course_id for s in professor.sections}
    courses = Course.query.filter(Course.id.in_(course_ids)).all() if course_ids else []

    reviews = [
        {
            "id": r.id,
            "rating": r.rating,
            "difficulty": r.difficulty,
            "grade_received": r.grade_received,
            "comment": r.comment,
            "semester_taken": r.semester_taken,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "course": {
                "id": r.course.id,
                "subject": r.course.subject,
                "number": r.course.number,
                "name": r.course.name,
            } if r.course else None,
        }
        for r in professor.reviews
    ]

    return jsonify({
        "id": professor.id,
        "name": professor.name,
        "department": professor.department,
        "rating": professor.rating,
        "difficulty": professor.difficulty,
        "num_ratings": professor.num_ratings,
        "would_take_again": professor.would_take_again,
        "rmp_id": professor.rmp_id,
        "courses": [
            {
                "id": c.id,
                "subject": c.subject,
                "number": c.number,
                "name": c.name,
            }
            for c in courses
        ],
        "reviews": reviews,
    })

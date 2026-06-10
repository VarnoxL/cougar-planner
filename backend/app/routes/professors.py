from flask import Blueprint, jsonify, request
from sqlalchemy.orm import joinedload
from ..models import Professor, Section, Course, Review, RmpReview
from ..utils.rmp import (
    legacy_id_from_rmp_id,
    needs_rmp_review_sync,
    serialize_rmp_review,
    sync_professor_rmp_reviews,
)
from .. import db, limiter

professors_bp = Blueprint("professors", __name__)


@professors_bp.route("/api/professors", methods=["GET"])
def list_professors():
    name = request.args.get("name")
    department = request.args.get("department")
    min_rating = request.args.get("min_rating", type=float)

    query = Professor.query

    if name:
        query = query.filter(Professor.name.ilike(f"%{name}%"))
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
        "rmp_rating": professor.rating,
        "rmp_difficulty": professor.difficulty,
        "rmp_num_ratings": professor.num_ratings,
        "rmp_would_take_again": professor.would_take_again,
        "rating": professor.rating,
        "difficulty": professor.difficulty,
        "num_ratings": professor.num_ratings,
        "would_take_again": professor.would_take_again,
        "cougar_rating": None,
        "cougar_num_ratings": len(reviews),
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
        "rmp_legacy_id": legacy_id_from_rmp_id(professor.rmp_id),
    })


@professors_bp.route("/api/professors/<int:professor_id>/rmp-reviews", methods=["GET"])
@limiter.limit("30 per minute")
def list_rmp_reviews(professor_id):
    professor = Professor.query.get_or_404(professor_id)
    if not professor.rmp_id:
        return jsonify({
            "source": "ratemyprofessors",
            "page": 1,
            "per_page": 20,
            "total": 0,
            "pages": 0,
            "results": [],
        })

    refresh = request.args.get("refresh", "").lower() in ("1", "true", "yes")
    if needs_rmp_review_sync(professor.id, RmpReview, force=refresh):
        try:
            sync_professor_rmp_reviews(professor, db, RmpReview)
        except Exception as e:
            cached_count = RmpReview.query.filter_by(professor_id=professor.id).count()
            if cached_count == 0:
                return jsonify({"error": f"Failed to fetch RateMyProfessors reviews: {e}"}), 502

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    per_page = min(per_page, 50)

    query = (
        RmpReview.query
        .filter_by(professor_id=professor.id)
        .order_by(RmpReview.review_date.is_(None), RmpReview.review_date.desc(), RmpReview.id.desc())
    )
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "source": "ratemyprofessors",
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
        "results": [serialize_rmp_review(r) for r in pagination.items],
    })

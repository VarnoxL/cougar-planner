from flask import Blueprint, jsonify, request
from ..models import Review, Professor, Course, User
from .. import db

reviews_bp = Blueprint("reviews", __name__)


# GET /api/reviews?professor_id=<int>&course_id=<int>
# - At least one of professor_id or course_id is required (400 if neither given)
# - Filter the Review query by whichever params are provided
# - Each item: id, rating, difficulty, grade_received, comment, semester_taken, created_at
#   plus nested: user { id, display_name }, course { id, subject, number, name }
@reviews_bp.route("/api/reviews", methods=["GET"])
def list_reviews():
    professor_id = request.args.get("professor_id")
    course_id = request.args.get("course_id")
    if not professor_id and not course_id:
        return jsonify({"error": "professor_id and course_id not found"}), 400
    query = Review.query
    if professor_id:
        query = query.filter_by(professor_id=professor_id)
    if course_id:
        query = query.filter_by(course_id=course_id)
    reviews = query.all()
    return jsonify([
        {
            "id": r.id,
            "course": {
                "id": r.course.id,
                "subject": r.course.subject,
                "number": r.course.number,
                "name": r.course.name,
            },
            "user": {
                "id": r.user.id,
                "display_name": r.user.display_name,
            },
            "rating": r.rating,
            "difficulty": r.difficulty,
            "grade_received": r.grade_received,
            "comment": r.comment,
            "semester_taken": r.semester_taken,
            "created_at":r.created_at.isoformat() if r.created_at else None,
        }
        for r in reviews
    ])

    





# POST /api/reviews
# - Required body fields: user_id, professor_id, course_id
# - Optional: rating (1-5), difficulty (1-5), grade_received, comment, semester_taken
# - Validate rating and difficulty are in range 1-5 if provided (return 400 if not)
# - Verify user, professor, and course all exist (404 if any missing)
# - Create and commit the Review, return 201
def create_review():
    pass


# DELETE /api/reviews/<review_id>
# - Use get_or_404 to fetch the review
# - Delete and commit
# - Return { "message": "Review deleted" }
def delete_review(review_id):
    pass

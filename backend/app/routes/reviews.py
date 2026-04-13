from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import joinedload
from ..models import Review, Professor, Course, User
from ..utils.auth import require_auth
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
    query = Review.query.options(
        joinedload(Review.course),
        joinedload(Review.user),
    )
    if professor_id:
        query = query.filter_by(professor_id=professor_id)
    if course_id:
        query = query.filter_by(course_id=course_id)
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
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in pagination.items
        ],
    })

    





# POST /api/reviews
# - Required body fields: user_id, professor_id, course_id
# - Optional: rating (1-5), difficulty (1-5), grade_received, comment, semester_taken
# - Validate rating and difficulty are in range 1-5 if provided (return 400 if not)
# - Verify user, professor, and course all exist (404 if any missing)
# - Create and commit the Review, return 201
@reviews_bp.route("/api/reviews", methods=["POST"])
def create_review():
    data = request.get_json()
    if not data:
        return jsonify({"error": "request body is required"}), 400
    user_id = data.get("user_id")
    professor_id = data.get("professor_id")
    course_id = data.get("course_id")
    if user_id is None or professor_id is None or course_id is None:
        return jsonify({"error": "user_id, professor_id, and course_id not found"}), 400
    User.query.get_or_404(user_id)
    Professor.query.get_or_404(professor_id)
    Course.query.get_or_404(course_id)
    rating = data.get("rating")
    if rating is not None:
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({"error": "rating must be an integer between 1 and 5"}), 400
    difficulty = data.get("difficulty")
    if difficulty is not None:
        if not isinstance(difficulty, int) or difficulty < 1 or difficulty > 5:
            return jsonify({"error": "difficulty must be an integer between 1 and 5"}), 400
    VALID_GRADES = {"A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "W"}
    grade_received = data.get("grade_received")
    if grade_received is not None:
        grade_received = grade_received.upper().strip()
        if grade_received not in VALID_GRADES:
            return jsonify({"error": "grade_received must be one of: A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F, W"}), 400
    comment = data.get("comment")
    semester_taken = data.get("semester_taken")
    review = Review(user_id=user_id, professor_id=professor_id, course_id=course_id, grade_received=grade_received,
    comment=comment, semester_taken=semester_taken, rating=rating, difficulty=difficulty)
    db.session.add(review)
    db.session.commit()
    return jsonify(
        {
            "id": review.id,
            "course": {
                "id": review.course.id,
                "subject": review.course.subject,
                "number": review.course.number,
                "name": review.course.name,
            },
            "user": {
                "id": review.user.id,
                "display_name": review.user.display_name,
            },
            "rating": review.rating,
            "difficulty": review.difficulty,
            "grade_received": review.grade_received,
            "comment": review.comment,
            "semester_taken": review.semester_taken,
            "created_at":review.created_at.isoformat() if review.created_at else None,
        }), 201








    


# DELETE /api/reviews/<review_id>
# - Use get_or_404 to fetch the review
# - Delete and commit
# - Return { "message": "Review deleted" }
@reviews_bp.route("/api/reviews/<int:review_id>", methods=["DELETE"])
@require_auth
def delete_review(review_id):
    review = Review.query.get_or_404(review_id)
    if g.decoded_token.get("uid") != review.user.firebase_uid:
        return jsonify({"error": "permission denied"}), 403
    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Review deleted"}), 200
    

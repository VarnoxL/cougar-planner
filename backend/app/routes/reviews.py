from flask import Blueprint, jsonify, request
from ..models import Review, Professor, Course, User
from .. import db

reviews_bp = Blueprint("reviews", __name__)


# GET /api/reviews?professor_id=<int>&course_id=<int>
# - At least one of professor_id or course_id is required (400 if neither given)
# - Filter the Review query by whichever params are provided
# - Each item: id, rating, difficulty, grade_received, comment, semester_taken, created_at
#   plus nested: user { id, display_name }, course { id, subject, number, name }
def list_reviews():
    pass


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

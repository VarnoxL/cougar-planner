from flask import Blueprint, jsonify, request
from ..models import GradeDistribution

grade_distributions_bp = Blueprint("grade_distributions", __name__)


# GET /api/grade-distributions?professor_id=<int>&course_id=<int>&semester=<str>
# - Require at least professor_id or course_id (400 if neither given)
# - Filter by any combination of the three params that are provided
# - Return a list of distribution rows
# - Each item: id, semester, total_students, a_count through w_count,
#   plus nested: professor { id, name }, course { id, subject, number, name }
def list_grade_distributions():
    pass


# GET /api/grade-distributions/summary?professor_id=<int>&course_id=<int>
# - Same filter requirements as above
# - Fetch all matching rows, then SUM all the count columns across rows
# - Also compute percentages: a_pct = round(a_count / total * 100, 1), etc.
#   Guard against division by zero if total is 0
# - Return a single summary object:
#   { professor_id, course_id, total_students, a_count...w_count,
#     a_pct...w_pct, semesters_included: [sorted list of semester strings] }
def grade_distribution_summary():
    pass

from flask import Blueprint, jsonify, request
from sqlalchemy import func, case
from ..models import Review, Professor, Course, db

grade_distributions_bp = Blueprint("grade_distributions", __name__)

A_GRADES = ("A", "A-")
B_GRADES = ("B+", "B", "B-")
C_GRADES = ("C+", "C", "C-")
D_GRADES = ("D+", "D", "D-")
MIN_REVIEWS = 5


def pct(count, total):
    return round(count / total * 100, 1) if total else 0.0


def _build_grade_query():
    return db.session.query(
        func.count(Review.id).label("review_count"),
        func.sum(case((Review.grade_received.in_(A_GRADES), 1), else_=0)).label("a_count"),
        func.sum(case((Review.grade_received.in_(B_GRADES), 1), else_=0)).label("b_count"),
        func.sum(case((Review.grade_received.in_(C_GRADES), 1), else_=0)).label("c_count"),
        func.sum(case((Review.grade_received.in_(D_GRADES), 1), else_=0)).label("d_count"),
        func.sum(case((Review.grade_received == "F", 1), else_=0)).label("f_count"),
        func.sum(case((Review.grade_received == "W", 1), else_=0)).label("w_count"),
    ).filter(Review.grade_received.isnot(None))


# GET /api/grade-distributions?professor_id=<int>&course_id=<int>&semester=<str>
# - Require at least professor_id or course_id (400 if neither given)
# - Filter by any combination of the three params that are provided
# - Return a list of distribution rows grouped by semester
# - Each item: id, semester, total_students, a_count through w_count,
#   plus nested: professor { id, name }, course { id, subject, number, name }
# NOTE: Data is aggregated from student-submitted reviews (Review.grade_received).
# Official IBHE CSV data source is unavailable — grade_scraper.py is preserved for future use.
@grade_distributions_bp.route("/api/grade-distributions", methods=["GET"])
def list_grade_distributions():
    professor_id = request.args.get("professor_id", type=int)
    course_id = request.args.get("course_id", type=int)
    semester = request.args.get("semester")

    if professor_id is None and course_id is None:
        return jsonify({"error": "at least one of professor_id or course_id is required"}), 400

    q = _build_grade_query().add_columns(Review.semester_taken)

    if professor_id is not None:
        q = q.filter(Review.professor_id == professor_id)
    if course_id is not None:
        q = q.filter(Review.course_id == course_id)
    if semester:
        q = q.filter(Review.semester_taken == semester)

    rows = q.group_by(Review.semester_taken).all()

    professor = Professor.query.get(professor_id) if professor_id is not None else None
    course = Course.query.get(course_id) if course_id is not None else None

    return jsonify([
        {
            "id": None,
            "semester": row.semester_taken,
            "total_students": row.review_count,
            "a_count": row.a_count,
            "b_count": row.b_count,
            "c_count": row.c_count,
            "d_count": row.d_count,
            "f_count": row.f_count,
            "w_count": row.w_count,
            "professor": {"id": professor.id, "name": professor.name} if professor else None,
            "course": {"id": course.id, "subject": course.subject, "number": course.number, "name": course.name} if course else None,
        }
        for row in rows
    ])


# GET /api/grade-distributions/summary?professor_id=<int>&course_id=<int>
# - Same filter requirements as above
# - Aggregate all matching rows across all semesters
# - Compute percentages: a_pct = round(a_count / total * 100, 1), etc.
# - Returns insufficient_data if fewer than MIN_REVIEWS graded reviews exist
# NOTE: Data is aggregated from student-submitted reviews (Review.grade_received).
# Official IBHE CSV data source is unavailable — grade_scraper.py is preserved for future use.
@grade_distributions_bp.route("/api/grade-distributions/summary", methods=["GET"])
def grade_distribution_summary():
    professor_id = request.args.get("professor_id", type=int)
    course_id = request.args.get("course_id", type=int)

    if professor_id is None and course_id is None:
        return jsonify({"error": "at least one of professor_id or course_id is required"}), 400

    q = _build_grade_query()

    if professor_id is not None:
        q = q.filter(Review.professor_id == professor_id)
    if course_id is not None:
        q = q.filter(Review.course_id == course_id)

    row = q.one()

    if row.review_count < MIN_REVIEWS:
        return jsonify({
            "professor_id": professor_id,
            "course_id": course_id,
            "insufficient_data": True,
            "review_count": row.review_count,
            "message": f"At least {MIN_REVIEWS} graded reviews are required to show distribution.",
        }), 200

    semesters_q = db.session.query(Review.semester_taken).filter(Review.grade_received.isnot(None))
    if professor_id is not None:
        semesters_q = semesters_q.filter(Review.professor_id == professor_id)
    if course_id is not None:
        semesters_q = semesters_q.filter(Review.course_id == course_id)
    semesters_included = sorted([s[0] for s in semesters_q.distinct().all() if s[0]])

    total = row.review_count
    return jsonify({
        "professor_id": professor_id,
        "course_id": course_id,
        "total_students": total,
        "a_count": row.a_count,
        "b_count": row.b_count,
        "c_count": row.c_count,
        "d_count": row.d_count,
        "f_count": row.f_count,
        "w_count": row.w_count,
        "a_pct": pct(row.a_count, total),
        "b_pct": pct(row.b_count, total),
        "c_pct": pct(row.c_count, total),
        "d_pct": pct(row.d_count, total),
        "f_pct": pct(row.f_count, total),
        "w_pct": pct(row.w_count, total),
        "semesters_included": semesters_included,
    })

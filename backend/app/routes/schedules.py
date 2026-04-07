from flask import Blueprint, jsonify, request
from ..models import SavedSchedule, SavedScheduleSection, Section, User
from ..utils.conflict import get_conflicts
from .. import db

schedules_bp = Blueprint("schedules", __name__)


# GET /api/schedules?user_id=<int>
# - Require user_id query param (return 400 if missing)
# - Return a list of the user's saved schedules
# - Each item: id, name, semester, created_at, section_count
@schedules_bp.route("/api/schedules", methods=["GET"])
def list_schedules():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error" : "user_id is required"}), 400

    schedules = SavedSchedule.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            "id": s.id,
            "name": s.name,
            "semester": s.semester,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "section_count": len(s.saved_schedule_sections),
        }
        for s in schedules
    ])


# POST /api/schedules
# - Body: { user_id, name, semester } — all required (400 if missing)
# - Verify the user exists, return 404 if not
# - Create and commit a SavedSchedule
# - Return the new schedule object with 201
@schedules_bp.route("/api/schedules", methods=["POST"])
def create_schedule():
    data = request.get_json()
    user_id = data.get("user_id")
    name = data.get("name")
    semester = data.get("semester")
    if not user_id or not name or not semester:
        return jsonify({"error": "user_id, name, and semester are required"}), 400
    User.query.get_or_404(user_id)

    schedule = SavedSchedule(user_id=user_id, name=name, semester=semester)
    db.session.add(schedule)
    db.session.commit()
    return jsonify({
        "id": schedule.id,
        "user_id": schedule.user_id,
        "name": schedule.name,
        "semester": schedule.semester,
        "created_at": schedule.created_at.isoformat() if schedule.created_at else None,
        "section_count": 0,
    }), 201


# GET /api/schedules/<schedule_id>
# - Use get_or_404 to fetch the schedule
# - Return full detail: id, name, semester, created_at, and a sections list
# - For each SavedScheduleSection → Section, nest: course, professor (nullable!), schedules[]
# - See courses.py lines 42-49 for how to handle a nullable professor
@schedules_bp.route("/api/schedules/<int:schedule_id>", methods=["GET"])
def get_schedule(schedule_id):
    current_schedule = SavedSchedule.query.get_or_404(schedule_id)
    section_list = []
    for saved_schedule_section in current_schedule.saved_schedule_sections:
        section = saved_schedule_section.section
        professor = None
        if section.professor:
            professor = {
                "id": section.professor.id,
                "name": section.professor.name,
                "rating": section.professor.rating,
                "difficulty": section.professor.difficulty,
            }
        section_list.append({
            "id": section.id,
            "crn": section.crn,
            "section_num": section.section_num,
            "semester": section.semester,
            "capacity": section.capacity,
            "enrolled": section.enrolled,
            "delivery_method": section.delivery_method,
            "course": {
                "id": section.course.id,
                "subject": section.course.subject,
                "number": section.course.number,
                "name": section.course.name,
            },
            
            "professor": professor,
            "schedules": [
                {
                    "day": sch.day,
                    "start_time": sch.start_time,
                    "end_time": sch.end_time,
                    "location": sch.location,
                }
                for sch in section.schedules
            ],
        })
    return jsonify({
        "id": current_schedule.id,
        "name": current_schedule.name,
        "semester": current_schedule.semester,
        "created_at": current_schedule.created_at.isoformat() if current_schedule.created_at else None,
        "sections": section_list,
    })





    


# PATCH /api/schedules/<schedule_id>
# - Body: any subset of { name, semester }
# - Only update fields that are present in the request body
# - Return the updated schedule object
@schedules_bp.route("/api/schedules/<int:schedule_id>", methods=["PATCH"])
def update_schedule(schedule_id):
    new_schedule = SavedSchedule.query.get_or_404(schedule_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "empty or not JSON"}), 400
    if "name" in data:
        new_schedule.name = data.get("name")
    if "semester" in data:
        new_schedule.semester = data.get("semester")
    db.session.commit()
    return jsonify({
        "id": new_schedule.id,
        "user_id": new_schedule.user_id,
        "name": new_schedule.name,
        "semester": new_schedule.semester,
        "created_at": new_schedule.created_at.isoformat() if new_schedule.created_at else None,
        "section_count": len(new_schedule.saved_schedule_sections),
    }), 200
    
    
# DELETE /api/schedules/<schedule_id>
# - No cascade is defined on the model, so manually delete child rows first:
#     SavedScheduleSection.query.filter_by(saved_schedule_id=schedule_id).delete()
# - Then delete the schedule and commit
# - Return { "message": "Schedule deleted" }
@schedules_bp.route("/api/schedules/<int:schedule_id>", methods=["DELETE"])
def delete_schedule(schedule_id):
    schedule = SavedSchedule.query.get_or_404(schedule_id)
    SavedScheduleSection.query.filter_by(saved_schedule_id=schedule_id).delete()
    db.session.delete(schedule)
    db.session.commit()
    return jsonify ({ "message": "Schedule deleted" }), 200




# POST /api/schedules/<schedule_id>/sections
# - Body: { section_id } — required
# - Verify both the schedule and section exist (get_or_404)
# - Check for duplicate: if this (schedule_id, section_id) pair already exists, return 409
# - Run conflict detection AFTER the duplicate check:
#     conflicts = get_conflicts(schedule_id, section_id)
#     If conflicts exist, return 409 with { "error": "Time conflict", "conflicts": [...] }
# - Otherwise, create the SavedScheduleSection and return 201
@schedules_bp.route("/api/schedules/<int:schedule_id>/sections", methods=["POST"])
def add_section(schedule_id):
    pass


# DELETE /api/schedules/<schedule_id>/sections/<section_id>
# - Find the SavedScheduleSection by (saved_schedule_id, section_id)
# - If not found, return 404 with { "error": "Section not in schedule" }
# - Delete and commit, return { "message": "Section removed" }
@schedules_bp.route("/api/schedules/<int:schedule_id>/sections/<int:section_id>", methods=["DELETE"])
def remove_section(schedule_id, section_id):
    pass

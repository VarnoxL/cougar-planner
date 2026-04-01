from flask import Blueprint, jsonify, request
from ..models import SavedSchedule, SavedScheduleSection, Section, User
from ..utils.conflict import get_conflicts
from .. import db

schedules_bp = Blueprint("schedules", __name__)


# GET /api/schedules?user_id=<int>
# - Require user_id query param (return 400 if missing)
# - Return a list of the user's saved schedules
# - Each item: id, name, semester, created_at, section_count
def list_schedules():
    pass


# POST /api/schedules
# - Body: { user_id, name, semester } — all required (400 if missing)
# - Verify the user exists, return 404 if not
# - Create and commit a SavedSchedule
# - Return the new schedule object with 201
def create_schedule():
    pass


# GET /api/schedules/<schedule_id>
# - Use get_or_404 to fetch the schedule
# - Return full detail: id, name, semester, created_at, and a sections list
# - For each SavedScheduleSection → Section, nest: course, professor (nullable!), schedules[]
# - See courses.py lines 42-49 for how to handle a nullable professor
def get_schedule(schedule_id):
    pass


# PATCH /api/schedules/<schedule_id>
# - Body: any subset of { name, semester }
# - Only update fields that are present in the request body
# - Return the updated schedule object
def update_schedule(schedule_id):
    pass


# DELETE /api/schedules/<schedule_id>
# - No cascade is defined on the model, so manually delete child rows first:
#     SavedScheduleSection.query.filter_by(saved_schedule_id=schedule_id).delete()
# - Then delete the schedule and commit
# - Return { "message": "Schedule deleted" }
def delete_schedule(schedule_id):
    pass


# POST /api/schedules/<schedule_id>/sections
# - Body: { section_id } — required
# - Verify both the schedule and section exist (get_or_404)
# - Check for duplicate: if this (schedule_id, section_id) pair already exists, return 409
# - Run conflict detection AFTER the duplicate check:
#     conflicts = get_conflicts(schedule_id, section_id)
#     If conflicts exist, return 409 with { "error": "Time conflict", "conflicts": [...] }
# - Otherwise, create the SavedScheduleSection and return 201
def add_section(schedule_id):
    pass


# DELETE /api/schedules/<schedule_id>/sections/<section_id>
# - Find the SavedScheduleSection by (saved_schedule_id, section_id)
# - If not found, return 404 with { "error": "Section not in schedule" }
# - Delete and commit, return { "message": "Section removed" }
def remove_section(schedule_id, section_id):
    pass

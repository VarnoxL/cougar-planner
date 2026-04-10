# POST   /api/users           — register / sync (require_auth)
# GET    /api/users/<id>      — get profile (public)
# PATCH  /api/users/<id>      — update profile (require_auth)

from flask import Blueprint, jsonify, request
from ..models import User
from .. import db

users_bp = Blueprint("users", __name__)

@users_bp.route("/api/users", methods=["POST"])
def register():
    



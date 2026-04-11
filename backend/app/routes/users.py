# POST   /api/users           — register / sync (require_auth)
# GET    /api/users/<id>      — get profile (public)
# PATCH  /api/users/<id>      — update profile (require_auth)

from ..utils.auth import require_auth
from flask import Blueprint, jsonify, request, g
from ..models import User
from .. import db

users_bp = Blueprint("users", __name__)

@users_bp.route("/api/users", methods=["POST"])
@require_auth
def register():
    uid = g.decoded_token.get("uid")
    user = User.query.filter_by(firebase_uid=uid).first()
    if user:
        return jsonify({
        "id": user.id,
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "display_name": user.display_name,
        "major": user.major,
        "created_at": user.created_at.isoformat() if user.created_at else None,

        }),200
    else:
        email = g.decoded_token.get("email")
        user = User(firebase_uid=uid, email=email)
        db.session.add(user)
        db.session.commit()
        return jsonify({
        "id": user.id,
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "display_name": user.display_name,
        "major": user.major,
        "created_at": user.created_at.isoformat() if user.created_at else None,

        }),201











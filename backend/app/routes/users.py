# POST   /api/users           — register / sync (require_auth)
# GET    /api/users/<id>      — get profile (public)
# PATCH  /api/users/<id>      — update profile (require_auth)

from ..utils.auth import require_auth
from flask import Blueprint, jsonify, request, g
from ..models import User
from .. import db
from sqlalchemy.exc import IntegrityError

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
        if email is None:
            return jsonify({"error": "email not found"}), 400
        user = User(firebase_uid=uid, email=email)
        try:
            db.session.add(user)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "account already exists"}), 409
        return jsonify({
        "id": user.id,
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "display_name": user.display_name,
        "major": user.major,
        "created_at": user.created_at.isoformat() if user.created_at else None,

        }),201

@users_bp.route("/api/users/<int:id>", methods=["GET"])
def profile(id):
    user = User.query.get_or_404(id, description="profile not found")
    return jsonify({
        "id": user.id,
        "display_name": user.display_name,
        "major": user.major,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }), 200
            


















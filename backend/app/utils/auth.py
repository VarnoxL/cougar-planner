import functools
import firebase_admin
import firebase_admin.auth
from flask import request, jsonify, g

def require_auth(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({"error": "Missing token"}), 401
        token = parts[1]
        try:
            g.decoded_token = firebase_admin.auth.verify_id_token(token)
            return f(*args, **kwargs)
        except firebase_admin.auth.ExpiredIdTokenError:
            return jsonify({"error": "Token expired"}), 401
        except firebase_admin.auth.InvalidIdTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except firebase_admin.auth.FirebaseError:
            return jsonify({"error": "Authentication error"}), 500

    return decorated

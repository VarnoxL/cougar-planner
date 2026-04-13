import functools, firebase_admin, firebase_admin.auth
from flask import request, jsonify, g

def require_auth(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({"error": "Authorization failed"}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Authorization failed"}), 401
        token = parts[1]
        try:
            g.decoded_token = firebase_admin.auth.verify_id_token(token)
            return f(*args, **kwargs)
        except firebase_admin.auth.FirebaseError:
            return jsonify({"error": "Authorization failed"}), 401
    

    return decorated

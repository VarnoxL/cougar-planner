import functools, firebase_admin, firebase_admin.auth
from flask import request, jsonify, g

def require_auth(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({"error": "Authorization failed"}), 401

        token = auth_header.split()[1]
        try:
            g.decoded_token = firebase_admin.auth.verify_id_token(token)
            return f(*args, **kwargs)     
        except:
            return jsonify({"error": "Authorization failed"}), 401
    

    return decorated

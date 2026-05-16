from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os, json
import firebase_admin
from firebase_admin import credentials


db = SQLAlchemy()
limiter = Limiter(key_func=get_remote_address, default_limits=["60 per minute"])

def create_app(config_overrides=None):
    app = Flask(__name__)

    from .config import Config
    app.config.from_object(Config)

    if config_overrides:
        app.config.update(config_overrides)

    db.init_app(app)
    limiter.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"])
    service_account = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
    if service_account and not firebase_admin._apps:
        cred = credentials.Certificate(json.loads(service_account))
        firebase_admin.initialize_app(cred)


    from .routes.courses import courses_bp
    from .routes.professors import professors_bp
    from .routes.schedules import schedules_bp
    from .routes.reviews import reviews_bp
    from .routes.grade_distributions import grade_distributions_bp
    from .routes.users import users_bp
    app.register_blueprint(courses_bp)
    app.register_blueprint(professors_bp)
    app.register_blueprint(schedules_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(grade_distributions_bp)
    app.register_blueprint(users_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}, 200

    with app.app_context():
        from . import models
        db.create_all()

    return app

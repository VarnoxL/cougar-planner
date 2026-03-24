from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    from .config import Config
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)

    from .routes.courses import courses_bp
    from .routes.professors import professors_bp
    app.register_blueprint(courses_bp)
    app.register_blueprint(professors_bp)

    with app.app_context():
        from . import models
        db.create_all()

    return app

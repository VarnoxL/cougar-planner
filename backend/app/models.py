from datetime import datetime
from . import db


class Professor(db.Model):
    __tablename__ = "professors"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    department = db.Column(db.String(255))
    rating = db.Column(db.Float)
    difficulty = db.Column(db.Float)
    num_ratings = db.Column(db.Integer)
    would_take_again = db.Column(db.Float)
    rmp_id = db.Column(db.String(100), unique=True)

    sections = db.relationship("Section", back_populates="professor")
    reviews = db.relationship("Review", back_populates="professor")
    grade_distributions = db.relationship("GradeDistribution", back_populates="professor")


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(20), nullable=False)
    number = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    credits = db.Column(db.Integer)
    description = db.Column(db.Text)

    sections = db.relationship("Section", back_populates="course")
    reviews = db.relationship("Review", back_populates="course")
    grade_distributions = db.relationship("GradeDistribution", back_populates="course")


class Section(db.Model):
    __tablename__ = "sections"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    professor_id = db.Column(db.Integer, db.ForeignKey("professors.id"), nullable=True)
    crn = db.Column(db.String(20), unique=True, nullable=False)
    section_num = db.Column(db.String(20))
    semester = db.Column(db.String(20))
    capacity = db.Column(db.Integer)
    enrolled = db.Column(db.Integer)
    delivery_method = db.Column(db.String(50))

    course = db.relationship("Course", back_populates="sections")
    professor = db.relationship("Professor", back_populates="sections")
    schedules = db.relationship("Schedule", back_populates="section")
    saved_schedule_sections = db.relationship("SavedScheduleSection", back_populates="section")


class Schedule(db.Model):
    __tablename__ = "schedules"

    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey("sections.id"), nullable=False)
    day = db.Column(db.String(20))
    start_time = db.Column(db.String(10))
    end_time = db.Column(db.String(10))
    location = db.Column(db.String(255))

    section = db.relationship("Section", back_populates="schedules")


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    display_name = db.Column(db.String(255))
    major = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    saved_schedules = db.relationship("SavedSchedule", back_populates="user")
    reviews = db.relationship("Review", back_populates="user")


class SavedSchedule(db.Model):
    __tablename__ = "saved_schedules"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(255))
    semester = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="saved_schedules")
    saved_schedule_sections = db.relationship("SavedScheduleSection", back_populates="saved_schedule")


class SavedScheduleSection(db.Model):
    __tablename__ = "saved_schedule_sections"

    id = db.Column(db.Integer, primary_key=True)
    saved_schedule_id = db.Column(db.Integer, db.ForeignKey("saved_schedules.id"), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey("sections.id"), nullable=False)

    saved_schedule = db.relationship("SavedSchedule", back_populates="saved_schedule_sections")
    section = db.relationship("Section", back_populates="saved_schedule_sections")


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    professor_id = db.Column(db.Integer, db.ForeignKey("professors.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    rating = db.Column(db.Integer)
    difficulty = db.Column(db.Integer)
    grade_received = db.Column(db.String(5))
    comment = db.Column(db.Text)
    semester_taken = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="reviews")
    professor = db.relationship("Professor", back_populates="reviews")
    course = db.relationship("Course", back_populates="reviews")


class GradeDistribution(db.Model):
    __tablename__ = "grade_distributions"

    id = db.Column(db.Integer, primary_key=True)
    professor_id = db.Column(db.Integer, db.ForeignKey("professors.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    semester = db.Column(db.String(20))
    total_students = db.Column(db.Integer)
    a_count = db.Column(db.Integer)
    b_count = db.Column(db.Integer)
    c_count = db.Column(db.Integer)
    d_count = db.Column(db.Integer)
    f_count = db.Column(db.Integer)
    w_count = db.Column(db.Integer)

    professor = db.relationship("Professor", back_populates="grade_distributions")
    course = db.relationship("Course", back_populates="grade_distributions")

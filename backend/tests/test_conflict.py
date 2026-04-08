import pytest
from app import create_app, db
from app.models import Course, Section, Schedule, User, SavedSchedule, SavedScheduleSection
from app.utils.conflict import get_conflicts


@pytest.fixture
def app():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })

    with app.app_context():
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


# helpers

def make_course(subject="CS", number="101", name="Test Course"):
    course = Course(subject=subject, number=number, name=name)
    db.session.add(course)
    db.session.flush()
    return course


def make_section(course, crn="12345"):
    section = Section(course_id=course.id, crn=crn, semester="202510")
    db.session.add(section)
    db.session.flush()
    return section


def make_schedule(section, day="M", start_time="0900", end_time="1000"):
    schedule = Schedule(section_id=section.id, day=day, start_time=start_time, end_time=end_time)
    db.session.add(schedule)
    db.session.flush()
    return schedule


def make_saved_schedule(sections=[]):
    user = User(firebase_uid="test_uid", email="test@test.com")
    db.session.add(user)
    db.session.flush()

    saved = SavedSchedule(user_id=user.id, name="My Schedule", semester="202510")
    db.session.add(saved)
    db.session.flush()

    for section in sections:
        link = SavedScheduleSection(saved_schedule_id=saved.id, section_id=section.id)
        db.session.add(link)

    db.session.flush()
    return saved


# tests

def test_no_conflict(app):
    with app.app_context():
        course = make_course()
        existing_section = make_section(course, crn="11111")
        new_section = make_section(course, crn="22222")
        make_schedule(existing_section, day="M", start_time="0900", end_time="1000")
        make_schedule(new_section, day="M", start_time="1100", end_time="1200")
        saved = make_saved_schedule([existing_section])

        assert get_conflicts(saved.id, new_section.id) == []


def test_conflict_same_day_overlapping(app):
    with app.app_context():
        course = make_course()
        existing_section = make_section(course, crn="11111")
        new_section = make_section(course, crn="22222")
        make_schedule(existing_section, day="M", start_time="0900", end_time="1100")
        make_schedule(new_section, day="M", start_time="1000", end_time="1200")
        saved = make_saved_schedule([existing_section])

        result = get_conflicts(saved.id, new_section.id)
        assert len(result) == 1
        assert result[0]["conflicting_crn"] == "11111"
        assert result[0]["day"] == "M"


def test_no_conflict_different_day(app):
    with app.app_context():
        course = make_course()
        existing_section = make_section(course, crn="11111")
        new_section = make_section(course, crn="22222")
        make_schedule(existing_section, day="M", start_time="0900", end_time="1100")
        make_schedule(new_section, day="T", start_time="0900", end_time="1100")
        saved = make_saved_schedule([existing_section])

        assert get_conflicts(saved.id, new_section.id) == []


def test_back_to_back_no_conflict(app):
    with app.app_context():
        course = make_course()
        existing_section = make_section(course, crn="11111")
        new_section = make_section(course, crn="22222")
        make_schedule(existing_section, day="M", start_time="0900", end_time="1000")
        make_schedule(new_section, day="M", start_time="1000", end_time="1100")
        saved = make_saved_schedule([existing_section])

        assert get_conflicts(saved.id, new_section.id) == []


def test_empty_schedule_returns_empty(app):
    with app.app_context():
        course = make_course()
        new_section = make_section(course, crn="22222")
        make_schedule(new_section, day="M", start_time="0900", end_time="1000")
        saved = make_saved_schedule([])

        assert get_conflicts(saved.id, new_section.id) == []


def test_async_new_section_returns_empty(app):
    with app.app_context():
        course = make_course()
        existing_section = make_section(course, crn="11111")
        new_section = make_section(course, crn="22222")
        make_schedule(existing_section, day="M", start_time="0900", end_time="1000")
        # new_section has no Schedule rows (async)
        saved = make_saved_schedule([existing_section])

        assert get_conflicts(saved.id, new_section.id) == []


def test_tba_time_skipped(app):
    with app.app_context():
        course = make_course()
        existing_section = make_section(course, crn="11111")
        new_section = make_section(course, crn="22222")
        make_schedule(existing_section, day="M", start_time=None, end_time=None)
        make_schedule(new_section, day="M", start_time="0900", end_time="1000")
        saved = make_saved_schedule([existing_section])

        assert get_conflicts(saved.id, new_section.id) == []

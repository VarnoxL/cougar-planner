import pytest
from unittest.mock import patch
from app import create_app, db
from app.models import Course, Section, Schedule, User, SavedSchedule, SavedScheduleSection


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

def make_user(uid="uid1", email="test@siue.edu"):
    u = User(firebase_uid=uid, email=email)
    db.session.add(u)
    db.session.flush()
    return u


def make_course(subject="CS", number="101", name="Intro to CS"):
    c = Course(subject=subject, number=number, name=name)
    db.session.add(c)
    db.session.flush()
    return c


def make_section(course, crn="12345", semester="202635"):
    s = Section(course_id=course.id, crn=crn, semester=semester)
    db.session.add(s)
    db.session.flush()
    return s


def make_schedule_row(section, day="M", start_time="0900", end_time="1000"):
    sch = Schedule(section_id=section.id, day=day, start_time=start_time, end_time=end_time)
    db.session.add(sch)
    db.session.flush()
    return sch


def make_saved_schedule(user, name="My Schedule", semester="202635"):
    ss = SavedSchedule(user_id=user.id, name=name, semester=semester)
    db.session.add(ss)
    db.session.flush()
    return ss


def auth_headers(uid="uid1"):
    return {"Authorization": f"Bearer fake-token-{uid}"}


def mock_verify(uid):
    return patch(
        "firebase_admin.auth.verify_id_token",
        return_value={"uid": uid},
    )


# --- GET /api/schedules ---

def test_list_schedules_missing_user_id_returns_400(client):
    resp = client.get("/api/schedules")
    assert resp.status_code == 400


def test_list_schedules_unknown_user_returns_404(client):
    resp = client.get("/api/schedules?user_id=9999")
    assert resp.status_code == 404


def test_list_schedules_returns_user_schedules(app, client):
    with app.app_context():
        u = make_user()
        make_saved_schedule(u, name="Fall Plan")
        make_saved_schedule(u, name="Backup")
        db.session.commit()
        user_id = u.id

    resp = client.get(f"/api/schedules?user_id={user_id}")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["total"] == 2
    names = {s["name"] for s in data["results"]}
    assert names == {"Fall Plan", "Backup"}


def test_list_schedules_includes_section_count(app, client):
    with app.app_context():
        u = make_user()
        c = make_course()
        s1 = make_section(c, crn="11111")
        s2 = make_section(c, crn="22222")
        ss = make_saved_schedule(u)
        db.session.add(SavedScheduleSection(saved_schedule_id=ss.id, section_id=s1.id))
        db.session.add(SavedScheduleSection(saved_schedule_id=ss.id, section_id=s2.id))
        db.session.commit()
        user_id, schedule_id = u.id, ss.id

    resp = client.get(f"/api/schedules?user_id={user_id}")
    assert resp.status_code == 200
    result = next(r for r in resp.get_json()["results"] if r["id"] == schedule_id)
    assert result["section_count"] == 2


# --- POST /api/schedules ---

def test_create_schedule_missing_body_returns_400(app, client):
    with app.app_context():
        u = make_user()
        db.session.commit()
        user_id = u.id

    with mock_verify("uid1"):
        resp = client.post("/api/schedules", json={}, headers=auth_headers("uid1"))
    assert resp.status_code == 400


def test_create_schedule_success(app, client):
    with app.app_context():
        u = make_user()
        db.session.commit()
        user_id = u.id

    with mock_verify("uid1"):
        resp = client.post("/api/schedules", json={
            "user_id": user_id,
            "name": "My Plan",
            "semester": "202635",
        }, headers=auth_headers("uid1"))
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["name"] == "My Plan"
    assert data["semester"] == "202635"
    assert data["section_count"] == 0


def test_create_schedule_wrong_user_returns_403(app, client):
    with app.app_context():
        u = make_user(uid="uid1", email="a@siue.edu")
        make_user(uid="uid2", email="b@siue.edu")
        db.session.commit()
        user_id = u.id

    with mock_verify("uid2"):
        resp = client.post("/api/schedules", json={
            "user_id": user_id,
            "name": "Sneaky",
            "semester": "202635",
        }, headers=auth_headers("uid2"))
    assert resp.status_code == 403


# --- GET /api/schedules/<id> ---

def test_get_schedule_not_found_returns_404(client):
    resp = client.get("/api/schedules/9999")
    assert resp.status_code == 404


def test_get_schedule_returns_detail(app, client):
    with app.app_context():
        u = make_user()
        c = make_course()
        sec = make_section(c, crn="55555")
        make_schedule_row(sec, day="T", start_time="1300", end_time="1415")
        ss = make_saved_schedule(u, name="Detail Test")
        db.session.add(SavedScheduleSection(saved_schedule_id=ss.id, section_id=sec.id))
        db.session.commit()
        schedule_id = ss.id

    resp = client.get(f"/api/schedules/{schedule_id}")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["name"] == "Detail Test"
    assert len(data["sections"]) == 1
    section = data["sections"][0]
    assert section["crn"] == "55555"
    assert section["professor"] is None
    assert section["schedules"][0]["day"] == "T"


# --- PATCH /api/schedules/<id> ---

def test_update_schedule_renames(app, client):
    with app.app_context():
        u = make_user()
        ss = make_saved_schedule(u, name="Old Name")
        db.session.commit()
        schedule_id, uid = ss.id, u.firebase_uid

    with mock_verify(uid):
        resp = client.patch(f"/api/schedules/{schedule_id}", json={"name": "New Name"},
                            headers=auth_headers(uid))
    assert resp.status_code == 200
    assert resp.get_json()["name"] == "New Name"


def test_update_schedule_wrong_user_returns_403(app, client):
    with app.app_context():
        u = make_user(uid="uid1", email="a@siue.edu")
        make_user(uid="uid2", email="b@siue.edu")
        ss = make_saved_schedule(u)
        db.session.commit()
        schedule_id = ss.id

    with mock_verify("uid2"):
        resp = client.patch(f"/api/schedules/{schedule_id}", json={"name": "Hijack"},
                            headers=auth_headers("uid2"))
    assert resp.status_code == 403


# --- DELETE /api/schedules/<id> ---

def test_delete_schedule_success(app, client):
    with app.app_context():
        u = make_user()
        ss = make_saved_schedule(u)
        db.session.commit()
        schedule_id, uid = ss.id, u.firebase_uid

    with mock_verify(uid):
        resp = client.delete(f"/api/schedules/{schedule_id}", headers=auth_headers(uid))
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Schedule deleted"


def test_delete_schedule_also_removes_sections(app, client):
    with app.app_context():
        u = make_user()
        c = make_course()
        sec = make_section(c, crn="77777")
        ss = make_saved_schedule(u)
        link = SavedScheduleSection(saved_schedule_id=ss.id, section_id=sec.id)
        db.session.add(link)
        db.session.commit()
        schedule_id, uid = ss.id, u.firebase_uid

    with mock_verify(uid):
        client.delete(f"/api/schedules/{schedule_id}", headers=auth_headers(uid))

    with app.app_context():
        remaining = SavedScheduleSection.query.filter_by(saved_schedule_id=schedule_id).count()
        assert remaining == 0


# --- POST /api/schedules/<id>/sections ---

def test_add_section_success(app, client):
    with app.app_context():
        u = make_user()
        c = make_course()
        sec = make_section(c, crn="88888")
        ss = make_saved_schedule(u)
        db.session.commit()
        schedule_id, section_id, uid = ss.id, sec.id, u.firebase_uid

    with mock_verify(uid):
        resp = client.post(f"/api/schedules/{schedule_id}/sections",
                           json={"section_id": section_id},
                           headers=auth_headers(uid))
    assert resp.status_code == 201
    assert resp.get_json()["section_id"] == section_id


def test_add_section_duplicate_returns_409(app, client):
    with app.app_context():
        u = make_user()
        c = make_course()
        sec = make_section(c, crn="99999")
        ss = make_saved_schedule(u)
        db.session.add(SavedScheduleSection(saved_schedule_id=ss.id, section_id=sec.id))
        db.session.commit()
        schedule_id, section_id, uid = ss.id, sec.id, u.firebase_uid

    with mock_verify(uid):
        resp = client.post(f"/api/schedules/{schedule_id}/sections",
                           json={"section_id": section_id},
                           headers=auth_headers(uid))
    assert resp.status_code == 409


def test_add_section_time_conflict_returns_409(app, client):
    with app.app_context():
        u = make_user()
        c = make_course()
        existing_sec = make_section(c, crn="11110")
        new_sec = make_section(c, crn="11120")
        make_schedule_row(existing_sec, day="M", start_time="0900", end_time="1100")
        make_schedule_row(new_sec, day="M", start_time="1000", end_time="1200")
        ss = make_saved_schedule(u)
        db.session.add(SavedScheduleSection(saved_schedule_id=ss.id, section_id=existing_sec.id))
        db.session.commit()
        schedule_id, new_section_id, uid = ss.id, new_sec.id, u.firebase_uid

    with mock_verify(uid):
        resp = client.post(f"/api/schedules/{schedule_id}/sections",
                           json={"section_id": new_section_id},
                           headers=auth_headers(uid))
    assert resp.status_code == 409
    data = resp.get_json()
    assert "conflicts" in data


# --- DELETE /api/schedules/<id>/sections/<section_id> ---

def test_remove_section_success(app, client):
    with app.app_context():
        u = make_user()
        c = make_course()
        sec = make_section(c, crn="33333")
        ss = make_saved_schedule(u)
        db.session.add(SavedScheduleSection(saved_schedule_id=ss.id, section_id=sec.id))
        db.session.commit()
        schedule_id, section_id, uid = ss.id, sec.id, u.firebase_uid

    with mock_verify(uid):
        resp = client.delete(f"/api/schedules/{schedule_id}/sections/{section_id}",
                             headers=auth_headers(uid))
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Section removed"


def test_remove_section_not_in_schedule_returns_404(app, client):
    with app.app_context():
        u = make_user()
        c = make_course()
        sec = make_section(c, crn="44444")
        ss = make_saved_schedule(u)
        db.session.commit()
        schedule_id, section_id, uid = ss.id, sec.id, u.firebase_uid

    with mock_verify(uid):
        resp = client.delete(f"/api/schedules/{schedule_id}/sections/{section_id}",
                             headers=auth_headers(uid))
    assert resp.status_code == 404

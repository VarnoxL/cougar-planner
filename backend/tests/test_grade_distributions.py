import pytest
from app import create_app, db
from app.models import Professor, Course, User, Review


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

def make_professor(name="Jane Smith"):
    p = Professor(name=name)
    db.session.add(p)
    db.session.flush()
    return p


def make_course(subject="CS", number="101", name="Intro to CS"):
    c = Course(subject=subject, number=number, name=name)
    db.session.add(c)
    db.session.flush()
    return c


def make_user(uid="uid1", email="test@siue.edu"):
    u = User(firebase_uid=uid, email=email)
    db.session.add(u)
    db.session.flush()
    return u


def make_review(user, professor, course, grade=None, semester="202510"):
    r = Review(
        user_id=user.id,
        professor_id=professor.id,
        course_id=course.id,
        grade_received=grade,
        semester_taken=semester,
    )
    db.session.add(r)
    db.session.flush()
    return r


# --- create_review validation ---

def test_create_review_invalid_grade_returns_400(app, client):
    with app.app_context():
        p = make_professor()
        c = make_course()
        u = make_user()
        db.session.commit()
        user_id, prof_id, course_id = u.id, p.id, c.id

    resp = client.post("/api/reviews", json={
        "user_id": user_id,
        "professor_id": prof_id,
        "course_id": course_id,
        "grade_received": "Z",
    })
    assert resp.status_code == 400
    assert "grade_received" in resp.get_json()["error"]


def test_create_review_normalizes_lowercase_grade(app, client):
    with app.app_context():
        p = make_professor()
        c = make_course()
        u = make_user()
        db.session.commit()
        user_id, prof_id, course_id = u.id, p.id, c.id

    resp = client.post("/api/reviews", json={
        "user_id": user_id,
        "professor_id": prof_id,
        "course_id": course_id,
        "grade_received": "b+",
    })
    assert resp.status_code == 201
    assert resp.get_json()["grade_received"] == "B+"


def test_create_review_no_grade_is_accepted(app, client):
    with app.app_context():
        p = make_professor()
        c = make_course()
        u = make_user()
        db.session.commit()
        user_id, prof_id, course_id = u.id, p.id, c.id

    resp = client.post("/api/reviews", json={
        "user_id": user_id,
        "professor_id": prof_id,
        "course_id": course_id,
    })
    assert resp.status_code == 201
    assert resp.get_json()["grade_received"] is None


def test_create_review_all_valid_grades_accepted(app, client):
    with app.app_context():
        p = make_professor()
        c = make_course()
        db.session.commit()
        prof_id, course_id = p.id, c.id

    valid_grades = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "W"]
    for i, grade in enumerate(valid_grades):
        with app.app_context():
            u = make_user(uid=f"uid{i}", email=f"user{i}@siue.edu")
            db.session.commit()
            user_id = u.id
        resp = client.post("/api/reviews", json={
            "user_id": user_id,
            "professor_id": prof_id,
            "course_id": course_id,
            "grade_received": grade,
        })
        assert resp.status_code == 201, f"Failed for grade {grade}"


# --- GET /api/grade-distributions ---

def test_list_grade_distributions_no_params_returns_400(client):
    resp = client.get("/api/grade-distributions")
    assert resp.status_code == 400


def test_list_grade_distributions_by_professor(app, client):
    with app.app_context():
        p = make_professor()
        c = make_course()
        u = make_user()
        make_review(u, p, c, grade="A", semester="202510")
        make_review(u, p, c, grade="B", semester="202510")
        make_review(u, p, c, grade="C", semester="202520")
        db.session.commit()
        prof_id = p.id

    resp = client.get(f"/api/grade-distributions?professor_id={prof_id}")
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, list)
    semesters = {row["semester"] for row in data}
    assert "202510" in semesters
    assert "202520" in semesters


def test_list_grade_distributions_semester_filter(app, client):
    with app.app_context():
        p = make_professor()
        c = make_course()
        u = make_user()
        make_review(u, p, c, grade="A", semester="202510")
        make_review(u, p, c, grade="B", semester="202520")
        db.session.commit()
        prof_id = p.id

    resp = client.get(f"/api/grade-distributions?professor_id={prof_id}&semester=202510")
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data) == 1
    assert data[0]["semester"] == "202510"


def test_list_grade_distributions_reviews_without_grade_excluded(app, client):
    with app.app_context():
        p = make_professor()
        c = make_course()
        u = make_user()
        make_review(u, p, c, grade=None, semester="202510")  # no grade — should not appear
        db.session.commit()
        prof_id = p.id

    resp = client.get(f"/api/grade-distributions?professor_id={prof_id}")
    assert resp.status_code == 200
    assert resp.get_json() == []


# --- GET /api/grade-distributions/summary ---

def test_summary_no_params_returns_400(client):
    resp = client.get("/api/grade-distributions/summary")
    assert resp.status_code == 400


def test_summary_insufficient_data(app, client):
    with app.app_context():
        p = make_professor()
        c = make_course()
        u = make_user()
        # Only 2 graded reviews — below MIN_REVIEWS=5
        make_review(u, p, c, grade="A")
        make_review(u, p, c, grade="B")
        db.session.commit()
        prof_id = p.id

    resp = client.get(f"/api/grade-distributions/summary?professor_id={prof_id}")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["insufficient_data"] is True
    assert data["review_count"] == 2


def test_summary_full_with_enough_reviews(app, client):
    with app.app_context():
        p = make_professor()
        c = make_course()
        u = make_user()
        make_review(u, p, c, grade="A", semester="202510")
        make_review(u, p, c, grade="A-", semester="202510")
        make_review(u, p, c, grade="B", semester="202520")
        make_review(u, p, c, grade="F", semester="202520")
        make_review(u, p, c, grade="W", semester="202520")
        db.session.commit()
        prof_id = p.id

    resp = client.get(f"/api/grade-distributions/summary?professor_id={prof_id}")
    assert resp.status_code == 200
    data = resp.get_json()

    assert data["total_students"] == 5
    assert data["a_count"] == 2
    assert data["b_count"] == 1
    assert data["f_count"] == 1
    assert data["w_count"] == 1
    assert data["c_count"] == 0
    assert data["d_count"] == 0

    assert data["a_pct"] == 40.0
    assert data["b_pct"] == 20.0
    assert data["f_pct"] == 20.0
    assert data["w_pct"] == 20.0

    assert sorted(data["semesters_included"]) == ["202510", "202520"]


def test_summary_grade_bucketing(app, client):
    with app.app_context():
        p = make_professor()
        c = make_course()
        u = make_user()
        # 5 reviews, all different plus-minus variants
        make_review(u, p, c, grade="B+")
        make_review(u, p, c, grade="B")
        make_review(u, p, c, grade="B-")
        make_review(u, p, c, grade="C+")
        make_review(u, p, c, grade="D-")
        db.session.commit()
        prof_id = p.id

    resp = client.get(f"/api/grade-distributions/summary?professor_id={prof_id}")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["b_count"] == 3
    assert data["c_count"] == 1
    assert data["d_count"] == 1
    assert data["a_count"] == 0

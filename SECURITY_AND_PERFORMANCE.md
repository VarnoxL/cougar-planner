# CougarPlanner — Security & Database Performance Guide

> Reference doc for Claude Code. Follow these patterns when building or modifying any endpoint, model, or frontend component.

---

## 1. API Key & Secret Management

### Rules
- **NEVER** put API keys, database URLs, Firebase service account keys, or any secret in frontend code (React).
- Even `.env` files in React get bundled into the JS — they are **not secret**.
- All secrets live in Flask's server-side environment variables only.
- Frontend talks to **your Flask backend**, which holds and uses the secrets.

### Implementation
```python
# .env (server-side only, never committed)
DATABASE_URL=postgresql://...
FIREBASE_SERVICE_ACCOUNT=...
RMP_API_KEY=...

# config.py
import os
DATABASE_URL = os.environ["DATABASE_URL"]
```

### .gitignore (non-negotiable)
```
.env
*.pem
*service-account*.json
firebase-adminsdk*.json
```

> If a secret is committed even once, it lives in Git history forever. Use `git-secrets` or a pre-commit hook to catch accidental commits.

---

## 2. Authentication & Authorization

### Firebase Token Verification
Every protected Flask endpoint **must** verify the Firebase ID token. Never trust the frontend.

Use `flask.g` (Flask's request-scoped store) to pass the decoded uid — do not mutate the `request` object. Catch specific Firebase exceptions so real SDK or network errors aren't silently swallowed as 401s.

```python
from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"error": "Missing token"}), 401
        try:
            decoded = auth.verify_id_token(token)
            g.uid = decoded["uid"]
        except auth.ExpiredIdTokenError:
            return jsonify({"error": "Token expired"}), 401
        except auth.InvalidIdTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except FirebaseError:
            return jsonify({"error": "Authentication error"}), 401
        return f(*args, **kwargs)
    return decorated
```

### Authorization (Resource Ownership)
Verifying identity is not enough — verify the user **owns** the resource:

```python
@app.route("/api/schedules/<int:schedule_id>", methods=["PUT"])
@require_auth
def update_schedule(schedule_id):
    schedule = Schedule.query.get_or_404(schedule_id)
    if schedule.user_id != g.uid:
        return jsonify({"error": "Forbidden"}), 403
    # proceed with update
```

---

## 3. Rate Limiting

Prevents API abuse, cost overruns, and denial-of-service.

```bash
pip install Flask-Limiter
```

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(get_remote_address, app=app, default_limits=["60 per minute"])

# Tighter limit on expensive endpoints
@app.route("/api/scrape/rmp")
@limiter.limit("5 per minute")
def scrape_rmp():
    ...

# More relaxed for reads
@app.route("/api/courses")
@limiter.limit("120 per minute")
def get_courses():
    ...
```

---

## 4. Input Validation

**Validate on the backend.** Anyone can bypass React forms with curl/Postman.

```python
@app.route("/api/reviews", methods=["POST"])
@require_auth
def create_review():
    data = request.get_json()

    # Type checks
    if not isinstance(data.get("professor_id"), int):
        return jsonify({"error": "Invalid professor_id"}), 400

    # Length limits
    comment = data.get("comment", "")
    if len(comment) > 2000:
        return jsonify({"error": "Comment too long"}), 400

    # Range checks
    rating = data.get("rating")
    if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
        return jsonify({"error": "Rating must be 1-5"}), 400

    # proceed
```

---

## 5. SQL Injection Prevention

SQLAlchemy's ORM and parameterized queries protect you. **Never** use f-strings or `.format()` with raw SQL.

```python
# SAFE — parameterized
user = User.query.filter_by(firebase_uid=uid).first()
results = db.session.execute(text("SELECT * FROM courses WHERE subject = :subj"), {"subj": subject})

# DANGEROUS — never do this
results = db.session.execute(f"SELECT * FROM courses WHERE subject = '{subject}'")
```

---

## 6. Cross-Site Scripting (XSS)

- React's JSX auto-escapes by default — **don't break that protection**.
- **Never** use `dangerouslySetInnerHTML` with user-supplied data.
- Sanitize any user content rendered in `href`, `src`, or injected into the DOM.
- If you must render HTML from user input, use a sanitizer like `DOMPurify`:

```javascript
import DOMPurify from "dompurify";
const clean = DOMPurify.sanitize(userInput);
```

---

## 7. CSRF Protection

Since CougarPlanner uses Firebase Auth with JWTs sent in the `Authorization` header (not cookies), **CSRF is not a risk** — browsers don't auto-attach `Authorization` headers cross-origin.

If you ever switch to cookie-based auth, add CSRF tokens via Flask-WTF.

---

## 8. CORS Configuration

Lock down origins in production. Never ship `Access-Control-Allow-Origin: *`.

`app.config["ENV"]` was removed in Flask 2.3 — use `os.environ` directly:

```python
import os
from flask_cors import CORS

if os.environ.get("FLASK_ENV") == "production":
    CORS(app, origins=["https://cougarplanner.com", "https://www.cougarplanner.com"])
else:
    CORS(app, origins=["http://localhost:5173"])  # Vite dev server
```

---

## 9. Dependency Security

Run periodically and before any deploy:

```bash
# Python
pip audit

# JavaScript
npm audit
```

Pin major versions. Review what you install — especially in fast vibe-coding sessions.

---

---

# Database Performance & Scalability

---

## 10. Indexing

Without indexes, PostgreSQL does a **sequential scan** (reads every row). Indexes let it jump directly to the target row.

### Required Indexes for CougarPlanner

```python
# models.py — add index=True to frequently queried columns

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(128), unique=True, index=True)  # lookup every request

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(10), index=True)
    course_number = db.Column(db.String(10))
    # composite index for subject + course_number lookups
    __table_args__ = (
        db.Index("idx_course_subject_number", "subject", "course_number"),
    )

class Section(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("course.id"), index=True)
    professor_id = db.Column(db.Integer, db.ForeignKey("professor.id"), index=True)
    term = db.Column(db.String(20), index=True)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    professor_id = db.Column(db.Integer, db.ForeignKey("professor.id"), index=True)

class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(128), db.ForeignKey("user.firebase_uid"), index=True)
```

### When to Add an Index
- Any column used in `WHERE`, `JOIN`, `ORDER BY`, or `GROUP BY`
- Any foreign key column
- Any column used for lookups (`filter_by`, `get`)

### When NOT to Index
- Columns rarely queried
- Tables with very few rows (< 100)
- Columns with very low cardinality (e.g., boolean flags)

---

## 11. Pagination

**Never return all rows.** Always paginate.

```python
@app.route("/api/courses")
def get_courses():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)  # cap at 100

    query = Course.query.order_by(Course.subject, Course.course_number)
    result = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "courses": [c.to_dict() for c in result.items],
        "page": result.page,
        "total_pages": result.pages,
        "total": result.total
    })
```

Frontend should request pages as needed (infinite scroll or page buttons).

---

## 12. Select Only What You Need

Don't load 15 columns when you need 2.

```python
# BAD — loads entire ORM objects with all columns
professors = Professor.query.all()

# GOOD — only grabs id and name
professors = db.session.query(Professor.id, Professor.name).all()

# GOOD — for API responses that only need summary info
@app.route("/api/professors/search")
def search_professors():
    q = request.args.get("q", "")
    results = db.session.query(Professor.id, Professor.name, Professor.department)\
        .filter(Professor.name.ilike(f"%{q}%"))\
        .limit(20)\
        .all()
    return jsonify([{"id": r.id, "name": r.name, "dept": r.department} for r in results])
```

---

## 13. Avoid N+1 Queries

The most common ORM performance killer.

```python
# BAD — 1 query for courses + N queries for sections (one per course)
courses = Course.query.all()
for c in courses:
    print(c.sections)  # hits DB each time

# GOOD — eager load with joinedload (1-2 queries total)
from sqlalchemy.orm import joinedload

courses = Course.query.options(joinedload(Course.sections)).all()

# GOOD — nested eager loading
courses = Course.query.options(
    joinedload(Course.sections).joinedload(Section.professor)
).all()
```

### joinedload vs subqueryload
- `joinedload` — single JOIN query. Best for one-to-one or small one-to-many.
- `subqueryload` — separate SELECT with IN clause. Better for large one-to-many to avoid cartesian explosion.

```python
# Use subqueryload when a course might have 50+ sections
courses = Course.query.options(subqueryload(Course.sections)).all()
```

---

## 14. Database-Level Filtering

**Never** load all rows then filter in Python.

```python
# BAD — loads ALL users into memory
users = User.query.all()
target = [u for u in users if u.firebase_uid == uid]

# GOOD — database filters, returns 1 row
target = User.query.filter_by(firebase_uid=uid).first()

# BAD — loads all courses then filters
courses = Course.query.all()
cs_courses = [c for c in courses if c.subject == "CS"]

# GOOD
cs_courses = Course.query.filter_by(subject="CS").all()
```

---

## 15. Caching Static Data

Course catalogs, professor lists, and grade distributions don't change mid-semester. Cache them.

```bash
pip install Flask-Caching
```

```python
from flask_caching import Cache

cache = Cache(app, config={"CACHE_TYPE": "SimpleCache"})
```

Select only the columns you need even inside cached endpoints — caching saves repeated round trips, but the first call (and every cache miss) still loads everything into memory if you use `.query.all()`.

```python
@app.route("/api/professors")
@cache.cached(timeout=3600)
def get_professors():
    professors = db.session.query(
        Professor.id, Professor.name, Professor.department, Professor.rmp_rating
    ).all()
    return jsonify([
        {"id": p.id, "name": p.name, "dept": p.department, "rating": p.rmp_rating}
        for p in professors
    ])

@app.route("/api/courses")
@cache.cached(timeout=3600, query_string=True)  # cache per unique query params
def get_courses():
    subject = request.args.get("subject")
    query = Course.query
    if subject:
        query = query.filter_by(subject=subject)
    return jsonify([c.to_dict() for c in query.all()])
```

### Cache invalidation — admin only

`@require_auth` verifies identity, not role. Any logged-in user could clear the cache if you only use `@require_auth`. Check for an admin custom claim set via Firebase Admin SDK:

```python
@app.route("/api/admin/refresh-cache", methods=["POST"])
@require_auth
def refresh_cache():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    decoded = auth.verify_id_token(token)
    if not decoded.get("admin"):
        return jsonify({"error": "Forbidden"}), 403
    cache.clear()
    return jsonify({"status": "cleared"})
```

### What to Cache
- Professor list and details (changes once per semester at most)
- Course catalog (static per term)
- Grade distributions (historical, never changes)
- RMP ratings (update daily at most)

### What NOT to Cache
- User schedules (personal, changes frequently)
- Auth-dependent responses
- Search results with user-specific filters

---

## 16. Connection Pooling

SQLAlchemy pools by default, but configure it properly for Railway.

```python
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_size": 5,           # persistent connections
    "max_overflow": 10,       # extra connections under load
    "pool_timeout": 30,       # seconds to wait for a connection
    "pool_recycle": 1800,     # recycle connections every 30 min (prevents stale connections)
    "pool_pre_ping": True     # test connection health before using
}
```

> **WARNING:** `pool_size + max_overflow` is your max simultaneous connections. Railway's free tier caps at 25 — set these values so their sum stays under your plan's limit. Check your Railway PostgreSQL dashboard before adjusting. The values above (5 + 10 = 15) are safe for the free tier.

---

## 17. Expensive Query Protection

Prevent denial-of-service via computationally expensive queries.

```python
# Always limit results
results = Course.query.limit(100).all()  # never unbounded

# Set query timeouts at the database level
# In your PostgreSQL config or per-session:
db.session.execute(text("SET statement_timeout = '5000'"))  # 5 second max

# Avoid unbounded JOINs — always filter
# BAD
everything = db.session.query(Course, Section, Professor).join(Section).join(Professor).all()

# GOOD — scoped query
cs_sections = db.session.query(Section)\
    .join(Course)\
    .filter(Course.subject == "CS")\
    .options(joinedload(Section.professor))\
    .limit(50)\
    .all()
```

---

## 18. Query Performance Debugging

When something is slow, diagnose it:

```python
# Print actual SQL queries in development
app.config["SQLALCHEMY_ECHO"] = True  # logs all SQL to console

# Use EXPLAIN ANALYZE in PostgreSQL
result = db.session.execute(text("EXPLAIN ANALYZE SELECT * FROM courses WHERE subject = 'CS'"))
for row in result:
    print(row)
```

Look for:
- **Seq Scan** on large tables → add an index
- **Nested Loop** with high row counts → check JOINs
- **Sort** with high cost → add index on ORDER BY column

---

## Quick Reference Checklist

### Before Every PR
- [ ] No secrets in frontend code or Git history
- [ ] Firebase token verified on all protected endpoints
- [ ] Specific Firebase exceptions caught (not bare `except Exception`)
- [ ] `g.uid` used (not `request.uid`) to pass decoded uid
- [ ] Inputs validated on the backend (type, length, range)
- [ ] No raw SQL with string interpolation
- [ ] No `dangerouslySetInnerHTML` with user data
- [ ] CORS locked to production domain via `os.environ.get("FLASK_ENV")`

### Before Deploy
- [ ] `pip audit` and `npm audit` clean
- [ ] Rate limiting enabled on all endpoints
- [ ] `.env` in `.gitignore`
- [ ] `SQLALCHEMY_ECHO` set to `False`

### Database Performance
- [ ] Indexes on all foreign keys and frequently queried columns
- [ ] All list endpoints paginated
- [ ] No N+1 queries (use joinedload/subqueryload)
- [ ] Cached endpoints select only needed columns (not `.query.all()`)
- [ ] Cache invalidation endpoints are admin-gated, not just auth-gated
- [ ] Static data cached (professors, courses, grades)
- [ ] Connection pool `pool_size + max_overflow` verified against hosting plan limit
- [ ] No unbounded queries (always LIMIT)

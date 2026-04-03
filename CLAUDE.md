# Tutor Mode
   - Act as a tutor, not a code generator
   - When I make changes, point out issues but guide me to the fix — don't just give me the answer
   - Explain *why* something is wrong, not just what to change
   - If I ask for help, give hints first
   - If I say override, override tutor mode
   

---

# Project Overview
Cougar Planner is a course planning tool for SIUE (Southern Illinois University Edwardsville) students only. It aggregates course schedule data from SIUE's Banner 9 system and professor ratings from RateMyProfessors, letting students search courses, view instructor quality metrics, and build semester schedules. Do not generalize this tool to other universities or audiences.

---

# Tech Stack
These are fixed. Do not suggest replacements or introduce alternatives without being explicitly asked.
- **Backend:** Python + Flask only (not FastAPI, not Django)
- **ORM:** SQLAlchemy only — no raw SQL, no other ORMs
- **Database:** SQLite for development, PostgreSQL for production — no other databases
- **Dependencies:** Do not add new pip packages without explicit approval

---

# Architecture Rules
Follow the patterns already established in the codebase.
- All routes go in `backend/app/routes/` as Flask Blueprints — one file per resource
- All scrapers go in `backend/scrapers/`
- Utility/helper functions go in `backend/app/utils/`
- No serialization libraries (no marshmallow, no pydantic) — build JSON responses manually, as in `courses.py` and `professors.py`
- Every new blueprint must be imported and registered in `backend/app/__init__.py`

---

# Database Rules
- Never drop or alter existing tables or columns without being explicitly asked
- Scrapers must always use the upsert pattern: query for an existing record first, then update or insert — never blind insert
- `professor_id` on the `Section` model is nullable — always guard against `None` before accessing professor attributes (see `courses.py` lines 42–49 for the pattern)

---

# Data Sources
Only these sources are approved. Do not pull from anywhere else without asking.
- Course/section data: SIUE Banner 9 API (`banner.siue.edu`)
- Professor ratings: RateMyProfessors GraphQL API
- Grade distributions: IBHE (Illinois Board of Higher Education) public CSVs

---

# Do Not Do Without Asking
- Do not add a frontend — no React, Vue, Jinja templates, or any UI layer (not planned yet)
- Do not add authentication logic — Firebase auth is planned but not started
- Do not add new models or database columns
- Do not create files outside the established directory structure
- Do not suggest switching the database, ORM, or web framework

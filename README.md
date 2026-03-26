# Cougar Planner

A course planning tool for SIUE (Southern Illinois University Edwardsville) students. Search courses, view professor ratings from RateMyProfessors, check seat availability, and plan your schedule — all in one place.

---

## Features

- Browse and search all SIUE courses by subject or name
- View sections with meeting times, locations, and enrollment capacity
- See RateMyProfessors ratings, difficulty scores, and "would take again" percentages for each professor
- Schedule data pulled directly from SIUE's Banner system
- Leave reviews for professors tied to specific courses

---

## Tech Stack

- **Backend:** Python, Flask, SQLAlchemy
- **Database:** PostgreSQL
- **Data Sources:** SIUE Banner course catalog, RateMyProfessors GraphQL API

---

## Project Structure

```
cougar-planner/
└── backend/
    ├── app/
    │   ├── __init__.py       # Flask app factory
    │   ├── config.py         # DB config via .env
    │   ├── models.py         # SQLAlchemy models
    │   └── routes/
    │       ├── courses.py    # /api/courses
    │       └── professors.py # /api/professors
    ├── scrapers/
    │   ├── rmp_scraper.py    # Scrapes RateMyProfessors (1,559 SIUE professors)
    │   └── siue_scraper.py   # Scrapes SIUE Banner course catalog (in progress)
    ├── requirements.txt
    └── run.py
```

---

## Setup

### 1. Clone and install dependencies
```bash
git clone https://github.com/your-username/cougar-planner.git
cd cougar-planner/backend
pip install -r requirements.txt
```

### 2. Configure environment
Create `backend/.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost/cougar_planner
SIUE_USERNAME=your_cougarnet_id
SIUE_PASSWORD=your_password
```

### 3. Set up the database
```bash
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

### 4. Run the scrapers
```bash
# Scrape professor data from RateMyProfessors
python -m scrapers.rmp_scraper

# Scrape course/section data from SIUE Banner (requires CougarNet login)
python -m scrapers.siue_scraper
```

### 5. Start the server
```bash
python run.py
```

---

## API Endpoints

### Courses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | List all courses (filter by `?subject=CS` or `?search=algorithms`) |
| GET | `/api/courses/<id>` | Course detail with sections, schedules, and professor info |

### Professors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/professors` | List all professors (filter by `?department=CS` or `?min_rating=4.0`) |
| GET | `/api/professors/<id>` | Professor detail with RMP stats, courses taught, and reviews |

---

## Data Models

- **Professor** — name, department, RMP rating, difficulty, would-take-again %
- **Course** — subject, number, name, credits, description
- **Section** — CRN, section number, semester, capacity, enrollment, delivery method
- **Schedule** — day, start/end time, location (one row per meeting day)
- **User** — Firebase auth, major
- **SavedSchedule** — user's saved course selections
- **Review** — user review of a professor for a specific course
- **GradeDistribution** — A/B/C/D/F/W counts per professor per course per semester

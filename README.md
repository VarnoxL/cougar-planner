# Cougar Planner

**Live site: [cougarplanner.com](https://cougarplanner.com)**

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
- **Frontend:** React, Vite, Tailwind CSS
- **Database:** PostgreSQL (production), SQLite (development)
- **Auth:** Firebase Authentication
- **Data Sources:** SIUE Banner course catalog, RateMyProfessors GraphQL API

---

## Project Structure

```
cougar-planner/
├── backend/
│   ├── app/
│   │   ├── __init__.py             # Flask app factory + blueprint registration
│   │   ├── config.py               # DB config via .env
│   │   ├── models.py               # SQLAlchemy models
│   │   ├── routes/
│   │   │   ├── courses.py          # /api/courses
│   │   │   ├── professors.py       # /api/professors
│   │   │   ├── schedules.py        # /api/schedules
│   │   │   ├── reviews.py          # /api/reviews
│   │   │   ├── users.py            # /api/users
│   │   │   └── grade_distributions.py  # /api/grade-distributions
│   │   └── utils/
│   │       ├── conflict.py         # Time conflict detection for schedule builder
│   │       └── auth.py             # Firebase token verification middleware
│   ├── scrapers/
│   │   ├── rmp_scraper.py          # Scrapes RateMyProfessors (1,559 SIUE professors)
│   │   ├── siue_scraper.py         # Scrapes SIUE Banner 9 API (course catalog)
│   │   └── grade_scraper.py        # Planned — not yet active (data source TBD)
│   ├── requirements.txt
│   └── run.py
└── frontend/
    ├── src/
    │   ├── App.jsx                 # Root React component
    │   ├── main.jsx                # Entry point — mounts React app to DOM
    │   └── index.css               # Global styles + Tailwind CSS import
    ├── index.html                  # HTML shell
    ├── vite.config.js              # Vite config with React and Tailwind plugins
    └── package.json
```

---

## Setup

### Backend

#### 1. Clone and install dependencies
```bash
git clone https://github.com/VarnoxL/cougar-planner.git
cd cougar-planner/backend
pip install -r requirements.txt
```

#### 2. Configure environment
Create `backend/.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost/cougar_planner
SIUE_TERM=202635
FIREBASE_SERVICE_ACCOUNT_JSON=<your service account JSON string>
```

#### 3. Set up the database
```bash
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

#### 4. Run the scrapers
```bash
# Scrape professor data from RateMyProfessors
python -m scrapers.rmp_scraper

# Scrape course/section data from SIUE Banner
python -m scrapers.siue_scraper
```

#### 5. Start the backend server
```bash
python run.py
```

The API will be available at `http://localhost:5000`.

---

### Frontend

#### 1. Install dependencies
```bash
cd cougar-planner/frontend
npm install
```

#### 2. Start the dev server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and proxies API calls to the Flask backend.

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

### Schedules
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/schedules` | List user's saved schedules |
| POST | `/api/schedules` | Create a new saved schedule |
| GET | `/api/schedules/<id>` | Get a specific schedule |
| PATCH | `/api/schedules/<id>` | Update a schedule |
| DELETE | `/api/schedules/<id>` | Delete a schedule |
| POST | `/api/schedules/<id>/sections` | Add a section to a schedule |
| DELETE | `/api/schedules/<id>/sections/<section_id>` | Remove a section from a schedule |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reviews` | List reviews (filter by professor or course) |
| POST | `/api/reviews` | Create a review |
| DELETE | `/api/reviews/<id>` | Delete a review |

### Grade Distributions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/grade-distributions` | List grade distributions (filter by professor/course/semester) |
| GET | `/api/grade-distributions/summary` | Aggregated grade summary with percentages |

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users` | Register or sync a Firebase user |
| GET | `/api/users/<id>` | Get user profile |
| PATCH | `/api/users/<id>` | Update display name or major |

---

## Data Models

- **Professor** — name, department, RMP rating, difficulty, would-take-again %
- **Course** — subject, number, name, credits, description
- **Section** — CRN, section number, semester, capacity, enrollment, delivery method
- **Schedule** — day, start/end time, location (one row per meeting day)
- **User** — Firebase UID, email, display name, major
- **SavedSchedule** — user's saved course selections
- **Review** — user review of a professor for a specific course (rating, difficulty, grade received)
- **GradeDistribution** — A/B/C/D/F/W counts per professor per course per semester
- **SavedScheduleSection** — junction table linking SavedSchedule to Section

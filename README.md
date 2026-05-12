# Cougar Planner

**Live site: [cougarplanner.com](https://cougarplanner.com)**

A course planning tool for SIUE (Southern Illinois University Edwardsville) students. Search courses, view professor ratings from RateMyProfessors, check seat availability, and plan your schedule â€” all in one place.

---

## Features

- Browse and search all SIUE courses by subject, number, or name
- View sections with meeting times, locations, and enrollment capacity
- See RateMyProfessors ratings, difficulty scores, and "would take again" percentages inline
- Build and save semester schedules with automatic time-conflict detection
- View grade distribution charts (A/B/C/D/F/W) by professor and course from IBHE data
- Leave reviews for professors tied to specific courses
- User profiles with display name and major
- Schedule data pulled directly from SIUE's Banner system

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
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ __init__.py             # Flask app factory + blueprint registration
â”‚   â”‚   â”œâ”€â”€ config.py               # DB config via .env
â”‚   â”‚   â”œâ”€â”€ models.py               # SQLAlchemy models
â”‚   â”‚   â”œâ”€â”€ routes/
â”‚   â”‚   â”‚   â”œâ”€â”€ courses.py          # /api/courses
â”‚   â”‚   â”‚   â”œâ”€â”€ professors.py       # /api/professors
â”‚   â”‚   â”‚   â”œâ”€â”€ schedules.py        # /api/schedules
â”‚   â”‚   â”‚   â”œâ”€â”€ reviews.py          # /api/reviews
â”‚   â”‚   â”‚   â”œâ”€â”€ users.py            # /api/users
â”‚   â”‚   â”‚   â””â”€â”€ grade_distributions.py  # /api/grade-distributions
â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚       â”œâ”€â”€ conflict.py         # Time conflict detection for schedule builder
â”‚   â”‚       â””â”€â”€ auth.py             # Firebase token verification middleware
â”‚   â”œâ”€â”€ scrapers/
â”‚   â”‚   â”œâ”€â”€ rmp_scraper.py          # Scrapes RateMyProfessors (1,559 SIUE professors)
â”‚   â”‚   â”œâ”€â”€ siue_scraper.py         # Scrapes SIUE Banner 9 API (course catalog)
â”‚   â”‚   â””â”€â”€ grade_scraper.py        # Scrapes IBHE grade distribution CSVs
â”‚   â”œâ”€â”€ requirements.txt
â”‚   â””â”€â”€ run.py
â””â”€â”€ frontend/
    â”œâ”€â”€ src/
    â”‚   â”œâ”€â”€ api/                    # fetch wrappers for each backend resource
    â”‚   â”‚   â”œâ”€â”€ client.js           # Base fetch client with auth header injection
    â”‚   â”‚   â”œâ”€â”€ courses.js
    â”‚   â”‚   â”œâ”€â”€ professors.js
    â”‚   â”‚   â”œâ”€â”€ schedules.js
    â”‚   â”‚   â”œâ”€â”€ reviews.js
    â”‚   â”‚   â”œâ”€â”€ gradeDistributions.js
    â”‚   â”‚   â””â”€â”€ users.js
    â”‚   â”œâ”€â”€ components/             # Shared UI components
    â”‚   â”‚   â”œâ”€â”€ ConflictModal.jsx
    â”‚   â”‚   â”œâ”€â”€ CourseCard.jsx
    â”‚   â”‚   â”œâ”€â”€ DayPills.jsx
    â”‚   â”‚   â”œâ”€â”€ EmptyState.jsx
    â”‚   â”‚   â”œâ”€â”€ GradeDistChart.jsx
    â”‚   â”‚   â”œâ”€â”€ LoadingSpinner.jsx
    â”‚   â”‚   â”œâ”€â”€ Navbar.jsx
    â”‚   â”‚   â”œâ”€â”€ Pagination.jsx
    â”‚   â”‚   â”œâ”€â”€ ProfessorBadge.jsx
    â”‚   â”‚   â”œâ”€â”€ ProtectedRoute.jsx
    â”‚   â”‚   â”œâ”€â”€ RatingBadge.jsx
    â”‚   â”‚   â”œâ”€â”€ ReviewCard.jsx
    â”‚   â”‚   â”œâ”€â”€ ReviewForm.jsx
    â”‚   â”‚   â”œâ”€â”€ SearchInput.jsx
    â”‚   â”‚   â”œâ”€â”€ SeatsBadge.jsx
    â”‚   â”‚   â”œâ”€â”€ SectionRow.jsx
    â”‚   â”‚   â”œâ”€â”€ TimeDisplay.jsx
    â”‚   â”‚   â””â”€â”€ WeeklyCalendar.jsx
    â”‚   â”œâ”€â”€ contexts/
    â”‚   â”‚   â””â”€â”€ AuthContext.jsx     # Firebase auth state (current user, loading)
    â”‚   â”œâ”€â”€ hooks/
    â”‚   â”‚   â”œâ”€â”€ useDebounce.js
    â”‚   â”‚   â””â”€â”€ usePagination.js
    â”‚   â”œâ”€â”€ pages/
    â”‚   â”‚   â”œâ”€â”€ LandingPage.jsx
    â”‚   â”‚   â”œâ”€â”€ LoginPage.jsx
    â”‚   â”‚   â”œâ”€â”€ RegisterPage.jsx
    â”‚   â”‚   â”œâ”€â”€ CoursesPage.jsx
    â”‚   â”‚   â”œâ”€â”€ CourseDetailPage.jsx
    â”‚   â”‚   â”œâ”€â”€ ProfessorsPage.jsx
    â”‚   â”‚   â”œâ”€â”€ ProfessorDetailPage.jsx
    â”‚   â”‚   â”œâ”€â”€ ScheduleBuilderPage.jsx
    â”‚   â”‚   â”œâ”€â”€ MySchedulesPage.jsx
    â”‚   â”‚   â””â”€â”€ ProfilePage.jsx
    â”‚   â”œâ”€â”€ utils/
    â”‚   â”‚   â”œâ”€â”€ constants.js
    â”‚   â”‚   â”œâ”€â”€ formatDay.js
    â”‚   â”‚   â”œâ”€â”€ formatTime.js
    â”‚   â”‚   â”œâ”€â”€ ratingColor.js
    â”‚   â”‚   â””â”€â”€ seatsColor.js
    â”‚   â”œâ”€â”€ App.jsx                 # Root component with React Router routes
    â”‚   â”œâ”€â”€ main.jsx                # Entry point â€” mounts React app to DOM
    â”‚   â””â”€â”€ index.css               # Global styles + Tailwind CSS import
    â”œâ”€â”€ index.html
    â”œâ”€â”€ vite.config.js
    â””â”€â”€ package.json
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
ALLOWED_ORIGINS=http://localhost:5173
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

- **Professor** â€” name, department, RMP rating, difficulty, would-take-again %
- **Course** â€” subject, number, name, credits, description
- **Section** â€” CRN, section number, semester, capacity, enrollment, delivery method
- **Schedule** â€” day, start/end time, location (one row per meeting day)
- **User** â€” Firebase UID, email, display name, major
- **SavedSchedule** â€” user's saved course selections
- **Review** â€” user review of a professor for a specific course (rating, difficulty, grade received)
- **GradeDistribution** â€” A/B/C/D/F/W counts per professor per course per semester
- **SavedScheduleSection** â€” junction table linking SavedSchedule to Section

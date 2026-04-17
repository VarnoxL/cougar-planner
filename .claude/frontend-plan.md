# Cougar Planner — Frontend Implementation Plan

---

## 1. Project Context

**What:** Cougar Planner is a course planning tool exclusively for SIUE (Southern Illinois University Edwardsville) students. It aggregates course/section data from SIUE Banner 9, professor ratings from RateMyProfessors, and grade distributions from student-submitted reviews — letting students search courses, evaluate instructors, and build conflict-free semester schedules.

**Who:** SIUE undergraduates and graduate students planning upcoming semesters. They use phones between classes and laptops at home.

**Differentiator from Coursicle:** SIUE-only (not generic multi-university), integrates RateMyProfessors ratings directly inline during schedule building, shows grade distributions aggregated from peer reviews, and provides server-side conflict detection.

**Current state:** Backend is complete (19 endpoints, 6 blueprints, 9 models, Firebase auth middleware, conflict detection). Frontend is a bare Vite scaffold — `App.jsx` renders `<h1>Cougar Planner</h1>`, four placeholder files exist but are empty (`CourseCard.jsx`, `Navbar.jsx`, `LandingPage.jsx`, `courses.js`), and Tailwind CSS 4 is configured with a single custom color.

---

## 2. Tech Stack

**Already installed (from `package.json`):**
| Package | Version |
|---|---|
| react | 19.2.4 |
| react-dom | 19.2.4 |
| vite | 8.0.4 |
| tailwindcss | 4.2.2 (via `@tailwindcss/vite` plugin) |
| eslint | 9.39.4 (with react-hooks + react-refresh plugins) |

**Approved additions (install via `npm install`):**
- `react-router-dom` (latest v7.x) — client-side routing
- `firebase` (latest v11.x) — client-side Firebase Auth SDK

**Forbidden:** axios, Redux/Zustand/Jotai, any UI component library (no MUI, Chakra, shadcn), TypeScript, class components, charting libraries.

**API calls:** Browser-native `fetch` exclusively, wrapped in `src/api/client.js`.

---

## 3. Design Direction

### Color System (defined in `src/index.css` via `@theme`)
```
--color-c-red: #c8102e          (SIUE red — already exists — primary accent)
--color-bg-primary: #0f1117     (page background, near-black)
--color-bg-card: #1a1d27        (card/panel surfaces)
--color-bg-input: #252836       (input fields, dropdowns)
--color-border: #2e3244         (subtle borders)
--color-text-primary: #e8eaed   (main body text)
--color-text-secondary: #9ca3af (muted labels, placeholders)
--color-rating-green: #22c55e   (RMP rating 4.0+)
--color-rating-yellow: #eab308  (RMP rating 3.0–3.9)
--color-rating-red: #ef4444     (RMP rating below 3.0)
--color-seats-green: #22c55e    (enrolled < 70% capacity)
--color-seats-yellow: #eab308   (enrolled 70–90% capacity)
--color-seats-red: #ef4444      (enrolled > 90% capacity)
```

### Theme Rules
- Dark theme only (no light mode toggle in MVP)
- SIUE red for primary buttons, active nav links, accent highlights — never large background fills
- No pure white text — use `#e8eaed`
- Cards: `bg-card` + `border` borders + `rounded-lg`, no drop shadows
- Data-dense: minimize whitespace, compact table rows, small font sizes for metadata
- Mobile-first responsive: stack on small screens, multi-column at `md:` (768px+) and `lg:` (1024px+)
- Course codes in `font-mono` (e.g., "CS 150"); rating badges in `font-bold`

---

## 4. Full API Reference

### 4.1 Courses (Public — no auth)

**`GET /api/courses`**
| Param | Type | Default | Notes |
|---|---|---|---|
| `subject` | string | — | Case-insensitive filter |
| `search` | string | — | Matches name or number |
| `page` | int | 1 | |
| `per_page` | int | 20 | Max 100 |

Response 200:
```json
{
  "page": 1, "per_page": 20, "total": 142, "pages": 8,
  "results": [
    { "id": 1, "subject": "CS", "number": "150", "name": "Intro to Computing", "credits": 3, "description": "..." }
  ]
}
```

**`GET /api/courses/:id`** — 404 if not found
```json
{
  "id": 1, "subject": "CS", "number": "150", "name": "Intro to Computing", "credits": 3, "description": "...",
  "sections": [
    {
      "id": 10, "crn": "12345", "section_num": "001", "semester": "Fall 2025",
      "capacity": 30, "enrolled": 28, "delivery_method": "In Person",
      "professor": { "id": 5, "name": "John Smith", "rating": 4.2, "difficulty": 3.1 },
      "schedules": [
        { "day": "monday", "start_time": "0930", "end_time": "1045", "location": "EB 3040" }
      ]
    }
  ]
}
```
> **`professor` is NULLABLE on every section.** Always use `section.professor?.name` or show "TBA".

### 4.2 Professors (Public)

**`GET /api/professors`** — params: `department`, `min_rating` (float), `page`, `per_page`
Results: `{ id, name, department, rating, difficulty, num_ratings, would_take_again }`

**`GET /api/professors/:id`**
```json
{
  "id": 5, "name": "John Smith", "department": "Computer Science",
  "rating": 4.2, "difficulty": 3.1, "num_ratings": 47, "would_take_again": 85.0, "rmp_id": "abc123",
  "courses": [ { "id": 1, "subject": "CS", "number": "150", "name": "Intro to Computing" } ],
  "reviews": [
    {
      "id": 100, "rating": 5, "difficulty": 2, "grade_received": "A",
      "comment": "Great professor", "semester_taken": "Fall 2024", "created_at": "2024-12-01T...",
      "course": { "id": 1, "subject": "CS", "number": "150", "name": "Intro to Computing" }
    }
  ]
}
```

### 4.3 Schedules (Mixed Auth)

**`GET /api/schedules?user_id=:id`** — `user_id` REQUIRED (400 without it), 404 if user not found
Results: `{ id, name, semester, created_at, section_count }`

**`POST /api/schedules`** — AUTH REQUIRED
Body: `{ user_id, name, semester }` → 201: `{ id, user_id, name, semester, created_at, section_count: 0 }`
403 if token UID ≠ target user's firebase_uid

**`GET /api/schedules/:id`** — public
Returns schedule + full `sections` array (each with `course`, `professor` (nullable), `schedules`)

**`PATCH /api/schedules/:id`** — AUTH REQUIRED, body: `{ name?, semester? }` → 200

**`DELETE /api/schedules/:id`** — AUTH REQUIRED → 200: `{ "message": "Schedule deleted" }`. Cascades to delete SavedScheduleSection rows.

**`POST /api/schedules/:id/sections`** — AUTH REQUIRED
Body: `{ section_id }` → 201: `{ schedule_id, section_id }`
**409 (duplicate):** `{ "error": "duplicate found" }`
**409 (conflict):** `{ "error": "time conflict found", "conflicts": [{ "conflicting_section_id", "conflicting_crn", "day", "existing_start", "existing_end", "new_start", "new_end" }] }`

**`DELETE /api/schedules/:id/sections/:section_id`** — AUTH REQUIRED → 200

### 4.4 Reviews (Mixed Auth)

**`GET /api/reviews`** — at least one of `professor_id` or `course_id` required (400 without)
Results: `{ id, course: { id, subject, number, name }, user: { id, display_name }, rating, difficulty, grade_received, comment, semester_taken, created_at }`

**`POST /api/reviews`** — AUTH REQUIRED
Body: `{ user_id, professor_id, course_id, rating (1-5), difficulty (1-5), grade_received (A/A-/B+/.../F/W), comment, semester_taken }`
Validates ranges, valid grades (case-insensitive, uppercased). 403 if token UID ≠ target user.

**`DELETE /api/reviews/:id`** — AUTH REQUIRED, 403 if not author

### 4.5 Grade Distributions (Public)

**`GET /api/grade-distributions`** — at least one of `professor_id`/`course_id` required, optional `semester`
Returns array (NOT paginated): `{ id: null, semester, total_students, a_count..w_count, professor, course }`

**`GET /api/grade-distributions/summary`** — at least one of `professor_id`/`course_id` required
Insufficient data (< 5 graded reviews):
```json
{ "professor_id": 5, "course_id": null, "insufficient_data": true, "review_count": 3, "message": "At least 5 graded reviews are required..." }
```
Full data:
```json
{ "professor_id": 5, "course_id": null, "total_students": 120, "a_count": 45, "b_count": 30, ..., "a_pct": 37.5, "b_pct": 25.0, ..., "semesters_included": ["Fall 2024", "Spring 2025"] }
```

### 4.6 Users (Mixed Auth)

**`POST /api/users`** — AUTH REQUIRED, body empty (uses decoded Firebase token)
200 (existing) or 201 (new): `{ id, firebase_uid, email, display_name, major, created_at }`

**`GET /api/users/:id`** — public, returns `{ id, display_name, major, created_at }` (no email/uid)

**`PATCH /api/users/:id`** — AUTH REQUIRED, body: `{ display_name?, major? }` (1-255 chars each)

### Key Data Formats
- **Times:** 4-char zero-padded strings — `"0930"`, `"1300"`. Parse for display: `"9:30 AM"`, `"1:00 PM"`.
- **Days:** Lowercase full names — `"monday"`, `"tuesday"`, etc. Map for display: `"Mon"`, `"Tue"`.
- **Pagination:** All paginated endpoints return `{ page, per_page, total, pages, results }`.
- **Auth:** Firebase Bearer tokens via `Authorization: Bearer <token>` header.

---

## 5. Folder Structure

```
frontend/src/
├── main.jsx                        # Entry point — wrap App in BrowserRouter
├── App.jsx                         # Router outlet + AuthProvider + Navbar
├── index.css                       # Tailwind @import + @theme with full dark palette
│
├── api/
│   ├── client.js                   # Base fetch wrapper with auth token injection
│   ├── courses.js                  # fetchCourses, fetchCourse
│   ├── professors.js               # fetchProfessors, fetchProfessor
│   ├── schedules.js                # fetchSchedules, createSchedule, fetchSchedule, updateSchedule, deleteSchedule, addSection, removeSection
│   ├── reviews.js                  # fetchReviews, createReview, deleteReview
│   ├── gradeDistributions.js       # fetchGradeDistributions, fetchGradeDistributionSummary
│   └── users.js                    # syncUser, fetchUser, updateUser
│
├── contexts/
│   └── AuthContext.jsx             # Firebase auth state, user sync, token accessor
│
├── hooks/
│   ├── usePagination.js            # Generic hook for paginated endpoints
│   └── useDebounce.js              # Debounce search input (300ms default)
│
├── components/
│   ├── Navbar.jsx                  # Site navigation — fixed top bar, hamburger on mobile
│   ├── CourseCard.jsx              # Course list item — subject+number, name, credits
│   ├── SectionRow.jsx             # Section row — CRN, professor, schedule, seats, optional Add button
│   ├── ProfessorBadge.jsx          # Inline professor name + rating dot (handles null)
│   ├── RatingBadge.jsx             # Colored rating number — green/yellow/red/gray
│   ├── SeatsBadge.jsx              # Colored enrolled/capacity display
│   ├── TimeDisplay.jsx             # "0930" → "9:30 AM" display
│   ├── DayPills.jsx                # Compact day abbreviation pills — "M W F"
│   ├── Pagination.jsx              # Prev/Next + "Page X of Y"
│   ├── ReviewCard.jsx              # Single review — rating, comment, grade, author
│   ├── ReviewForm.jsx              # Modal form for creating reviews
│   ├── GradeDistChart.jsx          # Horizontal stacked bar chart (pure divs)
│   ├── WeeklyCalendar.jsx          # 5-day weekly grid with positioned time blocks
│   ├── ConflictModal.jsx           # Displays time conflict details on 409
│   ├── ProtectedRoute.jsx          # Redirects to /login if not authenticated
│   ├── SearchInput.jsx             # Debounced search input with icon
│   ├── LoadingSpinner.jsx          # Centered spinner (Tailwind animate-spin)
│   └── EmptyState.jsx              # Placeholder for empty lists
│
├── pages/
│   ├── LandingPage.jsx             # Hero + feature highlights + CTA
│   ├── CoursesPage.jsx             # Search + filter + paginated course list
│   ├── CourseDetailPage.jsx        # Course info + sections table + grade dist
│   ├── ProfessorsPage.jsx          # Search + filter + paginated professor grid
│   ├── ProfessorDetailPage.jsx     # Professor stats + courses + reviews + grade dist
│   ├── MySchedulesPage.jsx         # List/create/delete saved schedules
│   ├── ScheduleBuilderPage.jsx     # Course search + WeeklyCalendar + section mgmt
│   ├── LoginPage.jsx               # Email/password login
│   ├── RegisterPage.jsx            # Account creation
│   └── ProfilePage.jsx             # View/edit display_name and major
│
└── utils/
    ├── formatTime.js               # "0930" → "9:30 AM", null → "TBA"
    ├── formatDay.js                # "monday" → "Mon" or "M"
    ├── ratingColor.js              # Returns Tailwind class by rating threshold
    ├── seatsColor.js               # Returns Tailwind class by enrolled/capacity ratio
    └── constants.js                # VALID_GRADES, DAY_ORDER, SEMESTER_OPTIONS
```

---

## 6. Build Phases

### Phase 1: Foundation (Week 1)

Goal: Go from empty scaffold to a working page that fetches real data.

| # | Task | Files |
|---|---|---|
| 1.1 | Install `react-router-dom` and `firebase` | `package.json` |
| 1.2 | Add Vite dev proxy: `/api` → `http://localhost:5000` | `vite.config.js` |
| 1.3 | Expand `@theme` with full dark color palette + body base styles | `src/index.css` |
| 1.4 | Build API client wrapper (`apiFetch` with auth header injection) | `src/api/client.js` |
| 1.5 | Implement courses API module | `src/api/courses.js` |
| 1.6 | Build utility functions: `formatTime`, `formatDay`, `ratingColor`, `seatsColor`, `constants` | `src/utils/*.js` |
| 1.7 | Build Firebase AuthContext (init app, `onAuthStateChanged`, user sync via `POST /api/users`, expose `login`/`register`/`logout`) | `src/contexts/AuthContext.jsx` |
| 1.8 | Set up React Router in `main.jsx` + `App.jsx` with all route definitions. Wrap in `AuthProvider`. | `src/main.jsx`, `src/App.jsx` |
| 1.9 | Build Navbar (fixed top, nav links, mobile hamburger, auth-aware right section) | `src/components/Navbar.jsx` |
| 1.10 | Build shared components: `SearchInput`, `useDebounce`, `Pagination`, `LoadingSpinner`, `EmptyState` | `src/components/*.jsx`, `src/hooks/*.js` |
| 1.11 | Build CoursesPage (search bar, subject filter, paginated fetch, loading/empty states) | `src/pages/CoursesPage.jsx` |
| 1.12 | Build CourseCard (subject+number, name, credits, link to detail) | `src/components/CourseCard.jsx` |

**Deliverable:** Working app with navigation, dark theme, courses search pulling real data. Auth context ready but no login UI yet.

### Phase 2: Data Pages (Week 2)

Goal: All public-facing data pages functional with professor ratings, reviews, and grade distributions.

| # | Task | Files |
|---|---|---|
| 2.1 | Build API modules for professors, reviews, grade distributions | `src/api/professors.js`, `reviews.js`, `gradeDistributions.js` |
| 2.2 | Build display components: `RatingBadge`, `SeatsBadge`, `TimeDisplay`, `DayPills`, `ProfessorBadge`, `SectionRow` | `src/components/*.jsx` |
| 2.3 | Build CourseDetailPage (course header, sections table as SectionRows, grade dist summary + `GradeDistChart`) | `src/pages/CourseDetailPage.jsx` |
| 2.4 | Build GradeDistChart (horizontal stacked bar with pure divs — A green, B blue-green, C yellow, D orange, F red, W gray) | `src/components/GradeDistChart.jsx` |
| 2.5 | Build ProfessorsPage (search, min-rating filter, paginated card grid) | `src/pages/ProfessorsPage.jsx` |
| 2.6 | Build ProfessorDetailPage (stats header, RMP link, courses taught, grade dist, reviews list) | `src/pages/ProfessorDetailPage.jsx` |
| 2.7 | Build ReviewCard (rating, difficulty, grade, comment, author, delete button for own reviews) | `src/components/ReviewCard.jsx` |
| 2.8 | Build ReviewForm (modal — rating 1-5, difficulty 1-5, grade dropdown, comment, semester) | `src/components/ReviewForm.jsx` |

**Deliverable:** Course detail with sections and grades, professor pages with reviews, working review form.

### Phase 3: Schedule Builder (Weeks 3–4)

Goal: The core planning workflow — create schedules, search courses, add/remove sections with conflict detection, visual weekly calendar.

| # | Task | Files |
|---|---|---|
| 3.1 | Build schedules API module (all 7 endpoints) | `src/api/schedules.js` |
| 3.2 | Build users API module | `src/api/users.js` |
| 3.3 | Build MySchedulesPage (list schedules, create new with name+semester, inline rename via PATCH, delete with confirmation) | `src/pages/MySchedulesPage.jsx` |
| 3.4 | Build WeeklyCalendar (5-column Mon–Fri grid, 7AM–10PM, positioned time blocks from section schedules, color-coded by course, responsive horizontal scroll on mobile) | `src/components/WeeklyCalendar.jsx` |
| 3.5 | Build ConflictModal (display conflicts array: CRN, day, time ranges, formatted) | `src/components/ConflictModal.jsx` |
| 3.6 | Build ScheduleBuilderPage — two-panel layout: left = course search with expandable sections + Add buttons; right = schedule header + WeeklyCalendar + section list with Remove buttons. Handle 409 duplicate vs conflict responses. | `src/pages/ScheduleBuilderPage.jsx` |

**Key state in ScheduleBuilderPage:** `schedule` (full object from GET), `searchQuery`, `searchResults`, `expandedCourseId`, `conflictData` (for modal). Define `refreshSchedule()` to re-fetch after every add/remove.

**Deliverable:** Students can create, edit, and delete schedules; search courses; add sections with conflict detection; view on weekly calendar; remove sections.

### Phase 4: Polish & Deploy (Weeks 5–6)

Goal: Auth UI, profile, landing page, responsive pass, error handling, production build.

| # | Task | Files |
|---|---|---|
| 4.1 | Build LoginPage (email+password form, Firebase errors, link to register, redirect on success) | `src/pages/LoginPage.jsx` |
| 4.2 | Build RegisterPage (email+password+confirm, client-side validation, redirect to profile) | `src/pages/RegisterPage.jsx` |
| 4.3 | Build ProtectedRoute wrapper (check auth, redirect to /login with `from` state) | `src/components/ProtectedRoute.jsx` |
| 4.4 | Wrap protected routes in App.jsx (`/schedules`, `/schedules/:id`, `/profile`) | `src/App.jsx` |
| 4.5 | Build ProfilePage (display/edit display_name and major via PATCH) | `src/pages/ProfilePage.jsx` |
| 4.6 | Build LandingPage (hero section, feature grid, CTA → `/courses`) | `src/pages/LandingPage.jsx` |
| 4.7 | Responsive pass — all pages tested at mobile (<640), tablet (640–1024), desktop (>1024). Hamburger nav, stacked layouts on mobile, WeeklyCalendar horizontal scroll. | All components |
| 4.8 | Error handling — global 401 handler (sign out + redirect), 404 catch-all route, network error messages on all fetch calls | `src/api/client.js`, `src/App.jsx` |
| 4.9 | Update `index.html` — dark body bg to prevent flash, update title, custom favicon | `index.html` |
| 4.10 | Production build verification (`npm run build`, `npm run preview`) | — |

**Deliverable:** Complete MVP with auth, profiles, landing page, responsive design, error handling.

---

## 7. Post-MVP Features (Do NOT build during initial phases)

1. **Smart Scheduler** — auto-generate conflict-free schedule combinations ranked by professor rating
2. **Professor Comparison** — side-by-side view when a course has multiple sections
3. **Schedule Sharing** — shareable link (GET /api/schedules/:id is already public) + ICS export
4. **Prerequisite Warnings** — if Banner data becomes available
5. **Semester History** — mark courses as completed, track degree progress
6. **Seat Watch Notifications** — alert when full sections open up
7. **Dark/Light Theme Toggle**

---

## 8. Rules for Claude

1. **Tutor mode is active** (per CLAUDE.md). Guide, don't generate. Give hints first. If the user says "override," provide direct code.
2. **No backend changes.** Do not modify any file in `backend/`.
3. **No new packages** beyond `react-router-dom` and `firebase`. No axios, no Redux, no UI libraries, no charting libraries.
4. **Plain JSX only.** No TypeScript. No class components. Function components + hooks only.
5. **Handle nullable professor everywhere.** `section.professor` can be `null`. Use optional chaining or display "TBA".
6. **Parse times before display.** `"0930"` → `"9:30 AM"` via `formatTime()`. Never show raw 4-char strings.
7. **Map days before display.** `"monday"` → `"Mon"` via `formatDay()`.
8. **Match pagination shape.** All paginated endpoints return `{ page, per_page, total, pages, results }`.
9. **Auth token injection.** `apiFetch` in `client.js` handles `Authorization: Bearer <token>` automatically. Never construct auth headers in page components.
10. **Handle both 409 scenarios.** Duplicate = `"duplicate found"` (mild warning). Conflict = `"time conflict found"` (show ConflictModal with conflicts array).
11. **Handle insufficient grade data.** When `insufficient_data: true`, show message — don't render chart.
12. **No inline styles.** Tailwind classes only. Custom values in `@theme`.
13. **Naming:** PascalCase components (`CourseCard.jsx`), camelCase utils/hooks/API modules (`formatTime.js`).
14. **One component per file.** Exception: small internal-only helpers in the same file.
15. **Fetch-on-mount pattern:** `useEffect` with async function + cleanup flag to prevent stale updates.
16. **Relative API URLs.** Use `/api/courses`, not `http://localhost:5000/api/courses`.
17. **Build one page at a time in phase order.**

---

## Verification

After each phase, verify by:

1. **Start backend:** `cd backend && python run.py` (port 5000)
2. **Start frontend:** `cd frontend && npm run dev` (Vite dev server with proxy)
3. **Phase 1:** Navigate to `/courses`, search for a subject (e.g., "CS"), verify results load with pagination
4. **Phase 2:** Click a course → verify sections table with professor ratings. Visit `/professors` → click a professor → verify reviews and grade chart
5. **Phase 3:** Log in → create a schedule → search courses → add sections → verify calendar renders → try adding a conflicting section → verify 409 modal → remove a section
6. **Phase 4:** Test login/register flow, profile edit, landing page, resize browser to mobile width for responsive check, run `npm run build` for production

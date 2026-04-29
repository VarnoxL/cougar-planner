# Cougar Planner — Session Handover

**Date:** 2026-04-29  
**Branch:** master (up to date with origin)

---

## Project Summary

Cougar Planner is a course planning tool for SIUE students only. It pulls course/section data from Banner 9, professor ratings from RateMyProfessors, and grade distributions from student reviews. Students can search courses, evaluate professors, and build conflict-free semester schedules.

---

## Current State

### Backend — Complete

All 6 blueprints are registered and working:

| Blueprint | File | Endpoints |
|---|---|---|
| courses | `backend/app/routes/courses.py` | GET /api/courses, GET /api/courses/:id |
| professors | `backend/app/routes/professors.py` | GET /api/professors, GET /api/professors/:id |
| schedules | `backend/app/routes/schedules.py` | Full CRUD + section add/remove with conflict detection |
| reviews | `backend/app/routes/reviews.py` | GET/POST/DELETE |
| grade_distributions | `backend/app/routes/grade_distributions.py` | GET /api/grade-distributions, GET .../summary |
| users | `backend/app/routes/users.py` | POST /api/users, GET/PATCH /api/users/:id |

Firebase auth middleware is in `backend/app/utils/auth.py`. Conflict detection utility is in `backend/app/utils/conflict.py`.

### Frontend — Foundation Done, Pages Not Yet Built

**What's solid:**
- `frontend/src/api/client.js` — `apiFetch` wrapper with Firebase token injection, error handling
- `frontend/src/contexts/AuthContext.jsx` — Firebase auth state, user sync on login, exposes `login`/`register`/`logout`/`user`
- `frontend/src/main.jsx` — BrowserRouter + AuthProvider wiring
- `frontend/src/App.jsx` — all 10 routes defined, Navbar included
- `frontend/src/components/Navbar.jsx` — fully implemented and polished this session (see Navbar notes below)
- `frontend/src/assets/logo-icon-dark.svg` + `logo-lockup-dark.svg` — logo SVGs copied from `logo_handoff/assets/`
- All API modules exist (`courses.js`, `professors.js`, `schedules.js`, `reviews.js`, `gradeDistributions.js`, `users.js`)
- All utility functions exist (`formatTime.js`, `formatDay.js`, `ratingColor.js`, `seatsColor.js`, `constants.js`)
- Both hooks exist (`useDebounce.js`, `usePagination.js`)

**What's stubbed (returns null or "coming soon"):**
Every page and component other than Navbar is a stub. No data-fetching pages are functional yet.

### API Modules — Status

All 6 API modules are now implemented:

| Module | File | Functions |
|---|---|---|
| courses | `frontend/src/api/courses.js` | `fetchCourses`, `fetchCourse` |
| professors | `frontend/src/api/professors.js` | `fetchProfessors`, `fetchProfessor` |
| reviews | `frontend/src/api/reviews.js` | `fetchReviews`, `createReview`, `deleteReview` |
| gradeDistributions | `frontend/src/api/gradeDistributions.js` | `fetchGradeDistributions`, `fetchGradeDistributionSummary` |
| schedules | `frontend/src/api/schedules.js` | (stubbed — Phase 3) |
| users | `frontend/src/api/users.js` | (stubbed — Phase 3) |

All use the same pattern: `apiFetch` from `client.js`, query-string built via `URLSearchParams` filtering out null/empty values.

### Navbar — What Was Done This Session

Three improvements made to `frontend/src/components/Navbar.jsx`:

1. **Logo** — brand area now shows the calendar icon SVG (inline JSX, always visible) + "CougarPlanner" wordmark (`font-mono font-bold text-lg`, hidden on mobile). SVG text was intentionally kept out of the inline SVG and rendered as HTML spans instead — SVG `<text>` elements conflict with Tailwind's cascading base styles and cause misalignment/sizing bugs.
2. **Auth loading guard** — `loading` from `useAuth()` is now checked; both the desktop and mobile auth sections render `null` while Firebase resolves, preventing the "Log in / Sign up" flash on page load for returning users.
3. **Mobile drawer animation** — replaced `{open && <div>}` conditional with an always-mounted div using `transition-[max-height] duration-300` between `max-h-0` and `max-h-96`. Required `overflow-hidden` on the outer div and a separate inner div holding padding so it clips cleanly at `max-h-0`.

---

## What Comes Next — Build Order

The frontend plan lives at `.claude/frontend-plan.md`. The phases:

**Phase 1** — Foundation (done, except the actual page/component implementations)

**Phase 2 — Data Pages (in progress)**

These are the next tasks to build, in order:

1. ~~`src/api/professors.js`, `reviews.js`, `gradeDistributions.js` — add missing fetch functions~~ **Done**
2. Display components: `RatingBadge`, `SeatsBadge`, `TimeDisplay`, `DayPills`, `ProfessorBadge`, `SectionRow` **(start here)**
3. `CoursesPage` — search bar, subject filter, paginated fetch, `CourseCard` list
4. `CourseCard` — subject+number, name, credits, link to detail
5. `CourseDetailPage` — course header, sections table, grade distribution
6. `GradeDistChart` — horizontal stacked bar (pure divs, no charting library)
7. `ProfessorsPage` — search, min-rating filter, paginated grid
8. `ProfessorDetailPage` — stats header, courses taught, grade dist, reviews
9. `ReviewCard` + `ReviewForm` (modal)

**Phase 3 — Schedule Builder**

10. `MySchedulesPage` — list/create/delete schedules
11. `WeeklyCalendar` — 5-day grid with positioned time blocks
12. `ConflictModal` — display 409 conflict details
13. `ScheduleBuilderPage` — two-panel layout, course search + calendar

**Phase 4 — Polish**

14. `LoginPage` + `RegisterPage` — Firebase email/password forms
15. `ProtectedRoute` — redirect to /login if unauthenticated; wrap `/schedules`, `/schedules/:id`, `/profile` in App.jsx
16. `ProfilePage` — edit display_name and major
17. `LandingPage` — hero, feature grid, CTA
18. Responsive pass + error handling + production build

---

## Key Rules for Any Frontend Work

- **No backend changes** — do not touch anything in `backend/`
- **No new npm packages** — only `react-router-dom` and `firebase` were approved additions
- **`section.professor` is always nullable** — use optional chaining or show "TBA"
- **Never show raw time strings** — `"0930"` → `formatTime()` → `"9:30 AM"`
- **Never show raw day strings** — `"monday"` → `formatDay()` → `"Mon"`
- **No inline styles** — Tailwind classes only; custom values go in `@theme` in `index.css`
- **`apiFetch` handles auth headers** — never construct `Authorization` headers in page components
- **Both 409 shapes** — `"duplicate found"` (mild) vs `"time conflict found"` (show ConflictModal with `conflicts` array)
- **Insufficient grade data** — when `insufficient_data: true`, show message, do not render chart

---

## How to Run

```bash
# Backend (port 5000)
cd backend && python run.py

# Frontend (Vite dev server — proxies /api to localhost:5000)
cd frontend && npm run dev
```

The Vite proxy is already configured in `frontend/vite.config.js`.

---

## Important Files

| Purpose | Path |
|---|---|
| Frontend build plan (all phases, API shapes, rules) | `.claude/frontend-plan.md` |
| Security & performance reference | `SECURITY_AND_PERFORMANCE.md` |
| Backend app factory | `backend/app/__init__.py` |
| API client | `frontend/src/api/client.js` |
| Auth context | `frontend/src/contexts/AuthContext.jsx` |
| Route definitions | `frontend/src/App.jsx` |
| Color tokens | `frontend/src/index.css` |

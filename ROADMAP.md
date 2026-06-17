# Cougar Planner — Future Roadmap

## Context

Cougar Planner (cougarplanner.com) is **already a working, deployed product** — not a half-finished
prototype. The exploration confirmed: 13 live frontend pages (React 19 + Vite on Vercel), 6 backend
blueprints (Flask + SQLAlchemy on Render + Supabase Postgres), Firebase auth with email verification +
Google sign-in, a full schedule builder with server-side conflict detection, RateMyProfessors
integration, and a passing test suite. The core loop — search courses → check professor ratings → build
a conflict-free schedule → share it — works today without any user-generated content.

So the honest answer to *"is it done?"* is: **the product is shippable, but it has three real problems
that the rest of this plan addresses.**

1. **Nobody can find it.** It's a client-rendered SPA with no Open Graph tags, no sitemap, no
   robots.txt, and no per-page metadata (confirmed in [index.html](frontend/index.html)). SIUE students
   Googling "SIUE [professor] rating" or "SIUE CS 250 schedule" will never see it. This is the #1 cause
   of "no users."
2. **A headline feature is empty.** Grade distributions render from student reviews only, and the IBHE
   grade scraper is entirely stubbed — every function is `pass`
   (see [grade_scraper.py](backend/scrapers/grade_scraper.py)). With no users, there are no reviews, so
   the grade charts show nothing. The IBHE scraper would fill this with real historical data
   independently of user count.
3. **It feels unfinished in places.** The profile page has 4 "coming soon" panels, the notifications
   bell is hardcoded to `hasUnread = false`, and saved-courses/bookmarking is a UI placeholder only.

The goal of this roadmap is a balanced, phased path: harden what's fragile, make it discoverable, fill
the empty data, finish the rough edges, then add one feature worth talking about. New free/low-cost
tools are in scope (per your direction); paid services are avoided.

> **Note on CLAUDE.md:** It still says "no frontend, no auth" — that's stale; both shipped since it was
> written. The *spirit* still holds (Flask/SQLAlchemy/Postgres fixed, upsert scrapers, manual JSON, no
> serialization libs). Adding pip packages now requires your sign-off; this plan flags each one. The
> CLAUDE.md itself should be updated to match reality (Phase 0).

---

## Phase 0 — Must-Fix (technical hardening that blocks safe growth)

These are the genuine "MUST" items. Growth is pointless if the app breaks under real traffic or you're
blind to it.

- **Database migrations.** The app builds schema via `db.create_all()` with no Alembic. The moment you
  need to add a column (and several phases below do), you risk manual prod surgery or data loss. Add
  **Flask-Migrate / Alembic** (`pip install Flask-Migrate` — needs approval), generate an initial
  migration from the current `models.py`, and switch deploys to `flask db upgrade`. Do this *first*
  because later phases add columns.
- **Error tracking + analytics — you cannot fix a funnel you can't see.** This directly serves the
  "no users" problem: you need to know if people land and bounce, and whether errors are silently
  killing signups.
  - Frontend analytics: **Vercel Web Analytics** (free, one component) or **Plausible/PostHog** free
    tier. Track page views + key events (search, add-to-schedule, register, share).
  - Error tracking: **Sentry** free tier on both frontend and Flask backend (`pip install sentry-sdk`
    — needs approval). Today errors only `print` to stderr.
- **DB-level cascade deletes.** Schedule deletion relies on app-code manual cleanup of
  `SavedScheduleSection` rows (see [schedules.py](backend/app/routes/schedules.py)). Add
  `ondelete="CASCADE"` + `passive_deletes` so orphans can't accumulate. (Goes through the new migration
  flow.)
- **Health check should check dependencies.** `/health` returns static `ok`. Make it ping the DB so
  Render/uptime monitors catch a dead database. Add a free uptime monitor (UptimeRobot) — Render free
  tier sleeps, and a pinger keeps the API warm so first-load isn't a 30s cold start (a real UX killer
  for new visitors).
- **Lightweight input validation on writes.** PATCH/POST endpoints accept arbitrary JSON and silently
  ignore unknown fields. Add small manual guards (consistent with the "no marshmallow/pydantic" rule)
  for `reviews`, `schedules`, and `users` writes.
- **Confirm XSS posture.** Review comments aren't HTML-escaped server-side; React escapes by default,
  so verify no `dangerouslySetInnerHTML` renders user text, then leave a note. Low effort, worth
  confirming before reviews go public.
- **Update CLAUDE.md** to reflect the shipped frontend + auth so future work isn't fighting stale rules.

**Representative files:** `backend/app/__init__.py`, `backend/app/models.py`,
`backend/app/routes/*.py`, new `backend/migrations/`, `frontend/src/main.jsx`,
`frontend/src/api/client.js`.

---

## Phase 1 — Get Found (discoverability & distribution) ← highest growth leverage

The product is good enough to grow; the bottleneck is reach. Two tracks: technical SEO and human
distribution.

**Technical SEO (so Google sends you SIUE students):**
- Add **Open Graph + Twitter Card** meta tags and a real share image so links posted in Discord/Reddit/
  GroupMe unfurl nicely. Today a shared link shows nothing.
- Add **per-page metadata** for course and professor pages — title/description like
  "Dr. Jane Smith — SIUE Professor Rating & Reviews | Cougar Planner". These long-tail pages
  (one per professor, one per course) are your organic-search goldmine: students search professor names
  constantly. Use **react-helmet-async** (needs approval) or Vite's prerender, plus...
- **Prerendering/SSG for public pages.** An SPA's empty `<div id="root">` is weak for SEO. Use
  **`vite-plugin-prerender` / prerender.io**, or migrate the public, content-heavy routes to
  static generation, so course/professor pages ship real HTML. (Evaluate cost vs. payoff; even just
  OG tags + a sitemap is a large step.)
- Add **`sitemap.xml` + `robots.txt`** (generate sitemap from the courses/professors tables) and submit
  to **Google Search Console**. This is the single highest-ROI growth task in the whole plan.
- Add a small backend endpoint or build-step that emits the sitemap from current DB rows.

**Human distribution (free, founder-led):**
- Post in **r/SIUE**, SIUE Discord servers, major-specific GroupMe/class group chats — especially timed
  to **registration season** (your Banner scraper already runs April 1 / Oct 1; align launches to it).
- Reach out to **academic advisors / student org leaders** — they recommend tools to whole cohorts.
- A simple **"Share this schedule" → image export** turns every user into a distributor (ties into the
  existing share-token feature in [schedules.py](backend/app/routes/schedules.py)).

---

## Phase 2 — Fill the Empty Data (make the product valuable at zero users)

The features that need users are a chicken-and-egg trap. Break it by populating data from sources that
don't depend on your user count.

- **Implement the IBHE grade scraper.** This is the biggest single product win. Flesh out the three stub
  functions in [grade_scraper.py](backend/scrapers/grade_scraper.py) (`download_csv`, `parse_row`,
  `upsert_grade_distributions`) following the upsert pattern from
  [rmp_scraper.py](backend/scrapers/rmp_scraper.py). The hard part is research, not code: find SIUE's
  institution code + CSV URL on the IBHE Data Arena. Add it as a third Render cron job in
  `render.yaml`. Result: every course/professor page shows **real grade distributions** with no users.
- **Lean harder on RMP data you already import.** You already cache RMP reviews
  ([rmp.py](backend/app/utils/rmp.py)). Surface them prominently so professor pages feel full from day
  one, clearly labeled as RMP vs. native reviews.
- **Seed credibility, not fake data.** Don't fabricate stats on the landing page — show real counts
  (X courses, Y professors, Z grade records) pulled from the DB so the numbers grow honestly.

---

## Phase 3 — Finish the Rough Edges (so it earns trust)

Make it feel complete. Each of these removes a "coming soon" that signals "prototype."

- **Profile page:** wire up the stubbed panels in [ProfilePage.jsx](frontend/src/pages/ProfilePage.jsx)
  — at minimum "My Schedules" (link existing data) and a working delete-account flow (Firebase + cascade
  DB cleanup). Drop panels you won't build soon rather than label them "coming soon."
- **Saved courses / bookmarking:** small, high-value. Requires a new join table → needs your approval
  per CLAUDE.md, and goes through the Phase 0 migration flow.
- **Delete confirmations** for reviews/schedules (currently immediate).
- **Mobile nav** auto-close after navigation; general mobile QA — most students are on phones.
- Either build the **notifications** bell or hide it until Phase 4 gives it a purpose.

---

## Phase 4 — A Feature Worth Talking About (word-of-mouth growth)

Pick **one** flagship that spreads naturally. Recommendation, in priority order:

1. **Seat-open notifications ("notify me when CRN 12345 has a seat").** At registration time this is
   the feature students *tell their friends about*. You already scrape enrollment counts in
   [siue_scraper.py](backend/scrapers/siue_scraper.py); add a watch table + a more frequent
   enrollment-only scrape during registration windows + email (free tier: Resend/SendGrid) or in-app
   notification (gives the bell a job). High effort, highest word-of-mouth payoff.
2. **Degree/multi-semester planning** — plan several semesters toward a major. Bigger scope.
3. **Schedule comparison / "build the best schedule"** — auto-suggest conflict-free combinations
   weighted by professor rating. Builds directly on existing conflict detection
   ([conflict.py](backend/app/utils/conflict.py)).

Do not start Phase 4 until Phases 0–1 are done — a viral feature with no analytics and no
discoverability wastes the spike.

---

## Suggested Sequence

1. **Phase 0** (migrations + analytics + Sentry) — do before anything that touches schema or growth.
2. **Phase 1 SEO** (OG tags, sitemap, Search Console) — in parallel with founder-led posting.
3. **Phase 2 IBHE scraper** — fills the empty headline feature.
4. **Phase 3 polish** — opportunistically, ahead of a registration-season push.
5. **Phase 4 flagship** — timed to the next registration window.

---

## Verification

- **Phase 0:** `flask db upgrade` runs clean on a fresh DB; `cd backend && pytest` stays green;
  trigger a deliberate error and confirm it appears in Sentry; confirm page views land in analytics;
  `/health` returns non-ok when DB is unreachable.
- **Phase 1:** run the site through a link-preview debugger (rich unfurl shows image/title); confirm
  `sitemap.xml` and `robots.txt` are served; submit to Google Search Console and confirm pages get
  indexed over the following days; view-source a professor page and confirm real metadata/HTML is
  present (not just an empty root div).
- **Phase 2:** run `PYTHONPATH=. python scrapers/grade_scraper.py <term>` locally against the dev
  SQLite DB, then load a course/professor page and confirm real grade bars render via
  [GradeDistChart.jsx](frontend/src/components/GradeDistChart.jsx).
- **Phase 3/4:** manual end-to-end in the running app (the `/run` skill launches it) — exercise each
  finished panel and the new flagship flow on both desktop and mobile widths.

---

## Approvals needed before implementing (per CLAUDE.md)

- New pip packages: `Flask-Migrate`, `sentry-sdk` (Phase 0); possibly an email SDK (Phase 4).
- New frontend deps: analytics client, `react-helmet-async` and/or a prerender plugin (Phase 1).
- New DB tables/columns: cascade `ondelete` (Phase 0), saved-courses table (Phase 3), seat-watch table
  (Phase 4).

This roadmap is intentionally broad. The recommended starting point is a thin slice: **Phase 0
migrations + analytics, then Phase 1 SEO (OG tags + sitemap + Search Console).** That combination makes
the app safe to grow *and* findable — the two things standing between today's working product and your
first real SIUE users.

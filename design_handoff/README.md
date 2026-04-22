# Handoff: CougarPlanner UI Design

## Overview
This package contains the complete UI design for CougarPlanner — a course planning web app for SIUE (Southern Illinois University Edwardsville) students. It covers all core screens, component states, design tokens, and interaction patterns.

## About the Design Files
The HTML files in this bundle are **design references created as interactive prototypes** — they show intended look, layout, and behavior, but are not production code to copy directly. Your task is to **recreate these designs in the existing React + Vite + Tailwind CSS codebase** at `cougar-planner/frontend/src/`, using its established patterns and the component file structure already defined there.

The components in the repo are currently empty (0 bytes) — these designs are the spec to implement from.

## Fidelity
**High-fidelity.** These are pixel-precise mockups with final colors, typography, spacing, and interactions. Implement them exactly as shown. All hex values, font stacks, spacing, and border radii are documented below and in `colors_and_type.css`.

---

## Design Tokens

### Colors
```css
--red:         #c8102e   /* Primary brand / SIUE red — buttons, badges, accents */
--red-hover:   #a50e26   /* Hover state for red buttons */
--red-glow:    rgba(200,16,46,0.12) /* Focus rings, subtle backgrounds */

--bg-base:     #0f1117   /* Page background */
--bg-card:     #1a1d27   /* Card / panel backgrounds */
--bg-input:    #252836   /* Input fields, dropdowns, secondary surfaces */
--bg-hover:    #2e3244   /* Hovered rows, list items */

--border:      #2e3244   /* All borders and dividers */

--text-primary:   #e8eaed  /* Main readable text */
--text-secondary: #9ca3af  /* Meta text, labels, subtitles */
--text-muted:     #6b7280  /* Placeholders, timestamps, disabled */

--rating-green:  #22c55e  /* Rating ≥ 4.0, seats available */
--rating-yellow: #eab308  /* Rating 3.0–3.9, seats low */
--rating-red:    #ef4444  /* Rating < 3.0, seats full, error states */
```

Tailwind equivalent (already defined in `frontend/src/index.css` via `@theme`):
```
bg-bg-primary, bg-bg-card, bg-bg-input, text-text-primary,
text-text-secondary, bg-c-red, text-c-red, etc.
```

### Typography
| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Logo / Hero | Space Mono | 16–42px | 700 | Tight tracking (-0.02em) |
| UI labels / badges | Space Mono | 10–12px | 400 | ALL CAPS, +0.1em tracking |
| CRN / course codes | Space Mono | 11–14px | 400 | Monospace data display |
| Page titles (H1) | Space Mono | 22–26px | 700 | |
| Card titles (H2–H4) | DM Sans | 14–20px | 600–700 | |
| Body copy | DM Sans | 13–15px | 400 | line-height: 1.6 |
| Buttons | DM Sans | 13–14px | 600–700 | |

```html
<!-- In index.html or global CSS -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Spacing Scale (4px base)
4, 8, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64px

### Border Radii
- `2px` — mono labels, status tags (`rounded-sm`)
- `6px` — cards, inputs, buttons (`rounded-md`)
- `8px` — larger panels (`rounded-lg`)
- `10px` — modals (`rounded-xl` ish)
- `9999px` — day pills (`rounded-full`)

### Shadows
- Cards: `0 4px 12px rgba(0,0,0,0.5)`
- Modals: `0 16px 48px rgba(0,0,0,0.7)`
- Red focus ring: `0 0 0 3px rgba(200,16,46,0.12)`

---

## Screens & Components

### 1. Navbar — `components/Navbar.jsx`
**Layout:** Full-width, `height: 56px`, flex row, `padding: 0 24px`, `border-bottom: 1px solid #2e3244`, `background: #0f1117`, sticky top.

**Elements:**
- **Logo** — `font-family: Space Mono, weight 700, size 16px`. Text: `Cougar` (white #e8eaed) + `Planner` (red #c8102e). Clickable → `/`
- **Nav links** — DM Sans 14px weight 500. Active: `background #1a1d27, color #e8eaed, border-radius 4px, padding 5px 10px`. Inactive: color `#9ca3af`. Links: Courses, Professors, Schedule, My Schedules
- **Auth (logged out):** Ghost "Sign In" button + primary "Get Started" button
- **Auth (logged in):** Avatar initials circle (36px, Space Mono, #c8102e on #252836) + username

**Mobile (≤640px):** Height 52px. Logo left, hamburger icon (3 lines, `#9ca3af`) right. No nav links visible.

---

### 2. Login / Register — `pages/LoginPage.jsx`, `pages/RegisterPage.jsx`
**Layout:** Centered card, `width: 420px`, centered vertically in viewport. Full page bg `#0f1117`.

**Card:** `background #1a1d27, border 1px solid #2e3244, border-radius 10px, padding 36px, box-shadow 0 8px 32px rgba(0,0,0,0.55)`

**Tab switcher:** Two buttons inside `background #252836, border-radius 8px, padding 3px`. Active tab: `background #1a1d27, border 1px solid #2e3244`. DM Sans 13px weight 600.

**Form fields:**
- Label: DM Sans 13px weight 500, color `#9ca3af`, margin-bottom 5px
- Input: `background #252836, border 1px solid #2e3244, border-radius 6px, padding 10px 14px, font-size 14px, color #e8eaed`
- Focus state: `border-color #c8102e, box-shadow 0 0 0 3px rgba(200,16,46,0.12)`

**Primary button:** `background #c8102e, color white, width 100%, padding 11px, border-radius 6px, font-weight 700, font-size 14px`
**Hover:** `background #a50e26`
**Press:** `transform scale(0.97)`

**Register extras:** Major select dropdown (optional), note text below email field in muted color.

**Mobile:** Same card but full-width with `margin 20px`, no min-height constraint. Larger button padding (`13px`).

---

### 3. Courses Browse — `pages/CoursesPage.jsx` + `pages/CourseDetailPage.jsx`

**Desktop layout:** Two-column split. Left panel `width 420px, border-right 1px solid #2e3244`. Right panel `flex: 1, overflow-y: auto`.

**Left panel — Filters:**
- Search input with SVG search icon (left-padded `padding-left: 32px`)
- Subject + Delivery dropdowns in a row (`gap: 6px`)
- Result count in Space Mono 11px muted

**Left panel — Course list rows:**
- `padding 12px 16px, border-bottom 1px solid #2e3244`
- Selected state: `background #2e3244, border-left 2px solid #c8102e`
- Hover: `background #2e3244` (transition 0.1s)
- Row content: course code (Space Mono red), credits tag, seats badge, course name, day pills + time

**Right panel — Detail view:**
- Section info in a 3-column CSS grid with label+value pairs
- Professor card: avatar + name/dept + rating/difficulty/again stats
- Grade distribution: horizontal bar chart — colored bars for A/B/C/D/F/W

**`components/CourseCard.jsx`** — the list row component with code, name, days, time, seats.

**`components/SectionRow.jsx`** — the section detail row inside CourseDetail.

**Mobile:** Single-column. Tap a row → slides to detail view. Back button at top.

---

### 4. Professors Browse — `pages/ProfessorsPage.jsx`
**Layout:** Single column, `max-width 860px`, centered.

**Stats strip:** 3 equal columns (`gap: 1px`, bg border color as separator). Each: `background #1a1d27, padding 12px 16px`. Label Space Mono 10px uppercase, value Space Mono 18px bold.

**Table header:** `padding 10px 20px, background rgba(255,255,255,0.02), border-bottom`. Columns: Instructor / Rating / Difficulty / Again / chevron.

**Table rows:**
- `padding 14px 20px`, hover `background #2e3244`
- Avatar 42px + name/dept + rating badges + chevron right

**`components/ProfessorBadge.jsx`** — avatar + name + 3 stats, reusable across pages.

**Mobile:** Compact rows. Avatar 36px. Only show Rating badge + again% (no difficulty column). Search bar at top.

---

### 5. Professor Detail — `pages/ProfessorDetailPage.jsx`
**Hero card:** Flex row — avatar 64px + name/dept/review count left + 3-stat strip right. Stat strip uses `gap:1px, background: border color` as divider, each cell `background #1a1d27`.

**Two-column grid below hero:** Courses Taught card (tag pills) + Grade Distribution card (horizontal bars).

**Reviews list:** Each review — avatar 28px + username + date + rating badge + difficulty + grade tag (right-aligned, Space Mono, `background #252836`). Review text below with `padding-left: 38px` (avatar width + gap).

**Review form:** Two-column layout — left: star rating (★ emoji, yellow when active), course select, grade select. Right: textarea + submit button.
- Star rating: `font-size 22px, color #eab308 (active), color #2e3244 (inactive)`
- Textarea: same input styles as form fields, `min-height: 80px, resize: vertical`

**`components/ReviewCard.jsx`** — single review display.
**`components/ReviewForm.jsx`** — the form component.

**Mobile:** Tabbed layout (Info / Reviews / Grades) using a tab bar with `border-bottom: 2px solid #c8102e` on active tab.

---

### 6. Schedule Builder — `pages/ScheduleBuilderPage.jsx`

**Desktop layout:** Three-column: sidebar `260px` + calendar `flex:1` + optional detail panel `220px` (appears on course click).

**Sidebar:**
- Header with course count + credits
- Course list with color-coded left border strip (3px wide)
- "Browse Courses" ghost button + "Save Schedule" red button at bottom

**Calendar grid:**
```
Grid columns: 52px (time labels) + repeat(5, 1fr)  (Mon–Fri)
Row height: 56px per hour
Time range: 8am–5pm (visible)
Header: sticky, background #0f1117, z-index 10
```
Day headers: Space Mono 10px uppercase, centered.
Hour lines: `border-bottom: 1px solid rgba(46,50,68,0.5)` — alternate lighter for half-hours.

**Event blocks:**
```
position: absolute
top: (startHour - 8) * 56px
height: (endHour - startHour) * 56px - 3px
left: 52px + dayIndex * ((100% - 52px) / 5) + 3px
width: (100% - 52px) / 5 - 6px
border-radius: 5px
border-left: 2px solid [course color]
padding: 5px 8px
```
Color palette per course (cycle through):
```
Red:    bg rgba(200,16,46,0.22),  text #fca5a5, border #c8102e
Green:  bg rgba(34,197,94,0.18),  text #4ade80, border #22c55e
Blue:   bg rgba(59,130,246,0.20), text #93c5fd, border #3b82f6
Purple: bg rgba(168,85,247,0.20), text #d8b4fe, border #a855f7
Yellow: bg rgba(234,179,8,0.18),  text #fde68a, border #eab308
```

**Detail panel** (appears when event clicked): 220px right panel with section info, remove button.

**`components/WeeklyCalendar.jsx`** — the calendar grid component.
**`utils/conflict.py`** already exists in backend. Frontend conflict detection needed in `utils/conflict.js`.

**Mobile:**
- Toggle between "Week" and "List" views (tab switcher, same pattern as login tabs)
- Week view: same grid but `36px` time column, smaller cells (`height: 44px`), smaller event text
- List view: card rows per course with color strip + day pills + time
- Sticky bottom "Save Schedule" button

---

### 7. My Schedules — `pages/MySchedulesPage.jsx`
**Layout:** `max-width 760px`, centered. Schedule cards in a column.

**Schedule card:** `padding 16px 20px`. Name (DM Sans 15px weight 600) + course code tags + created date (right-aligned muted) + Share/Delete buttons.

**Save new panel:** Dashed border card (`border: 1px dashed #2e3244`). Input + Save button in a row.

---

### 8. ConflictModal — `components/ConflictModal.jsx`
**Overlay:** `background rgba(0,0,0,0.65), backdrop-filter blur(3px)`, full viewport, centered content.

**Modal:** `width 400px, background #1a1d27, border 1px solid #2e3244, border-radius 10px, padding 28px, box-shadow 0 16px 48px rgba(0,0,0,0.7)`

**Header icon:** 32px square, `border-radius 8px, background rgba(239,68,68,0.12), border 1px solid rgba(239,68,68,0.25)`. Warning triangle SVG inside.

**Conflict rows:** Inside `background #0f1117, border-radius 6px`. Each row: 3px color strip (green = existing, red = conflict) + course text + status tag.

**Buttons:** "Cancel" (secondary) + "Add Anyway" (danger) right-aligned.

---

### 9. Shared Components

**`components/RatingBadge.jsx`**
```jsx
// val >= 4: green, val >= 3: yellow, else red
// Space Mono, 11px, bold, padding 3px 8px, border-radius 4px
// background: rgba version of color at 13% opacity
```

**`components/SeatsBadge.jsx`**
```jsx
// open/total ratio: >30% = green, >0 = yellow, 0 = red
// Same style as RatingBadge + border at 25% opacity
```

**`components/DayPills.jsx`**
```jsx
// All 5 days (M T W R F) always shown
// Active: background #c8102e, color white
// Inactive: background #252836, color #6b7280
// font-size 11px, font-weight 600, padding 2px 7px, border-radius 9999px
```

**`components/EmptyState.jsx`**
```jsx
// Centered column: 48px icon box (background #1a1d27, border, border-radius 12px)
// + title (DM Sans 14px weight 600, #9ca3af)
// + subtitle (12px, #6b7280)
// + optional CTA button
```

**`components/LoadingSpinner.jsx`**
```jsx
// 32px circle, border 2px solid #2e3244, border-top-color #c8102e
// animation: spin 0.8s linear infinite
```

**`components/Pagination.jsx`**
```jsx
// Row of numbered buttons + prev/next arrows
// Active page: background #c8102e, color white
// Others: background #252836, border 1px solid #2e3244, color #9ca3af
// Space Mono font, 13px, padding 6px 12px, border-radius 6px
```

---

## Interactions & Behavior

| Interaction | Behavior |
|---|---|
| Button hover | `background` shifts (red → `#a50e26`, secondary → `#2e3244`) |
| Button press | `transform: scale(0.97)` |
| Row hover | `background: #2e3244`, transition `0.12s ease` |
| Input focus | `border-color: #c8102e`, `box-shadow: 0 0 0 3px rgba(200,16,46,0.12)` |
| Modal open | Fade in overlay + scale-up card (optional, 0.15s) |
| Page transitions | None required — direct swap |
| Loading | Show `<LoadingSpinner/>` centered while fetching |
| Empty data | Show `<EmptyState/>` with contextual message |
| Conflict detection | On "Add to Schedule" → check for time overlap → show `<ConflictModal/>` if found |
| Schedule events | Click to show detail sidebar panel; click again or × to close |

---

## Responsive Breakpoints
- **Desktop:** ≥ 768px — all multi-column layouts, full navbar
- **Mobile:** < 768px — single column, hamburger nav, tab bars instead of sidebars

---

## Assets
- `assets/hero.png` — isometric illustration (used on landing page if desired)
- Google Fonts: DM Sans + Space Mono (loaded via CDN link in `index.html`)
- Icons: use **Lucide React** (`npm install lucide-react`) — stroke weight 2px, matches the design aesthetic. Icons used: `Search`, `ChevronRight`, `ChevronLeft`, `AlertTriangle`, `Calendar`, `X`, `Star`

---

## Files in this Package
| File | Purpose |
|---|---|
| `README.md` | This file — full implementation spec |
| `Screen Mockups.html` | Interactive prototype: Login, Professors Browse, Schedule Builder (desktop + mobile) |
| `Screen Mockups 2.html` | Interactive prototype: Courses Browse, Professor Detail, Components |
| `colors_and_type.css` | All CSS custom properties + semantic type classes |

Open the HTML files in a browser to interact with the designs. Use them as the source of truth for every pixel decision.

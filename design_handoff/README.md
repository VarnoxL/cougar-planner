# Handoff: CougarPlanner UI Design
> Full implementation spec for Claude Code. Read this file first, then use the HTML mockups as visual reference.

## About the Design Files
The HTML files in this bundle are **interactive design prototypes** — not production code. Your task is to **recreate these designs in the existing React + Vite + Tailwind CSS codebase** at `cougar-planner/frontend/src/`, using its established patterns. All component files in `src/components/` and `src/pages/` are currently empty — these designs are the spec to implement from.

## Fidelity
**High-fidelity.** Pixel-precise colors, typography, spacing, and interactions are all documented below. Match exactly.

---

## Quick Start for Claude Code

```
1. Read this README fully
2. Open Screen Mockups.html and Screen Mockups 2.html in a browser as visual reference
3. Install lucide-react: npm install lucide-react
4. Copy logo SVGs from assets/ into frontend/src/assets/
5. Implement components in the order listed below
```

---

## Logo & Brand Assets

### Files (in `assets/`)
| File | Usage |
|---|---|
| `logo-icon-dark.svg` | 40×40 icon for dark backgrounds — use in navbar, app icon |
| `logo-icon-light.svg` | 40×40 icon for light backgrounds |
| `logo-lockup-dark.svg` | 220×40 full wordmark for dark backgrounds |

### Usage in React (Navbar)
```jsx
// Option 1 — inline SVG (recommended for color control)
import { ReactComponent as LogoIcon } from '../assets/logo-icon-dark.svg';

// Option 2 — img tag
<img src={logoIconDark} alt="CougarPlanner" width={28} height={28} />

// Navbar lockup
<div style={{ display:'flex', alignItems:'center', gap:10 }}>
  <LogoIcon width={28} height={28} />
  <span className="font-mono font-bold text-base tracking-tight text-white">
    Cougar<span className="text-red-600">Planner</span>
  </span>
</div>
```

### Wordmark (text-only, no SVG needed)
```jsx
// Always use Space Mono Bold, split color
<span style={{ fontFamily:'Space Mono', fontWeight:700, fontSize:16, color:'#e8eaed', letterSpacing:'-0.02em' }}>
  Cougar<span style={{ color:'#c8102e' }}>Planner</span>
</span>
```

---

## Design Tokens

### Colors
```css
/* Already defined in frontend/src/index.css via @theme */
--color-c-red:        #c8102e   /* Primary brand / SIUE red */
--color-bg-primary:   #0f1117   /* Page background */
--color-bg-card:      #1a1d27   /* Card / panel backgrounds */
--color-bg-input:     #252836   /* Input fields, dropdowns */
--color-border:       #2e3244   /* All borders */
--color-text-primary: #e8eaed   /* Main text */
--color-text-secondary:#9ca3af  /* Meta text */

/* Add these if not present: */
--color-text-muted:   #6b7280
--color-bg-hover:     #2e3244
--color-red-hover:    #a50e26
--color-rating-green: #22c55e
--color-rating-yellow:#eab308
--color-rating-red:   #ef4444
```

### Typography
```css
/* Google Fonts — add to index.html <head> */
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

| Role | Font | Size | Weight | Extra |
|---|---|---|---|---|
| Logo / wordmark | Space Mono | 16px | 700 | tracking: -0.02em |
| Page titles | Space Mono | 22–26px | 700 | tracking: -0.02em |
| UI labels / badges | Space Mono | 10–12px | 400 | ALL CAPS, +0.12em tracking |
| Course codes / CRNs | Space Mono | 11–13px | 400 | monospace data |
| Card titles | DM Sans | 14–16px | 600 | |
| Body copy | DM Sans | 13–15px | 400 | line-height: 1.6 |
| Buttons | DM Sans | 13–14px | 600–700 | |

### Spacing
Base unit: 4px. Scale: 4, 8, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64px

### Border Radii
- `2px` — mono tags, status labels
- `6px` — cards, inputs, buttons (default)
- `8–10px` — modals, large panels
- `9999px` — day pills (fully rounded)

### Shadows
```css
box-shadow: 0 4px 12px rgba(0,0,0,0.5);    /* cards */
box-shadow: 0 8px 32px rgba(0,0,0,0.6);    /* modals */
box-shadow: 0 0 0 3px rgba(200,16,46,0.12); /* input focus ring */
```

---

## Component Implementation Guide

### Priority order (build in this sequence):
1. `Navbar.jsx`
2. `RatingBadge.jsx`
3. `SeatsBadge.jsx`
4. `DayPills.jsx`
5. `SearchInput.jsx`
6. `LoadingSpinner.jsx`
7. `EmptyState.jsx`
8. `CourseCard.jsx`
9. `SectionRow.jsx`
10. `ProfessorBadge.jsx`
11. `ReviewCard.jsx`
12. `ReviewForm.jsx`
13. `GradeDistChart.jsx`
14. `WeeklyCalendar.jsx`
15. `ConflictModal.jsx`
16. `Pagination.jsx`

---

### `Navbar.jsx`
```jsx
// Height: 56px | padding: 0 24px | border-bottom: 1px solid #2e3244 | bg: #0f1117 | position: sticky top-0 z-50

// Logo: LogoIcon (28×28) + wordmark (Space Mono 16px bold)
// Nav links: DM Sans 14px weight-500 | active: bg #1a1d27 color #e8eaed | inactive: color #9ca3af
// Links: Courses, Professors, Schedule, My Schedules
// Auth logged-out: "Sign In" ghost button + "Get Started" red button
// Auth logged-in: Avatar initials (30px circle, bg #252836, border #2e3244, Space Mono bold red) + username

// Mobile (<640px): height 52px, logo + hamburger only
```

---

### `RatingBadge.jsx`
```jsx
// Props: val (number | null)
// val >= 4.0 → green: bg rgba(34,197,94,0.13) text #22c55e
// val >= 3.0 → yellow: bg rgba(234,179,8,0.13) text #eab308
// val < 3.0  → red: bg rgba(239,68,68,0.13) text #ef4444
// null       → "—" in muted color
// Style: Space Mono 11px bold, padding 3px 8px, border-radius 4px
```

---

### `SeatsBadge.jsx`
```jsx
// Props: open (number), total (number)
// ratio = open/total
// > 0.3 → green (same palette as RatingBadge + border at 25% opacity)
// > 0   → yellow
// === 0 → red
// Display: "{open}/{total}" | Space Mono 11px bold
```

---

### `DayPills.jsx`
```jsx
// Props: days (string[]) — e.g. ['M','W','F']
// Always render all 5: M T W R F
// Active (in days): bg #c8102e, color white
// Inactive: bg #252836, color #6b7280
// Style: DM Sans 11px weight-600, padding 2px 7px, border-radius 9999px
```

---

### `SearchInput.jsx`
```jsx
// Props: value, onChange, placeholder
// Left-padded input (padding-left: 36px) with Search icon (Lucide, 16px, color #6b7280) absolutely positioned
// Input: bg #252836, border 1px solid #2e3244, border-radius 6px, padding 9px 14px 9px 36px
// Focus: border-color #c8102e, box-shadow 0 0 0 3px rgba(200,16,46,0.12)
// Transition: border-color 0.15s ease
```

---

### `LoadingSpinner.jsx`
```jsx
// 32×32 circle
// border: 2px solid #2e3244
// border-top-color: #c8102e
// border-radius: 50%
// animation: spin 0.8s linear infinite
// Center in parent with flexbox
```

---

### `EmptyState.jsx`
```jsx
// Props: icon (Lucide component), title, subtitle, action (optional {label, onClick})
// Layout: flex column, centered
// Icon box: 48×48, bg #1a1d27, border 1px solid #2e3244, border-radius 12px, icon at 22px stroke #6b7280
// Title: DM Sans 14px weight-600 color #9ca3af, margin-top 12px
// Subtitle: 12px color #6b7280
// Action button: primary variant, margin-top 14px (optional)
```

---

### `CourseCard.jsx`
```jsx
// Props: course { code, name, credits, days, time, seats, professor, delivery }
// Layout: full-width row, padding 14px 18px, bg #1a1d27, border 1px solid #2e3244, border-radius 6px
// Hover: bg #2e3244, transition 0.12s
// Left: course code (Space Mono 12px red uppercase) + credits Tag + delivery Tag
//       course name (DM Sans 15px weight-600) below
//       DayPills + time (Space Mono 12px muted) below
// Right: professor name + RatingBadge | SeatsBadge (stacked, right-aligned)
// Active/selected: border-left 2px solid #c8102e
```

---

### `SectionRow.jsx`
```jsx
// Shows a single section's details in a grid
// gridTemplateColumns: repeat(auto-fill, minmax(160px, 1fr))
// Fields: CRN (Space Mono), Days (DayPills), Time (Space Mono), Location, Seats (SeatsBadge), Delivery (Tag)
// Container: bg #1a1d27, border 1px solid #2e3244, border-radius 8px, padding 18px
```

---

### `ProfessorBadge.jsx`
```jsx
// Props: professor { name, department, rating, difficulty, again }
// Layout: flex row, gap 12-16px
// Avatar: initials circle (see Navbar for style), size 42px for list / 44px for detail
// Name: DM Sans 14-15px weight-600 | Dept: 12-13px muted below
// Stats: Rating (RatingBadge) | Difficulty (RatingBadge) | Again (colored %, green if >=70)
// Each stat has a 10px uppercase Space Mono label above
```

---

### `ReviewCard.jsx`
```jsx
// Props: review { user, date, rating, difficulty, grade, text }
// Layout: padding 14px 0, border-bottom 1px solid #2e3244
// Header row: Avatar (28px) + username (13px weight-600) + date (11px muted) + RatingBadge + difficulty label + grade tag (right)
// Grade tag: Space Mono 11px, bg #252836, border #2e3244, padding 2px 8px, border-radius 2px
// Review text: 13px color #9ca3af, line-height 1.65, padding-left 38px (aligns under name)
```

---

### `ReviewForm.jsx`
```jsx
// Props: professorId, onSubmit
// Two-column grid layout (1fr 1fr)
// Left: star rating (5 ★, active = #eab308 22px, inactive = #2e3244) + course select + grade select
// Right: textarea (min-height 80px) + Submit button
// All inputs: bg #252836, border 1px solid #2e3244, border-radius 6px, padding 9-10px 12-14px
// Focus: border-color #c8102e
// Success state: green checkmark + "Review submitted. Thank you!"
```

---

### `GradeDistChart.jsx`
```jsx
// Props: distribution { A, B, C, D, F, W } (percentages)
// Layout: flex column, gap 7px
// Each row: grade letter (Space Mono 11px muted, width 12px) + bar track + percentage
// Bar track: height 8px, bg #252836, border-radius 4px; inner fill at pct%
// Colors: A=#22c55e, B=#86efac, C=#eab308, D=#f97316, F=#ef4444, W=#6b7280
// Animate width on mount: transition width 0.4s ease
```

---

### `WeeklyCalendar.jsx`
```jsx
// Props: sections (array of scheduled sections with days/times)
// Grid: 52px time column + 5 equal day columns (Mon–Fri)
// Row height: 56px per hour | Time range: 8am–5pm
// Header row: sticky, bg #0f1117, z-index 10
// Hour lines: border-bottom 1px solid rgba(46,50,68,0.5)
// Half-hour lines: border-bottom 1px solid rgba(46,50,68,0.25) (optional)

// Event block positioning:
//   top: (startHour - 8) * 56
//   height: (endHour - startHour) * 56 - 3
//   left: 52px + dayIndex * ((100% - 52px) / 5) + 3px
//   width: (100% - 52px) / 5 - 6px

// Color palette (cycle per course index):
//   0: bg rgba(200,16,46,0.22)  text #fca5a5  border #c8102e
//   1: bg rgba(34,197,94,0.18)  text #4ade80  border #22c55e
//   2: bg rgba(59,130,246,0.20) text #93c5fd  border #3b82f6
//   3: bg rgba(168,85,247,0.20) text #d8b4fe  border #a855f7
//   4: bg rgba(234,179,8,0.18)  text #fde68a  border #eab308

// Event content: course code (Space Mono 11px bold) + time range (10px) + location (10px, if height > 40px)
// Click on event → emit onSectionClick(section)
// Mobile: column width scales down; show simplified event (code only)
```

---

### `ConflictModal.jsx`
```jsx
// Props: existing (section), conflicting (section), onCancel, onAddAnyway
// Overlay: bg rgba(0,0,0,0.65), backdrop-filter blur(3px), fixed inset-0, z-50, flex center
// Modal: width 400px, bg #1a1d27, border 1px solid #2e3244, border-radius 10px, padding 28px
//        box-shadow: 0 16px 48px rgba(0,0,0,0.7)
// Header: warning icon (32px box, bg rgba(239,68,68,0.12), border rgba(239,68,68,0.25), AlertTriangle from Lucide)
//         + title "Schedule Conflict" (15px weight-700) + subtitle (12px muted)
// Conflict list: bg #0f1117, border-radius 6px, padding 14px
//   Each row: 3px color strip (green=existing, red=conflict) + course text + status tag
// Buttons: right-aligned | "Cancel" secondary + "Add Anyway" danger
```

---

### `Pagination.jsx`
```jsx
// Props: currentPage, totalPages, onPageChange
// Layout: flex row, gap 4px, centered
// Prev/Next arrows: bg #252836, border #2e3244, padding 6px 12px, border-radius 6px
// Page numbers: same style; active page: bg #c8102e, color white
// Show ellipsis (...) for large page counts
// Space Mono font, 13px
```

---

## Page Layouts

### `CoursesPage.jsx`
Desktop: Two-column split — left panel (420px, fixed) = filters + course list. Right panel (flex:1) = CourseDetail inline.
Mobile: Single column. Tap row → navigate to CourseDetailPage.
- Filter bar: SearchInput + subject select + delivery select
- List: CourseCard rows, border-bottom separators
- Right panel: SectionRow + ProfessorBadge + GradeDistChart + "Add to Schedule" button

### `CourseDetailPage.jsx`
Single column, max-width 800px, centered. Back button → CoursesPage.
Sections: header (code/name/desc + CTA), SectionRow, ProfessorBadge card, GradeDistChart card.

### `ProfessorsPage.jsx`
Single column, max-width 860px. Stats strip (3 cols) + filter bar + table.
Table: header row (Instructor / Rating / Difficulty / Again) + ProfessorBadge rows.
Mobile: compact list rows.

### `ProfessorDetailPage.jsx`
Single column, max-width 820px. Back button → ProfessorsPage.
Sections: hero card (avatar + stats strip), 2-col grid (courses taught + GradeDistChart), ReviewCard list, ReviewForm.
Mobile: tabbed (Info / Reviews / Grades).

### `ScheduleBuilderPage.jsx`
Desktop: 3-column — sidebar (260px) + WeeklyCalendar (flex:1) + detail panel (220px, conditional).
Sidebar: course list with color strip + credits total + "Browse Courses" + "Save Schedule" CTA.
Mobile: Week/List toggle. Sticky bottom "Save Schedule" button.

### `MySchedulesPage.jsx`
Single column, max-width 760px. Saved schedule cards + save-new form (input + button).

### `LoginPage.jsx` / `RegisterPage.jsx`
Centered card (width 420px). Tab switcher between Sign In / Create Account.
Register extras: major dropdown (optional).

### `ProfilePage.jsx`
Not yet designed — leave as placeholder or implement a simple avatar + display name + major + sign out.

---

## Interactions

| Element | Behavior |
|---|---|
| All buttons | `transform: scale(0.97)` on mousedown |
| Red button hover | `background: #a50e26` |
| Secondary button hover | `background: #2e3244` |
| List row hover | `background: #2e3244`, `transition: 0.12s ease` |
| Input focus | `border-color: #c8102e`, red focus ring |
| Add to Schedule | Check conflicts first → show ConflictModal if overlap → add on confirm |
| Loading | Show `<LoadingSpinner/>` centered while API call in flight |
| Empty results | Show `<EmptyState/>` with contextual title/subtitle |
| Mobile nav | Hamburger → slide-in drawer (not yet designed, implement basic) |

---

## Icons
Install and use **Lucide React**:
```bash
npm install lucide-react
```
Key icons used:
```jsx
import { Search, ChevronRight, ChevronLeft, AlertTriangle,
         Calendar, X, Star, Menu, User, LogOut } from 'lucide-react';
// All at strokeWidth={1.5} or strokeWidth={2}, size 16–20px
```

---

## Files in this Package

| File | Purpose |
|---|---|
| `README.md` | This file |
| `Screen Mockups.html` | Login/Register, Professors Browse, Schedule Builder |
| `Screen Mockups 2.html` | Courses Browse, Professor Detail, ConflictModal, EmptyState |
| `colors_and_type.css` | All CSS custom properties |
| `assets/logo-icon-dark.svg` | Calendar mark — dark backgrounds |
| `assets/logo-icon-light.svg` | Calendar mark — light backgrounds |
| `assets/logo-lockup-dark.svg` | Full wordmark lockup — dark |

> Open the HTML files in any browser as your visual reference while implementing. They are interactive — click through them to understand navigation and state changes.

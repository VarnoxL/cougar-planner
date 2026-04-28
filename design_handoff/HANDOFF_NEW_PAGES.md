# Handoff: Landing Page & Profile Page
> Addendum to the main CougarPlanner design handoff. Covers two new pages not in the original spec: `Landing Page.html` and `Profile Page.html`. Read alongside the original `README.md` for shared token and component context.

---

## Files in This Bundle
| File | Purpose |
|---|---|
| `Landing Page.html` | Full landing page redesign — interactive prototype with 3 hero variants |
| `Profile Page.html` | In-app profile/settings page — sidebar + content panel |

---

## Quick Start

```
1. Read this doc fully
2. Open Landing Page.html and Profile Page.html in a browser as visual reference
3. The Tweaks panel (bottom-right ⚙) lets you switch layout variants
4. All design tokens are the same as README.md — no new tokens needed
5. New files to create: LandingPage.jsx, ProfilePage.jsx (+ sub-panels)
```

---

## 1. Landing Page

### File: `src/pages/LandingPage.jsx`

The landing page is an **external marketing page** (cougarplanner.com), not behind auth. It has its own background color (`#0A0A0A`) and scroll behavior — it is NOT the same as the app shell.

### Overall layout
- **Full-width scrollable page**, no sidebar
- Fixed navbar on scroll (transparent → frosted glass after 20px scroll)
- Sections stacked vertically: Navbar → Hero → Features → How It Works → Stats → CTA → Footer

### Background
```css
background: #0A0A0A;
/* Subtle grid overlay on hero and navbar sections: */
background-image:
  linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
background-size: 60px 60px;
```

### Scroll-reveal animation
All non-hero sections use a scroll-reveal:
```css
@keyframes scrollIn {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
```
Trigger with IntersectionObserver at `threshold: 0.12`. Apply to each feature card, step, stat, etc.

---

### Navbar (landing-specific)
```jsx
// Height: 60px | position: fixed top-0 | z-index: 100
// Transparent when scrollY < 20
// On scroll: background rgba(10,10,10,0.92), backdrop-filter blur(12px), border-bottom 1px solid rgba(255,255,255,0.06)
// Transition: all 0.25s ease
// Left: "Cougar" (white) + "Planner" (brand red) in Space Mono 16px bold
// Right: "Sign In" text link (color #9ca3af) + "Get Started" red pill button
```

---

### Hero Section (3 variants — implement all, toggled by user preference or A/B)

#### Variant A — Editorial (default)
```
Layout: centered, full-viewport-height
Max-width: 820px centered

Elements (top to bottom):
1. Eyebrow badge — Space Mono 10px, ALL CAPS, 0.2em tracking
   "● BUILT FOR SIUE STUDENTS"
   color: #c8102e | border: 1px solid rgba(200,16,46,0.4) | padding: 5px 14px | border-radius: 2px
   Blinking dot animation: opacity 1→0.3→1, 1.5s infinite

2. H1 — Space Mono, clamp(3rem, 7vw, 5.5rem), weight 700, line-height 1.03, tracking -0.03em
   "Plan smarter.\nRegister with confidence."
   "Register" in brand red (#c8102e)

3. Subheadline — DM Sans 18px, color #9ca3af, line-height 1.7, max-width 560px, centered
   text-wrap: pretty

4. CTA row — flex, gap 12px, centered
   Primary: "Get Started — Free →" (red button, 15px DM Sans 600)
   Secondary: "Browse Courses" (ghost button, border rgba(255,255,255,0.15))

5. Feature strip — flex, gap 28px, color #6b7280, 13px
   ["Course search", "Professor ratings", "Seat availability", "Schedule builder"]
   Each prefixed with a 5×5px red dot

6. App preview mockup (optional, controlled by prop)
   820px wide centered, with a red glow beneath it
   (see App Preview spec below)

Radial red glow behind content:
  700×700px div, background radial-gradient(circle, rgba(200,16,46,0.14) 0%, transparent 65%)
  centered at 40% vertical, animated pulse 0.5→0.8 opacity, 5s infinite
```

#### Variant B — Bold Split
```
Layout: CSS grid, 2 columns (1fr 1fr), full viewport height, padTop 60px

Left column: padding 80px 60px
  - Eyebrow badge (same as A)
  - H1: "Your whole semester, planned." — Space Mono clamp(2.5rem,4.5vw,4rem)
  - Subheadline: DM Sans 16px, max-width 400px
  - CTA buttons (same as A)
  - Stats grid (2×2): 4 micro-stats below a divider line
    ["100+","Courses indexed"], ["RMP","Ratings integrated"],
    ["Real-time","Seat tracking"], ["Free","Always free"]
    Value: Space Mono 18px bold red | Label: 12px #6b7280

Right column: background #0f1117 | border-left 1px solid #2e3244
  App preview centered, full width with 40px padding
```

#### Variant C — Minimal / Typographic
```
Layout: centered, full viewport height
No grid, very minimal

- Thin vertical red line (1×80px) above content
- SIUE attribution — Space Mono 10px, 0.25em tracking, color #6b7280
- Massive stacked type:
    "Cougar" — Space Mono clamp(3.5rem,8vw,7rem), color #F5F3EF
    "Planner" — Space Mono same size, color #c8102e
    line-height: 0.95, tracking: -0.04em
- Subheadline 17px, max-width 500px
- Single large CTA button: "Get started free" 16px, padding 14px 32px
- App preview below
```

---

### App Preview Mockup Component
```jsx
// A static UI mockup — NOT a real iframe, just styled divs
// Shown inside hero to give visual context of the actual app
// Max-width: 820px centered
// Container: background #1a1d27, border 1px solid #2e3244, border-radius 10px, overflow hidden
// Box-shadow: 0 40px 80px rgba(0,0,0,0.6), plus a red glow: 0 0 60px rgba(200,16,46,0.1)

// Window chrome bar (44px, bg #0f1117, border-bottom 1px solid #2e3244):
//   Traffic light dots (12px circles): #ef4444, #eab308, #22c55e
//   Centered URL bar: bg #1a1d27, border-radius 4px, Space Mono 12px, text "cougarplanner.com"

// Fake navbar (48px, bg #0f1117, border-bottom 1px solid #2e3244):
//   Wordmark (Space Mono 13px) + nav links + avatar initials

// Content area (height 340px, padding 20px, flex row gap 12px):
//   Left: filter sidebar (180px) — 4 filter fields (Subject, Term, Credits, Delivery)
//   Right: course list — search bar + 4 course rows
//     Each course row shows: code (Space Mono red) + day pills + course name + rating badge + seats

// This is a visual prop only — no interactivity needed
// Implement as a standalone <AppPreview /> component imported in LandingPage
```

---

### Features Section
```jsx
// Section padding: 100px 40px | max-width 1100px centered
// Section label: Space Mono 10px ALL CAPS red, margin-bottom 16px
// H2: Space Mono clamp(1.8rem, 4vw, 2.8rem), color #F5F3EF, tracking -0.02em
// Subtext: DM Sans 16px, #9ca3af, max-width 500px

// 4-column grid (auto-fit minmax(240px, 1fr)), gap 20px
// Each FeatureCard:
//   bg: rgba(26,29,39,0.6) → hover #1a1d27
//   border: 1px solid #2e3244 → hover rgba(200,16,46,0.25)
//   border-radius: 10px | padding: 28px 24px
//   Transition: all 0.2s ease
//
//   Icon container: 44×44px, border-radius 8px
//     bg: rgba(200,16,46,0.1) | border: 1px solid rgba(200,16,46,0.2)
//     icon: 22×22 Lucide icon in brand red
//
//   Title: DM Sans 16px bold #e8eaed
//   Desc:  DM Sans 14px #9ca3af, line-height 1.65

// Feature cards (icon | title | description):
// Search    | "Smart Course Search"      | "Filter by subject, credits, delivery mode, day, and time..."
// Star      | "RateMyProfessors Built-In"| "See overall rating, difficulty score, and would-take-again %..."
// Calendar  | "Visual Schedule Builder"  | "Drag courses onto a weekly calendar. Conflict detection..."
// Shield    | "Live Seat Availability"   | "See open seats in real time. Color-coded so you know..."
```

---

### How It Works Section
```jsx
// bg: #0d0d0d | border-top/bottom: 1px solid #1a1d27 | padding: 80px 40px
// max-width 860px centered
// Section label + H2 same pattern as Features

// 3-column grid (auto-fit minmax(240px, 1fr)), gap 48px
// Each step: flex row, gap 24px
//   Number bubble: 48×48 circle, bg rgba(200,16,46,0.15), border 1px solid rgba(200,16,46,0.4)
//     Space Mono 18px bold red — "01", "02", "03"
//   Text: paddingTop 8px
//     Title: DM Sans 17px bold #e8eaed
//     Desc:  DM Sans 14px #9ca3af, line-height 1.65

// Steps:
// 01 | "Search & filter courses"    | "Browse the full SIUE course catalog. Filter by subject, credits, time, and delivery mode."
// 02 | "Check professors"           | "View RateMyProfessors data and grade distributions before committing to a section."
// 03 | "Build your schedule"        | "Add sections to a visual weekly calendar. Save multiple schedule options to compare."
```

---

### Stats Strip
```jsx
// padding: 80px 40px | max-width 900px centered
// 4-column grid
// Each stat: centered
//   Value: Space Mono 36px bold, color: #c8102e
//   Label: DM Sans 13px, color #6b7280, tracking 0.04em

// ["500+","Courses indexed"], ["RMP","Ratings integrated"], ["Real-time","Seat availability"], ["Free","Always, forever"]
```

---

### CTA Section
```jsx
// padding: 100px 40px | max-width 600px centered, text-align center
// H2: Space Mono clamp(2rem,5vw,3.5rem), tracking -0.03em
//   "Ready to plan smarter?" — "smarter?" in brand red
// Sub: DM Sans 16px #9ca3af
// Button: "Get Started — Free →" 16px, padding 14px 36px
// Fine print: "No credit card. SIUE email required." 13px #6b7280
```

---

### Footer
```jsx
// border-top: 1px solid #1a1d27 | padding: 32px 40px
// flex row, space-between, flex-wrap, gap 16px
// Left:  Wordmark (Space Mono 14px bold)
// Mid:   "Built by an SIUE student, for SIUE students" — 13px #6b7280
// Right: "● Coming Fall 2026" — Space Mono 12px, blinking red dot
```

---

## 2. Profile Page

### File: `src/pages/ProfilePage.jsx`

An **authenticated in-app page**, using all standard app tokens (bg `#0f1117`, card `#1a1d27`, etc). Accessible via clicking the avatar initials in the navbar.

### Route
```
/profile   →  ProfilePage
```

### Layout: Sidebar + Content Panel
```
Full-height flex row (minus navbar height)

Sidebar:   240px fixed width | bg #0d0f18 | border-right 1px solid #2e3244 | overflow-y auto
Content:   flex-1 | overflow-y auto | padding 36px 48px | bg #0f1117
```

---

### Sidebar

#### Profile Hero (top section)
```jsx
// padding: 28px 20px 24px | border-bottom: 1px solid #2e3244
// position: relative | overflow: hidden

// Background glow (decorative):
//   position absolute, top -40px left -40px, 180×180px
//   radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 65%)

// Avatar: 72×72px circle
//   bg: #252836 | border: 2px solid rgba(200,16,46,0.5)
//   Outer glow ring: position absolute inset -2px, border-radius 50%
//     bg rgba(200,16,46,0.4) | border 1px solid rgba(200,16,46,0.6)
//   Initials: Space Mono 22px bold, color: #c8102e

// Name: DM Sans 15px bold #e8eaed
// Email: DM Sans 12px #6b7280, margin-bottom 14px

// Stat pills (flex row, gap 6px, flex-wrap):
//   Year pill:  Space Mono 9px ALL CAPS, color red, bg rgba(200,16,46,0.15), border rgba(200,16,46,0.3), padding 3px 8px, radius 2px
//   Major pill: Space Mono 9px ALL CAPS, color #6b7280, bg #252836, border #2e3244

// Credits progress bar:
//   Label row: "Credits toward graduation" 11px #6b7280 + "{credits}/120" Space Mono 10px bold red
//   Bar: height 4px, bg #252836, border-radius 2px
//     Fill: width = (credits/120)*100% | bg linear-gradient(90deg, rgba(200,16,46,0.8), #c8102e)
//     Animate width on mount (transition 0.6s ease)
```

#### GPA Card (below hero section)
```jsx
// margin: 12px 16px | padding: 12px 14px
// bg: #1a1d27 | border: 1px solid #2e3244 | border-radius: 8px
// flex row space-between
// Left:  "Cumulative GPA" — 12px #6b7280
// Right: GPA value — Space Mono 16px bold #22c55e (green, always)
```

#### Nav Items
```jsx
// padding: 8px 10px
// Each item: full-width button, flex row, gap 10, padding 9px 12px, border-radius 6px
// Active state:
//   bg: rgba(200,16,46,0.15)
//   color: #e8eaed
//   border-left: 2px solid #c8102e
//   icon color: #c8102e
// Inactive state:
//   bg: transparent
//   color: #9ca3af
//   border-left: 2px solid transparent
//   icon color: #6b7280
// transition: all 0.12s

// Nav items (Lucide icons):
// User         | "Account"
// GraduationCap| "Academic Info"
// Calendar     | "My Schedules"
// Bookmark     | "Saved Courses"
// Bell         | "Notifications"
// Lock         | "Security"
```

---

### Shared Content Components

#### FormCard
```jsx
// A grouped card wrapper for related form fields
// bg: #1a1d27 | border: 1px solid #2e3244 | border-radius: 10px | padding: 24px | margin-bottom: 20px
const FormCard = ({ children }) => (
  <div style={{ background:'#1a1d27', border:'1px solid #2e3244', borderRadius:10, padding:24, marginBottom:20 }}>
    {children}
  </div>
);
```

#### SectionHeader
```jsx
// Flex row space-between, padding-bottom 20px, border-bottom 1px solid #2e3244, margin-bottom 28px
// Left: flex row gap 12px
//   Red accent bar: 3×36px, border-radius 2px, bg #c8102e, flex-shrink 0, margin-top 2px
//   Title: DM Sans 20px bold #e8eaed
//   Desc:  DM Sans 13px #6b7280
// Right: optional action button
```

#### Field (text input)
```jsx
// Label: DM Sans 12px weight-600 #9ca3af, margin-bottom 6px, letter-spacing 0.02em
// Input: full-width, bg #252836, border 1px solid #2e3244, border-radius 6px, padding 9px 13px
//   font 14px #e8eaed, outline none
//   focus: border-color #c8102e, box-shadow 0 0 0 3px rgba(200,16,46,0.12)
//   readOnly: bg rgba(37,40,54,0.5), color #6b7280, cursor default
// Hint text: 12px #6b7280, margin-top 5px
```

#### Toggle
```jsx
// Props: label, desc, checked, onChange
// Full-width row, padding 13px 0, border-bottom 1px solid #2e3244 (omit on last item in group)
// Left: label (14px weight-500 #e8eaed) + optional desc (13px #6b7280)
// Right: 40×22 pill toggle
//   checked:   bg #c8102e, border #c8102e
//   unchecked: bg #252836, border #2e3244
//   thumb: 16×16 white circle, position absolute, left: checked→20px, unchecked→2px
//   transition: background 0.2s, left 0.2s
// Entire row is clickable (onClick on outer div)
```

---

### Content Panels

#### Account Panel
```jsx
// SectionHeader: "Account" / "Manage your personal information."
// FormCard containing:
//   2-column grid (gap 24px) with:
//     Field: "Display Name" — editable
//     Field: "SIUE Email"   — readOnly, hint: "Contact your advisor to change email."
//     Field: "SIUE ID"      — readOnly, hint: "Your 9-digit Banner ID."
//   Button row: "Save Changes" (primary) + "Cancel" (ghost)

// Danger Zone (below FormCard, no card wrapper):
//   Section label: "DANGER ZONE" Space Mono 13px #6b7280 ALL CAPS tracking 0.06em
//   Row: border 1px solid rgba(239,68,68,0.25), border-radius 10px, padding 18px 20px
//     bg rgba(239,68,68,0.05), flex row space-between
//     Left: "Delete account" 14px bold #e8eaed + desc 13px #6b7280
//     Right: danger variant button "Delete Account"
```

#### Academic Info Panel
```jsx
// SectionHeader: "Academic Info" / "Used to personalize your course suggestions."
// FormCard containing:
//   2-column grid:
//     SelectField: "Major" — options: CS, Math, Physics, ME, EE, Bio, Chem, Business, Other
//     SelectField: "Year"  — options: Freshman, Sophomore, Junior, Senior, Graduate
//     Field: "Credit Hours Completed" type="number"
//     Field: "Cumulative GPA" readOnly, hint: "Pulled from SIUE records."
//   Info notice (inside FormCard, above buttons):
//     bg rgba(200,16,46,0.06), border 1px solid rgba(200,16,46,0.15), border-radius 6px, padding 12px 14px
//     flex row gap 8, Info icon (14px #6b7280) + text 13px #6b7280
//     "Academic info is only used to personalize your experience — never shared."
//   Button row: "Save Changes" (primary) + "Cancel" (ghost)
```

#### My Schedules Panel
```jsx
// SectionHeader: "My Schedules" / "All saved schedule drafts for the current term."
//   Action: "+ New Schedule" small primary button

// Schedule cards (flex column gap 10):
//   Each: bg #1a1d27, border 1px solid #2e3244 (active: border rgba(200,16,46,0.25))
//         border-radius 8px, padding 16px 18px, flex row
//   Left:
//     Name: 15px bold #e8eaed + optional "ACTIVE" badge (Space Mono 9px red pill)
//     Meta: "{n} courses · {credits} credits · Updated {date}" — 13px #6b7280
//   Right: "View" secondary button + "Duplicate" ghost button

// Empty state placeholder: 1px dashed border, padding 20px, centered text, 14px #6b7280
```

#### Saved Courses Panel
```jsx
// SectionHeader: "Saved Courses" / "Courses you've bookmarked for easy reference."

// Course rows (flex column gap 8):
//   Each: bg #1a1d27, border 1px solid #2e3244, border-radius 8px, padding 14px 18px, flex row gap 16
//   Left:
//     Header: course code (Space Mono 11px red) + DayPills component
//     Title:  DM Sans 14px bold #e8eaed
//     Time:   DM Sans 12px #6b7280
//   Right: RatingBadge + SeatsBadge (stacked, align-end)
//   Actions: "Add to Schedule" (small primary) + trash icon ghost button
```

#### Notifications Panel
```jsx
// Two groups, each with:
//   Group label: DM Sans 13px bold #6b7280 ALL CAPS tracking 0.06em
//   FormCard with 3 Toggle components (last one has no border-bottom)

// Group 1 — "SEAT & COURSE ALERTS":
//   Toggle: "Seat availability alerts" / "Notify me when a full course gets an open seat."
//   Toggle: "New course sections" / "Alert when new sections are added for saved courses."
//   Toggle: "RateMyProfessors updates" / "Notify when a saved professor gets new reviews."

// Group 2 — "SCHEDULE & REGISTRATION":
//   Toggle: "Schedule reminders" / "Reminders 7 days before add/drop deadlines."
//   Toggle: "Registration open" / "Alert when open enrollment begins for the next term."
//   Toggle: "Weekly email digest" / "A summary of your saved courses and seat changes."

// Default checked: seatAlerts ✓, scheduleReminders ✓, emailDigest ✓, registrationOpen ✓
// Default unchecked: newCourses, rmpUpdates
```

#### Security Panel
```jsx
// SectionHeader: "Security" / "Manage your password and account access."

// FormCard — Change Password:
//   Sub-label: "Change Password" DM Sans 13px bold #9ca3af
//   max-width 440px:
//     Field: "Current password" type="password"
//     Field: "New password" type="password"
//     Password strength meter (shown when new password has input):
//       Flex row: progress bar (height 3px, fill by strength) + label (Space Mono 10px ALL CAPS)
//       weak (<6 chars):   fill 33%, color #ef4444, label "WEAK"
//       fair (6-9 chars):  fill 66%, color #eab308, label "FAIR"
//       strong (10+ chars):fill 100%, color #22c55e, label "STRONG"
//     Field: "Confirm new password" type="password"
//       hint if mismatch: "⚠ Passwords do not match"
//     "Update Password" primary button

// Section label: "ACTIVE SESSIONS" Space Mono 13px #6b7280 ALL CAPS

// FormCard — Sessions:
//   Each session row: flex space-between, padding 13px 0, border-bottom (last has none)
//   Left: device icon (36×36 rounded bg #252836) + browser/OS label + location · time
//     "This device" badge on current session (Space Mono 9px red)
//   Right: "Revoke" ghost button (danger color) on non-current sessions
```

---

## Responsive Behavior

### Landing Page
| Breakpoint | Changes |
|---|---|
| `< 768px` | Split variant collapses to single column; hero text scales down; features grid 1 col |
| `< 640px` | CTA buttons stack; feature strip stacks vertically; stats grid 2×2 |

### Profile Page
| Breakpoint | Changes |
|---|---|
| `< 1024px` | Sidebar collapses; switch to tab-bar layout (horizontal tabs below profile header) |
| `< 640px`  | Tab labels hide, show icons only; content padding reduces to 20px |

#### Tab Bar Layout (mobile/narrow)
```jsx
// Profile header: flex row, padding 24px 32px
//   Avatar (56px) + name (18px bold) + email + major/year (13px #6b7280)
// Tab bar below header: flex row, border-bottom 1px solid #2e3244
//   Each tab: padding 10px 16px, font 13px, active: border-bottom 2px solid #c8102e, icon colored
// Content area: flex-1, overflow-y auto, padding 32px 24px
```

---

## Navigation Integration

### Navbar avatar → Profile
```jsx
// Clicking the avatar initials circle in the Navbar navigates to /profile
// The profile page is accessible from all authenticated pages
// On profile, clicking "Sign Out" (if exposed) clears auth and redirects to /
```

### Navbar active state
```jsx
// /profile does NOT highlight any of the main nav links (Courses, Professors, etc.)
// The avatar initials circle should have a subtle red glow ring when on /profile:
//   box-shadow: 0 0 0 2px rgba(200,16,46,0.5)
```

---

## Implementation Notes

1. **Landing page is server-rendered friendly** — avoid client-only hooks in top-level sections for SEO
2. **Profile state** — use React context or a `/me` API endpoint to populate user data (name, email, SIUE ID, major, year, credits, GPA). Don't hardcode.
3. **Save actions** — call the appropriate API endpoints on Save Changes. Show a success toast (use the Toast component when implemented).
4. **Password change** — call Firebase Auth's `updatePassword()` — requires recent authentication; handle the "requires-recent-login" error with a re-auth modal.
5. **Active sessions** — if not implementing a sessions API, show only "This device" row as a static placeholder.
6. **Notification preferences** — persist to user profile in Firestore or PostgreSQL. Debounce toggle saves (500ms).
7. **Landing page hero variant** — ship the Editorial variant (A) as the default. The Split and Minimal variants are design explorations, not required for MVP.

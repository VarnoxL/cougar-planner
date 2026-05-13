import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const AC = '#c8102e'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible') }),
      { threshold: 0.12 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

const IconSearch = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const IconStar = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconCal = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconShield = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)

function PrimaryBtn({ to, children, size = 'md' }) {
  const [hov, setHov] = useState(false)
  const pad = size === 'lg' ? '14px 36px' : '12px 24px'
  const fs = size === 'lg' ? 16 : 15
  return (
    <Link to={to} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: fs, padding: pad, borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: hov ? '#a50e26' : AC, color: '#fff', transition: 'all 0.15s ease', boxShadow: hov ? `0 0 24px ${AC}55` : 'none' }}>
      {children}
    </Link>
  )
}

function SecondaryBtn({ to, children }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, padding: '12px 24px', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)', color: '#e8eaed', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', transition: 'all 0.15s ease' }}>
      {children}
    </Link>
  )
}

function AppPreview() {
  return (
    <div style={{ width: '100%', maxWidth: 820, margin: '0 auto', background: '#1a1d27', border: '1px solid #2e3244', borderRadius: 10, overflow: 'hidden', boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 60px ${AC}18` }}>
      {/* Window chrome */}
      <div style={{ background: '#0f1117', borderBottom: '1px solid #2e3244', padding: '0 16px', height: 44, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#1a1d27', borderRadius: 4, padding: '4px 16px', fontSize: 12, color: '#6b7280', fontFamily: "'Space Mono', monospace" }}>cougarplanner.com</div>
        </div>
      </div>
      {/* Mock navbar */}
      <div style={{ background: '#0f1117', borderBottom: '1px solid #2e3244', padding: '0 20px', height: 48, display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: '#e8eaed' }}>Cougar<span style={{ color: AC }}>Planner</span></span>
        {['Courses', 'Professors', 'Schedule'].map(l => (
          <span key={l} style={{ fontSize: 13, color: l === 'Courses' ? '#e8eaed' : '#6b7280', fontWeight: l === 'Courses' ? 600 : 400 }}>{l}</span>
        ))}
        <div style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: '50%', background: '#252836', border: '1px solid #2e3244', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono', monospace", fontSize: 10, color: AC, fontWeight: 700 }}>AJ</div>
      </div>
      {/* Content */}
      <div style={{ padding: 20, display: 'flex', gap: 12, height: 340 }}>
        {/* Sidebar */}
        <div style={{ width: 180, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Filters</div>
          {[['Subject', 'Computer Science'], ['Term', 'Spring 2026'], ['Credits', '3 Hours'], ['Delivery', 'In Person']].map(([l, v]) => (
            <div key={l} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{l}</div>
              <div style={{ background: '#252836', border: '1px solid #2e3244', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: '#9ca3af' }}>{v}</div>
            </div>
          ))}
        </div>
        {/* Course list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'hidden' }}>
          <div style={{ background: '#252836', border: '1px solid #2e3244', borderRadius: 6, padding: '0 12px', height: 36, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <svg width="14" height="14" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Search courses…</span>
          </div>
          {[
            { code: 'CS 201', name: 'Intro to Programming', rating: 4.6, seats: '22/30', days: ['M','W','F'], hi: true },
            { code: 'CS 315', name: 'Data Structures',      rating: 3.2, seats: '5/25',  days: ['T','R'],     hi: false },
            { code: 'MATH 150', name: 'Calculus I',         rating: 4.1, seats: '0/35',  days: ['M','W','F'], hi: false },
            { code: 'CS 425', name: 'Algorithms',           rating: 3.8, seats: '12/20', days: ['M','W'],     hi: false },
          ].map((c, i) => (
            <div key={c.code} style={{ background: i === 0 ? '#2e3244' : '#1a1d27', border: `1px solid ${i === 0 ? AC + '40' : '#2e3244'}`, borderRadius: 6, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: AC }}>{c.code}</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {['M','T','W','R','F'].map(d => (
                      <span key={d} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 9999, background: c.days.includes(d) ? AC : '#252836', color: c.days.includes(d) ? '#fff' : '#6b7280', fontWeight: 600 }}>{d}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e8eaed' }}>{c.name}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: c.rating >= 4 ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.12)', color: c.rating >= 4 ? '#22c55e' : '#eab308' }}>{c.rating}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#6b7280' }}>{c.seats}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  const [hov, setHov] = useState(false)
  return (
    <div className="lp-reveal" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? '#1a1d27' : 'rgba(26,29,39,0.6)', border: `1px solid ${hov ? AC + '40' : '#2e3244'}`, borderRadius: 10, padding: '28px 24px', transition: 'all 0.2s ease' }}>
      <div style={{ width: 44, height: 44, borderRadius: 8, background: `${AC}18`, border: `1px solid ${AC}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: AC }}>
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#e8eaed', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.65 }}>{desc}</div>
    </div>
  )
}

function Step({ n, title, desc }) {
  return (
    <div className="lp-reveal" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${AC}15`, border: `1px solid ${AC}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Space Mono', monospace", fontSize: 18, fontWeight: 700, color: AC }}>{n}</div>
      <div style={{ paddingTop: 8 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#e8eaed', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.65 }}>{desc}</div>
      </div>
    </div>
  )
}

function Stat({ val, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 36, fontWeight: 700, color: AC, lineHeight: 1.1, marginBottom: 6 }}>{val}</div>
      <div style={{ fontSize: 13, color: '#6b7280', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  )
}

export default function LandingPage() {
  useReveal()

  return (
    <>
      <style>{`
        @keyframes lp-fade-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lp-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes lp-glow-pulse { 0%,100% { opacity: 0.5; transform: translate(-50%,-50%) scale(1); } 50% { opacity: 0.8; transform: translate(-50%,-50%) scale(1.08); } }
        @keyframes lp-scroll-in { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        .lp-reveal { opacity: 0; }
        .lp-reveal.lp-visible { animation: lp-scroll-in 0.6s ease forwards; }
        .lp-a1 { animation: lp-fade-up 0.7s ease 0.1s both; }
        .lp-a2 { animation: lp-fade-up 0.7s ease 0.25s both; }
        .lp-a3 { animation: lp-fade-up 0.7s ease 0.4s both; }
        .lp-a4 { animation: lp-fade-up 0.7s ease 0.55s both; }
        .lp-a5 { animation: lp-fade-up 0.7s ease 0.7s both; }
        .lp-blink { animation: lp-blink 1.5s ease infinite; }
        .lp-glow { animation: lp-glow-pulse 5s ease-in-out infinite; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', minHeight: 'calc(100vh - 4rem)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '80px 40px 80px', overflow: 'hidden',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}>
        <div className="lp-glow" style={{ position: 'absolute', width: 700, height: 700, background: `radial-gradient(circle, ${AC}14 0%, transparent 65%)`, borderRadius: '50%', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 820, marginBottom: 80 }}>
          <div className="lp-a1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: AC, border: `1px solid ${AC}40`, padding: '5px 14px', borderRadius: 2, marginBottom: 36 }}>
            <span className="lp-blink" style={{ width: 6, height: 6, background: AC, borderRadius: '50%', display: 'inline-block' }} />
            Built for SIUE students
          </div>

          <h1 className="lp-a2" style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 700, lineHeight: 1.03, letterSpacing: '-0.03em', color: '#F5F3EF', marginBottom: 28 }}>
            Plan smarter.<br />
            <span style={{ color: AC }}>Register</span> with confidence.
          </h1>

          <p className="lp-a3" style={{ fontSize: 18, color: '#9ca3af', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
            Search SIUE courses, check RateMyProfessors data, and build conflict-free schedules — all in one place. No more tab-switching.
          </p>

          <div className="lp-a4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PrimaryBtn to="/register">Get Started — Free <IconArrow /></PrimaryBtn>
            <SecondaryBtn to="/courses">Browse Courses</SecondaryBtn>
          </div>

          <div className="lp-a5" style={{ marginTop: 32, display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Course search', 'Professor ratings', 'Seat availability', 'Schedule builder'].map(f => (
              <span key={f} style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 5, height: 5, background: AC, borderRadius: '50%', display: 'inline-block' }} />
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="lp-a5" style={{ width: '100%', maxWidth: 900, position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: '90%', height: 60, background: `radial-gradient(ellipse, ${AC}20 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />
          <AppPreview />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: AC, marginBottom: 16 }}>Features</div>
          <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 700, color: '#F5F3EF', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Everything you need<br />to plan your semester
          </h2>
          <p style={{ fontSize: 16, color: '#9ca3af', maxWidth: 500, margin: '0 auto' }}>Built to replace the dozen tabs you open every registration season.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          <FeatureCard icon={<IconSearch />} title="Smart Course Search" desc="Filter by subject, credits, delivery mode, day, and time. Find exactly what fits your schedule." />
          <FeatureCard icon={<IconStar />} title="RateMyProfessors Built-In" desc="See overall rating, difficulty score, and would-take-again % without ever leaving the page." />
          <FeatureCard icon={<IconCal />} title="Visual Schedule Builder" desc="Drag courses onto a weekly calendar. Conflict detection prevents accidental overlaps." />
          <FeatureCard icon={<IconShield />} title="Live Seat Availability" desc="See open seats in real time. Color-coded so you know at a glance if a section is closing." />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 40px', background: '#0d0d0d', borderTop: '1px solid #1a1d27', borderBottom: '1px solid #1a1d27' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: AC, marginBottom: 16 }}>How it works</div>
            <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 700, color: '#F5F3EF', letterSpacing: '-0.02em' }}>
              Three steps to a conflict-free semester
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 48 }}>
            <Step n="01" title="Search & filter courses" desc="Browse the full SIUE course catalog. Filter by subject, credits, time, and delivery mode." />
            <Step n="02" title="Check professors" desc="View RateMyProfessors data and grade distributions before committing to a section." />
            <Step n="03" title="Build your schedule" desc="Add sections to a visual weekly calendar. Save multiple schedule options to compare." />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="lp-reveal" style={{ padding: '80px 40px', maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
        <Stat val="500+" label="Courses indexed" />
        <Stat val="RMP" label="Ratings integrated" />
        <Stat val="Real‑time" label="Seat availability" />
        <Stat val="Free" label="Always, forever" />
      </section>

      {/* ── CTA ── */}
      <section className="lp-reveal" style={{ padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F5F3EF', marginBottom: 20, lineHeight: 1.1 }}>
            Ready to plan<br /><span style={{ color: AC }}>smarter?</span>
          </h2>
          <p style={{ fontSize: 16, color: '#9ca3af', marginBottom: 36 }}>
            Join SIUE students who use CougarPlanner every registration season.
          </p>
          <PrimaryBtn to="/register" size="lg">Get Started — Free <IconArrow /></PrimaryBtn>
          <div style={{ marginTop: 20, fontSize: 13, color: '#6b7280' }}>Free for all SIUE students.</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #1a1d27', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700, color: '#e8eaed' }}>
          Cougar<span style={{ color: AC }}>Planner</span>
        </span>
        <div style={{ fontSize: 13, color: '#6b7280' }}>Built by an SIUE student, for SIUE students</div>
        <div style={{ fontSize: 12, color: '#6b7280', fontFamily: "'Space Mono', monospace" }}>
          <span className="lp-blink" style={{ color: AC, marginRight: 6 }}>●</span>
          Coming Fall 2026
        </div>
      </footer>
    </>
  )
}

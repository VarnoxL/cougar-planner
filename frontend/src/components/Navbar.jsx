import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navLinks = [
  { to: '/courses', label: 'Courses' },
  { to: '/professors', label: 'Professors' },
  { to: '/schedules', label: 'Schedules' },
]

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `text-sm font-medium transition-colors ${
          isActive
            ? 'text-c-red underline underline-offset-4 decoration-c-red/40'
            : 'text-text-secondary hover:text-text-primary'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const [open, setOpen] = useState(false)

  function close() {
    setOpen(false)
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-bg-primary">
      <div className="mx-auto max-w-screen-2xl px-4 h-14 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Cougar Planner">
          {/* Icon */}
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="4" y="9" width="32" height="26" rx="4" fill="#e8eaed" fillOpacity="0.07" stroke="#e8eaed" strokeOpacity="0.2" strokeWidth="1.5" />
            <rect x="4" y="9" width="32" height="10" rx="4" fill="#c8102e" />
            <rect x="4" y="15" width="32" height="4" fill="#c8102e" />
            <rect x="13" y="5.5" width="2.5" height="7" rx="1.25" fill="#e8eaed" fillOpacity="0.5" />
            <rect x="24.5" y="5.5" width="2.5" height="7" rx="1.25" fill="#e8eaed" fillOpacity="0.5" />
            <line x1="4" y1="19" x2="36" y2="19" stroke="#e8eaed" strokeOpacity="0.15" strokeWidth="1" />
            <circle cx="11" cy="27" r="3" fill="#e8eaed" fillOpacity="0.35" />
            <circle cx="20" cy="27" r="3.5" fill="#c8102e" />
            <circle cx="29" cy="27" r="3" fill="#e8eaed" fillOpacity="0.35" />
            <path d="M11 27 Q15.5 23 20 27 Q24.5 31 29 27" stroke="#e8eaed" strokeOpacity="0.25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="20" cy="27" r="5.5" stroke="#c8102e" strokeOpacity="0.3" strokeWidth="1" />
          </svg>
          {/* Wordmark — hidden on mobile */}
          <span className="hidden md:inline font-mono font-bold text-lg tracking-tight"><span className="text-text-primary">Cougar</span><span className="text-c-red">Planner</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <NavItem key={l.to} to={l.to} label={l.label} />
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Link
                to="/profile"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors truncate max-w-[140px]"
              >
                {user.displayName || user.email}
              </Link>
              <button
                onClick={logout}
                className="text-sm px-3 py-1.5 rounded border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm px-3 py-1.5 rounded bg-c-red hover:opacity-90 text-white font-medium transition-opacity"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden border-t border-border bg-bg-card overflow-hidden transition-[max-height] duration-300 ease-in-out ${open ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-4 py-4 flex flex-col gap-4">
          {navLinks.map((l) => (
            <NavItem key={l.to} to={l.to} label={l.label} onClick={close} />
          ))}
          <div className="border-t border-border pt-4 flex flex-col gap-3">
            {loading ? null : user ? (
              <>
                <Link
                  to="/profile"
                  onClick={close}
                  className="text-sm text-text-secondary hover:text-text-primary truncate"
                >
                  {user.displayName || user.email}
                </Link>
                <button
                  onClick={() => { close(); logout() }}
                  className="text-sm text-left text-text-secondary hover:text-text-primary"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={close}
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={close}
                  className="text-sm text-c-red font-medium"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

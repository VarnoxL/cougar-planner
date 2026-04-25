import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navLinks = [
  { to: '/courses', label: 'Courses' },
  { to: '/professors', label: 'Professors' },
]

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `text-sm font-medium transition-colors ${
          isActive
            ? 'text-c-red'
            : 'text-text-secondary hover:text-text-primary'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  function close() {
    setOpen(false)
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-bg-primary">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <span className="text-c-red font-bold text-lg leading-none">Cougar</span>
          <span className="text-text-primary font-semibold text-lg leading-none">Planner</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <NavItem key={l.to} to={l.to} label={l.label} />
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/schedules"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                My Schedules
              </Link>
              <Link
                to="/profile"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
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
                className="text-sm px-3 py-1.5 rounded bg-c-red hover:bg-c-red-hover text-white font-medium transition-colors"
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
      {open && (
        <div className="md:hidden border-t border-border bg-bg-card px-4 py-4 flex flex-col gap-4">
          {navLinks.map((l) => (
            <NavItem key={l.to} to={l.to} label={l.label} onClick={close} />
          ))}
          <div className="border-t border-border pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  to="/schedules"
                  onClick={close}
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  My Schedules
                </Link>
                <Link
                  to="/profile"
                  onClick={close}
                  className="text-sm text-text-secondary hover:text-text-primary"
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
      )}
    </header>
  )
}

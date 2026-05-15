import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navLinks = [
  { to: '/courses',    label: 'Courses' },
  { to: '/professors', label: 'Professors' },
  { to: '/schedules',  label: 'Schedules' },
]

function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0">
      <rect x="12" y="4" width="3" height="7" rx="1.5" fill="#9ca3af"/>
      <rect x="25" y="4" width="3" height="7" rx="1.5" fill="#9ca3af"/>
      <rect x="5" y="8" width="30" height="28" rx="4" fill="#1a1d27" stroke="#2e3244" strokeWidth="1"/>
      <path d="M5 12 a4 4 0 0 1 4 -4 h22 a4 4 0 0 1 4 4 v4 h-30 z" fill="#c8102e"/>
      <rect x="22" y="22" width="8" height="8" rx="1.5" fill="#c8102e"/>
      <circle cx="11"   cy="22" r="1.2" fill="#6b7280"/>
      <circle cx="16.5" cy="22" r="1.2" fill="#6b7280"/>
      <circle cx="11"   cy="27" r="1.2" fill="#6b7280"/>
      <circle cx="16.5" cy="27" r="1.2" fill="#6b7280"/>
      <circle cx="11"   cy="32" r="1.2" fill="#6b7280"/>
      <circle cx="16.5" cy="32" r="1.2" fill="#6b7280"/>
    </svg>
  )
}

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return '?'
  const base = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail
  const parts = base.replace(/[._-]+/g, ' ').trim().split(/\s+/)
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'text-sm font-medium px-3 py-1.5 rounded-md transition-colors',
          isActive
            ? 'text-text-primary bg-bg-card border border-border'
            : 'text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-card/60',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

function MobileNavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'block text-sm font-medium px-3 py-2 rounded-md transition-colors',
          isActive
            ? 'text-text-primary bg-bg-card border border-border'
            : 'text-text-secondary border border-transparent hover:text-text-primary',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuRef = useRef(null)

  const hasUnread = false

  useEffect(() => {
    if (!menuOpen) return
    function onDown(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    function onKey(e)  { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  function closeDrawer() { setDrawerOpen(false) }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-bg-primary">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 h-[60px] flex items-center gap-6">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Cougar Planner">
          <LogoMark size={28} />
          <span className="hidden sm:inline font-mono font-bold text-base tracking-tight leading-none whitespace-nowrap">
            <span className="text-text-primary">Cougar</span><span className="text-c-red">Planner</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(l => <NavItem key={l.to} {...l} />)}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-3">

          {!loading && user && (
            <>
              {/* Notifications bell */}
              <button
                type="button"
                aria-label="Notifications"
                className="relative h-8 w-8 rounded-md border border-border text-text-secondary hover:text-text-primary hover:bg-bg-card/60 transition-colors flex items-center justify-center"
              >
                <Bell size={16} strokeWidth={1.7} />
                {hasUnread && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-c-red ring-2 ring-bg-primary" />
                )}
              </button>

              {/* Profile pill + dropdown */}
              <div ref={menuRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setMenuOpen(v => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-bg-card border border-border hover:border-text-muted transition-colors"
                >
                  <span className="h-[26px] w-[26px] rounded-full bg-bg-input border border-border flex items-center justify-center font-mono font-bold text-[10px] text-c-red uppercase">
                    {getInitials(user.displayName || user.email)}
                  </span>
                  <span className="text-[13px] font-medium text-text-primary max-w-[120px] truncate">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={12} className="text-text-muted" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-bg-card shadow-lg overflow-hidden"
                  >
                    <div className="px-3 py-2.5 border-b border-border">
                      <div className="text-[13px] font-semibold text-text-primary truncate">{user.displayName || user.email}</div>
                      {user.displayName && <div className="text-[11px] text-text-muted truncate">{user.email}</div>}
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                    >
                      <User size={14} /> Profile
                    </Link>
                    <button
                      onClick={() => { setMenuOpen(false); logout() }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                    >
                      <LogOut size={14} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Logged-out: Log in + Sign up */}
          {!loading && !user && (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm text-text-secondary hover:text-text-primary px-3 py-1.5 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm px-3 py-1.5 rounded-md bg-c-red hover:opacity-90 text-white font-semibold transition-opacity"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden text-text-secondary hover:text-text-primary transition-colors h-8 w-8 flex items-center justify-center"
            onClick={() => setDrawerOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden border-t border-border bg-bg-card overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          drawerOpen ? 'max-h-[480px]' : 'max-h-0'
        }`}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {navLinks.map(l => (
            <MobileNavItem key={l.to} {...l} onClick={closeDrawer} />
          ))}

          <div className="border-t border-border mt-2 pt-3 flex flex-col gap-1">
            {!loading && user ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeDrawer}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                >
                  <span className="h-7 w-7 rounded-full bg-bg-input border border-border flex items-center justify-center font-mono font-bold text-[10px] text-c-red uppercase">
                    {getInitials(user.displayName || user.email)}
                  </span>
                  <span className="text-sm font-medium truncate">{user.displayName || user.email}</span>
                </Link>
                <button
                  onClick={() => { closeDrawer(); logout() }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary text-left"
                >
                  <LogOut size={14} /> Log out
                </button>
              </>
            ) : !loading && (
              <>
                <Link
                  to="/login"
                  onClick={closeDrawer}
                  className="block px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={closeDrawer}
                  className="block text-center text-sm font-semibold px-3 py-2 rounded-md bg-c-red text-white"
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

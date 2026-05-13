import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateUser } from '../api/users'
import LoadingSpinner from '../components/LoadingSpinner'

const SIUE_MAJORS = [
  'Accountancy',
  'Anthropology',
  'Applied Communication Studies',
  'Art',
  'Art Education',
  'Art History',
  'Art Studio',
  'Art and Design',
  'Biological Sciences',
  'Business Administration',
  'Chemistry',
  'Civil Engineering',
  'Computer Engineering',
  'Computer Science',
  'Construction Management',
  'Criminal Justice Studies',
  'Cybersecurity Engineering',
  'Early Childhood Education',
  'Economics',
  'Elementary Education',
  'English',
  'Environmental Sciences',
  'Exercise Science',
  'Foreign Languages and Literature',
  'Geography',
  'History',
  'Industrial Engineering',
  'Integrative Studies',
  'International Studies',
  'Liberal Studies',
  'Mass Communications',
  'Mathematical Studies',
  'Mechanical Engineering',
  'Mechatronics & Robotics Engineering',
  'Music',
  'Nursing',
  'Nutrition',
  'Pharmacy',
  'Philosophy',
  'Physics',
  'Political Science',
  'Psychology',
  'Public Health',
  'Secondary Education',
  'Social Work',
  'Sociology',
  'Special Education',
  'Speech-Language Pathology and Audiology',
  'Surveying and Geomatics',
  'Theater and Dance',
]

const NAV_ITEMS = [
  {
    id: 'account', label: 'Account',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/></svg>,
  },
  {
    id: 'academic', label: 'Academic Info',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  },
  {
    id: 'schedules', label: 'My Schedules',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    id: 'saved', label: 'Saved Courses',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
  },
  {
    id: 'notifications', label: 'Notifications',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  },
  {
    id: 'security', label: 'Security',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  },
]

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function SectionHeader({ title, desc }) {
  return (
    <div className="mb-7 pb-5 border-b border-border flex items-start gap-3">
      <div className="w-0.5 h-9 rounded-sm bg-c-red shrink-0 mt-0.5" />
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-1">{title}</h2>
        {desc && <p className="text-[13px] text-text-muted">{desc}</p>}
      </div>
    </div>
  )
}

function FormCard({ children }) {
  return (
    <div className="bg-bg-card border border-border rounded-lg p-6 mb-5">
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, readOnly, hint, type = 'text' }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-text-secondary mb-1.5 tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full border border-border rounded-md px-3 py-2 text-sm outline-none transition-colors ${
          readOnly
            ? 'bg-bg-input/50 text-text-muted cursor-default'
            : 'bg-bg-input text-text-primary focus:border-c-red'
        }`}
      />
      {hint && <div className="text-[12px] text-text-muted mt-1.5">{hint}</div>}
    </div>
  )
}

function AccountPanel({ displayName, setDisplayName, email, onSave, saving, error, success }) {
  return (
    <div>
      <SectionHeader title="Account" desc="Manage your personal information." />
      <FormCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="Display Name" value={displayName} onChange={v => { setDisplayName(v) }} placeholder="Your name" />
          <Field label="Email" value={email} readOnly />
        </div>
        {error && <p className="text-[12px] text-rating-red mb-3">{error}</p>}
        {success && <p className="text-[12px] text-rating-green mb-3">Saved.</p>}
        <div className="flex gap-2 mt-1">
          <button
            onClick={onSave}
            disabled={saving || !displayName.trim()}
            className="bg-c-red text-white text-[13px] font-semibold px-4 py-2 rounded-md hover:bg-c-red-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </FormCard>

      <div>
        <div className="text-[11px] font-semibold text-text-muted tracking-widest uppercase mb-3">Danger Zone</div>
        <div className="rounded-lg px-5 py-4 flex items-center justify-between gap-4" style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.05)' }}>
          <div>
            <div className="text-sm font-semibold text-text-primary mb-0.5">Delete account</div>
            <div className="text-[13px] text-text-muted">Permanently remove your account and all saved data.</div>
          </div>
          <button className="text-[13px] font-semibold px-4 py-2 rounded-md shrink-0 transition-colors" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

function AcademicPanel({ major, setMajor, onSave, saving, error, success }) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = major.trim()
    ? SIUE_MAJORS.filter(m => m.toLowerCase().includes(major.toLowerCase()) && m.toLowerCase() !== major.toLowerCase())
    : []

  return (
    <div>
      <SectionHeader title="Academic Info" desc="Used to personalize your course suggestions." />
      <FormCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 tracking-wide">Major</label>
            <div className="relative">
              <input
                type="text"
                value={major}
                onChange={e => { setMajor(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                maxLength={255}
                placeholder="Type your major"
                className="w-full bg-bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:border-c-red focus:outline-none transition-colors"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 top-full mt-1 w-full bg-bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.slice(0, 8).map(m => (
                    <li
                      key={m}
                      onMouseDown={() => { setMajor(m); setShowSuggestions(false) }}
                      className="px-3 py-2 text-sm text-text-primary hover:bg-bg-input cursor-pointer"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="mb-5 px-3 py-3 rounded-md flex items-start gap-2" style={{ background: 'rgba(200,16,46,0.06)', border: '1px solid rgba(200,16,46,0.15)' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-text-muted shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span className="text-[13px] text-text-muted">Academic info is only used to personalize your experience — never shared.</span>
        </div>

        {error && <p className="text-[12px] text-rating-red mb-3">{error}</p>}
        {success && <p className="text-[12px] text-rating-green mb-3">Saved.</p>}
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-c-red text-white text-[13px] font-semibold px-4 py-2 rounded-md hover:bg-c-red-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </FormCard>
    </div>
  )
}

function ComingSoonPanel({ title, desc }) {
  return (
    <div>
      <SectionHeader title={title} desc={desc} />
      <div className="border border-dashed border-border rounded-lg p-12 text-center text-text-muted text-sm">
        Coming soon.
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, dbUser } = useAuth()
  const [section, setSection] = useState('account')

  const [displayName, setDisplayName] = useState(() => dbUser?.display_name ?? '')
  const [major, setMajor] = useState(() => dbUser?.major ?? '')

  const [accountSaving, setAccountSaving] = useState(false)
  const [accountError, setAccountError] = useState(null)
  const [accountSuccess, setAccountSuccess] = useState(false)

  const [academicSaving, setAcademicSaving] = useState(false)
  const [academicError, setAcademicError] = useState(null)
  const [academicSuccess, setAcademicSuccess] = useState(false)

  if (!dbUser) return <LoadingSpinner />

  async function saveAccount() {
    setAccountError(null)
    setAccountSuccess(false)
    setAccountSaving(true)
    try {
      await updateUser(dbUser.id, { display_name: displayName.trim() })
      setAccountSuccess(true)
      setTimeout(() => setAccountSuccess(false), 3000)
    } catch (err) {
      setAccountError(err.body?.error || err.message || 'Save failed.')
    } finally {
      setAccountSaving(false)
    }
  }

  async function saveAcademic() {
    setAcademicError(null)
    setAcademicSuccess(false)
    setAcademicSaving(true)
    try {
      await updateUser(dbUser.id, { major: major.trim() })
      setAcademicSuccess(true)
      setTimeout(() => setAcademicSuccess(false), 3000)
    } catch (err) {
      setAcademicError(err.body?.error || err.message || 'Save failed.')
    } finally {
      setAcademicSaving(false)
    }
  }

  const initials = getInitials(displayName || user?.email || '?')
  const memberSince = dbUser.created_at
    ? new Date(dbUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    : '—'

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Sidebar */}
      <div className="w-60 shrink-0 border-r border-border flex flex-col overflow-y-auto" style={{ background: '#0d0f18' }}>
        {/* Profile hero */}
        <div className="px-5 pt-7 pb-6 border-b border-border relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(200,16,46,0.12) 0%, transparent 65%)' }} />
          <div className="relative">
            <div className="relative w-[72px] h-[72px] mb-3.5">
              <div className="absolute inset-[-2px] rounded-full" style={{ background: 'rgba(200,16,46,0.25)', border: '1px solid rgba(200,16,46,0.4)' }} />
              <div className="relative w-full h-full rounded-full bg-bg-input flex items-center justify-center font-mono text-[22px] font-bold text-c-red" style={{ border: '2px solid rgba(200,16,46,0.3)' }}>
                {initials}
              </div>
            </div>
            <div className="text-[15px] font-bold text-text-primary mb-0.5 truncate">{displayName || '—'}</div>
            <div className="text-xs text-text-muted mb-3.5 truncate">{user?.email ?? '—'}</div>
            <div className="flex gap-1.5 flex-wrap">
              {major && (
                <span className="font-mono text-[9px] tracking-widest uppercase text-c-red px-2 py-0.5 rounded-sm" style={{ background: 'rgba(200,16,46,0.12)', border: '1px solid rgba(200,16,46,0.25)' }}>
                  {major.split(' ')[0]}
                </span>
              )}
              <span className="font-mono text-[9px] tracking-widest uppercase text-text-muted bg-bg-input border border-border px-2 py-0.5 rounded-sm">
                SIUE
              </span>
            </div>
          </div>
        </div>

        {/* Member since */}
        <div className="mx-4 my-3 px-3 py-3 bg-bg-card border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs text-text-muted">Member since</span>
          <span className="font-mono text-[11px] font-bold text-text-secondary">{memberSince}</span>
        </div>

        {/* Nav */}
        <nav className="px-2.5 py-2 flex-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-medium text-left mb-0.5 transition-all border-l-2 ${
                section === item.id
                  ? 'text-text-primary border-c-red'
                  : 'text-text-secondary border-transparent hover:bg-bg-input'
              }`}
              style={section === item.id ? { background: 'rgba(200,16,46,0.1)' } : {}}
            >
              <span className={section === item.id ? 'text-c-red' : 'text-text-muted'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-9 bg-bg-primary">
        {section === 'account' && (
          <AccountPanel
            displayName={displayName}
            setDisplayName={setDisplayName}
            email={user?.email ?? '—'}
            onSave={saveAccount}
            saving={accountSaving}
            error={accountError}
            success={accountSuccess}
          />
        )}
        {section === 'academic' && (
          <AcademicPanel
            major={major}
            setMajor={setMajor}
            onSave={saveAcademic}
            saving={academicSaving}
            error={academicError}
            success={academicSuccess}
          />
        )}
        {section === 'schedules' && <ComingSoonPanel title="My Schedules" desc="All saved schedule drafts for the current term." />}
        {section === 'saved' && <ComingSoonPanel title="Saved Courses" desc="Courses you've bookmarked for easy reference." />}
        {section === 'notifications' && <ComingSoonPanel title="Notifications" desc="Control how and when CougarPlanner contacts you." />}
        {section === 'security' && <ComingSoonPanel title="Security" desc="Manage your password and account access." />}
      </div>
    </div>
  )
}

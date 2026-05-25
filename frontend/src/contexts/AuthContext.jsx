import { createContext, useContext, useEffect, useState } from 'react'
import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from 'firebase/auth'
import apiFetch from '../api/client'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

const auth = getAuth(app)

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.emailVerified) {
          try {
            const record = await apiFetch('/api/users', { method: 'POST' })
            setDbUser(record)
            setAuthError(null)
          } catch (err) {
            setDbUser(null)
            setAuthError(err.body?.error || err.message || 'Account setup failed. Please refresh.')
          }
        } else {
          setDbUser(null)
          setAuthError(null)
        }
      } else {
        setDbUser(null)
        setAuthError(null)
      }
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function register(email, password) {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
    await sendEmailVerification(newUser)
  }

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await signOut(auth)
  }

  async function resendVerification() {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser)
  }

  async function checkVerification() {
    if (!auth.currentUser) return false
    await auth.currentUser.reload()
    if (auth.currentUser.emailVerified) {
      try {
        const record = await apiFetch('/api/users', { method: 'POST' })
        setDbUser(record)
        setAuthError(null)
      } catch (err) {
        setDbUser(null)
        setAuthError(err.body?.error || err.message || 'Account setup failed. Please refresh.')
      }
      setUser({ ...auth.currentUser })
    }
    return auth.currentUser.emailVerified
  }

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, authError, login, register, logout, resendVerification, checkVerification }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

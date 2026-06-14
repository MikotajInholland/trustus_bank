// @summary JWT auth state and login/logout helpers.
import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const email = localStorage.getItem('email')
    const approved = localStorage.getItem('approved') === 'true'
    return token ? { token, role, email, approved } : null
  })

  const value = useMemo(() => ({
    auth,
    login: (payload) => {
      localStorage.setItem('token', payload.token)
      localStorage.setItem('role', payload.role)
      localStorage.setItem('email', payload.email)
      localStorage.setItem('approved', String(payload.approved))
      setAuth(payload)
    },
    logout: () => {
      localStorage.clear()
      setAuth(null)
    },
  }), [auth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

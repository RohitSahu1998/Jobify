import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('candidate_profile')
    setUser(null)
  }

  // candidate profile helpers
  const saveProfile = (profile) => {
    localStorage.setItem('candidate_profile', JSON.stringify(profile))
  }

  const getProfile = () => {
    const p = localStorage.getItem('candidate_profile')
    return p ? JSON.parse(p) : null
  }

  return { user, login, logout, saveProfile, getProfile }
}

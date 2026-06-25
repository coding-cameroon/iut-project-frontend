import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import apiService from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.login(credentials)
      const { user: userData, token } = response
      
      localStorage.setItem('token', token)
      setUser(userData)
      
      return userData
    } catch (err) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [])

  const register = useCallback(async (userData) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.register(userData)
      const { user: userResult, token } = response
      
      localStorage.setItem('token', token)
      setUser(userResult)
      
      return userResult
    } catch (err) {
      setError(err.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const userData = await apiService.getCurrentUser()
      setUser(userData)
    } catch (err) {
      console.error('Auth check failed:', err)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    checkAuth,
    clearError,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

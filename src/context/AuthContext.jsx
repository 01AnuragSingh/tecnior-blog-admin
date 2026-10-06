import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('tecnior_admin_user')
    const token = localStorage.getItem('tecnior_access_token')

    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }

    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await authApi.login(username, password)

      const userData = response.data

      const loggedInUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
      }

      localStorage.setItem(
        'tecnior_admin_user',
        JSON.stringify(loggedInUser),
      )

      localStorage.setItem(
        'tecnior_access_token',
        userData.accessToken,
      )

      localStorage.setItem(
        'tecnior_refresh_token',
        userData.refreshToken,
      )

      setUser(loggedInUser)

      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Unable to sign in. Please check your credentials.',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('tecnior_admin_user')
    localStorage.removeItem('tecnior_access_token')
    localStorage.removeItem('tecnior_refresh_token')

    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
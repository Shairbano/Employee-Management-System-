import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'

const RoleBasedRoutes = ({ children, requiredRole }) => {

  const { user, loading } = useAuth()

  // 1. Wait for verification
  if (loading) {
    return <div>Loading...</div>
  }

  // 2. If not logged in → login
  if (!user) {
    return <Navigate to="/login" />
  }

  // 3. Role check
  if (!requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" />
  }

  // 4. Everything ok
  return children
}

export default RoleBasedRoutes

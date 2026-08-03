import { Navigate } from 'react-router-dom'
import { getAdminToken } from '../lib/adminAuth.js'

export function AdminProtectedRoute({ children }) {
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

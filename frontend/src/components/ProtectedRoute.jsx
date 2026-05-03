import { Navigate } from 'react-router-dom'
import { getCurrentUser, getDashboardPathByRole, isAuthenticated } from '../auth'

function ProtectedRoute({ children, role }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  const user = getCurrentUser()
  if (role && user?.role !== role) {
    return <Navigate to={getDashboardPathByRole(user?.role)} replace />
  }
  return children
}

export default ProtectedRoute

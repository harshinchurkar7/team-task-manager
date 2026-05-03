import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import MemberDashboardPage from './pages/MemberDashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import TasksPage from './pages/TasksPage'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import ToastProvider from './components/ToastProvider'
import { getCurrentUser, getDashboardPathByRole } from './auth'

function RootRedirect() {
  const user = getCurrentUser()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={getDashboardPathByRole(user.role)} replace />
}

function TasksRoute() {
  const { id } = useParams()
  return <TasksPage key={id} />
}

function App() {
  return (
    <>
      <ToastProvider />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/member" element={<ProtectedRoute role="MEMBER"><MemberDashboardPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id/tasks" element={<TasksRoute />} />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  )
}

export default App

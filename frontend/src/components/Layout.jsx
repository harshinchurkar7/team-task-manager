import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearAuth, getCurrentUser, getDashboardPathByRole } from '../auth'

function Layout() {
  const navigate = useNavigate()
  const user = getCurrentUser()

  const logout = () => {
    clearAuth()
    navigate('/login')
  }
  const dashboardPath = getDashboardPathByRole(user?.role)

  const navClass = ({ isActive }) =>
    `block rounded px-3 py-2 ${isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-200'}`

  return (
    <div className="min-h-screen md:flex">
      <aside className="w-full bg-white p-4 shadow md:w-64">
        <h1 className="mb-4 text-xl font-bold text-slate-900">Team Task Manager</h1>
        <nav className="space-y-2">
          <NavLink to={dashboardPath} className={navClass}>Dashboard</NavLink>
          <NavLink to="/projects" className={navClass}>Projects</NavLink>
        </nav>
        <div className="mt-8 rounded bg-slate-100 p-3 text-sm">
          <p className="font-semibold">{user?.name}</p>
          <p>{user?.email}</p>
          <span className={`mt-2 inline-block rounded px-2 py-1 text-xs font-semibold ${user?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {user?.role}
          </span>
        </div>
        <button className="mt-4 w-full rounded bg-red-500 px-4 py-2 text-white" onClick={logout}>
          Logout
        </button>
        <Link to={dashboardPath} className="mt-2 block text-center text-xs text-slate-500">Go home</Link>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

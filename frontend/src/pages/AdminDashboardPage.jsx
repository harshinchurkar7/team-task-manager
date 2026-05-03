import { useEffect, useState } from 'react'
import api from '../api'

function StatCard({ label, value, danger }) {
  return (
    <div className={`rounded p-4 shadow ${danger ? 'bg-red-100' : 'bg-white'}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    Promise.all([api.get('/dashboard'), api.get('/projects')]).then(([d, p]) => {
      setData(d.data)
      setProjects(p.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="animate-pulse">Loading dashboard...</p>
  if (!data) return <p>Unable to load dashboard data.</p>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Tasks" value={data.totalTasks} />
        <StatCard label="Todo" value={data.tasksByStatus?.TODO || 0} />
        <StatCard label="In Progress" value={data.tasksByStatus?.IN_PROGRESS || 0} />
        <StatCard label="Done" value={data.tasksByStatus?.DONE || 0} />
        <StatCard label="Overdue" value={data.overdueTasksCount} danger />
      </div>

      <section className="rounded bg-white p-4 shadow">
        <h3 className="mb-3 text-lg font-semibold">All Tasks</h3>
        {data.myAssignedTasks?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Task Title</th><th>Project Name</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {data.myAssignedTasks.map((task) => {
                  const overdue = task.status !== 'DONE' && task.dueDate < new Date().toISOString().slice(0, 10)
                  return (
                    <tr key={task.id} className={`border-b ${overdue ? 'bg-red-50 text-red-700' : ''}`}>
                      <td className="py-2">{task.title}</td>
                      <td>{task.projectName}</td>
                      <td>{task.assignedToName}</td>
                      <td>{task.priority}</td>
                      <td>{task.status}</td>
                      <td>{task.dueDate}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <p className="text-slate-500">No tasks available.</p>}
      </section>

      <section className="rounded bg-white p-4 shadow">
        <h3 className="mb-3 text-lg font-semibold">Projects and Members</h3>
        {projects.length ? projects.map((project) => (
          <div key={project.id} className="mb-3 rounded border p-3">
            <p className="font-semibold">{project.name}</p>
            <p className="text-sm text-slate-500">{project.description}</p>
            <p className="mt-2 text-sm">Members: {project.members?.map((m) => m.name).join(', ') || 'No members'}</p>
          </div>
        )) : <p className="text-slate-500">No projects yet. Create your first project!</p>}
      </section>
    </div>
  )
}

export default AdminDashboardPage

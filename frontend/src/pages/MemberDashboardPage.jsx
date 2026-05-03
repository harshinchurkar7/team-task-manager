import { useEffect, useState } from 'react'
import api from '../api'

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" aria-label="Loading" />
    </div>
  )
}

function StatCard({ label, value }) {
  const n = Number(value) || 0
  return (
    <div className="rounded bg-white p-4 shadow">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{n}</p>
    </div>
  )
}

const emptyDashboard = {
  totalTasks: 0,
  tasksByStatus: {},
  overdueTasksCount: 0,
  myAssignedTasks: [],
  projectCount: 0,
}

function MemberDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(emptyDashboard)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    let cancelled = false
    Promise.all([api.get('/dashboard'), api.get('/projects')])
      .then(([d, p]) => {
        if (cancelled) return
        setData({
          totalTasks: d.data?.totalTasks ?? 0,
          tasksByStatus: d.data?.tasksByStatus ?? {},
          overdueTasksCount: d.data?.overdueTasksCount ?? 0,
          myAssignedTasks: Array.isArray(d.data?.myAssignedTasks) ? d.data.myAssignedTasks : [],
          projectCount: p.data?.length ?? 0,
        })
        setProjects(Array.isArray(p.data) ? p.data : [])
      })
      .catch(() => {
        if (!cancelled) {
          setData(emptyDashboard)
          setProjects([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Member Dashboard</h2>
        <Spinner />
      </div>
    )
  }

  const todo = Number(data.tasksByStatus?.TODO ?? 0)
  const inProgress = Number(data.tasksByStatus?.IN_PROGRESS ?? 0)
  const done = Number(data.tasksByStatus?.DONE ?? 0)
  const tasks = data.myAssignedTasks || []

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Member Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total" value={data.totalTasks} />
        <StatCard label="Todo" value={todo} />
        <StatCard label="In Progress" value={inProgress} />
        <StatCard label="Done" value={done} />
        <StatCard label="Overdue" value={data.overdueTasksCount} />
      </div>

      <section className="rounded bg-white p-4 shadow">
        <h3 className="mb-3 text-lg font-semibold">My tasks</h3>
        {tasks.length === 0 ? (
          <p className="text-slate-600">No tasks assigned to you yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-600">
                  <th className="py-2 pr-4 font-medium">Title</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Priority</th>
                  <th className="py-2 pr-4 font-medium">Due date</th>
                  <th className="py-2 font-medium">Project</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const overdue = task.status !== 'DONE' && task.dueDate < new Date().toISOString().slice(0, 10)
                  return (
                    <tr key={task.id} className={`border-b border-slate-100 ${overdue ? 'bg-red-50 text-red-800' : ''}`}>
                      <td className="py-2 pr-4 font-medium">{task.title}</td>
                      <td className="py-2 pr-4">{task.status}</td>
                      <td className="py-2 pr-4">{task.priority}</td>
                      <td className="py-2 pr-4">{task.dueDate}</td>
                      <td className="py-2">{task.projectName ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded bg-white p-4 shadow">
        <h3 className="mb-3 text-lg font-semibold">My projects</h3>
        {projects.length === 0 ? (
          <p className="text-slate-600">You are not enrolled in any project yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-slate-700">
            {projects.map((p) => (
              <li key={p.id} className="rounded border border-slate-100 px-3 py-2">
                <span className="font-semibold text-slate-900">{p.name}</span>
                {p.description ? <span className="text-slate-500"> — {p.description}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default MemberDashboardPage

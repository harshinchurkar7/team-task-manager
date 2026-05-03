import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { getCurrentUser } from '../auth'
import { notify } from '../notify'

function ProjectsPage() {
  const user = getCurrentUser()
  const isAdmin = user?.role === 'ADMIN'
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', memberIds: [] })
  const [editProjectId, setEditProjectId] = useState(null)
  const [selectedForEdit, setSelectedForEdit] = useState([])
  const [errors, setErrors] = useState({})
  const [myTasksByProject, setMyTasksByProject] = useState({})

  const loadProjects = useCallback(async () => {
    try {
      if (isAdmin) {
        const [projectsRes, usersRes] = await Promise.all([api.get('/projects'), api.get('/projects/users/status')])
        setProjects(projectsRes.data)
        setUsers(usersRes?.data || [])
        setMyTasksByProject({})
      } else {
        const [projectsRes, tasksRes] = await Promise.all([api.get('/projects'), api.get('/tasks/assigned/me')])
        setProjects(projectsRes.data)
        const byProject = {}
        const list = Array.isArray(tasksRes.data) ? tasksRes.data : []
        for (const task of list) {
          const pid = task.project?.id ?? task.projectId
          if (pid == null) continue
          const key = String(pid)
          if (!byProject[key]) byProject[key] = []
          byProject[key].push(task)
        }
        setMyTasksByProject(byProject)
      }
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    loadProjects().catch(() => setLoading(false))
  }, [loadProjects])

  const createProject = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Project name is required'
    if (!form.description.trim()) newErrors.description = 'Project description is required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length) {
      notify('warning', 'Please fill all required fields')
      return
    }
    try {
      setLoading(true)
      await api.post('/projects', form)
      notify('success', 'Project created and members added successfully!')
      setForm({ name: '', description: '', memberIds: [] })
      await loadProjects()
    } catch {
      setLoading(false)
    }
  }

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    try {
      setLoading(true)
      await api.delete(`/projects/${id}`)
      notify('success', 'Project deleted successfully!')
      await loadProjects()
    } catch {
      setLoading(false)
    }
  }

  const removeMemberFromProject = async (projectId, member) => {
    if (!window.confirm(`Remove ${member.name} from this project?`)) return
    try {
      setLoading(true)
      await api.delete(`/projects/${projectId}/members/${member.id}`)
      notify('success', 'Member removed successfully')
      await loadProjects()
    } catch {
      setLoading(false)
    }
  }

  const toggleMember = (memberId) => {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...prev.memberIds, memberId],
    }))
  }

  const startEdit = async (projectId) => {
    try {
      setEditProjectId(projectId)
      const { data } = await api.get(`/projects/users/status?projectId=${projectId}`)
      setUsers(data)
      setSelectedForEdit(data.filter((u) => u.selected).map((u) => u.id))
    } catch {
      // interceptor toast
    }
  }

  const saveEdit = async () => {
    try {
      const project = projects.find((p) => p.id === editProjectId)
      const current = new Set(project.members.map((m) => m.id))
      const selected = new Set(selectedForEdit)
      setLoading(true)
      for (const userId of selected) {
        if (!current.has(userId)) await api.post(`/projects/${editProjectId}/members`, { userId })
      }
      for (const userId of current) {
        if (!selected.has(userId) && userId !== project.createdBy?.id) {
          if (window.confirm('Remove member from project? Their project tasks will be unassigned.')) {
            await api.delete(`/projects/${editProjectId}/members/${userId}`)
          }
        }
      }
      notify('success', 'Project members updated successfully!')
      setEditProjectId(null)
      setSelectedForEdit([])
      await loadProjects()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Projects</h2>
      {isAdmin && (
        <div className="mb-6 rounded bg-white p-4 shadow">
          <form onSubmit={createProject}>
            <h3 className="mb-2 font-semibold">Create Project</h3>
            <input
              className="mb-2 w-full rounded border p-2"
              placeholder="Project Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="mb-2 text-xs text-red-600">{errors.name}</p>}
            <textarea
              className="mb-2 w-full rounded border p-2"
              placeholder="Project Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {errors.description && <p className="mb-2 text-xs text-red-600">{errors.description}</p>}
            <h4 className="mb-2 mt-3 font-semibold">Add Members</h4>
            <p className="mb-2 text-xs text-slate-500">Only users with role Member are listed (Free = not in any project, Busy = in at least one project).</p>
            {users.length === 0 ? (
              <p className="mb-3 text-sm text-amber-700">No member accounts available. Sign up users as Member first.</p>
            ) : (
              <div className="mb-3 grid gap-2 md:grid-cols-2">
                {users.map((u) => (
                  <label key={u.id} className="flex items-center justify-between rounded border p-2 text-sm">
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-slate-500">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`mb-1 inline-block rounded px-2 py-0.5 text-xs ${
                          u.status === 'Busy' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.status}
                      </span>
                      <input type="checkbox" checked={form.memberIds.includes(u.id)} onChange={() => toggleMember(u.id)} />
                    </div>
                  </label>
                ))}
              </div>
            )}
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white" disabled={loading}>
              Create Project
            </button>
          </form>
        </div>
      )}

      {loading ? <p className="animate-pulse">Loading projects...</p> : null}
      {!loading && !projects.length ? (
        <p className="rounded bg-white p-4 text-slate-500 shadow">
          {isAdmin ? 'No projects yet. Create your first project!' : 'You are not enrolled in any project yet.'}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="rounded bg-white p-4 shadow">
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <p className="text-sm text-slate-600">{project.description}</p>
            <div className="my-3">
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Members</p>
              {project.members?.length ? (
                <ul className="space-y-1 text-sm">
                  {project.members.map((m) => (
                    <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-1 last:border-0">
                      <span className="flex flex-wrap items-center gap-2">
                        {m.name}
                        {Number(project.createdBy?.id) === Number(m.id) ? (
                          <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">Creator</span>
                        ) : null}
                        {isAdmin ? <span className="text-slate-500">({m.email})</span> : null}
                      </span>
                      {isAdmin && project.createdBy?.id !== m.id ? (
                        <button
                          type="button"
                          className="rounded bg-red-600 px-2 py-0.5 text-xs text-white"
                          onClick={() => removeMemberFromProject(project.id, m)}
                        >
                          Remove
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No members yet.</p>
              )}
            </div>
            {!isAdmin ? (
              <div className="mb-3 rounded border border-slate-100 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Your tasks in this project</p>
                {(() => {
                  const mine = myTasksByProject[String(project.id)] || []
                  if (!mine.length) {
                    return <p className="text-sm text-slate-600">No tasks assigned to you in this project yet.</p>
                  }
                  return (
                    <ul className="space-y-1 text-sm">
                      {mine.map((t) => {
                        const overdue = t.status !== 'DONE' && t.dueDate < new Date().toISOString().slice(0, 10)
                        return (
                          <li key={t.id} className={overdue ? 'font-medium text-red-700' : 'text-slate-700'}>
                            {t.title} — {t.status} — {t.priority} — due {t.dueDate}
                          </li>
                        )
                      })}
                    </ul>
                  )
                })()}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Link className="rounded bg-slate-800 px-3 py-2 text-white" to={`/projects/${project.id}/tasks`}>
                View Tasks
              </Link>
              {isAdmin && (
                <>
                  <button type="button" className="rounded bg-indigo-600 px-3 py-2 text-white" onClick={() => startEdit(project.id)}>
                    Edit
                  </button>
                  <button type="button" className="rounded bg-red-600 px-3 py-2 text-white" onClick={() => deleteProject(project.id)}>
                    Delete
                  </button>
                </>
              )}
            </div>
            {isAdmin && editProjectId === project.id && (
              <div className="mt-3 rounded border p-3">
                <p className="mb-2 text-sm font-semibold">Edit Members (Member role only)</p>
                <div className="space-y-2">
                  {users.map((u) => (
                    <label key={u.id} className="flex items-center justify-between rounded border p-2 text-sm">
                      <span>
                        {u.name} ({u.email}) — {u.status}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedForEdit.includes(u.id)}
                        onChange={() => {
                          setSelectedForEdit((prev) => (prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id]))
                        }}
                      />
                    </label>
                  ))}
                </div>
                <button type="button" className="mt-2 rounded bg-emerald-600 px-3 py-2 text-white" onClick={saveEdit} disabled={loading}>
                  Save Changes
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectsPage

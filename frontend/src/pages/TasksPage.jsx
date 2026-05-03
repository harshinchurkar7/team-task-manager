import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { getCurrentUser } from '../auth'
import { notify } from '../notify'

const initialTask = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  assignedToId: '',
}

function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" aria-label="Loading" />
    </div>
  )
}

function TasksPage() {
  const { id } = useParams()
  const user = getCurrentUser()
  const isAdmin = user?.role === 'ADMIN'
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(initialTask)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [projectMembers, setProjectMembers] = useState([])
  const [projectTitle, setProjectTitle] = useState('')
  const [projectCreatorId, setProjectCreatorId] = useState(null)

  const assignableMembers = useMemo(
    () => projectMembers.filter((m) => m.role === 'MEMBER'),
    [projectMembers],
  )

  const refreshProjectMembers = useCallback(() => {
    return api.get('/projects').then((res) => {
      const project = res.data.find((p) => Number(p.id) === Number(id))
      setProjectMembers(project?.members || [])
      setProjectTitle(project?.name || '')
      setProjectCreatorId(project?.createdBy?.id ?? null)
    })
  }, [id])

  const loadTasks = useCallback(() => {
    return api
      .get(`/tasks/project/${id}`)
      .then((res) => {
        setTasks(res.data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    refreshProjectMembers()
  }, [refreshProjectMembers])

  const projectNameForRow = (task) => task.project?.name || projectTitle || '—'

  const createTask = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (!form.dueDate) newErrors.dueDate = 'Due date is required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length) {
      notify('warning', 'Please fill all required fields')
      return
    }
    try {
      setLoading(true)
      await api.post('/tasks', {
        ...form,
        assignedToId: form.assignedToId ? Number(form.assignedToId) : null,
        projectId: Number(id),
      })
      notify('success', 'Task created successfully!')
      setForm(initialTask)
      await refreshProjectMembers()
      await loadTasks()
    } catch {
      setLoading(false)
    }
  }

  const updateStatus = async (task, status) => {
    try {
      setLoading(true)
      await api.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedToId: task.assignedTo?.id || null,
        projectId: Number(id),
      })
      notify('success', 'Task status updated successfully!')
      await loadTasks()
    } catch {
      setLoading(false)
    }
  }

  const updateAssignee = async (task, assignedToIdRaw) => {
    const assignedToId = assignedToIdRaw === '' ? null : Number(assignedToIdRaw)
    try {
      setLoading(true)
      if (assignedToId === null) {
        await api.put(`/tasks/${task.id}/unassign`)
        notify('success', 'Member unassigned from task')
      } else {
        await api.put(`/tasks/${task.id}`, {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          assignedToId,
          projectId: Number(id),
        })
        notify('success', 'Task assignment updated')
      }
      await refreshProjectMembers()
      await loadTasks()
    } catch {
      setLoading(false)
    }
  }

  const unassignFromTask = async (task) => {
    const name = task.assignedTo?.name || 'member'
    if (!window.confirm(`Unassign ${name} from this task?`)) return
    try {
      setLoading(true)
      await api.put(`/tasks/${task.id}/unassign`)
      notify('success', 'Member unassigned from task')
      await refreshProjectMembers()
      await loadTasks()
    } catch {
      setLoading(false)
    }
  }

  const removeTask = async (taskId) => {
    if (!window.confirm('Delete this task permanently?')) return
    try {
      setLoading(true)
      await api.delete(`/tasks/${taskId}`)
      notify('success', 'Task deleted successfully!')
      await refreshProjectMembers()
      await loadTasks()
    } catch {
      setLoading(false)
    }
  }

  const canAssignMembers = isAdmin && assignableMembers.length > 0
  const memberReadOnly = user?.role === 'MEMBER'

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{projectTitle ? `${projectTitle} — Tasks` : 'Project Tasks'}</h2>
      {!isAdmin && projectTitle ? (
        <p className="mb-4 text-sm text-slate-600">Only tasks assigned to you are shown.</p>
      ) : null}

      {!!projectMembers.length && (
        <div className="mb-4 rounded bg-white p-3 text-sm shadow">
          <p className="mb-2 font-medium text-slate-700">Project members</p>
          <ul className="flex flex-wrap gap-2">
            {projectMembers.map((m) => (
              <li key={m.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                {isAdmin ? (
                  <>
                    <span className="font-medium">{m.name}</span>
                    <span className="text-slate-500">({m.email})</span>
                    {m.role === 'ADMIN' ? <span className="text-xs text-slate-500">Admin</span> : null}
                  </>
                ) : (
                  <>
                    <span>{m.name}</span>
                    {projectCreatorId != null && Number(projectCreatorId) === Number(m.id) ? (
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-800">Creator</span>
                    ) : null}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isAdmin && (
        <form className="mb-6 rounded bg-white p-4 shadow" onSubmit={createTask}>
          <h3 className="mb-2 font-semibold">Create Task</h3>
          {!canAssignMembers ? (
            <p className="mb-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              No members in this project yet. Add members first.
            </p>
          ) : null}
          <div className="grid gap-2 md:grid-cols-2">
            <input
              className="rounded border p-2"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
            <input
              className="rounded border p-2"
              placeholder="Due Date"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            {errors.dueDate && <p className="text-xs text-red-600">{errors.dueDate}</p>}
            <textarea
              className="rounded border p-2 md:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {errors.description && <p className="text-xs text-red-600 md:col-span-2">{errors.description}</p>}
            <select className="rounded border p-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Assign to (project members only)</label>
              <select
                className="w-full rounded border p-2"
                value={form.assignedToId}
                onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
                disabled={!canAssignMembers}
              >
                <option value="">— None —</option>
                {assignableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="mt-3 rounded bg-blue-600 px-4 py-2 text-white" disabled={loading}>
            Create Task
          </button>
        </form>
      )}

      {loading ? <Spinner /> : null}

      {!loading && !tasks.length ? (
        <p className="rounded bg-white p-4 text-slate-600 shadow">
          {memberReadOnly ? 'No tasks assigned to you yet.' : 'No tasks found for this project.'}
        </p>
      ) : null}

      {!loading && tasks.length > 0 && memberReadOnly ? (
        <div className="overflow-x-auto rounded bg-white shadow">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-600">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Due date</th>
                <th className="px-4 py-3 font-medium">Project</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const overdue = task.status !== 'DONE' && task.dueDate < new Date().toISOString().slice(0, 10)
                return (
                  <tr key={task.id} className={`border-b border-slate-100 ${overdue ? 'bg-red-50' : ''}`}>
                    <td className={`px-4 py-3 font-medium ${overdue ? 'text-red-800' : ''}`}>{task.title}</td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded border border-slate-300 p-1"
                        value={task.status}
                        onChange={(e) => updateStatus(task, e.target.value)}
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>
                    </td>
                    <td className={`px-4 py-3 ${overdue ? 'text-red-800' : ''}`}>{task.priority}</td>
                    <td className={`px-4 py-3 ${overdue ? 'font-semibold text-red-700' : ''}`}>{task.dueDate}</td>
                    <td className="px-4 py-3">{projectNameForRow(task)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tasks.length > 0 && isAdmin ? (
        <div className="space-y-3">
          {tasks.map((task) => {
            const overdue = task.status !== 'DONE' && task.dueDate < new Date().toISOString().slice(0, 10)
            const assigned = task.assignedTo
            const isOwnTask = assigned && Number(user?.userId) === Number(assigned.id)
            return (
              <div
                key={task.id}
                className={`rounded border bg-white p-4 shadow ${overdue ? 'border-red-500' : 'border-slate-200'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-slate-600">{task.description}</p>
                    <p className={`mt-1 text-xs ${overdue ? 'font-semibold text-red-600' : 'text-slate-500'}`}>
                      Due: {task.dueDate} | Priority: {task.priority}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-slate-600">Assigned to:</span>
                      {assigned ? (
                        <>
                          <span>{assigned.name}</span>
                          <button
                            type="button"
                            className="rounded border border-red-300 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-100"
                            onClick={() => unassignFromTask(task)}
                          >
                            Unassign
                          </button>
                        </>
                      ) : (
                        <span className="font-medium text-red-600">Unassigned</span>
                      )}
                    </div>
                    {canAssignMembers ? (
                      <div className="mt-2">
                        <label className="mr-2 text-xs text-slate-600">Reassign:</label>
                        <select
                          className="rounded border p-1 text-sm"
                          value={assigned?.id ?? ''}
                          onChange={(e) => updateAssignee(task, e.target.value)}
                          disabled={loading}
                        >
                          <option value="">Unassigned</option>
                          {assignableMembers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <select
                      className="rounded border p-2"
                      value={task.status}
                      onChange={(e) => updateStatus(task, e.target.value)}
                      disabled={memberReadOnly && !isOwnTask}
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                    <button type="button" className="rounded bg-red-600 px-3 py-2 text-white" onClick={() => removeTask(task.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default TasksPage

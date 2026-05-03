import { useEffect, useState } from 'react'
import api from '../api'

function Card({ title, value, color = 'bg-white' }) {
  return (
    <div className={`rounded p-4 shadow ${color}`}>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function DashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data))
  }, [])

  if (!data) return <p>Loading dashboard...</p>

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card title="Total Tasks" value={data.totalTasks} />
        <Card title="Todo" value={data.tasksByStatus.TODO || 0} />
        <Card title="In Progress" value={data.tasksByStatus.IN_PROGRESS || 0} />
        <Card title="Done" value={data.tasksByStatus.DONE || 0} />
        <Card title="Overdue" value={data.overdueTasksCount} color="bg-red-100" />
      </div>
    </div>
  )
}

export default DashboardPage

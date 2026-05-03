import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { getDashboardPathByRole, saveAuth } from '../auth'
import { notify } from '../notify'

function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [error, setError] = useState('')
  const [inline, setInline] = useState({})
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.password.trim()) errs.password = 'Password is required'
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    setInline(errs)
    if (Object.keys(errs).length) {
      notify('warning', 'Please fill all required fields')
      return
    }
    try {
      const { data } = await api.post('/auth/signup', form)
      saveAuth(data)
      notify('success', 'Signup successful!')
      navigate(getDashboardPathByRole(data.role))
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="w-full max-w-md rounded bg-white p-6 shadow" onSubmit={onSubmit}>
        <h2 className="mb-4 text-2xl font-bold">Signup</h2>
        {error && <p className="mb-3 text-red-600">{error}</p>}
        <input className="mb-3 w-full rounded border p-2" placeholder="Name"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="mb-3 w-full rounded border p-2" placeholder="Email" type="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="mb-4 w-full rounded border p-2" placeholder="Password" type="password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {inline.name && <p className="-mt-3 mb-2 text-xs text-red-600">{inline.name}</p>}
        {inline.email && <p className="-mt-3 mb-2 text-xs text-red-600">{inline.email}</p>}
        {inline.password && <p className="-mt-3 mb-2 text-xs text-red-600">{inline.password}</p>}
        <label className="mb-2 block text-sm font-medium">Role</label>
        <select className="mb-4 w-full rounded border p-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
        </select>
        <button className="w-full rounded bg-blue-600 p-2 text-white">Signup</button>
        <p className="mt-4 text-sm">Already have account? <Link className="text-blue-600" to="/login">Login</Link></p>
      </form>
    </div>
  )
}

export default SignupPage

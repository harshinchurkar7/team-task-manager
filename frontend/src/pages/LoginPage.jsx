import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { getDashboardPathByRole, saveAuth } from '../auth'
import { notify } from '../notify'

function AlertIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  )
}

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please fill all required fields')
      notify('warning', 'Please fill all required fields')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/auth/login', form)
      saveAuth(data)
      notify('success', 'Login successful!')
      navigate(getDashboardPathByRole(data.role))
    } catch (err) {
      if (!err.response) {
        setError('Connection failed. Please try again.')
        return
      }
      const data = err.response?.data
      const msg =
        typeof data?.error === 'string'
          ? data.error
          : 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mb-6 text-center text-3xl font-bold text-slate-900">Team Task Manager</h1>
      <form className="w-full max-w-md rounded-lg bg-white p-6 shadow-md" onSubmit={onSubmit}>
        <h2 className="mb-4 text-xl font-semibold text-slate-800">Login</h2>
        {error ? (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertIcon />
            <span>{error}</span>
          </div>
        ) : null}
        <input
          className="mb-3 w-full rounded border border-slate-300 p-2"
          placeholder="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="mb-4 w-full rounded border border-slate-300 p-2"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-blue-600 p-2 font-medium text-white disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Login'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          <Link className="font-medium text-blue-600 hover:underline" to="/signup">
            New here? Sign up first →
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage

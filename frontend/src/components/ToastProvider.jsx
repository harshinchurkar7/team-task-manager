import { useEffect, useState } from 'react'

const colorByType = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  warning: 'bg-yellow-500 text-slate-900',
}

function ToastProvider() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (event) => {
      const id = Date.now() + Math.random()
      const toast = {
        id,
        type: event.detail?.type || 'success',
        message: event.detail?.message || '',
      }
      setToasts((prev) => [...prev, toast])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
    }
    window.addEventListener('app-toast', handler)
    return () => window.removeEventListener('app-toast', handler)
  }, [])

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`rounded px-4 py-2 text-sm text-white shadow ${colorByType[toast.type] || 'bg-slate-800'}`}>
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export default ToastProvider

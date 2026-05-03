export const notify = (type, message) => {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { type, message } }))
}

export const mapApiError = (error) => {
  if (!error.response) return 'Connection failed. Please try again.'
  const status = error.response.status
  if (status === 401) return 'Session expired. Please login again.'
  if (status === 403) return "You don't have permission for this action"
  if (status === 404) return 'Resource not found'
  if (status >= 500) return 'Something went wrong. Please try again.'
  return error.response.data?.error || 'Request failed'
}

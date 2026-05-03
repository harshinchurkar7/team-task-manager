import axios from 'axios'
import { clearAuth, getToken } from './auth'
import { notify, mapApiError } from './notify'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/signup')
    if (error.response?.status === 401 && !isAuthRoute) {
      notify('error', 'Session expired. Please login again.')
      clearAuth()
      window.location.href = '/login'
      return Promise.reject(error)
    }
    if (!isAuthRoute) {
      notify('error', mapApiError(error))
    }
    return Promise.reject(error)
  },
)

export default api

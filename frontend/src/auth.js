const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const saveAuth = (payload) => {
  localStorage.setItem(TOKEN_KEY, payload.token)
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    }),
  )
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getCurrentUser = () => {
  const value = localStorage.getItem(USER_KEY)
  return value ? JSON.parse(value) : null
}

export const isAuthenticated = () => Boolean(getToken())

export const getDashboardPathByRole = (role) => (role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/member')

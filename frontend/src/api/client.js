import axios from 'axios'

// In production (Render), VITE_API_URL is the backend's external URL.
// In local dev, Vite proxy handles /api → localhost:8000, so we use '/api'.
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: BASE_URL,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`
  }
  return config
})

// Handle 401/403 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      localStorage.removeItem('candidate_profile')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

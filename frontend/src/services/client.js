/**
 * @summary Axios instance with JWT and error helpers.
 * @author Wesley (Dev 1 — Gatekeeper)
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Extract a human-readable message from an Axios error response. */
export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  if (!error?.response) {
    return 'Cannot reach the server. Is the backend running on port 8080?'
  }
  const data = error.response.data
  if (typeof data?.message === 'string') {
    return data.message
  }
  if (data?.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).join(', ')
  }
  return fallback
}

export default api

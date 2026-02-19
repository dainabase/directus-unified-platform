/**
 * Centralized Axios instance
 * All API calls go through this instance.
 * JWT tokens are injected via interceptors from authStore.
 *
 * @version 1.0.0
 * @date 2026-02-19
 */

import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// ── Request interceptor: attach JWT from authStore ──
api.interceptors.request.use((config) => {
  // Lazy import to avoid circular dependency
  const token = window.__AUTH_TOKEN__
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: handle 401 + refresh ──
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = window.__REFRESH_TOKEN__
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, {
          refresh_token: refreshToken
        })

        const newToken = data.data?.access_token || data.access_token
        const newRefresh = data.data?.refresh_token || data.refresh_token

        // Update global tokens (authStore will sync)
        window.__AUTH_TOKEN__ = newToken
        if (newRefresh) window.__REFRESH_TOKEN__ = newRefresh

        // Dispatch event for authStore to pick up
        window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
          detail: { access_token: newToken, refresh_token: newRefresh }
        }))

        processQueue(null, newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('auth:session-expired'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

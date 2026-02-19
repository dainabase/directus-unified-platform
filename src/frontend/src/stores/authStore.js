/**
 * Zustand Auth Store
 * Manages JWT authentication state, login/logout, token refresh.
 * Syncs with the axios interceptor via window.__AUTH_TOKEN__.
 *
 * @version 1.0.0
 * @date 2026-02-19
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/axios'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      portal: null,        // 'superadmin' | 'client' | 'prestataire' | 'revendeur'
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Login ──
      login: async (email, password, portal = 'superadmin') => {
        set({ isLoading: true, error: null })
        try {
          // Authentification directe Directus (évite le backend Express port 3000)
          const { data } = await api.post('/auth/login', {
            email,
            password
          })

          const payload = data.data || data
          const token = payload.access_token
          const refresh = payload.refresh_token

          // Récupérer le profil utilisateur depuis Directus
          window.__AUTH_TOKEN__ = token
          let user = null
          try {
            const meRes = await api.get('/users/me', {
              params: { fields: 'id,email,first_name,last_name,role' }
            })
            const me = meRes.data?.data || meRes.data
            user = {
              id: me.id,
              email: me.email,
              name: `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.email,
              role: portal, // on fait confiance au portal sélectionné
              companies: ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT']
            }
          } catch { user = { id: 'admin', email, name: email, role: portal } }

          // Set global token for axios interceptor
          window.__AUTH_TOKEN__ = token
          window.__REFRESH_TOKEN__ = refresh

          set({
            user,
            token,
            refreshToken: refresh,
            portal,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          return { success: true, user }
        } catch (err) {
          const message = err.response?.data?.error || err.response?.data?.message || 'Identifiants invalides'
          set({ isLoading: false, error: message, isAuthenticated: false })
          return { success: false, error: message }
        }
      },

      // ── Logout ──
      logout: () => {
        window.__AUTH_TOKEN__ = null
        window.__REFRESH_TOKEN__ = null

        set({
          user: null,
          token: null,
          refreshToken: null,
          portal: null,
          isAuthenticated: false,
          error: null
        })
      },

      // ── Fetch current user profile ──
      fetchMe: async () => {
        const { token } = get()
        if (!token) return null

        try {
          const { data } = await api.get('/api/auth/me')
          const user = data.data || data
          set({ user })
          return user
        } catch {
          // Token expired or invalid
          return null
        }
      },

      // ── Hydrate tokens on app init ──
      hydrate: () => {
        const { token, refreshToken } = get()
        if (token) {
          window.__AUTH_TOKEN__ = token
          window.__REFRESH_TOKEN__ = refreshToken
        }
      },

      // ── Clear error ──
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        portal: state.portal,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Listen for token refresh from axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:token-refreshed', (e) => {
    const { access_token, refresh_token } = e.detail
    useAuthStore.setState({
      token: access_token,
      refreshToken: refresh_token
    })
  })

  window.addEventListener('auth:session-expired', () => {
    useAuthStore.getState().logout()
    // Navigate to login will be handled by ProtectedRoute
  })
}

export default useAuthStore

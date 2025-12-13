import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { auth } from '../api/client'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar: string | null
  role: {
    id: string
    name: string
    admin_access: boolean
    app_access: boolean
  }
  owner_company?: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await auth.login(email, password)
          const { access_token, refresh_token } = response

          set({ 
            token: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true 
          })

          // Get user details
          const user = await auth.me()
          set({ user, isLoading: false })
          
          toast.success(`Welcome back, ${user.first_name}!`)
          return true
        } catch (error: any) {
          set({ 
            error: error.response?.data?.errors?.[0]?.message || 'Invalid credentials',
            isLoading: false 
          })
          toast.error('Login failed. Please check your credentials.')
          return false
        }
      },

      logout: async () => {
        const { refreshToken } = get()
        
        try {
          if (refreshToken) {
            await auth.logout(refreshToken)
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null
          })
          toast.success('Logged out successfully')
        }
      },

      checkAuth: async () => {
        const { token, refreshToken } = get()
        
        if (!token) {
          set({ isLoading: false, isAuthenticated: false })
          return
        }

        try {
          const user = await auth.me()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          // Try to refresh token
          if (refreshToken) {
            try {
              const response = await auth.refresh(refreshToken)
              set({ 
                token: response.access_token,
                refreshToken: response.refresh_token 
              })
              
              const user = await auth.me()
              set({ user, isAuthenticated: true, isLoading: false })
            } catch (refreshError) {
              // Refresh failed, logout
              get().logout()
            }
          } else {
            set({ isLoading: false, isAuthenticated: false })
          }
        }
      },

      setUser: (user: User) => set({ user }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Initialize auth check on app start
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth()
}
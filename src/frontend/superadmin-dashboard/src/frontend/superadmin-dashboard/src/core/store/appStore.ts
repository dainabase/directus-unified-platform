import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { collections } from '../api/client'

interface Company {
  id: string
  name: string
  code: string
  logo?: string
  primary_color?: string
}

interface AppState {
  // UI State
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  locale: 'en' | 'fr' | 'de' | 'it'
  
  // Business State
  selectedCompany: Company | null
  companies: Company[]
  
  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLocale: (locale: 'en' | 'fr' | 'de' | 'it') => void
  selectCompany: (company: Company | null) => void
  loadCompanies: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      theme: 'light',
      locale: 'en',
      selectedCompany: null,
      companies: [],

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => {
        set({ theme })
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      setLocale: (locale) => set({ locale }),
      selectCompany: (company) => set({ selectedCompany: company }),
      
      loadCompanies: async () => {
        try {
          const data = await collections.companies.list({
            fields: ['id', 'name', 'code', 'logo', 'primary_color'],
            sort: ['name']
          })
          set({ companies: data })
          
          // Select first company if none selected
          if (data.length > 0 && !set.getState().selectedCompany) {
            set({ selectedCompany: data[0] })
          }
        } catch (error) {
          console.error('Failed to load companies:', error)
        }
      }
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        sidebarOpen: state.sidebarOpen,
        selectedCompany: state.selectedCompany
      })
    }
  )
)

// Initialize theme on app start
if (typeof window !== 'undefined') {
  const theme = useAppStore.getState().theme
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  }
}
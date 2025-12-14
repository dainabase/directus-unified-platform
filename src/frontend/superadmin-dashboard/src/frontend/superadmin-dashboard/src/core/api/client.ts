import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

// API Configuration
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'
const UNIFIED_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_TIMEOUT = 30000 // 30 seconds

// Create axios instance for Directus (data operations)
const apiClient: AxiosInstance = axios.create({
  baseURL: DIRECTUS_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Create axios instance for Unified Backend (auth, finance)
const unifiedApiClient: AxiosInstance = axios.create({
  baseURL: UNIFIED_API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for Directus
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Request interceptor for Unified API
unifiedApiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout()
      toast.error('Session expired. Please login again.')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.')
    }
    
    return Promise.reject(error)
  }
)

// Generic API methods
export const api = {
  // GET request
  get: async <T>(endpoint: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.get<{ data: T }>(endpoint, config)
    return response.data.data
  },

  // POST request
  post: async <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.post<{ data: T }>(endpoint, data, config)
    return response.data.data
  },

  // PATCH request
  patch: async <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.patch<{ data: T }>(endpoint, data, config)
    return response.data.data
  },

  // PUT request
  put: async <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.put<{ data: T }>(endpoint, data, config)
    return response.data.data
  },

  // DELETE request
  delete: async (endpoint: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.delete(endpoint, config)
    return response.data
  },

  // Upload file
  upload: async (file: File, folder?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (folder) formData.append('folder', folder)
    
    const response = await apiClient.post<{ data: any }>('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },
}

// Collection-specific API endpoints
export const collections = {
  // Companies
  companies: {
    list: (params?: any) => api.get('/items/owner_companies', { params }),
    get: (id: string) => api.get(`/items/owner_companies/${id}`),
    create: (data: any) => api.post('/items/owner_companies', data),
    update: (id: string, data: any) => api.patch(`/items/owner_companies/${id}`, data),
    delete: (id: string) => api.delete(`/items/owner_companies/${id}`),
  },

  // Projects
  projects: {
    list: (params?: any) => api.get('/items/projects', { params }),
    get: (id: string) => api.get(`/items/projects/${id}`),
    create: (data: any) => api.post('/items/projects', data),
    update: (id: string, data: any) => api.patch(`/items/projects/${id}`, data),
    delete: (id: string) => api.delete(`/items/projects/${id}`),
  },

  // Invoices
  invoices: {
    list: (params?: any) => api.get('/items/client_invoices', { params }),
    get: (id: string) => api.get(`/items/client_invoices/${id}`),
    create: (data: any) => api.post('/items/client_invoices', data),
    update: (id: string, data: any) => api.patch(`/items/client_invoices/${id}`, data),
    delete: (id: string) => api.delete(`/items/client_invoices/${id}`),
  },

  // Contacts
  contacts: {
    list: (params?: any) => api.get('/items/contacts', { params }),
    get: (id: string) => api.get(`/items/contacts/${id}`),
    create: (data: any) => api.post('/items/contacts', data),
    update: (id: string, data: any) => api.patch(`/items/contacts/${id}`, data),
    delete: (id: string) => api.delete(`/items/contacts/${id}`),
  },

  // Employees
  employees: {
    list: (params?: any) => api.get('/items/employees', { params }),
    get: (id: string) => api.get(`/items/employees/${id}`),
    create: (data: any) => api.post('/items/employees', data),
    update: (id: string, data: any) => api.patch(`/items/employees/${id}`, data),
    delete: (id: string) => api.delete(`/items/employees/${id}`),
  },

  // Bank Transactions
  bankTransactions: {
    list: (params?: any) => api.get('/items/bank_transactions', { params }),
    get: (id: string) => api.get(`/items/bank_transactions/${id}`),
    create: (data: any) => api.post('/items/bank_transactions', data),
    update: (id: string, data: any) => api.patch(`/items/bank_transactions/${id}`, data),
    delete: (id: string) => api.delete(`/items/bank_transactions/${id}`),
  },

  // Documents
  documents: {
    list: (params?: any) => api.get('/items/documents', { params }),
    get: (id: string) => api.get(`/items/documents/${id}`),
    create: (data: any) => api.post('/items/documents', data),
    update: (id: string, data: any) => api.patch(`/items/documents/${id}`, data),
    delete: (id: string) => api.delete(`/items/documents/${id}`),
  },

  // KPIs
  kpis: {
    list: (params?: any) => api.get('/items/dashboard_kpis', { params }),
    get: (id: string) => api.get(`/items/dashboard_kpis/${id}`),
  },
}

// Auth endpoints - Using Unified Backend API
export const auth = {
  login: async (email: string, password: string) => {
    const response = await unifiedApiClient.post('/api/auth/login', { email, password })
    // Transform response to match expected format
    const data = response.data
    if (data.success) {
      return {
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        user: data.user
      }
    }
    throw new Error(data.error || 'Login failed')
  },

  logout: async (refresh_token?: string) => {
    await unifiedApiClient.post('/api/auth/logout', { refreshToken: refresh_token })
  },

  refresh: async (refresh_token: string) => {
    const response = await unifiedApiClient.post('/api/auth/refresh', {
      refreshToken: refresh_token
    })
    const data = response.data
    if (data.success) {
      return {
        access_token: data.accessToken,
        refresh_token: data.refreshToken
      }
    }
    throw new Error(data.error || 'Token refresh failed')
  },

  me: async () => {
    const response = await unifiedApiClient.get('/api/auth/me')
    const data = response.data
    if (data.success) {
      // Transform user data to expected format
      return {
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.name,
        last_name: '',
        avatar: data.user.avatar || null,
        role: {
          id: data.user.role,
          name: data.user.role,
          admin_access: ['admin', 'superadmin'].includes(data.user.role),
          app_access: true
        },
        owner_company: data.user.companies?.[0]
      }
    }
    throw new Error(data.error || 'Failed to get user info')
  },

  verify: async () => {
    const response = await unifiedApiClient.get('/api/auth/verify')
    return response.data
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await unifiedApiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  },

  getCompanies: async () => {
    const response = await unifiedApiClient.get('/api/auth/companies')
    return response.data
  }
}

// Finance API endpoints - Using Unified Backend
export const financeApi = {
  // Dashboard
  getDashboard: async (company: string) => {
    const response = await unifiedApiClient.get(`/api/finance/dashboard/${company}`)
    return response.data
  },

  getConsolidatedDashboard: async () => {
    const response = await unifiedApiClient.get('/api/finance/dashboard/consolidated')
    return response.data
  },

  getKPIs: async (company: string, params?: { start?: string; end?: string }) => {
    const response = await unifiedApiClient.get(`/api/finance/kpis/${company}`, { params })
    return response.data
  },

  getAlerts: async (company: string) => {
    const response = await unifiedApiClient.get(`/api/finance/alerts/${company}`)
    return response.data
  },

  getCashPosition: async (company: string) => {
    const response = await unifiedApiClient.get(`/api/finance/cash-position/${company}`)
    return response.data
  },

  // Invoices
  createInvoice: async (data: any) => {
    const response = await unifiedApiClient.post('/api/finance/invoices', data)
    return response.data
  },

  getInvoice: async (id: string) => {
    const response = await unifiedApiClient.get(`/api/finance/invoices/${id}`)
    return response.data
  },

  listInvoices: async (company: string, params?: any) => {
    const response = await unifiedApiClient.get(`/api/finance/invoices/list/${company}`, { params })
    return response.data
  },

  // Reconciliation
  getReconciliation: async (company: string, params?: any) => {
    const response = await unifiedApiClient.get(`/api/finance/reconciliation/${company}`, { params })
    return response.data
  },

  // OCR
  processOCR: async (formData: FormData) => {
    const response = await unifiedApiClient.post('/api/finance/ocr/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Config
  getCompanies: async () => {
    const response = await unifiedApiClient.get('/api/finance/config/companies')
    return response.data
  },

  getTvaRates: async () => {
    const response = await unifiedApiClient.get('/api/finance/config/tva')
    return response.data
  }
}

export { unifiedApiClient }
export default apiClient
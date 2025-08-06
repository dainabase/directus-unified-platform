import { createDirectus, rest, authentication } from '@directus/sdk'

// Configuration Directus
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'

// Créer le client Directus
export const directus = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(authentication('json'))

// Types de collections
export const collections = {
  COMPANIES: 'companies',
  USERS: 'directus_users',
  TASKS: 'tasks',
  PROJECTS: 'projects',
  INVOICES: 'invoices',
  OPPORTUNITIES: 'opportunities',
  MARKETING_METRICS: 'marketing_metrics',
  FINANCIAL_METRICS: 'financial_metrics',
  ALERTS: 'alerts'
}

// API Helper Functions
export const directusAPI = {
  // Auth
  auth: {
    login: async (email, password) => {
      return await directus.login(email, password)
    },
    
    logout: async () => {
      return await directus.logout()
    },
    
    refresh: async () => {
      return await directus.refresh()
    },
    
    getUser: async () => {
      return await directus.request(readMe())
    }
  },
  
  // Companies
  companies: {
    getAll: async () => {
      return await directus.request(
        readItems(collections.COMPANIES, {
          fields: ['*'],
          sort: ['name']
        })
      )
    },
    
    getById: async (id) => {
      return await directus.request(
        readItem(collections.COMPANIES, id)
      )
    }
  },
  
  // Dashboard Metrics
  dashboard: {
    // Récupérer toutes les métriques du dashboard
    getMetrics: async (companyId, dateRange = 'last7days') => {
      const dateFilter = getDateFilter(dateRange)
      
      const [tasks, projects, opportunities, invoices, marketing, financial] = await Promise.all([
        // Tâches
        directus.request(
          readItems(collections.TASKS, {
            filter: {
              company: { _eq: companyId },
              ...dateFilter
            },
            aggregate: {
              count: ['*'],
              countDistinct: ['status']
            }
          })
        ),
        
        // Projets
        directus.request(
          readItems(collections.PROJECTS, {
            filter: {
              company: { _eq: companyId },
              status: { _in: ['active', 'in_progress', 'waiting'] }
            },
            aggregate: {
              count: ['*'],
              countDistinct: ['status']
            }
          })
        ),
        
        // Opportunités commerciales
        directus.request(
          readItems(collections.OPPORTUNITIES, {
            filter: {
              company: { _eq: companyId },
              ...dateFilter
            },
            aggregate: {
              sum: ['amount'],
              count: ['*'],
              avg: ['conversion_rate']
            }
          })
        ),
        
        // Factures
        directus.request(
          readItems(collections.INVOICES, {
            filter: {
              company: { _eq: companyId },
              ...dateFilter
            },
            aggregate: {
              sum: ['amount'],
              count: ['*'],
              countDistinct: ['status']
            }
          })
        ),
        
        // Métriques marketing
        directus.request(
          readItems(collections.MARKETING_METRICS, {
            filter: {
              company: { _eq: companyId },
              ...dateFilter
            },
            sort: ['-date'],
            limit: 7
          })
        ),
        
        // Métriques financières
        directus.request(
          readItems(collections.FINANCIAL_METRICS, {
            filter: {
              company: { _eq: companyId },
              ...dateFilter
            },
            sort: ['-date'],
            limit: 1
          })
        )
      ])
      
      return {
        tasks,
        projects,
        opportunities,
        invoices,
        marketing,
        financial
      }
    },
    
    // Récupérer les alertes
    getAlerts: async (companyId) => {
      return await directus.request(
        readItems(collections.ALERTS, {
          filter: {
            company: { _eq: companyId },
            status: { _eq: 'active' }
          },
          sort: ['-priority', '-created_at']
        })
      )
    },
    
    // Récupérer les KPIs avec historique
    getKPIHistory: async (companyId, kpiType, days = 7) => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      return await directus.request(
        readItems(collections.FINANCIAL_METRICS, {
          filter: {
            company: { _eq: companyId },
            date: { _gte: startDate.toISOString() }
          },
          fields: ['date', kpiType],
          sort: ['date']
        })
      )
    }
  }
}

// Helpers
function getDateFilter(range) {
  const now = new Date()
  const filters = {}
  
  switch (range) {
    case 'today':
      filters.created_at = { _gte: new Date().setHours(0, 0, 0, 0) }
      break
    case 'yesterday':
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      filters.created_at = {
        _gte: yesterday.setHours(0, 0, 0, 0),
        _lt: now.setHours(0, 0, 0, 0)
      }
      break
    case 'last7days':
      const week = new Date(now)
      week.setDate(week.getDate() - 7)
      filters.created_at = { _gte: week.toISOString() }
      break
    case 'last30days':
      const month = new Date(now)
      month.setDate(month.getDate() - 30)
      filters.created_at = { _gte: month.toISOString() }
      break
    case 'thisMonth':
      filters.created_at = { _gte: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() }
      break
    case 'lastMonth':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      filters.created_at = {
        _gte: lastMonth.toISOString(),
        _lt: thisMonth.toISOString()
      }
      break
  }
  
  return filters
}

// Mock data generator (pour dev sans Directus)
export const mockDataGenerator = {
  generateDashboardData: () => ({
    operational: {
      tasks: {
        total: 47,
        thisWeek: 12,
        overdue: 3,
        urgent: 8,
        priorities: [
          { id: 1, title: 'Valider devis BNP', priority: 'high' },
          { id: 2, title: 'Call client X (14h)', priority: 'urgent' },
          { id: 3, title: 'Review projet Y', priority: 'medium' }
        ]
      },
      projects: {
        active: 8,
        inProgress: 5,
        waiting: 3,
        deliveriesPerWeek: 2,
        upcoming: [
          { id: 1, title: 'Livraison A', date: 'Demain' },
          { id: 2, title: 'Sprint B', date: 'Jeudi' },
          { id: 3, title: 'Kickoff C', date: 'Lundi' }
        ]
      }
    },
    commercial: {
      pipeline: {
        total: 24,
        amount: 1200000,
        opportunities: 24,
        activeQuotes: { count: 7, amount: 340000 },
        conversionRate: 32,
        monthlyClosing: 450000,
        hotLeads: [
          { id: 1, name: 'BNP', amount: 120000 },
          { id: 2, name: 'SocGen', amount: 85000 }
        ]
      },
      marketing: {
        visitorsPerDay: 1847,
        leadsPerWeek: 124,
        conversionRate: 6.7,
        cac: 320,
        sources: {
          google: 45,
          direct: 30,
          social: 25
        }
      }
    },
    financial: {
      treasury: {
        available: 847000,
        runway: 7.3,
        burnRate: 116000,
        forecast: 2100000,
        weeklyInflows: 127000,
        weeklyOutflows: 85000,
        cashFlow: [
          { day: 'L', inflows: 45, outflows: 32 },
          { day: 'M', inflows: 52, outflows: 38 },
          { day: 'M', inflows: 38, outflows: 42 },
          { day: 'J', inflows: 65, outflows: 45 },
          { day: 'V', inflows: 48, outflows: 52 },
          { day: 'S', inflows: 15, outflows: 18 },
          { day: 'D', inflows: 8, outflows: 12 }
        ]
      },
      invoices: {
        unpaid: { count: 12, amount: 45000 },
        overdue30Days: { count: 3, amount: 18000 },
        toIssue: 8,
        pending: 127000,
        actions: [
          { id: 1, action: 'Relancer BNP', type: 'reminder' },
          { id: 2, action: 'Valider devis', type: 'validation' }
        ]
      }
    },
    kpis: {
      runway: { value: 7.3, trend: 0.1, status: 'stable' },
      arr: { value: 2400000, trend: 23, status: 'growth' },
      ebitda: { value: 18.5, trend: 2.3, status: 'growth' },
      ltvcac: { value: 4.2, trend: 0.2, status: 'good' },
      nps: { value: 72, trend: 2, status: 'excellent' }
    }
  }),
  
  generateAlerts: () => ({
    urgent: [
      { id: 1, type: 'task', message: 'Devis BNP expire dans 2h', priority: 'critical' },
      { id: 2, type: 'invoice', message: 'Facture SocGen impayée > 60j', priority: 'high' },
      { id: 3, type: 'project', message: 'Livraison projet X en retard', priority: 'high' }
    ],
    deadlines: [
      { id: 4, type: 'task', message: 'Call client prévu à 14h', priority: 'medium' },
      { id: 5, type: 'project', message: 'Sprint review demain 10h', priority: 'medium' },
      { id: 6, type: 'task', message: 'Rapport mensuel à envoyer', priority: 'medium' },
      { id: 7, type: 'invoice', message: 'Relance automatique dans 2j', priority: 'low' },
      { id: 8, type: 'task', message: 'Formation équipe vendredi', priority: 'low' }
    ],
    financial: [
      { id: 9, type: 'treasury', message: 'Entrée €45K attendue aujourd\'hui', priority: 'info' },
      { id: 10, type: 'invoice', message: 'Nouveau devis à valider €25K', priority: 'info' }
    ]
  })
}
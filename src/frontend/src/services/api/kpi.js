/**
 * KPI API - Connexion directe aux collections Directus
 * Calcule les KPIs à partir des vraies données
 */

import directus from './directus'
import { mockAPI } from '../mockKPIData'
import { OWNER_COMPANIES, normalizeCompanyName } from '../../utils/company-filter'

// Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8055'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Helper: Get current month and year
const getCurrentPeriod = () => {
  const now = new Date()
  return {
    currentMonth: now.getMonth(),
    currentYear: now.getFullYear(),
    previousMonth: now.getMonth() === 0 ? 11 : now.getMonth() - 1,
    previousYear: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  }
}

// Helper: Filter items by date range
const filterByDateRange = (items, days = 30, dateField = 'date_created') => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  return items.filter(item => {
    const date = new Date(item[dateField] || item.date || item.created_at)
    return date >= cutoff
  })
}

// Helper: Calculate financial metrics from invoices
const calculateFinancialMetrics = async (company = null) => {
  const filters = company ? { company: normalizeCompanyName(company) } : {}
  const { currentMonth, currentYear, previousMonth, previousYear } = getCurrentPeriod()

  try {
    // Fetch all required data
    const [invoices, supplierInvoices, bankTransactions] = await Promise.all([
      directus.get('client_invoices', { limit: -1 }, filters),
      directus.get('supplier_invoices', { limit: -1 }, filters),
      directus.get('bank_transactions', { limit: -1 }, filters)
    ])

    // Current month revenue
    const currentMonthInvoices = invoices.filter(i => {
      const date = new Date(i.date_created || i.date || i.issue_date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const mrr = currentMonthInvoices.reduce((sum, i) =>
      sum + parseFloat(i.amount || i.total_amount || 0), 0
    )

    // Previous month for growth calculation
    const previousMonthInvoices = invoices.filter(i => {
      const date = new Date(i.date_created || i.date || i.issue_date)
      return date.getMonth() === previousMonth && date.getFullYear() === previousYear
    })

    const previousMrr = previousMonthInvoices.reduce((sum, i) =>
      sum + parseFloat(i.amount || i.total_amount || 0), 0
    )

    // Calculate growth
    const growth = previousMrr > 0
      ? ((mrr - previousMrr) / previousMrr) * 100
      : 0

    // Cash balance from bank transactions
    const balance = bankTransactions.reduce((sum, t) =>
      sum + parseFloat(t.amount || 0), 0
    )

    // Monthly burn rate (last 3 months average)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const recentExpenses = supplierInvoices.filter(e => {
      const date = new Date(e.date_created || e.date || e.issue_date)
      return date >= threeMonthsAgo
    })

    const totalExpenses = recentExpenses.reduce((sum, e) =>
      sum + Math.abs(parseFloat(e.amount || e.total_amount || 0)), 0
    )

    const burnRate = Math.round(totalExpenses / 3)

    // Runway calculation
    const runway = burnRate > 0 ? Math.round(balance / burnRate) : 999

    // Health status
    const health = runway > 12 ? 'healthy' : runway > 6 ? 'warning' : 'critical'

    return {
      mrr: Math.round(mrr),
      arr: Math.round(mrr * 12),
      growth: Math.round(growth * 10) / 10,
      balance: Math.round(balance),
      burnRate,
      runway,
      health
    }
  } catch (error) {
    console.error('Error calculating financial metrics:', error)
    return {
      mrr: 0, arr: 0, growth: 0, balance: 0, burnRate: 0, runway: 0, health: 'unknown'
    }
  }
}

// Helper: Calculate project metrics
const calculateProjectMetrics = async (company = null) => {
  const filters = company ? { company: normalizeCompanyName(company) } : {}

  try {
    const projects = await directus.get('projects', { limit: -1 }, filters)

    const total = projects.length
    const active = projects.filter(p => p.status === 'active' || p.status === 'in_progress').length
    const completed = projects.filter(p => p.status === 'completed' || p.status === 'done').length
    const onHold = projects.filter(p => p.status === 'on_hold' || p.status === 'paused').length
    const pending = projects.filter(p => p.status === 'pending' || p.status === 'planned').length

    // Overdue projects
    const today = new Date()
    const overdue = projects.filter(p => {
      const deadline = new Date(p.end_date || p.deadline || p.due_date)
      return p.status !== 'completed' && deadline < today
    }).length

    // Budget calculations
    const totalBudget = projects.reduce((sum, p) =>
      sum + parseFloat(p.budget || 0), 0
    )
    const totalSpent = projects.reduce((sum, p) =>
      sum + parseFloat(p.spent || p.actual_cost || 0), 0
    )

    const budgetUtilization = totalBudget > 0
      ? (totalSpent / totalBudget) * 100
      : 0

    // Average completion
    const avgCompletion = projects.length > 0
      ? projects.reduce((sum, p) => sum + (p.progress || p.completion || 0), 0) / projects.length
      : 0

    return {
      total,
      active,
      completed,
      onHold,
      pending,
      overdue,
      totalBudget: Math.round(totalBudget),
      totalSpent: Math.round(totalSpent),
      budgetUtilization: Math.round(budgetUtilization),
      avgCompletion: Math.round(avgCompletion)
    }
  } catch (error) {
    console.error('Error calculating project metrics:', error)
    return {
      total: 0, active: 0, completed: 0, onHold: 0, pending: 0, overdue: 0,
      totalBudget: 0, totalSpent: 0, budgetUtilization: 0, avgCompletion: 0
    }
  }
}

// Helper: Calculate people metrics
const calculatePeopleMetrics = async (company = null) => {
  const filters = company ? { company: normalizeCompanyName(company) } : {}

  try {
    const people = await directus.get('people', { limit: -1 }, filters)

    const total = people.length
    // Filter employees only (is_employee = true)
    const active = people.filter(p => p.is_employee === true || p.status === 'active').length

    // Unique departments (use department_id or employee_company)
    const departments = new Set(
      people.map(p => p.department_id || p.employee_company || p.department).filter(Boolean)
    ).size || 1

    // Unique roles (use role_id or position)
    const roles = new Set(
      people.map(p => p.role_id || p.position || p.role).filter(Boolean)
    ).size || 1

    // Calculate turnover (simplified - would need historical data)
    const turnoverRate = 8.5 // Placeholder - needs historical data

    // Average tenure
    const avgTenure = people.reduce((sum, p) => {
      if (p.start_date || p.hire_date) {
        const hireDate = new Date(p.start_date || p.hire_date)
        const years = (new Date() - hireDate) / (365 * 24 * 60 * 60 * 1000)
        return sum + years
      }
      return sum
    }, 0) / (total || 1)

    return {
      total,
      active,
      departments,
      roles,
      turnoverRate,
      avgTenure: Math.round(avgTenure * 10) / 10
    }
  } catch (error) {
    console.error('Error calculating people metrics:', error)
    return {
      total: 0, active: 0, departments: 0, roles: 0, turnoverRate: 0, avgTenure: 0
    }
  }
}

// Helper: Generate alerts from real data
const generateAlerts = (financial, projects) => {
  const alerts = []

  if (financial.growth < 0) {
    alerts.push({
      id: 'negative-growth',
      type: 'warning',
      message: `Croissance négative de ${Math.abs(financial.growth).toFixed(1)}%`
    })
  }

  if (financial.runway < 6) {
    alerts.push({
      id: 'low-runway',
      type: 'error',
      message: `Runway critique: ${financial.runway} mois restants`
    })
  }

  if (projects.overdue > 0) {
    alerts.push({
      id: 'overdue-projects',
      type: 'warning',
      message: `${projects.overdue} projet(s) en retard`
    })
  }

  if (financial.burnRate > financial.mrr) {
    alerts.push({
      id: 'negative-cashflow',
      type: 'error',
      message: `Cash flow négatif: burn rate supérieur au MRR`
    })
  }

  return alerts
}

// Helper: Calculate overall health score
const calculateHealthScore = (financial, projects, people) => {
  let score = 50

  // Financial health (40 points max)
  if (financial.growth > 10) score += 15
  else if (financial.growth > 0) score += 8
  else score -= 10

  if (financial.runway > 12) score += 15
  else if (financial.runway > 6) score += 8
  else score -= 15

  // Project health (30 points max)
  const projectCompletion = projects.active / (projects.total || 1)
  if (projectCompletion > 0.8) score += 15
  else if (projectCompletion > 0.5) score += 8

  if (projects.overdue === 0) score += 10
  else if (projects.overdue <= 2) score += 5

  // People health (20 points max)
  if (people.active / (people.total || 1) > 0.9) score += 10
  if (people.turnoverRate < 10) score += 10
  else if (people.turnoverRate < 15) score += 5

  return Math.max(0, Math.min(100, Math.round(score)))
}

// Helper: Generate trends data
const generateTrendsData = async (period = '30d', company = null) => {
  const filters = company ? { company: normalizeCompanyName(company) } : {}
  const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[period] || 30

  try {
    const [invoices, supplierInvoices] = await Promise.all([
      directus.get('client_invoices', { limit: -1 }, filters),
      directus.get('supplier_invoices', { limit: -1 }, filters)
    ])

    const revenue = []
    const expenses = []

    // Generate daily data points
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      const dateStr = date.toLocaleDateString('fr-CH')

      // Calculate daily revenue
      const dayInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date_created || inv.date || inv.issue_date)
        return invDate.toDateString() === date.toDateString()
      })

      const dayRevenue = dayInvoices.reduce((sum, inv) =>
        sum + parseFloat(inv.amount || inv.total_amount || 0), 0
      )

      revenue.push({
        date: dateStr,
        value: Math.round(dayRevenue),
        count: dayInvoices.length
      })

      // Calculate daily expenses
      const dayExpenses = supplierInvoices.filter(exp => {
        const expDate = new Date(exp.date_created || exp.date || exp.issue_date)
        return expDate.toDateString() === date.toDateString()
      })

      const dayExpense = dayExpenses.reduce((sum, exp) =>
        sum + Math.abs(parseFloat(exp.amount || exp.total_amount || 0)), 0
      )

      expenses.push({
        date: dateStr,
        value: Math.round(dayExpense),
        count: dayExpenses.length
      })
    }

    return { revenue, expenses }
  } catch (error) {
    console.error('Error generating trends:', error)
    return { revenue: [], expenses: [] }
  }
}

// Main KPI API
export const kpiAPI = {
  /**
   * Get KPI overview for dashboard
   */
  async getOverview(company = null) {
    if (USE_MOCK) {
      console.log('📊 Using mock KPI data')
      return mockAPI.getOverview(company)
    }

    try {
      console.log('📊 Fetching real KPI data from Directus...')

      // Fetch all metrics in parallel
      const [financial, projects, people] = await Promise.all([
        calculateFinancialMetrics(company),
        calculateProjectMetrics(company),
        calculatePeopleMetrics(company)
      ])

      // Generate alerts
      const alerts = generateAlerts(financial, projects)

      // Calculate health score
      const overallHealth = calculateHealthScore(financial, projects, people)

      // Performance metrics
      const performance = {
        nps: 75, // Would need customer feedback data
        ebitda: financial.mrr > 0
          ? ((financial.mrr - financial.burnRate) / financial.mrr) * 100
          : 0,
        ltvcac: 3.2, // Would need CAC data
        cashRunway: financial.runway
      }

      const overview = {
        financial,
        projects,
        people,
        performance,
        alerts,
        summary: {
          totalRevenue: financial.arr,
          activeProjects: projects.active,
          totalEmployees: people.total,
          overallHealth
        }
      }

      console.log('✅ KPI data loaded successfully')
      return overview
    } catch (error) {
      console.warn('❌ Error fetching KPIs, falling back to mock data:', error)
      return mockAPI.getOverview(company)
    }
  },

  /**
   * Get trends data for charts
   */
  async getTrends(period = '30d', company = null) {
    if (USE_MOCK) {
      return mockAPI.getTrends(period, company)
    }

    try {
      return await generateTrendsData(period, company)
    } catch (error) {
      console.warn('Error fetching trends, using mock data:', error)
      return mockAPI.getTrends(period, company)
    }
  },

  /**
   * Get KPIs for a specific company
   */
  async getCompanyKPIs(company) {
    if (USE_MOCK) {
      return mockAPI.getCompanyKPIs(company)
    }

    try {
      const [overview, trends] = await Promise.all([
        this.getOverview(company),
        this.getTrends('30d', company)
      ])

      return { overview, trends }
    } catch (error) {
      console.warn('Error fetching company KPIs:', error)
      return mockAPI.getCompanyKPIs(company)
    }
  },

  /**
   * Check API connection status
   */
  async checkConnection() {
    if (USE_MOCK) {
      return { connected: false, mode: 'mock' }
    }

    try {
      const isConnected = await directus.testConnection()
      return {
        connected: isConnected,
        mode: isConnected ? 'live' : 'mock'
      }
    } catch (error) {
      return { connected: false, mode: 'mock', error: error.message }
    }
  }
}

export default kpiAPI

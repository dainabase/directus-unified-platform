// Mock KPI data for development/demo
export const generateMockKPIData = (company = null, period = '30d') => {
  // Base metrics that vary by company
  const companyMetrics = {
    'HYPERVISUAL': {
      mrr: 45000,
      growth: 15.2,
      balance: 180000,
      burnRate: 28000,
      projects: { total: 8, active: 6 },
      employees: 12
    },
    'DAINAMICS': {
      mrr: 32000,
      growth: 8.5,
      balance: 120000,
      burnRate: 22000,
      projects: { total: 6, active: 4 },
      employees: 8
    },
    'LEXAIA': {
      mrr: 18000,
      growth: 22.3,
      balance: 95000,
      burnRate: 15000,
      projects: { total: 4, active: 3 },
      employees: 6
    },
    'ENKI_REALTY': {
      mrr: 25000,
      growth: -2.1,
      balance: 85000,
      burnRate: 18000,
      projects: { total: 5, active: 4 },
      employees: 10
    },
    'TAKEOUT': {
      mrr: 12000,
      growth: 35.8,
      balance: 65000,
      burnRate: 12000,
      projects: { total: 3, active: 3 },
      employees: 5
    }
  }

  // Calculate aggregated metrics if no specific company
  const getMetrics = () => {
    if (company && companyMetrics[company]) {
      return companyMetrics[company]
    }
    
    // Aggregate all companies
    const all = Object.values(companyMetrics)
    return {
      mrr: all.reduce((sum, c) => sum + c.mrr, 0),
      growth: all.reduce((sum, c) => sum + c.growth, 0) / all.length,
      balance: all.reduce((sum, c) => sum + c.balance, 0),
      burnRate: all.reduce((sum, c) => sum + c.burnRate, 0),
      projects: {
        total: all.reduce((sum, c) => sum + c.projects.total, 0),
        active: all.reduce((sum, c) => sum + c.projects.active, 0)
      },
      employees: all.reduce((sum, c) => sum + c.employees, 0)
    }
  }

  const metrics = getMetrics()

  // Generate overview data
  const overview = {
    financial: {
      mrr: metrics.mrr,
      arr: metrics.mrr * 12,
      growth: metrics.growth,
      balance: metrics.balance,
      burnRate: metrics.burnRate,
      runway: Math.round(metrics.balance / metrics.burnRate),
      health: metrics.balance / metrics.burnRate > 12 ? 'healthy' : 
              metrics.balance / metrics.burnRate > 6 ? 'warning' : 'critical'
    },
    projects: {
      total: metrics.projects.total,
      active: metrics.projects.active,
      completed: Math.floor(metrics.projects.total * 0.2),
      onHold: 1,
      pending: metrics.projects.total - metrics.projects.active - Math.floor(metrics.projects.total * 0.2) - 1,
      overdue: Math.max(0, Math.floor(metrics.projects.active * 0.15)),
      avgCompletion: 65 + Math.random() * 20,
      totalBudget: metrics.mrr * 3.5,
      totalSpent: metrics.mrr * 2.1,
      budgetUtilization: 60 + Math.random() * 20
    },
    people: {
      total: metrics.employees,
      active: Math.floor(metrics.employees * 0.95),
      departments: Math.ceil(metrics.employees / 8),
      roles: Math.ceil(metrics.employees / 3),
      turnoverRate: 5 + Math.random() * 10,
      avgTenure: 1.5 + Math.random() * 2
    },
    performance: {
      nps: 70 + Math.random() * 20,
      ebitda: 10 + Math.random() * 15,
      ltvcac: 2.5 + Math.random() * 2,
      cashRunway: Math.round(metrics.balance / metrics.burnRate)
    },
    alerts: generateAlerts(company, metrics),
    summary: {
      totalRevenue: metrics.mrr * 12,
      activeProjects: metrics.projects.active,
      totalEmployees: metrics.employees,
      overallHealth: calculateHealth(metrics)
    }
  }

  // Generate trends data
  const trends = generateTrendsData(period, metrics)

  return { overview, trends }
}

// Generate alerts based on metrics
const generateAlerts = (company, metrics) => {
  const alerts = []
  
  if (metrics.growth < 0) {
    alerts.push({
      id: 'negative-growth',
      type: 'warning',
      message: `Croissance négative de ${Math.abs(metrics.growth).toFixed(1)}% ${company ? `pour ${company}` : ''}`,
      company
    })
  }
  
  if (metrics.balance / metrics.burnRate < 6) {
    alerts.push({
      id: 'low-runway',
      type: 'error',
      message: `Runway critique: ${Math.round(metrics.balance / metrics.burnRate)} mois restants`,
      company
    })
  }
  
  if (Math.random() > 0.7) {
    alerts.push({
      id: 'overdue-invoices',
      type: 'warning',
      message: `${Math.floor(Math.random() * 5) + 1} factures en retard (${Math.floor(Math.random() * 50000 + 10000)} CHF)`,
      company
    })
  }
  
  return alerts
}

// Calculate overall health score
const calculateHealth = (metrics) => {
  let score = 50
  
  // Growth impact
  if (metrics.growth > 10) score += 20
  else if (metrics.growth > 0) score += 10
  else score -= 10
  
  // Runway impact
  const runway = metrics.balance / metrics.burnRate
  if (runway > 12) score += 20
  else if (runway > 6) score += 10
  else score -= 20
  
  // Project completion
  const activeRatio = metrics.projects.active / metrics.projects.total
  if (activeRatio > 0.8) score += 10
  else if (activeRatio > 0.6) score += 5
  
  return Math.max(0, Math.min(100, score))
}

// Generate trends data based on period
const generateTrendsData = (period, metrics) => {
  const days = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  }[period] || 30

  const data = {
    revenue: [],
    customers: [],
    projects: [],
    expenses: []
  }

  // Generate data points
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))
    const dateStr = date.toLocaleDateString('fr-CH')
    
    // Revenue trend with growth
    const growthFactor = 1 + (metrics.growth / 100) * (i / days)
    const dailyRevenue = (metrics.mrr / 30) * growthFactor * (0.8 + Math.random() * 0.4)
    
    data.revenue.push({
      date: dateStr,
      value: Math.round(dailyRevenue),
      growth: metrics.growth * (0.8 + Math.random() * 0.4)
    })
    
    // Customer trend
    data.customers.push({
      date: dateStr,
      value: Math.floor(metrics.employees * (0.9 + Math.random() * 0.2)),
      new: Math.floor(Math.random() * 3),
      churned: Math.floor(Math.random() * 2)
    })
    
    // Project completion
    data.projects.push({
      date: dateStr,
      completed: Math.floor(Math.random() * 2),
      started: Math.floor(Math.random() * 3),
      active: metrics.projects.active + Math.floor((Math.random() - 0.5) * 2)
    })
    
    // Expenses
    const dailyExpense = (metrics.burnRate / 30) * (0.9 + Math.random() * 0.2)
    data.expenses.push({
      date: dateStr,
      value: Math.round(dailyExpense),
      category: ['Salaries', 'Infrastructure', 'Marketing', 'R&D'][Math.floor(Math.random() * 4)]
    })
  }

  return data
}

// Mock API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API endpoints
export const mockAPI = {
  async getOverview(company = null) {
    await delay(300 + Math.random() * 200)
    const { overview } = generateMockKPIData(company)
    return overview
  },

  async getTrends(period = '30d', company = null) {
    await delay(400 + Math.random() * 300)
    const { trends } = generateMockKPIData(company, period)
    return trends
  },

  async getCompanyKPIs(company) {
    await delay(350 + Math.random() * 250)
    const { overview, trends } = generateMockKPIData(company, '30d')
    return { overview, trends }
  }
}
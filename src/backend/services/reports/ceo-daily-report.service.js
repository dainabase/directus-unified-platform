/**
 * CEO Daily Report Service — S-06-04
 * Aggrege les KPIs multi-entreprise pour un rapport quotidien CEO.
 *
 * Collecte :
 *  - Tresorerie (bank_accounts)
 *  - CA mois (client_invoices paid)
 *  - Factures en retard (client_invoices overdue)
 *  - Tickets support ouverts (support_tickets)
 *  - Projets actifs (projects)
 *  - Leads pipeline (leads)
 *  - Alertes actives (automation_rules triggered)
 *
 * @version 1.0.0
 */

import axios from 'axios'

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055'
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hbQz-9935crJ2YkLul_zpQJDBw2M-y5v'

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    Authorization: `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
})

/**
 * Safe Directus fetch — returns [] on any error
 */
async function safeFetch(collection, params = {}) {
  try {
    const { data } = await api.get(`/items/${collection}`, { params })
    return data?.data || []
  } catch {
    return []
  }
}

/**
 * Generate CEO Daily Report
 * @param {string|null} ownerCompanyId — filter by company or null for all
 * @returns {object} Aggregated report
 */
export async function generateCEOReport(ownerCompanyId = null) {
  const companyFilter = ownerCompanyId
    ? { owner_company: { _eq: ownerCompanyId } }
    : {}

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const today = now.toISOString().split('T')[0]

  // Parallel fetches for speed
  const [
    bankAccounts,
    paidInvoices,
    overdueInvoices,
    openTickets,
    activeProjects,
    openLeads,
    companies
  ] = await Promise.all([
    // Cash position
    safeFetch('bank_accounts', {
      fields: ['id', 'name', 'balance', 'currency', 'owner_company'],
      filter: { ...companyFilter },
      limit: 50
    }),

    // Revenue this month (paid invoices)
    safeFetch('client_invoices', {
      fields: ['id', 'amount', 'status', 'payment_date', 'owner_company'],
      filter: {
        _and: [
          { status: { _eq: 'paid' } },
          { payment_date: { _gte: startOfMonth } },
          ...(ownerCompanyId ? [{ owner_company: { _eq: ownerCompanyId } }] : [])
        ]
      },
      limit: 500
    }),

    // Overdue invoices
    safeFetch('client_invoices', {
      fields: ['id', 'amount', 'due_date', 'client_name', 'status', 'owner_company'],
      filter: {
        _and: [
          { status: { _in: ['sent', 'overdue', 'pending'] } },
          { due_date: { _lt: today } },
          ...(ownerCompanyId ? [{ owner_company: { _eq: ownerCompanyId } }] : [])
        ]
      },
      limit: 100
    }),

    // Open support tickets
    safeFetch('support_tickets', {
      fields: ['id', 'subject', 'priority', 'status', 'date_created'],
      filter: {
        _and: [
          { status: { _in: ['open', 'in_progress', 'pending'] } },
          ...(ownerCompanyId ? [{ owner_company: { _eq: ownerCompanyId } }] : [])
        ]
      },
      limit: 100
    }),

    // Active projects
    safeFetch('projects', {
      fields: ['id', 'name', 'status', 'owner_company'],
      filter: {
        _and: [
          { status: { _in: ['active', 'in_progress'] } },
          ...(ownerCompanyId ? [{ owner_company: { _eq: ownerCompanyId } }] : [])
        ]
      },
      limit: 100
    }),

    // Open leads
    safeFetch('leads', {
      fields: ['id', 'name', 'status', 'estimated_value', 'owner_company'],
      filter: {
        _and: [
          { status: { _in: ['new', 'contacted', 'qualified', 'proposal'] } },
          ...(ownerCompanyId ? [{ owner_company: { _eq: ownerCompanyId } }] : [])
        ]
      },
      limit: 100
    }),

    // Companies for context
    safeFetch('owner_companies', {
      fields: ['id', 'name', 'code'],
      limit: 10
    })
  ])

  // ── Aggregate metrics ──
  const cashBalance = bankAccounts.reduce((s, a) => s + (Number(a.balance) || 0), 0)
  const revenueMonth = paidInvoices.reduce((s, i) => s + (Number(i.amount) || 0), 0)
  const overdueAmount = overdueInvoices.reduce((s, i) => s + (Number(i.amount) || 0), 0)
  const pipelineValue = openLeads.reduce((s, l) => s + (Number(l.estimated_value) || 0), 0)
  const criticalTickets = openTickets.filter(t => t.priority === 'critical' || t.priority === 'high').length

  // ── Build alerts ──
  const alerts = []
  if (overdueInvoices.length > 0) {
    alerts.push({
      severity: 'warning',
      message: `${overdueInvoices.length} facture(s) en retard pour un total de CHF ${overdueAmount.toLocaleString('fr-CH')}`
    })
  }
  if (criticalTickets > 0) {
    alerts.push({
      severity: 'critical',
      message: `${criticalTickets} ticket(s) critique(s)/haute priorite ouverts`
    })
  }
  if (cashBalance < 50000) {
    alerts.push({
      severity: 'warning',
      message: `Tresorerie basse: CHF ${cashBalance.toLocaleString('fr-CH')}`
    })
  }

  return {
    generated_at: now.toISOString(),
    date: today,
    company: ownerCompanyId || 'all',
    companies: companies.map(c => ({ id: c.id, name: c.name, code: c.code })),

    kpis: {
      cash_balance: Math.round(cashBalance * 100) / 100,
      revenue_month: Math.round(revenueMonth * 100) / 100,
      overdue_amount: Math.round(overdueAmount * 100) / 100,
      overdue_count: overdueInvoices.length,
      open_tickets: openTickets.length,
      critical_tickets: criticalTickets,
      active_projects: activeProjects.length,
      pipeline_value: Math.round(pipelineValue * 100) / 100,
      open_leads: openLeads.length
    },

    alerts,

    details: {
      top_overdue: overdueInvoices.slice(0, 5).map(i => ({
        id: i.id,
        client: i.client_name,
        amount: Number(i.amount) || 0,
        due_date: i.due_date
      })),
      recent_tickets: openTickets.slice(0, 5).map(t => ({
        id: t.id,
        subject: t.subject,
        priority: t.priority,
        date: t.date_created
      }))
    }
  }
}

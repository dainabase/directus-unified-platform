/**
 * Finance API Service — S-03-06
 * Fonctions pures pour les requetes finance vers Directus.
 */

import api from '../../lib/axios'

/**
 * Fetch KPIs finance pour une entreprise
 * Aggrege depuis client_invoices, supplier_invoices, bank_transactions, payments
 */
export async function fetchFinanceKPIs(company) {
  const filter = company && company !== 'all'
    ? { owner_company: { _eq: company } }
    : {}

  const [
    receivablesRes,
    payablesRes,
    bankRes,
    revenuesRes,
    expensesRes
  ] = await Promise.all([
    // Creances clients (factures non payees)
    api.get('/items/client_invoices', {
      params: {
        filter: { ...filter, status: { _in: ['pending', 'sent', 'overdue'] } },
        aggregate: { count: '*', sum: { total_ttc: 'total' } }
      }
    }).catch(() => ({ data: { data: [{ count: 0, sum: { total_ttc: 0 } }] } })),

    // Dettes fournisseurs (factures non payees)
    api.get('/items/supplier_invoices', {
      params: {
        filter: { ...filter, status: { _in: ['pending', 'overdue'] } },
        aggregate: { count: '*', sum: { total_ttc: 'total' } }
      }
    }).catch(() => ({ data: { data: [{ count: 0, sum: { total_ttc: 0 } }] } })),

    // Solde bancaire (derniere balance connue)
    api.get('/items/bank_accounts', {
      params: {
        filter: company && company !== 'all' ? { owner_company: { _eq: company } } : {},
        aggregate: { sum: { balance: 'total' } }
      }
    }).catch(() => ({ data: { data: [{ sum: { balance: 0 } }] } })),

    // CA du mois (factures payees ce mois)
    api.get('/items/client_invoices', {
      params: {
        filter: {
          ...filter,
          status: { _eq: 'paid' },
          date_created: { _gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString() }
        },
        aggregate: { sum: { total_ttc: 'total' } }
      }
    }).catch(() => ({ data: { data: [{ sum: { total_ttc: 0 } }] } })),

    // Depenses du mois
    api.get('/items/supplier_invoices', {
      params: {
        filter: {
          ...filter,
          status: { _eq: 'paid' },
          date_created: { _gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString() }
        },
        aggregate: { sum: { total_ttc: 'total' } }
      }
    }).catch(() => ({ data: { data: [{ sum: { total_ttc: 0 } }] } }))
  ])

  const r = receivablesRes.data?.data?.[0] || {}
  const p = payablesRes.data?.data?.[0] || {}
  const b = bankRes.data?.data?.[0] || {}
  const rev = revenuesRes.data?.data?.[0] || {}
  const exp = expensesRes.data?.data?.[0] || {}

  const cashPosition = Number(b.sum?.balance) || 0
  const receivables = Number(r.sum?.total_ttc) || 0
  const payables = Number(p.sum?.total_ttc) || 0
  const monthlyRevenue = Number(rev.sum?.total_ttc) || 0
  const monthlyExpenses = Number(exp.sum?.total_ttc) || 0
  const netCashFlow = monthlyRevenue - monthlyExpenses

  return {
    cash_position: { amount: cashPosition, trend: 0 },
    receivables: { amount: receivables, count: Number(r.count) || 0 },
    payables: { amount: payables, count: Number(p.count) || 0 },
    monthly_revenue: { amount: monthlyRevenue, trend: 0 },
    net_cash_flow: { amount: netCashFlow },
    runway: { months: monthlyExpenses > 0 ? Math.round(cashPosition / monthlyExpenses) : 99 }
  }
}

/**
 * Fetch transactions recentes
 */
export async function fetchRecentTransactions(company, limit = 10) {
  const filter = company && company !== 'all'
    ? { owner_company: { _eq: company } }
    : {}

  const { data } = await api.get('/items/bank_transactions', {
    params: {
      filter,
      fields: ['id', 'date', 'description', 'amount', 'currency', 'reconciled', 'type'],
      sort: ['-date'],
      limit
    }
  }).catch(() => ({ data: { data: [] } }))

  return data?.data || []
}

/**
 * Fetch evolution mensuelle (12 derniers mois)
 */
export async function fetchCashFlowEvolution(company) {
  const months = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = d.toISOString()
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString()
    const label = d.toLocaleDateString('fr-CH', { month: 'short', year: '2-digit' })

    months.push({ start, end, label })
  }

  // Fetch aggregated monthly data in parallel
  const results = await Promise.all(
    months.map(async (m) => {
      const filter = company && company !== 'all'
        ? { owner_company: { _eq: company } }
        : {}

      const [revRes, expRes] = await Promise.all([
        api.get('/items/client_invoices', {
          params: {
            filter: { ...filter, status: { _eq: 'paid' }, date_created: { _between: [m.start, m.end] } },
            aggregate: { sum: { total_ttc: 'total' } }
          }
        }).catch(() => ({ data: { data: [{ sum: { total_ttc: 0 } }] } })),
        api.get('/items/supplier_invoices', {
          params: {
            filter: { ...filter, status: { _eq: 'paid' }, date_created: { _between: [m.start, m.end] } },
            aggregate: { sum: { total_ttc: 'total' } }
          }
        }).catch(() => ({ data: { data: [{ sum: { total_ttc: 0 } }] } }))
      ])

      const revenue = Number(revRes.data?.data?.[0]?.sum?.total_ttc) || 0
      const expenses = Number(expRes.data?.data?.[0]?.sum?.total_ttc) || 0

      return {
        month: m.label,
        revenue: Math.round(revenue),
        expenses: Math.round(expenses),
        profit: Math.round(revenue - expenses)
      }
    })
  )

  return results
}

/**
 * Fetch alertes finance
 */
export async function fetchFinanceAlerts(company) {
  const filter = company && company !== 'all'
    ? { owner_company: { _eq: company } }
    : {}

  const alerts = []

  // Factures en retard
  const { data: overdue } = await api.get('/items/client_invoices', {
    params: {
      filter: { ...filter, status: { _in: ['pending', 'sent'] }, due_date: { _lt: new Date().toISOString() } },
      fields: ['id', 'invoice_number', 'client_name', 'total_ttc', 'due_date'],
      limit: 5
    }
  }).catch(() => ({ data: { data: [] } }))

  ;(overdue?.data || []).forEach((inv) => {
    alerts.push({
      id: `overdue-${inv.id}`,
      severity: 'high',
      title: `Facture ${inv.invoice_number} en retard`,
      description: `${inv.client_name} — ${new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(inv.total_ttc)}`,
      action: 'send_reminder',
      reference_id: inv.id
    })
  })

  // Gros paiements a venir (>5000 CHF dans 7 jours)
  const in7days = new Date()
  in7days.setDate(in7days.getDate() + 7)

  const { data: upcoming } = await api.get('/items/supplier_invoices', {
    params: {
      filter: { ...filter, status: { _eq: 'pending' }, due_date: { _lte: in7days.toISOString() }, total_ttc: { _gte: 5000 } },
      fields: ['id', 'invoice_number', 'supplier_name', 'total_ttc', 'due_date'],
      limit: 3
    }
  }).catch(() => ({ data: { data: [] } }))

  ;(upcoming?.data || []).forEach((inv) => {
    alerts.push({
      id: `upcoming-${inv.id}`,
      severity: 'medium',
      title: `Paiement fournisseur a venir`,
      description: `${inv.supplier_name} — ${new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(inv.total_ttc)} — echeance ${new Date(inv.due_date).toLocaleDateString('fr-CH')}`,
      action: 'schedule_payment',
      reference_id: inv.id
    })
  })

  return alerts
}

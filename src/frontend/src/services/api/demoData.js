// Données de démonstration pour le Dashboard SuperAdmin V3
export const demoData = {
  metrics: {
    cash_runway: 7.3,
    cash_runway_trend: 'up',
    arr: 2400000,
    arr_trend: 'up',
    mrr: 200000,
    mrr_trend: 'up',
    ebitda_margin: 18.5,
    ebitda_trend: 'up',
    ltv_cac_ratio: 4.2,
    ltv_cac_trend: 'neutral',
    nps: 72,
    nps_trend: 'up'
  },
  tasks: {
    urgent: [
      { id: 1, name: 'Valider devis BNP Paribas', priority: 1, deadline: '2025-01-08', status: 'urgent' },
      { id: 2, name: 'Call client Société Générale', priority: 2, deadline: '2025-01-07', status: 'urgent' },
      { id: 3, name: 'Review projet Digital Factory', priority: 3, deadline: '2025-01-09', status: 'pending' },
      { id: 4, name: 'Signature contrat Microsoft', priority: 1, deadline: '2025-01-07', status: 'urgent' },
      { id: 5, name: 'Validation maquettes Apple', priority: 2, deadline: '2025-01-10', status: 'pending' }
    ],
    total: 47
  },
  projects: {
    active: [
      { id: 1, name: 'Refonte Site BNP', status: 'active', progress: 65, company: 'HYPERVISUAL' },
      { id: 2, name: 'App Mobile SG', status: 'active', progress: 45, company: 'DAINAMICS' },
      { id: 3, name: 'Migration Cloud Azure', status: 'active', progress: 80, company: 'DAINAMICS' },
      { id: 4, name: 'Audit Juridique GDPR', status: 'active', progress: 30, company: 'LEXAIA' }
    ],
    total: 8
  },
  pipeline: {
    opportunities: [
      { id: 1, name: 'Contrat Microsoft', value: 350000, status: 'negotiation', probability: 80 },
      { id: 2, name: 'Projet Apple Store', value: 250000, status: 'proposal', probability: 60 },
      { id: 3, name: 'Refonte Amazon', value: 450000, status: 'lead', probability: 30 },
      { id: 4, name: 'Contrat Tesla', value: 280000, status: 'negotiation', probability: 75 },
      { id: 5, name: 'Site L\'Oréal', value: 180000, status: 'proposal', probability: 50 }
    ],
    totalValue: 1510000
  },
  invoices: {
    unpaid: [
      { id: 1, client_name: 'BNP Paribas', amount: 45000, due_date: '2025-01-15' },
      { id: 2, client_name: 'Société Générale', amount: 32000, due_date: '2025-01-20' },
      { id: 3, client_name: 'Crédit Agricole', amount: 28000, due_date: '2025-01-18' }
    ],
    overdue: [
      { id: 1, client_name: 'Orange', amount: 18000, due_date: '2024-12-15' },
      { id: 2, client_name: 'Bouygues', amount: 15000, due_date: '2024-12-20' },
      { id: 3, client_name: 'Total', amount: 12000, due_date: '2024-12-10' }
    ],
    totalUnpaid: 105000,
    totalOverdue: 45000
  },
  cashFlow: [
    { date: '2025-01-06', amount: 42000, type: 'income' },
    { date: '2025-01-07', amount: -15000, type: 'expense' },
    { date: '2025-01-08', amount: 28000, type: 'income' },
    { date: '2025-01-09', amount: -10000, type: 'expense' },
    { date: '2025-01-10', amount: 35000, type: 'income' },
    { date: '2025-01-11', amount: -20000, type: 'expense' },
    { date: '2025-01-12', amount: 50000, type: 'income' }
  ]
}

export default demoData
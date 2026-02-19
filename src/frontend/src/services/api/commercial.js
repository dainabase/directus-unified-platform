/**
 * Commercial API Service — S-02-06
 * Fonctions pures utilisant l'instance axios centralisée.
 * Couvre les collections quotes et proposals.
 */

import api from '../../lib/axios'

// ── Quotes (devis clients) ──

export const getQuotes = async (filters = {}) => {
  const params = {
    fields: [
      'id', 'quote_number', 'status', 'description', 'project_type',
      'subtotal', 'tax_rate', 'tax_amount', 'total', 'currency',
      'sent_at', 'viewed_at', 'signed_at', 'valid_until',
      'is_signed', 'cgv_accepted', 'deposit_percentage', 'deposit_amount',
      'deposit_paid', 'created_at', 'updated_at',
      'contact_id.id', 'contact_id.first_name', 'contact_id.last_name',
      'company_id.id', 'company_id.name',
      'owner_company_id.id', 'owner_company_id.name'
    ],
    sort: ['-created_at'],
    limit: filters.limit || 25,
    page: filters.page || 1,
    meta: 'total_count'
  }

  const filter = {}
  if (filters.status && filters.status !== 'all') filter.status = { _eq: filters.status }
  if (filters.owner_company_id && filters.owner_company_id !== 'all') {
    filter.owner_company_id = { _eq: filters.owner_company_id }
  }
  if (Object.keys(filter).length > 0) params.filter = filter

  const { data } = await api.get('/items/quotes', { params })
  return {
    quotes: data?.data || [],
    total: data?.meta?.total_count || 0
  }
}

export const getQuote = async (id) => {
  const { data } = await api.get(`/items/quotes/${id}`, {
    params: {
      fields: [
        '*',
        'contact_id.id', 'contact_id.first_name', 'contact_id.last_name', 'contact_id.email',
        'company_id.id', 'company_id.name',
        'owner_company_id.id', 'owner_company_id.name'
      ]
    }
  })
  return data?.data
}

export const createQuote = async (quoteData) => {
  const { data } = await api.post('/items/quotes', quoteData)
  return data?.data
}

export const updateQuote = async (id, quoteData) => {
  const { data } = await api.patch(`/items/quotes/${id}`, quoteData)
  return data?.data
}

// ── Proposals (devis prestataires) ──

export const getProposals = async (filters = {}) => {
  const params = {
    fields: [
      'id', 'status', 'description', 'amount',
      'proposed_price', 'proposed_delay_days', 'notes',
      'deadline_response', 'created_at', 'viewed_at', 'responded_at',
      'availability_date',
      'project_id.id', 'project_id.name'
    ],
    sort: ['-created_at'],
    limit: filters.limit || 50
  }

  const filter = {}
  if (filters.status && filters.status !== 'all') filter.status = { _eq: filters.status }
  if (filters.project_id) filter.project_id = { _eq: filters.project_id }
  if (Object.keys(filter).length > 0) params.filter = filter

  const { data } = await api.get('/items/proposals', { params })
  return data?.data || []
}

export const updateProposal = async (id, proposalData) => {
  const { data } = await api.patch(`/items/proposals/${id}`, proposalData)
  return data?.data
}

export const createProposal = async (proposalData) => {
  const { data } = await api.post('/items/proposals', proposalData)
  return data?.data
}

// ── Calculs CHF automatiques ──

/**
 * Calcule les totaux d'un devis à partir des lignes.
 * @param {Array} items - Lignes du devis [{description, quantity, unit_price}]
 * @param {number} taxRate - Taux TVA en % (défaut 8.1 = TVA Suisse 2025)
 * @param {number} depositPercent - Pourcentage acompte (défaut 60)
 * @returns {{ subtotal, taxAmount, total, depositAmount }}
 */
export const calculateQuoteTotals = (items = [], taxRate = 8.1, depositPercent = 60) => {
  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.unit_price) || 0
    return sum + (qty * price)
  }, 0)

  const taxAmount = Math.round(subtotal * taxRate / 100 * 100) / 100
  const total = Math.round((subtotal + taxAmount) * 100) / 100
  const depositAmount = Math.round(total * depositPercent / 100 * 100) / 100

  return { subtotal, taxAmount, total, depositAmount }
}

/**
 * Formate un montant en CHF avec locale fr-CH.
 * @param {number} amount
 * @returns {string}
 */
export const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)

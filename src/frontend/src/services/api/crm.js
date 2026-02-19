/**
 * CRM Service Layer — Phase 5
 * Lead activities, contacts, companies, support tickets, notifications, marketing
 */

import api from '../../lib/axios'

// ── Shared helpers ──────────────────────────────────────────
export const COMPANIES = [
  { value: '2d6b906a-5b8a-4d9e-a37b-aee8c1281b22', label: 'HYPERVISUAL' },
  { value: '55483d07-6621-43d4-89a9-5ebbffe86fea', label: 'DAINAMICS' },
  { value: '6f4bc42a-d083-4df5-ace3-6b910164ae18', label: 'ENKI REALTY' },
  { value: '8db45f3b-4021-9556-3acaa5f35b3f', label: 'LEXAIA' },
  { value: 'a1313adf-0347-424b-aff2-c5f0b33c4a05', label: 'TAKEOUT' }
]

export const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 }).format(v || 0)

export const companyLabel = (id) =>
  COMPANIES.find(c => c.value === id)?.label || id || '—'

// ── Lead Activities ─────────────────────────────────────────
export async function fetchLeadActivities(leadId) {
  const { data } = await api.get('/items/lead_activities', {
    params: {
      fields: ['*'],
      filter: leadId ? { lead_id: { _eq: leadId } } : undefined,
      sort: ['-date_created'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

export async function createLeadActivity(payload) {
  const { data } = await api.post('/items/lead_activities', payload)
  return data?.data
}

export async function updateLeadActivity(id, payload) {
  const { data } = await api.patch(`/items/lead_activities/${id}`, payload)
  return data?.data
}

export async function deleteLeadActivity(id) {
  await api.delete(`/items/lead_activities/${id}`)
}

// ── People (Contacts) ───────────────────────────────────────
export async function fetchPeople({ company, search, limit = -1 } = {}) {
  const filter = {}
  if (company && company !== 'all') filter.owner_company = { _eq: company }
  if (search) {
    filter._or = [
      { first_name: { _icontains: search } },
      { last_name: { _icontains: search } },
      { email: { _icontains: search } }
    ]
  }
  const { data } = await api.get('/items/people', {
    params: {
      fields: ['*'],
      filter: Object.keys(filter).length ? filter : undefined,
      sort: ['-date_created'],
      limit
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

export async function createPerson(payload) {
  const { data } = await api.post('/items/people', payload)
  return data?.data
}

export async function updatePerson(id, payload) {
  const { data } = await api.patch(`/items/people/${id}`, payload)
  return data?.data
}

export async function deletePerson(id) {
  await api.delete(`/items/people/${id}`)
}

// ── Companies ───────────────────────────────────────────────
export async function fetchCompanies({ company, search, limit = -1 } = {}) {
  const filter = {}
  if (company && company !== 'all') filter.owner_company = { _eq: company }
  if (search) {
    filter._or = [
      { name: { _icontains: search } },
      { industry: { _icontains: search } }
    ]
  }
  const { data } = await api.get('/items/companies', {
    params: {
      fields: ['*'],
      filter: Object.keys(filter).length ? filter : undefined,
      sort: ['-date_created'],
      limit
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

export async function createCompany(payload) {
  const { data } = await api.post('/items/companies', payload)
  return data?.data
}

export async function updateCompany(id, payload) {
  const { data } = await api.patch(`/items/companies/${id}`, payload)
  return data?.data
}

export async function deleteCompany(id) {
  await api.delete(`/items/companies/${id}`)
}

// ── Support Tickets ─────────────────────────────────────────
export async function fetchTickets({ company, status, priority, search, limit = -1 } = {}) {
  const filter = {}
  if (company && company !== 'all') filter.owner_company = { _eq: company }
  if (status && status !== 'all') filter.status = { _eq: status }
  if (priority && priority !== 'all') filter.priority = { _eq: priority }
  if (search) {
    filter._or = [
      { subject: { _icontains: search } },
      { description: { _icontains: search } }
    ]
  }
  const { data } = await api.get('/items/support_tickets', {
    params: {
      fields: ['*'],
      filter: Object.keys(filter).length ? filter : undefined,
      sort: ['-date_created'],
      limit
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

export async function createTicket(payload) {
  const { data } = await api.post('/items/support_tickets', payload)
  return data?.data
}

export async function updateTicket(id, payload) {
  const { data } = await api.patch(`/items/support_tickets/${id}`, payload)
  return data?.data
}

export async function deleteTicket(id) {
  await api.delete(`/items/support_tickets/${id}`)
}

// ── Notifications ───────────────────────────────────────────
export async function fetchNotifications({ user_id, is_read, limit = 50 } = {}) {
  const filter = {}
  if (user_id) filter.user_id = { _eq: user_id }
  if (typeof is_read === 'boolean') filter.is_read = { _eq: is_read }
  const { data } = await api.get('/items/notifications', {
    params: {
      fields: ['*'],
      filter: Object.keys(filter).length ? filter : undefined,
      sort: ['-date_created'],
      limit
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/items/notifications/${id}`, { is_read: true })
  return data?.data
}

export async function markAllNotificationsRead(userId) {
  // Batch mark all as read — use SEARCH endpoint for batch update
  const unread = await fetchNotifications({ user_id: userId, is_read: false })
  const promises = unread.map(n => api.patch(`/items/notifications/${n.id}`, { is_read: true }))
  await Promise.all(promises).catch(() => {})
}

export async function createNotification(payload) {
  const { data } = await api.post('/items/notifications', payload)
  return data?.data
}

// ── Campaigns (Marketing) ───────────────────────────────────
export async function fetchCampaigns({ company, status, search, limit = -1 } = {}) {
  const filter = {}
  if (company && company !== 'all') filter.owner_company = { _eq: company }
  if (status && status !== 'all') filter.status = { _eq: status }
  if (search) {
    filter._or = [
      { name: { _icontains: search } },
      { description: { _icontains: search } }
    ]
  }
  const { data } = await api.get('/items/campaigns', {
    params: {
      fields: ['*'],
      filter: Object.keys(filter).length ? filter : undefined,
      sort: ['-date_created'],
      limit
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

export async function createCampaign(payload) {
  const { data } = await api.post('/items/campaigns', payload)
  return data?.data
}

export async function updateCampaign(id, payload) {
  const { data } = await api.patch(`/items/campaigns/${id}`, payload)
  return data?.data
}

export async function deleteCampaign(id) {
  await api.delete(`/items/campaigns/${id}`)
}

// ── WhatsApp Messages ───────────────────────────────────────
export async function fetchWhatsappMessages({ lead_id, limit = 50 } = {}) {
  const filter = {}
  if (lead_id) filter.lead_id = { _eq: lead_id }
  const { data } = await api.get('/items/whatsapp_messages', {
    params: {
      fields: ['*'],
      filter: Object.keys(filter).length ? filter : undefined,
      sort: ['-date_created'],
      limit
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

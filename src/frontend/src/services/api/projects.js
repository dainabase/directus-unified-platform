/**
 * services/api/projects.js — S-04-01 / S-04-06
 * Pure axios functions for projects, deliverables, time_tracking.
 */

import api from '../../lib/axios'

const COMPANIES = [
  { value: '2d6b906a-5b8a-4d9e-a37b-aee8c1281b22', label: 'HYPERVISUAL' },
  { value: '55483d07-6621-43d4-89a9-5ebbffe86fea', label: 'DAINAMICS' },
  { value: '6f4bc42a-d083-4df5-ace3-6b910164ae18', label: 'ENKI REALTY' },
  { value: '8db45f3b-4021-9556-3acaa5f35b3f', label: 'LEXAIA' },
  { value: 'a1313adf-0347-424b-aff2-c5f0b33c4a05', label: 'TAKEOUT' }
]

export const companyLabel = (id) => COMPANIES.find(c => c.value === id)?.label || id || '—'

const formatCHF = (v) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v || 0)

// ── Projects ──────────────────────────────────────────────

export async function fetchProjects({ company, status, search } = {}) {
  const filter = {}
  if (company && company !== 'all') filter.owner_company = { _eq: company }
  if (status && status !== 'all') filter.status = { _eq: status }
  if (search) filter.name = { _contains: search }

  const { data } = await api.get('/items/projects', {
    params: {
      fields: ['id', 'name', 'status', 'start_date', 'end_date', 'budget', 'client_id', 'main_provider_id', 'owner_company', 'description', 'date_created'],
      filter: Object.keys(filter).length ? filter : undefined,
      sort: ['-date_created'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

export async function fetchProject(id) {
  const { data } = await api.get(`/items/projects/${id}`, {
    params: {
      fields: ['id', 'name', 'status', 'start_date', 'end_date', 'budget', 'client_id', 'main_provider_id', 'owner_company', 'description', 'date_created']
    }
  }).catch(() => ({ data: { data: null } }))
  return data?.data || null
}

export async function createProject(payload) {
  const { data } = await api.post('/items/projects', payload)
  return data?.data
}

export async function updateProject(id, payload) {
  const { data } = await api.patch(`/items/projects/${id}`, payload)
  return data?.data
}

export async function deleteProject(id) {
  await api.delete(`/items/projects/${id}`)
}

// ── Deliverables ──────────────────────────────────────────

export async function fetchDeliverables({ company, projectId, status } = {}) {
  const filter = {}
  if (company && company !== 'all') filter.owner_company = { _eq: company }
  if (projectId) filter.project_id = { _eq: projectId }
  if (status && status !== 'all') filter.status = { _eq: status }

  const { data } = await api.get('/items/deliverables', {
    params: {
      fields: ['id', 'title', 'description', 'status', 'due_date', 'project_id', 'assigned_to', 'parent_task_id', 'owner_company', 'date_created'],
      filter: Object.keys(filter).length ? filter : undefined,
      sort: ['-date_created'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

export async function createDeliverable(payload) {
  const { data } = await api.post('/items/deliverables', payload)
  return data?.data
}

export async function updateDeliverable(id, payload) {
  const { data } = await api.patch(`/items/deliverables/${id}`, payload)
  return data?.data
}

export async function deleteDeliverable(id) {
  await api.delete(`/items/deliverables/${id}`)
}

// ── Time Tracking ─────────────────────────────────────────

export async function fetchTimeEntries({ company, projectId } = {}) {
  const filter = {}
  if (company && company !== 'all') filter.owner_company = { _eq: company }
  if (projectId) {
    // time_tracking may use project_name or project_id — try both
    filter._or = [
      { project_id: { _eq: projectId } },
      { project_name: { _eq: projectId } }
    ]
  }

  const params = {
    fields: ['id', 'project_name', 'project_id', 'hours', 'date', 'description', 'assigned_to', 'owner_company', 'date_created'],
    sort: ['-date'],
    limit: -1
  }
  // Only add filter if we have non-_or filters or projectId
  if (company && company !== 'all') {
    params.filter = { owner_company: { _eq: company } }
  }

  const { data } = await api.get('/items/time_tracking', { params }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

export async function createTimeEntry(payload) {
  const { data } = await api.post('/items/time_tracking', payload)
  return data?.data
}

export async function updateTimeEntry(id, payload) {
  const { data } = await api.patch(`/items/time_tracking/${id}`, payload)
  return data?.data
}

export async function deleteTimeEntry(id) {
  await api.delete(`/items/time_tracking/${id}`)
}

// ── Subscriptions ─────────────────────────────────────────

export async function fetchSubscriptions({ company } = {}) {
  const filter = {}
  if (company && company !== 'all') filter.owner_company = { _eq: company }

  const { data } = await api.get('/items/subscriptions', {
    params: {
      fields: ['*'],
      filter: Object.keys(filter).length ? filter : undefined,
      sort: ['-date_created'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

export async function createSubscription(payload) {
  const { data } = await api.post('/items/subscriptions', payload)
  return data?.data
}

export async function updateSubscription(id, payload) {
  const { data } = await api.patch(`/items/subscriptions/${id}`, payload)
  return data?.data
}

export async function deleteSubscription(id) {
  await api.delete(`/items/subscriptions/${id}`)
}

// ── Signature Logs ────────────────────────────────────────

export async function fetchSignatureLogs({ projectId } = {}) {
  const { data } = await api.get('/items/signature_logs', {
    params: {
      fields: ['id', 'quote_id', 'signer_name', 'signed_at', 'date_created'],
      sort: ['-signed_at'],
      limit: 20
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

export { COMPANIES, formatCHF }

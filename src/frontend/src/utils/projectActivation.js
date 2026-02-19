/**
 * projectActivation.js — REQ-FACT-006
 * Reusable utility for activating a project after payment.
 * Used by InvoicesModule when marking an invoice as paid.
 */

import api from '../lib/axios'

/**
 * Activate a project after deposit/payment received.
 * Updates project status and creates initial deliverables if needed.
 *
 * @param {string} projectId - Directus project ID
 * @param {Object} options
 * @param {string} options.newStatus - Target status (default: 'deposit_received')
 * @param {string} options.invoiceId - The invoice that triggered activation
 * @param {number} options.amountPaid - Amount paid
 * @returns {Promise<Object>} Updated project
 */
export async function activateProject(projectId, options = {}) {
  const {
    newStatus = 'deposit_received',
    invoiceId = null,
    amountPaid = 0
  } = options

  if (!projectId) {
    console.warn('[projectActivation] No projectId provided, skipping')
    return null
  }

  // 1. Update project status
  const { data: projectRes } = await api.patch(`/items/projects/${projectId}`, {
    status: newStatus,
    ...(invoiceId && { last_invoice_id: invoiceId }),
    ...(amountPaid && { amount_paid: amountPaid })
  })

  // 2. If status is deposit_received or in_preparation, create default deliverables
  if (['deposit_received', 'in_preparation'].includes(newStatus)) {
    // Check if project already has deliverables
    const { data: existingDeliverables } = await api.get('/items/deliverables', {
      params: {
        filter: { project_id: { _eq: projectId } },
        limit: 1
      }
    }).catch(() => ({ data: { data: [] } }))

    if (!existingDeliverables?.data?.length) {
      // Create default milestone deliverables
      const defaultDeliverables = [
        { title: 'Kickoff & Brief', milestone_percentage: 0, status: 'pending' },
        { title: 'Conception & Maquettes', milestone_percentage: 25, status: 'pending' },
        { title: 'Production', milestone_percentage: 50, status: 'pending' },
        { title: 'Livraison & Recette', milestone_percentage: 75, status: 'pending' },
        { title: 'Mise en production', milestone_percentage: 100, status: 'pending' }
      ]

      // Get project info for owner_company
      const { data: project } = await api.get(`/items/projects/${projectId}`, {
        params: { fields: ['owner_company'] }
      }).catch(() => ({ data: { data: {} } }))

      const ownerCompany = project?.data?.owner_company

      for (const d of defaultDeliverables) {
        await api.post('/items/deliverables', {
          ...d,
          project_id: projectId,
          owner_company: ownerCompany
        }).catch(() => null) // Don't fail if deliverables creation fails
      }
    }
  }

  return projectRes?.data
}

/**
 * Check if a project can be activated.
 * @param {Object} project
 * @returns {boolean}
 */
export function canActivateProject(project) {
  if (!project) return false
  const activatableStatuses = ['lead', 'quote_sent', 'signed', 'deposit_pending']
  return activatableStatuses.includes(project.status)
}

export default activateProject

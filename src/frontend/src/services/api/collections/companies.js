import directus from '../directus'

export const companiesAPI = {
  // Récupérer toutes les entreprises
  async getAll() {
    return directus.get('companies', {
      fields: ['*'],
      sort: ['name']
    })
  },

  // Récupérer une entreprise avec ses projets
  async getWithProjects(companyId) {
    return directus.getById('companies', companyId, {
      fields: ['*', 'projects.*']
    })
  },

  // Métriques par entreprise
  async getMetrics(companyId) {
    const [projects, invoices, payments] = await Promise.all([
      directus.get('projects', {
        filter: { company: { _eq: companyId } },
        aggregate: { count: '*' }
      }),
      directus.get('client_invoices', {
        filter: { company: { _eq: companyId } },
        aggregate: { sum: ['amount_ttc'] }
      }),
      directus.get('payments', {
        filter: { company: { _eq: companyId } },
        aggregate: { sum: ['amount'] }
      })
    ])
    
    return {
      totalProjects: projects[0]?.count || 0,
      totalRevenue: invoices[0]?.sum?.amount_ttc || 0,
      totalPayments: payments[0]?.sum?.amount || 0
    }
  }
}
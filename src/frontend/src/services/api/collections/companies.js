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

  // Métriques par entreprise - CORRIGÉ avec owner_company et amount
  async getMetrics(companyId) {
    const [projects, invoices, payments] = await Promise.all([
      directus.get('projects', {
        filter: { owner_company: { _eq: companyId } },
        aggregate: { count: '*' }
      }),
      directus.get('client_invoices', {
        filter: { owner_company: { _eq: companyId } },
        aggregate: { sum: ['amount'] } // amount au lieu de amount_ttc
      }),
      directus.get('payments', {
        filter: { owner_company: { _eq: companyId } },
        aggregate: { sum: ['amount'] }
      })
    ])
    
    return {
      totalProjects: projects[0]?.count || 0,
      totalRevenue: invoices[0]?.sum?.amount || 0, // amount au lieu de amount_ttc
      totalPayments: payments[0]?.sum?.amount || 0
    }
  }
}
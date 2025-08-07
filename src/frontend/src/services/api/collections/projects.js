import directus from '../directus'

export const projectsAPI = {
  // Récupérer tous les projets avec filtres
  async getAll(filters = {}) {
    return directus.get('projects', {
      fields: ['*', 'company.name', 'deliverables.*'],
      filter: filters,
      sort: ['-created_at']
    })
  },

  // Projets par statut
  async getByStatus() {
    const statuses = ['in_progress', 'completed', 'on_hold', 'cancelled']
    const results = await Promise.all(
      statuses.map(status => 
        directus.aggregate('projects', {
          filter: { status: { _eq: status } },
          count: '*'
        })
      )
    )
    
    return {
      in_progress: results[0][0]?.count || 0,
      completed: results[1][0]?.count || 0,
      on_hold: results[2][0]?.count || 0,
      cancelled: results[3][0]?.count || 0
    }
  },

  // Timeline des projets
  async getTimeline(limit = 10) {
    return directus.get('projects', {
      fields: ['id', 'name', 'status', 'start_date', 'end_date', 'progress'],
      sort: ['-updated_at'],
      limit
    })
  }
}
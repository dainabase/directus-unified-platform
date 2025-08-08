import directus from '../directus'

export const projectsAPI = {
  // Simplifier - pas de relations ni sort
  async getAll(filters = {}) {
    try {
      console.log('🔄 Fetching all projects...', filters)
      
      const params = {
        fields: ['id', 'name', 'status', 'owner_company', 'budget', 'start_date', 'end_date', 'client_id', 'company_id']
      }
      
      // CORRIGER : Gérer les deux formats de filtre
      if (filters.owner_company) {
        // Si c'est un objet avec _eq (format Directus)
        if (filters.owner_company._eq) {
          params.filter = { owner_company: { _eq: filters.owner_company._eq } }
        } 
        // Si c'est une string directe (ancien format)
        else if (typeof filters.owner_company === 'string') {
          params.filter = { owner_company: { _eq: filters.owner_company } }
        }
        // Si c'est déjà un objet de filtre complet
        else {
          params.filter = filters
        }
      }
      
      const projects = await directus.get('projects', params)
      console.log(`✅ Projects loaded: ${projects.length}`)
      
      if (params.filter?.owner_company?._eq) {
        console.log(`   Filtré pour: ${params.filter.owner_company._eq}`)
      }
      
      return projects || []
    } catch (error) {
      console.error('❌ Error fetching projects:', error)
      return []
    }
  },

  async getByStatus(status) {
    try {
      const projects = await directus.get('projects')
      // Filtrer côté client au lieu du serveur
      const filteredProjects = projects.filter(p => p.status === status)
      
      return {
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        planning: projects.filter(p => p.status === 'planning').length,
        on_hold: projects.filter(p => p.status === 'on_hold').length,
        in_progress: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length
      }
    } catch (error) {
      console.error('Error in getByStatus:', error)
      return {
        active: 0,
        completed: 0, 
        planning: 0,
        on_hold: 0,
        in_progress: 0
      }
    }
  },

  async getStats() {
    try {
      const projects = await directus.get('projects')
      return {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        planning: projects.filter(p => p.status === 'planning').length
      }
    } catch (error) {
      console.error('Error in getStats:', error)
      return { total: 0, active: 0, completed: 0, planning: 0 }
    }
  },

  // Timeline des projets - simplifié
  async getTimeline(limit = 10) {
    try {
      const projects = await directus.get('projects')
      return projects
        .sort((a, b) => new Date(b.date_created || b.created_at) - new Date(a.date_created || a.created_at))
        .slice(0, limit)
        .map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          start_date: p.start_date,
          end_date: p.end_date,
          progress: 50 // Valeur par défaut
        }))
    } catch (error) {
      console.error('Error in getTimeline:', error)
      return []
    }
  }
}
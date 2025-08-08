import directus from '../directus'

export const projectsAPI = {
  // Simplifier - pas de relations ni sort
  async getAll() {
    try {
      console.log('🔄 Fetching all projects...')
      // Requête TRÈS simple pour éviter toute erreur 403
      const projects = await directus.get('projects', {
        fields: ['id', 'name', 'status', 'owner_company', 'budget', 'start_date', 'end_date']
        // PAS de sort, PAS de relations
      })
      console.log(`✅ Projects loaded: ${projects.length}`)
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
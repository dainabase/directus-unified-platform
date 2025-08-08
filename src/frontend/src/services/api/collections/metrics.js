import directus from '../directus'
import { financesAPI } from './finances'
import { addOwnerCompanyToParams } from '../../../utils/filter-helpers'

export const metricsAPI = {
  async getKPIs(filters = {}) {
    try {
      // Préparer les paramètres avec filtre owner_company si nécessaire
      const params = addOwnerCompanyToParams({}, filters)
      
      // Récupérer les données filtrées
      const [people, projects, revenue, runway] = await Promise.all([
        directus.get('people', params),
        directus.get('projects', params),
        financesAPI.getRevenue(filters),
        financesAPI.getRunway(filters)
      ])

      // Calculer les clients actifs à partir des projets filtrés
      const activeClientIds = [...new Set(projects
        .filter(p => p.client_id && (p.status === 'active' || p.status === 'in_progress'))
        .map(p => p.client_id)
      )]
      
      // Si aucun filtre, on peut aussi compter toutes les companies
      let activeClientsCount = activeClientIds.length
      if (!filters.owner_company || Object.keys(params).length === 0) {
        try {
          const companies = await directus.get('companies')
          activeClientsCount = companies.filter(c => c.is_client || c.status === 'active' || !c.status).length
        } catch (error) {
          console.warn('Could not fetch companies for global count, using project-based count')
        }
      }

      // Calculer EBITDA avec les données filtrées
      const totalRevenue = revenue.arr || 0
      const ebitdaMargin = totalRevenue > 0 ? 15 : 0 // Pourcentage simplifié

      // Calculer LTV:CAC avec les clients filtrés
      const avgCustomerValue = activeClientsCount > 0 ? (revenue.arr / activeClientsCount) : 0
      const ltv = avgCustomerValue * 3 // 3 ans de durée moyenne
      const cac = 5000 // Coût acquisition fixe
      const ltvCacRatio = cac > 0 ? (ltv / cac).toFixed(1) : 0

      // NPS calculé sur les projets filtrés
      const completedProjects = projects.filter(p => p.status === 'completed').length
      const nps = completedProjects > 10 ? 42 : 
                 completedProjects > 5 ? 35 : 
                 completedProjects > 0 ? 28 : 0

      return {
        runway: runway.runway,
        runwayStatus: runway.status,
        mrr: revenue.mrr,
        arr: revenue.arr,
        growth: revenue.growth,
        ebitda: ebitdaMargin,
        ltvcac: parseFloat(ltvCacRatio),
        nps: nps,
        teamSize: people.length,
        activeClients: activeClientsCount,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
        completedProjects: completedProjects
      }
    } catch (error) {
      console.error('Error in getKPIs:', error)
      return {
        runway: 0,
        runwayStatus: 'unknown',
        mrr: 0,
        arr: 0,
        growth: 0,
        ebitda: 0,
        ltvcac: 0,
        nps: 0,
        teamSize: 0,
        activeClients: 0,
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0
      }
    }
  },

  // Clients actifs - simplifié
  async getActiveClients(filters = {}) {
    try {
      const params = addOwnerCompanyToParams({}, filters)
      const projects = await directus.get('projects', params)
      
      // Compter les clients uniques avec des projets actifs
      const activeClientIds = [...new Set(projects
        .filter(p => p.client_id && (p.status === 'active' || p.status === 'in_progress'))
        .map(p => p.client_id)
      )]
      
      return {
        count: activeClientIds.length,
        clientIds: activeClientIds // Retourner aussi les IDs si besoin
      }
    } catch (error) {
      console.error('Error getActiveClients:', error)
      return { count: 0, clientIds: [] }
    }
  },

  // Métriques équipe - simplifié
  async getTeamMetrics(filters = {}) {
    try {
      const params = addOwnerCompanyToParams({}, filters)
      const people = await directus.get('people', params)
      return {
        count: people.length,
        productivity: 85.2 // Métrique simulée
      }
    } catch (error) {
      console.error('Error getTeamMetrics:', error)
      return {
        count: 0,
        productivity: 0
      }
    }
  },

  // Simplifier getAlerts - pas de filtres complexes
  async getAlerts(filters = {}) {
    try {
      const params = addOwnerCompanyToParams({}, filters)
      const deliverables = await directus.get('deliverables', params)
      
      // Filtrer côté client
      const urgentTasks = deliverables
        .filter(d => {
          const priority = (d.priority || d.urgency || 'normal').toLowerCase()
          const status = (d.status || 'pending').toLowerCase()
          return ['high', 'urgent', 'critical'].includes(priority) &&
                 !['completed', 'done', 'finished'].includes(status)
        })
        .slice(0, 10)
        .map(task => ({
          id: task.id,
          type: 'task',
          severity: task.priority === 'critical' ? 'error' : 'warning',
          message: `Tâche urgente: ${task.title || task.name || 'Sans titre'}`,
          details: task.description || '',
          timestamp: task.due_date || task.deadline || new Date().toISOString()
        }))

      return urgentTasks
    } catch (error) {
      console.error('Error in getAlerts:', error)
      return []
    }
  },

  // Simplifier getUrgentTasks
  async getUrgentTasks(filters = {}) {
    try {
      const params = addOwnerCompanyToParams({}, filters)
      const deliverables = await directus.get('deliverables', params)
      
      return deliverables
        .filter(d => {
          const priority = (d.priority || 'normal').toLowerCase()
          const status = (d.status || 'pending').toLowerCase()
          return ['high', 'urgent', 'critical'].includes(priority) &&
                 !['completed', 'done'].includes(status)
        })
        .slice(0, 5)
        .map(task => ({
          id: task.id,
          title: task.title || task.name || 'Tâche sans titre',
          priority: task.priority || 'high',
          dueDate: task.due_date || task.deadline,
          status: task.status || 'pending',
          assignee: task.assigned_to
        }))
    } catch (error) {
      console.error('Error in getUrgentTasks:', error)
      return []
    }
  },

  // getInsights avec données filtrées pour contextualiser
  async getInsights(filters = {}) {
    try {
      // Récupérer des données filtrées pour contextualiser les insights
      const [revenue, runway, projects] = await Promise.all([
        financesAPI.getRevenue(filters).catch(() => ({ mrr: 0, arr: 0, growth: 0 })),
        financesAPI.getRunway(filters).catch(() => ({ runway: 0, status: 'unknown' })),
        directus.get('projects', addOwnerCompanyToParams({}, filters)).catch(() => [])
      ])

      // Calculer des métriques spécifiques à l'entreprise
      const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress').length
      const projectEfficiency = projects.length > 0 ? 
        (projects.filter(p => p.status === 'completed').length / projects.length * 100).toFixed(1) : 0

      const insights = [
        {
          id: 'revenue_growth',
          type: revenue.growth > 10 ? 'positive' : revenue.growth > 0 ? 'info' : 'warning',
          title: 'Croissance Revenue',
          message: `MRR ${revenue.growth > 0 ? 'en hausse' : 'en baisse'} de ${Math.abs(revenue.growth)}% ce mois`,
          value: `${revenue.growth > 0 ? '+' : ''}${revenue.growth}%`,
          icon: 'trending-up'
        },
        {
          id: 'cash_runway',
          type: runway.runway > 12 ? 'positive' : runway.runway > 6 ? 'warning' : 'error',
          title: 'Cash Runway',
          message: runway.runway > 12 ? 'Trésorerie saine' : 
                   runway.runway > 6 ? 'Surveiller les dépenses' : 'Attention: runway critique',
          value: `${runway.runway} mois`,
          icon: 'alert-circle'
        },
        {
          id: 'project_efficiency',
          type: projectEfficiency > 70 ? 'positive' : projectEfficiency > 50 ? 'info' : 'warning',
          title: 'Efficacité Projets',
          message: `${activeProjects} projets actifs, ${projectEfficiency}% complétés`,
          value: `${projectEfficiency}%`,
          icon: 'folder'
        }
      ]
      
      return insights
    } catch (error) {
      console.error('Error in getInsights:', error)
      return []
    }
  }
}
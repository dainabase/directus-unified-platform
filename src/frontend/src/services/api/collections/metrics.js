import directus from '../directus'
import { financesAPI } from './finances'

export const metricsAPI = {
  async getKPIs() {
    try {
      const [companies, people, projects, revenue, runway] = await Promise.all([
        directus.get('companies'),
        directus.get('people'),
        directus.get('projects'),
        financesAPI.getRevenue(),
        financesAPI.getRunway()
      ])

      // Calculer EBITDA (simple pour l'instant)
      const ebitdaMargin = 15 // Pourcentage fixe

      // Calculer LTV:CAC
      const avgCustomerValue = revenue.arr / Math.max(companies.length, 1)
      const ltv = avgCustomerValue * 3 // 3 ans de durée moyenne
      const cac = 5000 // Coût acquisition fixe
      const ltvCacRatio = (ltv / cac).toFixed(1)

      // NPS simulé
      const nps = 42

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
        activeClients: companies.filter(c => c.status === 'active' || !c.status).length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
        completedProjects: projects.filter(p => p.status === 'completed').length
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
  async getActiveClients() {
    try {
      const companies = await directus.get('companies')
      return {
        count: companies.filter(c => c.status === 'active' || !c.status).length
      }
    } catch (error) {
      console.error('Error getActiveClients:', error)
      return { count: 0 }
    }
  },

  // Métriques équipe - simplifié
  async getTeamMetrics() {
    try {
      const people = await directus.get('people')
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
  async getAlerts() {
    try {
      const deliverables = await directus.get('deliverables')
      
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
  async getUrgentTasks() {
    try {
      const deliverables = await directus.get('deliverables')
      
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

  // getInsights avec données simulées mais cohérentes
  async getInsights() {
    try {
      // Récupérer des données de base pour contextualiser les insights
      const [revenue, runway] = await Promise.all([
        financesAPI.getRevenue().catch(() => ({ mrr: 0, arr: 0, growth: 0 })),
        financesAPI.getRunway().catch(() => ({ runway: 0, status: 'unknown' }))
      ])

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
          id: 'team_productivity',
          type: 'positive',
          title: 'Productivité équipe',
          message: 'Productivité maintenue à un niveau élevé',
          value: '85.2%',
          icon: 'users'
        }
      ]
      
      return insights
    } catch (error) {
      console.error('Error in getInsights:', error)
      return []
    }
  }
}
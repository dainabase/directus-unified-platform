import directus from '../directus'
import { financesAPI } from './finances'
import { projectsAPI } from './projects'

export const metricsAPI = {
  // KPIs principaux
  async getKPIs() {
    const [revenue, projects, clients, team] = await Promise.all([
      financesAPI.getRevenue(),
      projectsAPI.getByStatus(),
      this.getActiveClients(),
      this.getTeamMetrics()
    ])
    
    // Calculer des métriques supplémentaires
    const ebitda = 18.5 // À calculer selon vos règles
    const ltvcac = 3.2 // À calculer selon vos règles
    const nps = 72 // À récupérer depuis les feedbacks clients
    
    return {
      arr: revenue.arr,
      mrr: revenue.mrr,
      growth: revenue.growth,
      activeProjects: projects.in_progress,
      completedProjects: projects.completed,
      activeClients: clients.count,
      teamSize: team.count,
      productivity: team.productivity,
      ebitda,
      ltvcac,
      nps
    }
  },

  // Clients actifs
  async getActiveClients() {
    const result = await directus.aggregate('companies', {
      filter: {
        type: { _eq: 'client' },
        status: { _eq: 'active' }
      },
      count: '*'
    })
    
    return {
      count: result[0]?.count || 5 // Fallback démo
    }
  },

  // Métriques équipe
  async getTeamMetrics() {
    const team = await directus.aggregate('people', {
      filter: { role: { _in: ['employee', 'contractor'] } },
      count: '*'
    })
    
    const timeTracking = await directus.aggregate('time_tracking', {
      filter: {
        date: {
          _gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      sum: ['hours']
    })
    
    const teamCount = team[0]?.count || 6 // Fallback démo
    const totalHours = timeTracking[0]?.sum_hours || 480 // Fallback démo
    const expectedHours = teamCount * 160 // 160h/mois par personne
    
    return {
      count: teamCount,
      totalHours,
      productivity: totalHours / expectedHours
    }
  },

  // Alertes et notifications
  async getAlerts() {
    const alerts = []
    
    // Vérifier runway
    const runway = await financesAPI.getRunway()
    if (runway.runway < 8) {
      alerts.push({
        id: 'runway',
        type: 'warning',
        title: `Cash runway < 8 mois (${runway.runway} mois)`,
        priority: 'high'
      })
    }
    
    // Vérifier factures en retard
    const overdueInvoices = await directus.aggregate('client_invoices', {
      filter: {
        status: { _eq: 'overdue' }
      },
      count: '*'
    })
    
    const overdueCount = overdueInvoices[0]?.count || 1 // Fallback démo
    if (overdueCount > 0) {
      alerts.push({
        id: 'invoices',
        type: 'info',
        title: `${overdueCount} facture${overdueCount > 1 ? 's' : ''} en retard`,
        priority: 'medium'
      })
    }
    
    // Vérifier projets en retard
    const delayedProjects = await directus.aggregate('projects', {
      filter: {
        status: { _eq: 'in_progress' },
        end_date: { _lt: new Date().toISOString() }
      },
      count: '*'
    })
    
    const delayedCount = delayedProjects[0]?.count || 0
    if (delayedCount > 0) {
      alerts.push({
        id: 'projects',
        type: 'warning',
        title: `${delayedCount} projet${delayedCount > 1 ? 's' : ''} en retard`,
        priority: 'medium'
      })
    }
    
    // Alerte positive si objectifs atteints
    if (runway.status === 'healthy') {
      alerts.push({
        id: 'objectives',
        type: 'success',
        title: 'Objectifs Q4 en bonne voie',
        priority: 'low'
      })
    }
    
    return alerts
  },

  // Actions urgentes
  async getUrgentTasks() {
    // Simuler des tâches urgentes
    return [
      { id: 1, name: 'Révision contrat client', priority: 1, deadline: '15 Dec' },
      { id: 2, name: 'Présentation investisseurs', priority: 2, deadline: '20 Dec' },
      { id: 3, name: 'Audit sécurité', priority: 3, deadline: '18 Dec' }
    ]
  },

  // Insights IA (simulés)
  async getInsights() {
    const revenue = await financesAPI.getRevenue()
    
    return [
      {
        id: 'revenue-growth',
        title: 'Prévision revenus',
        value: `+${revenue.growth || 23}% ce trimestre`,
        type: 'positive'
      },
      {
        id: 'client-retention',
        title: 'Rétention clients',
        value: '95% sur 12 mois',
        type: 'positive'
      }
    ]
  }
}
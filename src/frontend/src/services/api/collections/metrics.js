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
    try {
      // Simplifier en comptant toutes les companies comme clients actifs
      const companies = await directus.get('companies')
      
      return {
        count: companies.length || 27 // Fallback avec nos données
      }
    } catch (error) {
      console.warn('Erreur getActiveClients:', error)
      return {
        count: 27 // Fallback démo
      }
    }
  },

  // Métriques équipe
  async getTeamMetrics() {
    try {
      const people = await directus.get('people')
      
      return {
        count: people.length || 8,
        productivity: 85.2 // Métrique simulée
      }
    } catch (error) {
      console.warn('Erreur getTeamMetrics:', error)
      return {
        count: 8,
        productivity: 85.2
      }
    }
  },

  // Alertes système
  async getAlerts() {
    try {
      // Récupérer les tâches urgentes comme alertes
      const urgentTasks = await directus.get('deliverables', {
        filter: {
          priority: { _in: ['high', 'urgent', 'critical'] },
          status: { _neq: 'completed' }
        },
        limit: 10
      })
      
      return urgentTasks.map(task => ({
        id: task.id,
        type: 'task',
        severity: task.priority === 'critical' ? 'error' : 'warning',
        message: `Tâche urgente: ${task.title}`,
        details: task.description,
        timestamp: task.due_date
      }))
    } catch (error) {
      console.warn('Erreur getAlerts:', error)
      return []
    }
  },

  // Tâches urgentes
  async getUrgentTasks() {
    try {
      const tasks = await directus.get('deliverables', {
        filter: {
          priority: { _in: ['high', 'urgent'] },
          status: { _neq: 'completed' }
        },
        sort: ['due_date'],
        limit: 5
      })
      
      return tasks.map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        dueDate: task.due_date,
        status: task.status,
        assignee: task.assigned_to
      }))
    } catch (error) {
      console.warn('Erreur getUrgentTasks:', error)
      return []
    }
  },

  // Insights et analytics
  async getInsights() {
    try {
      const insights = [
        {
          id: 'revenue_growth',
          title: 'Croissance du CA',
          type: 'positive',
          message: 'Le chiffre d\'affaires a augmenté de 12.5% ce mois',
          value: '+12.5%'
        },
        {
          id: 'cash_flow',
          title: 'Trésorerie',
          type: 'warning',
          message: 'Cash runway de 8 mois, surveiller les dépenses',
          value: '8 mois'
        },
        {
          id: 'team_productivity',
          title: 'Productivité équipe',
          type: 'positive',
          message: 'Productivité en hausse avec 85.2% d\'efficacité',
          value: '85.2%'
        }
      ]
      
      return insights
    } catch (error) {
      console.warn('Erreur getInsights:', error)
      return []
    }
  }
}
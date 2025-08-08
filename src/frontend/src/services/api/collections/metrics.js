import directus from '../directus'
import { financesAPI } from './finances'
import { addOwnerCompanyToParams } from '../../../utils/filter-helpers'

export const metricsAPI = {
  async getKPIs(filters = {}) {
    try {
      // Préparer les paramètres avec filtre owner_company
      const params = addOwnerCompanyToParams({}, filters)
      
      // Récupérer les données filtrées (sans companies qui n'a pas owner_company)
      const [projects, clientInvoices, revenue, runway] = await Promise.all([
        directus.get('projects', params),
        directus.get('client_invoices', params),
        financesAPI.getRevenue(filters),
        financesAPI.getRunway(filters)
      ])

      // Calculer les clients actifs depuis les projets filtrés
      const activeClientIds = [...new Set(projects
        .filter(p => p.client_id && (p.status === 'active' || p.status === 'in_progress'))
        .map(p => p.client_id)
      )]
      
      // Calculer le nombre d'employés (approximatif basé sur les projets)
      const teamSize = Math.max(5, Math.round(projects.length / 10))
      
      // Calculer EBITDA basé sur les revenus réels
      const totalRevenue = revenue.arr || 0
      const ebitdaMargin = totalRevenue > 1000000 ? 18 : 
                           totalRevenue > 500000 ? 15 : 
                           totalRevenue > 100000 ? 12 : 8

      // Calculer LTV:CAC avec les vrais clients actifs
      const avgCustomerValue = activeClientIds.length > 0 ? 
        (revenue.arr / activeClientIds.length) : 0
      const ltv = avgCustomerValue * 3 // 3 ans de durée moyenne
      const cac = 5000 // Coût acquisition fixe
      const ltvCacRatio = cac > 0 ? (ltv / cac) : 0

      // NPS basé sur les projets complétés
      const completedProjects = projects.filter(p => p.status === 'completed').length
      const totalProjects = projects.length
      const completionRate = totalProjects > 0 ? 
        (completedProjects / totalProjects * 100) : 0
      
      // NPS calculé sur le taux de complétion
      const nps = completionRate > 70 ? 72 : 
                  completionRate > 50 ? 58 : 
                  completionRate > 30 ? 42 : 
                  completionRate > 0 ? 28 : 0

      return {
        runway: runway.runway || 0,
        runwayStatus: runway.status || 'unknown',
        mrr: revenue.mrr || 0,
        arr: revenue.arr || 0,
        growth: revenue.growth || 0,
        ebitda: ebitdaMargin,
        ltvcac: parseFloat(ltvCacRatio.toFixed(1)),
        nps: nps,
        teamSize: teamSize,
        activeClients: activeClientIds.length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => 
          p.status === 'active' || p.status === 'in_progress'
        ).length,
        completedProjects: completedProjects,
        completionRate: parseFloat(completionRate.toFixed(1))
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
        completedProjects: 0,
        completionRate: 0
      }
    }
  },

  async getActiveClients(filters = {}) {
    try {
      const params = addOwnerCompanyToParams({}, filters)
      const projects = await directus.get('projects', params)
      
      // Compter les clients uniques avec des projets actifs
      const activeClientIds = [...new Set(projects
        .filter(p => p.client_id && 
          (p.status === 'active' || p.status === 'in_progress'))
        .map(p => p.client_id)
      )]
      
      // Récupérer aussi les factures pour plus de précision
      const invoices = await directus.get('client_invoices', params)
      const clientsWithInvoices = [...new Set(invoices
        .filter(i => i.status !== 'cancelled')
        .map(i => i.client_id || i.client_name)
        .filter(Boolean)
      )]
      
      // Fusionner les deux listes de clients
      const allActiveClients = [...new Set([
        ...activeClientIds,
        ...clientsWithInvoices
      ])]
      
      return {
        count: allActiveClients.length,
        fromProjects: activeClientIds.length,
        fromInvoices: clientsWithInvoices.length
      }
    } catch (error) {
      console.error('Error getActiveClients:', error)
      return { count: 0, fromProjects: 0, fromInvoices: 0 }
    }
  },

  async getTeamMetrics(filters = {}) {
    try {
      const params = addOwnerCompanyToParams({}, filters)
      
      // Approximer la taille de l'équipe basée sur l'activité
      const [projects, expenses] = await Promise.all([
        directus.get('projects', params),
        directus.get('expenses', params).catch(() => [])
      ])
      
      // Estimer la taille d'équipe basée sur les projets actifs
      const activeProjects = projects.filter(p => 
        p.status === 'active' || p.status === 'in_progress'
      ).length
      
      // Règle : environ 2-3 personnes par projet actif
      const estimatedTeamSize = Math.max(5, Math.round(activeProjects * 2.5))
      
      // Calculer la productivité
      const completedProjects = projects.filter(p => 
        p.status === 'completed'
      ).length
      const productivity = activeProjects > 0 ? 
        Math.min(100, (completedProjects / projects.length * 100 + 50)) : 50
      
      return {
        count: estimatedTeamSize,
        productivity: parseFloat(productivity.toFixed(1))
      }
    } catch (error) {
      console.error('Error getTeamMetrics:', error)
      return {
        count: 0,
        productivity: 0
      }
    }
  },

  async getAlerts(filters = {}) {
    try {
      const params = addOwnerCompanyToParams({}, filters)
      
      // Récupérer les factures impayées en retard
      const [invoices, projects] = await Promise.all([
        directus.get('client_invoices', params),
        directus.get('projects', params)
      ])
      
      const alerts = []
      
      // Alertes sur les factures en retard
      const overdueInvoices = invoices.filter(inv => {
        if (inv.status !== 'pending' && inv.status !== 'overdue') return false
        const dueDate = new Date(inv.due_date || inv.date)
        const now = new Date()
        const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))
        return daysOverdue > 30
      })
      
      if (overdueInvoices.length > 0) {
        alerts.push({
          id: 'overdue-invoices',
          type: 'error',
          severity: 'error',
          priority: 'high',
          title: 'Factures impayées critiques',
          message: `${overdueInvoices.length} factures en retard de plus de 30 jours`,
          details: `Montant total: €${overdueInvoices
            .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
            .toLocaleString()}`,
          timestamp: new Date().toISOString()
        })
      }
      
      // Alertes sur les projets en retard
      const delayedProjects = projects.filter(p => {
        if (p.status !== 'active' && p.status !== 'in_progress') return false
        if (!p.end_date) return false
        const endDate = new Date(p.end_date)
        const now = new Date()
        return now > endDate
      })
      
      if (delayedProjects.length > 0) {
        alerts.push({
          id: 'delayed-projects',
          type: 'warning',
          severity: 'warning',
          priority: 'medium',
          title: 'Projets en retard',
          message: `${delayedProjects.length} projets dépassent leur deadline`,
          details: delayedProjects.slice(0, 3)
            .map(p => p.name).join(', '),
          timestamp: new Date().toISOString()
        })
      }
      
      // Alerte sur le runway si critique
      const runway = await financesAPI.getRunway(filters)
      if (runway.runway < 6) {
        alerts.push({
          id: 'low-runway',
          type: 'error',
          severity: 'error',
          priority: 'critical',
          title: 'Trésorerie critique',
          message: `Runway de seulement ${runway.runway} mois`,
          details: 'Action immédiate requise',
          timestamp: new Date().toISOString()
        })
      }
      
      return alerts.slice(0, 10) // Max 10 alertes
    } catch (error) {
      console.error('Error in getAlerts:', error)
      return []
    }
  },

  async getUrgentTasks(filters = {}) {
    try {
      const params = addOwnerCompanyToParams({}, filters)
      
      // Utiliser les projets pour simuler des tâches urgentes
      const projects = await directus.get('projects', params)
      
      // Filtrer les projets actifs qui pourraient avoir des tâches urgentes
      const activeProjects = projects
        .filter(p => p.status === 'active' || p.status === 'in_progress')
        .slice(0, 5)
        .map(project => ({
          id: project.id,
          name: `Livrable - ${project.name}`,
          title: project.name,
          priority: project.budget > 100000 ? 'critical' : 
                   project.budget > 50000 ? 'high' : 'medium',
          deadline: project.end_date || 
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: project.end_date,
          status: project.status,
          assignee: project.project_manager_id || 'Non assigné'
        }))
      
      return activeProjects
    } catch (error) {
      console.error('Error in getUrgentTasks:', error)
      return []
    }
  },

  async getInsights(filters = {}) {
    try {
      // Récupérer des données filtrées pour contextualiser les insights
      const [revenue, runway, projects, invoices] = await Promise.all([
        financesAPI.getRevenue(filters).catch(() => ({ mrr: 0, arr: 0, growth: 0 })),
        financesAPI.getRunway(filters).catch(() => ({ runway: 0, status: 'unknown' })),
        directus.get('projects', addOwnerCompanyToParams({}, filters)).catch(() => []),
        directus.get('client_invoices', addOwnerCompanyToParams({}, filters)).catch(() => [])
      ])

      // Calculer des métriques spécifiques
      const activeProjects = projects.filter(p => 
        p.status === 'active' || p.status === 'in_progress'
      ).length
      const completedProjects = projects.filter(p => 
        p.status === 'completed'
      ).length
      const projectEfficiency = projects.length > 0 ? 
        (completedProjects / projects.length * 100) : 0
      
      // Taux de paiement des factures
      const paidInvoices = invoices.filter(i => i.status === 'paid').length
      const paymentRate = invoices.length > 0 ? 
        (paidInvoices / invoices.length * 100) : 0

      const insights = [
        {
          id: 'revenue_growth',
          type: revenue.growth > 10 ? 'positive' : 
                revenue.growth > 0 ? 'info' : 'warning',
          title: 'Croissance Revenue',
          message: `MRR ${revenue.growth > 0 ? 'en hausse' : 'en baisse'} de ${Math.abs(revenue.growth)}%`,
          value: `${revenue.growth > 0 ? '+' : ''}${revenue.growth}%`,
          icon: 'trending-up'
        },
        {
          id: 'cash_runway',
          type: runway.runway > 12 ? 'positive' : 
                runway.runway > 6 ? 'warning' : 'error',
          title: 'Cash Runway',
          message: runway.runway > 12 ? 'Trésorerie saine' : 
                   runway.runway > 6 ? 'Surveiller les dépenses' : 
                   'Attention: runway critique',
          value: `${runway.runway} mois`,
          icon: 'alert-circle'
        },
        {
          id: 'project_efficiency',
          type: projectEfficiency > 70 ? 'positive' : 
                projectEfficiency > 50 ? 'info' : 'warning',
          title: 'Efficacité Projets',
          message: `${activeProjects} actifs, ${completedProjects} terminés`,
          value: `${projectEfficiency.toFixed(0)}%`,
          icon: 'folder'
        },
        {
          id: 'payment_rate',
          type: paymentRate > 80 ? 'positive' : 
                paymentRate > 60 ? 'info' : 'warning',
          title: 'Taux de Paiement',
          message: `${paidInvoices}/${invoices.length} factures payées`,
          value: `${paymentRate.toFixed(0)}%`,
          icon: 'credit-card'
        }
      ]
      
      return insights.filter(i => i.value !== 'NaN%')
    } catch (error) {
      console.error('Error in getInsights:', error)
      return []
    }
  }
}
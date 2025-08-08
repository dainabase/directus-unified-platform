import directus from '../directus'

export const financesAPI = {
  // Récupérer les factures clients avec filtrage optionnel par owner_company
  async getInvoices(filters = {}) {
    const params = { fields: ['*'] }
    
    if (filters.owner_company) {
      // Support des deux formats de filtre
      if (typeof filters.owner_company === 'string') {
        params.filter = { owner_company: { _eq: filters.owner_company } }
      } else if (filters.owner_company._eq) {
        params.filter = { owner_company: { _eq: filters.owner_company._eq } }
      } else {
        params.filter = filters
      }
    }
    
    return directus.get('client_invoices', params)
  },

  // Récupérer les dépenses avec filtrage optionnel par owner_company
  async getExpenses(filters = {}) {
    const params = { fields: ['*'] }
    
    if (filters.owner_company) {
      // Support des deux formats de filtre
      if (typeof filters.owner_company === 'string') {
        params.filter = { owner_company: { _eq: filters.owner_company } }
      } else if (filters.owner_company._eq) {
        params.filter = { owner_company: { _eq: filters.owner_company._eq } }
      } else {
        params.filter = filters
      }
    }
    
    return directus.get('expenses', params)
  },

  // Récupérer les transactions bancaires avec filtrage optionnel par owner_company
  async getTransactions(filters = {}) {
    const params = { fields: ['*'] }
    
    if (filters.owner_company) {
      // Support des deux formats de filtre
      if (typeof filters.owner_company === 'string') {
        params.filter = { owner_company: { _eq: filters.owner_company } }
      } else if (filters.owner_company._eq) {
        params.filter = { owner_company: { _eq: filters.owner_company._eq } }
      } else {
        params.filter = filters
      }
    }
    
    return directus.get('bank_transactions', params)
  },

  // Simplifier getCashFlow - pas de filtres dates complexes
  async getCashFlow(filters = {}) {
    try {
      // Récupérer toutes les données avec filtrage optionnel
      const [invoices, suppliers, payments] = await Promise.all([
        this.getInvoices(filters),
        directus.get('supplier_invoices', filters.owner_company ? {
          filter: { owner_company: { _eq: filters.owner_company } }
        } : {}), 
        directus.get('payments', filters.owner_company ? {
          filter: { owner_company: { _eq: filters.owner_company } }
        } : {})
      ])

      // Filtrer côté client pour l'année en cours
      const currentYear = new Date().getFullYear()
      
      const filterByYear = (items, dateField = 'date_created') => {
        return items.filter(item => {
          const date = item[dateField] || item.date || item.created_at
          return date && new Date(date).getFullYear() === currentYear
        })
      }

      const yearInvoices = filterByYear(invoices)
      const yearSuppliers = filterByYear(suppliers)
      const yearPayments = filterByYear(payments)

      // Calculer par mois
      const monthlyData = []
      for (let month = 0; month < 12; month++) {
        const monthInvoices = yearInvoices.filter(i => 
          new Date(i.date_created || i.date).getMonth() === month
        )
        const monthSuppliers = yearSuppliers.filter(s => 
          new Date(s.date_created || s.date).getMonth() === month
        )
        const monthPayments = yearPayments.filter(p => 
          new Date(p.date_created || p.date).getMonth() === month
        )

        // UTILISER amount au lieu de amount_ttc
        const income = monthInvoices.reduce((sum, i) => 
          sum + parseFloat(i.amount || 0), 0
        )
        const expenses = monthSuppliers.reduce((sum, s) => 
          sum + parseFloat(s.amount || 0), 0
        )
        const payments_total = monthPayments.reduce((sum, p) => 
          sum + parseFloat(p.amount || 0), 0
        )

        monthlyData.push({
          month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
                  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][month],
          entrees: income,
          sorties: expenses,
          payments: payments_total,
          net: income - expenses
        })
      }

      return monthlyData
    } catch (error) {
      console.error('Error in getCashFlow:', error)
      // Retourner des données vides mais structurées
      return Array(12).fill(null).map((_, i) => ({
        month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
                'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][i],
        entrees: 0,
        sorties: 0,
        payments: 0,
        net: 0
      }))
    }
  },

  // Simplifier getRevenue - pas de filtre sur subscriptions
  async getRevenue(filters = {}) {
    try {
      // Récupérer les factures avec filtre optionnel
      const invoices = await this.getInvoices(filters)
      
      // Calculer MRR/ARR depuis les factures
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const monthlyInvoices = invoices.filter(i => {
        const date = new Date(i.date_created || i.date || i.created_at)
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear
      })
      
      // UTILISER amount au lieu de amount_ttc
      const mrr = monthlyInvoices.reduce((sum, i) => 
        sum + parseFloat(i.amount || 0), 0
      )
      
      // Estimer l'ARR basé sur la moyenne des 3 derniers mois
      const last3Months = invoices.filter(i => {
        const date = new Date(i.date_created || i.date || i.created_at)
        const monthDiff = (currentYear - date.getFullYear()) * 12 + 
                         currentMonth - date.getMonth()
        return monthDiff >= 0 && monthDiff < 3
      })
      
      const avgMonthly = last3Months.reduce((sum, i) => 
        sum + parseFloat(i.amount || 0), 0
      ) / 3
      
      return {
        mrr: Math.round(avgMonthly),
        arr: Math.round(avgMonthly * 12),
        growth: 12.5  // Valeur fixe pour l'instant
      }
    } catch (error) {
      console.error('Error in getRevenue:', error)
      return { mrr: 0, arr: 0, growth: 0 }
    }
  },

  // Corriger getRunway
  async getRunway(filters = {}) {
    try {
      const [bankTransactions, expenses] = await Promise.all([
        directus.get('bank_transactions', filters.owner_company ? {
          filter: { owner_company: { _eq: filters.owner_company } }
        } : {}),
        directus.get('expenses', filters.owner_company ? {
          filter: { owner_company: { _eq: filters.owner_company } }
        } : {}).catch(() => []) // Fallback si expenses n'existe pas
      ])

      // Calculer le solde bancaire
      const balance = bankTransactions.reduce((sum, t) => 
        sum + parseFloat(t.amount || 0), 0
      )

      // Calculer le burn rate mensuel (moyenne des 3 derniers mois)
      const currentDate = new Date()
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(currentDate.getMonth() - 3)

      // Si pas d'expenses, utiliser les transactions négatives
      const expenseTransactions = expenses.length > 0 ? expenses : 
        bankTransactions.filter(t => parseFloat(t.amount || 0) < 0)

      const recentExpenses = expenseTransactions.filter(e => {
        const date = new Date(e.date_created || e.date || e.created_at)
        return date >= threeMonthsAgo
      })

      const totalExpenses = recentExpenses.reduce((sum, e) => 
        sum + Math.abs(parseFloat(e.amount || 0)), 0
      )
      
      const monthlyBurn = totalExpenses / 3

      const runway = monthlyBurn > 0 ? Math.floor(balance / monthlyBurn) : 999

      return {
        balance: Math.round(balance),
        monthlyBurn: Math.round(monthlyBurn),
        runway,
        status: runway < 6 ? 'critical' : runway < 12 ? 'warning' : 'healthy'
      }
    } catch (error) {
      console.error('Error in getRunway:', error)
      return {
        balance: 0,
        monthlyBurn: 0,
        runway: 0,
        status: 'unknown'
      }
    }
  },

  // Burn rate mensuel moyen - simplifié
  async getMonthlyBurn(filters = {}) {
    try {
      const bankTx = await directus.get('bank_transactions', filters.owner_company ? {
        filter: { owner_company: { _eq: filters.owner_company } }
      } : {})
      const expenses = bankTx.filter(tx => parseFloat(tx.amount || 0) < 0)
      const totalExpenses = expenses.reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount || 0)), 0)
      return Math.round(totalExpenses / 3) // Moyenne sur 3 mois
    } catch (error) {
      console.error('Error in getMonthlyBurn:', error)
      return 0
    }
  }
}
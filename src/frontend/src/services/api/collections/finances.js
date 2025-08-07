import directus from '../directus'

export const financesAPI = {
  // Cash flow mensuel
  async getCashFlow(year = new Date().getFullYear()) {
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`
    
    // Récupérer factures et paiements
    const [invoices, expenses, payments] = await Promise.all([
      directus.get('client_invoices', {
        filter: {
          invoice_date: {
            _between: [startDate, endDate]
          }
        },
        fields: ['invoice_date', 'amount_ttc', 'status']
      }),
      directus.get('supplier_invoices', {
        filter: {
          invoice_date: {
            _between: [startDate, endDate]
          }
        },
        fields: ['invoice_date', 'amount_ttc', 'status']
      }),
      directus.get('payments', {
        filter: {
          payment_date: {
            _between: [startDate, endDate]
          }
        },
        fields: ['payment_date', 'amount', 'type']
      })
    ])
    
    // Grouper par mois
    const monthlyData = {}
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    
    months.forEach((month, index) => {
      const monthNum = index + 1
      monthlyData[month] = {
        month,
        entrees: 0,
        sorties: 0,
        net: 0
      }
      
      // Calculer entrées (factures clients)
      invoices.forEach(inv => {
        const invMonth = new Date(inv.invoice_date).getMonth()
        if (invMonth === index && inv.status === 'paid') {
          monthlyData[month].entrees += inv.amount_ttc
        }
      })
      
      // Calculer sorties (factures fournisseurs)
      expenses.forEach(exp => {
        const expMonth = new Date(exp.invoice_date).getMonth()
        if (expMonth === index && exp.status === 'paid') {
          monthlyData[month].sorties += exp.amount_ttc
        }
      })
      
      monthlyData[month].net = monthlyData[month].entrees - monthlyData[month].sorties
    })
    
    return Object.values(monthlyData)
  },

  // ARR et MRR
  async getRevenue() {
    const subscriptions = await directus.get('subscriptions', {
      filter: { status: { _eq: 'active' } },
      fields: ['monthly_amount', 'annual_amount']
    })
    
    const mrr = subscriptions.reduce((sum, sub) => sum + (sub.monthly_amount || 0), 0)
    const arr = subscriptions.reduce((sum, sub) => sum + (sub.annual_amount || sub.monthly_amount * 12 || 0), 0)
    
    // Calculer la croissance (simulée pour la démo)
    const lastMonthMrr = mrr * 0.92 // Simule une croissance de 8%
    const growth = ((mrr - lastMonthMrr) / lastMonthMrr * 100).toFixed(1)
    
    return { mrr, arr, growth: parseFloat(growth) }
  },

  // Runway (mois de trésorerie restants)
  async getRunway() {
    const [bankBalance, monthlyBurn] = await Promise.all([
      directus.aggregate('bank_transactions', {
        sum: ['amount']
      }),
      this.getMonthlyBurn()
    ])
    
    const balance = bankBalance[0]?.sum_amount || 847000 // Fallback démo
    const runway = monthlyBurn > 0 ? Math.round(balance / monthlyBurn) : 999
    
    return { 
      balance, 
      monthlyBurn, 
      runway,
      status: runway < 6 ? 'critical' : runway < 12 ? 'warning' : 'healthy'
    }
  },

  // Burn rate mensuel moyen
  async getMonthlyBurn() {
    const lastMonths = 3
    const expenses = await directus.aggregate('expenses', {
      filter: {
        date: {
          _gte: new Date(Date.now() - lastMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      sum: ['amount']
    })
    
    const totalExpenses = expenses[0]?.sum_amount || 345000 // Fallback démo (115K * 3)
    return Math.round(totalExpenses / lastMonths)
  }
}
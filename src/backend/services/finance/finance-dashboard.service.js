/**
 * FinanceDashboardService
 * Agregation des donnees financieres pour le dashboard CEO/CFO
 * Support multi-entreprises avec consolidation groupe
 *
 * @version 2.0.0
 * @author Claude Code
 */

import { createDirectus, rest, readItems } from '@directus/sdk';

// Configuration des 5 entreprises
const COMPANIES = {
  HYPERVISUAL: {
    name: 'HYPERVISUAL',
    displayName: 'Hypervisual Sàrl',
    currency: 'CHF',
    color: '#2563eb',
    vatNumber: 'CHE-XXX.XXX.XXX'
  },
  DAINAMICS: {
    name: 'DAINAMICS',
    displayName: 'Dainamics SA',
    currency: 'CHF',
    color: '#7c3aed',
    vatNumber: 'CHE-XXX.XXX.XXX'
  },
  LEXAIA: {
    name: 'LEXAIA',
    displayName: 'Lexaia Sàrl',
    currency: 'CHF',
    color: '#059669',
    vatNumber: 'CHE-XXX.XXX.XXX'
  },
  ENKI_REALTY: {
    name: 'ENKI_REALTY',
    displayName: 'Enki Realty SA',
    currency: 'CHF',
    color: '#dc2626',
    vatNumber: 'CHE-XXX.XXX.XXX'
  },
  TAKEOUT: {
    name: 'TAKEOUT',
    displayName: 'Takeout Sàrl',
    currency: 'CHF',
    color: '#ea580c',
    vatNumber: 'CHE-XXX.XXX.XXX'
  }
};

// Taux de change par defaut (CHF comme base)
const DEFAULT_EXCHANGE_RATES = {
  CHF: 1.0,
  EUR: 0.94,
  USD: 0.88,
  GBP: 1.13
};

// Seuils d'alertes
const ALERT_THRESHOLDS = {
  runway_danger: 3,    // Moins de 3 mois = danger
  runway_warning: 6,   // Moins de 6 mois = warning
  overdue_high: 30,    // Plus de 30 jours = high severity
  overdue_medium: 14,  // Plus de 14 jours = medium severity
  large_receivable: 10000, // Montant important
  large_payable: 5000
};

class FinanceDashboardService {
  constructor() {
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;
    this.exchangeRates = { ...DEFAULT_EXCHANGE_RATES };
    this.lastRatesUpdate = null;
  }

  /**
   * Obtenir client Directus avec SDK v17
   */
  getDirectus() {
    const client = createDirectus(this.directusUrl).with(rest());
    if (this.directusToken) {
      client.setToken(this.directusToken);
    }
    return client;
  }

  /**
   * Mettre a jour les taux de change depuis la DB ou API externe
   */
  async updateExchangeRates() {
    const directus = this.getDirectus();

    try {
      const rates = await directus.request(
        readItems('exchange_rates', {
          filter: { is_active: { _eq: true } },
          sort: ['-date'],
          limit: 10
        })
      );

      if (rates && rates.length > 0) {
        for (const rate of rates) {
          this.exchangeRates[rate.currency] = parseFloat(rate.rate_to_chf) || 1;
        }
        this.lastRatesUpdate = new Date();
      }
    } catch (error) {
      // Utiliser les taux par defaut si erreur
      console.warn('Utilisation taux de change par defaut:', error.message);
    }

    return this.exchangeRates;
  }

  /**
   * Convertir un montant vers CHF
   */
  convertToCHF(amount, currency) {
    const rate = this.exchangeRates[currency] || 1;
    return Math.round(amount * rate * 100) / 100;
  }

  /**
   * Formater un montant monetaire (format suisse)
   */
  formatMoney(amount, currency = 'CHF') {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // ============================================
  // METRIQUES PRINCIPALES (KPIs)
  // ============================================

  /**
   * Obtenir les metriques globales (KPIs)
   */
  async getOverviewMetrics(companyName, period = {}) {
    const directus = this.getDirectus();
    const startDate = period.start || this.getStartOfMonth();
    const endDate = period.end || new Date().toISOString();

    try {
      // Mise a jour des taux si necessaire
      if (!this.lastRatesUpdate || (new Date() - this.lastRatesUpdate) > 3600000) {
        await this.updateExchangeRates();
      }

      const [
        cashPosition,
        receivables,
        payables,
        monthlyRevenue,
        monthlyExpenses,
        vatBalance,
        budgetStatus
      ] = await Promise.all([
        this.getCashPosition(companyName),
        this.getReceivables(companyName),
        this.getPayables(companyName),
        this.getMonthlyRevenue(companyName, startDate, endDate),
        this.getMonthlyExpenses(companyName, startDate, endDate),
        this.getVATBalance(companyName),
        this.getBudgetStatus(companyName, startDate, endDate)
      ]);

      // Calculs derives
      const netCashFlow = monthlyRevenue.total - monthlyExpenses.total;
      const avgMonthlyExpenses = monthlyExpenses.total || 1;
      const runway = Math.round(cashPosition.total / avgMonthlyExpenses);
      const workingCapital = cashPosition.total + receivables.total - payables.total;
      const quickRatio = payables.total > 0
        ? ((cashPosition.total + receivables.total) / payables.total).toFixed(2)
        : 99;

      // Comparaison avec mois precedent
      const previousMonth = await this.getPreviousMonthMetrics(companyName);
      const revenueChange = previousMonth.revenue > 0
        ? ((monthlyRevenue.total - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1)
        : 0;

      return {
        kpis: {
          cash_position: {
            value: cashPosition.total,
            currency: 'CHF',
            label: 'Tresorerie',
            trend: cashPosition.trend,
            trend_percent: cashPosition.trend_percent,
            by_currency: cashPosition.by_currency,
            accounts_count: cashPosition.accounts
          },
          receivables: {
            value: receivables.total,
            count: receivables.count,
            overdue: receivables.overdue,
            overdue_count: receivables.overdue_count,
            currency: 'CHF',
            label: 'A encaisser',
            aging: receivables.aging,
            top_clients: receivables.top_clients
          },
          payables: {
            value: payables.total,
            count: payables.count,
            overdue: payables.overdue,
            overdue_count: payables.overdue_count,
            currency: 'CHF',
            label: 'A payer',
            aging: payables.aging
          },
          monthly_revenue: {
            value: monthlyRevenue.total,
            currency: 'CHF',
            label: 'CA du mois',
            invoices_count: monthlyRevenue.count,
            change_percent: parseFloat(revenueChange),
            by_client: monthlyRevenue.by_client
          },
          monthly_expenses: {
            value: monthlyExpenses.total,
            currency: 'CHF',
            label: 'Depenses du mois',
            by_category: monthlyExpenses.by_category
          },
          net_cash_flow: {
            value: netCashFlow,
            currency: 'CHF',
            label: 'Flux net',
            status: netCashFlow >= 0 ? 'positive' : 'negative'
          },
          runway: {
            value: runway,
            unit: 'mois',
            label: 'Runway',
            status: runway > ALERT_THRESHOLDS.runway_warning ? 'good'
              : runway > ALERT_THRESHOLDS.runway_danger ? 'warning' : 'danger'
          },
          working_capital: {
            value: workingCapital,
            currency: 'CHF',
            label: 'Fonds de roulement',
            status: workingCapital >= 0 ? 'positive' : 'negative'
          },
          quick_ratio: {
            value: parseFloat(quickRatio),
            label: 'Quick Ratio',
            status: quickRatio >= 1.5 ? 'good' : quickRatio >= 1 ? 'warning' : 'danger'
          },
          vat_balance: {
            value: vatBalance.balance,
            due_date: vatBalance.due_date,
            currency: 'CHF',
            label: 'Solde TVA',
            collected: vatBalance.collected,
            deductible: vatBalance.deductible
          },
          budget_variance: {
            value: budgetStatus.variance,
            percent: budgetStatus.variance_percent,
            label: 'Ecart budget',
            status: budgetStatus.variance >= 0 ? 'under' : 'over'
          }
        },
        period: { start: startDate, end: endDate },
        company: COMPANIES[companyName] || { name: companyName },
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erreur getOverviewMetrics:', error);
      throw error;
    }
  }

  /**
   * Position de tresorerie (comptes bancaires)
   */
  async getCashPosition(companyName) {
    const directus = this.getDirectus();

    try {
      const accounts = await directus.request(
        readItems('bank_accounts', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _eq: 'active' }
          },
          fields: ['id', 'account_name', 'iban', 'currency', 'balance', 'last_sync', 'bank_name']
        })
      );

      let totalCHF = 0;
      const byCurrency = {};
      const accountDetails = [];

      for (const account of accounts || []) {
        const balance = parseFloat(account.balance) || 0;
        const balanceCHF = this.convertToCHF(balance, account.currency);
        totalCHF += balanceCHF;

        byCurrency[account.currency] = (byCurrency[account.currency] || 0) + balance;

        accountDetails.push({
          id: account.id,
          name: account.account_name,
          bank: account.bank_name,
          iban: account.iban,
          balance: balance,
          balance_chf: balanceCHF,
          currency: account.currency,
          last_sync: account.last_sync
        });
      }

      // Calculer la tendance
      const trend = await this.calculateCashTrend(directus, companyName);

      return {
        total: Math.round(totalCHF * 100) / 100,
        accounts: (accounts || []).length,
        by_currency: byCurrency,
        account_details: accountDetails,
        trend: trend.amount,
        trend_percent: trend.percent,
        last_updated: accounts?.[0]?.last_sync || new Date().toISOString()
      };

    } catch (error) {
      console.error('Erreur getCashPosition:', error);
      return {
        total: 0,
        accounts: 0,
        by_currency: {},
        account_details: [],
        trend: 0,
        trend_percent: 0
      };
    }
  }

  /**
   * Factures clients a encaisser avec aging
   */
  async getReceivables(companyName) {
    const directus = this.getDirectus();
    const today = new Date().toISOString().split('T')[0];

    try {
      const invoices = await directus.request(
        readItems('client_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _in: ['sent', 'pending', 'overdue', 'partial'] }
          },
          fields: [
            'id', 'invoice_number', 'amount', 'amount_paid',
            'currency', 'due_date', 'status', 'client_name', 'client_id',
            'created_at'
          ]
        })
      );

      let total = 0;
      let overdue = 0;
      let overdueCount = 0;
      const byClient = {};

      // Aging buckets (echeancier)
      const aging = {
        current: 0,      // Non echu
        '1_30': 0,       // 1-30 jours
        '31_60': 0,      // 31-60 jours
        '61_90': 0,      // 61-90 jours
        'over_90': 0     // Plus de 90 jours
      };

      for (const inv of invoices || []) {
        const remaining = (parseFloat(inv.amount) || 0) - (parseFloat(inv.amount_paid) || 0);
        const remainingCHF = this.convertToCHF(remaining, inv.currency);
        total += remainingCHF;

        const dueDate = new Date(inv.due_date);
        const todayDate = new Date(today);
        const daysOverdue = Math.floor((todayDate - dueDate) / (1000 * 60 * 60 * 24));

        if (daysOverdue > 0) {
          overdue += remainingCHF;
          overdueCount++;

          if (daysOverdue <= 30) {
            aging['1_30'] += remainingCHF;
          } else if (daysOverdue <= 60) {
            aging['31_60'] += remainingCHF;
          } else if (daysOverdue <= 90) {
            aging['61_90'] += remainingCHF;
          } else {
            aging.over_90 += remainingCHF;
          }
        } else {
          aging.current += remainingCHF;
        }

        const clientName = inv.client_name || 'Non defini';
        if (!byClient[clientName]) {
          byClient[clientName] = { amount: 0, count: 0, overdue: 0 };
        }
        byClient[clientName].amount += remainingCHF;
        byClient[clientName].count++;
        if (daysOverdue > 0) byClient[clientName].overdue += remainingCHF;
      }

      // Top 5 clients par montant
      const topClients = Object.entries(byClient)
        .sort((a, b) => b[1].amount - a[1].amount)
        .slice(0, 5)
        .map(([name, data]) => ({
          name,
          amount: Math.round(data.amount * 100) / 100,
          count: data.count,
          overdue: Math.round(data.overdue * 100) / 100
        }));

      // Arrondir les valeurs aging
      for (const key in aging) {
        aging[key] = Math.round(aging[key] * 100) / 100;
      }

      return {
        total: Math.round(total * 100) / 100,
        count: (invoices || []).length,
        overdue: Math.round(overdue * 100) / 100,
        overdue_count: overdueCount,
        aging,
        top_clients: topClients,
        by_client: byClient
      };

    } catch (error) {
      console.error('Erreur getReceivables:', error);
      return {
        total: 0, count: 0, overdue: 0, overdue_count: 0,
        aging: { current: 0, '1_30': 0, '31_60': 0, '61_90': 0, over_90: 0 },
        top_clients: [],
        by_client: {}
      };
    }
  }

  /**
   * Factures fournisseurs a payer avec aging
   */
  async getPayables(companyName) {
    const directus = this.getDirectus();
    const today = new Date().toISOString().split('T')[0];

    try {
      const invoices = await directus.request(
        readItems('supplier_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _in: ['pending', 'approved', 'overdue'] }
          },
          fields: [
            'id', 'invoice_number', 'amount', 'amount_paid',
            'currency', 'due_date', 'status', 'supplier_name', 'supplier_id'
          ]
        })
      );

      let total = 0;
      let overdue = 0;
      let overdueCount = 0;

      const aging = {
        current: 0,
        '1_30': 0,
        '31_60': 0,
        '61_90': 0,
        over_90: 0
      };

      const bySupplier = {};

      for (const inv of invoices || []) {
        const remaining = (parseFloat(inv.amount) || 0) - (parseFloat(inv.amount_paid) || 0);
        const remainingCHF = this.convertToCHF(remaining, inv.currency);
        total += remainingCHF;

        const dueDate = new Date(inv.due_date);
        const todayDate = new Date(today);
        const daysOverdue = Math.floor((todayDate - dueDate) / (1000 * 60 * 60 * 24));

        if (daysOverdue > 0) {
          overdue += remainingCHF;
          overdueCount++;

          if (daysOverdue <= 30) {
            aging['1_30'] += remainingCHF;
          } else if (daysOverdue <= 60) {
            aging['31_60'] += remainingCHF;
          } else if (daysOverdue <= 90) {
            aging['61_90'] += remainingCHF;
          } else {
            aging.over_90 += remainingCHF;
          }
        } else {
          aging.current += remainingCHF;
        }

        const supplierName = inv.supplier_name || 'Non defini';
        bySupplier[supplierName] = (bySupplier[supplierName] || 0) + remainingCHF;
      }

      for (const key in aging) {
        aging[key] = Math.round(aging[key] * 100) / 100;
      }

      const topSuppliers = Object.entries(bySupplier)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, amount]) => ({ name, amount: Math.round(amount * 100) / 100 }));

      return {
        total: Math.round(total * 100) / 100,
        count: (invoices || []).length,
        overdue: Math.round(overdue * 100) / 100,
        overdue_count: overdueCount,
        aging,
        top_suppliers: topSuppliers
      };

    } catch (error) {
      console.error('Erreur getPayables:', error);
      return {
        total: 0, count: 0, overdue: 0, overdue_count: 0,
        aging: { current: 0, '1_30': 0, '31_60': 0, '61_90': 0, over_90: 0 },
        top_suppliers: []
      };
    }
  }

  /**
   * Chiffre d'affaires mensuel avec details
   */
  async getMonthlyRevenue(companyName, startDate, endDate) {
    const directus = this.getDirectus();

    try {
      const invoices = await directus.request(
        readItems('client_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _eq: 'paid' },
            paid_at: { _between: [startDate, endDate] }
          },
          fields: ['amount', 'currency', 'client_name', 'paid_at']
        })
      );

      let totalCHF = 0;
      const byClient = {};
      const byDay = {};

      for (const inv of invoices || []) {
        const amount = parseFloat(inv.amount) || 0;
        const amountCHF = this.convertToCHF(amount, inv.currency);
        totalCHF += amountCHF;

        const clientName = inv.client_name || 'Non defini';
        byClient[clientName] = (byClient[clientName] || 0) + amountCHF;

        const day = inv.paid_at?.split('T')[0];
        if (day) {
          byDay[day] = (byDay[day] || 0) + amountCHF;
        }
      }

      const topClients = Object.entries(byClient)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, amount]) => ({ name, amount: Math.round(amount * 100) / 100 }));

      return {
        total: Math.round(totalCHF * 100) / 100,
        count: (invoices || []).length,
        by_client: topClients,
        by_day: byDay
      };

    } catch (error) {
      console.error('Erreur getMonthlyRevenue:', error);
      return { total: 0, count: 0, by_client: [], by_day: {} };
    }
  }

  /**
   * Depenses mensuelles avec categories
   */
  async getMonthlyExpenses(companyName, startDate, endDate) {
    const directus = this.getDirectus();

    try {
      const [supplierInvoices, expenses] = await Promise.all([
        directus.request(
          readItems('supplier_invoices', {
            filter: {
              owner_company: { _eq: companyName },
              status: { _eq: 'paid' },
              paid_at: { _between: [startDate, endDate] }
            },
            fields: ['amount', 'currency', 'category', 'supplier_name']
          })
        ),
        directus.request(
          readItems('expenses', {
            filter: {
              owner_company: { _eq: companyName },
              expense_date: { _between: [startDate, endDate] }
            },
            fields: ['amount', 'currency', 'category', 'description']
          })
        )
      ]);

      let supplierTotal = 0;
      let expensesTotal = 0;
      const byCategory = {};

      for (const inv of supplierInvoices || []) {
        const amount = parseFloat(inv.amount) || 0;
        const amountCHF = this.convertToCHF(amount, inv.currency);
        supplierTotal += amountCHF;

        const category = inv.category || 'Autres';
        byCategory[category] = (byCategory[category] || 0) + amountCHF;
      }

      for (const exp of expenses || []) {
        const amount = parseFloat(exp.amount) || 0;
        const amountCHF = this.convertToCHF(amount, exp.currency);
        expensesTotal += amountCHF;

        const category = exp.category || 'Autres';
        byCategory[category] = (byCategory[category] || 0) + amountCHF;
      }

      // Transformer en array trie
      const categoriesArray = Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .map(([name, amount]) => ({ name, amount: Math.round(amount * 100) / 100 }));

      return {
        total: Math.round((supplierTotal + expensesTotal) * 100) / 100,
        supplier_invoices: Math.round(supplierTotal * 100) / 100,
        other_expenses: Math.round(expensesTotal * 100) / 100,
        by_category: categoriesArray
      };

    } catch (error) {
      console.error('Erreur getMonthlyExpenses:', error);
      return { total: 0, supplier_invoices: 0, other_expenses: 0, by_category: [] };
    }
  }

  /**
   * Solde TVA (collectee - deductible)
   */
  async getVATBalance(companyName) {
    const directus = this.getDirectus();
    const currentQuarter = this.getCurrentQuarter();

    try {
      // TVA collectee sur ventes
      const clientInvoices = await directus.request(
        readItems('client_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _in: ['paid', 'sent', 'pending'] },
            created_at: { _gte: currentQuarter.start }
          },
          fields: ['vat_amount', 'currency']
        })
      );

      // TVA deductible sur achats
      const supplierInvoices = await directus.request(
        readItems('supplier_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _in: ['paid', 'approved'] },
            date: { _gte: currentQuarter.start },
            vat_deductible: { _eq: true }
          },
          fields: ['vat_amount', 'currency']
        })
      );

      let collected = 0;
      let deductible = 0;

      for (const inv of clientInvoices || []) {
        collected += this.convertToCHF(parseFloat(inv.vat_amount) || 0, inv.currency);
      }

      for (const inv of supplierInvoices || []) {
        deductible += this.convertToCHF(parseFloat(inv.vat_amount) || 0, inv.currency);
      }

      const balance = collected - deductible;

      // Date d'echeance declaration TVA (fin du mois suivant le trimestre)
      const dueDate = new Date(currentQuarter.end);
      dueDate.setMonth(dueDate.getMonth() + 2);
      dueDate.setDate(0); // Dernier jour du mois

      return {
        collected: Math.round(collected * 100) / 100,
        deductible: Math.round(deductible * 100) / 100,
        balance: Math.round(balance * 100) / 100,
        quarter: currentQuarter.label,
        due_date: dueDate.toISOString().split('T')[0]
      };

    } catch (error) {
      console.error('Erreur getVATBalance:', error);
      return { collected: 0, deductible: 0, balance: 0, quarter: '', due_date: null };
    }
  }

  /**
   * Statut budget vs reel
   */
  async getBudgetStatus(companyName, startDate, endDate) {
    const directus = this.getDirectus();

    try {
      const [budget, expenses] = await Promise.all([
        directus.request(
          readItems('budgets', {
            filter: {
              owner_company: { _eq: companyName },
              period_start: { _lte: endDate },
              period_end: { _gte: startDate }
            },
            fields: ['amount', 'category']
          })
        ),
        this.getMonthlyExpenses(companyName, startDate, endDate)
      ]);

      const totalBudget = (budget || []).reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
      const totalExpenses = expenses.total;
      const variance = totalBudget - totalExpenses;
      const variancePercent = totalBudget > 0
        ? Math.round((variance / totalBudget) * 100)
        : 0;

      return {
        budget: Math.round(totalBudget * 100) / 100,
        actual: Math.round(totalExpenses * 100) / 100,
        variance: Math.round(variance * 100) / 100,
        variance_percent: variancePercent
      };

    } catch (error) {
      console.error('Erreur getBudgetStatus:', error);
      return { budget: 0, actual: 0, variance: 0, variance_percent: 0 };
    }
  }

  // ============================================
  // ALERTES ET ACTIONS
  // ============================================

  /**
   * Alertes et actions prioritaires
   */
  async getAlerts(companyName) {
    const directus = this.getDirectus();
    const today = new Date().toISOString().split('T')[0];
    const alerts = [];

    try {
      // Factures clients en retard
      const overdueReceivables = await directus.request(
        readItems('client_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _in: ['sent', 'pending'] },
            due_date: { _lt: today }
          },
          fields: ['id', 'invoice_number', 'client_name', 'amount', 'currency', 'due_date', 'reminder_level'],
          sort: ['due_date'],
          limit: 20
        })
      );

      for (const inv of overdueReceivables || []) {
        const daysOverdue = Math.floor((new Date() - new Date(inv.due_date)) / (1000 * 60 * 60 * 24));
        const amount = this.convertToCHF(parseFloat(inv.amount) || 0, inv.currency);

        let severity = 'low';
        let action = 'send_reminder';

        if (daysOverdue > ALERT_THRESHOLDS.overdue_high) {
          severity = 'high';
          action = inv.reminder_level >= 3 ? 'initiate_collection' : 'send_final_reminder';
        } else if (daysOverdue > ALERT_THRESHOLDS.overdue_medium) {
          severity = 'medium';
        }

        if (amount > ALERT_THRESHOLDS.large_receivable) {
          severity = 'high';
        }

        alerts.push({
          type: 'overdue_receivable',
          severity,
          title: `Facture ${inv.invoice_number} en retard`,
          description: `${inv.client_name} - ${this.formatMoney(amount)} - ${daysOverdue} jours`,
          action,
          reference_id: inv.id,
          reference_type: 'client_invoice',
          amount,
          days_overdue: daysOverdue,
          reminder_level: inv.reminder_level || 0
        });
      }

      // Factures fournisseurs a echeance proche
      const dueSoon = new Date();
      dueSoon.setDate(dueSoon.getDate() + 7);

      const upcomingPayables = await directus.request(
        readItems('supplier_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _in: ['pending', 'approved'] },
            due_date: { _between: [today, dueSoon.toISOString().split('T')[0]] }
          },
          fields: ['id', 'invoice_number', 'supplier_name', 'amount', 'currency', 'due_date'],
          sort: ['due_date'],
          limit: 20
        })
      );

      for (const inv of upcomingPayables || []) {
        const amount = this.convertToCHF(parseFloat(inv.amount) || 0, inv.currency);
        const daysUntil = Math.floor((new Date(inv.due_date) - new Date()) / (1000 * 60 * 60 * 24));

        alerts.push({
          type: 'upcoming_payable',
          severity: amount > ALERT_THRESHOLDS.large_payable ? 'medium' : 'low',
          title: `Payer ${inv.supplier_name}`,
          description: `${this.formatMoney(amount)} - Echeance dans ${daysUntil} jours`,
          action: 'schedule_payment',
          reference_id: inv.id,
          reference_type: 'supplier_invoice',
          amount,
          due_date: inv.due_date
        });
      }

      // Factures fournisseurs en retard
      const overduePayables = await directus.request(
        readItems('supplier_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _in: ['pending', 'approved'] },
            due_date: { _lt: today }
          },
          fields: ['id', 'invoice_number', 'supplier_name', 'amount', 'currency', 'due_date'],
          limit: 10
        })
      );

      for (const inv of overduePayables || []) {
        const amount = this.convertToCHF(parseFloat(inv.amount) || 0, inv.currency);
        const daysOverdue = Math.floor((new Date() - new Date(inv.due_date)) / (1000 * 60 * 60 * 24));

        alerts.push({
          type: 'overdue_payable',
          severity: 'high',
          title: `URGENT: Payer ${inv.supplier_name}`,
          description: `${this.formatMoney(amount)} - ${daysOverdue} jours de retard`,
          action: 'pay_now',
          reference_id: inv.id,
          reference_type: 'supplier_invoice',
          amount,
          days_overdue: daysOverdue
        });
      }

      // Rapprochements en attente
      const pendingSuggestions = await directus.request(
        readItems('reconciliation_suggestions', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _eq: 'pending' }
          },
          limit: 1
        })
      );

      if ((pendingSuggestions || []).length > 0) {
        alerts.push({
          type: 'pending_reconciliation',
          severity: 'low',
          title: 'Rapprochements a valider',
          description: 'Des suggestions de rapprochement attendent validation',
          action: 'review_reconciliation'
        });
      }

      // OCR en attente
      const pendingOCR = await directus.request(
        readItems('ocr_documents', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _eq: 'pending' }
          },
          limit: 1
        })
      );

      if ((pendingOCR || []).length > 0) {
        alerts.push({
          type: 'pending_ocr',
          severity: 'low',
          title: 'Documents OCR en attente',
          description: 'Des documents scannés nécessitent validation',
          action: 'review_ocr'
        });
      }

      // Tresorerie faible
      const cashPosition = await this.getCashPosition(companyName);
      const expenses = await this.getMonthlyExpenses(companyName, this.getStartOfMonth(), new Date().toISOString());
      const runway = expenses.total > 0 ? Math.floor(cashPosition.total / expenses.total) : 99;

      if (runway <= ALERT_THRESHOLDS.runway_danger) {
        alerts.push({
          type: 'low_runway',
          severity: 'high',
          title: 'Tresorerie critique',
          description: `Seulement ${runway} mois de runway restants`,
          action: 'review_cash_flow'
        });
      } else if (runway <= ALERT_THRESHOLDS.runway_warning) {
        alerts.push({
          type: 'low_runway',
          severity: 'medium',
          title: 'Tresorerie a surveiller',
          description: `${runway} mois de runway`,
          action: 'review_cash_flow'
        });
      }

      // Tri par severite
      const severityOrder = { high: 0, medium: 1, low: 2 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      return alerts;

    } catch (error) {
      console.error('Erreur getAlerts:', error);
      return [];
    }
  }

  // ============================================
  // EVOLUTION ET TENDANCES
  // ============================================

  /**
   * Evolution sur N mois
   */
  async getMonthlyEvolution(companyName, months = 12) {
    const evolution = [];

    try {
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const [revenue, expenses] = await Promise.all([
          this.getMonthlyRevenue(companyName, startOfMonth, endOfMonth),
          this.getMonthlyExpenses(companyName, startOfMonth, endOfMonth)
        ]);

        const profit = revenue.total - expenses.total;
        const margin = revenue.total > 0
          ? Math.round((profit / revenue.total) * 100)
          : 0;

        evolution.push({
          month: date.toLocaleDateString('fr-CH', { month: 'short', year: 'numeric' }),
          month_key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          revenue: revenue.total,
          expenses: expenses.total,
          profit,
          margin,
          invoices_count: revenue.count
        });
      }

      return evolution;

    } catch (error) {
      console.error('Erreur getMonthlyEvolution:', error);
      return [];
    }
  }

  /**
   * Comparaison YoY (Year over Year)
   */
  async getYearOverYearComparison(companyName) {
    const currentYear = new Date().getFullYear();
    const currentYearStart = `${currentYear}-01-01T00:00:00`;
    const currentDate = new Date().toISOString();

    const previousYear = currentYear - 1;
    const previousYearStart = `${previousYear}-01-01T00:00:00`;
    const previousYearSameDate = new Date();
    previousYearSameDate.setFullYear(previousYear);
    const previousYearEnd = previousYearSameDate.toISOString();

    try {
      const [currentRevenue, previousRevenue, currentExpenses, previousExpenses] = await Promise.all([
        this.getMonthlyRevenue(companyName, currentYearStart, currentDate),
        this.getMonthlyRevenue(companyName, previousYearStart, previousYearEnd),
        this.getMonthlyExpenses(companyName, currentYearStart, currentDate),
        this.getMonthlyExpenses(companyName, previousYearStart, previousYearEnd)
      ]);

      const revenueChange = previousRevenue.total > 0
        ? ((currentRevenue.total - previousRevenue.total) / previousRevenue.total * 100).toFixed(1)
        : 0;

      const expensesChange = previousExpenses.total > 0
        ? ((currentExpenses.total - previousExpenses.total) / previousExpenses.total * 100).toFixed(1)
        : 0;

      const currentProfit = currentRevenue.total - currentExpenses.total;
      const previousProfit = previousRevenue.total - previousExpenses.total;
      const profitChange = previousProfit !== 0
        ? ((currentProfit - previousProfit) / Math.abs(previousProfit) * 100).toFixed(1)
        : 0;

      return {
        current_year: {
          year: currentYear,
          revenue: currentRevenue.total,
          expenses: currentExpenses.total,
          profit: currentProfit,
          invoices: currentRevenue.count
        },
        previous_year: {
          year: previousYear,
          revenue: previousRevenue.total,
          expenses: previousExpenses.total,
          profit: previousProfit,
          invoices: previousRevenue.count
        },
        changes: {
          revenue_percent: parseFloat(revenueChange),
          expenses_percent: parseFloat(expensesChange),
          profit_percent: parseFloat(profitChange)
        }
      };

    } catch (error) {
      console.error('Erreur getYearOverYearComparison:', error);
      return null;
    }
  }

  /**
   * Previsions de tresorerie
   */
  async getCashFlowForecast(companyName, days = 90) {
    const directus = this.getDirectus();
    const today = new Date();
    const forecastEnd = new Date();
    forecastEnd.setDate(forecastEnd.getDate() + days);

    try {
      const cashPosition = await this.getCashPosition(companyName);
      let runningBalance = cashPosition.total;
      const forecast = [];

      // Entrees prevues (factures clients non payees)
      const expectedReceivables = await directus.request(
        readItems('client_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _in: ['sent', 'pending'] },
            due_date: { _lte: forecastEnd.toISOString().split('T')[0] }
          },
          fields: ['amount', 'currency', 'due_date', 'client_name'],
          sort: ['due_date']
        })
      );

      // Sorties prevues (factures fournisseurs non payees)
      const expectedPayables = await directus.request(
        readItems('supplier_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _in: ['pending', 'approved'] },
            due_date: { _lte: forecastEnd.toISOString().split('T')[0] }
          },
          fields: ['amount', 'currency', 'due_date', 'supplier_name'],
          sort: ['due_date']
        })
      );

      // Charges recurrentes mensuelles (estimees)
      const recurringExpenses = await this.estimateRecurringExpenses(companyName);

      // Construire la prevision jour par jour
      const transactions = [];

      for (const inv of expectedReceivables || []) {
        transactions.push({
          date: inv.due_date,
          amount: this.convertToCHF(parseFloat(inv.amount) || 0, inv.currency),
          type: 'in',
          description: `Encaissement ${inv.client_name}`
        });
      }

      for (const inv of expectedPayables || []) {
        transactions.push({
          date: inv.due_date,
          amount: -this.convertToCHF(parseFloat(inv.amount) || 0, inv.currency),
          type: 'out',
          description: `Paiement ${inv.supplier_name}`
        });
      }

      // Ajouter les charges recurrentes
      for (let d = new Date(today); d <= forecastEnd; d.setMonth(d.getMonth() + 1)) {
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        if (monthEnd <= forecastEnd) {
          transactions.push({
            date: monthEnd.toISOString().split('T')[0],
            amount: -recurringExpenses.total,
            type: 'out',
            description: 'Charges recurrentes estimees'
          });
        }
      }

      // Trier par date
      transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Calculer le solde jour par jour
      for (const tx of transactions) {
        runningBalance += tx.amount;
        forecast.push({
          date: tx.date,
          amount: tx.amount,
          type: tx.type,
          description: tx.description,
          balance: Math.round(runningBalance * 100) / 100
        });
      }

      // Points cles
      const minBalance = forecast.length > 0
        ? Math.min(...forecast.map(f => f.balance))
        : runningBalance;
      const minBalanceDate = forecast.find(f => f.balance === minBalance)?.date;

      return {
        starting_balance: cashPosition.total,
        ending_balance: runningBalance,
        min_balance: minBalance,
        min_balance_date: minBalanceDate,
        total_expected_in: (expectedReceivables || []).reduce((sum, inv) =>
          sum + this.convertToCHF(parseFloat(inv.amount) || 0, inv.currency), 0),
        total_expected_out: (expectedPayables || []).reduce((sum, inv) =>
          sum + this.convertToCHF(parseFloat(inv.amount) || 0, inv.currency), 0),
        recurring_monthly: recurringExpenses.total,
        forecast_days: days,
        transactions: forecast,
        risk_level: minBalance < 0 ? 'critical'
          : minBalance < cashPosition.total * 0.2 ? 'high'
          : minBalance < cashPosition.total * 0.5 ? 'medium' : 'low'
      };

    } catch (error) {
      console.error('Erreur getCashFlowForecast:', error);
      return null;
    }
  }

  /**
   * Estimer les depenses recurrentes
   */
  async estimateRecurringExpenses(companyName) {
    const directus = this.getDirectus();

    try {
      // Moyenne des 3 derniers mois
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const expenses = await this.getMonthlyExpenses(
        companyName,
        threeMonthsAgo.toISOString(),
        new Date().toISOString()
      );

      return {
        total: Math.round((expenses.total / 3) * 100) / 100,
        note: 'Moyenne des 3 derniers mois'
      };

    } catch (error) {
      return { total: 0, note: 'Estimation non disponible' };
    }
  }

  // ============================================
  // DASHBOARD CONSOLIDE (GROUPE)
  // ============================================

  /**
   * Dashboard consolide multi-entreprises
   */
  async getConsolidatedDashboard() {
    const companies = Object.keys(COMPANIES);
    const results = {
      companies: [],
      totals: {
        cash_position: 0,
        receivables: 0,
        payables: 0,
        monthly_revenue: 0,
        monthly_expenses: 0
      },
      alerts: [],
      by_company: {}
    };

    try {
      for (const company of companies) {
        const metrics = await this.getOverviewMetrics(company);
        const alerts = await this.getAlerts(company);

        results.companies.push({
          ...COMPANIES[company],
          kpis: metrics.kpis
        });

        results.totals.cash_position += metrics.kpis.cash_position.value;
        results.totals.receivables += metrics.kpis.receivables.value;
        results.totals.payables += metrics.kpis.payables.value;
        results.totals.monthly_revenue += metrics.kpis.monthly_revenue.value;
        results.totals.monthly_expenses += metrics.kpis.monthly_expenses.value;

        results.by_company[company] = metrics.kpis;

        // Ajouter le nom de l'entreprise aux alertes
        for (const alert of alerts) {
          alert.company = company;
          results.alerts.push(alert);
        }
      }

      // Calculs consolides
      results.totals.net_cash_flow = results.totals.monthly_revenue - results.totals.monthly_expenses;
      results.totals.working_capital = results.totals.cash_position + results.totals.receivables - results.totals.payables;

      // Trier les alertes par severite
      const severityOrder = { high: 0, medium: 1, low: 2 };
      results.alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      results.generated_at = new Date().toISOString();

      return results;

    } catch (error) {
      console.error('Erreur getConsolidatedDashboard:', error);
      throw error;
    }
  }

  // ============================================
  // RAPPORTS ET EXPORTS
  // ============================================

  /**
   * Rapport financier complet
   */
  async generateFinancialReport(companyName, period = 'month') {
    const periods = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };

    const days = periods[period] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const [
        overview,
        evolution,
        yoy,
        forecast,
        alerts
      ] = await Promise.all([
        this.getOverviewMetrics(companyName, {
          start: startDate.toISOString(),
          end: new Date().toISOString()
        }),
        this.getMonthlyEvolution(companyName, period === 'year' ? 12 : 6),
        this.getYearOverYearComparison(companyName),
        this.getCashFlowForecast(companyName, 90),
        this.getAlerts(companyName)
      ]);

      return {
        report_type: 'financial_summary',
        company: COMPANIES[companyName] || { name: companyName },
        period: {
          type: period,
          start: startDate.toISOString(),
          end: new Date().toISOString()
        },
        overview: overview.kpis,
        evolution,
        year_over_year: yoy,
        cash_forecast: forecast,
        alerts,
        generated_at: new Date().toISOString(),
        generated_by: 'FinanceDashboardService'
      };

    } catch (error) {
      console.error('Erreur generateFinancialReport:', error);
      throw error;
    }
  }

  /**
   * Export JSON pour integration
   */
  async exportDashboardJSON(companyName) {
    const dashboard = await this.getFullDashboard(companyName);
    return JSON.stringify(dashboard, null, 2);
  }

  /**
   * Export CSV des transactions
   */
  async exportTransactionsCSV(companyName, startDate, endDate) {
    const directus = this.getDirectus();

    try {
      const transactions = await directus.request(
        readItems('bank_transactions', {
          filter: {
            owner_company: { _eq: companyName },
            date: { _between: [startDate, endDate] }
          },
          sort: ['-date'],
          limit: -1
        })
      );

      // Header CSV
      let csv = 'Date,Description,Montant,Devise,Type,Rapproche,Reference\n';

      for (const tx of transactions || []) {
        csv += `"${tx.date}","${(tx.description || '').replace(/"/g, '""')}",${tx.amount},"${tx.currency}","${tx.type}",${tx.reconciled ? 'Oui' : 'Non'},"${tx.reference || ''}"\n`;
      }

      return csv;

    } catch (error) {
      console.error('Erreur exportTransactionsCSV:', error);
      throw error;
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Calculer la tendance de tresorerie
   */
  async calculateCashTrend(directus, companyName) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const transactions = await directus.request(
        readItems('bank_transactions', {
          filter: {
            owner_company: { _eq: companyName },
            date: { _gte: thirtyDaysAgo.toISOString() }
          },
          fields: ['amount', 'currency']
        })
      );

      let netChange = 0;
      for (const tx of transactions || []) {
        netChange += this.convertToCHF(parseFloat(tx.amount) || 0, tx.currency);
      }

      // Calculer le pourcentage par rapport a il y a 30 jours
      const accounts = await directus.request(
        readItems('bank_accounts', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _eq: 'active' }
          },
          fields: ['balance', 'currency']
        })
      );

      let currentBalance = 0;
      for (const acc of accounts || []) {
        currentBalance += this.convertToCHF(parseFloat(acc.balance) || 0, acc.currency);
      }

      const previousBalance = currentBalance - netChange;
      const percent = previousBalance !== 0
        ? Math.round((netChange / Math.abs(previousBalance)) * 100)
        : 0;

      return {
        amount: Math.round(netChange * 100) / 100,
        percent
      };

    } catch (error) {
      return { amount: 0, percent: 0 };
    }
  }

  /**
   * Obtenir les metriques du mois precedent
   */
  async getPreviousMonthMetrics(companyName) {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);

    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const revenue = await this.getMonthlyRevenue(companyName, start, end);
    const expenses = await this.getMonthlyExpenses(companyName, start, end);

    return {
      revenue: revenue.total,
      expenses: expenses.total,
      profit: revenue.total - expenses.total
    };
  }

  /**
   * Obtenir le trimestre courant
   */
  getCurrentQuarter() {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const year = now.getFullYear();

    const start = new Date(year, quarter * 3, 1);
    const end = new Date(year, (quarter + 1) * 3, 0);

    return {
      quarter: quarter + 1,
      year,
      label: `T${quarter + 1} ${year}`,
      start: start.toISOString(),
      end: end.toISOString()
    };
  }

  /**
   * Debut du mois courant
   */
  getStartOfMonth() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
  }

  /**
   * Debut de l'annee courante
   */
  getStartOfYear() {
    const date = new Date();
    return new Date(date.getFullYear(), 0, 1).toISOString();
  }

  // ============================================
  // DASHBOARD COMPLET
  // ============================================

  /**
   * Dashboard complet (appel unique)
   */
  async getFullDashboard(companyName) {
    const [
      overview,
      alerts,
      evolution,
      upcoming,
      recentTx,
      forecast,
      yoy
    ] = await Promise.all([
      this.getOverviewMetrics(companyName),
      this.getAlerts(companyName),
      this.getMonthlyEvolution(companyName, 12),
      this.getUpcomingDueDates(companyName, 30),
      this.getRecentTransactions(companyName, 15),
      this.getCashFlowForecast(companyName, 60),
      this.getYearOverYearComparison(companyName)
    ]);

    return {
      overview,
      alerts,
      evolution,
      upcoming,
      recent_transactions: recentTx,
      cash_forecast: forecast,
      year_comparison: yoy,
      company: COMPANIES[companyName] || { name: companyName },
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Prochaines echeances
   */
  async getUpcomingDueDates(companyName, days = 30) {
    const directus = this.getDirectus();
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    try {
      const [receivables, payables] = await Promise.all([
        directus.request(
          readItems('client_invoices', {
            filter: {
              owner_company: { _eq: companyName },
              status: { _in: ['sent', 'pending'] },
              due_date: { _between: [today, futureDate.toISOString().split('T')[0]] }
            },
            fields: ['id', 'invoice_number', 'client_name', 'amount', 'currency', 'due_date'],
            sort: ['due_date'],
            limit: 15
          })
        ),
        directus.request(
          readItems('supplier_invoices', {
            filter: {
              owner_company: { _eq: companyName },
              status: { _in: ['pending', 'approved'] },
              due_date: { _between: [today, futureDate.toISOString().split('T')[0]] }
            },
            fields: ['id', 'invoice_number', 'supplier_name', 'amount', 'currency', 'due_date'],
            sort: ['due_date'],
            limit: 15
          })
        )
      ]);

      return {
        receivables: (receivables || []).map(inv => ({
          ...inv,
          amount_chf: this.convertToCHF(parseFloat(inv.amount) || 0, inv.currency),
          type: 'receivable',
          days_until: Math.floor((new Date(inv.due_date) - new Date()) / (1000 * 60 * 60 * 24))
        })),
        payables: (payables || []).map(inv => ({
          ...inv,
          amount_chf: this.convertToCHF(parseFloat(inv.amount) || 0, inv.currency),
          type: 'payable',
          days_until: Math.floor((new Date(inv.due_date) - new Date()) / (1000 * 60 * 60 * 24))
        }))
      };

    } catch (error) {
      console.error('Erreur getUpcomingDueDates:', error);
      return { receivables: [], payables: [] };
    }
  }

  /**
   * Dernieres transactions
   */
  async getRecentTransactions(companyName, limit = 10) {
    const directus = this.getDirectus();

    try {
      const transactions = await directus.request(
        readItems('bank_transactions', {
          filter: {
            owner_company: { _eq: companyName }
          },
          sort: ['-date', '-created_at'],
          limit,
          fields: [
            'id', 'date', 'amount', 'currency', 'description',
            'type', 'reconciled', 'reference', 'category'
          ]
        })
      );

      return (transactions || []).map(tx => ({
        ...tx,
        amount_chf: this.convertToCHF(parseFloat(tx.amount) || 0, tx.currency),
        formatted_amount: this.formatMoney(parseFloat(tx.amount) || 0, tx.currency)
      }));

    } catch (error) {
      console.error('Erreur getRecentTransactions:', error);
      return [];
    }
  }

  /**
   * Statistiques par client
   */
  async getClientStats(companyName, clientId = null) {
    const directus = this.getDirectus();

    try {
      const filter = {
        owner_company: { _eq: companyName }
      };
      if (clientId) {
        filter.client_id = { _eq: clientId };
      }

      const invoices = await directus.request(
        readItems('client_invoices', {
          filter,
          fields: ['client_name', 'client_id', 'amount', 'currency', 'status', 'paid_at', 'due_date']
        })
      );

      const stats = {};

      for (const inv of invoices || []) {
        const clientName = inv.client_name || 'Non defini';
        if (!stats[clientName]) {
          stats[clientName] = {
            client_id: inv.client_id,
            total_invoiced: 0,
            total_paid: 0,
            total_outstanding: 0,
            invoice_count: 0,
            paid_count: 0,
            overdue_count: 0,
            avg_payment_days: []
          };
        }

        const amount = this.convertToCHF(parseFloat(inv.amount) || 0, inv.currency);
        stats[clientName].total_invoiced += amount;
        stats[clientName].invoice_count++;

        if (inv.status === 'paid') {
          stats[clientName].total_paid += amount;
          stats[clientName].paid_count++;

          if (inv.paid_at && inv.due_date) {
            const paymentDays = Math.floor(
              (new Date(inv.paid_at) - new Date(inv.due_date)) / (1000 * 60 * 60 * 24)
            );
            stats[clientName].avg_payment_days.push(paymentDays);
          }
        } else {
          stats[clientName].total_outstanding += amount;
          if (inv.due_date && new Date(inv.due_date) < new Date()) {
            stats[clientName].overdue_count++;
          }
        }
      }

      // Calculer les moyennes
      for (const client in stats) {
        const days = stats[client].avg_payment_days;
        stats[client].avg_payment_days = days.length > 0
          ? Math.round(days.reduce((a, b) => a + b, 0) / days.length)
          : null;

        // Arrondir les montants
        stats[client].total_invoiced = Math.round(stats[client].total_invoiced * 100) / 100;
        stats[client].total_paid = Math.round(stats[client].total_paid * 100) / 100;
        stats[client].total_outstanding = Math.round(stats[client].total_outstanding * 100) / 100;
      }

      return stats;

    } catch (error) {
      console.error('Erreur getClientStats:', error);
      return {};
    }
  }

  /**
   * Obtenir la liste des entreprises supportees
   */
  getCompanies() {
    return COMPANIES;
  }
}

export const financeDashboardService = new FinanceDashboardService();
export default FinanceDashboardService;

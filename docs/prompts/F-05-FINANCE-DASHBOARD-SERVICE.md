# PROMPT 5/8 - SERVICE DASHBOARD FINANCE

## Contexte
Ce service agrège toutes les données financières pour alimenter le dashboard de pilotage. Il combine les données de toutes les sources (Directus, Revolut, factures).

## Fichier à créer
`src/backend/services/finance/finance-dashboard.service.js`

## Code complet

```javascript
/**
 * FinanceDashboardService
 * Agrégation des données financières pour le dashboard CEO
 */

import { createDirectus, rest, authentication, readItems, aggregate } from '@directus/sdk';

class FinanceDashboardService {
  constructor() {
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;
  }

  getDirectus() {
    const client = createDirectus(this.directusUrl)
      .with(authentication())
      .with(rest());
    client.setToken(this.directusToken);
    return client;
  }

  /**
   * Obtenir les métriques globales (KPIs)
   */
  async getOverviewMetrics(companyName, period = {}) {
    const directus = this.getDirectus();
    const startDate = period.start || this.getStartOfMonth();
    const endDate = period.end || new Date().toISOString();

    try {
      const [
        cashPosition,
        receivables,
        payables,
        monthlyRevenue,
        monthlyExpenses
      ] = await Promise.all([
        this.getCashPosition(companyName),
        this.getReceivables(companyName),
        this.getPayables(companyName),
        this.getMonthlyRevenue(companyName, startDate, endDate),
        this.getMonthlyExpenses(companyName, startDate, endDate)
      ]);

      // Calculs dérivés
      const netCashFlow = monthlyRevenue.total - monthlyExpenses.total;
      const runway = monthlyExpenses.total > 0 
        ? Math.round(cashPosition.total / monthlyExpenses.total) 
        : 99;

      return {
        kpis: {
          cash_position: {
            value: cashPosition.total,
            currency: 'CHF',
            label: 'Trésorerie',
            trend: cashPosition.trend
          },
          receivables: {
            value: receivables.total,
            count: receivables.count,
            overdue: receivables.overdue,
            currency: 'CHF',
            label: 'À encaisser'
          },
          payables: {
            value: payables.total,
            count: payables.count,
            overdue: payables.overdue,
            currency: 'CHF',
            label: 'À payer'
          },
          monthly_revenue: {
            value: monthlyRevenue.total,
            currency: 'CHF',
            label: 'CA du mois',
            invoices_count: monthlyRevenue.count
          },
          monthly_expenses: {
            value: monthlyExpenses.total,
            currency: 'CHF',
            label: 'Dépenses du mois'
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
            status: runway > 6 ? 'good' : runway > 3 ? 'warning' : 'danger'
          }
        },
        period: { start: startDate, end: endDate },
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erreur getOverviewMetrics:', error);
      throw error;
    }
  }

  /**
   * Position de trésorerie (comptes bancaires)
   */
  async getCashPosition(companyName) {
    const directus = this.getDirectus();

    try {
      // Récupérer les soldes des comptes bancaires
      const accounts = await directus.request(
        readItems('bank_accounts', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _eq: 'active' }
          },
          fields: ['id', 'account_name', 'currency', 'balance', 'last_sync']
        })
      );

      // Calculer le total en CHF (conversion simplifiée)
      const rates = { CHF: 1, EUR: 0.94, USD: 0.88, GBP: 1.13 };
      let totalCHF = 0;
      const byCurrency = {};

      for (const account of accounts) {
        const balance = parseFloat(account.balance) || 0;
        const rate = rates[account.currency] || 1;
        totalCHF += balance * rate;
        
        byCurrency[account.currency] = (byCurrency[account.currency] || 0) + balance;
      }

      // Calculer la tendance (compare avec il y a 30 jours)
      const trend = await this.calculateCashTrend(directus, companyName);

      return {
        total: Math.round(totalCHF * 100) / 100,
        accounts: accounts.length,
        by_currency: byCurrency,
        trend,
        last_updated: accounts[0]?.last_sync || new Date().toISOString()
      };

    } catch (error) {
      console.error('Erreur getCashPosition:', error);
      return { total: 0, accounts: 0, by_currency: {}, trend: 0 };
    }
  }

  /**
   * Factures clients à encaisser
   */
  async getReceivables(companyName) {
    const directus = this.getDirectus();
    const today = new Date().toISOString().split('T')[0];

    try {
      const invoices = await directus.request(
        readItems('client_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _in: ['sent', 'pending', 'overdue'] }
          },
          fields: ['id', 'amount', 'currency', 'due_date', 'status', 'client_name']
        })
      );

      let total = 0;
      let overdue = 0;
      let overdueCount = 0;
      const byClient = {};

      for (const inv of invoices) {
        const amount = parseFloat(inv.amount) || 0;
        total += amount;

        if (inv.due_date && inv.due_date < today) {
          overdue += amount;
          overdueCount++;
        }

        byClient[inv.client_name] = (byClient[inv.client_name] || 0) + amount;
      }

      // Tri par montant décroissant
      const topClients = Object.entries(byClient)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, amount]) => ({ name, amount }));

      return {
        total: Math.round(total * 100) / 100,
        count: invoices.length,
        overdue: Math.round(overdue * 100) / 100,
        overdue_count: overdueCount,
        top_clients: topClients
      };

    } catch (error) {
      console.error('Erreur getReceivables:', error);
      return { total: 0, count: 0, overdue: 0, overdue_count: 0, top_clients: [] };
    }
  }

  /**
   * Factures fournisseurs à payer
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
          fields: ['id', 'amount', 'currency', 'due_date', 'status', 'supplier_name']
        })
      );

      let total = 0;
      let overdue = 0;
      let overdueCount = 0;

      for (const inv of invoices) {
        const amount = parseFloat(inv.amount) || 0;
        total += amount;

        if (inv.due_date && inv.due_date < today) {
          overdue += amount;
          overdueCount++;
        }
      }

      return {
        total: Math.round(total * 100) / 100,
        count: invoices.length,
        overdue: Math.round(overdue * 100) / 100,
        overdue_count: overdueCount
      };

    } catch (error) {
      console.error('Erreur getPayables:', error);
      return { total: 0, count: 0, overdue: 0, overdue_count: 0 };
    }
  }

  /**
   * Chiffre d'affaires mensuel
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
          fields: ['amount']
        })
      );

      const total = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

      return {
        total: Math.round(total * 100) / 100,
        count: invoices.length
      };

    } catch (error) {
      console.error('Erreur getMonthlyRevenue:', error);
      return { total: 0, count: 0 };
    }
  }

  /**
   * Dépenses mensuelles
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
              date: { _between: [startDate, endDate] }
            },
            fields: ['amount']
          })
        ),
        directus.request(
          readItems('expenses', {
            filter: {
              owner_company: { _eq: companyName },
              expense_date: { _between: [startDate, endDate] }
            },
            fields: ['amount']
          })
        )
      ]);

      const supplierTotal = supplierInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
      const expensesTotal = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      return {
        total: Math.round((supplierTotal + expensesTotal) * 100) / 100,
        supplier_invoices: Math.round(supplierTotal * 100) / 100,
        other_expenses: Math.round(expensesTotal * 100) / 100
      };

    } catch (error) {
      console.error('Erreur getMonthlyExpenses:', error);
      return { total: 0, supplier_invoices: 0, other_expenses: 0 };
    }
  }

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
          fields: ['id', 'invoice_number', 'client_name', 'amount', 'due_date'],
          limit: 10
        })
      );

      for (const inv of overdueReceivables) {
        const daysOverdue = Math.floor((new Date() - new Date(inv.due_date)) / (1000 * 60 * 60 * 24));
        alerts.push({
          type: 'overdue_receivable',
          severity: daysOverdue > 30 ? 'high' : daysOverdue > 14 ? 'medium' : 'low',
          title: `Facture ${inv.invoice_number} en retard`,
          description: `${inv.client_name} - ${inv.amount} CHF - ${daysOverdue} jours de retard`,
          action: 'send_reminder',
          reference_id: inv.id
        });
      }

      // Factures fournisseurs à échéance proche
      const dueSoon = new Date();
      dueSoon.setDate(dueSoon.getDate() + 7);
      
      const upcomingPayables = await directus.request(
        readItems('supplier_invoices', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _in: ['pending', 'approved'] },
            due_date: { _between: [today, dueSoon.toISOString().split('T')[0]] }
          },
          fields: ['id', 'invoice_number', 'supplier_name', 'amount', 'due_date'],
          limit: 10
        })
      );

      for (const inv of upcomingPayables) {
        alerts.push({
          type: 'upcoming_payable',
          severity: 'medium',
          title: `Facture ${inv.supplier_name} à payer`,
          description: `${inv.amount} CHF - Échéance: ${inv.due_date}`,
          action: 'schedule_payment',
          reference_id: inv.id
        });
      }

      // Transactions non rapprochées
      const unreconciledTx = await directus.request(
        readItems('bank_transactions', {
          filter: {
            owner_company: { _eq: companyName },
            reconciled: { _eq: false },
            suggested_match: { _nnull: true }
          },
          aggregate: { count: '*' }
        })
      );

      const unreconciledCount = parseInt(unreconciledTx[0]?.count || 0);
      if (unreconciledCount > 0) {
        alerts.push({
          type: 'pending_reconciliation',
          severity: unreconciledCount > 10 ? 'medium' : 'low',
          title: `${unreconciledCount} rapprochements en attente`,
          description: 'Transactions bancaires à valider',
          action: 'review_reconciliation'
        });
      }

      // Tri par sévérité
      const severityOrder = { high: 0, medium: 1, low: 2 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      return alerts;

    } catch (error) {
      console.error('Erreur getAlerts:', error);
      return [];
    }
  }

  /**
   * Évolution sur 12 mois
   */
  async getMonthlyEvolution(companyName, months = 12) {
    const directus = this.getDirectus();
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

        evolution.push({
          month: date.toLocaleDateString('fr-CH', { month: 'short', year: 'numeric' }),
          revenue: revenue.total,
          expenses: expenses.total,
          profit: revenue.total - expenses.total
        });
      }

      return evolution;

    } catch (error) {
      console.error('Erreur getMonthlyEvolution:', error);
      return [];
    }
  }

  /**
   * Prochaines échéances
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
            fields: ['id', 'invoice_number', 'client_name', 'amount', 'due_date'],
            sort: ['due_date'],
            limit: 10
          })
        ),
        directus.request(
          readItems('supplier_invoices', {
            filter: {
              owner_company: { _eq: companyName },
              status: { _in: ['pending', 'approved'] },
              due_date: { _between: [today, futureDate.toISOString().split('T')[0]] }
            },
            fields: ['id', 'invoice_number', 'supplier_name', 'amount', 'due_date'],
            sort: ['due_date'],
            limit: 10
          })
        )
      ]);

      return {
        receivables: receivables.map(inv => ({
          ...inv,
          type: 'receivable'
        })),
        payables: payables.map(inv => ({
          ...inv,
          type: 'payable'
        }))
      };

    } catch (error) {
      console.error('Erreur getUpcomingDueDates:', error);
      return { receivables: [], payables: [] };
    }
  }

  /**
   * Dernières transactions
   */
  async getRecentTransactions(companyName, limit = 10) {
    const directus = this.getDirectus();

    try {
      const transactions = await directus.request(
        readItems('bank_transactions', {
          filter: {
            owner_company: { _eq: companyName }
          },
          sort: ['-date'],
          limit,
          fields: ['id', 'date', 'amount', 'currency', 'description', 'type', 'reconciled']
        })
      );

      return transactions;

    } catch (error) {
      console.error('Erreur getRecentTransactions:', error);
      return [];
    }
  }

  /**
   * Calculer la tendance de trésorerie
   */
  async calculateCashTrend(directus, companyName) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Simplification: calculer depuis les transactions
      const transactions = await directus.request(
        readItems('bank_transactions', {
          filter: {
            owner_company: { _eq: companyName },
            date: { _gte: thirtyDaysAgo.toISOString() }
          },
          fields: ['amount']
        })
      );

      const netChange = transactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
      return Math.round(netChange * 100) / 100;

    } catch (error) {
      return 0;
    }
  }

  /**
   * Helper: début du mois courant
   */
  getStartOfMonth() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
  }

  /**
   * Dashboard complet (appel unique)
   */
  async getFullDashboard(companyName) {
    const [
      overview,
      alerts,
      evolution,
      upcoming,
      recentTx
    ] = await Promise.all([
      this.getOverviewMetrics(companyName),
      this.getAlerts(companyName),
      this.getMonthlyEvolution(companyName, 12),
      this.getUpcomingDueDates(companyName, 30),
      this.getRecentTransactions(companyName, 10)
    ]);

    return {
      overview,
      alerts,
      evolution,
      upcoming,
      recent_transactions: recentTx,
      company: companyName,
      generated_at: new Date().toISOString()
    };
  }
}

export const financeDashboardService = new FinanceDashboardService();
export default FinanceDashboardService;
```

## Instructions pour Claude Code
1. Créer le fichier dans `src/backend/services/finance/`
2. Ce service est le point d'entrée principal pour le dashboard finance

## Test
```javascript
import { financeDashboardService } from './finance-dashboard.service.js';

// Dashboard complet
const dashboard = await financeDashboardService.getFullDashboard('HYPERVISUAL');
console.log(JSON.stringify(dashboard, null, 2));

// KPIs seuls
const kpis = await financeDashboardService.getOverviewMetrics('HYPERVISUAL');
console.log(kpis);
```

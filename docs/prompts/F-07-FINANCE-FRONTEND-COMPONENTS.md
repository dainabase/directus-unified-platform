# PROMPT 7/8 - COMPOSANTS FRONTEND FINANCE

## Contexte
Ce fichier définit les composants React pour le dashboard Finance du portail SuperAdmin. Utilise Tabler.io (via CDN) et Recharts pour les graphiques.

## Structure des fichiers à créer
```
src/frontend/src/portals/superadmin/finance/
├── FinanceDashboard.jsx      # Composant principal
├── components/
│   ├── KPICards.jsx          # Cartes KPI (trésorerie, CA, etc.)
│   ├── AlertsPanel.jsx       # Panel alertes prioritaires
│   ├── CashFlowChart.jsx     # Graphique évolution
│   ├── UpcomingPayments.jsx  # Échéances à venir
│   ├── RecentTransactions.jsx # Dernières transactions
│   └── ReconciliationQueue.jsx # File de rapprochement
├── hooks/
│   └── useFinanceData.js     # Hook pour les données
└── services/
    └── financeApi.js         # Appels API
```

## Code complet

### 1. Service API
`src/frontend/src/portals/superadmin/finance/services/financeApi.js`

```javascript
/**
 * Finance API Service
 * Gère tous les appels API pour le module Finance
 */

const API_BASE = '/api/finance';

class FinanceApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }
      
      return data;
    } catch (error) {
      console.error(`Finance API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Dashboard
  async getDashboard(company) {
    return this.request(`/dashboard/${company}`);
  }

  async getKPIs(company, period = {}) {
    const params = new URLSearchParams();
    if (period.start) params.append('start', period.start);
    if (period.end) params.append('end', period.end);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/kpis/${company}${query}`);
  }

  async getAlerts(company) {
    return this.request(`/alerts/${company}`);
  }

  async getEvolution(company, months = 12) {
    return this.request(`/evolution/${company}?months=${months}`);
  }

  async getCashPosition(company) {
    return this.request(`/cash-position/${company}`);
  }

  async getUpcoming(company, days = 30) {
    return this.request(`/upcoming/${company}?days=${days}`);
  }

  async getTransactions(company, limit = 20) {
    return this.request(`/transactions/${company}?limit=${limit}`);
  }

  // Rapprochement
  async getPendingReconciliations(company) {
    return this.request(`/reconciliation/${company}`);
  }

  async confirmMatch(transactionId, invoiceId, type) {
    return this.request('/reconciliation/match', {
      method: 'POST',
      body: JSON.stringify({ transaction_id: transactionId, invoice_id: invoiceId, type })
    });
  }

  // Factures
  async createInvoice(data) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getInvoice(id) {
    return this.request(`/invoices/${id}`);
  }

  async generatePDF(invoiceId) {
    return this.request(`/invoices/${invoiceId}/pdf`, { method: 'POST' });
  }
}

export const financeApi = new FinanceApiService();
export default financeApi;
```

### 2. Hook personnalisé
`src/frontend/src/portals/superadmin/finance/hooks/useFinanceData.js`

```javascript
/**
 * useFinanceData Hook
 * Gère le chargement et le rafraîchissement des données finance
 */

import { useState, useEffect, useCallback } from 'react';
import { financeApi } from '../services/financeApi';

export function useFinanceData(company, options = {}) {
  const { autoRefresh = 60000, initialLoad = true } = options;
  
  const [data, setData] = useState({
    dashboard: null,
    kpis: null,
    alerts: [],
    evolution: [],
    upcoming: { receivables: [], payables: [] },
    transactions: [],
    reconciliations: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async () => {
    if (!company) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await financeApi.getDashboard(company);
      
      setData({
        dashboard: response.data,
        kpis: response.data.overview?.kpis || {},
        alerts: response.data.alerts || [],
        evolution: response.data.evolution || [],
        upcoming: response.data.upcoming || { receivables: [], payables: [] },
        transactions: response.data.recent_transactions || [],
        reconciliations: []
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Erreur chargement dashboard finance:', err);
    } finally {
      setLoading(false);
    }
  }, [company]);

  const loadReconciliations = useCallback(async () => {
    if (!company) return;
    
    try {
      const response = await financeApi.getPendingReconciliations(company);
      setData(prev => ({
        ...prev,
        reconciliations: response.data || []
      }));
    } catch (err) {
      console.error('Erreur chargement rapprochements:', err);
    }
  }, [company]);

  const refresh = useCallback(() => {
    loadDashboard();
    loadReconciliations();
  }, [loadDashboard, loadReconciliations]);

  // Chargement initial
  useEffect(() => {
    if (initialLoad && company) {
      refresh();
    }
  }, [company, initialLoad, refresh]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !company) return;
    
    const interval = setInterval(refresh, autoRefresh);
    return () => clearInterval(interval);
  }, [autoRefresh, company, refresh]);

  return {
    ...data,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

export default useFinanceData;
```

### 3. Composant KPI Cards
`src/frontend/src/portals/superadmin/finance/components/KPICards.jsx`

```javascript
/**
 * KPICards Component
 * Affiche les cartes de KPI financiers
 */

import React from 'react';

const formatCurrency = (value, currency = 'CHF') => {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatTrend = (value) => {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span className={`text-${isPositive ? 'green' : 'red'} d-inline-flex align-items-center lh-1`}>
      {isPositive ? '+' : ''}{formatCurrency(value)}
      <svg xmlns="http://www.w3.org/2000/svg" className="icon ms-1" width="24" height="24" 
           viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <polyline points={isPositive ? "3 17 9 11 13 15 21 7" : "3 7 9 13 13 9 21 17"} />
        <polyline points={isPositive ? "14 7 21 7 21 14" : "14 17 21 17 21 10"} />
      </svg>
    </span>
  );
};

function KPICard({ title, value, subtitle, trend, status, icon, color = 'primary' }) {
  const statusColors = {
    positive: 'green',
    negative: 'red',
    good: 'green',
    warning: 'yellow',
    danger: 'red'
  };
  
  const cardColor = statusColors[status] || color;
  
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card card-sm">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <span className={`bg-${cardColor} text-white avatar`}>
                {icon || (
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" 
                       viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" />
                    <path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" />
                  </svg>
                )}
              </span>
            </div>
            <div className="col">
              <div className="font-weight-medium">{title}</div>
              <div className="text-secondary">{subtitle}</div>
            </div>
          </div>
          <div className="mt-3">
            <h2 className="mb-0">{typeof value === 'number' ? formatCurrency(value) : value}</h2>
            {trend !== undefined && trend !== 0 && (
              <div className="mt-1">
                {formatTrend(trend)}
                <span className="text-secondary ms-1">vs mois dernier</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function KPICards({ kpis = {} }) {
  const {
    cash_position = {},
    receivables = {},
    payables = {},
    monthly_revenue = {},
    net_cash_flow = {},
    runway = {}
  } = kpis;

  return (
    <div className="row row-deck row-cards">
      {/* Trésorerie */}
      <KPICard
        title="Trésorerie"
        value={cash_position.value || 0}
        subtitle={`${cash_position.accounts || 0} comptes`}
        trend={cash_position.trend}
        color="primary"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="M3 10h18" />
            <path d="M7 15h.01" />
            <path d="M11 15h2" />
          </svg>
        }
      />

      {/* À encaisser */}
      <KPICard
        title="À encaisser"
        value={receivables.value || 0}
        subtitle={`${receivables.count || 0} factures (${receivables.overdue_count || 0} en retard)`}
        status={receivables.overdue > 0 ? 'warning' : 'good'}
        color="azure"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="2" />
            <path d="M9 14l2 2l4 -4" />
          </svg>
        }
      />

      {/* À payer */}
      <KPICard
        title="À payer"
        value={payables.value || 0}
        subtitle={`${payables.count || 0} factures`}
        status={payables.overdue > 0 ? 'warning' : 'good'}
        color="orange"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="2" />
            <path d="M9 12h6" />
            <path d="M9 16h6" />
          </svg>
        }
      />

      {/* CA du mois */}
      <KPICard
        title="CA du mois"
        value={monthly_revenue.value || 0}
        subtitle={`${monthly_revenue.invoices_count || 0} factures payées`}
        color="green"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 12m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
            <path d="M9 8m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
            <path d="M15 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
          </svg>
        }
      />

      {/* Flux net */}
      <KPICard
        title="Flux net"
        value={net_cash_flow.value || 0}
        subtitle="Ce mois"
        status={net_cash_flow.status}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <polyline points="7 10 12 4 17 10" />
            <path d="M21 10l-2 8a2 2.5 0 0 1 -2 2h-10a2 2.5 0 0 1 -2 -2l-2 -8z" />
            <circle cx="12" cy="15" r="2" />
          </svg>
        }
      />

      {/* Runway */}
      <KPICard
        title="Runway"
        value={`${runway.value || 0} mois`}
        subtitle="Au rythme actuel"
        status={runway.status}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 15" />
          </svg>
        }
      />
    </div>
  );
}

export default KPICards;
```

### 4. Panel Alertes
`src/frontend/src/portals/superadmin/finance/components/AlertsPanel.jsx`

```javascript
/**
 * AlertsPanel Component
 * Affiche les alertes et actions prioritaires
 */

import React from 'react';

const severityConfig = {
  high: { color: 'red', icon: '🔴', label: 'Urgent' },
  medium: { color: 'yellow', icon: '🟡', label: 'Important' },
  low: { color: 'blue', icon: '🔵', label: 'Info' }
};

const actionLabels = {
  send_reminder: 'Envoyer relance',
  schedule_payment: 'Programmer paiement',
  review_reconciliation: 'Voir rapprochements'
};

function AlertItem({ alert, onAction }) {
  const config = severityConfig[alert.severity] || severityConfig.low;
  
  return (
    <div className={`list-group-item list-group-item-action`}>
      <div className="row align-items-center">
        <div className="col-auto">
          <span className={`badge bg-${config.color}`}>{config.label}</span>
        </div>
        <div className="col text-truncate">
          <div className="d-block text-truncate font-weight-medium">
            {alert.title}
          </div>
          <small className="text-secondary text-truncate mt-n1">
            {alert.description}
          </small>
        </div>
        {alert.action && (
          <div className="col-auto">
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => onAction && onAction(alert)}
            >
              {actionLabels[alert.action] || 'Action'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AlertsPanel({ alerts = [], onAction, maxItems = 5 }) {
  const displayAlerts = alerts.slice(0, maxItems);
  const hasMore = alerts.length > maxItems;
  
  if (alerts.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Alertes & Actions</h3>
        </div>
        <div className="card-body text-center text-muted py-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg mb-2" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M5 12l5 5l10 -10" />
          </svg>
          <p className="mb-0">Aucune alerte en cours</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          Alertes & Actions
          <span className="badge bg-red ms-2">{alerts.length}</span>
        </h3>
      </div>
      <div className="list-group list-group-flush list-group-hoverable">
        {displayAlerts.map((alert, index) => (
          <AlertItem 
            key={alert.reference_id || index} 
            alert={alert} 
            onAction={onAction}
          />
        ))}
      </div>
      {hasMore && (
        <div className="card-footer text-center">
          <a href="#" className="text-muted">
            Voir {alerts.length - maxItems} autres alertes
          </a>
        </div>
      )}
    </div>
  );
}

export default AlertsPanel;
```

### 5. Graphique Cash Flow
`src/frontend/src/portals/superadmin/finance/components/CashFlowChart.jsx`

```javascript
/**
 * CashFlowChart Component
 * Graphique d'évolution sur 12 mois avec Recharts
 */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toFixed(0);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-white border rounded shadow-sm p-2">
      <p className="fw-bold mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="mb-0 small" style={{ color: entry.color }}>
          {entry.name}: {new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function CashFlowChart({ data = [], height = 300 }) {
  if (data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Évolution financière</h3>
        </div>
        <div className="card-body text-center text-muted py-5">
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Évolution sur 12 mois</h3>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#206bc4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#206bc4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d63939" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#d63939" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2fb344" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2fb344" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e7e9" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke="#a8aeb4"
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              stroke="#a8aeb4"
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              name="Revenus"
              stroke="#206bc4" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              name="Dépenses"
              stroke="#d63939" 
              fillOpacity={1} 
              fill="url(#colorExpenses)" 
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              name="Résultat"
              stroke="#2fb344" 
              fillOpacity={1} 
              fill="url(#colorProfit)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CashFlowChart;
```

### 6. Transactions récentes
`src/frontend/src/portals/superadmin/finance/components/RecentTransactions.jsx`

```javascript
/**
 * RecentTransactions Component
 * Liste des dernières transactions bancaires
 */

import React from 'react';

const formatCurrency = (value, currency = 'CHF') => {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: 'short'
  });
};

export function RecentTransactions({ transactions = [], limit = 10 }) {
  const displayTx = transactions.slice(0, limit);
  
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Dernières transactions</h3>
      </div>
      <div className="table-responsive">
        <table className="table table-vcenter card-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th className="text-end">Montant</th>
              <th className="w-1">Statut</th>
            </tr>
          </thead>
          <tbody>
            {displayTx.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
                  Aucune transaction
                </td>
              </tr>
            ) : (
              displayTx.map((tx, index) => {
                const isPositive = parseFloat(tx.amount) > 0;
                return (
                  <tr key={tx.id || index}>
                    <td className="text-secondary">{formatDate(tx.date)}</td>
                    <td className="text-truncate" style={{ maxWidth: '200px' }}>
                      {tx.description}
                    </td>
                    <td className={`text-end ${isPositive ? 'text-green' : 'text-red'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td>
                      {tx.reconciled ? (
                        <span className="badge bg-green">Rapproché</span>
                      ) : (
                        <span className="badge bg-yellow">En attente</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {transactions.length > limit && (
        <div className="card-footer text-center">
          <a href="#" className="text-muted">
            Voir toutes les transactions
          </a>
        </div>
      )}
    </div>
  );
}

export default RecentTransactions;
```

### 7. Dashboard principal
`src/frontend/src/portals/superadmin/finance/FinanceDashboard.jsx`

```javascript
/**
 * FinanceDashboard Component
 * Dashboard principal du pôle Finance pour SuperAdmin
 */

import React, { useState } from 'react';
import { useFinanceData } from './hooks/useFinanceData';
import { KPICards } from './components/KPICards';
import { AlertsPanel } from './components/AlertsPanel';
import { CashFlowChart } from './components/CashFlowChart';
import { RecentTransactions } from './components/RecentTransactions';

// Sélecteur d'entreprise
function CompanySelector({ value, onChange, companies }) {
  return (
    <select 
      className="form-select" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: 'auto' }}
    >
      {companies.map(company => (
        <option key={company} value={company}>{company}</option>
      ))}
    </select>
  );
}

// Header avec bouton refresh
function DashboardHeader({ company, onCompanyChange, onRefresh, lastUpdated, loading }) {
  const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI REALTY', 'TAKEOUT'];
  
  return (
    <div className="page-header d-print-none">
      <div className="container-xl">
        <div className="page-pretitle">Pôle Finance</div>
        <div className="d-flex align-items-center">
          <h2 className="page-title me-auto">
            Dashboard Finance
          </h2>
          <div className="d-flex align-items-center gap-2">
            <CompanySelector 
              value={company} 
              onChange={onCompanyChange}
              companies={companies}
            />
            <button 
              className="btn btn-primary"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-1" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                </svg>
              )}
              Actualiser
            </button>
          </div>
        </div>
        {lastUpdated && (
          <small className="text-muted">
            Dernière mise à jour: {lastUpdated.toLocaleTimeString('fr-CH')}
          </small>
        )}
      </div>
    </div>
  );
}

// Skeleton loader
function DashboardSkeleton() {
  return (
    <div className="container-xl">
      <div className="row row-deck row-cards">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-sm-6 col-lg-3">
            <div className="card placeholder-glow">
              <div className="card-body">
                <div className="placeholder col-7 mb-2"></div>
                <div className="placeholder placeholder-lg col-4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant principal
export function FinanceDashboard() {
  const [selectedCompany, setSelectedCompany] = useState('HYPERVISUAL');
  
  const {
    kpis,
    alerts,
    evolution,
    transactions,
    loading,
    error,
    lastUpdated,
    refresh
  } = useFinanceData(selectedCompany, {
    autoRefresh: 60000 // Refresh toutes les minutes
  });

  const handleAlertAction = (alert) => {
    console.log('Action sur alerte:', alert);
    // Implémenter les actions selon le type
    switch (alert.action) {
      case 'send_reminder':
        // Ouvrir modal de relance
        break;
      case 'schedule_payment':
        // Ouvrir modal de paiement
        break;
      case 'review_reconciliation':
        // Naviguer vers rapprochements
        break;
      default:
        break;
    }
  };

  if (error) {
    return (
      <div className="container-xl">
        <div className="alert alert-danger">
          <h4>Erreur de chargement</h4>
          <p>{error}</p>
          <button className="btn btn-danger" onClick={refresh}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <DashboardHeader
        company={selectedCompany}
        onCompanyChange={setSelectedCompany}
        onRefresh={refresh}
        lastUpdated={lastUpdated}
        loading={loading}
      />
      
      <div className="page-body">
        <div className="container-xl">
          {loading && !kpis ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Alertes prioritaires */}
              {alerts.length > 0 && (
                <div className="mb-4">
                  <AlertsPanel 
                    alerts={alerts} 
                    onAction={handleAlertAction}
                    maxItems={5}
                  />
                </div>
              )}
              
              {/* KPIs */}
              <div className="mb-4">
                <KPICards kpis={kpis} />
              </div>
              
              {/* Graphique + Transactions */}
              <div className="row row-deck row-cards">
                <div className="col-lg-8">
                  <CashFlowChart data={evolution} height={350} />
                </div>
                <div className="col-lg-4">
                  <RecentTransactions transactions={transactions} limit={8} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboard;
```

### 8. Export du module
`src/frontend/src/portals/superadmin/finance/index.js`

```javascript
export { FinanceDashboard } from './FinanceDashboard';
export { KPICards } from './components/KPICards';
export { AlertsPanel } from './components/AlertsPanel';
export { CashFlowChart } from './components/CashFlowChart';
export { RecentTransactions } from './components/RecentTransactions';
export { useFinanceData } from './hooks/useFinanceData';
export { financeApi } from './services/financeApi';

export default FinanceDashboard;
```

## Instructions pour Claude Code
1. Créer la structure de dossiers comme indiqué
2. Créer chaque fichier avec le code fourni
3. S'assurer que Recharts est installé: `npm install recharts`
4. Intégrer dans le router principal du portail SuperAdmin

## Test
```jsx
// Dans App.jsx ou le router
import { FinanceDashboard } from './portals/superadmin/finance';

// Route
<Route path="/superadmin/finance" element={<FinanceDashboard />} />
```

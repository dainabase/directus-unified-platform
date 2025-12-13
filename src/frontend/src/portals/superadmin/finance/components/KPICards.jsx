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
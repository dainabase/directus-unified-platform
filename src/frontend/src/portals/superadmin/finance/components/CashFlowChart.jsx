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
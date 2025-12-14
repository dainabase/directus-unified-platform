// src/portals/superadmin/collection/components/AgingChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AgingChart = ({ company, agingData }) => {
  const data = agingData || [
    { range: '0-30j', amount: 45000, count: 12, color: '#22c55e' },
    { range: '31-60j', amount: 32000, count: 8, color: '#eab308' },
    { range: '61-90j', amount: 18000, count: 5, color: '#f97316' },
    { range: '90+j', amount: 25000, count: 7, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analyse de l'âge des créances</h3>
        <span className="text-sm text-gray-500">{company}</span>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {data.map((item) => (
          <div key={item.range} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium text-gray-600">{item.range}</span>
            </div>
            <p className="text-xl font-bold">{(item.amount / 1000).toFixed(0)}K CHF</p>
            <p className="text-sm text-gray-500">{item.count} créances</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="range" />
            <YAxis tickFormatter={(value) => `${value / 1000}K`} />
            <Tooltip 
              formatter={(value) => [`${value.toLocaleString('fr-CH')} CHF`, 'Montant']}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AgingChart;

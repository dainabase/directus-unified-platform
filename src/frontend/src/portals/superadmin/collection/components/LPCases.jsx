// src/portals/superadmin/collection/components/LPCases.jsx
import React from 'react';
import { FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const LPCases = ({ company, onRefresh }) => {
  const cases = [
    { id: 1, debtor: 'ABC SA', amount: 15000, stage: 'Réquisition', date: '2024-02-01', status: 'active' },
    { id: 2, debtor: 'XYZ Sàrl', amount: 8500, stage: 'Commandement de payer', date: '2024-01-20', status: 'pending' },
    { id: 3, debtor: 'DEF AG', amount: 22000, stage: 'Opposition', date: '2024-01-10', status: 'blocked' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'blocked': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Procédures LP en cours</h3>
        <span className="text-sm text-gray-500">{company}</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Débiteur</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Montant</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Étape</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Statut</th>
            </tr>
          </thead>
          <tbody>
            {cases.map(lpCase => (
              <tr key={lpCase.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{lpCase.debtor}</td>
                <td className="py-3 px-4">{lpCase.amount.toLocaleString('fr-CH')} CHF</td>
                <td className="py-3 px-4">{lpCase.stage}</td>
                <td className="py-3 px-4 text-gray-500">{lpCase.date}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lpCase.status)}`}>
                    {lpCase.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LPCases;

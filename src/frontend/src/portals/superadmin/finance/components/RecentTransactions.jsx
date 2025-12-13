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
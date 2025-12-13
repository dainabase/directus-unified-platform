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
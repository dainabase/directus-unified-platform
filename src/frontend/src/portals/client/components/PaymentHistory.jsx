/**
 * Payment History Component
 *
 * Client portal payment history:
 * - Payment timeline
 * - Transaction details
 * - Receipt download
 *
 * @date 15 Décembre 2025
 */

import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';

const API_BASE = '/api/commercial';

const PaymentHistory = () => {
  const { authFetch } = useClientAuth();

  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('year'); // month, quarter, year, all

  useEffect(() => {
    loadPayments();
  }, [dateRange]);

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Calculate date filter
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        params.append('from', startDate.toISOString().split('T')[0]);
      }

      const response = await authFetch(`${API_BASE}/payments?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load payments');
      }

      setPayments(data.payments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const response = await authFetch(`${API_BASE}/payments/${paymentId}/receipt`);

      if (!response.ok) {
        throw new Error('Receipt download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError('Erreur lors du téléchargement du reçu');
    }
  };

  const formatCurrency = (amount, currency = 'CHF') => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('fr-CH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      bank_transfer: '🏦',
      credit_card: '💳',
      stripe: '💳',
      paypal: '💰',
      cash: '💵',
      check: '📝',
      crypto: '₿'
    };
    return icons[method] || '💰';
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      bank_transfer: 'Virement bancaire',
      credit_card: 'Carte de crédit',
      stripe: 'Stripe',
      paypal: 'PayPal',
      cash: 'Espèces',
      check: 'Chèque',
      crypto: 'Cryptomonnaie'
    };
    return labels[method] || method;
  };

  const getTotalPaid = () => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  };

  const groupPaymentsByMonth = () => {
    const grouped = {};

    payments.forEach(payment => {
      const date = new Date(payment.date_created);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' });

      if (!grouped[key]) {
        grouped[key] = { label, payments: [], total: 0 };
      }
      grouped[key].payments.push(payment);
      grouped[key].total += payment.amount;
    });

    return Object.values(grouped).sort((a, b) => b.payments[0].date_created - a.payments[0].date_created);
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3 text-muted">Chargement de l'historique...</p>
      </div>
    );
  }

  const groupedPayments = groupPaymentsByMonth();

  return (
    <div className="payment-history">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">Historique des paiements</h5>
          <p className="text-muted mb-0">
            Total payé: <strong>{formatCurrency(getTotalPaid())}</strong>
          </p>
        </div>
        <div className="btn-group btn-group-sm">
          <button
            className={`btn ${dateRange === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setDateRange('month')}
          >
            Ce mois
          </button>
          <button
            className={`btn ${dateRange === 'quarter' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setDateRange('quarter')}
          >
            Ce trimestre
          </button>
          <button
            className={`btn ${dateRange === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setDateRange('year')}
          >
            Cette année
          </button>
          <button
            className={`btn ${dateRange === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setDateRange('all')}
          >
            Tout
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadPayments}>
            Réessayer
          </button>
        </div>
      )}

      {/* Empty State */}
      {payments.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <span className="display-4 text-muted">💰</span>
            <p className="mt-3 mb-0 text-muted">Aucun paiement sur cette période</p>
          </div>
        </div>
      ) : (
        <div className="payment-timeline">
          {groupedPayments.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              {/* Month Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-muted mb-0 text-capitalize">{group.label}</h6>
                <span className="badge bg-light text-dark">
                  {formatCurrency(group.total)}
                </span>
              </div>

              {/* Payments */}
              <div className="list-group">
                {group.payments.map((payment) => (
                  <div key={payment.id} className="list-group-item">
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <span className="display-6">
                          {getPaymentMethodIcon(payment.payment_method)}
                        </span>
                      </div>
                      <div className="col">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{formatCurrency(payment.amount, payment.currency)}</strong>
                            <span className="badge bg-success ms-2">Validé</span>
                          </div>
                          <small className="text-muted">
                            {formatDate(payment.date_created)} à {formatTime(payment.date_created)}
                          </small>
                        </div>
                        <div className="text-muted small">
                          {getPaymentMethodLabel(payment.payment_method)}
                          {payment.related_invoice && (
                            <span className="ms-2">
                              • Facture {payment.related_invoice.invoice_number}
                            </span>
                          )}
                        </div>
                        {payment.reference && (
                          <small className="text-muted">
                            Réf: {payment.reference}
                          </small>
                        )}
                      </div>
                      <div className="col-auto">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleDownloadReceipt(payment.id)}
                          title="Télécharger le reçu"
                        >
                          Reçu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Card */}
      {payments.length > 0 && (
        <div className="card mt-4 bg-light">
          <div className="card-body">
            <div className="row text-center">
              <div className="col">
                <h4 className="mb-0">{payments.length}</h4>
                <small className="text-muted">Paiements</small>
              </div>
              <div className="col">
                <h4 className="mb-0">{formatCurrency(getTotalPaid())}</h4>
                <small className="text-muted">Total payé</small>
              </div>
              <div className="col">
                <h4 className="mb-0">
                  {formatCurrency(getTotalPaid() / payments.length)}
                </h4>
                <small className="text-muted">Moyenne</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;

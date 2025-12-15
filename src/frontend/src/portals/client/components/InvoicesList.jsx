/**
 * Invoices List Component
 *
 * Client portal invoice list:
 * - Invoice listing with filters
 * - Status badges
 * - Payment actions
 * - PDF download
 *
 * @date 15 Décembre 2025
 */

import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';

const API_BASE = '/api/commercial';

const InvoicesList = ({ onSelectInvoice, onPayInvoice }) => {
  const { authFetch } = useClientAuth();

  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, paid, overdue

  useEffect(() => {
    loadInvoices();
  }, [filter]);

  const loadInvoices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await authFetch(`${API_BASE}/invoices?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load invoices');
      }

      setInvoices(data.invoices || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const response = await authFetch(`${API_BASE}/invoices/${invoiceId}/pdf`);

      if (!response.ok) {
        throw new Error('PDF download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError('Erreur lors du téléchargement du PDF');
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
    return new Date(dateString).toLocaleDateString('fr-CH');
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { bg: 'secondary', text: 'Brouillon' },
      sent: { bg: 'info', text: 'Envoyée' },
      viewed: { bg: 'primary', text: 'Consultée' },
      partial: { bg: 'warning', text: 'Paiement partiel' },
      paid: { bg: 'success', text: 'Payée' },
      overdue: { bg: 'danger', text: 'En retard' },
      cancelled: { bg: 'dark', text: 'Annulée' }
    };
    const badge = badges[status] || badges.draft;
    return <span className={`badge bg-${badge.bg}`}>{badge.text}</span>;
  };

  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getTotalDue = () => {
    return invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + (inv.total - (inv.amount_paid || 0)), 0);
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3 text-muted">Chargement des factures...</p>
      </div>
    );
  }

  return (
    <div className="invoices-list">
      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title opacity-75">Total à payer</h6>
              <h3 className="mb-0">{formatCurrency(getTotalDue())}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted">Factures en attente</h6>
              <h3 className="mb-0 text-warning">
                {invoices.filter(i => i.status === 'sent' || i.status === 'viewed').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted">Factures en retard</h6>
              <h3 className="mb-0 text-danger">
                {invoices.filter(i => i.status === 'overdue').length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body py-2">
          <div className="d-flex align-items-center">
            <span className="text-muted me-3">Filtrer:</span>
            <div className="btn-group btn-group-sm">
              <button
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('all')}
              >
                Toutes
              </button>
              <button
                className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('pending')}
              >
                En attente
              </button>
              <button
                className={`btn ${filter === 'paid' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('paid')}
              >
                Payées
              </button>
              <button
                className={`btn ${filter === 'overdue' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('overdue')}
              >
                En retard
              </button>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary ms-auto"
              onClick={loadInvoices}
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadInvoices}>
            Réessayer
          </button>
        </div>
      )}

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <span className="display-4 text-muted">📄</span>
            <p className="mt-3 mb-0 text-muted">Aucune facture trouvée</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>N° Facture</th>
                  <th>Date</th>
                  <th>Échéance</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className={invoice.status === 'overdue' ? 'table-danger' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectInvoice?.(invoice.id)}
                  >
                    <td>
                      <strong>{invoice.invoice_number}</strong>
                      {invoice.related_quote && (
                        <small className="text-muted d-block">
                          Devis: {invoice.related_quote.quote_number}
                        </small>
                      )}
                    </td>
                    <td>{formatDate(invoice.date_created)}</td>
                    <td>
                      {formatDate(invoice.due_date)}
                      {invoice.status === 'overdue' && (
                        <small className="text-danger d-block">
                          +{getDaysOverdue(invoice.due_date)} jours
                        </small>
                      )}
                    </td>
                    <td>
                      <strong>{formatCurrency(invoice.total, invoice.currency)}</strong>
                      {invoice.amount_paid > 0 && invoice.amount_paid < invoice.total && (
                        <small className="text-success d-block">
                          Payé: {formatCurrency(invoice.amount_paid, invoice.currency)}
                        </small>
                      )}
                    </td>
                    <td>{getStatusBadge(invoice.status)}</td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleDownloadPDF(invoice.id)}
                          title="Télécharger PDF"
                        >
                          PDF
                        </button>
                        {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'overdue') && (
                          <button
                            className="btn btn-primary"
                            onClick={() => onPayInvoice?.(invoice)}
                            title="Payer cette facture"
                          >
                            Payer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesList;

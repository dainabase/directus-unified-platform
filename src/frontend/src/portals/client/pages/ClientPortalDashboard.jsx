/**
 * Client Portal Dashboard
 *
 * Main dashboard for client portal:
 * - Overview cards
 * - Recent quotes/invoices
 * - Active projects
 * - Quick actions
 *
 * @date 15 Décembre 2025
 */

import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';
import QuoteViewer from '../components/QuoteViewer';
import InvoicesList from '../components/InvoicesList';
import PaymentHistory from '../components/PaymentHistory';
import ProjectTimeline from '../components/ProjectTimeline';
import SignatureEmbed from '../components/SignatureEmbed';

const API_BASE = '/api/commercial/portal';

const ClientPortalDashboard = () => {
  const { user, logout } = useClientAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showSignature, setShowSignature] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('client_portal_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentQuotes(data.recentQuotes || []);
        setPendingActions(data.pendingActions || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
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

  const getStatusBadge = (status, type = 'quote') => {
    const badges = {
      // Quote statuses
      draft: { bg: 'secondary', text: 'Brouillon' },
      sent: { bg: 'info', text: 'Envoyé' },
      viewed: { bg: 'primary', text: 'Consulté' },
      signed: { bg: 'success', text: 'Signé' },
      completed: { bg: 'success', text: 'Terminé' },
      expired: { bg: 'danger', text: 'Expiré' },
      rejected: { bg: 'danger', text: 'Refusé' },
      // Invoice statuses
      paid: { bg: 'success', text: 'Payée' },
      overdue: { bg: 'danger', text: 'En retard' },
      partial: { bg: 'warning', text: 'Partiel' }
    };
    const badge = badges[status] || { bg: 'secondary', text: status };
    return <span className={`badge bg-${badge.bg}`}>{badge.text}</span>;
  };

  const handleSignQuote = (quoteId) => {
    setShowSignature({ type: 'quote', id: quoteId });
  };

  const handleSignatureComplete = () => {
    setShowSignature(null);
    loadDashboardData();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-portal-dashboard min-vh-100 bg-light">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <span className="navbar-brand">
            <strong>Espace Client</strong>
          </span>
          <div className="d-flex align-items-center">
            <span className="text-muted me-3">
              Bonjour, <strong>{user?.first_name || user?.email}</strong>
            </span>
            <button className="ds-btn ds-btn-outline-secondary ds-btn-sm" onClick={logout}>
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-4">
        {/* Pending Actions Alert */}
        {pendingActions.length > 0 && (
          <div className="alert alert-warning mb-4">
            <h6 className="alert-heading mb-2">Actions requises</h6>
            <ul className="mb-0">
              {pendingActions.map((action, index) => (
                <li key={index}>
                  {action.type === 'sign_quote' && (
                    <span>
                      Devis <strong>{action.reference}</strong> en attente de signature
                      <button
                        className="ds-btn ds-btn-sm ds-btn-warning ms-2"
                        onClick={() => handleSignQuote(action.id)}
                      >
                        Signer
                      </button>
                    </span>
                  )}
                  {action.type === 'pay_invoice' && (
                    <span>
                      Facture <strong>{action.reference}</strong> à payer
                      ({formatCurrency(action.amount)})
                    </span>
                  )}
                  {action.type === 'accept_cgv' && (
                    <span>
                      CGV à accepter pour le devis <strong>{action.reference}</strong>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Vue d'ensemble
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'quotes' ? 'active' : ''}`}
              onClick={() => setActiveTab('quotes')}
            >
              Devis
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              Factures
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Paiements
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              Projets
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              <div className="col-md-3">
                <div className="ds-card h-100">
                  <div className="ds-card-body">
                    <h6 className="text-muted mb-2">Devis en attente</h6>
                    <h3 className="mb-0">{stats?.pendingQuotes || 0}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="ds-card h-100 border-warning">
                  <div className="ds-card-body">
                    <h6 className="text-muted mb-2">Factures impayées</h6>
                    <h3 className="mb-0 text-warning">{stats?.unpaidInvoices || 0}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="ds-card h-100">
                  <div className="ds-card-body">
                    <h6 className="text-muted mb-2">Montant dû</h6>
                    <h3 className="mb-0">{formatCurrency(stats?.totalDue || 0)}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="ds-card h-100 border-success">
                  <div className="ds-card-body">
                    <h6 className="text-muted mb-2">Projets actifs</h6>
                    <h3 className="mb-0 text-success">{stats?.activeProjects || 0}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Quotes */}
            <div className="ds-card mb-4">
              <div className="ds-card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Devis récents</h6>
                <button
                  className="ds-btn ds-btn-sm ds-btn-outline-primary"
                  onClick={() => setActiveTab('quotes')}
                >
                  Voir tous
                </button>
              </div>
              {recentQuotes.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Référence</th>
                        <th>Titre</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentQuotes.slice(0, 5).map((quote) => (
                        <tr key={quote.id}>
                          <td><strong>{quote.quote_number}</strong></td>
                          <td>{quote.title || '-'}</td>
                          <td>{formatCurrency(quote.total, quote.currency)}</td>
                          <td>{getStatusBadge(quote.status)}</td>
                          <td>{formatDate(quote.date_created)}</td>
                          <td className="text-end">
                            <button
                              className="ds-btn ds-btn-sm ds-btn-outline-primary"
                              onClick={() => setSelectedQuote(quote.id)}
                            >
                              Voir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="ds-card-body text-center text-muted">
                  Aucun devis récent
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="quotes-tab">
            <div className="ds-card">
              <div className="ds-card-header">
                <h6 className="mb-0">Mes devis</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Référence</th>
                      <th>Titre</th>
                      <th>Montant</th>
                      <th>Valable jusqu'au</th>
                      <th>Statut</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQuotes.map((quote) => (
                      <tr key={quote.id}>
                        <td><strong>{quote.quote_number}</strong></td>
                        <td>{quote.title || '-'}</td>
                        <td>{formatCurrency(quote.total, quote.currency)}</td>
                        <td>{formatDate(quote.valid_until)}</td>
                        <td>{getStatusBadge(quote.status)}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="ds-btn ds-btn-outline-primary"
                              onClick={() => setSelectedQuote(quote.id)}
                            >
                              Voir
                            </button>
                            {(quote.status === 'sent' || quote.status === 'viewed') && (
                              <button
                                className="ds-btn ds-btn-primary"
                                onClick={() => handleSignQuote(quote.id)}
                              >
                                Signer
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
          </div>
        )}

        {activeTab === 'invoices' && (
          <InvoicesList
            onSelectInvoice={setSelectedInvoice}
            onPayInvoice={(invoice) => {
              // TODO: Open payment flow
            }}
          />
        )}

        {activeTab === 'payments' && <PaymentHistory />}

        {activeTab === 'projects' && (
          <div className="projects-tab">
            {stats?.activeProjects > 0 ? (
              <ProjectTimeline projectId={selectedProject || stats?.latestProjectId} />
            ) : (
              <div className="ds-card">
                <div className="ds-card-body text-center py-5">
                  <span className="display-4 text-muted">📁</span>
                  <p className="mt-3 mb-0 text-muted">Aucun projet actif</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quote Viewer Modal */}
      {selectedQuote && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Détail du devis</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedQuote(null)}
                />
              </div>
              <div className="modal-body">
                <QuoteViewer
                  quoteId={selectedQuote}
                  onSign={() => {
                    setSelectedQuote(null);
                    handleSignQuote(selectedQuote);
                  }}
                  onAcceptCGV={loadDashboardData}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignature && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Signature électronique</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSignature(null)}
                />
              </div>
              <div className="modal-body">
                <SignatureEmbed
                  documentType={showSignature.type}
                  documentId={showSignature.id}
                  onComplete={handleSignatureComplete}
                  onCancel={() => setShowSignature(null)}
                  onError={(err) => console.error('Signature error:', err)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortalDashboard;

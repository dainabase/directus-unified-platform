/**
 * Quote Viewer Component
 *
 * Client portal quote visualization:
 * - Quote details display
 * - Line items breakdown
 * - CGV acceptance
 * - Signature integration
 *
 * @date 15 Décembre 2025
 */

import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';

const API_BASE = '/api/commercial';

const QuoteViewer = ({ quoteId, onSign, onAcceptCGV }) => {
  const { authFetch } = useClientAuth();

  const [quote, setQuote] = useState(null);
  const [cgvVersion, setCGVVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cgvAccepted, setCGVAccepted] = useState(false);
  const [signingInProgress, setSigningInProgress] = useState(false);

  // Load quote data
  useEffect(() => {
    loadQuote();
  }, [quoteId]);

  const loadQuote = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch(`${API_BASE}/quotes/${quoteId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load quote');
      }

      setQuote(data.quote);

      // Load CGV if required
      if (data.quote.owner_company_id) {
        await loadCGV(data.quote.owner_company_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCGV = async (ownerCompanyId) => {
    try {
      const response = await authFetch(`${API_BASE}/cgv/active/${ownerCompanyId}`);
      const data = await response.json();

      if (response.ok && data.cgv) {
        setCGVVersion(data.cgv);
      }
    } catch (err) {
      console.warn('Could not load CGV:', err.message);
    }
  };

  const handleAcceptCGV = async () => {
    if (!cgvVersion) return;

    try {
      const response = await authFetch(`${API_BASE}/cgv/accept`, {
        method: 'POST',
        body: JSON.stringify({
          cgv_version_id: cgvVersion.id,
          quote_id: quoteId
        })
      });

      if (response.ok) {
        setCGVAccepted(true);
        onAcceptCGV?.();
      }
    } catch (err) {
      setError('Erreur lors de l\'acceptation des CGV');
    }
  };

  const handleRequestSignature = async () => {
    if (!cgvAccepted && cgvVersion) {
      setError('Veuillez accepter les CGV avant de signer');
      return;
    }

    setSigningInProgress(true);

    try {
      const response = await authFetch(`${API_BASE}/signatures/request`, {
        method: 'POST',
        body: JSON.stringify({ quoteId })
      });

      const data = await response.json();

      if (response.ok && data.signingUrl) {
        // Open signing URL in new window or iframe
        window.open(data.signingUrl, '_blank');
        onSign?.();
      }
    } catch (err) {
      setError('Erreur lors de la demande de signature');
    } finally {
      setSigningInProgress(false);
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
      sent: { bg: 'info', text: 'Envoyé' },
      viewed: { bg: 'primary', text: 'Consulté' },
      signed: { bg: 'success', text: 'Signé' },
      completed: { bg: 'success', text: 'Terminé' },
      expired: { bg: 'danger', text: 'Expiré' },
      rejected: { bg: 'danger', text: 'Refusé' }
    };
    const badge = badges[status] || badges.draft;
    return <span className={`badge bg-${badge.bg}`}>{badge.text}</span>;
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3 text-muted">Chargement du devis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Erreur:</strong> {error}
        <button className="ds-btn ds-btn-sm ds-btn-outline-danger ms-3" onClick={loadQuote}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="alert alert-warning" role="alert">
        Devis introuvable.
      </div>
    );
  }

  return (
    <div className="quote-viewer">
      {/* Header */}
      <div className="ds-card mb-4">
        <div className="ds-card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4 className="mb-1">
                Devis {quote.quote_number}
                <span className="ms-2">{getStatusBadge(quote.status)}</span>
              </h4>
              <p className="text-muted mb-0">
                {quote.title || 'Sans titre'}
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <h3 className="text-primary mb-0">
                {formatCurrency(quote.total, quote.currency)}
              </h3>
              <small className="text-muted">TTC</small>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Info */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="ds-card h-100">
            <div className="ds-card-header">
              <h6 className="mb-0">Informations</h6>
            </div>
            <div className="ds-card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted">Date d'émission</td>
                    <td className="text-end">{formatDate(quote.date_created)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Valable jusqu'au</td>
                    <td className="text-end">{formatDate(quote.valid_until)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Type de projet</td>
                    <td className="text-end">{quote.project_type || 'Standard'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="ds-card h-100">
            <div className="ds-card-header">
              <h6 className="mb-0">Montants</h6>
            </div>
            <div className="ds-card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted">Sous-total HT</td>
                    <td className="text-end">{formatCurrency(quote.subtotal, quote.currency)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">TVA ({quote.tax_rate}%)</td>
                    <td className="text-end">{formatCurrency(quote.tax_amount, quote.currency)}</td>
                  </tr>
                  <tr className="fw-bold">
                    <td>Total TTC</td>
                    <td className="text-end">{formatCurrency(quote.total, quote.currency)}</td>
                  </tr>
                  {quote.deposit_amount > 0 && (
                    <tr className="text-primary">
                      <td>Acompte ({quote.deposit_percentage}%)</td>
                      <td className="text-end">{formatCurrency(quote.deposit_amount, quote.currency)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      {quote.quote_items?.length > 0 && (
        <div className="ds-card mb-4">
          <div className="ds-card-header">
            <h6 className="mb-0">Détail des prestations</h6>
          </div>
          <div className="ds-card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th className="text-center">Qté</th>
                    <th className="text-end">Prix unit.</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.quote_items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{item.description}</strong>
                        {item.details && (
                          <p className="text-muted small mb-0">{item.details}</p>
                        )}
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">{formatCurrency(item.unit_price, quote.currency)}</td>
                      <td className="text-end">{formatCurrency(item.quantity * item.unit_price, quote.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {quote.description && (
        <div className="ds-card mb-4">
          <div className="ds-card-header">
            <h6 className="mb-0">Description du projet</h6>
          </div>
          <div className="ds-card-body">
            <div dangerouslySetInnerHTML={{ __html: quote.description }} />
          </div>
        </div>
      )}

      {/* CGV Acceptance */}
      {cgvVersion && !quote.cgv_accepted && quote.status !== 'signed' && quote.status !== 'completed' && (
        <div className="ds-card mb-4 border-warning">
          <div className="ds-card-header bg-warning-subtle">
            <h6 className="mb-0">Conditions Générales de Vente</h6>
          </div>
          <div className="ds-card-body">
            <p className="mb-3">
              Avant de signer ce devis, veuillez prendre connaissance de nos conditions générales de vente
              (version {cgvVersion.version}).
            </p>
            {cgvVersion.pdf_url && (
              <a
                href={cgvVersion.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ds-btn ds-btn-outline-secondary me-3"
              >
                📄 Télécharger les CGV (PDF)
              </a>
            )}
            <div className="form-check mt-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="cgv-accept"
                checked={cgvAccepted}
                onChange={(e) => e.target.checked ? handleAcceptCGV() : setCGVAccepted(false)}
              />
              <label className="form-check-label" htmlFor="cgv-accept">
                J'ai lu et j'accepte les conditions générales de vente
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {quote.status === 'sent' || quote.status === 'viewed' ? (
        <div className="ds-card">
          <div className="ds-card-body text-center">
            <h5 className="mb-3">Prêt à signer ce devis ?</h5>
            <p className="text-muted mb-4">
              En signant ce devis, vous acceptez les conditions et vous engagez à verser l'acompte de{' '}
              <strong>{formatCurrency(quote.deposit_amount, quote.currency)}</strong> ({quote.deposit_percentage}%).
            </p>
            <button
              className="ds-btn ds-btn-primary btn-lg px-5"
              onClick={handleRequestSignature}
              disabled={signingInProgress || (!cgvAccepted && cgvVersion)}
            >
              {signingInProgress ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Préparation...
                </>
              ) : (
                <>✍️ Signer le devis</>
              )}
            </button>
            {!cgvAccepted && cgvVersion && (
              <p className="text-warning small mt-2">
                ⚠️ Veuillez accepter les CGV pour pouvoir signer
              </p>
            )}
          </div>
        </div>
      ) : quote.status === 'signed' || quote.status === 'completed' ? (
        <div className="ds-card border-success">
          <div className="ds-card-body text-center">
            <span className="display-4">✅</span>
            <h5 className="mt-3 mb-2">Devis signé</h5>
            <p className="text-muted mb-0">
              Signé le {formatDate(quote.signed_at)}
            </p>
            {quote.signed_document_url && (
              <a
                href={quote.signed_document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ds-btn ds-btn-outline-success mt-3"
              >
                📄 Télécharger le devis signé
              </a>
            )}
          </div>
        </div>
      ) : quote.status === 'expired' ? (
        <div className="ds-card border-danger">
          <div className="ds-card-body text-center">
            <span className="display-4">⏰</span>
            <h5 className="mt-3 mb-2">Devis expiré</h5>
            <p className="text-muted mb-0">
              Ce devis a expiré le {formatDate(quote.valid_until)}.
              Contactez-nous pour obtenir un nouveau devis.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QuoteViewer;

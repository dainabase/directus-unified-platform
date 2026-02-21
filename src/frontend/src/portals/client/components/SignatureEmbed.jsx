/**
 * Signature Embed Component
 *
 * DocuSeal signature integration:
 * - Iframe embedding
 * - Signature status tracking
 * - Completion callbacks
 *
 * @date 15 Décembre 2025
 */

import React, { useState, useEffect, useRef } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';

const API_BASE = '/api/commercial';

const SignatureEmbed = ({
  documentType = 'quote', // quote | cgv
  documentId,
  onComplete,
  onCancel,
  onError
}) => {
  const { authFetch } = useClientAuth();
  const iframeRef = useRef(null);

  const [signatureUrl, setSignatureUrl] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, ready, signing, completed, error
  const [error, setError] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);

  useEffect(() => {
    initializeSignature();

    // Listen for DocuSeal postMessage events
    const handleMessage = (event) => {
      // Verify origin if needed
      if (event.data?.type === 'docuseal') {
        handleDocuSealEvent(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [documentId]);

  const initializeSignature = async () => {
    setStatus('loading');
    setError(null);

    try {
      const endpoint = documentType === 'quote'
        ? `${API_BASE}/signatures/quote/${documentId}`
        : `${API_BASE}/signatures/cgv/${documentId}`;

      const response = await authFetch(endpoint, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize signature');
      }

      if (data.embedUrl) {
        setSignatureUrl(data.embedUrl);
        setSubmissionId(data.submissionId);
        setStatus('ready');
      } else if (data.alreadySigned) {
        setStatus('completed');
        onComplete?.({ alreadySigned: true });
      } else {
        throw new Error('No signature URL received');
      }
    } catch (err) {
      setError(err.message);
      setStatus('error');
      onError?.(err);
    }
  };

  const handleDocuSealEvent = (eventData) => {
    switch (eventData.event) {
      case 'signed':
        setStatus('completed');
        onComplete?.({
          submissionId,
          signedAt: new Date().toISOString()
        });
        break;

      case 'declined':
        setStatus('error');
        setError('Signature refusée');
        onError?.({ reason: 'declined' });
        break;

      case 'expired':
        setStatus('error');
        setError('Le lien de signature a expiré');
        onError?.({ reason: 'expired' });
        break;

      default:
        break;
    }
  };

  const checkSignatureStatus = async () => {
    if (!submissionId) return;

    try {
      const response = await authFetch(`${API_BASE}/signatures/${submissionId}/status`);
      const data = await response.json();

      if (data.status === 'completed') {
        setStatus('completed');
        onComplete?.(data);
      } else if (data.status === 'expired' || data.status === 'declined') {
        setStatus('error');
        setError(`Signature ${data.status === 'expired' ? 'expirée' : 'refusée'}`);
      }
    } catch (err) {
      console.error('Status check failed:', err);
    }
  };

  const handleIframeLoad = () => {
    setStatus('signing');
  };

  const handleRetry = () => {
    initializeSignature();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="signature-embed">
        <div className="ds-card">
          <div className="ds-card-body text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <h5>Préparation de la signature</h5>
            <p className="text-muted mb-0">
              Veuillez patienter pendant la préparation du document...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="signature-embed">
        <div className="ds-card border-danger">
          <div className="ds-card-body text-center py-5">
            <span className="display-4 text-danger">⚠️</span>
            <h5 className="mt-3">Erreur de signature</h5>
            <p className="text-muted">{error || 'Une erreur est survenue'}</p>
            <div className="d-flex justify-content-center gap-3">
              <button className="ds-btn ds-btn-primary" onClick={handleRetry}>
                Réessayer
              </button>
              <button className="ds-btn ds-btn-outline-secondary" onClick={handleCancel}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed state
  if (status === 'completed') {
    return (
      <div className="signature-embed">
        <div className="ds-card border-success">
          <div className="ds-card-body text-center py-5">
            <span className="display-4">✅</span>
            <h5 className="mt-3 text-success">Document signé</h5>
            <p className="text-muted mb-0">
              Votre signature a été enregistrée avec succès.
              <br />
              Vous recevrez une copie par email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Signature iframe
  return (
    <div className="signature-embed">
      {/* Header */}
      <div className="ds-card mb-3">
        <div className="ds-card-body py-2">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0">
                {documentType === 'quote' ? 'Signature du devis' : 'Acceptation des CGV'}
              </h6>
              <small className="text-muted">
                {status === 'signing' ? 'En cours de signature...' : 'Prêt à signer'}
              </small>
            </div>
            <div>
              <button
                className="ds-btn ds-btn-sm ds-btn-outline-secondary me-2"
                onClick={checkSignatureStatus}
              >
                Vérifier le statut
              </button>
              <button
                className="ds-btn ds-btn-sm ds-btn-outline-danger"
                onClick={handleCancel}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Iframe */}
      <div className="ds-card">
        <div className="ratio ratio-16x9" style={{ minHeight: '600px' }}>
          {signatureUrl && (
            <iframe
              ref={iframeRef}
              src={signatureUrl}
              title="Signature électronique"
              onLoad={handleIframeLoad}
              style={{
                border: 'none',
                width: '100%',
                height: '100%'
              }}
              allow="camera;microphone"
            />
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="ds-card mt-3 bg-light">
        <div className="ds-card-body py-2">
          <small className="text-muted">
            <strong>Signature électronique sécurisée</strong>
            <br />
            Ce document est signé électroniquement conformément aux normes suisses (ZertES).
            Votre signature aura la même valeur juridique qu'une signature manuscrite.
          </small>
        </div>
      </div>
    </div>
  );
};

export default SignatureEmbed;

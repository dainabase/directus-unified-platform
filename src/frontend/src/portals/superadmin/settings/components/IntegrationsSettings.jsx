// src/frontend/src/portals/superadmin/settings/components/IntegrationsSettings.jsx
import React, { useState } from 'react';
import {
  Plug, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Settings, ExternalLink, Key, TestTube, Save, Eye, EyeOff
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const INTEGRATIONS = [
  {
    id: 'directus',
    name: 'Directus CMS',
    description: 'Systeme de gestion de contenu headless',
    logo: '/assets/logos/directus.svg',
    category: 'cms',
    required: true,
    fields: [
      { key: 'url', label: 'URL', type: 'url', placeholder: 'https://directus.yourdomain.com' },
      { key: 'token', label: 'Token Admin', type: 'password' }
    ]
  },
  {
    id: 'invoice_ninja',
    name: 'Invoice Ninja',
    description: 'Facturation et comptabilite',
    logo: '/assets/logos/invoice-ninja.svg',
    category: 'finance',
    required: true,
    fields: [
      { key: 'url', label: 'URL', type: 'url', placeholder: 'https://invoices.yourdomain.com' },
      { key: 'token', label: 'API Token', type: 'password' },
      { key: 'company_id', label: 'Company ID', type: 'text' }
    ]
  },
  {
    id: 'revolut',
    name: 'Revolut Business',
    description: 'Banking et paiements',
    logo: '/assets/logos/revolut.svg',
    category: 'finance',
    required: false,
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' },
      { key: 'environment', label: 'Environnement', type: 'select', options: ['sandbox', 'production'] }
    ]
  },
  {
    id: 'mautic',
    name: 'Mautic',
    description: 'Marketing automation',
    logo: '/assets/logos/mautic.svg',
    category: 'marketing',
    required: false,
    fields: [
      { key: 'url', label: 'URL', type: 'url', placeholder: 'https://mautic.yourdomain.com' },
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' }
    ]
  },
  {
    id: 'erpnext',
    name: 'ERPNext',
    description: 'ERP et gestion entreprise',
    logo: '/assets/logos/erpnext.svg',
    category: 'erp',
    required: false,
    fields: [
      { key: 'url', label: 'URL', type: 'url', placeholder: 'https://erp.yourdomain.com' },
      { key: 'api_key', label: 'API Key', type: 'password' },
      { key: 'api_secret', label: 'API Secret', type: 'password' }
    ]
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Communication clients',
    logo: '/assets/logos/whatsapp.svg',
    category: 'communication',
    required: false,
    fields: [
      { key: 'phone_id', label: 'Phone Number ID', type: 'text' },
      { key: 'access_token', label: 'Access Token', type: 'password' },
      { key: 'webhook_token', label: 'Webhook Verify Token', type: 'text' }
    ]
  },
  {
    id: 'smtp',
    name: 'Email SMTP',
    description: 'Envoi d\'emails transactionnels',
    logo: '/assets/logos/email.svg',
    category: 'communication',
    required: true,
    fields: [
      { key: 'host', label: 'Serveur SMTP', type: 'text', placeholder: 'smtp.example.com' },
      { key: 'port', label: 'Port', type: 'number', placeholder: '587' },
      { key: 'username', label: 'Utilisateur', type: 'text' },
      { key: 'password', label: 'Mot de passe', type: 'password' },
      { key: 'from_email', label: 'Email expediteur', type: 'email' }
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Paiements en ligne',
    logo: '/assets/logos/stripe.svg',
    category: 'finance',
    required: false,
    fields: [
      { key: 'publishable_key', label: 'Publishable Key', type: 'text' },
      { key: 'secret_key', label: 'Secret Key', type: 'password' },
      { key: 'webhook_secret', label: 'Webhook Secret', type: 'password' }
    ]
  }
];

const CATEGORIES = [
  { id: 'all', name: 'Toutes' },
  { id: 'cms', name: 'CMS' },
  { id: 'finance', name: 'Finance' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'erp', name: 'ERP' },
  { id: 'communication', name: 'Communication' }
];

const IntegrationsSettings = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedIntegration, setExpandedIntegration] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});
  const [testingId, setTestingId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch integration statuses
  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ['integration-status'],
    queryFn: async () => {
      const response = await fetch('/api/integrations/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      return response.json();
    },
    staleTime: 60000
  });

  const integrationStatus = statusData?.data || {};

  // Test connection mutation
  const testConnection = useMutation({
    mutationFn: async (integrationId) => {
      const response = await fetch(`/api/integrations/${integrationId}/test`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Test failed');
      return response.json();
    },
    onSuccess: (data, integrationId) => {
      toast.success(`Connexion ${INTEGRATIONS.find(i => i.id === integrationId)?.name} reussie`);
      refetch();
    },
    onError: (error, integrationId) => {
      toast.error(`Echec connexion ${INTEGRATIONS.find(i => i.id === integrationId)?.name}`);
    }
  });

  const handleTest = async (integrationId) => {
    setTestingId(integrationId);
    try {
      await testConnection.mutateAsync(integrationId);
    } finally {
      setTestingId(null);
    }
  };

  const toggleSecret = (integrationId, fieldKey) => {
    setShowSecrets(prev => ({
      ...prev,
      [`${integrationId}-${fieldKey}`]: !prev[`${integrationId}-${fieldKey}`]
    }));
  };

  const filteredIntegrations = activeCategory === 'all'
    ? INTEGRATIONS
    : INTEGRATIONS.filter(i => i.category === activeCategory);

  const getStatusBadge = (integration) => {
    const status = integrationStatus[integration.id];
    if (!status) {
      return (
        <span className="badge bg-secondary-lt text-secondary">
          Non configure
        </span>
      );
    }
    if (status.connected) {
      return (
        <span className="badge bg-success-lt text-success">
          <CheckCircle size={12} className="me-1" />
          Connecte
        </span>
      );
    }
    return (
      <span className="badge bg-danger-lt text-danger">
        <XCircle size={12} className="me-1" />
        Erreur
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <Plug size={20} className="me-2" />
            Integrations
          </h4>
          <p className="text-muted mb-0">
            Connectez vos services externes
          </p>
        </div>
        <button
          className="ds-btn ds-btn-outline-primary"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="btn-group">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`ds-btn ${activeCategory === cat.id ? 'ds-btn-primary' : 'ds-btn-outline-secondary'}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="row g-4">
        {filteredIntegrations.map(integration => {
          const isExpanded = expandedIntegration === integration.id;
          const status = integrationStatus[integration.id];

          return (
            <div className="col-md-6" key={integration.id}>
              <div className={`ds-card ${isExpanded ? 'border-primary' : ''}`}>
                <div className="ds-card-header">
                  <div className="d-flex align-items-center">
                    <div
                      className="avatar bg-light me-3"
                      style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plug size={24} className="text-primary" />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-0">
                        {integration.name}
                        {integration.required && (
                          <span className="badge bg-danger-lt text-danger ms-2">Requis</span>
                        )}
                      </h5>
                      <small className="text-muted">{integration.description}</small>
                    </div>
                    {getStatusBadge(integration)}
                  </div>
                </div>
                <div className="ds-card-body">
                  {/* Quick Actions */}
                  <div className="d-flex gap-2 mb-3">
                    <button
                      className="ds-btn ds-btn-sm ds-btn-outline-primary"
                      onClick={() => setExpandedIntegration(isExpanded ? null : integration.id)}
                    >
                      <Settings size={14} className="me-1" />
                      {isExpanded ? 'Fermer' : 'Configurer'}
                    </button>
                    <button
                      className="ds-btn ds-btn-sm ds-btn-outline-success"
                      onClick={() => handleTest(integration.id)}
                      disabled={testingId === integration.id}
                    >
                      {testingId === integration.id ? (
                        <RefreshCw size={14} className="me-1 spin" />
                      ) : (
                        <TestTube size={14} className="me-1" />
                      )}
                      Tester
                    </button>
                    {status?.docs_url && (
                      <a
                        href={status.docs_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ds-btn ds-btn-sm ds-btn-outline-secondary"
                      >
                        <ExternalLink size={14} className="me-1" />
                        Docs
                      </a>
                    )}
                  </div>

                  {/* Configuration Form */}
                  {isExpanded && (
                    <div className="border-top pt-3">
                      <form onSubmit={(e) => { e.preventDefault(); toast.success('Configuration sauvegardee'); }}>
                        {integration.fields.map(field => (
                          <div className="mb-3" key={field.key}>
                            <label className="form-label">{field.label}</label>
                            <div className="input-group">
                              {field.type === 'select' ? (
                                <select className="form-select">
                                  {field.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <>
                                  <input
                                    type={
                                      field.type === 'password' && !showSecrets[`${integration.id}-${field.key}`]
                                        ? 'password'
                                        : field.type === 'password' ? 'text' : field.type
                                    }
                                    className="form-control"
                                    placeholder={field.placeholder || ''}
                                    defaultValue={status?.config?.[field.key] || ''}
                                  />
                                  {field.type === 'password' && (
                                    <button
                                      type="button"
                                      className="ds-btn ds-btn-outline-secondary"
                                      onClick={() => toggleSecret(integration.id, field.key)}
                                    >
                                      {showSecrets[`${integration.id}-${field.key}`] ? (
                                        <EyeOff size={16} />
                                      ) : (
                                        <Eye size={16} />
                                      )}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="d-flex gap-2">
                          <button type="submit" className="ds-btn ds-btn-primary">
                            <Save size={14} className="me-1" />
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            className="ds-btn ds-btn-outline-secondary"
                            onClick={() => setExpandedIntegration(null)}
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Status Info */}
                  {status && !isExpanded && (
                    <div className="small text-muted">
                      {status.last_sync && (
                        <span>
                          Derniere sync: {new Date(status.last_sync).toLocaleString('fr-CH')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning for missing required integrations */}
      {INTEGRATIONS.filter(i => i.required && !integrationStatus[i.id]?.connected).length > 0 && (
        <div className="alert alert-warning mt-4">
          <AlertTriangle size={20} className="me-2" />
          <strong>Attention:</strong> Certaines integrations requises ne sont pas configurees.
          La plateforme peut ne pas fonctionner correctement.
        </div>
      )}
    </div>
  );
};

export default IntegrationsSettings;

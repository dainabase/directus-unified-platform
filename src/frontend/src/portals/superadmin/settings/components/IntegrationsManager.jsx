// src/frontend/src/portals/superadmin/settings/components/IntegrationsManager.jsx
import React, { useState } from 'react';
import {
  Plug, Database, FileText, Landmark, Megaphone, BookOpen,
  PenTool, Cloud, Brain, Link2, CheckCircle, Settings,
  AlertCircle, ExternalLink
} from 'lucide-react';

const STATUS_CONFIG = {
  active: { label: 'Actif', bg: 'bg-success-lt', text: 'text-success', Icon: CheckCircle },
  configured: { label: 'Configure', bg: 'bg-info-lt', text: 'text-info', Icon: Settings },
  inactive: { label: 'Inactif', bg: 'bg-secondary-lt', text: 'text-secondary', Icon: AlertCircle }
};

const INTEGRATIONS = [
  {
    id: 'directus',
    name: 'Directus',
    category: 'CMS',
    description: 'CMS headless et data layer central. Gere les 83 collections, les utilisateurs et les permissions.',
    status: 'active',
    Icon: Database,
    details: 'Port 8055 | Docker | PostgreSQL',
    docsUrl: 'https://docs.directus.io'
  },
  {
    id: 'invoice-ninja',
    name: 'Invoice Ninja',
    category: 'Facturation',
    description: 'Facturation et comptabilite. Generation de factures, devis et suivi des paiements.',
    status: 'configured',
    Icon: FileText,
    details: 'API REST | Token Auth',
    docsUrl: 'https://invoice-ninja.readthedocs.io'
  },
  {
    id: 'revolut',
    name: 'Revolut Business',
    category: 'Banking',
    description: 'Synchronisation bancaire automatique. 5 comptes entreprise, transactions en temps reel.',
    status: 'active',
    Icon: Landmark,
    details: '5 comptes | OAuth2 | Sync auto',
    docsUrl: 'https://developer.revolut.com'
  },
  {
    id: 'mautic',
    name: 'Mautic',
    category: 'Marketing',
    description: 'Marketing automation. Campagnes email, segmentation et scoring des leads.',
    status: 'configured',
    Icon: Megaphone,
    details: 'API REST | iframe integration',
    docsUrl: 'https://docs.mautic.org'
  },
  {
    id: 'erpnext',
    name: 'ERPNext',
    category: 'Comptabilite',
    description: 'Comptabilite avancee et gestion d\'entreprise. Plan comptable suisse et rapports financiers.',
    status: 'configured',
    Icon: BookOpen,
    details: 'API REST | Sync bidirectionnelle',
    docsUrl: 'https://docs.erpnext.com'
  },
  {
    id: 'docuseal',
    name: 'DocuSeal',
    category: 'Signatures',
    description: 'Signatures electroniques. Integre dans les portails client et legal pour signature de CGV et contrats.',
    status: 'active',
    Icon: PenTool,
    details: 'Embedded | Portails client & legal',
    docsUrl: 'https://www.docuseal.co/docs'
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary',
    category: 'Medias',
    description: 'Stockage et optimisation des medias. Images, PDF et fichiers associes aux projets.',
    status: 'active',
    Icon: Cloud,
    details: 'CDN | Transformation auto',
    docsUrl: 'https://cloudinary.com/documentation'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'AI / OCR',
    description: 'Intelligence artificielle et OCR. Extraction de donnees, classification et assistance.',
    status: 'active',
    Icon: Brain,
    details: 'GPT-4 | Vision API',
    docsUrl: 'https://platform.openai.com/docs'
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Sync',
    description: 'Synchronisation des projets et prestataires. Bases de donnees Notion connectees a Directus.',
    status: 'active',
    Icon: Link2,
    details: 'API REST | Sync projets & prestataires',
    docsUrl: 'https://developers.notion.com'
  }
];

const CATEGORIES = [
  'Toutes',
  'CMS',
  'Facturation',
  'Banking',
  'Marketing',
  'Comptabilite',
  'Signatures',
  'Medias',
  'AI / OCR',
  'Sync'
];

const IntegrationsManager = () => {
  const [filterCategory, setFilterCategory] = useState('Toutes');

  const filteredIntegrations = filterCategory === 'Toutes'
    ? INTEGRATIONS
    : INTEGRATIONS.filter(i => i.category === filterCategory);

  const stats = {
    total: INTEGRATIONS.length,
    active: INTEGRATIONS.filter(i => i.status === 'active').length,
    configured: INTEGRATIONS.filter(i => i.status === 'configured').length,
    inactive: INTEGRATIONS.filter(i => i.status === 'inactive').length
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
    const Icon = config.Icon;
    return (
      <span className={`badge ${config.bg} ${config.text}`}>
        <Icon size={12} className="me-1" />
        {config.label}
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
            {stats.total} integration{stats.total > 1 ? 's' : ''}
            {' '}&mdash;{' '}
            <span className="text-success">{stats.active} active{stats.active > 1 ? 's' : ''}</span>
            {stats.configured > 0 && (
              <>, <span className="text-info">{stats.configured} configuree{stats.configured > 1 ? 's' : ''}</span></>
            )}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card glass-card">
            <div className="card-body p-3 text-center">
              <div className="h2 mb-0 text-success">{stats.active}</div>
              <small className="text-muted">Actives</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card glass-card">
            <div className="card-body p-3 text-center">
              <div className="h2 mb-0 text-info">{stats.configured}</div>
              <small className="text-muted">Configurees</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card glass-card">
            <div className="card-body p-3 text-center">
              <div className="h2 mb-0 text-secondary">{stats.inactive}</div>
              <small className="text-muted">Inactives</small>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4" style={{ overflowX: 'auto' }}>
        <div className="d-flex gap-1 flex-nowrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm flex-shrink-0 ${
                filterCategory === cat ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="row g-3">
        {filteredIntegrations.map(integration => {
          const IntegrationIcon = integration.Icon;
          return (
            <div className="col-md-6 col-lg-4" key={integration.id}>
              <div className="card glass-card h-100">
                <div className="card-body p-4">
                  {/* Icon + Status */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 bg-primary-lt text-primary"
                      style={{ width: 48, height: 48, flexShrink: 0 }}
                    >
                      <IntegrationIcon size={24} />
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>

                  {/* Name + Category */}
                  <h5 className="mb-1">{integration.name}</h5>
                  <span className="badge bg-light text-dark mb-2" style={{ fontSize: '0.7rem' }}>
                    {integration.category}
                  </span>

                  {/* Description */}
                  <p className="text-muted small mb-3" style={{ minHeight: 48 }}>
                    {integration.description}
                  </p>

                  {/* Technical details */}
                  <div className="small text-muted mb-3">
                    <Settings size={12} className="me-1" />
                    {integration.details}
                  </div>

                  {/* Docs link */}
                  {integration.docsUrl && (
                    <a
                      href={integration.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary w-100"
                    >
                      <ExternalLink size={14} className="me-1" />
                      Documentation
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture note */}
      <div className="alert alert-info mt-4">
        <strong>Architecture hybride "Dashboard ORCHESTRE":</strong>{' '}
        Le Superadmin React orchestre toutes les integrations. Les outils specialises sont integres
        en iframe ou via API REST. La configuration des cles API et tokens se fait dans le fichier
        <code className="ms-1">.env</code>.
      </div>
    </div>
  );
};

export default IntegrationsManager;

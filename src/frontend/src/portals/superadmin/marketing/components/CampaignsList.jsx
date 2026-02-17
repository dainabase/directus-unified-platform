// src/frontend/src/portals/superadmin/marketing/components/CampaignsList.jsx
import React, { useState } from 'react';
import {
  Mail, Plus, Edit2, Trash2, Copy, Play, Pause, Eye,
  Send, Users, Clock, CheckCircle, XCircle, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const mockCampaigns = [
  {
    id: 1,
    name: 'Newsletter Decembre 2024',
    subject: 'Les nouveautes du mois!',
    status: 'active',
    type: 'newsletter',
    recipients: 5200,
    sent: 5180,
    delivered: 5102,
    opened: 1248,
    clicked: 167,
    bounced: 78,
    unsubscribed: 12,
    scheduledAt: null,
    sentAt: '2024-12-10T09:00:00',
    createdAt: '2024-12-08T14:30:00'
  },
  {
    id: 2,
    name: 'Promo Fin d\'annee',
    subject: '-20% sur tous nos services',
    status: 'scheduled',
    type: 'promotional',
    recipients: 8400,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    scheduledAt: '2024-12-20T10:00:00',
    sentAt: null,
    createdAt: '2024-12-12T11:00:00'
  },
  {
    id: 3,
    name: 'Welcome Series - Jour 1',
    subject: 'Bienvenue chez nous!',
    status: 'active',
    type: 'automation',
    recipients: 156,
    sent: 156,
    delivered: 154,
    opened: 98,
    clicked: 45,
    bounced: 2,
    unsubscribed: 1,
    scheduledAt: null,
    sentAt: '2024-12-01T00:00:00',
    createdAt: '2024-11-15T09:00:00'
  },
  {
    id: 4,
    name: 'Rappel Facture Impayee',
    subject: 'Votre facture arrive a echeance',
    status: 'draft',
    type: 'transactional',
    recipients: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    scheduledAt: null,
    sentAt: null,
    createdAt: '2024-12-13T16:00:00'
  },
  {
    id: 5,
    name: 'Voeux 2025',
    subject: 'Meilleurs voeux pour 2025!',
    status: 'scheduled',
    type: 'newsletter',
    recipients: 12500,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    scheduledAt: '2024-12-31T08:00:00',
    sentAt: null,
    createdAt: '2024-12-10T15:00:00'
  }
];

const CAMPAIGN_TYPES = {
  newsletter: { label: 'Newsletter', color: 'primary' },
  promotional: { label: 'Promotionnel', color: 'success' },
  automation: { label: 'Automation', color: 'info' },
  transactional: { label: 'Transactionnel', color: 'warning' }
};

const CampaignsList = ({ selectedCompany }) => {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesType = filterType === 'all' || c.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success"><CheckCircle size={12} className="me-1" />Active</span>;
      case 'scheduled':
        return <span className="badge bg-warning"><Clock size={12} className="me-1" />Planifiee</span>;
      case 'draft':
        return <span className="badge bg-secondary"><Edit2 size={12} className="me-1" />Brouillon</span>;
      case 'paused':
        return <span className="badge bg-danger"><Pause size={12} className="me-1" />En pause</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const handleDuplicate = (campaign) => {
    const newCampaign = {
      ...campaign,
      id: Date.now(),
      name: `${campaign.name} (copie)`,
      status: 'draft',
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      createdAt: new Date().toISOString()
    };
    setCampaigns([newCampaign, ...campaigns]);
    toast.success('Campagne dupliquee');
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette campagne?')) {
      setCampaigns(campaigns.filter(c => c.id !== id));
      toast.success('Campagne supprimee');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text"><Search size={16} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher une campagne..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="scheduled">Planifiee</option>
            <option value="draft">Brouillon</option>
            <option value="paused">En pause</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tous les types</option>
            {Object.entries(CAMPAIGN_TYPES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100">
            <Plus size={16} className="me-1" />
            Nouvelle
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Total campagnes</span>
                <span className="fw-bold">{campaigns.length}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Actives</span>
                <span className="fw-bold">{campaigns.filter(c => c.status === 'active').length}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Planifiees</span>
                <span className="fw-bold">{campaigns.filter(c => c.status === 'scheduled').length}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-secondary-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Brouillons</span>
                <span className="fw-bold">{campaigns.filter(c => c.status === 'draft').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover card-table">
            <thead>
              <tr>
                <th>Campagne</th>
                <th>Type</th>
                <th>Statut</th>
                <th className="text-center">Envoyes</th>
                <th className="text-center">Ouvertures</th>
                <th className="text-center">Clics</th>
                <th>Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(campaign => {
                const typeInfo = CAMPAIGN_TYPES[campaign.type];
                const openRate = campaign.delivered > 0
                  ? ((campaign.opened / campaign.delivered) * 100).toFixed(1)
                  : 0;
                const clickRate = campaign.opened > 0
                  ? ((campaign.clicked / campaign.opened) * 100).toFixed(1)
                  : 0;

                return (
                  <tr key={campaign.id}>
                    <td>
                      <div>
                        <div className="fw-medium">{campaign.name}</div>
                        <small className="text-muted">{campaign.subject}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`badge bg-${typeInfo.color}-lt text-${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td>{getStatusBadge(campaign.status)}</td>
                    <td className="text-center">
                      <div className="fw-medium">{campaign.sent.toLocaleString()}</div>
                      <small className="text-muted">{campaign.recipients.toLocaleString()} dest.</small>
                    </td>
                    <td className="text-center">
                      <div className="fw-medium">{campaign.opened.toLocaleString()}</div>
                      <small className="text-success">{openRate}%</small>
                    </td>
                    <td className="text-center">
                      <div className="fw-medium">{campaign.clicked.toLocaleString()}</div>
                      <small className="text-info">{clickRate}%</small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {campaign.status === 'scheduled'
                          ? `Planifie: ${formatDate(campaign.scheduledAt)}`
                          : campaign.sentAt
                            ? `Envoye: ${formatDate(campaign.sentAt)}`
                            : `Cree: ${formatDate(campaign.createdAt)}`
                        }
                      </small>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-ghost-primary"
                          onClick={() => setSelectedCampaign(campaign)}
                          title="Voir les details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost-secondary"
                          onClick={() => handleDuplicate(campaign)}
                          title="Dupliquer"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost-danger"
                          onClick={() => handleDelete(campaign.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-5 text-muted">
            <Mail size={48} className="mb-3 opacity-50" />
            <p>Aucune campagne trouvee</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsList;

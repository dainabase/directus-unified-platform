// src/frontend/src/portals/superadmin/legal/components/AcceptanceHistory.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, User, Clock, Eye, Download, 
  Search, Filter, Calendar, FileText, MapPin,
  Smartphone, Globe, Shield
} from 'lucide-react';

const AcceptanceHistory = ({ company, acceptances = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('30');
  const [selectedAcceptance, setSelectedAcceptance] = useState(null);
  
  const cgvTypes = [
    { value: 'all', label: 'Tous types' },
    { value: 'cgv_vente', label: 'CGV Vente' },
    { value: 'cgl_location', label: 'CGL Location' },
    { value: 'cgv_service', label: 'CGV Service' }
  ];
  
  const periods = [
    { value: '7', label: '7 derniers jours' },
    { value: '30', label: '30 derniers jours' },
    { value: '90', label: '90 derniers jours' },
    { value: '365', label: 'Cette année' },
    { value: 'all', label: 'Toute la période' }
  ];
  
  // Filtrage des acceptations
  const filteredAcceptances = acceptances.filter(acceptance => {
    const matchesSearch = !searchTerm || 
      acceptance.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acceptance.client_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || acceptance.cgv_type === filterType;
    
    const now = new Date();
    const acceptanceDate = new Date(acceptance.accepted_at);
    const daysDiff = Math.floor((now - acceptanceDate) / (1000 * 60 * 60 * 24));
    const matchesPeriod = filterPeriod === 'all' || daysDiff <= parseInt(filterPeriod);
    
    return matchesSearch && matchesType && matchesPeriod;
  });
  
  const getMethodBadge = (method) => {
    const badges = {
      click: { class: 'bg-zinc-100', label: 'Clic acceptation', icon: CheckCircle },
      signature: { class: 'bg-zinc-50', label: 'Signature électronique', icon: Shield },
      form: { class: 'bg-zinc-200', label: 'Formulaire', icon: FileText },
      api: { class: 'bg-zinc-100', label: 'API', icon: Globe }
    };
    const badge = badges[method] || badges.click;
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.class}`}>
        <Icon size={12} className="me-1" />
        {badge.label}
      </span>
    );
  };
  
  const getDeviceIcon = (device) => {
    if (device?.includes('Mobile') || device?.includes('Android') || device?.includes('iPhone')) {
      return <Smartphone size={14} className="text-muted" />;
    }
    return <Globe size={14} className="text-muted" />;
  };

  return (
    <div>
      {/* Header avec recherche et filtres */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h4>
            <CheckCircle size={20} className="me-2" />
            Historique des Acceptations
          </h4>
          <div className="text-muted small">
            Traçabilité des acceptations clients selon art. 3 LCD
          </div>
        </div>
        <div className="col-md-6">
          <div className="row g-2">
            <div className="col">
              <div className="input-group input-group-sm">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filtres */}
      <div className="row row-cards mb-4">
        <div className="col-md-4">
          <div className="form-selectgroup">
            <label className="form-selectgroup-item">
              <span className="form-selectgroup-label d-flex align-items-center p-3">
                <Filter size={16} className="me-2" />
                <select 
                  className="form-select form-select-sm border-0"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  {cgvTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-selectgroup">
            <label className="form-selectgroup-item">
              <span className="form-selectgroup-label d-flex align-items-center p-3">
                <Calendar size={16} className="me-2" />
                <select 
                  className="form-select form-select-sm border-0"
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                >
                  {periods.map(period => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-sm">
            <div className="card-body text-center">
              <div className="h1 mb-0">{filteredAcceptances.length}</div>
              <div className="text-muted">Acceptations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des acceptations */}
      <div className="table-responsive">
        <table className="table table-vcenter card-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Document</th>
              <th>Méthode</th>
              <th>Date/Heure</th>
              <th>Localisation</th>
              <th>Appareil</th>
              <th className="w-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAcceptances.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  Aucune acceptation trouvée avec les critères sélectionnés
                </td>
              </tr>
            )}
            {filteredAcceptances.map(acceptance => (
              <tr key={acceptance.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <User size={16} className="me-2 text-muted" />
                    <div>
                      <div className="font-weight-medium">{acceptance.client_name}</div>
                      <div className="text-muted small">{acceptance.client_email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className="font-weight-medium">{acceptance.cgv_title}</div>
                    <div className="text-muted small">
                      v{acceptance.cgv_version} - {acceptance.cgv_type}
                    </div>
                  </div>
                </td>
                <td>{getMethodBadge(acceptance.acceptance_method)}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <Clock size={14} className="me-1 text-muted" />
                    <div>
                      <div>{new Date(acceptance.accepted_at).toLocaleDateString('fr-CH')}</div>
                      <div className="text-muted small">
                        {new Date(acceptance.accepted_at).toLocaleTimeString('fr-CH')}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <MapPin size={14} className="me-1 text-muted" />
                    <div className="small">
                      {acceptance.ip_country || 'Inconnu'}
                      {acceptance.ip_city && `, ${acceptance.ip_city}`}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    {getDeviceIcon(acceptance.user_agent)}
                    <div className="ms-2 small text-muted">
                      {acceptance.device_type || 'Navigateur'}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="btn-list flex-nowrap">
                    <button 
                      className="ds-btn ds-btn-secondary text-sm"
                      onClick={() => setSelectedAcceptance(acceptance)}
                      title="Voir détails"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="btn btn-sm btn-ghost-secondary"
                      title="Télécharger preuve"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination ou load more si nécessaire */}
      {filteredAcceptances.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted small">
            {filteredAcceptances.length} acceptation(s) trouvée(s)
          </div>
          {acceptances.length > filteredAcceptances.length && (
            <button className="btn btn-outline-primary btn-sm">
              Afficher plus
            </button>
          )}
        </div>
      )}

      {/* Modal détails acceptation */}
      {selectedAcceptance && (
        <AcceptanceDetailsModal 
          acceptance={selectedAcceptance}
          onClose={() => setSelectedAcceptance(null)}
        />
      )}
    </div>
  );
};

// Modal détails acceptation
const AcceptanceDetailsModal = ({ acceptance, onClose }) => {
  return (
    <div className="modal modal-blur fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Détails de l'acceptation</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              {/* Informations client */}
              <div className="col-md-6">
                <h6 className="text-muted text-uppercase mb-3">Client</h6>
                <dl className="row">
                  <dt className="col-4">Nom:</dt>
                  <dd className="col-8">{acceptance.client_name}</dd>
                  <dt className="col-4">Email:</dt>
                  <dd className="col-8">{acceptance.client_email}</dd>
                  {acceptance.client_phone && (
                    <>
                      <dt className="col-4">Téléphone:</dt>
                      <dd className="col-8">{acceptance.client_phone}</dd>
                    </>
                  )}
                </dl>
              </div>
              
              {/* Informations document */}
              <div className="col-md-6">
                <h6 className="text-muted text-uppercase mb-3">Document</h6>
                <dl className="row">
                  <dt className="col-4">Titre:</dt>
                  <dd className="col-8">{acceptance.cgv_title}</dd>
                  <dt className="col-4">Version:</dt>
                  <dd className="col-8">v{acceptance.cgv_version}</dd>
                  <dt className="col-4">Type:</dt>
                  <dd className="col-8">{acceptance.cgv_type}</dd>
                </dl>
              </div>
            </div>
            
            <hr />
            
            <div className="row">
              {/* Informations acceptation */}
              <div className="col-md-6">
                <h6 className="text-muted text-uppercase mb-3">Acceptation</h6>
                <dl className="row">
                  <dt className="col-4">Date/Heure:</dt>
                  <dd className="col-8">
                    {new Date(acceptance.accepted_at).toLocaleString('fr-CH')}
                  </dd>
                  <dt className="col-4">Méthode:</dt>
                  <dd className="col-8">{acceptance.acceptance_method}</dd>
                  {acceptance.signature_id && (
                    <>
                      <dt className="col-4">ID Signature:</dt>
                      <dd className="col-8">{acceptance.signature_id}</dd>
                    </>
                  )}
                </dl>
              </div>
              
              {/* Informations techniques */}
              <div className="col-md-6">
                <h6 className="text-muted text-uppercase mb-3">Données techniques</h6>
                <dl className="row">
                  <dt className="col-4">IP:</dt>
                  <dd className="col-8">
                    <code>{acceptance.ip_address}</code>
                  </dd>
                  <dt className="col-4">Pays:</dt>
                  <dd className="col-8">{acceptance.ip_country || 'Inconnu'}</dd>
                  {acceptance.ip_city && (
                    <>
                      <dt className="col-4">Ville:</dt>
                      <dd className="col-8">{acceptance.ip_city}</dd>
                    </>
                  )}
                  <dt className="col-4">Appareil:</dt>
                  <dd className="col-8">{acceptance.device_type}</dd>
                </dl>
              </div>
            </div>
            
            {/* User Agent complet */}
            {acceptance.user_agent && (
              <>
                <hr />
                <h6 className="text-muted text-uppercase mb-3">User Agent</h6>
                <div className="bg-light p-3 rounded">
                  <small className="text-muted font-monospace">
                    {acceptance.user_agent}
                  </small>
                </div>
              </>
            )}
            
            {/* Hash de vérification */}
            {acceptance.verification_hash && (
              <>
                <hr />
                <h6 className="text-muted text-uppercase mb-3">Vérification</h6>
                <div className="bg-light p-3 rounded">
                  <div className="row">
                    <div className="col-3">
                      <strong>Hash SHA-256:</strong>
                    </div>
                    <div className="col-9">
                      <code className="small">{acceptance.verification_hash}</code>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Fermer
            </button>
            <button 
              type="button" 
              className="ds-btn ds-btn-primary"
            >
              <Download size={16} className="me-1" />
              Télécharger preuve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptanceHistory;
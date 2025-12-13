// src/frontend/src/portals/superadmin/legal/components/SignatureRequests.jsx
import React, { useState } from 'react';
import { 
  PenTool, Plus, Send, Eye, Clock, CheckCircle, 
  XCircle, RefreshCw, AlertTriangle, Mail, User,
  Calendar, FileText, Shield
} from 'lucide-react';
import { useCreateSignature } from '../hooks/useLegalData';
import toast from 'react-hot-toast';

const SignatureRequests = ({ company, requests = [], onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const createSignature = useCreateSignature();
  
  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'signed', label: 'Signées' },
    { value: 'cancelled', label: 'Annulées' },
    { value: 'expired', label: 'Expirées' }
  ];
  
  const signatureTypes = [
    { id: 'SES', label: 'SES - Signature Électronique Simple', level: 'Standard' },
    { id: 'AES', label: 'AES - Signature Électronique Avancée', level: 'Avancé' },
    { id: 'QES', label: 'QES - Signature Électronique Qualifiée', level: 'Maximum' }
  ];
  
  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);
  
  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-warning', label: 'En attente', icon: Clock },
      sent: { class: 'bg-info', label: 'Envoyée', icon: Mail },
      signed: { class: 'bg-success', label: 'Signée', icon: CheckCircle },
      cancelled: { class: 'bg-secondary', label: 'Annulée', icon: XCircle },
      expired: { class: 'bg-danger', label: 'Expirée', icon: AlertTriangle }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.class}`}>
        <Icon size={12} className="me-1" />
        {badge.label}
      </span>
    );
  };
  
  const getSignatureTypeColor = (type) => {
    const colors = {
      SES: 'blue',
      AES: 'purple', 
      QES: 'green'
    };
    return colors[type] || 'blue';
  };

  return (
    <div>
      {/* Header avec actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>
            <PenTool size={20} className="me-2" />
            Demandes de Signature Électronique
          </h4>
          <div className="text-muted small">
            Gestion des signatures SES/AES/QES selon eIDAS
          </div>
        </div>
        <div className="btn-list">
          <select 
            className="form-select form-select-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={onRefresh}
          >
            <RefreshCw size={16} />
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} className="me-1" />
            Nouvelle demande
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="row row-cards mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <Clock size={20} className="text-warning" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    {requests.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-muted">En attente</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <CheckCircle size={20} className="text-success" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    {requests.filter(r => r.status === 'signed').length}
                  </div>
                  <div className="text-muted">Signées</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <Shield size={20} className="text-green" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    {requests.filter(r => r.signature_type === 'QES').length}
                  </div>
                  <div className="text-muted">QES (Qualifiées)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <AlertTriangle size={20} className="text-danger" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    {requests.filter(r => r.status === 'expired').length}
                  </div>
                  <div className="text-muted">Expirées</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="table-responsive">
        <table className="table table-vcenter card-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Signataire</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Envoyée le</th>
              <th>Expire le</th>
              <th className="w-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  {filterStatus === 'all' 
                    ? 'Aucune demande de signature'
                    : `Aucune demande avec le statut "${statusOptions.find(s => s.value === filterStatus)?.label}"`
                  }
                </td>
              </tr>
            )}
            {filteredRequests.map(request => (
              <tr key={request.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <FileText size={16} className="me-2 text-muted" />
                    <div>
                      <div className="font-weight-medium">{request.document_title}</div>
                      <div className="text-muted small">{request.document_type}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <User size={16} className="me-2 text-muted" />
                    <div>
                      <div>{request.signer_name}</div>
                      <div className="text-muted small">{request.signer_email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge bg-${getSignatureTypeColor(request.signature_type)}-lt`}>
                    {request.signature_type}
                  </span>
                </td>
                <td>{getStatusBadge(request.status)}</td>
                <td>
                  <Calendar size={14} className="me-1" />
                  {new Date(request.sent_at).toLocaleDateString('fr-CH')}
                </td>
                <td>
                  <Calendar size={14} className="me-1" />
                  {new Date(request.expires_at).toLocaleDateString('fr-CH')}
                </td>
                <td>
                  <div className="btn-list flex-nowrap">
                    <button 
                      className="btn btn-sm btn-ghost-primary"
                      onClick={() => setSelectedRequest(request)}
                      title="Voir détails"
                    >
                      <Eye size={16} />
                    </button>
                    {request.status === 'pending' && (
                      <button 
                        className="btn btn-sm btn-ghost-primary"
                        title="Renvoyer"
                      >
                        <Send size={16} />
                      </button>
                    )}
                    {request.status === 'pending' && (
                      <button 
                        className="btn btn-sm btn-ghost-danger"
                        title="Annuler"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Création nouvelle demande */}
      {showCreateModal && (
        <CreateSignatureModal 
          company={company}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            await createSignature.mutateAsync(data);
            setShowCreateModal(false);
            onRefresh();
          }}
          isLoading={createSignature.isPending}
        />
      )}

      {/* Modal Détails demande */}
      {selectedRequest && (
        <SignatureDetailsModal 
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};

// Modal création nouvelle demande
const CreateSignatureModal = ({ company, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    document_title: '',
    document_type: 'cgv_vente',
    signer_name: '',
    signer_email: '',
    signature_type: 'SES',
    expires_in_days: 30,
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      company
    });
  };

  return (
    <div className="modal modal-blur fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Nouvelle demande de signature</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-8">
                  <div className="mb-3">
                    <label className="form-label required">Titre du document</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={formData.document_title}
                      onChange={(e) => setFormData({...formData, document_title: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select 
                      className="form-select"
                      value={formData.document_type}
                      onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                    >
                      <option value="cgv_vente">CGV Vente</option>
                      <option value="cgl_location">CGL Location</option>
                      <option value="cgv_service">CGV Service</option>
                      <option value="contract">Contrat</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label required">Nom signataire</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={formData.signer_name}
                      onChange={(e) => setFormData({...formData, signer_name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label required">Email signataire</label>
                    <input 
                      type="email"
                      className="form-control"
                      value={formData.signer_email}
                      onChange={(e) => setFormData({...formData, signer_email: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Type de signature</label>
                    <select 
                      className="form-select"
                      value={formData.signature_type}
                      onChange={(e) => setFormData({...formData, signature_type: e.target.value})}
                    >
                      <option value="SES">SES - Simple</option>
                      <option value="AES">AES - Avancée</option>
                      <option value="QES">QES - Qualifiée</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Expiration (jours)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={formData.expires_in_days}
                      onChange={(e) => setFormData({...formData, expires_in_days: parseInt(e.target.value)})}
                      min="1"
                      max="90"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Message personnel</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Message à joindre à la demande de signature..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Envoi...' : 'Envoyer demande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal détails demande
const SignatureDetailsModal = ({ request, onClose }) => {
  return (
    <div className="modal modal-blur fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Détails demande de signature</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <dl className="row">
                  <dt className="col-5">Document:</dt>
                  <dd className="col-7">{request.document_title}</dd>
                  <dt className="col-5">Type:</dt>
                  <dd className="col-7">{request.document_type}</dd>
                  <dt className="col-5">Signataire:</dt>
                  <dd className="col-7">{request.signer_name}</dd>
                  <dt className="col-5">Email:</dt>
                  <dd className="col-7">{request.signer_email}</dd>
                </dl>
              </div>
              <div className="col-md-6">
                <dl className="row">
                  <dt className="col-5">Type signature:</dt>
                  <dd className="col-7">{request.signature_type}</dd>
                  <dt className="col-5">Statut:</dt>
                  <dd className="col-7">{request.status}</dd>
                  <dt className="col-5">Envoyée le:</dt>
                  <dd className="col-7">{new Date(request.sent_at).toLocaleDateString('fr-CH')}</dd>
                  <dt className="col-5">Expire le:</dt>
                  <dd className="col-7">{new Date(request.expires_at).toLocaleDateString('fr-CH')}</dd>
                </dl>
              </div>
            </div>
            {request.message && (
              <div className="mt-3">
                <strong>Message:</strong>
                <div className="border rounded p-3 mt-2 bg-light">
                  {request.message}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureRequests;
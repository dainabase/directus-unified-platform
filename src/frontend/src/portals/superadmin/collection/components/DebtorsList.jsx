// src/frontend/src/portals/superadmin/collection/components/DebtorsList.jsx
import React, { useState } from 'react';
import { 
  Users, Plus, Search, Filter, Eye, Edit, 
  Mail, Clock, AlertTriangle, DollarSign,
  Calendar, MapPin, Phone, Building2
} from 'lucide-react';
import { useSaveDebtor } from '../hooks/useCollectionData';
import toast from 'react-hot-toast';

const DebtorsList = ({ company, debtors = [], onSelectDebtor, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const saveDebtor = useSaveDebtor();
  
  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: 'Actifs' },
    { value: 'in_collection', label: 'En recouvrement' },
    { value: 'lp_process', label: 'Procédure LP' },
    { value: 'paid', label: 'Soldés' },
    { value: 'written_off', label: 'Passés en perte' }
  ];
  
  const filteredDebtors = debtors.filter(debtor => {
    const matchesSearch = !searchTerm || 
      debtor.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debtor.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debtor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || debtor.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'bg-success', label: 'Actif' },
      in_collection: { class: 'bg-warning', label: 'Recouvrement' },
      lp_process: { class: 'bg-danger', label: 'LP en cours' },
      paid: { class: 'bg-blue', label: 'Soldé' },
      written_off: { class: 'bg-secondary', label: 'Perte' }
    };
    const badge = badges[status] || badges.active;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };
  
  const getUrgencyIcon = (debtor) => {
    const daysDue = Math.floor((new Date() - new Date(debtor.due_date)) / (1000 * 60 * 60 * 24));
    if (daysDue > 90) return <AlertTriangle size={16} className="text-danger" />;
    if (daysDue > 30) return <Clock size={16} className="text-warning" />;
    return null;
  };

  return (
    <div>
      {/* Header avec recherche et actions */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h4>
            <Users size={20} className="me-2" />
            Liste des Débiteurs
          </h4>
          <div className="text-muted small">
            Gestion centralisée du portefeuille créances
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
                  placeholder="Rechercher débiteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-auto">
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={16} className="me-1" />
                Nouveau
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filtres et stats rapides */}
      <div className="row row-cards mb-4">
        <div className="col-md-3">
          <div className="form-selectgroup">
            <label className="form-selectgroup-item">
              <span className="form-selectgroup-label d-flex align-items-center p-3">
                <Filter size={16} className="me-2" />
                <select 
                  className="form-select form-select-sm border-0"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body text-center">
              <div className="h1 mb-0">{filteredDebtors.length}</div>
              <div className="text-muted">Débiteurs</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body text-center">
              <div className="h1 mb-0 text-danger">
                {filteredDebtors.filter(d => d.status === 'lp_process').length}
              </div>
              <div className="text-muted">LP en cours</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body text-center">
              <div className="h1 mb-0 text-success">
                {filteredDebtors.reduce((sum, d) => sum + (d.total_amount || 0), 0).toLocaleString('fr-CH')}
              </div>
              <div className="text-muted">CHF Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des débiteurs */}
      <div className="table-responsive">
        <table className="table table-vcenter card-table">
          <thead>
            <tr>
              <th>Débiteur</th>
              <th>Contact</th>
              <th>Montant dû</th>
              <th>Échéance</th>
              <th>Statut</th>
              <th>Dernière action</th>
              <th className="w-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDebtors.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  Aucun débiteur trouvé avec les critères sélectionnés
                </td>
              </tr>
            )}
            {filteredDebtors.map(debtor => (
              <tr key={debtor.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <Building2 size={16} className="me-2 text-muted" />
                    <div>
                      <div className="font-weight-medium">{debtor.company_name}</div>
                      {debtor.reference && (
                        <div className="text-muted small">Réf: {debtor.reference}</div>
                      )}
                    </div>
                    <div className="ms-2">
                      {getUrgencyIcon(debtor)}
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className="d-flex align-items-center">
                      <Users size={14} className="me-1 text-muted" />
                      {debtor.contact_name}
                    </div>
                    {debtor.email && (
                      <div className="d-flex align-items-center text-muted small">
                        <Mail size={12} className="me-1" />
                        {debtor.email}
                      </div>
                    )}
                    {debtor.phone && (
                      <div className="d-flex align-items-center text-muted small">
                        <Phone size={12} className="me-1" />
                        {debtor.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <DollarSign size={14} className="me-1 text-muted" />
                    <div>
                      <div className="font-weight-medium">
                        {(debtor.total_amount || 0).toLocaleString('fr-CH', {
                          style: 'currency',
                          currency: 'CHF'
                        })}
                      </div>
                      {debtor.interest_amount > 0 && (
                        <div className="text-muted small">
                          + {(debtor.interest_amount).toLocaleString('fr-CH', {
                            style: 'currency',
                            currency: 'CHF'
                          })} intérêts
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <Calendar size={14} className="me-1 text-muted" />
                    <div>
                      <div>{new Date(debtor.due_date).toLocaleDateString('fr-CH')}</div>
                      <div className="text-muted small">
                        {Math.floor((new Date() - new Date(debtor.due_date)) / (1000 * 60 * 60 * 24))} jours
                      </div>
                    </div>
                  </div>
                </td>
                <td>{getStatusBadge(debtor.status)}</td>
                <td>
                  <div className="text-muted small">
                    {debtor.last_action || 'Aucune action'}
                  </div>
                  <div className="text-muted small">
                    {debtor.last_action_date && new Date(debtor.last_action_date).toLocaleDateString('fr-CH')}
                  </div>
                </td>
                <td>
                  <div className="btn-list flex-nowrap">
                    <button 
                      className="btn btn-sm btn-ghost-primary"
                      onClick={() => onSelectDebtor(debtor.id)}
                      title="Voir détails"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="btn btn-sm btn-ghost-secondary"
                      title="Envoyer rappel"
                    >
                      <Mail size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal création nouveau débiteur */}
      {showCreateModal && (
        <CreateDebtorModal 
          company={company}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            await saveDebtor.mutateAsync({ data: { ...data, company } });
            setShowCreateModal(false);
            onRefresh();
          }}
          isLoading={saveDebtor.isPending}
        />
      )}
    </div>
  );
};

// Modal création nouveau débiteur
const CreateDebtorModal = ({ company, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    canton: 'GE',
    reference: '',
    invoice_number: '',
    invoice_date: '',
    due_date: '',
    original_amount: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal modal-blur fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Nouveau débiteur</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                {/* Informations entreprise */}
                <div className="col-md-6">
                  <h6 className="text-muted text-uppercase mb-3">Entreprise</h6>
                  <div className="mb-3">
                    <label className="form-label required">Raison sociale</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Référence interne</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={formData.reference}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Adresse</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="form-label">NPA</label>
                        <input 
                          type="text"
                          className="form-control"
                          value={formData.zip}
                          onChange={(e) => setFormData({...formData, zip: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="form-label">Ville</label>
                        <input 
                          type="text"
                          className="form-control"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact et créance */}
                <div className="col-md-6">
                  <h6 className="text-muted text-uppercase mb-3">Contact</h6>
                  <div className="mb-3">
                    <label className="form-label required">Nom contact</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input 
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="form-label">Téléphone</label>
                        <input 
                          type="text"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <h6 className="text-muted text-uppercase mb-3 mt-4">Créance</h6>
                  <div className="mb-3">
                    <label className="form-label required">Montant original (CHF)</label>
                    <input 
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.original_amount}
                      onChange={(e) => setFormData({...formData, original_amount: e.target.value})}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="form-label">N° facture</label>
                        <input 
                          type="text"
                          className="form-control"
                          value={formData.invoice_number}
                          onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="form-label required">Échéance</label>
                        <input 
                          type="date"
                          className="form-control"
                          value={formData.due_date}
                          onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Description/Objet</label>
                <textarea 
                  className="form-control"
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Nature de la créance, prestations fournies..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Création...' : 'Créer débiteur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DebtorsList;
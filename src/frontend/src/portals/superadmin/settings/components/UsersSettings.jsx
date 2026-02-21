// src/frontend/src/portals/superadmin/settings/components/UsersSettings.jsx
import React, { useState } from 'react';
import {
  Users, Plus, Edit2, Trash2, Search, Shield, Mail, Phone,
  Building2, CheckCircle, XCircle, RefreshCw, UserPlus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 'admin', label: 'Administrateur', color: 'danger' },
  { id: 'manager', label: 'Manager', color: 'warning' },
  { id: 'accountant', label: 'Comptable', color: 'info' },
  { id: 'sales', label: 'Commercial', color: 'success' },
  { id: 'support', label: 'Support', color: 'primary' },
  { id: 'viewer', label: 'Lecteur', color: 'secondary' }
];

const COMPANIES = [
  'HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI REALTY', 'TAKEOUT'
];

const UsersSettings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const queryClient = useQueryClient();

  // Fetch users from Directus
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['platform-users'],
    queryFn: async () => {
      const response = await fetch('/api/directus/users?fields=*');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    staleTime: 60000
  });

  const users = usersData?.data || [];

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.status === 'active') ||
      (filterStatus === 'inactive' && user.status !== 'active');
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const getRoleInfo = (roleId) => {
    return ROLES.find(r => r.id === roleId) || { label: roleId, color: 'secondary' };
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <Users size={20} className="me-2" />
            Gestion des Utilisateurs
          </h4>
          <p className="text-muted mb-0">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="ds-btn ds-btn-outline-secondary"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
          </button>
          <button className="ds-btn ds-btn-primary" onClick={handleCreate}>
            <UserPlus size={16} className="me-1" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Tous les roles</option>
            {ROLES.map(role => (
              <option key={role.id} value={role.id}>{role.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <Users size={48} className="mb-3 opacity-50" />
          <p>Aucun utilisateur trouve</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Role</th>
                <th>Entreprises</th>
                <th>Statut</th>
                <th>Derniere connexion</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const roleInfo = getRoleInfo(user.role);
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="avatar bg-primary text-white rounded-circle me-3"
                          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <div className="fw-medium">{user.first_name} {user.last_name}</div>
                          <small className="text-muted">{user.title || 'Non defini'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${user.email}`} className="text-reset">
                        {user.email}
                      </a>
                    </td>
                    <td>
                      <span className={`badge bg-${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {(user.companies || []).slice(0, 2).map(company => (
                          <span key={company} className="badge bg-light text-dark">
                            {company}
                          </span>
                        ))}
                        {(user.companies || []).length > 2 && (
                          <span className="badge bg-secondary">
                            +{user.companies.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {user.status === 'active' ? (
                        <span className="badge bg-success-lt text-success">
                          <CheckCircle size={12} className="me-1" />
                          Actif
                        </span>
                      ) : (
                        <span className="badge bg-danger-lt text-danger">
                          <XCircle size={12} className="me-1" />
                          Inactif
                        </span>
                      )}
                    </td>
                    <td>
                      <small className="text-muted">
                        {user.last_access
                          ? new Date(user.last_access).toLocaleDateString('fr-CH')
                          : 'Jamais'}
                      </small>
                    </td>
                    <td className="text-end">
                      <button
                        className="ds-btn ds-btn-sm ds-btn-ghost-primary me-1"
                        onClick={() => handleEdit(user)}
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="ds-btn ds-btn-sm ds-btn-ghost-danger"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create/Edit - simplified for now */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

// User Modal Component
const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    role: user?.role || 'viewer',
    companies: user?.companies || [],
    status: user?.status || 'active'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyToggle = (company) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies.includes(company)
        ? prev.companies.filter(c => c !== company)
        : [...prev.companies, company]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement API call
    toast.success(user ? 'Utilisateur mis a jour' : 'Utilisateur cree');
    onSave();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {user ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Prenom</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                  >
                    {ROLES.map(role => (
                      <option key={role.id} value={role.id}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Acces entreprises</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {COMPANIES.map(company => (
                      <button
                        key={company}
                        type="button"
                        className={`ds-btn ds-btn-sm ${
                          formData.companies.includes(company)
                            ? 'ds-btn-primary'
                            : 'ds-btn-outline-secondary'
                        }`}
                        onClick={() => handleCompanyToggle(company)}
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Statut</label>
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.status === 'active'}
                      onChange={(e) => handleChange('status', e.target.checked ? 'active' : 'inactive')}
                    />
                    <label className="form-check-label">
                      {formData.status === 'active' ? 'Actif' : 'Inactif'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="ds-btn ds-btn-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="ds-btn ds-btn-primary">
                {user ? 'Mettre a jour' : 'Creer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsersSettings;

// src/frontend/src/portals/superadmin/settings/components/UsersManager.jsx
import React, { useState, useMemo } from 'react';
import {
  Users, Search, RefreshCw, ExternalLink, CheckCircle, XCircle,
  Clock, Mail, Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';

const STATUS_CONFIG = {
  active: { label: 'Actif', bg: 'bg-success-lt', text: 'text-success', Icon: CheckCircle },
  suspended: { label: 'Suspendu', bg: 'bg-danger-lt', text: 'text-danger', Icon: XCircle },
  invited: { label: 'Invite', bg: 'bg-warning-lt', text: 'text-warning', Icon: Clock },
  draft: { label: 'Brouillon', bg: 'bg-secondary-lt', text: 'text-secondary', Icon: Clock },
  archived: { label: 'Archive', bg: 'bg-secondary-lt', text: 'text-secondary', Icon: XCircle }
};

const UsersManager = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users from Directus /users endpoint (NOT /items/users)
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['settings-users'],
    queryFn: async () => {
      const res = await api.get('/users', {
        params: {
          fields: 'id,first_name,last_name,email,role.id,role.name,status,last_access',
          sort: '-last_access',
          limit: 100
        }
      });
      return res.data;
    },
    staleTime: 120000
  });

  const users = usersData?.data || [];

  // Filtered users by search
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      return fullName.includes(term) || email.includes(term);
    });
  }, [users, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const active = users.filter(u => u.status === 'active').length;
    const suspended = users.filter(u => u.status === 'suspended').length;
    const invited = users.filter(u => u.status === 'invited').length;
    return { total: users.length, active, suspended, invited };
  }, [users]);

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    const Icon = config.Icon;
    return (
      <span className={`badge ${config.bg} ${config.text}`}>
        <Icon size={12} className="me-1" />
        {config.label}
      </span>
    );
  };

  const getRoleName = (role) => {
    if (!role) return 'Non defini';
    if (typeof role === 'string') return role;
    return role.name || role.id || 'Non defini';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Jamais';
    try {
      return new Date(dateStr).toLocaleDateString('fr-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Jamais';
    }
  };

  const getInitials = (user) => {
    const first = (user.first_name || '')[0] || '';
    const last = (user.last_name || '')[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1 placeholder-glow">
              <Users size={20} className="me-2" />
              <span className="placeholder col-4"></span>
            </h4>
          </div>
        </div>
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Statut</th>
                    <th>Derniere connexion</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="placeholder-glow">
                      <td><span className="placeholder col-8"></span></td>
                      <td><span className="placeholder col-10"></span></td>
                      <td><span className="placeholder col-6"></span></td>
                      <td><span className="placeholder col-4"></span></td>
                      <td><span className="placeholder col-7"></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-5">
        <XCircle size={48} className="text-danger mb-3 opacity-50" />
        <p className="text-danger">Erreur lors du chargement des utilisateurs</p>
        <p className="text-muted small">{error?.message}</p>
        <button className="btn btn-outline-primary" onClick={() => refetch()}>
          <RefreshCw size={14} className="me-1" />
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <Users size={20} className="me-2" />
            Utilisateurs de la plateforme
          </h4>
          <p className="text-muted mb-0">
            {stats.total} utilisateur{stats.total > 1 ? 's' : ''}
            {' '}&mdash;{' '}
            <span className="text-success">{stats.active} actif{stats.active > 1 ? 's' : ''}</span>
            {stats.suspended > 0 && (
              <>, <span className="text-danger">{stats.suspended} suspendu{stats.suspended > 1 ? 's' : ''}</span></>
            )}
            {stats.invited > 0 && (
              <>, <span className="text-warning">{stats.invited} invite{stats.invited > 1 ? 's' : ''}</span></>
            )}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => refetch()}
          >
            <RefreshCw size={14} />
          </button>
          <a
            href="/admin/users"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary btn-sm"
          >
            <ExternalLink size={14} className="me-1" />
            Gerer dans Directus
          </a>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="input-group" style={{ maxWidth: 400 }}>
          <span className="input-group-text">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSearchTerm('')}
            >
              <XCircle size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <Users size={48} className="mb-3 opacity-50" />
          {searchTerm ? (
            <p>Aucun utilisateur trouve pour "{searchTerm}"</p>
          ) : (
            <p>Aucun utilisateur enregistre</p>
          )}
        </div>
      ) : (
        <div className="card glass-card">
          <div className="table-responsive">
            <table className="table table-hover table-vcenter mb-0">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Statut</th>
                  <th>Derniere connexion</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="avatar bg-primary-lt text-primary rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: 36, height: 36, fontSize: '0.8rem' }}
                        >
                          {getInitials(user)}
                        </div>
                        <div>
                          <div className="fw-medium">
                            {user.first_name || ''} {user.last_name || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center text-muted">
                        <Mail size={14} className="me-1 flex-shrink-0" />
                        <a href={`mailto:${user.email}`} className="text-reset text-truncate" style={{ maxWidth: 220 }}>
                          {user.email}
                        </a>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Shield size={14} className="me-1 text-muted" />
                        <span className="badge bg-light text-dark">
                          {getRoleName(user.role)}
                        </span>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(user.status)}
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(user.last_access)}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length !== users.length && (
            <div className="card-footer text-muted small text-center">
              {filteredUsers.length} sur {users.length} utilisateur{users.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Info box */}
      <div className="alert alert-info mt-4">
        <strong>Note:</strong> La creation et la modification des utilisateurs se fait via l'interface Directus Admin.
        Ce tableau est en lecture seule.
      </div>
    </div>
  );
};

export default UsersManager;

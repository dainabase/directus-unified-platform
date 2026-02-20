// src/frontend/src/portals/superadmin/settings/components/PermissionsManager.jsx
import React, { useState, useMemo } from 'react';
import {
  Shield, Key, Search, RefreshCw, ExternalLink, XCircle,
  ChevronDown, ChevronRight, Lock, Database
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';

const ACTION_LABELS = {
  create: { label: 'Creer', color: 'success' },
  read: { label: 'Lire', color: 'info' },
  update: { label: 'Modifier', color: 'warning' },
  delete: { label: 'Supprimer', color: 'danger' },
  share: { label: 'Partager', color: 'primary' }
};

const PermissionsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupByRole, setGroupByRole] = useState(true);
  const [expandedRoles, setExpandedRoles] = useState([]);

  // Fetch roles
  const {
    data: rolesData,
    isLoading: rolesLoading
  } = useQuery({
    queryKey: ['settings-roles'],
    queryFn: async () => {
      const res = await api.get('/roles', {
        params: {
          fields: 'id,name,description,icon,admin_access,app_access',
          sort: 'name'
        }
      });
      return res.data;
    },
    staleTime: 300000
  });

  // Fetch permissions
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['settings-permissions'],
    queryFn: async () => {
      const res = await api.get('/permissions', {
        params: {
          fields: 'id,role,collection,action,fields,permissions,validation',
          limit: -1,
          sort: 'collection,action'
        }
      });
      return res.data;
    },
    staleTime: 120000
  });

  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];

  const isLoading = rolesLoading || permissionsLoading;

  // Build role lookup
  const roleMap = useMemo(() => {
    const map = {};
    roles.forEach(role => {
      map[role.id] = role;
    });
    return map;
  }, [roles]);

  // Filtered permissions
  const filteredPermissions = useMemo(() => {
    if (!searchTerm.trim()) return permissions;
    const term = searchTerm.toLowerCase();
    return permissions.filter(p => {
      const collection = (p.collection || '').toLowerCase();
      const action = (p.action || '').toLowerCase();
      const roleName = (roleMap[p.role]?.name || '').toLowerCase();
      return collection.includes(term) || action.includes(term) || roleName.includes(term);
    });
  }, [permissions, searchTerm, roleMap]);

  // Group by role
  const groupedByRole = useMemo(() => {
    const groups = {};
    filteredPermissions.forEach(p => {
      const roleId = p.role || '__public__';
      if (!groups[roleId]) {
        groups[roleId] = {
          role: roleMap[roleId] || { id: roleId, name: roleId === '__public__' ? 'Public' : roleId },
          permissions: []
        };
      }
      groups[roleId].permissions.push(p);
    });
    // Sort by role name
    return Object.values(groups).sort((a, b) =>
      (a.role.name || '').localeCompare(b.role.name || '')
    );
  }, [filteredPermissions, roleMap]);

  const toggleRole = (roleId) => {
    setExpandedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  const getActionBadge = (action) => {
    const config = ACTION_LABELS[action] || { label: action, color: 'secondary' };
    return (
      <span className={`badge bg-${config.color}-lt text-${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1 placeholder-glow">
              <Shield size={20} className="me-2" />
              <span className="placeholder col-4"></span>
            </h4>
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div className="card mb-3 placeholder-glow" key={i}>
            <div className="card-header">
              <span className="placeholder col-3"></span>
            </div>
            <div className="card-body">
              <span className="placeholder col-12 mb-2" style={{ height: 20 }}></span>
              <span className="placeholder col-10 mb-2" style={{ height: 20 }}></span>
              <span className="placeholder col-8" style={{ height: 20 }}></span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-5">
        <XCircle size={48} className="text-danger mb-3 opacity-50" />
        <p className="text-danger">Erreur lors du chargement des permissions</p>
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
            <Shield size={20} className="me-2" />
            Permissions Directus
          </h4>
          <p className="text-muted mb-0">
            {permissions.length} regle{permissions.length > 1 ? 's' : ''} de permission
            {' '}&mdash;{' '}
            {roles.length} role{roles.length > 1 ? 's' : ''}
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
            href="/admin/settings/roles"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary btn-sm"
          >
            <ExternalLink size={14} className="me-1" />
            Gerer dans Directus
          </a>
        </div>
      </div>

      {/* Controls */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <div className="input-group" style={{ maxWidth: 350 }}>
          <span className="input-group-text">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher collection, action, role..."
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
        <div className="btn-group">
          <button
            className={`btn btn-sm ${groupByRole ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setGroupByRole(true)}
          >
            <Key size={14} className="me-1" />
            Par role
          </button>
          <button
            className={`btn btn-sm ${!groupByRole ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setGroupByRole(false)}
          >
            <Database size={14} className="me-1" />
            Tableau
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filteredPermissions.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <Shield size={48} className="mb-3 opacity-50" />
          {searchTerm ? (
            <p>Aucune permission trouvee pour "{searchTerm}"</p>
          ) : (
            <p>Aucune permission configuree</p>
          )}
        </div>
      ) : groupByRole ? (
        /* Grouped by Role view */
        <div>
          {groupedByRole.map(group => {
            const role = group.role;
            const isExpanded = expandedRoles.includes(role.id);
            const isAdmin = role.admin_access === true;

            return (
              <div className="card ds-card mb-3" key={role.id}>
                <div
                  className="card-header d-flex align-items-center"
                  onClick={() => toggleRole(role.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center flex-grow-1">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <div className="ms-2">
                      <span className="fw-medium">
                        {isAdmin && <Lock size={14} className="me-1 text-danger" />}
                        {role.name || role.id}
                      </span>
                      {role.description && (
                        <small className="text-muted ms-2">({role.description})</small>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    {isAdmin && (
                      <span className="badge bg-danger-lt text-danger">Admin</span>
                    )}
                    {role.app_access && (
                      <span className="badge bg-info-lt text-info">App</span>
                    )}
                    <span className="badge bg-secondary">
                      {group.permissions.length} regle{group.permissions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="table-responsive">
                    <table className="table table-hover table-vcenter mb-0">
                      <thead>
                        <tr>
                          <th>Collection</th>
                          <th>Action</th>
                          <th>Champs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.permissions.map(p => (
                          <tr key={p.id}>
                            <td>
                              <code className="small">{p.collection}</code>
                            </td>
                            <td>
                              {getActionBadge(p.action)}
                            </td>
                            <td>
                              <small className="text-muted">
                                {p.fields
                                  ? (Array.isArray(p.fields) ? p.fields.join(', ') : p.fields)
                                  : 'Tous'}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat table view */
        <div className="card ds-card">
          <div className="table-responsive">
            <table className="table table-hover table-vcenter mb-0">
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Champs</th>
                </tr>
              </thead>
              <tbody>
                {filteredPermissions.map(p => (
                  <tr key={p.id}>
                    <td>
                      <code className="small">{p.collection}</code>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {roleMap[p.role]?.name || p.role || 'Public'}
                      </span>
                    </td>
                    <td>
                      {getActionBadge(p.action)}
                    </td>
                    <td>
                      <small className="text-muted">
                        {p.fields
                          ? (Array.isArray(p.fields) ? p.fields.join(', ') : p.fields)
                          : 'Tous'}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer text-muted small text-center">
            {filteredPermissions.length} permission{filteredPermissions.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="alert alert-info mt-4">
        <strong>Note:</strong> Les permissions sont gerees dans Directus Admin (Roles &amp; Permissions).
        Ce tableau est en lecture seule et reflete la configuration actuelle.
      </div>
    </div>
  );
};

export default PermissionsManager;

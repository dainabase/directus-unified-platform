// src/frontend/src/portals/superadmin/settings/components/PermissionsSettings.jsx
import React, { useState } from 'react';
import {
  Shield, Key, Users, Check, X, ChevronDown, ChevronRight,
  Save, RefreshCw, AlertCircle, Lock, Unlock
} from 'lucide-react';
import toast from 'react-hot-toast';

// Default permissions matrix
const MODULES = [
  {
    id: 'finance',
    name: 'Finance',
    permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
  },
  {
    id: 'projects',
    name: 'Projets',
    permissions: ['view', 'create', 'edit', 'delete', 'assign', 'close']
  },
  {
    id: 'crm',
    name: 'CRM',
    permissions: ['view', 'create', 'edit', 'delete', 'import', 'export']
  },
  {
    id: 'leads',
    name: 'Leads',
    permissions: ['view', 'create', 'edit', 'delete', 'assign', 'convert']
  },
  {
    id: 'hr',
    name: 'Ressources Humaines',
    permissions: ['view', 'create', 'edit', 'delete', 'approve', 'payroll']
  },
  {
    id: 'marketing',
    name: 'Marketing',
    permissions: ['view', 'create', 'edit', 'delete', 'publish', 'analytics']
  },
  {
    id: 'legal',
    name: 'Juridique',
    permissions: ['view', 'create', 'edit', 'delete', 'sign', 'archive']
  },
  {
    id: 'settings',
    name: 'Parametres',
    permissions: ['view', 'edit', 'users', 'integrations', 'billing']
  }
];

const ROLES = [
  { id: 'admin', name: 'Administrateur', description: 'Acces complet a toutes les fonctionnalites', color: 'danger' },
  { id: 'manager', name: 'Manager', description: 'Gestion des equipes et projets', color: 'warning' },
  { id: 'accountant', name: 'Comptable', description: 'Acces aux modules financiers', color: 'info' },
  { id: 'sales', name: 'Commercial', description: 'CRM et gestion des leads', color: 'success' },
  { id: 'support', name: 'Support', description: 'Tickets et assistance client', color: 'primary' },
  { id: 'viewer', name: 'Lecteur', description: 'Consultation uniquement', color: 'secondary' }
];

// Default permissions by role
const DEFAULT_PERMISSIONS = {
  admin: { all: true },
  manager: {
    finance: ['view', 'create', 'edit', 'export', 'approve'],
    projects: ['view', 'create', 'edit', 'delete', 'assign', 'close'],
    crm: ['view', 'create', 'edit', 'delete'],
    leads: ['view', 'create', 'edit', 'delete', 'assign', 'convert'],
    hr: ['view', 'edit', 'approve'],
    marketing: ['view', 'create', 'edit', 'publish'],
    legal: ['view', 'edit'],
    settings: ['view']
  },
  accountant: {
    finance: ['view', 'create', 'edit', 'export', 'approve'],
    projects: ['view'],
    crm: ['view'],
    settings: ['view']
  },
  sales: {
    crm: ['view', 'create', 'edit', 'delete', 'import', 'export'],
    leads: ['view', 'create', 'edit', 'assign', 'convert'],
    projects: ['view'],
    marketing: ['view', 'analytics']
  },
  support: {
    crm: ['view', 'edit'],
    projects: ['view'],
    leads: ['view']
  },
  viewer: {
    finance: ['view'],
    projects: ['view'],
    crm: ['view'],
    leads: ['view']
  }
};

const PermissionsSettings = () => {
  const [selectedRole, setSelectedRole] = useState('manager');
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [expandedModules, setExpandedModules] = useState(['finance', 'projects']);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const hasPermission = (roleId, moduleId, permission) => {
    if (permissions[roleId]?.all) return true;
    return permissions[roleId]?.[moduleId]?.includes(permission) || false;
  };

  const togglePermission = (roleId, moduleId, permission) => {
    if (roleId === 'admin') {
      toast.error('Les permissions Admin ne peuvent pas etre modifiees');
      return;
    }

    setPermissions(prev => {
      const rolePerms = { ...prev[roleId] };
      const modulePerms = rolePerms[moduleId] ? [...rolePerms[moduleId]] : [];

      if (modulePerms.includes(permission)) {
        rolePerms[moduleId] = modulePerms.filter(p => p !== permission);
      } else {
        rolePerms[moduleId] = [...modulePerms, permission];
      }

      return { ...prev, [roleId]: rolePerms };
    });
    setHasChanges(true);
  };

  const toggleAllPermissions = (roleId, moduleId, enable) => {
    if (roleId === 'admin') {
      toast.error('Les permissions Admin ne peuvent pas etre modifiees');
      return;
    }

    const module = MODULES.find(m => m.id === moduleId);
    if (!module) return;

    setPermissions(prev => {
      const rolePerms = { ...prev[roleId] };
      rolePerms[moduleId] = enable ? [...module.permissions] : [];
      return { ...prev, [roleId]: rolePerms };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Save to backend
    toast.success('Permissions enregistrees');
    setHasChanges(false);
  };

  const handleReset = () => {
    setPermissions(DEFAULT_PERMISSIONS);
    setHasChanges(false);
    toast.success('Permissions reinitialises');
  };

  const role = ROLES.find(r => r.id === selectedRole);

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <Shield size={20} className="me-2" />
            Gestion des Permissions
          </h4>
          <p className="text-muted mb-0">
            Configurez les acces par role et module
          </p>
        </div>
        <div className="d-flex gap-2">
          {hasChanges && (
            <span className="badge bg-warning-lt text-warning me-2">
              <AlertCircle size={14} className="me-1" />
              Modifications non sauvegardees
            </span>
          )}
          <button className="btn btn-outline-secondary" onClick={handleReset}>
            <RefreshCw size={16} className="me-1" />
            Reinitialiser
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save size={16} className="me-1" />
            Enregistrer
          </button>
        </div>
      </div>

      {/* Role Selector */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <Key size={18} className="me-2" />
            Selectionner un role
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {ROLES.map(r => (
              <div className="col-md-4" key={r.id}>
                <div
                  className={`card cursor-pointer ${selectedRole === r.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedRole(r.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className={`avatar bg-${r.color}-lt text-${r.color} me-3`}>
                        {r.id === 'admin' ? <Lock size={20} /> : <Users size={20} />}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-0">{r.name}</h6>
                        <small className="text-muted">{r.description}</small>
                      </div>
                      {selectedRole === r.id && (
                        <Check size={20} className="text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            Permissions pour <span className={`badge bg-${role?.color}`}>{role?.name}</span>
          </h5>
        </div>
        <div className="card-body p-0">
          {MODULES.map(module => {
            const isExpanded = expandedModules.includes(module.id);
            const modulePerms = permissions[selectedRole]?.[module.id] || [];
            const allGranted = permissions[selectedRole]?.all ||
              module.permissions.every(p => modulePerms.includes(p));
            const noneGranted = !permissions[selectedRole]?.all &&
              !module.permissions.some(p => modulePerms.includes(p));

            return (
              <div key={module.id} className="border-bottom">
                <div
                  className="d-flex align-items-center p-3 bg-light cursor-pointer"
                  onClick={() => toggleModule(module.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="fw-medium ms-2">{module.name}</span>
                  <div className="ms-auto d-flex gap-2">
                    <span className={`badge ${allGranted ? 'bg-success' : noneGranted ? 'bg-danger' : 'bg-warning'}`}>
                      {allGranted ? 'Acces complet' : noneGranted ? 'Aucun acces' : 'Acces partiel'}
                    </span>
                    {selectedRole !== 'admin' && (
                      <>
                        <button
                          className="btn btn-sm btn-ghost-success"
                          onClick={(e) => { e.stopPropagation(); toggleAllPermissions(selectedRole, module.id, true); }}
                          title="Tout activer"
                        >
                          <Unlock size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost-danger"
                          onClick={(e) => { e.stopPropagation(); toggleAllPermissions(selectedRole, module.id, false); }}
                          title="Tout desactiver"
                        >
                          <Lock size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3">
                    <div className="row g-2">
                      {module.permissions.map(perm => {
                        const granted = hasPermission(selectedRole, module.id, perm);
                        return (
                          <div className="col-md-4 col-lg-2" key={perm}>
                            <button
                              className={`btn w-100 ${granted ? 'btn-success' : 'btn-outline-secondary'}`}
                              onClick={() => togglePermission(selectedRole, module.id, perm)}
                              disabled={selectedRole === 'admin'}
                            >
                              {granted ? <Check size={14} className="me-1" /> : <X size={14} className="me-1" />}
                              {perm}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4">
        <h6 className="text-muted">Legende des permissions</h6>
        <div className="row g-2 small text-muted">
          <div className="col-md-2"><strong>view:</strong> Consulter</div>
          <div className="col-md-2"><strong>create:</strong> Creer</div>
          <div className="col-md-2"><strong>edit:</strong> Modifier</div>
          <div className="col-md-2"><strong>delete:</strong> Supprimer</div>
          <div className="col-md-2"><strong>export:</strong> Exporter</div>
          <div className="col-md-2"><strong>approve:</strong> Approuver</div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsSettings;

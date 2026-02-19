// src/frontend/src/portals/superadmin/settings/components/CompaniesSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Building2, Save, Edit2, X, Check, Palette, Hash, Info, RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  active: { bg: 'bg-success-lt', text: 'text-success', label: 'Actif' },
  inactive: { bg: 'bg-secondary-lt', text: 'text-secondary', label: 'Inactif' },
  draft: { bg: 'bg-warning-lt', text: 'text-warning', label: 'Brouillon' },
  archived: { bg: 'bg-danger-lt', text: 'text-danger', label: 'Archive' }
};

const TYPE_LABELS = {
  holding: 'Holding',
  digital: 'Digital / LED',
  tech: 'Technologie',
  vr: 'Realite virtuelle',
  legal: 'Services juridiques',
  agency: 'Agence',
  sarl: 'SARL',
  sa: 'SA'
};

const CompaniesSettings = ({ companyId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  // Fetch all owner_companies
  const {
    data: companiesData,
    isLoading: companiesLoading,
    refetch: refetchCompanies
  } = useQuery({
    queryKey: ['owner-companies-list'],
    queryFn: async () => {
      const res = await api.get('/items/owner_companies', {
        params: {
          fields: 'id,code,name,type,color,status,description,sort',
          sort: 'sort,name'
        }
      });
      return res.data;
    },
    staleTime: 300000
  });

  // Fetch selected company details
  const {
    data: companyData,
    isLoading: companyLoading
  } = useQuery({
    queryKey: ['owner-company-detail', companyId],
    queryFn: async () => {
      const res = await api.get(`/items/owner_companies/${companyId}`, {
        params: { fields: 'id,code,name,type,color,status,description,sort' }
      });
      return res.data;
    },
    enabled: !!companyId
  });

  const companies = companiesData?.data || [];
  const selectedCompany = companyData?.data || null;

  // Sync form data when company loads
  useEffect(() => {
    if (selectedCompany) {
      setFormData({
        name: selectedCompany.name || '',
        code: selectedCompany.code || '',
        type: selectedCompany.type || '',
        color: selectedCompany.color || '#2563eb',
        status: selectedCompany.status || 'active',
        description: selectedCompany.description || ''
      });
    }
  }, [selectedCompany]);

  // Reset editing when company changes
  useEffect(() => {
    setIsEditing(false);
  }, [companyId]);

  // Save mutation
  const updateCompany = useMutation({
    mutationFn: async (data) => {
      const res = await api.patch(`/items/owner_companies/${companyId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-companies-list'] });
      queryClient.invalidateQueries({ queryKey: ['owner-company-detail', companyId] });
      queryClient.invalidateQueries({ queryKey: ['our-companies'] });
      queryClient.invalidateQueries({ queryKey: ['our-company', companyId] });
      toast.success('Entreprise mise a jour');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateCompany.mutate(formData);
  };

  const handleCancel = () => {
    if (selectedCompany) {
      setFormData({
        name: selectedCompany.name || '',
        code: selectedCompany.code || '',
        type: selectedCompany.type || '',
        color: selectedCompany.color || '#2563eb',
        status: selectedCompany.status || 'active',
        description: selectedCompany.description || ''
      });
    }
    setIsEditing(false);
  };

  const isLoading = companiesLoading || companyLoading;

  // Skeleton loader
  if (isLoading) {
    return (
      <div>
        <div className="row g-3 mb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div className="col-md-4 col-lg" key={i}>
              <div className="card placeholder-glow">
                <div className="card-body p-3">
                  <span className="placeholder col-8 mb-2" style={{ height: 16 }}></span>
                  <span className="placeholder col-5" style={{ height: 12 }}></span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="card placeholder-glow">
          <div className="card-body">
            <span className="placeholder col-4 mb-3" style={{ height: 20 }}></span>
            <span className="placeholder col-12 mb-2" style={{ height: 40 }}></span>
            <span className="placeholder col-12 mb-2" style={{ height: 40 }}></span>
            <span className="placeholder col-12" style={{ height: 80 }}></span>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_COLORS[selectedCompany?.status] || STATUS_COLORS.active;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <Building2 size={20} className="me-2" />
            Entreprises du groupe
          </h4>
          <p className="text-muted mb-0">
            {companies.length} entreprise{companies.length > 1 ? 's' : ''} enregistree{companies.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => refetchCompanies()}
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      {/* Company Cards - All 5 */}
      <div className="row g-3 mb-4">
        {companies.map(company => {
          const isSelected = company.id === companyId;
          const companyStatus = STATUS_COLORS[company.status] || STATUS_COLORS.active;
          return (
            <div className="col-md-4 col-lg" key={company.id}>
              <div
                className={`card glass-card ${isSelected ? 'border-primary' : ''}`}
                style={{
                  borderLeft: `4px solid ${company.color || '#6c757d'}`,
                  opacity: isSelected ? 1 : 0.75,
                  cursor: 'default'
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <h6 className="mb-0" style={{ fontSize: '0.85rem' }}>
                      {company.name}
                    </h6>
                    {isSelected && (
                      <Check size={14} className="text-primary" />
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-light text-dark" style={{ fontSize: '0.7rem' }}>
                      {company.code}
                    </span>
                    <span className={`badge ${companyStatus.bg} ${companyStatus.text}`} style={{ fontSize: '0.7rem' }}>
                      {companyStatus.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Company Details */}
      {selectedCompany ? (
        <div className="card glass-card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <span
                className="d-inline-block rounded-circle me-2"
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: selectedCompany.color || '#6c757d'
                }}
              ></span>
              {selectedCompany.name}
            </h5>
            <div className="d-flex gap-2">
              {isEditing ? (
                <>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleCancel}
                    disabled={updateCompany.isPending}
                  >
                    <X size={14} className="me-1" />
                    Annuler
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleSave}
                    disabled={updateCompany.isPending}
                  >
                    <Save size={14} className="me-1" />
                    {updateCompany.isPending ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={14} className="me-1" />
                  Modifier
                </button>
              )}
            </div>
          </div>

          <div className="card-body">
            {/* Read-only / Edit mode */}
            <div className="row g-4">
              {/* Name */}
              <div className="col-md-6">
                <label className="form-label text-muted small">
                  <Building2 size={14} className="me-1" />
                  Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                ) : (
                  <div className="fw-medium">{selectedCompany.name || '-'}</div>
                )}
              </div>

              {/* Code */}
              <div className="col-md-3">
                <label className="form-label text-muted small">
                  <Hash size={14} className="me-1" />
                  Code
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                ) : (
                  <div>
                    <span className="badge bg-primary">{selectedCompany.code || '-'}</span>
                  </div>
                )}
              </div>

              {/* Type */}
              <div className="col-md-3">
                <label className="form-label text-muted small">Type</label>
                {isEditing ? (
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                  >
                    <option value="">-- Selectionner --</option>
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="fw-medium">
                    {TYPE_LABELS[selectedCompany.type] || selectedCompany.type || '-'}
                  </div>
                )}
              </div>

              {/* Color */}
              <div className="col-md-3">
                <label className="form-label text-muted small">
                  <Palette size={14} className="me-1" />
                  Couleur
                </label>
                {isEditing ? (
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={formData.color || '#2563eb'}
                      onChange={(e) => handleChange('color', e.target.value)}
                      style={{ width: 48, height: 38 }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={formData.color || ''}
                      onChange={(e) => handleChange('color', e.target.value)}
                      placeholder="#2563eb"
                      maxLength={7}
                    />
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="d-inline-block rounded"
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: selectedCompany.color || '#6c757d',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    ></span>
                    <code className="small">{selectedCompany.color || '-'}</code>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="col-md-3">
                <label className="form-label text-muted small">Statut</label>
                {isEditing ? (
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    {Object.entries(STATUS_COLORS).map(([key, info]) => (
                      <option key={key} value={key}>{info.label}</option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <span className={`badge ${statusInfo.bg} ${statusInfo.text}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="col-12">
                <label className="form-label text-muted small">
                  <Info size={14} className="me-1" />
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Description de l'entreprise..."
                  />
                ) : (
                  <div className="text-muted">
                    {selectedCompany.description || 'Aucune description'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 text-muted">
          <Building2 size={48} className="mb-3 opacity-50" />
          <p>Selectionnez une entreprise pour voir ses details</p>
        </div>
      )}
    </div>
  );
};

export default CompaniesSettings;

// src/frontend/src/portals/superadmin/legal/components/CGVManager.jsx
import React, { useState } from 'react';
import { 
  FileText, Plus, Edit, Eye, Archive, CheckCircle, 
  Clock, AlertTriangle, Copy, Download, Trash2 
} from 'lucide-react';
import { useSaveCGV, useActivateCGV, useCGV } from '../hooks/useLegalData';
import CGVEditor from './CGVEditor';
import CGVPreview from './CGVPreview';
import toast from 'react-hot-toast';

const CGVManager = ({ company, cgvTypes, cgvList, onRefresh }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedCGV, setSelectedCGV] = useState(null);
  
  const saveCGV = useSaveCGV();
  const activateCGV = useActivateCGV();
  
  const handleCreate = (type) => {
    setSelectedType(type);
    setSelectedCGV(null);
    setEditMode(true);
  };
  
  const handleEdit = (cgv) => {
    setSelectedCGV(cgv);
    setSelectedType(cgv.type);
    setEditMode(true);
  };
  
  const handlePreview = (cgv) => {
    setSelectedCGV(cgv);
    setPreviewMode(true);
  };
  
  const handleSave = async (data) => {
    await saveCGV.mutateAsync({
      company,
      type: selectedType,
      data
    });
    setEditMode(false);
    onRefresh();
  };
  
  const handleActivate = async (cgvId) => {
    await activateCGV.mutateAsync(cgvId);
    onRefresh();
  };
  
  const handleDuplicate = (cgv) => {
    setSelectedCGV({ ...cgv, id: null, version: cgv.version + 1 });
    setSelectedType(cgv.type);
    setEditMode(true);
    toast.success('CGV dupliquée - modifiez et sauvegardez');
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'bg-success', label: 'Active' },
      draft: { class: 'bg-warning', label: 'Brouillon' },
      archived: { class: 'bg-secondary', label: 'Archivée' }
    };
    const badge = badges[status] || badges.draft;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  // Modal Éditeur
  if (editMode) {
    return (
      <CGVEditor 
        company={company}
        type={selectedType}
        cgv={selectedCGV}
        onSave={handleSave}
        onCancel={() => setEditMode(false)}
        isLoading={saveCGV.isPending}
      />
    );
  }
  
  // Modal Prévisualisation
  if (previewMode) {
    return (
      <CGVPreview 
        cgv={selectedCGV}
        onClose={() => setPreviewMode(false)}
      />
    );
  }

  return (
    <div>
      {/* Boutons création par type */}
      <div className="row mb-4">
        {cgvTypes.map(type => (
          <div className="col-md-4" key={type.id}>
            <div className="card card-sm">
              <div className="card-body d-flex align-items-center">
                <type.icon size={24} className="me-3 text-primary" />
                <div className="flex-fill">
                  <div className="font-weight-medium">{type.label}</div>
                  <div className="text-muted small">
                    {cgvList?.filter(c => c.type === type.id && c.status === 'active').length || 0} active(s)
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleCreate(type.id)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Liste des CGV existantes */}
      <div className="table-responsive">
        <table className="table table-vcenter card-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Version</th>
              <th>Titre</th>
              <th>Statut</th>
              <th>Dernière modification</th>
              <th>Acceptations</th>
              <th className="w-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cgvList?.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  Aucune CGV créée. Cliquez sur + pour commencer.
                </td>
              </tr>
            )}
            {cgvList?.map(cgv => (
              <tr key={cgv.id}>
                <td>
                  <span className="badge bg-blue-lt">
                    {cgvTypes.find(t => t.id === cgv.type)?.label || cgv.type}
                  </span>
                </td>
                <td>v{cgv.version}</td>
                <td>{cgv.title}</td>
                <td>{getStatusBadge(cgv.status)}</td>
                <td>
                  <Clock size={14} className="me-1" />
                  {new Date(cgv.updated_at).toLocaleDateString('fr-CH')}
                </td>
                <td>
                  <span className="badge bg-green-lt">
                    {cgv.acceptance_count || 0}
                  </span>
                </td>
                <td>
                  <div className="btn-list flex-nowrap">
                    <button 
                      className="btn btn-sm btn-ghost-primary"
                      onClick={() => handlePreview(cgv)}
                      title="Prévisualiser"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="btn btn-sm btn-ghost-primary"
                      onClick={() => handleEdit(cgv)}
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn btn-sm btn-ghost-primary"
                      onClick={() => handleDuplicate(cgv)}
                      title="Dupliquer"
                    >
                      <Copy size={16} />
                    </button>
                    {cgv.status !== 'active' && (
                      <button 
                        className="btn btn-sm btn-ghost-success"
                        onClick={() => handleActivate(cgv.id)}
                        title="Activer"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CGVManager;
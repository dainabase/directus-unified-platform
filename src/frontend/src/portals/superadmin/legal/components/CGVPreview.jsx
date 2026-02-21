// src/frontend/src/portals/superadmin/legal/components/CGVPreview.jsx
import React, { useState } from 'react';
import { 
  X, Eye, Download, Share2, CheckCircle, 
  AlertTriangle, Clock, FileText 
} from 'lucide-react';
import { legalApi } from '../services/legalApi';
import toast from 'react-hot-toast';

const CGVPreview = ({ cgv, onClose, variables = {} }) => {
  const [renderedContent, setRenderedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  
  // Variables par défaut pour preview
  const defaultVariables = {
    company_name: cgv?.company || 'HYPERVISUAL',
    company_address: '1234 Avenue Example, 1000 Genève, Suisse',
    company_ide: 'CHE-123.456.789',
    current_date: new Date().toLocaleDateString('fr-CH'),
    vat_rate: '8.1%',
    ...variables
  };
  
  React.useEffect(() => {
    if (cgv) {
      renderContent();
    }
  }, [cgv]);
  
  const renderContent = async () => {
    if (!cgv.content) {
      setRenderedContent(cgv.content || '');
      return;
    }
    
    setIsLoading(true);
    try {
      // Remplacer les variables dans le contenu
      let content = cgv.content;
      Object.entries(defaultVariables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
      });
      setRenderedContent(content);
    } catch (error) {
      console.error('Erreur rendu CGV:', error);
      setRenderedContent(cgv.content);
      toast.error('Erreur lors du rendu des variables');
    }
    setIsLoading(false);
  };
  
  const handleDownloadPDF = async () => {
    try {
      toast.loading('Génération PDF...');
      const response = await legalApi.previewCGV(cgv.id, defaultVariables);
      // Simulation téléchargement PDF
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cgv.title}_v${cgv.version}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF téléchargé');
    } catch (error) {
      toast.error('Erreur génération PDF');
    }
  };
  
  const getTypeLabel = () => {
    const labels = {
      cgv_vente: 'Conditions Générales de Vente',
      cgl_location: 'Conditions Générales de Location', 
      cgv_service: 'Conditions Générales de Service'
    };
    return labels[cgv?.type] || cgv?.type;
  };
  
  const getStatusIcon = () => {
    if (cgv?.status === 'active') return <CheckCircle size={16} className="text-success" />;
    if (cgv?.status === 'draft') return <Clock size={16} className="text-warning" />;
    return <AlertTriangle size={16} className="text-secondary" />;
  };

  return (
    <div className="row">
      {/* Content principal */}
      <div className="col-lg-9">
        <div className="ds-card">
          {/* Header */}
          <div className="ds-card-header">
            <div className="row align-items-center">
              <div className="col">
                <div className="d-flex align-items-center">
                  <FileText size={20} className="me-2 text-primary" />
                  <div>
                    <h3 className="ds-card-title mb-1">{cgv?.title}</h3>
                    <div className="text-muted small">
                      {getStatusIcon()} Version {cgv?.version} - {getTypeLabel()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <div className="btn-list">
                  <button 
                    className="ds-btn ds-btn-outline-secondary ds-btn-sm"
                    onClick={() => setShowVariables(!showVariables)}
                  >
                    <Eye size={16} className="me-1" />
                    Variables
                  </button>
                  <button 
                    className="ds-btn ds-btn-outline-primary ds-btn-sm"
                    onClick={handleDownloadPDF}
                  >
                    <Download size={16} className="me-1" />
                    PDF
                  </button>
                  <button 
                    className="ds-btn ds-btn-outline-secondary ds-btn-sm"
                    onClick={onClose}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Métadonnées */}
          <div className="ds-card-body border-bottom">
            <div className="row text-muted small">
              <div className="col-md-3">
                <strong>Entreprise:</strong><br />
                {cgv?.company}
              </div>
              <div className="col-md-3">
                <strong>Date d'effet:</strong><br />
                {new Date(cgv?.effective_date).toLocaleDateString('fr-CH')}
              </div>
              <div className="col-md-3">
                <strong>Dernière modification:</strong><br />
                {new Date(cgv?.updated_at).toLocaleDateString('fr-CH')}
              </div>
              <div className="col-md-3">
                <strong>Acceptations:</strong><br />
                {cgv?.acceptance_count || 0} client(s)
              </div>
            </div>
          </div>
          
          {/* Contenu principal */}
          <div className="ds-card-body">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <div className="mt-3 text-muted">Rendu du contenu...</div>
              </div>
            ) : (
              <div className="rendered-content">
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'Georgia, serif',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#2c3e50'
                }}>
                  {renderedContent}
                </pre>
              </div>
            )}
          </div>
          
          {/* Footer avec notes */}
          {cgv?.notes && (
            <div className="ds-card-footer bg-light">
              <div className="text-muted small">
                <strong>Notes internes:</strong> {cgv.notes}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Sidebar - Variables et informations */}
      <div className="col-lg-3">
        {/* Variables disponibles */}
        {showVariables && (
          <div className="ds-card mb-3">
            <div className="ds-card-header">
              <h4 className="ds-card-title">Variables utilisées</h4>
            </div>
            <div className="ds-card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(defaultVariables).map(([key, value]) => (
                      <tr key={key}>
                        <td>
                          <code>{`{{${key}}}`}</code>
                        </td>
                        <td className="text-muted small">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Clauses vérifiées */}
        <div className="ds-card">
          <div className="ds-card-header">
            <h4 className="ds-card-title text-success">Clauses vérifiées</h4>
          </div>
          <div className="ds-card-body">
            {cgv?.clauses_checked?.length > 0 ? (
              <div>
                {cgv.clauses_checked.map(clause => (
                  <div key={clause} className="d-flex align-items-center mb-2">
                    <CheckCircle size={14} className="text-success me-2" />
                    <span className="small">{clause}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted small">Aucune clause vérifiée</div>
            )}
          </div>
        </div>
        
        {/* Actions rapides */}
        <div className="ds-card mt-3">
          <div className="ds-card-header">
            <h4 className="ds-card-title">Actions</h4>
          </div>
          <div className="ds-card-body">
            <div className="d-grid gap-2">
              <button className="ds-btn ds-btn-sm ds-btn-outline-primary">
                <Share2 size={14} className="me-1" />
                Partager lien
              </button>
              <button 
                className="ds-btn ds-btn-sm ds-btn-outline-secondary"
                onClick={handleDownloadPDF}
              >
                <Download size={14} className="me-1" />
                Télécharger PDF
              </button>
              <button className="ds-btn ds-btn-sm ds-btn-outline-success">
                <CheckCircle size={14} className="me-1" />
                Générer acceptation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGVPreview;
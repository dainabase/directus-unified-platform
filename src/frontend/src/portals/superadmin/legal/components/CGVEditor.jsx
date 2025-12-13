// src/frontend/src/portals/superadmin/legal/components/CGVEditor.jsx
import React, { useState, useEffect } from 'react';
import { Save, X, Eye, AlertTriangle, Info } from 'lucide-react';

const MANDATORY_CLAUSES = {
  cgv_vente: [
    { id: 'identification_vendeur', label: 'Identification vendeur (raison sociale, adresse, IDE)' },
    { id: 'prix_paiement', label: 'Prix et conditions de paiement (TVA 8.1%, délais, intérêts)' },
    { id: 'garantie_legale', label: 'Garantie légale (2 ans minimum B2C - art. 210 CO)' },
    { id: 'livraison', label: 'Conditions de livraison' },
    { id: 'droit_applicable', label: 'Droit applicable et for juridique' }
  ],
  cgl_location: [
    { id: 'identification_bailleur', label: 'Identification bailleur' },
    { id: 'objet_loue', label: 'Description objet loué' },
    { id: 'loyer_charges', label: 'Loyer et charges' },
    { id: 'depot_garantie', label: 'Dépôt de garantie (max 3 mois - art. 257e CO)' },
    { id: 'duree_resiliation', label: 'Durée et résiliation (formulaires cantonaux)' },
    { id: 'etat_lieux', label: 'État des lieux' }
  ],
  cgv_service: [
    { id: 'identification_prestataire', label: 'Identification prestataire' },
    { id: 'description_services', label: 'Description des services' },
    { id: 'prix_facturation', label: 'Prix et facturation' },
    { id: 'delais_execution', label: 'Délais d\'exécution' },
    { id: 'responsabilite', label: 'Limitation de responsabilité' }
  ]
};

const FORBIDDEN_CLAUSES = [
  'Exclusion responsabilité pour faute grave ou dol (art. 100 CO)',
  'Modification unilatérale sans préavis adéquat',
  'Pénalités disproportionnées (>20% valeur contrat)',
  'Renonciation aux droits légaux du consommateur',
  'Clauses surprenantes non signalées (règle de l\'insolite)'
];

const CGVEditor = ({ company, type, cgv, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    version: 1,
    content: '',
    clauses_checked: [],
    effective_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  useEffect(() => {
    if (cgv) {
      setFormData({
        title: cgv.title || '',
        version: cgv.version || 1,
        content: cgv.content || '',
        clauses_checked: cgv.clauses_checked || [],
        effective_date: cgv.effective_date || new Date().toISOString().split('T')[0],
        notes: cgv.notes || ''
      });
    }
  }, [cgv]);
  
  const mandatoryClauses = MANDATORY_CLAUSES[type] || [];
  
  const handleClauseToggle = (clauseId) => {
    setFormData(prev => ({
      ...prev,
      clauses_checked: prev.clauses_checked.includes(clauseId)
        ? prev.clauses_checked.filter(c => c !== clauseId)
        : [...prev.clauses_checked, clauseId]
    }));
  };
  
  const validateForm = () => {
    const errors = [];
    
    // Vérifier clauses obligatoires
    const missingClauses = mandatoryClauses.filter(
      clause => !formData.clauses_checked.includes(clause.id)
    );
    if (missingClauses.length > 0) {
      errors.push(`Clauses obligatoires manquantes: ${missingClauses.map(c => c.label).join(', ')}`);
    }
    
    // Vérifier contenu minimum
    if (formData.content.length < 500) {
      errors.push('Le contenu doit faire au moins 500 caractères');
    }
    
    // Vérifier titre
    if (!formData.title.trim()) {
      errors.push('Le titre est obligatoire');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        type,
        company
      });
    }
  };
  
  const getTypeLabel = () => {
    const labels = {
      cgv_vente: 'Conditions Générales de Vente',
      cgl_location: 'Conditions Générales de Location',
      cgv_service: 'Conditions Générales de Service'
    };
    return labels[type] || type;
  };

  return (
    <div className="row">
      <div className="col-lg-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>{cgv ? 'Modifier' : 'Créer'} {getTypeLabel()}</h3>
            <div className="btn-list">
              <button 
                type="button" 
                className="btn btn-ghost-secondary"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye size={16} className="me-1" />
                {showPreview ? 'Masquer' : 'Prévisualiser'}
              </button>
              <button 
                type="button" 
                className="btn btn-ghost-secondary"
                onClick={onCancel}
              >
                <X size={16} className="me-1" />
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                <Save size={16} className="me-1" />
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
          
          {/* Erreurs de validation */}
          {validationErrors.length > 0 && (
            <div className="alert alert-danger mb-4">
              <AlertTriangle size={16} className="me-2" />
              <strong>Erreurs de validation:</strong>
              <ul className="mb-0 mt-2">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Formulaire */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <div className="mb-3">
                    <label className="form-label required">Titre du document</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Conditions Générales de Vente - HYPERVISUAL"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="mb-3">
                    <label className="form-label">Version</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={formData.version}
                      onChange={(e) => setFormData({...formData, version: parseInt(e.target.value)})}
                      min="1"
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="mb-3">
                    <label className="form-label">Date d'effet</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label required">Contenu des conditions</label>
                <textarea 
                  className="form-control"
                  rows="15"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Rédigez ici le contenu complet de vos conditions générales...&#10;&#10;Vous pouvez utiliser des variables :&#10;{{company_name}} - Nom de l'entreprise&#10;{{company_address}} - Adresse&#10;{{company_ide}} - Numéro IDE&#10;{{current_date}} - Date du jour&#10;{{vat_rate}} - Taux TVA (8.1%)"
                  required
                />
                <small className="text-muted">
                  {formData.content.length} caractères (minimum 500)
                </small>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Notes internes</label>
                <textarea 
                  className="form-control"
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Notes internes (non visibles par les clients)"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
      
      {/* Sidebar - Checklist clauses */}
      <div className="col-lg-4">
        {/* Clauses obligatoires */}
        <div className="card mb-4">
          <div className="card-header">
            <h4 className="card-title text-success">
              ✓ Clauses obligatoires
            </h4>
          </div>
          <div className="card-body">
            {mandatoryClauses.map(clause => (
              <label className="form-check mb-2" key={clause.id}>
                <input 
                  type="checkbox"
                  className="form-check-input"
                  checked={formData.clauses_checked.includes(clause.id)}
                  onChange={() => handleClauseToggle(clause.id)}
                />
                <span className="form-check-label">{clause.label}</span>
              </label>
            ))}
            <div className="mt-3 text-muted small">
              <Info size={14} className="me-1" />
              Toutes ces clauses doivent être cochées pour conformité légale suisse.
            </div>
          </div>
        </div>
        
        {/* Clauses interdites */}
        <div className="card border-danger">
          <div className="card-header bg-danger-lt">
            <h4 className="card-title text-danger">
              ✗ Clauses interdites (LCD art. 8)
            </h4>
          </div>
          <div className="card-body">
            <ul className="list-unstyled mb-0">
              {FORBIDDEN_CLAUSES.map((clause, i) => (
                <li key={i} className="mb-2 text-danger small">
                  <X size={14} className="me-1" />
                  {clause}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGVEditor;
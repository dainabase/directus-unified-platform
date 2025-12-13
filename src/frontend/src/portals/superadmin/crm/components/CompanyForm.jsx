// src/frontend/src/portals/superadmin/crm/components/CompanyForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Building2, Globe, Phone, MapPin, 
  Save, Loader2, Users, DollarSign
} from 'lucide-react';
import { useSaveCompany } from '../hooks/useCRMData';

const CompanyForm = ({ company, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Suisse',
    vat_number: '',
    annual_revenue: '',
    description: '',
    status: 'active',
    tags: []
  });
  
  const [errors, setErrors] = useState({});
  
  const saveCompany = useSaveCompany();
  
  // Initialiser le formulaire si modification
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        size: company.size || '',
        website: company.website || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        postal_code: company.postal_code || '',
        country: company.country || 'Suisse',
        vat_number: company.vat_number || '',
        annual_revenue: company.annual_revenue || '',
        description: company.description || '',
        status: company.status || 'active',
        tags: company.tags || []
      });
    }
  }, [company]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'entreprise est requis';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Le site web doit commencer par http:// ou https://';
    }
    
    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Le numéro de téléphone n\'est pas valide';
    }
    
    if (formData.postal_code && !/^\d{4}$/.test(formData.postal_code)) {
      newErrors.postal_code = 'Le NPA doit contenir 4 chiffres';
    }
    
    if (formData.vat_number && !/^CHE-\d{3}\.\d{3}\.\d{3}$/.test(formData.vat_number)) {
      newErrors.vat_number = 'Le numéro TVA doit être au format CHE-123.456.789';
    }
    
    if (formData.annual_revenue && isNaN(parseFloat(formData.annual_revenue))) {
      newErrors.annual_revenue = 'Le chiffre d\'affaires doit être un nombre';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const dataToSave = {
        ...formData,
        annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
        tags: formData.tags.length ? formData.tags : null
      };
      
      await saveCompany.mutateAsync({
        id: company?.id,
        data: dataToSave
      });
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde entreprise:', error);
    }
  };
  
  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };
  
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  const industries = [
    'Technologie',
    'Finance et banque',
    'Immobilier',
    'Santé',
    'Éducation',
    'Retail et commerce',
    'Manufacturing',
    'Consulting',
    'Services professionnels',
    'Construction',
    'Transport et logistique',
    'Énergie',
    'Télécommunications',
    'Médias et divertissement',
    'Tourisme et hôtellerie',
    'Agriculture',
    'Automobile',
    'Pharmaceutique',
    'Chimie',
    'Autre'
  ];
  
  const companySizes = [
    { value: '1-10', label: '1-10 employés (TPE)' },
    { value: '11-50', label: '11-50 employés (PE)' },
    { value: '51-250', label: '51-250 employés (ME)' },
    { value: '251-1000', label: '251-1000 employés (GE)' },
    { value: '1000+', label: '1000+ employés (TGE)' }
  ];
  
  const statuses = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'inactive', label: 'Inactive', color: 'secondary' },
    { value: 'prospect', label: 'Prospect', color: 'warning' },
    { value: 'customer', label: 'Client', color: 'primary' },
    { value: 'partner', label: 'Partenaire', color: 'info' }
  ];

  return (
    <div className="modal modal-blur fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <Building2 size={20} className="me-2" />
              {company ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
            </h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
              disabled={saveCompany.isPending}
            />
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                {/* Informations générales */}
                <div className="col-lg-6">
                  <fieldset className="form-fieldset">
                    <legend>Informations générales</legend>
                    
                    <div className="mb-3">
                      <label className="form-label required">Nom de l'entreprise</label>
                      <div className="input-icon">
                        <span className="input-icon-addon">
                          <Building2 size={16} />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          disabled={saveCompany.isPending}
                          placeholder="ACME SA"
                        />
                      </div>
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
                    </div>
                    
                    <div className="row">
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Secteur d'activité</label>
                          <select
                            className="form-select"
                            value={formData.industry}
                            onChange={(e) => setFormData({...formData, industry: e.target.value})}
                            disabled={saveCompany.isPending}
                          >
                            <option value="">Sélectionner...</option>
                            {industries.map(industry => (
                              <option key={industry} value={industry}>
                                {industry}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Taille</label>
                          <select
                            className="form-select"
                            value={formData.size}
                            onChange={(e) => setFormData({...formData, size: e.target.value})}
                            disabled={saveCompany.isPending}
                          >
                            <option value="">Sélectionner...</option>
                            {companySizes.map(size => (
                              <option key={size.value} value={size.value}>
                                {size.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Site web</label>
                          <div className="input-icon">
                            <span className="input-icon-addon">
                              <Globe size={16} />
                            </span>
                            <input
                              type="url"
                              className={`form-control ${errors.website ? 'is-invalid' : ''}`}
                              value={formData.website}
                              onChange={(e) => setFormData({...formData, website: e.target.value})}
                              disabled={saveCompany.isPending}
                              placeholder="https://www.example.com"
                            />
                          </div>
                          {errors.website && (
                            <div className="invalid-feedback">{errors.website}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Statut</label>
                          <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            disabled={saveCompany.isPending}
                          >
                            {statuses.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
                
                {/* Contact et finances */}
                <div className="col-lg-6">
                  <fieldset className="form-fieldset">
                    <legend>Contact et finances</legend>
                    
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        disabled={saveCompany.isPending}
                        placeholder="contact@example.com"
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Téléphone</label>
                      <div className="input-icon">
                        <span className="input-icon-addon">
                          <Phone size={16} />
                        </span>
                        <input
                          type="tel"
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          disabled={saveCompany.isPending}
                          placeholder="+41 21 123 45 67"
                        />
                      </div>
                      {errors.phone && (
                        <div className="invalid-feedback">{errors.phone}</div>
                      )}
                    </div>
                    
                    <div className="row">
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Numéro TVA</label>
                          <input
                            type="text"
                            className={`form-control ${errors.vat_number ? 'is-invalid' : ''}`}
                            value={formData.vat_number}
                            onChange={(e) => setFormData({...formData, vat_number: e.target.value})}
                            disabled={saveCompany.isPending}
                            placeholder="CHE-123.456.789"
                          />
                          {errors.vat_number && (
                            <div className="invalid-feedback">{errors.vat_number}</div>
                          )}
                          <small className="form-hint">Format: CHE-xxx.xxx.xxx</small>
                        </div>
                      </div>
                      
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">CA annuel (CHF)</label>
                          <div className="input-icon">
                            <span className="input-icon-addon">
                              <DollarSign size={16} />
                            </span>
                            <input
                              type="number"
                              className={`form-control ${errors.annual_revenue ? 'is-invalid' : ''}`}
                              value={formData.annual_revenue}
                              onChange={(e) => setFormData({...formData, annual_revenue: e.target.value})}
                              disabled={saveCompany.isPending}
                              placeholder="1000000"
                              step="1000"
                            />
                          </div>
                          {errors.annual_revenue && (
                            <div className="invalid-feedback">{errors.annual_revenue}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
              
              {/* Adresse */}
              <fieldset className="form-fieldset">
                <legend>Adresse</legend>
                
                <div className="row">
                  <div className="col-8">
                    <div className="mb-3">
                      <label className="form-label">Adresse</label>
                      <div className="input-icon">
                        <span className="input-icon-addon">
                          <MapPin size={16} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          disabled={saveCompany.isPending}
                          placeholder="Rue de la Gare 10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-4">
                    <div className="mb-3">
                      <label className="form-label">NPA</label>
                      <input
                        type="text"
                        className={`form-control ${errors.postal_code ? 'is-invalid' : ''}`}
                        value={formData.postal_code}
                        onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                        disabled={saveCompany.isPending}
                        placeholder="1000"
                        maxLength="4"
                      />
                      {errors.postal_code && (
                        <div className="invalid-feedback">{errors.postal_code}</div>
                      )}
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
                        disabled={saveCompany.isPending}
                        placeholder="Lausanne"
                      />
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Pays</label>
                      <select
                        className="form-select"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        disabled={saveCompany.isPending}
                      >
                        <option value="Suisse">Suisse</option>
                        <option value="France">France</option>
                        <option value="Allemagne">Allemagne</option>
                        <option value="Italie">Italie</option>
                        <option value="Autriche">Autriche</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>
              
              {/* Tags et description */}
              <div className="row">
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">Tags</label>
                    <div className="mb-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="badge bg-purple me-1 mb-1">
                          {tag}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-1"
                            style={{ fontSize: '0.7em' }}
                            onClick={() => removeTag(tag)}
                            disabled={saveCompany.isPending}
                          />
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ajouter un tag (Entrée pour confirmer)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                      disabled={saveCompany.isPending}
                    />
                    <small className="form-hint">
                      Utilisez les tags pour catégoriser (Partenaire stratégique, Gros client, etc.)
                    </small>
                  </div>
                </div>
                
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      disabled={saveCompany.isPending}
                      placeholder="Description de l'entreprise, notes importantes..."
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saveCompany.isPending}
              >
                Annuler
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saveCompany.isPending}
              >
                {saveCompany.isPending ? (
                  <>
                    <Loader2 size={16} className="me-1 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-1" />
                    {company ? 'Modifier' : 'Créer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;
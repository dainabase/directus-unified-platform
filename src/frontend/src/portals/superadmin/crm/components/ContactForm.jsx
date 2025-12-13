// src/frontend/src/portals/superadmin/crm/components/ContactForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, MapPin, 
  Building2, Save, Loader2, Upload
} from 'lucide-react';
import { useSaveContact, useSearchCompanies } from '../hooks/useCRMData';

const ContactForm = ({ contact, onClose, companies }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    position: '',
    department: '',
    company: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Suisse',
    notes: '',
    status: 'active',
    source: 'manual',
    tags: []
  });
  
  const [errors, setErrors] = useState({});
  const [companyQuery, setCompanyQuery] = useState('');
  const [showCompanySearch, setShowCompanySearch] = useState(false);
  
  const saveContact = useSaveContact();
  const { data: companySearchResults } = useSearchCompanies(companyQuery, companyQuery.length >= 2);
  
  // Initialiser le formulaire si modification
  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        position: contact.position || '',
        department: contact.department || '',
        company: contact.company?.id || contact.company || '',
        address: contact.address || '',
        city: contact.city || '',
        postal_code: contact.postal_code || '',
        country: contact.country || 'Suisse',
        notes: contact.notes || '',
        status: contact.status || 'active',
        source: contact.source || 'manual',
        tags: contact.tags || []
      });
    }
  }, [contact]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Le prénom est requis';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Le numéro de téléphone n\'est pas valide';
    }
    
    if (formData.postal_code && !/^\d{4}$/.test(formData.postal_code)) {
      newErrors.postal_code = 'Le NPA doit contenir 4 chiffres';
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
      await saveContact.mutateAsync({
        id: contact?.id,
        data: {
          ...formData,
          tags: formData.tags.length ? formData.tags : null
        }
      });
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde contact:', error);
    }
  };
  
  const handleCompanySelect = (companyData) => {
    setFormData({ ...formData, company: companyData.id });
    setCompanyQuery(companyData.name);
    setShowCompanySearch(false);
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
  
  const statuses = [
    { value: 'active', label: 'Actif', color: 'success' },
    { value: 'inactive', label: 'Inactif', color: 'secondary' },
    { value: 'lead', label: 'Prospect', color: 'warning' },
    { value: 'customer', label: 'Client', color: 'primary' }
  ];
  
  const sources = [
    { value: 'manual', label: 'Saisie manuelle' },
    { value: 'import', label: 'Import' },
    { value: 'website', label: 'Site web' },
    { value: 'referral', label: 'Référence' },
    { value: 'event', label: 'Événement' },
    { value: 'social', label: 'Réseaux sociaux' }
  ];

  return (
    <div className="modal modal-blur fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <User size={20} className="me-2" />
              {contact ? 'Modifier le contact' : 'Nouveau contact'}
            </h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
              disabled={saveContact.isPending}
            />
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                {/* Informations personnelles */}
                <div className="col-lg-6">
                  <fieldset className="form-fieldset">
                    <legend>Informations personnelles</legend>
                    
                    <div className="row">
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label required">Prénom</label>
                          <input
                            type="text"
                            className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                            value={formData.first_name}
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            disabled={saveContact.isPending}
                          />
                          {errors.first_name && (
                            <div className="invalid-feedback">{errors.first_name}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label required">Nom</label>
                          <input
                            type="text"
                            className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                            value={formData.last_name}
                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            disabled={saveContact.isPending}
                          />
                          {errors.last_name && (
                            <div className="invalid-feedback">{errors.last_name}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label required">Email</label>
                      <div className="input-icon">
                        <span className="input-icon-addon">
                          <Mail size={16} />
                        </span>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          disabled={saveContact.isPending}
                        />
                      </div>
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>
                    
                    <div className="row">
                      <div className="col-6">
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
                              placeholder="+41 21 123 45 67"
                              disabled={saveContact.isPending}
                            />
                          </div>
                          {errors.phone && (
                            <div className="invalid-feedback">{errors.phone}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Mobile</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={formData.mobile}
                            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                            placeholder="+41 79 123 45 67"
                            disabled={saveContact.isPending}
                          />
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
                
                {/* Informations professionnelles */}
                <div className="col-lg-6">
                  <fieldset className="form-fieldset">
                    <legend>Informations professionnelles</legend>
                    
                    <div className="mb-3">
                      <label className="form-label">Entreprise</label>
                      <div className="position-relative">
                        <div className="input-icon">
                          <span className="input-icon-addon">
                            <Building2 size={16} />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            value={companyQuery}
                            onChange={(e) => {
                              setCompanyQuery(e.target.value);
                              setShowCompanySearch(true);
                            }}
                            onFocus={() => setShowCompanySearch(true)}
                            placeholder="Rechercher ou créer une entreprise..."
                            disabled={saveContact.isPending}
                          />
                        </div>
                        
                        {showCompanySearch && companyQuery.length >= 2 && companySearchResults?.length > 0 && (
                          <div className="dropdown-menu show position-absolute w-100 mt-1" style={{ zIndex: 1060 }}>
                            {companySearchResults.map(company => (
                              <button
                                key={company.id}
                                type="button"
                                className="dropdown-item"
                                onClick={() => handleCompanySelect(company)}
                              >
                                <div className="d-flex align-items-center">
                                  <Building2 size={16} className="me-2 text-muted" />
                                  <div>
                                    <div>{company.name}</div>
                                    {company.industry && (
                                      <small className="text-muted">{company.industry}</small>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Poste</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.position}
                            onChange={(e) => setFormData({...formData, position: e.target.value})}
                            placeholder="Directeur, Manager..."
                            disabled={saveContact.isPending}
                          />
                        </div>
                      </div>
                      
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Département</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                            placeholder="Ventes, IT, RH..."
                            disabled={saveContact.isPending}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Statut</label>
                          <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            disabled={saveContact.isPending}
                          >
                            {statuses.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="col-6">
                        <div className="mb-3">
                          <label className="form-label">Source</label>
                          <select
                            className="form-select"
                            value={formData.source}
                            onChange={(e) => setFormData({...formData, source: e.target.value})}
                            disabled={saveContact.isPending}
                          >
                            {sources.map(source => (
                              <option key={source.value} value={source.value}>
                                {source.label}
                              </option>
                            ))}
                          </select>
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
                          placeholder="Rue, numéro"
                          disabled={saveContact.isPending}
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
                        placeholder="1000"
                        maxLength="4"
                        disabled={saveContact.isPending}
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
                        placeholder="Lausanne"
                        disabled={saveContact.isPending}
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
                        disabled={saveContact.isPending}
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
              
              {/* Tags et notes */}
              <div className="row">
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">Tags</label>
                    <div className="mb-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="badge bg-blue me-1 mb-1">
                          {tag}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-1"
                            style={{ fontSize: '0.7em' }}
                            onClick={() => removeTag(tag)}
                            disabled={saveContact.isPending}
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
                      disabled={saveContact.isPending}
                    />
                    <small className="form-hint">
                      Utilisez les tags pour catégoriser vos contacts (VIP, Prospect chaud, etc.)
                    </small>
                  </div>
                </div>
                
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Notes internes sur le contact..."
                      disabled={saveContact.isPending}
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
                disabled={saveContact.isPending}
              >
                Annuler
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saveContact.isPending}
              >
                {saveContact.isPending ? (
                  <>
                    <Loader2 size={16} className="me-1 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-1" />
                    {contact ? 'Modifier' : 'Créer'}
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

export default ContactForm;
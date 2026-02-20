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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 relative z-10 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h5 className="text-lg font-semibold text-gray-900 flex items-center">
            <User size={20} className="mr-2" />
            {contact ? 'Modifier le contact' : 'Nouveau contact'}
          </h5>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            disabled={saveContact.isPending}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations personnelles */}
              <div>
                <fieldset className="border border-gray-100 rounded-xl p-4">
                  <legend className="text-sm font-semibold text-gray-900 px-2">Informations personnelles</legend>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Prénom <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className={`ds-input w-full ${errors.first_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        disabled={saveContact.isPending}
                      />
                      {errors.first_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Nom <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className={`ds-input w-full ${errors.last_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        disabled={saveContact.isPending}
                      />
                      {errors.last_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        className={`ds-input w-full pl-10 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        disabled={saveContact.isPending}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Téléphone</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Phone size={16} />
                        </span>
                        <input
                          type="tel"
                          className={`ds-input w-full pl-10 ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+41 21 123 45 67"
                          disabled={saveContact.isPending}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Mobile</label>
                      <input
                        type="tel"
                        className="ds-input w-full"
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        placeholder="+41 79 123 45 67"
                        disabled={saveContact.isPending}
                      />
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* Informations professionnelles */}
              <div>
                <fieldset className="border border-gray-100 rounded-xl p-4">
                  <legend className="text-sm font-semibold text-gray-900 px-2">Informations professionnelles</legend>

                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Entreprise</label>
                    <div className="relative">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Building2 size={16} />
                        </span>
                        <input
                          type="text"
                          className="ds-input w-full pl-10"
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
                        <div className="absolute w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                          {companySearchResults.map(company => (
                            <button
                              key={company.id}
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                              onClick={() => handleCompanySelect(company)}
                            >
                              <Building2 size={16} className="mr-2 text-gray-400" />
                              <div>
                                <div className="text-gray-900">{company.name}</div>
                                {company.industry && (
                                  <span className="text-gray-500 text-xs">{company.industry}</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Poste</label>
                      <input
                        type="text"
                        className="ds-input w-full"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                        placeholder="Directeur, Manager..."
                        disabled={saveContact.isPending}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Département</label>
                      <input
                        type="text"
                        className="ds-input w-full"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        placeholder="Ventes, IT, RH..."
                        disabled={saveContact.isPending}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Statut</label>
                      <select
                        className="ds-input w-full"
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

                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Source</label>
                      <select
                        className="ds-input w-full"
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
                </fieldset>
              </div>
            </div>

            {/* Adresse */}
            <fieldset className="border border-gray-100 rounded-xl p-4 mt-4">
              <legend className="text-sm font-semibold text-gray-900 px-2">Adresse</legend>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8">
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Adresse</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <MapPin size={16} />
                      </span>
                      <input
                        type="text"
                        className="ds-input w-full pl-10"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Rue, numéro"
                        disabled={saveContact.isPending}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-4">
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">NPA</label>
                    <input
                      type="text"
                      className={`ds-input w-full ${errors.postal_code ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      placeholder="1000"
                      maxLength="4"
                      disabled={saveContact.isPending}
                    />
                    {errors.postal_code && (
                      <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-6">
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Ville</label>
                    <input
                      type="text"
                      className="ds-input w-full"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Lausanne"
                      disabled={saveContact.isPending}
                    />
                  </div>
                </div>

                <div className="col-span-6">
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Pays</label>
                    <select
                      className="ds-input w-full"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div>
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tags</label>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                        {tag}
                        <button
                          type="button"
                          className="ml-1 text-white/70 hover:text-white"
                          onClick={() => removeTag(tag)}
                          disabled={saveContact.isPending}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="ds-input w-full"
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
                  <p className="text-gray-400 text-xs mt-1">
                    Utilisez les tags pour catégoriser vos contacts (VIP, Prospect chaud, etc.)
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
                  <textarea
                    className="ds-input w-full"
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

          <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              className="ds-btn ds-btn-secondary"
              onClick={onClose}
              disabled={saveContact.isPending}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="ds-btn ds-btn-primary"
              disabled={saveContact.isPending}
            >
              {saveContact.isPending ? (
                <>
                  <Loader2 size={16} className="mr-1 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  {contact ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;

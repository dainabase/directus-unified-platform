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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 relative z-10 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h5 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 size={20} className="mr-2" />
            {company ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
          </h5>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            disabled={saveCompany.isPending}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations générales */}
              <div>
                <fieldset className="border border-gray-100 rounded-xl p-4">
                  <legend className="text-sm font-semibold text-gray-900 px-2">Informations générales</legend>

                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nom de l'entreprise <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Building2 size={16} />
                      </span>
                      <input
                        type="text"
                        className={`ds-input w-full pl-10 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        disabled={saveCompany.isPending}
                        placeholder="ACME SA"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Secteur d'activité</label>
                      <select
                        className="ds-input w-full"
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

                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Taille</label>
                      <select
                        className="ds-input w-full"
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Site web</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Globe size={16} />
                        </span>
                        <input
                          type="url"
                          className={`ds-input w-full pl-10 ${errors.website ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          value={formData.website}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                          disabled={saveCompany.isPending}
                          placeholder="https://www.example.com"
                        />
                      </div>
                      {errors.website && (
                        <p className="text-red-500 text-xs mt-1">{errors.website}</p>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Statut</label>
                      <select
                        className="ds-input w-full"
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
                </fieldset>
              </div>

              {/* Contact et finances */}
              <div>
                <fieldset className="border border-gray-100 rounded-xl p-4">
                  <legend className="text-sm font-semibold text-gray-900 px-2">Contact et finances</legend>

                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                    <input
                      type="email"
                      className={`ds-input w-full ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={saveCompany.isPending}
                      placeholder="contact@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

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
                        disabled={saveCompany.isPending}
                        placeholder="+41 21 123 45 67"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Numéro TVA</label>
                      <input
                        type="text"
                        className={`ds-input w-full ${errors.vat_number ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.vat_number}
                        onChange={(e) => setFormData({...formData, vat_number: e.target.value})}
                        disabled={saveCompany.isPending}
                        placeholder="CHE-123.456.789"
                      />
                      {errors.vat_number && (
                        <p className="text-red-500 text-xs mt-1">{errors.vat_number}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-1">Format: CHE-xxx.xxx.xxx</p>
                    </div>

                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">CA annuel (CHF)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <DollarSign size={16} />
                        </span>
                        <input
                          type="number"
                          className={`ds-input w-full pl-10 ${errors.annual_revenue ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          value={formData.annual_revenue}
                          onChange={(e) => setFormData({...formData, annual_revenue: e.target.value})}
                          disabled={saveCompany.isPending}
                          placeholder="1000000"
                          step="1000"
                        />
                      </div>
                      {errors.annual_revenue && (
                        <p className="text-red-500 text-xs mt-1">{errors.annual_revenue}</p>
                      )}
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
                        disabled={saveCompany.isPending}
                        placeholder="Rue de la Gare 10"
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
                      disabled={saveCompany.isPending}
                      placeholder="1000"
                      maxLength="4"
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
                      disabled={saveCompany.isPending}
                      placeholder="Lausanne"
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
                          disabled={saveCompany.isPending}
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
                    disabled={saveCompany.isPending}
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Utilisez les tags pour catégoriser (Partenaire stratégique, Gros client, etc.)
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                  <textarea
                    className="ds-input w-full"
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

          <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              className="ds-btn ds-btn-secondary"
              onClick={onClose}
              disabled={saveCompany.isPending}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="ds-btn ds-btn-primary"
              disabled={saveCompany.isPending}
            >
              {saveCompany.isPending ? (
                <>
                  <Loader2 size={16} className="mr-1 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  {company ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;

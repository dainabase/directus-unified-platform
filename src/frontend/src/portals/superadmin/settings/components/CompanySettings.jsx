// src/frontend/src/portals/superadmin/settings/components/CompanySettings.jsx
import React, { useState, useEffect } from 'react';
import { Save, Building2, CreditCard, Globe } from 'lucide-react';
import { useOurCompany, useUpdateOurCompany } from '../hooks/useSettingsData';

const CANTONS_CH = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
];

const CompanySettings = ({ companyId }) => {
  const { data: companyData, isLoading } = useOurCompany(companyId);
  const updateCompany = useUpdateOurCompany();
  const company = companyData?.data;

  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    ide_number: '',
    vat_number: '',
    address_line1: '',
    address_line2: '',
    postal_code: '',
    city: '',
    canton: '',
    country: 'CH',
    phone: '',
    email: '',
    website: '',
    default_currency: 'CHF',
    default_language: 'fr',
    iban: '',
    bank_name: '',
    bic: ''
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        legal_name: company.legal_name || '',
        ide_number: company.ide_number || '',
        vat_number: company.vat_number || '',
        address_line1: company.address_line1 || '',
        address_line2: company.address_line2 || '',
        postal_code: company.postal_code || '',
        city: company.city || '',
        canton: company.canton || '',
        country: company.country || 'CH',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        default_currency: company.default_currency || 'CHF',
        default_language: company.default_language || 'fr',
        iban: company.iban || '',
        bank_name: company.bank_name || '',
        bic: company.bic || ''
      });
    }
  }, [company]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateCompany.mutateAsync({ id: companyId, data: formData });
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Informations générales */}
      <h4 className="mb-3">
        <Building2 size={20} className="me-2" />
        Informations générales
      </h4>
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Nom commercial</label>
          <input
            type="text"
            className="form-control"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Raison sociale</label>
          <input
            type="text"
            className="form-control"
            value={formData.legal_name}
            onChange={(e) => handleChange('legal_name', e.target.value)}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">N IDE</label>
          <input
            type="text"
            className="form-control"
            value={formData.ide_number}
            onChange={(e) => handleChange('ide_number', e.target.value)}
            placeholder="CHE-XXX.XXX.XXX"
          />
          <small className="form-hint">Format: CHE-XXX.XXX.XXX</small>
        </div>
        <div className="col-md-4">
          <label className="form-label">N TVA</label>
          <input
            type="text"
            className="form-control"
            value={formData.vat_number}
            onChange={(e) => handleChange('vat_number', e.target.value)}
            placeholder="CHE-XXX.XXX.XXX TVA"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Devise</label>
          <select
            className="form-select"
            value={formData.default_currency}
            onChange={(e) => handleChange('default_currency', e.target.value)}
          >
            <option value="CHF">CHF - Franc suisse</option>
            <option value="EUR">EUR - Euro</option>
          </select>
        </div>
      </div>

      {/* Adresse */}
      <h4 className="mb-3 mt-4">Adresse</h4>
      <div className="row mb-3">
        <div className="col-12">
          <label className="form-label">Adresse</label>
          <input
            type="text"
            className="form-control"
            value={formData.address_line1}
            onChange={(e) => handleChange('address_line1', e.target.value)}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-12">
          <label className="form-label">Complément</label>
          <input
            type="text"
            className="form-control"
            value={formData.address_line2}
            onChange={(e) => handleChange('address_line2', e.target.value)}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">Code postal</label>
          <input
            type="text"
            className="form-control"
            value={formData.postal_code}
            onChange={(e) => handleChange('postal_code', e.target.value)}
          />
        </div>
        <div className="col-md-5">
          <label className="form-label">Ville</label>
          <input
            type="text"
            className="form-control"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Canton</label>
          <select
            className="form-select"
            value={formData.canton}
            onChange={(e) => handleChange('canton', e.target.value)}
          >
            <option value="">--</option>
            {CANTONS_CH.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label">Pays</label>
          <select
            className="form-select"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
          >
            <option value="CH">Suisse</option>
            <option value="FR">France</option>
            <option value="DE">Allemagne</option>
          </select>
        </div>
      </div>

      {/* Contact */}
      <h4 className="mb-3 mt-4">
        <Globe size={20} className="me-2" />
        Contact
      </h4>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Telephone</label>
          <input
            type="tel"
            className="form-control"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+41 XX XXX XX XX"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Site web</label>
          <input
            type="url"
            className="form-control"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </div>
      </div>

      {/* Coordonnees bancaires */}
      <h4 className="mb-3 mt-4">
        <CreditCard size={20} className="me-2" />
        Coordonnees bancaires
      </h4>
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">IBAN</label>
          <input
            type="text"
            className="form-control"
            value={formData.iban}
            onChange={(e) => handleChange('iban', e.target.value)}
            placeholder="CH XX XXXX XXXX XXXX XXXX X"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Banque</label>
          <input
            type="text"
            className="form-control"
            value={formData.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">BIC/SWIFT</label>
          <input
            type="text"
            className="form-control"
            value={formData.bic}
            onChange={(e) => handleChange('bic', e.target.value)}
          />
        </div>
      </div>

      {/* Bouton enregistrer */}
      <div className="mt-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={updateCompany.isPending}
        >
          <Save size={16} className="me-1" />
          {updateCompany.isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};

export default CompanySettings;

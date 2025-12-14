// src/frontend/src/portals/superadmin/settings/components/InvoiceSettings.jsx
import React, { useState, useEffect } from 'react';
import { Save, FileText, AlertCircle } from 'lucide-react';
import { useInvoiceSettings, useUpdateInvoiceSettings, useCreateInvoiceSettings } from '../hooks/useSettingsData';

const InvoiceSettings = ({ companyId }) => {
  const { data: settings, isLoading } = useInvoiceSettings(companyId);
  const updateSettings = useUpdateInvoiceSettings();
  const createSettings = useCreateInvoiceSettings();

  const [formData, setFormData] = useState({
    invoice_prefix: 'FAC',
    invoice_next_number: 1,
    quote_prefix: 'DEV',
    quote_next_number: 1,
    default_payment_terms: 30,
    default_vat_rate: 8.1,
    late_payment_interest: 5,
    reminder_1_delay: 10,
    reminder_2_delay: 25,
    reminder_fee: 20,
    footer_text: '',
    payment_instructions: '',
    qr_invoice_enabled: true,
    auto_send_enabled: false
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        invoice_prefix: settings.invoice_prefix || 'FAC',
        invoice_next_number: settings.invoice_next_number || 1,
        quote_prefix: settings.quote_prefix || 'DEV',
        quote_next_number: settings.quote_next_number || 1,
        default_payment_terms: settings.default_payment_terms || 30,
        default_vat_rate: settings.default_vat_rate || 8.1,
        late_payment_interest: settings.late_payment_interest || 5,
        reminder_1_delay: settings.reminder_1_delay || 10,
        reminder_2_delay: settings.reminder_2_delay || 25,
        reminder_fee: settings.reminder_fee || 20,
        footer_text: settings.footer_text || '',
        payment_instructions: settings.payment_instructions || '',
        qr_invoice_enabled: settings.qr_invoice_enabled ?? true,
        auto_send_enabled: settings.auto_send_enabled ?? false
      });
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (settings?.id) {
      await updateSettings.mutateAsync({ id: settings.id, data: formData });
    } else {
      await createSettings.mutateAsync({ ...formData, company_id: companyId });
    }
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

  const isPending = updateSettings.isPending || createSettings.isPending;

  return (
    <form onSubmit={handleSubmit}>
      {/* Numerotation */}
      <h4 className="mb-3">
        <FileText size={20} className="me-2" />
        Numerotation
      </h4>
      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">Prefixe facture</label>
          <input
            type="text"
            className="form-control"
            value={formData.invoice_prefix}
            onChange={(e) => handleChange('invoice_prefix', e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Prochain numero</label>
          <input
            type="number"
            className="form-control"
            value={formData.invoice_next_number}
            onChange={(e) => handleChange('invoice_next_number', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Prefixe devis</label>
          <input
            type="text"
            className="form-control"
            value={formData.quote_prefix}
            onChange={(e) => handleChange('quote_prefix', e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Prochain numero</label>
          <input
            type="number"
            className="form-control"
            value={formData.quote_next_number}
            onChange={(e) => handleChange('quote_next_number', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
      </div>

      {/* Conditions de paiement */}
      <h4 className="mb-3 mt-4">Conditions de paiement</h4>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Delai paiement (jours)</label>
          <input
            type="number"
            className="form-control"
            value={formData.default_payment_terms}
            onChange={(e) => handleChange('default_payment_terms', parseInt(e.target.value) || 30)}
            min="0"
            max="90"
          />
          <small className="form-hint">Standard: 30 jours</small>
        </div>
        <div className="col-md-4">
          <label className="form-label">Taux TVA par defaut (%)</label>
          <select
            className="form-select"
            value={formData.default_vat_rate}
            onChange={(e) => handleChange('default_vat_rate', parseFloat(e.target.value))}
          >
            <option value="8.1">8.1% - Taux normal</option>
            <option value="2.6">2.6% - Taux reduit</option>
            <option value="3.8">3.8% - Hebergement</option>
            <option value="0">0% - Exonere</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Interets moratoires (%)</label>
          <input
            type="number"
            className="form-control"
            value={formData.late_payment_interest}
            onChange={(e) => handleChange('late_payment_interest', parseFloat(e.target.value) || 5)}
            min="0"
            max="15"
            step="0.1"
          />
          <small className="form-hint">Legal: 5% (art. 104 CO)</small>
        </div>
      </div>

      {/* Rappels */}
      <h4 className="mb-3 mt-4">Rappels</h4>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">1er rappel (J+)</label>
          <input
            type="number"
            className="form-control"
            value={formData.reminder_1_delay}
            onChange={(e) => handleChange('reminder_1_delay', parseInt(e.target.value) || 10)}
            min="1"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">2eme rappel (J+)</label>
          <input
            type="number"
            className="form-control"
            value={formData.reminder_2_delay}
            onChange={(e) => handleChange('reminder_2_delay', parseInt(e.target.value) || 25)}
            min="1"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Frais de rappel (CHF)</label>
          <input
            type="number"
            className="form-control"
            value={formData.reminder_fee}
            onChange={(e) => handleChange('reminder_fee', parseFloat(e.target.value) || 0)}
            min="0"
            step="5"
          />
        </div>
      </div>

      {/* Options */}
      <h4 className="mb-3 mt-4">Options</h4>
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              checked={formData.qr_invoice_enabled}
              onChange={(e) => handleChange('qr_invoice_enabled', e.target.checked)}
            />
            <span className="form-check-label">Activer QR-facture (Swiss QR)</span>
          </label>
          <small className="form-hint d-block">Ajoute le QR-code de paiement sur les factures PDF</small>
        </div>
        <div className="col-md-6">
          <label className="form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              checked={formData.auto_send_enabled}
              onChange={(e) => handleChange('auto_send_enabled', e.target.checked)}
            />
            <span className="form-check-label">Envoi automatique par email</span>
          </label>
          <small className="form-hint d-block">Envoie automatiquement les factures validees</small>
        </div>
      </div>

      {/* Textes */}
      <h4 className="mb-3 mt-4">Textes personnalises</h4>
      <div className="row mb-3">
        <div className="col-12">
          <label className="form-label">Instructions de paiement</label>
          <textarea
            className="form-control"
            rows="2"
            value={formData.payment_instructions}
            onChange={(e) => handleChange('payment_instructions', e.target.value)}
            placeholder="Ex: Merci de mentionner le numero de facture lors du paiement."
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-12">
          <label className="form-label">Pied de page facture</label>
          <textarea
            className="form-control"
            rows="2"
            value={formData.footer_text}
            onChange={(e) => handleChange('footer_text', e.target.value)}
            placeholder="Ex: Conditions generales disponibles sur notre site web."
          />
        </div>
      </div>

      {/* Alerte conformite */}
      <div className="alert alert-info mt-4">
        <AlertCircle size={16} className="me-2" />
        <strong>Conformite suisse:</strong> Les factures incluent automatiquement les mentions
        obligatoires (IDE, TVA, conditions).
      </div>

      {/* Bouton enregistrer */}
      <div className="mt-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          <Save size={16} className="me-1" />
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};

export default InvoiceSettings;

// src/frontend/src/portals/superadmin/settings/components/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../hooks/useSettingsData';

const PRODUCT_TYPES = [
  { id: 'product', label: 'Produit' },
  { id: 'service', label: 'Service' },
  { id: 'subscription', label: 'Abonnement' }
];

const UNITS = [
  { id: 'piece', label: 'Piece' },
  { id: 'hour', label: 'Heure' },
  { id: 'day', label: 'Jour' },
  { id: 'month', label: 'Mois' },
  { id: 'year', label: 'Annee' },
  { id: 'kg', label: 'Kilogramme' },
  { id: 'm', label: 'Metre' },
  { id: 'm2', label: 'Metre carre' },
  { id: 'forfait', label: 'Forfait' }
];

const VAT_RATES = [
  { rate: 8.1, label: '8.1% - Normal' },
  { rate: 2.6, label: '2.6% - Reduit' },
  { rate: 3.8, label: '3.8% - Hebergement' },
  { rate: 0, label: '0% - Exonere' }
];

const ProductForm = ({ product, companyId, onClose, onSuccess }) => {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'service',
    sku: '',
    unit_price: 0,
    currency: 'CHF',
    vat_rate: 8.1,
    unit: 'hour',
    is_active: true,
    accounting_code: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        type: product.type || 'service',
        sku: product.sku || '',
        unit_price: product.unit_price || 0,
        currency: product.currency || 'CHF',
        vat_rate: product.vat_rate || 8.1,
        unit: product.unit || 'hour',
        is_active: product.is_active ?? true,
        accounting_code: product.accounting_code || '',
        notes: product.notes || ''
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nom obligatoire';
    }

    if (formData.unit_price < 0) {
      newErrors.unit_price = 'Le prix ne peut pas etre negatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, data: formData });
      } else {
        await createProduct.mutateAsync({ ...formData, company_id: companyId });
      }
      onSuccess();
    } catch (error) {
      // Handled by hook
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="modal modal-blur fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <Package size={20} className="me-2" />
              {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Informations de base */}
              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label required">Nom du produit</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ex: Consultation strategique"
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                  >
                    {PRODUCT_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Description detaillee du produit ou service"
                  />
                </div>
              </div>

              {/* Prix et facturation */}
              <h5 className="mt-4 mb-3">Tarification</h5>
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label required">Prix unitaire HT</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className={`form-control ${errors.unit_price ? 'is-invalid' : ''}`}
                      value={formData.unit_price}
                      onChange={(e) => handleChange('unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.05"
                    />
                    <span className="input-group-text">CHF</span>
                  </div>
                  {errors.unit_price && <div className="invalid-feedback d-block">{errors.unit_price}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Taux TVA</label>
                  <select
                    className="form-select"
                    value={formData.vat_rate}
                    onChange={(e) => handleChange('vat_rate', parseFloat(e.target.value))}
                  >
                    {VAT_RATES.map(rate => (
                      <option key={rate.rate} value={rate.rate}>{rate.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Unite</label>
                  <select
                    className="form-select"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                  >
                    {UNITS.map(u => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reference */}
              <h5 className="mt-4 mb-3">Reference</h5>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Code SKU</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                    placeholder="Ex: CONS-STRAT-01"
                  />
                  <small className="form-hint">Reference interne unique</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Code comptable</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.accounting_code}
                    onChange={(e) => handleChange('accounting_code', e.target.value)}
                    placeholder="Ex: 3000"
                  />
                  <small className="form-hint">Pour l export comptable</small>
                </div>
              </div>

              {/* Options */}
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                    />
                    <span className="form-check-label">Produit actif</span>
                  </label>
                  <small className="form-hint d-block">
                    Un produit inactif n apparait pas dans la liste de selection des factures
                  </small>
                </div>
              </div>

              {/* Notes */}
              <div className="row">
                <div className="col-12">
                  <label className="form-label">Notes internes</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Notes visibles uniquement en interne"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                <Save size={16} className="me-1" />
                {isPending ? 'Enregistrement...' : isEditing ? 'Mettre a jour' : 'Creer'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default ProductForm;

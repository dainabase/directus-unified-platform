// src/frontend/src/portals/superadmin/settings/components/ProductsList.jsx
import React, { useState } from 'react';
import { Package, Plus, Edit, Trash2, Search } from 'lucide-react';
import { useProducts, useDeleteProduct } from '../hooks/useSettingsData';
import ProductForm from './ProductForm';

const ProductsList = ({ companyId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: productsData, isLoading, refetch } = useProducts();
  const deleteProduct = useDeleteProduct();

  const products = productsData?.data || [];

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || product.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleCreate = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (product) => {
    if (!confirm(`Supprimer "${product.name}" ?`)) return;
    await deleteProduct.mutateAsync(product.id);
    refetch();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditProduct(null);
    refetch();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(price || 0);
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
    <div>
      {/* En-tete */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          <Package size={20} className="me-2" />
          Produits et Services
        </h4>
        <button className="ds-btn ds-btn-primary" onClick={handleCreate}>
          <Plus size={16} className="me-1" />
          Nouveau produit
        </button>
      </div>

      {/* Filtres */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-icon">
            <span className="input-icon-addon">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tous les types</option>
            <option value="product">Produits</option>
            <option value="service">Services</option>
            <option value="subscription">Abonnements</option>
          </select>
        </div>
        <div className="col-md-3 text-end">
          <span className="text-muted">{filteredProducts.length} element(s)</span>
        </div>
      </div>

      {/* Tableau */}
      {filteredProducts.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><Package size={48} /></div>
          <p className="empty-title">Aucun produit</p>
          <p className="empty-subtitle text-muted">
            {searchQuery || typeFilter !== 'all'
              ? 'Aucun resultat pour ces criteres'
              : 'Creez votre premier produit pour commencer'}
          </p>
          {!searchQuery && typeFilter === 'all' && (
            <div className="empty-action">
              <button className="ds-btn ds-btn-primary" onClick={handleCreate}>
                <Plus size={16} className="me-1" />
                Nouveau produit
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-vcenter card-table table-hover">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Type</th>
                <th>SKU</th>
                <th className="text-end">Prix HT</th>
                <th>TVA</th>
                <th>Unite</th>
                <th className="w-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="font-weight-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                        {product.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      product.type === 'product' ? 'bg-zinc-100' :
                      product.type === 'service' ? 'bg-zinc-50' :
                      'bg-zinc-200'
                    }`}>
                      {product.type === 'product' ? 'Produit' :
                       product.type === 'service' ? 'Service' :
                       'Abonnement'}
                    </span>
                  </td>
                  <td>
                    <code>{product.sku || '-'}</code>
                  </td>
                  <td className="text-end">
                    {formatPrice(product.unit_price)}
                  </td>
                  <td>
                    {product.vat_rate ? `${product.vat_rate}%` : '8.1%'}
                  </td>
                  <td>
                    {product.unit || 'piece'}
                  </td>
                  <td>
                    <div className="btn-list flex-nowrap">
                      <button
                        className="ds-btn ds-btn-secondary text-sm"
                        onClick={() => handleEdit(product)}
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="ds-btn ds-btn-secondary text-sm text-red-600"
                        onClick={() => handleDelete(product)}
                        title="Supprimer"
                        disabled={deleteProduct.isPending}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modale formulaire */}
      {showForm && (
        <ProductForm
          product={editProduct}
          companyId={companyId}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default ProductsList;

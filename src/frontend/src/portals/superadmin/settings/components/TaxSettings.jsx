// src/frontend/src/portals/superadmin/settings/components/TaxSettings.jsx
import React from 'react';
import { Percent, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTaxRates, useUpdateTaxRate } from '../hooks/useSettingsData';

// Taux TVA Suisse 2025
const SWISS_VAT_RATES = {
  N81: { code: 'N81', rate: 8.1, label: 'Taux normal', description: 'Biens et services standard' },
  R26: { code: 'R26', rate: 2.6, label: 'Taux reduit', description: 'Biens de premiere necessite, livres, medicaments' },
  H38: { code: 'H38', rate: 3.8, label: 'Hebergement', description: 'Prestations hotelières' },
  E00: { code: 'E00', rate: 0, label: 'Exonere', description: 'Services medicaux, formation, assurances' }
};

const TaxSettings = () => {
  const { data: taxRatesData, isLoading, refetch } = useTaxRates();
  const updateTaxRate = useUpdateTaxRate();

  const taxRates = taxRatesData?.data || [];

  const handleToggleActive = async (rate) => {
    await updateTaxRate.mutateAsync({
      id: rate.id,
      data: { is_active: !rate.is_active }
    });
    refetch();
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
      <h4 className="mb-3">
        <Percent size={20} className="me-2" />
        Taux de TVA Suisse 2025
      </h4>

      <div className="alert alert-info mb-4">
        <strong>Information:</strong> Les taux de TVA sont fixes par la loi suisse (LTVA).
        Depuis le 1er janvier 2024, les nouveaux taux sont en vigueur.
      </div>

      {/* Tableau des taux standard */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Taux legaux (non modifiables)</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-vcenter card-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Taux</th>
                <th>Type</th>
                <th>Description</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(SWISS_VAT_RATES).map(rate => (
                <tr key={rate.code}>
                  <td>
                    <span className="badge bg-primary">{rate.code}</span>
                  </td>
                  <td>
                    <strong>{rate.rate.toFixed(1)}%</strong>
                  </td>
                  <td>{rate.label}</td>
                  <td className="text-muted">{rate.description}</td>
                  <td>
                    <CheckCircle size={16} className="text-success" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Taux personnalises */}
      {taxRates.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Taux personnalises</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Taux</th>
                  <th>Nom</th>
                  <th>Actif</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {taxRates.map(rate => (
                  <tr key={rate.id}>
                    <td>
                      <span className="badge bg-secondary">{rate.code}</span>
                    </td>
                    <td>{rate.rate}%</td>
                    <td>{rate.name}</td>
                    <td>
                      {rate.is_active ? (
                        <span className="badge bg-success">Actif</span>
                      ) : (
                        <span className="badge bg-secondary">Inactif</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-ghost-primary"
                        onClick={() => handleToggleActive(rate)}
                        disabled={updateTaxRate.isPending}
                      >
                        {rate.is_active ? 'Desactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Informations legales */}
      <div className="mt-4">
        <h5>References legales</h5>
        <ul className="text-muted">
          <li>LTVA - Loi federale regissant la taxe sur la valeur ajoutee (RS 641.20)</li>
          <li>Art. 25 LTVA - Taux de l impot</li>
          <li>Ordonnance relative a la loi sur la TVA (OTVA, RS 641.201)</li>
        </ul>
      </div>

      <div className="alert alert-warning mt-4">
        <AlertTriangle size={16} className="me-2" />
        <strong>Attention:</strong> L application incorrecte des taux de TVA peut entrainer
        des penalites. Consultez un specialiste en cas de doute.
      </div>
    </div>
  );
};

export default TaxSettings;

// src/frontend/src/portals/superadmin/collection/components/InterestCalculator.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calculator, DollarSign, Calendar, TrendingUp, 
  Info, AlertTriangle, CheckCircle, FileText 
} from 'lucide-react';
import { useInterestCalculation, useInterestConfig } from '../hooks/useCollectionData';

const InterestCalculator = ({ company }) => {
  const [formData, setFormData] = useState({
    principal: '',
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
    debtType: 'commercial',
    customRate: '',
    useCustomRate: false
  });
  
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const interestConfig = useInterestConfig(formData.debtType);
  
  const debtTypes = [
    { 
      id: 'commercial', 
      label: 'Créance commerciale', 
      description: 'B2B - Taux référence BNS + 5%',
      baseRate: 5.0
    },
    { 
      id: 'consumer', 
      label: 'Créance consommateur', 
      description: 'B2C - Taux référence BNS + 3%',
      baseRate: 3.0
    },
    { 
      id: 'rental', 
      label: 'Créance locative', 
      description: 'Bail à loyer - Taux référence BNS + 2%',
      baseRate: 2.0
    },
    { 
      id: 'service', 
      label: 'Prestation de service', 
      description: 'Services - Taux référence BNS + 4%',
      baseRate: 4.0
    },
    { 
      id: 'legal', 
      label: 'Frais judiciaires', 
      description: 'Décision tribunal - Taux légal 5%',
      baseRate: 5.0
    }
  ];
  
  const getCurrentBNSRate = () => {
    // Simulation du taux BNS actuel
    return 1.75;
  };
  
  const calculateInterest = () => {
    if (!formData.principal || !formData.startDate || !formData.endDate) {
      return;
    }
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const principal = parseFloat(formData.principal);
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      const bnsRate = getCurrentBNSRate();
      const selectedType = debtTypes.find(t => t.id === formData.debtType);
      const effectiveRate = formData.useCustomRate 
        ? parseFloat(formData.customRate || 0)
        : bnsRate + selectedType.baseRate;
      
      const dailyRate = effectiveRate / 365 / 100;
      const interestAmount = principal * dailyRate * daysDiff;
      const totalAmount = principal + interestAmount;
      
      // Simulation calcul composé pour périodes longues
      const compoundInterest = daysDiff > 365 
        ? principal * Math.pow(1 + effectiveRate/100, daysDiff/365) - principal
        : interestAmount;
      
      setResult({
        principal,
        daysDiff,
        effectiveRate,
        bnsRate,
        interestAmount,
        compoundInterest,
        totalAmount: principal + compoundInterest,
        dailyInterest: principal * dailyRate,
        monthlyInterest: principal * dailyRate * 30,
        breakdown: {
          bnsContribution: principal * (bnsRate / 100) * (daysDiff / 365),
          marginContribution: principal * (selectedType.baseRate / 100) * (daysDiff / 365)
        }
      });
      
      setIsCalculating(false);
    }, 500);
  };
  
  useEffect(() => {
    if (formData.principal && formData.startDate && formData.endDate) {
      calculateInterest();
    }
  }, [formData]);
  
  const selectedType = debtTypes.find(t => t.id === formData.debtType);

  return (
    <div className="row">
      {/* Formulaire de calcul */}
      <div className="col-lg-6">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <Calculator size={20} className="me-2" />
              Calculateur d'Intérêts Moratoires
            </h4>
          </div>
          <div className="card-body">
            {/* Montant principal */}
            <div className="mb-3">
              <label className="form-label required">
                <DollarSign size={16} className="me-1" />
                Montant principal (CHF)
              </label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.principal}
                onChange={(e) => setFormData({...formData, principal: e.target.value})}
                placeholder="10000.00"
              />
            </div>
            
            {/* Type de créance */}
            <div className="mb-3">
              <label className="form-label required">Type de créance</label>
              <select
                className="form-select"
                value={formData.debtType}
                onChange={(e) => setFormData({...formData, debtType: e.target.value})}
              >
                {debtTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              <small className="form-hint">
                {selectedType?.description}
              </small>
            </div>
            
            {/* Dates */}
            <div className="row">
              <div className="col-6">
                <div className="mb-3">
                  <label className="form-label required">
                    <Calendar size={16} className="me-1" />
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="mb-3">
                  <label className="form-label required">Date de calcul</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            {/* Taux personnalisé */}
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={formData.useCustomRate}
                onChange={(e) => setFormData({...formData, useCustomRate: e.target.checked})}
              />
              <label className="form-check-label">
                Utiliser un taux personnalisé
              </label>
            </div>
            
            {formData.useCustomRate && (
              <div className="mb-3">
                <label className="form-label">Taux annuel (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.customRate}
                  onChange={(e) => setFormData({...formData, customRate: e.target.value})}
                  placeholder="5.00"
                />
              </div>
            )}
            
            {/* Informations taux actuel */}
            <div className="alert alert-info">
              <Info size={16} className="me-2" />
              <strong>Taux BNS actuel:</strong> {getCurrentBNSRate()}% | 
              <strong> Taux effectif:</strong> {
                formData.useCustomRate 
                  ? (parseFloat(formData.customRate) || 0)
                  : (getCurrentBNSRate() + selectedType.baseRate)
              }%
            </div>
          </div>
        </div>
        
        {/* Configuration avancée */}
        <div className="card mt-4">
          <div className="card-header">
            <h4 className="card-title">Configuration Avancée</h4>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-12">
                <h6 className="text-muted mb-3">TAUX SELON TYPE DE CRÉANCE</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Base légale</th>
                        <th>Taux actuel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debtTypes.map(type => (
                        <tr key={type.id}>
                          <td>{type.label}</td>
                          <td className="text-muted small">{type.description}</td>
                          <td>
                            <span className="badge bg-blue-lt">
                              {(getCurrentBNSRate() + type.baseRate).toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Résultats */}
      <div className="col-lg-6">
        {result ? (
          <div className="card">
            <div className="card-header">
              <h4 className="card-title text-success">
                <CheckCircle size={20} className="me-2" />
                Résultat du Calcul
              </h4>
            </div>
            <div className="card-body">
              {/* Résumé principal */}
              <div className="row row-cards mb-4">
                <div className="col-6">
                  <div className="card card-sm">
                    <div className="card-body text-center">
                      <div className="h1 mb-0 text-primary">
                        {result.interestAmount.toLocaleString('fr-CH', {
                          style: 'currency',
                          currency: 'CHF'
                        })}
                      </div>
                      <div className="text-muted">Intérêts simples</div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card card-sm">
                    <div className="card-body text-center">
                      <div className="h1 mb-0 text-success">
                        {result.totalAmount.toLocaleString('fr-CH', {
                          style: 'currency',
                          currency: 'CHF'
                        })}
                      </div>
                      <div className="text-muted">Montant total</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Détails du calcul */}
              <dl className="row">
                <dt className="col-5">Principal:</dt>
                <dd className="col-7">
                  {result.principal.toLocaleString('fr-CH', {
                    style: 'currency',
                    currency: 'CHF'
                  })}
                </dd>
                
                <dt className="col-5">Période:</dt>
                <dd className="col-7">{result.daysDiff} jours</dd>
                
                <dt className="col-5">Taux effectif:</dt>
                <dd className="col-7">{result.effectiveRate.toFixed(3)}% annuel</dd>
                
                <dt className="col-5">Intérêts journaliers:</dt>
                <dd className="col-7">
                  {result.dailyInterest.toLocaleString('fr-CH', {
                    style: 'currency',
                    currency: 'CHF'
                  })}
                </dd>
                
                <dt className="col-5">Intérêts mensuels:</dt>
                <dd className="col-7">
                  {result.monthlyInterest.toLocaleString('fr-CH', {
                    style: 'currency',
                    currency: 'CHF'
                  })}
                </dd>
              </dl>
              
              {/* Décomposition du taux */}
              <div className="mt-4">
                <h6 className="text-muted mb-3">DÉCOMPOSITION DU TAUX</h6>
                <div className="progress-stacked">
                  <div 
                    className="progress-bar bg-blue" 
                    style={{ width: `${(result.bnsRate / result.effectiveRate) * 100}%` }}
                    title={`Taux BNS: ${result.bnsRate}%`}
                  ></div>
                  <div 
                    className="progress-bar bg-purple" 
                    style={{ width: `${((result.effectiveRate - result.bnsRate) / result.effectiveRate) * 100}%` }}
                    title={`Marge: ${(result.effectiveRate - result.bnsRate).toFixed(2)}%`}
                  ></div>
                </div>
                <div className="row mt-2 text-small">
                  <div className="col">
                    <span className="badge bg-blue-lt">BNS: {result.bnsRate}%</span>
                  </div>
                  <div className="col text-end">
                    <span className="badge bg-purple-lt">
                      Marge: {(result.effectiveRate - result.bnsRate).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Comparaison intérêts composés */}
              {result.daysDiff > 365 && (
                <div className="alert alert-warning mt-4">
                  <AlertTriangle size={16} className="me-2" />
                  <strong>Période > 1 an:</strong><br />
                  Intérêts composés: {result.compoundInterest.toLocaleString('fr-CH', {
                    style: 'currency',
                    currency: 'CHF'
                  })}
                  <br />
                  <small>Différence: +{(result.compoundInterest - result.interestAmount).toLocaleString('fr-CH', {
                    style: 'currency',
                    currency: 'CHF'
                  })}</small>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body text-center py-5">
              <Calculator size={48} className="text-muted mb-3" />
              <h5 className="text-muted">Calcul d'Intérêts</h5>
              <p className="text-muted">
                Saisissez le montant, les dates et le type de créance pour calculer automatiquement les intérêts moratoires selon le droit suisse.
              </p>
            </div>
          </div>
        )}
        
        {/* Informations légales */}
        <div className="card mt-4">
          <div className="card-header">
            <h4 className="card-title">
              <FileText size={20} className="me-2" />
              Bases Légales
            </h4>
          </div>
          <div className="card-body">
            <ul className="list-unstyled">
              <li className="mb-2">
                <CheckCircle size={16} className="text-success me-2" />
                <strong>Art. 104 CO:</strong> Intérêts moratoires 5% minimum
              </li>
              <li className="mb-2">
                <CheckCircle size={16} className="text-success me-2" />
                <strong>Créances commerciales:</strong> Taux BNS + marge raisonnable
              </li>
              <li className="mb-2">
                <CheckCircle size={16} className="text-success me-2" />
                <strong>Procédure LP:</strong> Intérêts calculés jusqu'au paiement
              </li>
              <li className="mb-2">
                <TrendingUp size={16} className="text-info me-2" />
                <strong>Taux variable:</strong> Suivi automatique du taux BNS
              </li>
            </ul>
            
            <div className="mt-3 p-3 bg-light rounded">
              <small className="text-muted">
                <strong>Note:</strong> Ce calculateur est fourni à titre indicatif. 
                Pour les procédures judiciaires, consultez un avocat spécialisé 
                ou référez-vous aux barèmes officiels des tribunaux.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestCalculator;
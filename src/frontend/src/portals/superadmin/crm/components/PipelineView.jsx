// src/frontend/src/portals/superadmin/crm/components/PipelineView.jsx
import React, { useState } from 'react';
import {
  Target, Plus, MoreVertical, DollarSign, Calendar, User,
  ArrowRight, Phone, Mail, Clock, TrendingUp, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

const mockDeals = {
  prospection: [
    { id: 1, name: 'Refonte site web', company: 'TechStart SA', value: 15000, contact: 'Marc Dubois', daysInStage: 5 },
    { id: 2, name: 'Application mobile', company: 'Digital AG', value: 45000, contact: 'Anna Schmidt', daysInStage: 3 }
  ],
  qualification: [
    { id: 3, name: 'ERP Integration', company: 'Swiss Industries', value: 85000, contact: 'Peter Mueller', daysInStage: 8 },
    { id: 4, name: 'Support annuel', company: 'MedTech SA', value: 12000, contact: 'Sophie Martin', daysInStage: 2 }
  ],
  proposition: [
    { id: 5, name: 'Migration cloud', company: 'FinServ AG', value: 120000, contact: 'Thomas Weber', daysInStage: 12 },
    { id: 6, name: 'Audit securite', company: 'BankPlus', value: 35000, contact: 'Laura Keller', daysInStage: 6 }
  ],
  negociation: [
    { id: 7, name: 'Plateforme e-commerce', company: 'RetailMax', value: 75000, contact: 'Jean Rochat', daysInStage: 15 }
  ],
  closing: [
    { id: 8, name: 'Maintenance 2025', company: 'ACME Corp', value: 48000, contact: 'Marie Blanc', daysInStage: 4 }
  ]
};

const STAGES = [
  { id: 'prospection', label: 'Prospection', color: 'secondary', probability: 10 },
  { id: 'qualification', label: 'Qualification', color: 'info', probability: 25 },
  { id: 'proposition', label: 'Proposition', color: 'primary', probability: 50 },
  { id: 'negociation', label: 'Negociation', color: 'warning', probability: 75 },
  { id: 'closing', label: 'Closing', color: 'success', probability: 90 }
];

const PipelineView = ({ selectedCompany }) => {
  const [deals, setDeals] = useState(mockDeals);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount);
  };

  const calculateStageTotal = (stageId) => {
    return deals[stageId]?.reduce((sum, deal) => sum + deal.value, 0) || 0;
  };

  const calculateWeightedValue = (stageId) => {
    const stage = STAGES.find(s => s.id === stageId);
    const total = calculateStageTotal(stageId);
    return total * (stage.probability / 100);
  };

  const totalPipeline = STAGES.reduce((sum, stage) => sum + calculateStageTotal(stage.id), 0);
  const weightedPipeline = STAGES.reduce((sum, stage) => sum + calculateWeightedValue(stage.id), 0);

  const handleDragStart = (deal, sourceStage) => {
    setDraggedDeal({ deal, sourceStage });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetStage) => {
    if (!draggedDeal || draggedDeal.sourceStage === targetStage) {
      setDraggedDeal(null);
      return;
    }

    setDeals(prev => {
      const newDeals = { ...prev };
      newDeals[draggedDeal.sourceStage] = newDeals[draggedDeal.sourceStage].filter(
        d => d.id !== draggedDeal.deal.id
      );
      newDeals[targetStage] = [...newDeals[targetStage], draggedDeal.deal];
      return newDeals;
    });

    toast.success(`Deal deplace vers ${STAGES.find(s => s.id === targetStage)?.label}`);
    setDraggedDeal(null);
  };

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Target className="me-2" size={24} />
              Pipeline Commercial
            </h2>
            <div className="text-muted mt-1">
              Suivi des opportunites de vente
            </div>
          </div>
          <div className="col-auto ms-auto">
            <button className="btn btn-primary">
              <Plus size={16} className="me-1" />
              Nouvelle opportunite
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <DollarSign size={20} className="text-primary me-2" />
                <span className="text-muted small">Pipeline total</span>
              </div>
              <h3 className="mb-0">{formatCurrency(totalPipeline)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <TrendingUp size={20} className="text-success me-2" />
                <span className="text-muted small">Valeur ponderee</span>
              </div>
              <h3 className="mb-0">{formatCurrency(weightedPipeline)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Target size={20} className="text-warning me-2" />
                <span className="text-muted small">Opportunites</span>
              </div>
              <h3 className="mb-0">
                {STAGES.reduce((sum, stage) => sum + (deals[stage.id]?.length || 0), 0)}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Clock size={20} className="text-info me-2" />
                <span className="text-muted small">En closing</span>
              </div>
              <h3 className="mb-0">{formatCurrency(calculateStageTotal('closing'))}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Pipeline */}
      <div className="card">
        <div className="card-body p-0">
          <div className="d-flex overflow-auto" style={{ minHeight: '500px' }}>
            {STAGES.map(stage => (
              <div
                key={stage.id}
                className="flex-shrink-0 border-end"
                style={{ width: '280px', minWidth: '280px' }}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Stage Header */}
                <div className={`p-3 bg-${stage.color}-lt border-bottom`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">{stage.label}</h6>
                      <small className="text-muted">{stage.probability}% probabilite</small>
                    </div>
                    <span className="badge bg-${stage.color}">{deals[stage.id]?.length || 0}</span>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">Total: </small>
                    <span className="fw-medium">{formatCurrency(calculateStageTotal(stage.id))}</span>
                  </div>
                </div>

                {/* Deals */}
                <div className="p-2" style={{ minHeight: '400px' }}>
                  {deals[stage.id]?.map(deal => (
                    <div
                      key={deal.id}
                      className="card mb-2 cursor-pointer"
                      draggable
                      onDragStart={() => handleDragStart(deal, stage.id)}
                      onClick={() => setSelectedDeal(deal)}
                      style={{ cursor: 'grab' }}
                    >
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0 text-truncate" style={{ maxWidth: '180px' }}>
                            {deal.name}
                          </h6>
                          <button className="btn btn-sm btn-ghost-secondary p-0">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <Building2 size={12} className="me-1" />
                          {deal.company}
                        </div>
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <User size={12} className="me-1" />
                          {deal.contact}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-success">{formatCurrency(deal.value)}</span>
                          <span className="badge bg-secondary-lt text-secondary">
                            <Clock size={10} className="me-1" />
                            {deal.daysInStage}j
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <div className="modal modal-blur fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedDeal.name}</h5>
                <button className="btn-close" onClick={() => setSelectedDeal(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label text-muted">Entreprise</label>
                  <div className="fw-medium">{selectedDeal.company}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted">Contact</label>
                  <div className="fw-medium">{selectedDeal.contact}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted">Valeur</label>
                  <div className="fw-bold text-success h4">{formatCurrency(selectedDeal.value)}</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-primary flex-fill">
                    <Phone size={14} className="me-1" /> Appeler
                  </button>
                  <button className="btn btn-outline-primary flex-fill">
                    <Mail size={14} className="me-1" /> Email
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedDeal(null)}>
                  Fermer
                </button>
                <button className="btn btn-primary">
                  <ArrowRight size={14} className="me-1" /> Avancer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineView;

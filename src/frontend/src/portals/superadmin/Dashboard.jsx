import React from 'react'
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts'

const SuperAdminDashboard = ({ selectedCompany }) => {
  // Données mockées pour le dashboard
  const tasksData = {
    total: 47,
    semaine: 12,
    retard: 3,
    urgent: 8
  }

  const projectsData = {
    actifs: 8,
    livraison: 3,
    alertes: 2
  }

  const pipelineData = {
    total: '€1.2M',
    enCours: 15,
    closing: 5,
    nouveau: 8
  }

  const marketingData = {
    visiteurs: 1847,
    leads: 127,
    conversion: '6.9%',
    campagnes: 5
  }

  const cashData = {
    disponible: '€847K',
    runway: '7.3 mois',
    burn: '€116K/mois',
    prevision: '€2.1M'
  }

  const facturesData = {
    impayees: { count: 12, montant: '€45K' },
    retard30j: { count: 3, montant: '€18K' },
    aEmettre: 8,
    attente: '€127K'
  }

  // Graphique Cash Flow 7 jours
  const cashFlowData = [
    { day: 'L', value: 45 },
    { day: 'M', value: 52 },
    { day: 'M', value: 38 },
    { day: 'J', value: 65 },
    { day: 'V', value: 48 },
    { day: 'S', value: 15 },
    { day: 'D', value: 8 }
  ]

  return (
    <>
      <div className="container-fluid px-3">
        
        {/* Section Alertes - COMPACT */}
        <div className="card mb-2" style={{ height: '80px' }}>
          <div className="card-body p-2">
            <div className="d-flex align-items-center justify-content-between h-100">
              <h5 className="mb-0">📢 Alertes</h5>
              <div className="d-flex gap-3">
                <span className="badge bg-danger">3 urgentes</span>
                <span className="badge bg-warning">5 deadlines</span>
                <span className="badge bg-info">2 financières</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grille principale COMPACTE */}
        <div className="row g-2">
          
          {/* COLONNE 1: OPÉRATIONNEL */}
          <div className="col-lg-3">
            {/* Titre colonne - 30px */}
            <div className="mb-2" style={{ height: '30px' }}>
              <h6 className="text-uppercase text-muted mb-0" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                ⚙️ OPÉRATIONNEL
              </h6>
            </div>
            
            {/* Bloc 1.1 - 280px */}
            <div className="card mb-2" style={{ height: '280px' }}>
              <div className="card-header py-2">
                <h6 className="card-title mb-0">📋 Tâches & Actions</h6>
              </div>
              <div className="card-body p-2" style={{ overflowY: 'auto' }}>
                <div className="row g-1 small">
                  <div className="col-8">Tâches actives</div>
                  <div className="col-4 text-end fw-bold">47</div>
                  
                  <div className="col-8">Cette semaine</div>
                  <div className="col-4 text-end fw-bold">14</div>
                  
                  <div className="col-8">En retard</div>
                  <div className="col-4 text-end">
                    <span className="badge bg-danger badge-sm">3</span>
                  </div>
                  
                  <div className="col-8">Aujourd'hui</div>
                  <div className="col-4 text-end fw-bold">5</div>
                </div>
                
                <hr className="my-2"/>
                
                <div className="small">
                  <div className="fw-bold mb-1">TOP PRIORITÉS:</div>
                  <div>• Valider devis BNP</div>
                  <div>• Call client X (14h)</div>
                  <div>• Review projet Y</div>
                </div>
              </div>
            </div>
            
            {/* Bloc 1.2 - 280px */}
            <div className="card" style={{ height: '280px' }}>
              <div className="card-header py-2">
                <h6 className="card-title mb-0">📁 Projets & Deliverables</h6>
              </div>
              <div className="card-body p-2" style={{ overflowY: 'auto' }}>
                <div className="row g-1 small">
                  <div className="col-8">Projets actifs</div>
                  <div className="col-4 text-end fw-bold">8</div>
                  
                  <div className="col-8">En cours</div>
                  <div className="col-4 text-end">
                    <span className="badge bg-primary badge-sm">5</span>
                  </div>
                  
                  <div className="col-8">En attente</div>
                  <div className="col-4 text-end">
                    <span className="badge bg-warning badge-sm">3</span>
                  </div>
                  
                  <div className="col-8">Livraisons/sem</div>
                  <div className="col-4 text-end fw-bold">2</div>
                </div>
                
                <hr className="my-2"/>
                
                <div className="small">
                  <div className="fw-bold mb-1">PROCHAINS:</div>
                  <div>📅 Demain - Livraison A</div>
                  <div>📅 Jeudi - Sprint B</div>
                  <div>📅 Lundi - Kickoff C</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* COLONNE 2: COMMERCIAL & MARKETING */}
          <div className="col-lg-3">
            {/* Titre colonne */}
            <div className="mb-2" style={{ height: '30px' }}>
              <h6 className="text-uppercase text-muted mb-0" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                📈 COMMERCIAL & MARKETING
              </h6>
            </div>
            
            {/* Bloc 2.1 - 280px */}
            <div className="card mb-2" style={{ height: '280px' }}>
              <div className="card-header py-2">
                <h6 className="card-title mb-0">🎯 Pipeline Commercial</h6>
              </div>
              <div className="card-body p-2" style={{ overflowY: 'auto' }}>
                <div className="mb-2">
                  <div className="h4 mb-0">€1.2M</div>
                  <div className="text-muted small">24 opportunités</div>
                </div>
                
                <div className="row g-1 small">
                  <div className="col-7">Devis actifs</div>
                  <div className="col-5 text-end">
                    <span className="badge bg-info badge-sm">7</span> €340K
                  </div>
                  
                  <div className="col-7">Conversion</div>
                  <div className="col-5 text-end">
                    <span className="badge bg-success badge-sm">32% ↑</span>
                  </div>
                  
                  <div className="col-7">Closing/mois</div>
                  <div className="col-5 text-end fw-bold">€450K</div>
                </div>
                
                <hr className="my-2"/>
                
                <div className="small">
                  <div className="fw-bold mb-1">HOT LEADS:</div>
                  <div>🔥 BNP - €120K</div>
                  <div>🔥 SocGen - €85K</div>
                </div>
              </div>
            </div>
            
            {/* Bloc 2.2 - 280px */}
            <div className="card" style={{ height: '280px' }}>
              <div className="card-header py-2">
                <h6 className="card-title mb-0">📊 Marketing & Acquisition</h6>
              </div>
              <div className="card-body p-2" style={{ overflowY: 'auto' }}>
                <div className="row g-1 small">
                  <div className="col-7">Visiteurs/jour</div>
                  <div className="col-5 text-end fw-bold">1,847</div>
                  
                  <div className="col-7">Leads/semaine</div>
                  <div className="col-5 text-end fw-bold">124</div>
                  
                  <div className="col-7">Conversion</div>
                  <div className="col-5 text-end fw-bold">6.7%</div>
                  
                  <div className="col-7">CAC</div>
                  <div className="col-5 text-end fw-bold">€320</div>
                </div>
                
                <hr className="my-2"/>
                
                <div className="small">
                  <div className="fw-bold mb-1">SOURCES:</div>
                  <div className="d-flex justify-content-between">
                    <span>Google</span>
                    <span>45%</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Direct</span>
                    <span>30%</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Social</span>
                    <span>25%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* COLONNE 3: FINANCES */}
          <div className="col-lg-3">
            {/* Titre colonne */}
            <div className="mb-2" style={{ height: '30px' }}>
              <h6 className="text-uppercase text-muted mb-0" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                💰 FINANCES
              </h6>
            </div>
            
            {/* Bloc 3.1 - 280px */}
            <div className="card mb-2" style={{ height: '280px' }}>
              <div className="card-header py-2">
                <h6 className="card-title mb-0">💵 Trésorerie & Cash</h6>
              </div>
              <div className="card-body p-2" style={{ overflowY: 'auto' }}>
                <div className="mb-2">
                  <div className="h4 mb-0">€847K</div>
                  <div className="text-muted small">Cash disponible</div>
                </div>
                
                <div className="row g-1 small">
                  <div className="col-7">Entrées (7j)</div>
                  <div className="col-5 text-end text-success fw-bold">+€127K</div>
                  
                  <div className="col-7">Sorties (7j)</div>
                  <div className="col-5 text-end text-danger fw-bold">-€85K</div>
                  
                  <div className="col-7">Burn rate</div>
                  <div className="col-5 text-end fw-bold">€115K</div>
                  
                  <div className="col-7">Runway</div>
                  <div className="col-5 text-end">
                    <span className="badge bg-success badge-sm">7.3m</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <ResponsiveContainer width="100%" height={60}>
                    <BarChart data={cashFlowData}>
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Bloc 3.2 - 280px */}
            <div className="card" style={{ height: '280px' }}>
              <div className="card-header py-2">
                <h6 className="card-title mb-0">📄 Factures & Paiements</h6>
              </div>
              <div className="card-body p-2" style={{ overflowY: 'auto' }}>
                <div className="row g-1 small">
                  <div className="col-7">Impayées</div>
                  <div className="col-5 text-end">
                    <span className="badge bg-warning badge-sm">12</span> €45K
                  </div>
                  
                  <div className="col-7">{'> 30 jours'}</div>
                  <div className="col-5 text-end">
                    <span className="badge bg-danger badge-sm">3</span> €18K
                  </div>
                  
                  <div className="col-7">À émettre</div>
                  <div className="col-5 text-end fw-bold">8</div>
                  
                  <div className="col-7">En attente</div>
                  <div className="col-5 text-end fw-bold">€127K</div>
                </div>
                
                <hr className="my-2"/>
                
                <div className="d-grid gap-1">
                  <button className="btn btn-sm btn-danger">
                    Relancer BNP
                  </button>
                  <button className="btn btn-sm btn-primary">
                    Valider devis
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* COLONNE 4: KPIs - Petits carrés */}
          <div className="col-lg-3">
            {/* Titre colonne */}
            <div className="mb-2" style={{ height: '30px' }}>
              <h6 className="text-uppercase text-muted mb-0" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                🎯 INDICATEURS
              </h6>
            </div>
            
            {/* Grille de KPIs carrés compacts */}
            <div className="row g-1">
              {/* KPI 1 */}
              <div className="col-6">
                <div className="card" style={{ height: '90px' }}>
                  <div className="card-body p-1 text-center d-flex flex-column justify-content-center">
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>RUNWAY</div>
                    <div className="h5 mb-0">7.3m</div>
                    <div className="text-success" style={{ fontSize: '0.6rem' }}>↑1.2</div>
                  </div>
                </div>
              </div>
              
              {/* KPI 2 */}
              <div className="col-6">
                <div className="card" style={{ height: '90px' }}>
                  <div className="card-body p-1 text-center d-flex flex-column justify-content-center">
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>ARR</div>
                    <div className="h5 mb-0">€2.4M</div>
                    <div className="text-success" style={{ fontSize: '0.6rem' }}>↑23%</div>
                  </div>
                </div>
              </div>
              
              {/* KPI 3 */}
              <div className="col-6">
                <div className="card" style={{ height: '90px' }}>
                  <div className="card-body p-1 text-center d-flex flex-column justify-content-center">
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>EBITDA</div>
                    <div className="h5 mb-0">18.5%</div>
                    <div className="text-success" style={{ fontSize: '0.6rem' }}>↑2.3%</div>
                  </div>
                </div>
              </div>
              
              {/* KPI 4 */}
              <div className="col-6">
                <div className="card" style={{ height: '90px' }}>
                  <div className="card-body p-1 text-center d-flex flex-column justify-content-center">
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>LTV:CAC</div>
                    <div className="h5 mb-0">4.2</div>
                    <div className="text-success" style={{ fontSize: '0.6rem' }}>Good</div>
                  </div>
                </div>
              </div>
              
              {/* KPI 5 */}
              <div className="col-12">
                <div className="card" style={{ height: '90px' }}>
                  <div className="card-body p-1 text-center d-flex flex-column justify-content-center">
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>NPS SCORE</div>
                    <div className="h5 mb-0">72</div>
                    <div className="text-success" style={{ fontSize: '0.6rem' }}>Excellent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Styles React inline */}
      <style jsx>{`
        .container-fluid {
          max-width: 1920px;
        }
        .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.08);
        }
        .badge-sm {
          font-size: 0.7rem;
          padding: 0.2rem 0.4rem;
        }
        .small {
          font-size: 0.875rem;
        }
      `}</style>
    </>
  )
}

export default SuperAdminDashboard
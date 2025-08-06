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
    { day: 'Lun', entrees: 45, sorties: 32 },
    { day: 'Mar', entrees: 52, sorties: 28 },
    { day: 'Mer', entrees: 38, sorties: 35 },
    { day: 'Jeu', entrees: 65, sorties: 40 },
    { day: 'Ven', entrees: 48, sorties: 38 },
    { day: 'Sam', entrees: 15, sorties: 12 },
    { day: 'Dim', entrees: 8, sorties: 5 }
  ]

  return (
    <div className="page-body">
      <div className="container-fluid px-3">
        
        {/* BLOC ALERTES EN HAUT */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <div className="alert alert-danger d-flex align-items-center mb-0">
                  <div className="flex-fill">
                    <h4 className="alert-title">3 actions urgentes</h4>
                    <div className="text-secondary">Délais dépassés</div>
                  </div>
                  <div className="h1 mb-0 ms-3">3</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="alert alert-warning d-flex align-items-center mb-0">
                  <div className="flex-fill">
                    <h4 className="alert-title">5 deadlines cette semaine</h4>
                    <div className="text-secondary">À surveiller</div>
                  </div>
                  <div className="h1 mb-0 ms-3">5</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="alert alert-info d-flex align-items-center mb-0">
                  <div className="flex-fill">
                    <h4 className="alert-title">2 alertes financières</h4>
                    <div className="text-secondary">Factures impayées {'> 30j'}</div>
                  </div>
                  <div className="h1 mb-0 ms-3">2</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grille principale avec structure asymétrique */}
        <div className="row g-3">
          
          {/* COLONNE 1: OPÉRATIONNEL - Large */}
          <div className="col-12 col-md-4 col-lg-3">
            {/* Titre de colonne */}
            <div className="mb-3" style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <h4 className="text-uppercase text-muted mb-0" style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                ⚙️ OPÉRATIONNEL
              </h4>
            </div>
            
            {/* Bloc 1.1: Tâches & Actions */}
            <div className="card mb-3" style={{ height: 'calc(50% - 50px)' }}>
              <div className="card-header">
                <h3 className="card-title">📋 Tâches & Actions</h3>
              </div>
              <div className="card-body" style={{ overflowY: 'auto' }}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Tâches totales actives</span>
                    <span className="h3 mb-0">47</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Cette semaine</span>
                    <span className="badge bg-primary">12</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">En retard</span>
                    <span className="badge bg-danger">3</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">Urgent</span>
                    <span className="badge bg-warning">8</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="mb-2">TOP PRIORITÉS</h5>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item px-0 py-2">
                      <small className="text-danger">🔴 Migration DB Lexaia</small>
                    </div>
                    <div className="list-group-item px-0 py-2">
                      <small className="text-warning">🟡 Audit sécurité Q4</small>
                    </div>
                    <div className="list-group-item px-0 py-2">
                      <small className="text-warning">🟡 Revue contrats 2024</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bloc 1.2: Projets & Deliverables */}
            <div className="card" style={{ height: 'calc(50% - 50px)' }}>
              <div className="card-header">
                <h3 className="card-title">📁 Projets & Deliverables</h3>
              </div>
              <div className="card-body" style={{ overflowY: 'auto' }}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Projets actifs</span>
                    <span className="h3 mb-0">8</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Livraison ce mois</span>
                    <span className="badge bg-success">3</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">Alertes projet</span>
                    <span className="badge bg-danger">2</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="mb-2">STATUT PROJETS</h5>
                  <div className="vstack gap-2">
                    <div className="progress" style={{ height: '20px' }}>
                      <div className="progress-bar bg-success" style={{ width: '75%' }}>
                        <small>HYPERVISUAL - 75%</small>
                      </div>
                    </div>
                    <div className="progress" style={{ height: '20px' }}>
                      <div className="progress-bar bg-warning" style={{ width: '45%' }}>
                        <small>DAINAMICS - 45%</small>
                      </div>
                    </div>
                    <div className="progress" style={{ height: '20px' }}>
                      <div className="progress-bar bg-danger" style={{ width: '25%' }}>
                        <small>LEXAIA - 25%</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* COLONNE 2: COMMERCIAL & MARKETING - Large */}
          <div className="col-12 col-md-4 col-lg-3">
            {/* Titre de colonne */}
            <div className="mb-3" style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <h4 className="text-uppercase text-muted mb-0" style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                📈 COMMERCIAL & MARKETING
              </h4>
            </div>
            
            {/* Bloc 2.1: Pipeline Commercial */}
            <div className="card mb-3" style={{ height: 'calc(50% - 50px)' }}>
              <div className="card-header">
                <h3 className="card-title">🎯 Pipeline Commercial</h3>
              </div>
              <div className="card-body" style={{ overflowY: 'auto' }}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Pipeline total</span>
                    <span className="h3 mb-0">€1.2M</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Deals en cours</span>
                    <span>15</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Closing ce mois</span>
                    <span className="badge bg-success">5</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">Nouveau leads</span>
                    <span className="badge bg-primary">8</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="mb-2">TOP DEALS</h5>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item px-0 py-2 d-flex justify-content-between">
                      <small>Contrat ENKI</small>
                      <small className="text-success fw-bold">€280K</small>
                    </div>
                    <div className="list-group-item px-0 py-2 d-flex justify-content-between">
                      <small>Projet TAKEOUT</small>
                      <small className="text-warning fw-bold">€150K</small>
                    </div>
                    <div className="list-group-item px-0 py-2 d-flex justify-content-between">
                      <small>Migration LEXAIA</small>
                      <small className="text-primary fw-bold">€95K</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bloc 2.2: Marketing & Acquisition */}
            <div className="card" style={{ height: 'calc(50% - 50px)' }}>
              <div className="card-header">
                <h3 className="card-title">📊 Marketing & Acquisition</h3>
              </div>
              <div className="card-body" style={{ overflowY: 'auto' }}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Visiteurs cette semaine</span>
                    <span className="h3 mb-0">1,847</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Nouveaux leads</span>
                    <span>127</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Taux conversion</span>
                    <span className="badge bg-success">6.9%</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">Campagnes actives</span>
                    <span>5</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="mb-2">CANAUX ACQUISITION</h5>
                  <div className="vstack gap-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <small>SEO Organique</small>
                      <small className="text-success">42%</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small>LinkedIn Ads</small>
                      <small className="text-primary">28%</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small>Referral</small>
                      <small className="text-warning">18%</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small>Direct</small>
                      <small className="text-secondary">12%</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* COLONNE 3: FINANCES - Large */}
          <div className="col-12 col-md-4 col-lg-3">
            {/* Titre de colonne */}
            <div className="mb-3" style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <h4 className="text-uppercase text-muted mb-0" style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                💰 FINANCES
              </h4>
            </div>
            
            {/* Bloc 3.1: Trésorerie & Cash */}
            <div className="card mb-3" style={{ height: 'calc(50% - 50px)' }}>
              <div className="card-header">
                <h3 className="card-title">💵 Trésorerie & Cash</h3>
              </div>
              <div className="card-body" style={{ overflowY: 'auto' }}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Cash disponible</span>
                    <span className="h3 mb-0">€847K</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Runway</span>
                    <span>7.3 mois</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Burn rate mensuel</span>
                    <span className="text-danger">€116K/mois</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">Prévision 3 mois</span>
                    <span className="text-success">€2.1M</span>
                  </div>
                </div>
                <div className="mt-3">
                  <h6 className="text-muted small mb-2">CASH FLOW 7 JOURS</h6>
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="entrees" stackId="1" stroke="#2fb344" fill="#2fb344" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="sorties" stackId="1" stroke="#d63939" fill="#d63939" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Bloc 3.2: Factures & Paiements */}
            <div className="card" style={{ height: 'calc(50% - 50px)' }}>
              <div className="card-header">
                <h3 className="card-title">📄 Factures & Paiements</h3>
              </div>
              <div className="card-body" style={{ overflowY: 'auto' }}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Factures impayées</span>
                    <span>12 - €45K</span>
                  </div>
                  <div className="ps-3 mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-danger">{'> 30 jours'}</small>
                      <small className="text-danger">3 - €18K</small>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">À émettre cette semaine</span>
                    <span>8</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">Paiements en attente</span>
                    <span className="h4 mb-0">€127K</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="mb-2">ACTIONS REQUISES</h5>
                  <div className="d-grid gap-2">
                    <button className="btn btn-sm btn-primary">Relancer factures</button>
                    <button className="btn btn-sm btn-outline-primary">Émettre factures</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* COLONNE 4: INDICATEURS CLÉS - Étroite avec blocs carrés */}
          <div className="col-12 col-md-12 col-lg-3">
            {/* Titre de colonne */}
            <div className="mb-3" style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <h4 className="text-uppercase text-muted mb-0" style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                🎯 INDICATEURS CLÉS
              </h4>
            </div>
            
            {/* Container pour les KPIs carrés */}
            <div className="d-flex flex-column gap-2" style={{ height: 'calc(100% - 55px)' }}>
              
              {/* KPI 1: Runway - Bloc carré */}
              <div className="card" style={{ aspectRatio: '1/1', width: '100%' }}>
                <div className="card-body p-2 d-flex flex-column justify-content-center align-items-center text-center">
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>RUNWAY</div>
                  <div className="h2 mb-0">7.3m</div>
                  <div className="text-success" style={{ fontSize: '0.7rem' }}>↑ +1.2</div>
                </div>
              </div>
              
              {/* KPI 2: ARR - Bloc carré */}
              <div className="card" style={{ aspectRatio: '1/1', width: '100%' }}>
                <div className="card-body p-2 d-flex flex-column justify-content-center align-items-center text-center">
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>ARR</div>
                  <div className="h2 mb-0">€2.4M</div>
                  <div className="text-success" style={{ fontSize: '0.7rem' }}>↑ 23%</div>
                </div>
              </div>
              
              {/* KPI 3: EBITDA - Bloc carré */}
              <div className="card" style={{ aspectRatio: '1/1', width: '100%' }}>
                <div className="card-body p-2 d-flex flex-column justify-content-center align-items-center text-center">
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>EBITDA</div>
                  <div className="h2 mb-0">18.5%</div>
                  <div className="text-success" style={{ fontSize: '0.7rem' }}>↑ 2.3%</div>
                </div>
              </div>
              
              {/* KPI 4: LTV:CAC - Bloc carré */}
              <div className="card" style={{ aspectRatio: '1/1', width: '100%' }}>
                <div className="card-body p-2 d-flex flex-column justify-content-center align-items-center text-center">
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>LTV:CAC</div>
                  <div className="h2 mb-0">4.2:1</div>
                  <div className="text-success" style={{ fontSize: '0.7rem' }}>Good</div>
                </div>
              </div>
              
              {/* KPI 5: NPS - Bloc carré */}
              <div className="card" style={{ aspectRatio: '1/1', width: '100%' }}>
                <div className="card-body p-2 d-flex flex-column justify-content-center align-items-center text-center">
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>NPS</div>
                  <div className="h2 mb-0">72</div>
                  <div className="text-success" style={{ fontSize: '0.7rem' }}>Excel</div>
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
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        @media (min-width: 992px) {
          .row > div {
            min-height: 750px;
          }
        }
      `}</style>
    </div>
  )
}

export default SuperAdminDashboard
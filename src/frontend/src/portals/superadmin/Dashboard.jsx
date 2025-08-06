import React from 'react'
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts'

const SuperAdminDashboard = ({ selectedCompany }) => {
  // Données pour les graphiques
  const cashFlowData = [
    { day: 'Lun', entrees: 45, sorties: 32 },
    { day: 'Mar', entrees: 52, sorties: 28 },
    { day: 'Mer', entrees: 38, sorties: 35 },
    { day: 'Jeu', entrees: 65, sorties: 40 },
    { day: 'Ven', entrees: 48, sorties: 38 },
    { day: 'Sam', entrees: 25, sorties: 20 },
    { day: 'Dim', entrees: 15, sorties: 12 }
  ]

  const sparklineData = {
    cashRunway: [7.5, 7.4, 7.3, 7.2, 7.3, 7.3, 7.3],
    arr: [2.2, 2.3, 2.3, 2.4, 2.4, 2.4, 2.4],
    ebitda: [17.2, 17.5, 17.8, 18.0, 18.2, 18.5, 18.5],
    ltv: [3.8, 3.9, 4.0, 4.1, 4.1, 4.2, 4.2],
    nps: [68, 69, 70, 71, 71, 72, 72]
  }

  // Composant Sparkline réutilisable
  const Sparkline = ({ data, color }) => (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data.map((value, index) => ({ value, index }))}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <>
      {/* BLOC ALERTES EN HAUT */}
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="card-title mb-3">📢 Alertes & Actions Prioritaires</h3>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="alert alert-danger d-flex align-items-center mb-0">
                  <div className="flex-fill">
                    <h4 className="alert-title">3 actions urgentes</h4>
                    <div className="text-secondary">À faire aujourd'hui</div>
                  </div>
                  <div className="h1 mb-0 ms-3">3</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="alert alert-warning d-flex align-items-center mb-0">
                  <div className="flex-fill">
                    <h4 className="alert-title">5 deadlines cette semaine</h4>
                    <div className="text-secondary">2 projets critiques</div>
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

        {/* GRILLE 4 COLONNES */}
        <div className="row g-3">
          {/* Colonne 1 : Opérationnel */}
          <div className="col-lg-3">
            {/* Bloc 1 : Tâches & Actions */}
            <div className="card mb-3">
              <div className="card-body">
                <h4 className="card-title">📋 Tâches & Actions</h4>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Tâches totales actives</span>
                    <span className="h3 mb-0">47</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Cette semaine</span>
                    <span className="h4 mb-0">14</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">En retard</span>
                    <span className="badge bg-danger">3</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">À faire aujourd'hui</span>
                    <span className="h4 mb-0">5</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="mb-2">TOP 3 PRIORITÉS</h5>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item px-0 py-2">
                      <small>1. Valider devis LEXAIA</small>
                    </div>
                    <div className="list-group-item px-0 py-2">
                      <small>2. Call client ENKI</small>
                    </div>
                    <div className="list-group-item px-0 py-2">
                      <small>3. Review code PR #234</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloc 2 : Projets & Deliverables */}
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">📁 Projets & Deliverables</h4>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Projets actifs</span>
                    <span className="h3 mb-0">8</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">En cours</span>
                    <span className="badge bg-blue">5</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">En attente</span>
                    <span className="badge bg-orange">3</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">Livraisons cette semaine</span>
                    <span className="h4 mb-0">2</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="mb-2">PROCHAINS JALONS</h5>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item px-0 py-2">
                      <small>Ven: Livraison App Mobile</small>
                    </div>
                    <div className="list-group-item px-0 py-2">
                      <small>Lun: Demo client HYPERVISUAL</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne 2 : Commercial & Marketing */}
          <div className="col-lg-3">
            {/* Bloc 1 : Pipeline Commercial */}
            <div className="card mb-3">
              <div className="card-body">
                <h4 className="card-title">🎯 Pipeline Commercial</h4>
                <div className="h2 mb-3">€1.2M <small className="text-secondary">en gros</small></div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">24 opportunités actives</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Devis actifs</span>
                    <span>7 - €340K</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Taux conversion</span>
                    <span className="text-success">32% ↑</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">Closing prévu ce mois</span>
                    <span className="h4 mb-0">€450K</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="mb-2">HOT LEADS</h5>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item px-0 py-2">
                      <small>TechCorp - €125K - 80%</small>
                    </div>
                    <div className="list-group-item px-0 py-2">
                      <small>StartupXYZ - €85K - 60%</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloc 2 : Marketing & Acquisition */}
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">📊 Marketing & Acquisition</h4>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Visiteurs aujourd'hui</span>
                    <span className="h4 mb-0">1,847</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Leads cette semaine</span>
                    <span className="h4 mb-0">124</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Taux conversion</span>
                    <span>6.7%</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">CAC ce mois</span>
                    <span>€320</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="mb-2">TOP SOURCES</h5>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Google Ads</small>
                      <small>45%</small>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-primary" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <small>LinkedIn</small>
                      <small>30%</small>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-info" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <small>Direct</small>
                      <small>25%</small>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-success" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne 3 : Finance & Comptabilité */}
          <div className="col-lg-3">
            {/* Bloc 1 : Trésorerie & Cash */}
            <div className="card mb-3">
              <div className="card-body">
                <h4 className="card-title">💵 Trésorerie & Cash</h4>
                <div className="h2 mb-3">€847K <small className="text-secondary">en gros</small></div>
                <div className="mb-3">
                  <div className="text-secondary mb-1">Cash disponible</div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Entrées prévues (7j)</span>
                    <span className="text-success">+€127K</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Sorties prévues (7j)</span>
                    <span className="text-danger">-€85K</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Burn rate mensuel</span>
                    <span>€115K</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">Runway</span>
                    <span className="badge bg-success">7.3 mois</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="mb-2">CASH FLOW 7 JOURS</h5>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={cashFlowData}>
                      <Area type="monotone" dataKey="entrees" stackId="1" stroke="#2fb344" fill="#2fb344" />
                      <Area type="monotone" dataKey="sorties" stackId="1" stroke="#d63939" fill="#d63939" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <Tooltip />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bloc 2 : Factures & Paiements */}
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">📄 Factures & Paiements</h4>
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

          {/* Colonne 4 : KPI Sidebar */}
          <div className="col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <h4 className="card-title text-center mb-4">MÉTRIQUES CEO</h4>
                
                {/* KPI 1: Cash Runway */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-uppercase small text-secondary">CASH RUNWAY</span>
                    <span className="h3 mb-0">7.3m</span>
                  </div>
                  <Sparkline data={sparklineData.cashRunway} color="#f59f00" />
                </div>

                {/* KPI 2: ARR / MRR */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-uppercase small text-secondary">ARR / MRR</span>
                    <span className="h3 mb-0">€2.4M</span>
                  </div>
                  <Sparkline data={sparklineData.arr} color="#2fb344" />
                </div>

                {/* KPI 3: EBITDA Margin */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-uppercase small text-secondary">EBITDA MARGIN</span>
                    <span className="h3 mb-0">18.5%</span>
                  </div>
                  <Sparkline data={sparklineData.ebitda} color="#206bc4" />
                </div>

                {/* KPI 4: LTV:CAC Ratio */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-uppercase small text-secondary">LTV:CAC RATIO</span>
                    <span className="h3 mb-0">4.2:1</span>
                  </div>
                  <Sparkline data={sparklineData.ltv} color="#ae3ec9" />
                </div>

                {/* KPI 5: NPS Global */}
                <div className="mb-0">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-uppercase small text-secondary">NPS GLOBAL</span>
                    <span className="h3 mb-0">72</span>
                  </div>
                  <Sparkline data={sparklineData.nps} color="#0ca678" />
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}

export default SuperAdminDashboard
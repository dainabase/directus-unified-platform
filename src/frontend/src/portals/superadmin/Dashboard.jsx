import React from 'react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts'

const SuperAdminDashboard = ({ selectedCompany }) => {
  // Données pour les graphiques
  const revenueData = [
    { month: 'Jan', 2024: 45000, 2023: 38000 },
    { month: 'Fév', 2024: 52000, 2023: 42000 },
    { month: 'Mar', 2024: 48000, 2023: 44000 },
    { month: 'Avr', 2024: 61000, 2023: 50000 },
    { month: 'Mai', 2024: 69000, 2023: 55000 },
    { month: 'Jun', 2024: 72000, 2023: 58000 },
  ]

  const projectsData = [
    { month: 'Jan', actifs: 12, terminés: 8, enPause: 2 },
    { month: 'Fév', actifs: 15, terminés: 10, enPause: 3 },
    { month: 'Mar', actifs: 18, terminés: 12, enPause: 4 },
    { month: 'Avr', actifs: 22, terminés: 15, enPause: 5 },
    { month: 'Mai', actifs: 25, terminés: 18, enPause: 6 },
    { month: 'Jun', actifs: 28, terminés: 20, enPause: 7 },
  ]

  const teamData = [
    { name: 'Développement', valeur: 35 },
    { name: 'Design', valeur: 25 },
    { name: 'Marketing', valeur: 20 },
    { name: 'Commercial', valeur: 20 },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  const kpiCards = [
    { label: 'Revenue Total', value: '€357k', change: '+12.5%', trend: 'up' },
    { label: 'Projets Actifs', value: '28', change: '+3', trend: 'up' },
    { label: 'Clients Actifs', value: '156', change: '+8%', trend: 'up' },
    { label: 'Taux Satisfaction', value: '94%', change: '+2%', trend: 'up' },
    { label: 'Temps Moyen', value: '3.2j', change: '-0.5j', trend: 'down' },
  ]

  return (
    <div className="container-fluid">
      {/* Alerte en haut */}
      <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
        <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img">
          <use xlinkHref="#info-fill"/>
        </svg>
        <div>
          <strong>3 nouvelles missions</strong> ont été assignées aujourd'hui. 
          <a href="#" className="alert-link ms-2">Voir les détails →</a>
        </div>
      </div>

      {/* KPI Cards - Ligne de 5 */}
      <div className="row g-3 mb-4">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="col">
            <div className="metric-card">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="text-muted small">{kpi.label}</span>
                <span className={`badge ${kpi.trend === 'up' ? 'bg-success' : 'bg-danger'} small`}>
                  {kpi.change}
                </span>
              </div>
              <h3 className="mb-0">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Colonne principale - 8 colonnes */}
        <div className="col-lg-8">
          {/* Ligne 1: 3 cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card" style={{ minHeight: '380px' }}>
                <div className="card-header">
                  <h5 className="card-title mb-0">Répartition Équipe</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={teamData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="valeur"
                      >
                        {teamData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3">
                    {teamData.map((item, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle me-2" 
                            style={{ width: '10px', height: '10px', backgroundColor: COLORS[index] }}
                          />
                          <span className="small">{item.name}</span>
                        </div>
                        <span className="small fw-bold">{item.valeur}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card" style={{ minHeight: '380px' }}>
                <div className="card-header">
                  <h5 className="card-title mb-0">Projets par Statut</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={projectsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="actifs" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                      <Area type="monotone" dataKey="terminés" stackId="1" stroke="#10b981" fill="#10b981" />
                      <Area type="monotone" dataKey="enPause" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card" style={{ minHeight: '380px' }}>
                <div className="card-header">
                  <h5 className="card-title mb-0">Performance Équipes</h5>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small">Développement</span>
                        <span className="small fw-bold">92%</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div className="progress-bar bg-primary" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small">Design</span>
                        <span className="small fw-bold">88%</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div className="progress-bar bg-success" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small">Marketing</span>
                        <span className="small fw-bold">79%</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div className="progress-bar bg-warning" style={{ width: '79%' }}></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small">Commercial</span>
                        <span className="small fw-bold">95%</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div className="progress-bar bg-info" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ligne 2: 3 cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card" style={{ minHeight: '380px' }}>
                <div className="card-header">
                  <h5 className="card-title mb-0">Tâches Récentes</h5>
                </div>
                <div className="card-body">
                  <div className="list-group list-group-flush">
                    <div className="list-group-item px-0">
                      <div className="d-flex align-items-start">
                        <div className="badge bg-primary rounded-circle p-2 me-3">UI</div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">Refonte Dashboard</h6>
                          <p className="text-muted small mb-0">HYPERVISUAL • En cours</p>
                        </div>
                      </div>
                    </div>
                    <div className="list-group-item px-0">
                      <div className="d-flex align-items-start">
                        <div className="badge bg-success rounded-circle p-2 me-3">API</div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">Intégration Stripe</h6>
                          <p className="text-muted small mb-0">LEXAIA • Terminé</p>
                        </div>
                      </div>
                    </div>
                    <div className="list-group-item px-0">
                      <div className="d-flex align-items-start">
                        <div className="badge bg-warning rounded-circle p-2 me-3">SEO</div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">Optimisation Core Web</h6>
                          <p className="text-muted small mb-0">DAINAMICS • En attente</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card" style={{ minHeight: '380px' }}>
                <div className="card-header">
                  <h5 className="card-title mb-0">Activité Récente</h5>
                </div>
                <div className="card-body">
                  <div className="timeline">
                    <div className="timeline-item mb-3">
                      <div className="d-flex">
                        <div className="timeline-marker bg-primary rounded-circle p-1 me-3"></div>
                        <div>
                          <p className="mb-1">Nouveau client <strong>TechCorp</strong></p>
                          <small className="text-muted">Il y a 2 heures</small>
                        </div>
                      </div>
                    </div>
                    <div className="timeline-item mb-3">
                      <div className="d-flex">
                        <div className="timeline-marker bg-success rounded-circle p-1 me-3"></div>
                        <div>
                          <p className="mb-1">Projet <strong>E-commerce</strong> terminé</p>
                          <small className="text-muted">Il y a 4 heures</small>
                        </div>
                      </div>
                    </div>
                    <div className="timeline-item mb-3">
                      <div className="d-flex">
                        <div className="timeline-marker bg-warning rounded-circle p-1 me-3"></div>
                        <div>
                          <p className="mb-1">Facture #2024-089 payée</p>
                          <small className="text-muted">Il y a 6 heures</small>
                        </div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="d-flex">
                        <div className="timeline-marker bg-info rounded-circle p-1 me-3"></div>
                        <div>
                          <p className="mb-1">5 nouveaux tickets support</p>
                          <small className="text-muted">Il y a 8 heures</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card" style={{ minHeight: '380px' }}>
                <div className="card-header">
                  <h5 className="card-title mb-0">Top Clients</h5>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="mb-0">TechCorp</h6>
                        <small className="text-muted">12 projets</small>
                      </div>
                      <span className="badge bg-primary">€45k</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="mb-0">StartupXYZ</h6>
                        <small className="text-muted">8 projets</small>
                      </div>
                      <span className="badge bg-primary">€32k</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="mb-0">FinanceHub</h6>
                        <small className="text-muted">6 projets</small>
                      </div>
                      <span className="badge bg-primary">€28k</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">MediaGroup</h6>
                        <small className="text-muted">5 projets</small>
                      </div>
                      <span className="badge bg-primary">€22k</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ligne 3: 3 cards */}
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card" style={{ minHeight: '380px' }}>
                <div className="card-header">
                  <h5 className="card-title mb-0">Revenue Mensuel</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="2023" fill="#e5e7eb" />
                      <Bar dataKey="2024" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card" style={{ minHeight: '380px' }}>
                <div className="card-header">
                  <h5 className="card-title mb-0">Prochaines Échéances</h5>
                </div>
                <div className="card-body">
                  <div className="list-group list-group-flush">
                    <div className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Livraison App Mobile</h6>
                          <p className="text-muted small mb-0">Client: TechCorp</p>
                        </div>
                        <span className="badge bg-danger">2 jours</span>
                      </div>
                    </div>
                    <div className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Audit SEO</h6>
                          <p className="text-muted small mb-0">Client: StartupXYZ</p>
                        </div>
                        <span className="badge bg-warning">5 jours</span>
                      </div>
                    </div>
                    <div className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Migration Cloud</h6>
                          <p className="text-muted small mb-0">Client: FinanceHub</p>
                        </div>
                        <span className="badge bg-info">1 semaine</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card" style={{ minHeight: '380px' }}>
                <div className="card-header">
                  <h5 className="card-title mb-0">Ressources</h5>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <h6 className="mb-2">Serveurs</h6>
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="text-center p-3 bg-light rounded">
                          <h4 className="mb-0 text-primary">87%</h4>
                          <small className="text-muted">CPU</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-center p-3 bg-light rounded">
                          <h4 className="mb-0 text-success">64%</h4>
                          <small className="text-muted">RAM</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h6 className="mb-2">Stockage</h6>
                    <div className="progress mb-2" style={{ height: '20px' }}>
                      <div className="progress-bar bg-primary" style={{ width: '72%' }}>72%</div>
                    </div>
                    <small className="text-muted">432 GB / 600 GB utilisés</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne KPI latérale - 4 colonnes */}
        <div className="col-lg-4">
          <div className="card" style={{ minHeight: '100%' }}>
            <div className="card-header">
              <h5 className="card-title mb-0">📊 Métriques Clés</h5>
            </div>
            <div className="card-body">
              {/* Evolution du CA */}
              <div className="mb-4">
                <h6 className="text-muted mb-3">Évolution CA (6 mois)</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="2024" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="2023" stroke="#e5e7eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <hr className="my-4" />

              {/* Métriques détaillées */}
              <div className="space-y-4">
                <div className="metric-group">
                  <h6 className="text-muted mb-3">Finance</h6>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small">MRR</span>
                      <span className="small fw-bold">€68,400</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-success" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small">ARR</span>
                      <span className="small fw-bold">€820,800</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-primary" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>

                <hr />

                <div className="metric-group">
                  <h6 className="text-muted mb-3">Opérations</h6>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small">Tickets Résolus</span>
                      <span className="small fw-bold">94%</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-info" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small">Temps Réponse</span>
                      <span className="small fw-bold">2.3h</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-warning" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>

                <hr />

                <div className="metric-group">
                  <h6 className="text-muted mb-3">Équipe</h6>
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="text-center p-3 bg-light rounded">
                        <h5 className="mb-0">42</h5>
                        <small className="text-muted">Employés</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-3 bg-light rounded">
                        <h5 className="mb-0">18</h5>
                        <small className="text-muted">Freelances</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
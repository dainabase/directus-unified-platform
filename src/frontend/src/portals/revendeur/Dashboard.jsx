import React from 'react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts'

const RevendeurDashboard = ({ selectedCompany }) => {
  // Données pour les graphiques
  const salesData = [
    { jour: 'Lun', ventes: 12, objectif: 15 },
    { jour: 'Mar', ventes: 19, objectif: 15 },
    { jour: 'Mer', ventes: 15, objectif: 15 },
    { jour: 'Jeu', ventes: 22, objectif: 15 },
    { jour: 'Ven', ventes: 28, objectif: 15 },
    { jour: 'Sam', ventes: 34, objectif: 20 },
    { jour: 'Dim', ventes: 18, objectif: 20 },
  ]

  const productsData = [
    { name: 'Pack Starter', value: 35, revenue: 12600 },
    { name: 'Pack Pro', value: 28, revenue: 25200 },
    { name: 'Pack Enterprise', value: 22, revenue: 39600 },
    { name: 'Services', value: 15, revenue: 8100 },
  ]

  const clientsData = [
    { mois: 'Oct', nouveaux: 12, fidèles: 45 },
    { mois: 'Nov', nouveaux: 18, fidèles: 48 },
    { mois: 'Dec', nouveaux: 15, fidèles: 52 },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  const topClients = [
    { name: 'ABC Corp', commandes: 15, ca: '€8,400', evolution: '+12%' },
    { name: 'XYZ Ltd', commandes: 12, ca: '€6,200', evolution: '+8%' },
    { name: 'Tech Solutions', commandes: 10, ca: '€5,100', evolution: '+15%' },
    { name: 'Digital Agency', commandes: 8, ca: '€4,300', evolution: '-2%' },
  ]

  return (
    <div className="container-fluid">
      {/* Métriques principales */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">CA du mois</span>
            <h3 className="mb-0 mt-2">€85,500</h3>
            <small className="text-success">+18% vs objectif</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">Commandes</span>
            <h3 className="mb-0 mt-2">148</h3>
            <small className="text-info">22 cette semaine</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">Panier moyen</span>
            <h3 className="mb-0 mt-2">€577</h3>
            <small className="text-success">+€45 vs mois dernier</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">Stock alerte</span>
            <h3 className="mb-0 mt-2">3</h3>
            <small className="text-danger">Produits à commander</small>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Colonne principale */}
        <div className="col-lg-8">
          {/* Ventes hebdomadaires */}
          <div className="ds-card mb-4">
            <div className="ds-card-header">
              <h5 className="ds-card-title mb-0">Ventes vs Objectifs (Cette semaine)</h5>
            </div>
            <div className="ds-card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="jour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ventes" fill="#3b82f6" name="Ventes réelles" />
                  <Bar dataKey="objectif" fill="#e5e7eb" name="Objectif" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ligne de cartes */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="ds-card">
                <div className="ds-card-header">
                  <h5 className="ds-card-title mb-0">Répartition CA par Produit</h5>
                </div>
                <div className="ds-card-body">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={productsData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {productsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3">
                    {productsData.map((item, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle me-2" 
                            style={{ width: '10px', height: '10px', backgroundColor: COLORS[index] }}
                          />
                          <span className="small">{item.name}</span>
                        </div>
                        <span className="small fw-bold">€{item.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="ds-card">
                <div className="ds-card-header">
                  <h5 className="ds-card-title mb-0">Évolution Clients</h5>
                </div>
                <div className="ds-card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={clientsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="nouveaux" stroke="#3b82f6" name="Nouveaux" strokeWidth={2} />
                      <Line type="monotone" dataKey="fidèles" stroke="#10b981" name="Fidèles" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Top clients */}
          <div className="ds-card">
            <div className="ds-card-header">
              <h5 className="ds-card-title mb-0">Top Clients</h5>
            </div>
            <div className="ds-card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Commandes</th>
                      <th>CA Total</th>
                      <th>Évolution</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClients.map((client, index) => (
                      <tr key={index}>
                        <td className="fw-bold">{client.name}</td>
                        <td>{client.commandes}</td>
                        <td>{client.ca}</td>
                        <td>
                          <span className={`badge ${client.evolution.startsWith('+') ? 'bg-success' : 'bg-danger'}`}>
                            {client.evolution}
                          </span>
                        </td>
                        <td>
                          <button className="ds-btn ds-btn-sm ds-btn-outline-primary">Détails</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="col-lg-4">
          {/* Alertes stock */}
          <div className="ds-card mb-4">
            <div className="ds-card-header bg-danger text-white">
              <h5 className="ds-card-title mb-0">⚠️ Alertes Stock</h5>
            </div>
            <div className="ds-card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">Pack Starter</h6>
                      <small className="text-danger">Stock: 3 unités</small>
                    </div>
                    <button className="ds-btn ds-btn-sm ds-btn-danger">Commander</button>
                  </div>
                </div>
                <div className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">Support Premium</h6>
                      <small className="text-warning">Stock: 8 unités</small>
                    </div>
                    <button className="ds-btn ds-btn-sm ds-btn-warning">Commander</button>
                  </div>
                </div>
                <div className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">Formation Basic</h6>
                      <small className="text-danger">Stock: 2 unités</small>
                    </div>
                    <button className="ds-btn ds-btn-sm ds-btn-danger">Commander</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commandes récentes */}
          <div className="ds-card mb-4">
            <div className="ds-card-header">
              <h5 className="ds-card-title mb-0">Dernières Commandes</h5>
            </div>
            <div className="ds-card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">#CMD-2024-148</h6>
                      <p className="text-muted small mb-0">ABC Corp • Pack Pro</p>
                    </div>
                    <span className="badge bg-success">€900</span>
                  </div>
                </div>
                <div className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">#CMD-2024-147</h6>
                      <p className="text-muted small mb-0">XYZ Ltd • Pack Starter</p>
                    </div>
                    <span className="badge bg-primary">€360</span>
                  </div>
                </div>
                <div className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">#CMD-2024-146</h6>
                      <p className="text-muted small mb-0">Tech Solutions • Services</p>
                    </div>
                    <span className="badge bg-info">€540</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Objectifs du mois */}
          <div className="ds-card">
            <div className="ds-card-header">
              <h5 className="ds-card-title mb-0">Objectifs Décembre</h5>
            </div>
            <div className="ds-card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>CA Mensuel</span>
                  <span className="fw-bold">118%</span>
                </div>
                <div className="progress" style={{ height: '10px' }}>
                  <div className="progress-bar bg-success" style={{ width: '100%' }}></div>
                </div>
                <small className="text-muted">€85,500 / €72,000</small>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Nouveaux Clients</span>
                  <span className="fw-bold">75%</span>
                </div>
                <div className="progress" style={{ height: '10px' }}>
                  <div className="progress-bar bg-warning" style={{ width: '75%' }}></div>
                </div>
                <small className="text-muted">15 / 20</small>
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Taux Conversion</span>
                  <span className="fw-bold">92%</span>
                </div>
                <div className="progress" style={{ height: '10px' }}>
                  <div className="progress-bar bg-primary" style={{ width: '92%' }}></div>
                </div>
                <small className="text-muted">4.6% / 5%</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevendeurDashboard
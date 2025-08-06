import React from 'react'
import { 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts'

const PrestataireDashboard = ({ selectedCompany }) => {
  // Données pour les graphiques
  const missionsData = [
    { mois: 'Oct', heures: 120 },
    { mois: 'Nov', heures: 145 },
    { mois: 'Dec', heures: 138 },
  ]

  const projectsDistribution = [
    { name: 'Développement', value: 45 },
    { name: 'Design', value: 30 },
    { name: 'Conseil', value: 25 },
  ]

  const earningsData = [
    { mois: 'Oct', montant: 4800 },
    { mois: 'Nov', montant: 5800 },
    { mois: 'Dec', montant: 5520 },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b']

  const activeMissions = [
    { client: 'TechCorp', projet: 'API Integration', deadline: '15/12', heures: 32, status: 'En cours' },
    { client: 'StartupXYZ', projet: 'UI Redesign', deadline: '20/12', heures: 24, status: 'En cours' },
    { client: 'FinanceHub', projet: 'Security Audit', deadline: '18/12', heures: 16, status: 'En attente' },
  ]

  return (
    <div className="container-fluid">
      {/* Résumé du mois */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">Heures ce mois</span>
            <h3 className="mb-0 mt-2">138h</h3>
            <small className="text-success">+12% vs mois dernier</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">Revenus estimés</span>
            <h3 className="mb-0 mt-2">€5,520</h3>
            <small className="text-info">€40/heure</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">Missions actives</span>
            <h3 className="mb-0 mt-2">3</h3>
            <small className="text-warning">2 urgentes</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">Note moyenne</span>
            <h3 className="mb-0 mt-2">4.8/5</h3>
            <small className="text-success">⭐⭐⭐⭐⭐</small>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Missions actives */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Missions Actives</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Projet</th>
                      <th>Échéance</th>
                      <th>Heures</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeMissions.map((mission, index) => (
                      <tr key={index}>
                        <td className="fw-bold">{mission.client}</td>
                        <td>{mission.projet}</td>
                        <td>{mission.deadline}</td>
                        <td>{mission.heures}h</td>
                        <td>
                          <span className={`badge ${mission.status === 'En cours' ? 'bg-primary' : 'bg-warning'}`}>
                            {mission.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary">Détails</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Heures Travaillées</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={missionsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="heures" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Répartition Activités</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={projectsDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {projectsDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="d-flex justify-content-around mt-3">
                    {projectsDistribution.map((item, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="rounded-circle mx-auto mb-1" 
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: COLORS[index] 
                          }}
                        />
                        <small>{item.name}</small>
                        <p className="mb-0 fw-bold">{item.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="col-lg-4">
          {/* Revenus */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Évolution Revenus</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="montant" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Q4</span>
                  <span className="fw-bold">€16,120</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Moyenne/mois</span>
                  <span className="fw-bold">€5,373</span>
                </div>
              </div>
            </div>
          </div>

          {/* Planning */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Planning Semaine</h5>
            </div>
            <div className="card-body">
              <div className="planning-week">
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <strong>Lun</strong>
                    <small className="d-block text-muted">11/12</small>
                  </div>
                  <div className="flex-grow-1">
                    <div className="badge bg-primary w-100 p-2">TechCorp - 8h</div>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <strong>Mar</strong>
                    <small className="d-block text-muted">12/12</small>
                  </div>
                  <div className="flex-grow-1">
                    <div className="badge bg-success w-100 p-2">StartupXYZ - 6h</div>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <strong>Mer</strong>
                    <small className="d-block text-muted">13/12</small>
                  </div>
                  <div className="flex-grow-1">
                    <div className="badge bg-warning w-100 p-2">FinanceHub - 4h</div>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <strong>Jeu</strong>
                    <small className="d-block text-muted">14/12</small>
                  </div>
                  <div className="flex-grow-1">
                    <div className="badge bg-primary w-100 p-2">TechCorp - 8h</div>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <strong>Ven</strong>
                    <small className="d-block text-muted">15/12</small>
                  </div>
                  <div className="flex-grow-1">
                    <div className="badge bg-info w-100 p-2">Disponible</div>
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

export default PrestataireDashboard
import React from 'react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts'

const ClientDashboard = ({ selectedCompany }) => {
  // Données pour les graphiques
  const projectProgress = [
    { name: 'Site Web', progress: 85, deadline: '15 Dec' },
    { name: 'App Mobile', progress: 60, deadline: '22 Dec' },
    { name: 'API REST', progress: 92, deadline: '10 Dec' },
  ]

  const invoicesData = [
    { month: 'Août', montant: 5400 },
    { month: 'Sept', montant: 6200 },
    { month: 'Oct', montant: 5800 },
    { month: 'Nov', montant: 7100 },
    { month: 'Dec', montant: 6900 },
  ]

  const tasksData = [
    { jour: 'Lun', complétées: 5, total: 8 },
    { jour: 'Mar', complétées: 7, total: 10 },
    { jour: 'Mer', complétées: 6, total: 8 },
    { jour: 'Jeu', complétées: 9, total: 12 },
    { jour: 'Ven', complétées: 8, total: 9 },
  ]

  return (
    <div className="container-fluid">
      {/* Message de bienvenue */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h4 className="mb-2">Bienvenue dans votre espace client</h4>
              <p className="mb-0">Suivez l'avancement de vos projets et gérez vos documents en temps réel.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">Projets Actifs</span>
            <h3 className="mb-0 mt-2">3</h3>
            <small className="text-success">Tous en cours</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">Factures en Attente</span>
            <h3 className="mb-0 mt-2">€2,400</h3>
            <small className="text-warning">1 facture</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">Tickets Support</span>
            <h3 className="mb-0 mt-2">2</h3>
            <small className="text-info">En traitement</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card">
            <span className="text-muted small">Prochaine Échéance</span>
            <h3 className="mb-0 mt-2">5 jours</h3>
            <small className="text-danger">App Mobile</small>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Colonne principale */}
        <div className="col-lg-8">
          {/* Projets en cours */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Mes Projets</h5>
            </div>
            <div className="card-body">
              {projectProgress.map((project, index) => (
                <div key={index} className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <h6 className="mb-0">{project.name}</h6>
                      <small className="text-muted">Échéance: {project.deadline}</small>
                    </div>
                    <span className="fw-bold">{project.progress}%</span>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar bg-primary" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Graphiques */}
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Historique Factures</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={invoicesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="montant" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Tâches Complétées</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={tasksData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="jour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="complétées" fill="#10b981" />
                      <Bar dataKey="total" fill="#e5e7eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="col-lg-4">
          {/* Messages récents */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Messages Récents</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item px-0">
                  <div className="d-flex align-items-start">
                    <div className="avatar bg-primary text-white rounded-circle p-2 me-3">JD</div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">Jean Dupont</h6>
                      <p className="text-muted small mb-0">La maquette est prête pour validation</p>
                      <small className="text-muted">Il y a 2 heures</small>
                    </div>
                  </div>
                </div>
                <div className="list-group-item px-0">
                  <div className="d-flex align-items-start">
                    <div className="avatar bg-success text-white rounded-circle p-2 me-3">ML</div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">Marie Laurent</h6>
                      <p className="text-muted small mb-0">Réunion de suivi prévue demain</p>
                      <small className="text-muted">Il y a 5 heures</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents récents */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Documents Récents</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <a href="#" className="list-group-item list-group-item-action px-0">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-danger me-3">PDF</span>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">Contrat_Service_2024.pdf</h6>
                      <small className="text-muted">Ajouté le 01/12/2024</small>
                    </div>
                  </div>
                </a>
                <a href="#" className="list-group-item list-group-item-action px-0">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-3">DOC</span>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">Cahier_Charges_App.docx</h6>
                      <small className="text-muted">Ajouté le 28/11/2024</small>
                    </div>
                  </div>
                </a>
                <a href="#" className="list-group-item list-group-item-action px-0">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-success me-3">XLS</span>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">Budget_Previsionnel.xlsx</h6>
                      <small className="text-muted">Ajouté le 25/11/2024</small>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard
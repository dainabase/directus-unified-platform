import React, { useEffect } from 'react'
import ApexCharts from 'apexcharts'

const SuperAdminDashboard = ({ selectedCompany }) => {
  // Initialisation des graphiques ApexCharts
  useEffect(() => {
    // Configuration des sparklines
    const sparklineOptions = {
      chart: {
        type: 'area',
        sparkline: { enabled: true },
        height: 35
      },
      stroke: { curve: 'smooth', width: 2 },
      fill: { opacity: 0.2 },
      tooltip: { enabled: false }
    }
    
    // Sparkline 1: Cash Runway
    const chart1 = new ApexCharts(document.querySelector("#metric-spark1"), {
      ...sparklineOptions,
      series: [{ data: [6.1, 5.8, 6.2, 6.5, 6.8, 7.1, 7.3] }],
      colors: ['#2fb344']
    })
    chart1.render()
    
    // Sparkline 2: ARR/MRR
    const chart2 = new ApexCharts(document.querySelector("#metric-spark2"), {
      ...sparklineOptions,
      series: [{ data: [1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4] }],
      colors: ['#206bc4']
    })
    chart2.render()
    
    // Sparkline 3: EBITDA
    const chart3 = new ApexCharts(document.querySelector("#metric-spark3"), {
      ...sparklineOptions,
      series: [{ data: [15.2, 16.1, 16.8, 17.3, 17.8, 18.1, 18.5] }],
      colors: ['#5eba00']
    })
    chart3.render()
    
    // Sparkline 4: LTV:CAC
    const chart4 = new ApexCharts(document.querySelector("#metric-spark4"), {
      ...sparklineOptions,
      series: [{ data: [3.1, 3.4, 3.6, 3.8, 4.0, 4.1, 4.2] }],
      colors: ['#206bc4']
    })
    chart4.render()
    
    // Sparkline 5: NPS
    const chart5 = new ApexCharts(document.querySelector("#metric-spark5"), {
      ...sparklineOptions,
      series: [{ data: [65, 67, 68, 69, 70, 71, 72] }],
      colors: ['#fab005']
    })
    chart5.render()
    
    // Cleanup
    return () => {
      chart1.destroy()
      chart2.destroy()
      chart3.destroy()
      chart4.destroy()
      chart5.destroy()
    }
  }, [])

  return (
    <div className="page-body">
      <div className="container-xl">
        {/* Header avec sélecteur entreprise */}
        <div className="page-header d-print-none mb-4">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">Dashboard Executive</div>
              <h2 className="page-title">Vue Consolidée - {selectedCompany || 'Groupe'}</h2>
            </div>
            <div className="col-auto ms-auto">
              <select className="form-select" value={selectedCompany} onChange={(e) => console.log(e.target.value)}>
                <option value="">📊 Vue Consolidée</option>
                <option value="HYPERVISUAL">HYPERVISUAL</option>
                <option value="DAINAMICS">DAINAMICS</option>
                <option value="LEXAIA">LEXAIA</option>
                <option value="ENKI REALTY">ENKI REALTY</option>
                <option value="TAKEOUT">TAKEOUT</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* LIGNE 1 : 5 MÉTRIQUES CEO STRATÉGIQUES */}
        <div className="card mb-3">
          <div className="card-body p-3">
            <div className="row g-3">
              {/* Métrique 1: Cash Runway */}
              <div className="col">
                <div className="text-muted small text-uppercase" style={{ fontSize: '11px', fontWeight: 600 }}>
                  Cash Runway
                </div>
                <div className="display-6">7.3 mois</div>
                <div className="text-success small">
                  <span className="ti ti-trending-up"></span> +1.2 mois
                </div>
                <div id="metric-spark1" style={{ height: '35px', marginTop: '10px' }}></div>
              </div>
              
              {/* Métrique 2: ARR/MRR */}
              <div className="col">
                <div className="text-muted small text-uppercase" style={{ fontSize: '11px', fontWeight: 600 }}>
                  ARR / MRR
                </div>
                <div className="display-6">€2.4M</div>
                <div className="text-success small">
                  <span className="ti ti-trending-up"></span> +23% YoY
                </div>
                <div id="metric-spark2" style={{ height: '35px', marginTop: '10px' }}></div>
              </div>
              
              {/* Métrique 3: EBITDA Margin */}
              <div className="col">
                <div className="text-muted small text-uppercase" style={{ fontSize: '11px', fontWeight: 600 }}>
                  EBITDA Margin
                </div>
                <div className="display-6">18.5%</div>
                <div className="text-success small">
                  <span className="ti ti-trending-up"></span> Target: 20%
                </div>
                <div id="metric-spark3" style={{ height: '35px', marginTop: '10px' }}></div>
              </div>
              
              {/* Métrique 4: LTV:CAC Ratio */}
              <div className="col">
                <div className="text-muted small text-uppercase" style={{ fontSize: '11px', fontWeight: 600 }}>
                  LTV:CAC Ratio
                </div>
                <div className="display-6">4.2:1</div>
                <div className="text-success small">
                  <span className="badge bg-success">Healthy</span>
                </div>
                <div id="metric-spark4" style={{ height: '35px', marginTop: '10px' }}></div>
              </div>
              
              {/* Métrique 5: NPS Global */}
              <div className="col">
                <div className="text-muted small text-uppercase" style={{ fontSize: '11px', fontWeight: 600 }}>
                  NPS Global
                </div>
                <div className="display-6">72</div>
                <div className="text-success small">
                  <span className="badge bg-success">Excellent</span>
                </div>
                <div id="metric-spark5" style={{ height: '35px', marginTop: '10px' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* LIGNE 2 : 6 BLOCS OPÉRATIONNELS (Grille 3x2) */}
        <div className="row g-3">
          {/* Bloc 1: Finance & Trésorerie */}
          <div className="col-lg-4 col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">💰 Finance & Trésorerie</h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="text-muted small">Cash Disponible</div>
                  <div className="h2 mb-0">€847K</div>
                </div>
                <div className="divide-y">
                  <div className="row py-2">
                    <div className="col">Factures Impayées</div>
                    <div className="col-auto">
                      <span className="badge bg-orange">12</span> €45K
                    </div>
                  </div>
                  <div className="row py-2">
                    <div className="col">Paiements en Attente</div>
                    <div className="col-auto">
                      <span className="badge bg-blue">8</span> €127K
                    </div>
                  </div>
                  <div className="row py-2">
                    <div className="col">CA du Mois vs Objectif</div>
                    <div className="col-auto">
                      <span className="text-success">108%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bloc 2: Tâches & Opérationnel */}
          <div className="col-lg-4 col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📋 Tâches & Opérationnel</h3>
              </div>
              <div className="card-body">
                <div className="divide-y">
                  <div className="row py-2">
                    <div className="col">Tâches Aujourd'hui</div>
                    <div className="col-auto">
                      <span className="badge bg-primary">5</span>
                    </div>
                  </div>
                  <div className="row py-2">
                    <div className="col">Tâches en Retard</div>
                    <div className="col-auto">
                      <span className="badge bg-red">3</span>
                    </div>
                  </div>
                  <div className="row py-2">
                    <div className="col">Projets Actifs</div>
                    <div className="col-auto">
                      <span className="badge bg-blue">8</span>
                    </div>
                  </div>
                  <div className="row py-2">
                    <div className="col">Actions Urgentes</div>
                    <div className="col-auto">
                      <span className="badge bg-orange">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bloc 3: Commercial & Ventes */}
          <div className="col-lg-4 col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🎯 Commercial & Ventes</h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="text-muted small">Pipeline Total</div>
                  <div className="h2 mb-0">€1.2M <span className="text-muted small">24 opps</span></div>
                </div>
                <div className="divide-y">
                  <div className="row py-2">
                    <div className="col">Devis Actifs</div>
                    <div className="col-auto">
                      <span className="badge bg-blue">7</span> €340K
                    </div>
                  </div>
                  <div className="row py-2">
                    <div className="col">Taux Conversion</div>
                    <div className="col-auto">
                      <span className="badge bg-green">32% ↑</span>
                    </div>
                  </div>
                  <div className="row py-2">
                    <div className="col">RDV Semaine</div>
                    <div className="col-auto">
                      <span className="badge bg-primary">12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bloc 4: Marketing & Trafic */}
          <div className="col-lg-4 col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📊 Marketing & Trafic</h3>
              </div>
              <div className="card-body">
                <div className="divide-y">
                  <div className="row py-2">
                    <div className="col">Visiteurs Aujourd'hui</div>
                    <div className="col-auto">1,847</div>
                  </div>
                  <div className="row py-2">
                    <div className="col">Leads Semaine</div>
                    <div className="col-auto">
                      <span className="badge bg-green">124</span>
                    </div>
                  </div>
                  <div className="row py-2">
                    <div className="col">Conversion Web %</div>
                    <div className="col-auto">6.7%</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-muted small mb-2">Top Sources</div>
                  <div className="progress mb-2">
                    <div className="progress-bar bg-primary" style={{ width: '45%' }} role="progressbar">
                      <span>Google 45%</span>
                    </div>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-azure" style={{ width: '30%' }} role="progressbar">
                      <span>Direct 30%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bloc 5: Performance Entreprises */}
          <div className="col-lg-4 col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🏢 Performance Entreprises</h3>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Entreprise</th>
                        <th>CA Mois</th>
                        <th>Marge</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>HYPERVISUAL</td>
                        <td>€125K</td>
                        <td><span className="badge bg-green">22%</span></td>
                      </tr>
                      <tr>
                        <td>DAINAMICS</td>
                        <td>€215K</td>
                        <td><span className="badge bg-green">28%</span></td>
                      </tr>
                      <tr>
                        <td>LEXAIA</td>
                        <td>€87K</td>
                        <td><span className="badge bg-orange">15%</span></td>
                      </tr>
                      <tr>
                        <td>ENKI REALTY</td>
                        <td>€156K</td>
                        <td><span className="badge bg-green">19%</span></td>
                      </tr>
                      <tr>
                        <td>TAKEOUT</td>
                        <td>€92K</td>
                        <td><span className="badge bg-red">8%</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bloc 6: Alertes & Actions */}
          <div className="col-lg-4 col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">⚡ Alertes & Actions</h3>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <div className="list-group-item px-0">
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <span className="badge bg-red">URGENT</span>
                      </div>
                      <div className="col">
                        Relancer BNP Paribas
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item px-0">
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <span className="badge bg-orange">MOYEN</span>
                      </div>
                      <div className="col">
                        Valider devis X
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item px-0">
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <span className="badge bg-blue">INFO</span>
                      </div>
                      <div className="col">
                        Board meeting vendredi
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 d-grid gap-2">
                  <button className="btn btn-primary btn-sm">Nouvelle Action</button>
                  <button className="btn btn-outline-primary btn-sm">Voir Toutes</button>
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

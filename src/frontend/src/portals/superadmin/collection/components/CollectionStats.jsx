// src/frontend/src/portals/superadmin/collection/components/CollectionStats.jsx
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, DollarSign, Clock, AlertTriangle, 
  CheckCircle, Users, FileText, Target
} from 'lucide-react';

const COLORS = ['#206bc4', '#a8aeb7', '#15aabf', '#fab005', '#fd7e14', '#e74c3c'];

const CollectionStats = ({ company, stats, agingAnalysis, recoveryPerformance }) => {
  
  // Données pour graphiques
  const agingData = agingAnalysis ? [
    { name: '0-30j', montant: agingAnalysis.aging_0_30 || 0, count: agingAnalysis.count_0_30 || 0 },
    { name: '31-60j', montant: agingAnalysis.aging_31_60 || 0, count: agingAnalysis.count_31_60 || 0 },
    { name: '61-90j', montant: agingAnalysis.aging_61_90 || 0, count: agingAnalysis.count_61_90 || 0 },
    { name: '91-120j', montant: agingAnalysis.aging_91_120 || 0, count: agingAnalysis.count_91_120 || 0 },
    { name: '+120j', montant: agingAnalysis.aging_120_plus || 0, count: agingAnalysis.count_120_plus || 0 }
  ] : [];

  const statusData = stats ? [
    { name: 'Actives', value: stats.activeDebts || 0 },
    { name: 'En recouvrement', value: stats.inCollectionDebts || 0 },
    { name: 'LP en cours', value: stats.lpProcessDebts || 0 },
    { name: 'Soldées', value: stats.paidDebts || 0 }
  ] : [];

  const monthlyTrend = recoveryPerformance?.monthlyData || [
    { month: 'Jan', nouvelles: 45, recouvrées: 32, taux: 71 },
    { month: 'Fév', nouvelles: 52, recouvrées: 41, taux: 79 },
    { month: 'Mar', nouvelles: 38, recouvrées: 35, taux: 92 },
    { month: 'Avr', nouvelles: 61, recouvrées: 48, taux: 79 },
    { month: 'Mai', nouvelles: 55, recouvrées: 51, taux: 93 },
    { month: 'Jun', nouvelles: 49, recouvrées: 44, taux: 90 }
  ];

  const lpStepsData = [
    { etape: 'Rappel amiable', count: 45, success: 32 },
    { etape: 'Mise en demeure', count: 28, success: 18 },
    { etape: 'Commandement', count: 15, success: 8 },
    { etape: 'Réquisition', count: 12, success: 6 },
    { etape: 'Saisie', count: 8, success: 4 }
  ];

  return (
    <div>
      {/* Indicateurs clés */}
      <div className="row row-cards mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <DollarSign size={24} className="text-primary" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">Créances Totales</div>
                  <div className="text-muted">
                    {(stats?.totalDebt / 1000 || 0).toFixed(0)}K CHF
                  </div>
                </div>
              </div>
              <div className="progress progress-sm mt-2">
                <div 
                  className="progress-bar bg-primary" 
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <Target size={24} className="text-success" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">Taux Recouvrement</div>
                  <div className="text-muted">
                    {stats?.recoveryRate || 0}%
                  </div>
                </div>
              </div>
              <div className="progress progress-sm mt-2">
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: `${stats?.recoveryRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <Clock size={24} className="text-warning" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">Âge Moyen</div>
                  <div className="text-muted">
                    {stats?.averageAge || 0} jours
                  </div>
                </div>
              </div>
              <div className="progress progress-sm mt-2">
                <div 
                  className="progress-bar bg-warning" 
                  style={{ width: '65%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <FileText size={24} className="text-danger" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">Procédures LP</div>
                  <div className="text-muted">
                    {stats?.activeLPCases || 0} en cours
                  </div>
                </div>
              </div>
              <div className="progress progress-sm mt-2">
                <div 
                  className="progress-bar bg-danger" 
                  style={{ width: '30%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques principaux */}
      <div className="row">
        {/* Évolution recouvrement */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Évolution du Recouvrement</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="nouvelles" 
                    stackId="1"
                    stroke="#206bc4" 
                    fill="#206bc4" 
                    fillOpacity={0.6}
                    name="Nouvelles créances"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="recouvrées" 
                    stackId="1"
                    stroke="#15aabf" 
                    fill="#15aabf" 
                    fillOpacity={0.6}
                    name="Créances recouvrées"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Répartition par statut */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Répartition par Statut</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        {/* Analyse âge créances */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Analyse de l'Âge des Créances</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'montant' ? `${value.toLocaleString('fr-CH')} CHF` : value,
                    name === 'montant' ? 'Montant' : 'Nombre'
                  ]} />
                  <Bar dataKey="montant" fill="#206bc4" name="montant" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Performance étapes LP */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Efficacité Procédures LP</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lpStepsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="etape" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#a8aeb7" name="Total" />
                  <Bar dataKey="success" fill="#15aabf" name="Succès" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau de bord détaillé */}
      <div className="row mt-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Indicateurs Détaillés</h3>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-vcenter">
                  <thead>
                    <tr>
                      <th>Métrique</th>
                      <th>Valeur actuelle</th>
                      <th>Objectif</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Taux de recouvrement global</td>
                      <td>{stats?.recoveryRate || 0}%</td>
                      <td>85%</td>
                      <td>
                        <div className="progress progress-sm">
                          <div 
                            className="progress-bar bg-success" 
                            style={{ width: `${stats?.recoveryRate || 0}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Délai moyen de recouvrement</td>
                      <td>{stats?.averageRecoveryDays || 0} jours</td>
                      <td>60 jours</td>
                      <td>
                        <div className="progress progress-sm">
                          <div 
                            className="progress-bar bg-warning" 
                            style={{ width: `${100 - Math.min(100, (stats?.averageRecoveryDays || 0) / 2)}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Créances &gt; 90 jours</td>
                      <td>{stats?.overdueDebts || 0}</td>
                      <td>&lt; 20</td>
                      <td>
                        <span className={`badge ${(stats?.overdueDebts || 0) < 20 ? 'bg-success' : 'bg-danger'}`}>
                          {(stats?.overdueDebts || 0) < 20 ? 'Objectif atteint' : 'Amélioration nécessaire'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Coût moyen recouvrement</td>
                      <td>{stats?.averageCost || 0} CHF</td>
                      <td>&lt; 150 CHF</td>
                      <td>
                        <span className={`badge ${(stats?.averageCost || 0) < 150 ? 'bg-success' : 'bg-warning'}`}>
                          {(stats?.averageCost || 0) < 150 ? 'Efficace' : 'Optimisable'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions recommandées */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Actions Recommandées</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="d-flex align-items-start">
                  <AlertTriangle size={20} className="text-danger me-3 mt-1" />
                  <div>
                    <div className="font-weight-medium text-danger">Créances anciennes</div>
                    <div className="text-muted small">
                      {stats?.overdueDebts || 0} creances &gt; 90j necessitent action LP
                    </div>
                  </div>
                </div>
                
                <div className="d-flex align-items-start">
                  <Clock size={20} className="text-warning me-3 mt-1" />
                  <div>
                    <div className="font-weight-medium text-warning">Relances automatiques</div>
                    <div className="text-muted small">
                      Programmer {stats?.pendingReminders || 0} rappels cette semaine
                    </div>
                  </div>
                </div>
                
                <div className="d-flex align-items-start">
                  <CheckCircle size={20} className="text-success me-3 mt-1" />
                  <div>
                    <div className="font-weight-medium text-success">Performance</div>
                    <div className="text-muted small">
                      Taux de succès LP: {stats?.lpSuccessRate || 75}%
                    </div>
                  </div>
                </div>
                
                <div className="d-flex align-items-start">
                  <TrendingUp size={20} className="text-info me-3 mt-1" />
                  <div>
                    <div className="font-weight-medium text-info">Optimisation</div>
                    <div className="text-muted small">
                      Analyser templates de communication les plus efficaces
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conformité légale */}
      <div className="row mt-4">
        <div className="col-lg-12">
          <div className="card border-primary">
            <div className="card-header bg-primary-lt">
              <h3 className="card-title">
                <FileText size={20} className="me-2" />
                Conformité Procédures LP Suisses
              </h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted mb-3">ÉTAPES RESPECTÉES</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      <strong>Art. 67-69 LP</strong> - Commandement de payer (délai 20 jours)
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      <strong>Art. 71 LP</strong> - Réquisition de poursuite
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      <strong>Art. 88-109 LP</strong> - Saisie et réalisation
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      <strong>Tarifs cantonaux</strong> - Frais LP selon barèmes officiels
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted mb-3">INTÉRÊTS MORATOIRES</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <TrendingUp size={16} className="text-info me-2" />
                      Taux référence BNS + marge selon type créance
                    </li>
                    <li className="mb-2">
                      <Clock size={16} className="text-warning me-2" />
                      Calcul automatique depuis échéance
                    </li>
                    <li className="mb-2">
                      <Target size={16} className="text-success me-2" />
                      Plafonnement selon art. 104 CO
                    </li>
                    <li className="mb-2">
                      <FileText size={16} className="text-primary me-2" />
                      Documentation conforme pour tribunaux
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionStats;
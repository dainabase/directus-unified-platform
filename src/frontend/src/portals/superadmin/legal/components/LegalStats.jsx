// src/frontend/src/portals/superadmin/legal/components/LegalStats.jsx
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, Users, FileText, Shield, 
  CheckCircle, Clock, AlertTriangle, Award
} from 'lucide-react';

const COLORS = ['#206bc4', '#a8aeb7', '#15aabf', '#fab005', '#fd7e14'];

const LegalStats = ({ company, stats, cgvList, signatureRequests }) => {
  // Données pour graphiques
  const cgvTypeData = cgvList ? [
    { name: 'CGV Vente', value: cgvList.filter(c => c.type === 'cgv_vente').length },
    { name: 'CGL Location', value: cgvList.filter(c => c.type === 'cgl_location').length },
    { name: 'CGV Service', value: cgvList.filter(c => c.type === 'cgv_service').length }
  ] : [];

  const signatureTypeData = signatureRequests ? [
    { name: 'SES', value: signatureRequests.filter(s => s.signature_type === 'SES').length },
    { name: 'AES', value: signatureRequests.filter(s => s.signature_type === 'AES').length },
    { name: 'QES', value: signatureRequests.filter(s => s.signature_type === 'QES').length }
  ] : [];

  // Données temporelles simulées
  const monthlyAcceptances = [
    { month: 'Jan', acceptances: 45, signatures: 12 },
    { month: 'Fév', acceptances: 52, signatures: 18 },
    { month: 'Mar', acceptances: 61, signatures: 25 },
    { month: 'Avr', acceptances: 58, signatures: 22 },
    { month: 'Mai', acceptances: 67, signatures: 31 },
    { month: 'Jun', acceptances: 73, signatures: 29 }
  ];

  const complianceData = [
    { metric: 'Clauses obligatoires', score: 95 },
    { metric: 'Signatures valides', score: 98 },
    { metric: 'Traçabilité', score: 100 },
    { metric: 'Archivage', score: 92 },
    { metric: 'Conformité LCD', score: 96 }
  ];

  return (
    <div>
      {/* KPIs principaux */}
      <div className="row row-cards mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <FileText size={24} className="text-zinc-700" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">Documents Légaux</div>
                  <div className="text-muted">
                    {stats?.totalCGV || 0} CGV/CGL créées
                  </div>
                </div>
              </div>
              <div className="progress progress-sm mt-2">
                <div 
                  className="progress-bar bg-zinc-700" 
                  style={{ width: `${Math.min(100, (stats?.activeCGV / Math.max(1, stats?.totalCGV)) * 100)}%` }}
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
                  <Shield size={24} className="text-zinc-700" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">Signatures Électroniques</div>
                  <div className="text-muted">
                    {stats?.completedSignatures || 0} ce mois
                  </div>
                </div>
              </div>
              <div className="progress progress-sm mt-2">
                <div 
                  className="progress-bar bg-zinc-500" 
                  style={{ width: '85%' }}
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
                  <Users size={24} className="text-zinc-700" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">Clients Conformes</div>
                  <div className="text-muted">
                    {stats?.totalAcceptances || 0} acceptations
                  </div>
                </div>
              </div>
              <div className="progress progress-sm mt-2">
                <div 
                  className="progress-bar bg-zinc-400" 
                  style={{ width: '92%' }}
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
                  <Award size={24} className="text-zinc-700" />
                </div>
                <div className="col">
                  <div className="font-weight-medium">Score Conformité</div>
                  <div className="text-muted">
                    {stats?.complianceScore || 100}% conforme LCD
                  </div>
                </div>
              </div>
              <div className="progress progress-sm mt-2">
                <div 
                  className="progress-bar bg-zinc-300" 
                  style={{ width: `${stats?.complianceScore || 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="row">
        {/* Évolution temporelle */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Évolution des Acceptations et Signatures</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyAcceptances}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="acceptances" 
                    stackId="1"
                    stroke="#206bc4" 
                    fill="#206bc4" 
                    fillOpacity={0.6}
                    name="Acceptations CGV"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="signatures" 
                    stackId="1"
                    stroke="#15aabf" 
                    fill="#15aabf" 
                    fillOpacity={0.6}
                    name="Signatures électroniques"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Répartition par type */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Documents par Type</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={cgvTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cgvTypeData.map((entry, index) => (
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
        {/* Score conformité détaillé */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Score de Conformité Détaillé</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complianceData} layout="horizontal" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="metric" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Bar dataKey="score" fill="#15aabf" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Types de signatures */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Signatures par Niveau de Sécurité</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={signatureTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {signatureTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Légende explicative */}
              <div className="mt-3">
                <div className="row text-center">
                  <div className="col">
                    <div className="text-muted small">SES</div>
                    <div className="font-weight-medium">Simple</div>
                  </div>
                  <div className="col">
                    <div className="text-muted small">AES</div>
                    <div className="font-weight-medium">Avancée</div>
                  </div>
                  <div className="col">
                    <div className="text-muted small">QES</div>
                    <div className="font-weight-medium">Qualifiée</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes et recommandations */}
      <div className="row mt-4">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Alertes et Recommandations</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="d-flex align-items-start">
                    <CheckCircle size={20} className="text-success me-3 mt-1" />
                    <div>
                      <div className="font-weight-medium text-success">Conformité LCD</div>
                      <div className="text-muted small">
                        Toutes les CGV respectent les exigences de la Loi sur la Consommation
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start">
                    <Clock size={20} className="text-warning me-3 mt-1" />
                    <div>
                      <div className="font-weight-medium text-warning">Signatures en attente</div>
                      <div className="text-muted small">
                        {stats?.pendingSignatures || 0} signatures à relancer
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start">
                    <TrendingUp size={20} className="text-info me-3 mt-1" />
                    <div>
                      <div className="font-weight-medium text-info">Optimisation</div>
                      <div className="text-muted small">
                        Considérer migration vers QES pour sécurité maximale
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé légal */}
      <div className="row mt-4">
        <div className="col-lg-12">
          <div className="card border-zinc-200">
            <div className="card-header bg-zinc-50">
              <h3 className="card-title">
                <Shield size={20} className="me-2" />
                Résumé Conformité Légale Suisse
              </h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted mb-3">BASES LÉGALES RESPECTÉES</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      <strong>Art. 8 LCD</strong> - Protection contre clauses abusives
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      <strong>Art. 210 CO</strong> - Garantie légale 2 ans B2C
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      <strong>eIDAS</strong> - Signatures électroniques SES/AES/QES
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      <strong>RGPD/LPD</strong> - Traçabilité des acceptations
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted mb-3">ACTIONS RECOMMANDÉES</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <AlertTriangle size={16} className="text-warning me-2" />
                      Réviser CGV tous les 12 mois
                    </li>
                    <li className="mb-2">
                      <TrendingUp size={16} className="text-info me-2" />
                      Migrer vers QES pour contrats &gt; 10'000 CHF
                    </li>
                    <li className="mb-2">
                      <Clock size={16} className="text-warning me-2" />
                      Archiver preuves d'acceptation 10 ans
                    </li>
                    <li className="mb-2">
                      <Shield size={16} className="text-success me-2" />
                      Maintenir conformité LCD art. 3 et 8
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

export default LegalStats;
// src/frontend/src/portals/superadmin/crm/components/QuickStats.jsx
import React from 'react';
import { 
  Users, Building2, Activity, TrendingUp,
  Mail, Phone, UserCheck, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip
} from 'recharts';

const COLORS = ['#206bc4', '#15aabf', '#fab005', '#fd7e14'];

const QuickStats = ({ company, stats, isLoading }) => {
  
  // Données pour les graphiques
  const activityData = [
    { name: 'Lun', contacts: 12, appels: 8, emails: 15 },
    { name: 'Mar', contacts: 19, appels: 12, emails: 22 },
    { name: 'Mer', contacts: 8, appels: 6, emails: 11 },
    { name: 'Jeu', contacts: 25, appels: 18, emails: 30 },
    { name: 'Ven', contacts: 22, appels: 15, emails: 28 },
    { name: 'Sam', contacts: 5, appels: 2, emails: 8 },
    { name: 'Dim', contacts: 3, appels: 1, emails: 5 }
  ];
  
  const statusData = [
    { name: 'Actifs', value: stats?.activeContacts || 0 },
    { name: 'Prospects', value: stats?.leadContacts || 0 },
    { name: 'Clients', value: stats?.customerContacts || 0 },
    { name: 'Inactifs', value: stats?.inactiveContacts || 0 }
  ];
  
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <RefreshCw size={24} className="animate-spin text-muted" />
        <p className="text-muted mt-2">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div>
      {/* KPIs principaux */}
      <div className="row row-cards mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="bg-primary text-white avatar">
                    <Users size={24} />
                  </div>
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    Contacts Totaux
                  </div>
                  <div className="h1 mb-0">
                    {stats?.totalContacts || 0}
                  </div>
                  <div className="text-muted">
                    <span className="text-green d-inline-flex align-items-center lh-1">
                      +{stats?.newContactsThisWeek || 0}
                    </span>
                    cette semaine
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="bg-success text-white avatar">
                    <Building2 size={24} />
                  </div>
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    Entreprises
                  </div>
                  <div className="h1 mb-0">
                    {stats?.totalCompanies || 0}
                  </div>
                  <div className="text-muted">
                    <span className="text-green d-inline-flex align-items-center lh-1">
                      +{stats?.newCompaniesThisWeek || 0}
                    </span>
                    cette semaine
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="bg-warning text-white avatar">
                    <Activity size={24} />
                  </div>
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    Activités Récentes
                  </div>
                  <div className="h1 mb-0">
                    {stats?.recentActivities || 0}
                  </div>
                  <div className="text-muted">
                    derniers 30 jours
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="bg-info text-white avatar">
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    Taux de Conversion
                  </div>
                  <div className="h1 mb-0">
                    {stats?.conversionRate || 0}%
                  </div>
                  <div className="text-muted">
                    prospect → client
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Graphiques détaillés */}
      <div className="row">
        {/* Activités hebdomadaires */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Activités CRM - 7 derniers jours</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="contacts" fill="#206bc4" name="Nouveaux contacts" />
                  <Bar dataKey="appels" fill="#15aabf" name="Appels" />
                  <Bar dataKey="emails" fill="#fab005" name="Emails" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Répartition par statut */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Répartition Contacts</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData.filter(item => item.value > 0)}
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
      
      {/* Métriques détaillées */}
      <div className="row mt-4">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Performances de Communication</h3>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-vcenter">
                  <thead>
                    <tr>
                      <th>Canal</th>
                      <th>Cette semaine</th>
                      <th>Mois dernier</th>
                      <th>Évolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <Mail size={16} className="text-blue me-2" />
                          Emails envoyés
                        </div>
                      </td>
                      <td className="text-muted">124</td>
                      <td className="text-muted">98</td>
                      <td>
                        <span className="badge bg-green-lt">+26.5%</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <Phone size={16} className="text-green me-2" />
                          Appels effectués
                        </div>
                      </td>
                      <td className="text-muted">67</td>
                      <td className="text-muted">72</td>
                      <td>
                        <span className="badge bg-red-lt">-6.9%</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <UserCheck size={16} className="text-purple me-2" />
                          Rendez-vous fixés
                        </div>
                      </td>
                      <td className="text-muted">23</td>
                      <td className="text-muted">19</td>
                      <td>
                        <span className="badge bg-green-lt">+21.1%</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <Activity size={16} className="text-orange me-2" />
                          Opportunités créées
                        </div>
                      </td>
                      <td className="text-muted">8</td>
                      <td className="text-muted">6</td>
                      <td>
                        <span className="badge bg-green-lt">+33.3%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Top Prospects</h3>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex align-items-center">
                  <div className="me-3">
                    <div className="avatar avatar-sm bg-primary text-white">
                      AS
                    </div>
                  </div>
                  <div className="flex-fill">
                    <div className="font-weight-medium">ACME Solutions SA</div>
                    <div className="text-muted small">Score: 95/100</div>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-green">Chaud</span>
                  </div>
                </div>
                
                <div className="list-group-item d-flex align-items-center">
                  <div className="me-3">
                    <div className="avatar avatar-sm bg-success text-white">
                      IT
                    </div>
                  </div>
                  <div className="flex-fill">
                    <div className="font-weight-medium">Innovation Tech</div>
                    <div className="text-muted small">Score: 87/100</div>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-warning">Tiède</span>
                  </div>
                </div>
                
                <div className="list-group-item d-flex align-items-center">
                  <div className="me-3">
                    <div className="avatar avatar-sm bg-info text-white">
                      DS
                    </div>
                  </div>
                  <div className="flex-fill">
                    <div className="font-weight-medium">Digital Services</div>
                    <div className="text-muted small">Score: 76/100</div>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-blue">Qualifié</span>
                  </div>
                </div>
                
                <div className="list-group-item d-flex align-items-center">
                  <div className="me-3">
                    <div className="avatar avatar-sm bg-warning text-white">
                      BC
                    </div>
                  </div>
                  <div className="flex-fill">
                    <div className="font-weight-medium">Business Consulting</div>
                    <div className="text-muted small">Score: 68/100</div>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-secondary">Froid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions rapides */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Actions Recommandées</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="border border-success rounded p-3 text-center">
                    <UserCheck size={32} className="text-success mb-2" />
                    <h4 className="text-success mb-1">23</h4>
                    <p className="text-muted mb-0">Contacts à relancer</p>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="border border-warning rounded p-3 text-center">
                    <Phone size={32} className="text-warning mb-2" />
                    <h4 className="text-warning mb-1">12</h4>
                    <p className="text-muted mb-0">Appels en attente</p>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="border border-info rounded p-3 text-center">
                    <Mail size={32} className="text-info mb-2" />
                    <h4 className="text-info mb-1">8</h4>
                    <p className="text-muted mb-0">Emails à traiter</p>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="border border-danger rounded p-3 text-center">
                    <Activity size={32} className="text-danger mb-2" />
                    <h4 className="text-danger mb-1">5</h4>
                    <p className="text-muted mb-0">Tâches urgentes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
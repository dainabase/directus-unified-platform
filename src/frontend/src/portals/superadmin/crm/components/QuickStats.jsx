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
        <RefreshCw size={24} className="animate-spin text-gray-400" />
        <p className="text-gray-500 mt-2">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div>
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="ds-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'var(--accent)', color:'#fff'}}>
                  <Users size={24} />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-700">
                  Contacts Totaux
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-0">
                  {stats?.totalContacts || 0}
                </div>
                <div className="text-gray-500 text-sm">
                  <span className="inline-flex items-center" style={{color:'var(--semantic-green)'}}>
                    +{stats?.newContactsThisWeek || 0}
                  </span>
                  {' '}cette semaine
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ds-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'var(--semantic-green)', color:'#fff'}}>
                  <Building2 size={24} />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-700">
                  Entreprises
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-0">
                  {stats?.totalCompanies || 0}
                </div>
                <div className="text-gray-500 text-sm">
                  <span className="inline-flex items-center" style={{color:'var(--semantic-green)'}}>
                    +{stats?.newCompaniesThisWeek || 0}
                  </span>
                  {' '}cette semaine
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ds-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'var(--semantic-orange)', color:'#fff'}}>
                  <Activity size={24} />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-700">
                  Activités Récentes
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-0">
                  {stats?.recentActivities || 0}
                </div>
                <div className="text-gray-500 text-sm">
                  derniers 30 jours
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ds-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'var(--accent)', color:'#fff'}}>
                  <TrendingUp size={24} />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-700">
                  Taux de Conversion
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-0">
                  {stats?.conversionRate || 0}%
                </div>
                <div className="text-gray-500 text-sm">
                  prospect → client
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques détaillés */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activités hebdomadaires */}
        <div className="lg:col-span-2">
          <div className="ds-card">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Activités CRM - 7 derniers jours</h3>
            </div>
            <div className="p-4">
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
        <div>
          <div className="ds-card">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Répartition Contacts</h3>
            </div>
            <div className="p-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div>
          <div className="ds-card">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Performances de Communication</h3>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      <th className="px-4 py-3">Canal</th>
                      <th className="px-4 py-3">Cette semaine</th>
                      <th className="px-4 py-3">Mois dernier</th>
                      <th className="px-4 py-3">Évolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Mail size={16} className="mr-2" style={{color:'var(--accent)'}} />
                          Emails envoyés
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">124</td>
                      <td className="px-4 py-3 text-gray-500">98</td>
                      <td className="px-4 py-3">
                        <span className="ds-badge ds-badge-success">+26.5%</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Phone size={16} className="mr-2" style={{color:'var(--semantic-green)'}} />
                          Appels effectués
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">67</td>
                      <td className="px-4 py-3 text-gray-500">72</td>
                      <td className="px-4 py-3">
                        <span className="ds-badge ds-badge-danger">-6.9%</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <UserCheck size={16} className="mr-2" style={{color:'var(--accent)'}} />
                          Rendez-vous fixés
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">23</td>
                      <td className="px-4 py-3 text-gray-500">19</td>
                      <td className="px-4 py-3">
                        <span className="ds-badge ds-badge-success">+21.1%</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Activity size={16} className="mr-2" style={{color:'var(--semantic-orange)'}} />
                          Opportunités créées
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">8</td>
                      <td className="px-4 py-3 text-gray-500">6</td>
                      <td className="px-4 py-3">
                        <span className="ds-badge ds-badge-success">+33.3%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="ds-card">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Top Prospects</h3>
            </div>
            <div className="p-4">
              <div className="divide-y divide-gray-50">
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="mr-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{background:'var(--accent)', color:'#fff'}}>
                      AS
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">ACME Solutions SA</div>
                    <div className="text-gray-500 text-xs">Score: 95/100</div>
                  </div>
                  <div className="text-right">
                    <span className="ds-badge ds-badge-success">Chaud</span>
                  </div>
                </div>

                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="mr-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{background:'var(--semantic-green)', color:'#fff'}}>
                      IT
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Innovation Tech</div>
                    <div className="text-gray-500 text-xs">Score: 87/100</div>
                  </div>
                  <div className="text-right">
                    <span className="ds-badge ds-badge-warning">Tiède</span>
                  </div>
                </div>

                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="mr-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{background:'var(--accent)', color:'#fff'}}>
                      DS
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Digital Services</div>
                    <div className="text-gray-500 text-xs">Score: 76/100</div>
                  </div>
                  <div className="text-right">
                    <span className="ds-badge ds-badge-info">Qualifié</span>
                  </div>
                </div>

                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="mr-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{background:'var(--semantic-orange)', color:'#fff'}}>
                      BC
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Business Consulting</div>
                    <div className="text-gray-500 text-xs">Score: 68/100</div>
                  </div>
                  <div className="text-right">
                    <span className="ds-badge ds-badge-default">Froid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-4">
        <div className="ds-card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Actions Recommandées</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl p-3 text-center" style={{border:'1px solid rgba(52,199,89,0.2)'}}>
                <UserCheck size={32} className="mb-2 mx-auto" style={{color:'var(--semantic-green)'}} />
                <h4 className="font-bold mb-1" style={{color:'var(--semantic-green)'}}>23</h4>
                <p className="text-gray-500 text-sm mb-0">Contacts à relancer</p>
              </div>

              <div className="rounded-xl p-3 text-center" style={{border:'1px solid rgba(255,149,0,0.2)'}}>
                <Phone size={32} className="mb-2 mx-auto" style={{color:'var(--semantic-orange)'}} />
                <h4 className="font-bold mb-1" style={{color:'var(--semantic-orange)'}}>12</h4>
                <p className="text-gray-500 text-sm mb-0">Appels en attente</p>
              </div>

              <div className="rounded-xl p-3 text-center" style={{border:'1px solid rgba(0,113,227,0.2)'}}>
                <Mail size={32} className="mb-2 mx-auto" style={{color:'var(--accent)'}} />
                <h4 className="font-bold mb-1" style={{color:'var(--accent)'}}>8</h4>
                <p className="text-gray-500 text-sm mb-0">Emails à traiter</p>
              </div>

              <div className="rounded-xl p-3 text-center" style={{border:'1px solid rgba(255,59,48,0.2)'}}>
                <Activity size={32} className="mb-2 mx-auto" style={{color:'var(--semantic-red)'}} />
                <h4 className="font-bold mb-1" style={{color:'var(--semantic-red)'}}>5</h4>
                <p className="text-gray-500 text-sm mb-0">Tâches urgentes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;

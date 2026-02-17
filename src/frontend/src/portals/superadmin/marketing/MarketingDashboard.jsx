// src/frontend/src/portals/superadmin/marketing/MarketingDashboard.jsx
import React, { useState } from 'react';
import {
  Megaphone, Calendar, Mail, BarChart3, Users, Target,
  TrendingUp, Eye, MousePointer, RefreshCw, Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import ContentCalendar from './components/ContentCalendar';
import CampaignsList from './components/CampaignsList';
import MarketingAnalytics from './components/MarketingAnalytics';
import EventsManager from './components/EventsManager';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
  { id: 'calendar', label: 'Calendrier', icon: Calendar },
  { id: 'campaigns', label: 'Campagnes', icon: Mail },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'events', label: 'Evenements', icon: Users }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Mock data for overview
const mockOverviewData = {
  kpis: {
    emailsSent: 12450,
    openRate: 24.5,
    clickRate: 3.2,
    conversions: 156,
    revenue: 45600,
    leads: 89
  },
  emailTrend: [
    { date: '01/12', sent: 420, opened: 105, clicked: 14 },
    { date: '02/12', sent: 380, opened: 98, clicked: 12 },
    { date: '03/12', sent: 450, opened: 118, clicked: 18 },
    { date: '04/12', sent: 520, opened: 135, clicked: 22 },
    { date: '05/12', sent: 480, opened: 125, clicked: 19 },
    { date: '06/12', sent: 560, opened: 148, clicked: 25 },
    { date: '07/12', sent: 620, opened: 165, clicked: 28 }
  ],
  channelPerformance: [
    { name: 'Email', value: 45 },
    { name: 'Social', value: 25 },
    { name: 'SEO', value: 20 },
    { name: 'Ads', value: 10 }
  ],
  recentCampaigns: [
    { id: 1, name: 'Newsletter Decembre', status: 'active', sent: 5200, opens: 1248, clicks: 167 },
    { id: 2, name: 'Promo Fin d\'annee', status: 'scheduled', sent: 0, opens: 0, clicks: 0 },
    { id: 3, name: 'Nouveaux Services', status: 'completed', sent: 4800, opens: 1152, clicks: 144 }
  ]
};

const MarketingDashboard = ({ selectedCompany, view }) => {
  const getInitialTab = () => {
    if (view === 'calendar') return 'calendar';
    if (view === 'campaigns') return 'campaigns';
    if (view === 'analytics') return 'analytics';
    if (view === 'events') return 'events';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [dateRange, setDateRange] = useState('30d');

  // Mock data query
  const { data: overviewData, isLoading, refetch } = useQuery({
    queryKey: ['marketing-overview', selectedCompany, dateRange],
    queryFn: async () => {
      // TODO: Replace with real API call
      await new Promise(r => setTimeout(r, 500));
      return mockOverviewData;
    },
    staleTime: 60000
  });

  const data = overviewData || mockOverviewData;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="row g-3">
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Mail size={20} className="text-primary me-2" />
                <span className="text-muted small">Emails envoyes</span>
              </div>
              <h3 className="mb-0">{data.kpis.emailsSent.toLocaleString()}</h3>
              <small className="text-success">+12% ce mois</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Eye size={20} className="text-info me-2" />
                <span className="text-muted small">Taux ouverture</span>
              </div>
              <h3 className="mb-0">{data.kpis.openRate}%</h3>
              <small className="text-success">+2.3% vs moyenne</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <MousePointer size={20} className="text-success me-2" />
                <span className="text-muted small">Taux clic</span>
              </div>
              <h3 className="mb-0">{data.kpis.clickRate}%</h3>
              <small className="text-warning">-0.5% vs moyenne</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Target size={20} className="text-warning me-2" />
                <span className="text-muted small">Conversions</span>
              </div>
              <h3 className="mb-0">{data.kpis.conversions}</h3>
              <small className="text-success">+8 cette semaine</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <TrendingUp size={20} className="text-danger me-2" />
                <span className="text-muted small">Revenus</span>
              </div>
              <h3 className="mb-0">CHF {data.kpis.revenue.toLocaleString()}</h3>
              <small className="text-success">+15% ce mois</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Users size={20} className="text-purple me-2" />
                <span className="text-muted small">Nouveaux leads</span>
              </div>
              <h3 className="mb-0">{data.kpis.leads}</h3>
              <small className="text-success">+23 cette semaine</small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Performance Email (7 derniers jours)</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.emailTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="sent" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Envoyes" />
                  <Area type="monotone" dataKey="opened" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Ouverts" />
                  <Area type="monotone" dataKey="clicked" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Cliques" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Performance par Canal</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.channelPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.channelPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
                {data.channelPerformance.map((item, index) => (
                  <div key={item.name} className="d-flex align-items-center">
                    <div
                      className="rounded-circle me-2"
                      style={{ width: 10, height: 10, backgroundColor: COLORS[index] }}
                    />
                    <small>{item.name} ({item.value}%)</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Campagnes Recentes</h5>
          <button className="btn btn-sm btn-primary" onClick={() => setActiveTab('campaigns')}>
            Voir toutes
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Campagne</th>
                  <th>Statut</th>
                  <th>Envoyes</th>
                  <th>Ouvertures</th>
                  <th>Clics</th>
                  <th>Taux</th>
                </tr>
              </thead>
              <tbody>
                {data.recentCampaigns.map(campaign => (
                  <tr key={campaign.id}>
                    <td className="fw-medium">{campaign.name}</td>
                    <td>
                      <span className={`badge ${
                        campaign.status === 'active' ? 'bg-success' :
                        campaign.status === 'scheduled' ? 'bg-warning' : 'bg-secondary'
                      }`}>
                        {campaign.status === 'active' ? 'Active' :
                         campaign.status === 'scheduled' ? 'Planifiee' : 'Terminee'}
                      </span>
                    </td>
                    <td>{campaign.sent.toLocaleString()}</td>
                    <td>{campaign.opens.toLocaleString()}</td>
                    <td>{campaign.clicks.toLocaleString()}</td>
                    <td>
                      {campaign.sent > 0 ? (
                        <span className="text-success">
                          {((campaign.opens / campaign.sent) * 100).toFixed(1)}%
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Megaphone className="me-2" size={24} />
              Marketing
            </h2>
            <div className="text-muted mt-1">
              Campagnes, contenu et analytics
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            <select
              className="form-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">Cette annee</option>
            </select>
            <button
              className="btn btn-outline-secondary"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
            </button>
            <button className="btn btn-primary">
              <Plus size={16} className="me-1" />
              Nouvelle campagne
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            {TABS.map(tab => (
              <li className="nav-item" key={tab.id}>
                <a
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
                >
                  <tab.icon size={16} className="me-2" />
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'calendar' && <ContentCalendar selectedCompany={selectedCompany} />}
              {activeTab === 'campaigns' && <CampaignsList selectedCompany={selectedCompany} />}
              {activeTab === 'analytics' && <MarketingAnalytics selectedCompany={selectedCompany} />}
              {activeTab === 'events' && <EventsManager selectedCompany={selectedCompany} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;

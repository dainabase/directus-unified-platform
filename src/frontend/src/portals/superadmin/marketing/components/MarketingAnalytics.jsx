// src/frontend/src/portals/superadmin/marketing/components/MarketingAnalytics.jsx
import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Target,
  Eye, MousePointer, Mail, Globe, Smartphone, Monitor
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const mockAnalytics = {
  overview: {
    totalEmails: 45800,
    avgOpenRate: 24.5,
    avgClickRate: 3.8,
    totalConversions: 892,
    conversionRate: 1.95,
    revenue: 156000
  },
  trends: [
    { month: 'Jul', emails: 8200, opens: 1968, clicks: 311, conversions: 160 },
    { month: 'Aou', emails: 7800, opens: 1872, clicks: 296, conversions: 148 },
    { month: 'Sep', emails: 9100, opens: 2275, clicks: 364, conversions: 182 },
    { month: 'Oct', emails: 8600, opens: 2150, clicks: 344, conversions: 172 },
    { month: 'Nov', emails: 9800, opens: 2450, clicks: 392, conversions: 196 },
    { month: 'Dec', emails: 12300, opens: 3013, clicks: 478, conversions: 234 }
  ],
  devices: [
    { name: 'Mobile', value: 58 },
    { name: 'Desktop', value: 35 },
    { name: 'Tablet', value: 7 }
  ],
  emailClients: [
    { name: 'Gmail', value: 42 },
    { name: 'Outlook', value: 28 },
    { name: 'Apple Mail', value: 18 },
    { name: 'Autres', value: 12 }
  ],
  topPerformers: [
    { name: 'Newsletter Nov', openRate: 32.5, clickRate: 5.2, conversions: 89 },
    { name: 'Promo Black Friday', openRate: 28.8, clickRate: 8.1, conversions: 156 },
    { name: 'Welcome Series', openRate: 45.2, clickRate: 12.3, conversions: 78 },
    { name: 'Rappel Abandon', openRate: 38.6, clickRate: 6.8, conversions: 45 }
  ],
  hourlyEngagement: [
    { hour: '06h', opens: 120, clicks: 18 },
    { hour: '08h', opens: 450, clicks: 68 },
    { hour: '10h', opens: 680, clicks: 102 },
    { hour: '12h', opens: 520, clicks: 78 },
    { hour: '14h', opens: 420, clicks: 63 },
    { hour: '16h', opens: 380, clicks: 57 },
    { hour: '18h', opens: 560, clicks: 84 },
    { hour: '20h', opens: 320, clicks: 48 },
    { hour: '22h', opens: 180, clicks: 27 }
  ]
};

const MarketingAnalytics = ({ selectedCompany }) => {
  const [period, setPeriod] = useState('6m');
  const data = mockAnalytics;

  const MetricCard = ({ icon: Icon, label, value, change, color = 'primary' }) => (
    <div className="card">
      <div className="card-body">
        <div className="d-flex align-items-center mb-2">
          <div className={`avatar bg-${color}-lt text-${color} me-3`}>
            <Icon size={20} />
          </div>
          <span className="text-muted">{label}</span>
        </div>
        <h3 className="mb-1">{value}</h3>
        {change && (
          <small className={change >= 0 ? 'text-success' : 'text-danger'}>
            {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {' '}{Math.abs(change)}% vs periode precedente
          </small>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Period Selector */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">
          <BarChart3 size={20} className="me-2" />
          Analytics Marketing
        </h5>
        <div className="btn-group">
          {['1m', '3m', '6m', '1y'].map(p => (
            <button
              key={p}
              className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-lg-2">
          <MetricCard
            icon={Mail}
            label="Emails envoyes"
            value={data.overview.totalEmails.toLocaleString()}
            change={12.5}
            color="primary"
          />
        </div>
        <div className="col-md-4 col-lg-2">
          <MetricCard
            icon={Eye}
            label="Taux ouverture"
            value={`${data.overview.avgOpenRate}%`}
            change={2.3}
            color="info"
          />
        </div>
        <div className="col-md-4 col-lg-2">
          <MetricCard
            icon={MousePointer}
            label="Taux clic"
            value={`${data.overview.avgClickRate}%`}
            change={-0.5}
            color="success"
          />
        </div>
        <div className="col-md-4 col-lg-2">
          <MetricCard
            icon={Target}
            label="Conversions"
            value={data.overview.totalConversions.toLocaleString()}
            change={18.2}
            color="warning"
          />
        </div>
        <div className="col-md-4 col-lg-2">
          <MetricCard
            icon={Users}
            label="Taux conv."
            value={`${data.overview.conversionRate}%`}
            change={5.1}
            color="danger"
          />
        </div>
        <div className="col-md-4 col-lg-2">
          <MetricCard
            icon={TrendingUp}
            label="Revenus"
            value={`CHF ${(data.overview.revenue / 1000).toFixed(0)}k`}
            change={22.8}
            color="purple"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Evolution des performances</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="opens" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Ouvertures" />
                  <Area type="monotone" dataKey="clicks" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Clics" />
                  <Area type="monotone" dataKey="conversions" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Conversions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Repartition par appareil</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex justify-content-around mt-3">
                {data.devices.map((device, index) => (
                  <div key={device.name} className="text-center">
                    {device.name === 'Mobile' && <Smartphone size={16} className="text-muted mb-1" />}
                    {device.name === 'Desktop' && <Monitor size={16} className="text-muted mb-1" />}
                    {device.name === 'Tablet' && <Globe size={16} className="text-muted mb-1" />}
                    <div className="small text-muted">{device.name}</div>
                    <div className="fw-bold" style={{ color: COLORS[index] }}>{device.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Engagement par heure</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.hourlyEngagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="opens" fill="#3b82f6" name="Ouvertures" />
                  <Bar dataKey="clicks" fill="#10b981" name="Clics" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Top Campagnes</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Campagne</th>
                      <th className="text-center">Ouvertures</th>
                      <th className="text-center">Clics</th>
                      <th className="text-center">Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPerformers.map((campaign, index) => (
                      <tr key={index}>
                        <td className="fw-medium">{campaign.name}</td>
                        <td className="text-center">
                          <span className="badge bg-primary-lt text-primary">{campaign.openRate}%</span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-success-lt text-success">{campaign.clickRate}%</span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-warning-lt text-warning">{campaign.conversions}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Clients */}
      <div className="card mt-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Clients email utilises</h5>
        </div>
        <div className="card-body">
          <div className="row align-items-center">
            {data.emailClients.map((client, index) => (
              <div className="col-md-3" key={client.name}>
                <div className="d-flex align-items-center mb-2">
                  <span className="fw-medium">{client.name}</span>
                  <span className="ms-auto">{client.value}%</span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar"
                    style={{ width: `${client.value}%`, backgroundColor: COLORS[index] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingAnalytics;

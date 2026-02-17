// src/frontend/src/portals/superadmin/support/SupportDashboard.jsx
import React, { useState } from 'react';
import {
  Headphones, Ticket, Bell, MessageSquare, Users, Clock,
  TrendingUp, CheckCircle, AlertCircle, RefreshCw, Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import TicketsManager from './components/TicketsManager';
import NotificationsCenter from './components/NotificationsCenter';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Headphones },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'notifications', label: 'Notifications', icon: Bell }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const mockOverviewData = {
  kpis: {
    openTickets: 23,
    resolvedToday: 12,
    avgResponseTime: '2.4h',
    satisfaction: 94,
    pendingNotifications: 8,
    activeAgents: 5
  },
  ticketTrend: [
    { date: 'Lun', created: 15, resolved: 12 },
    { date: 'Mar', created: 18, resolved: 16 },
    { date: 'Mer', created: 12, resolved: 14 },
    { date: 'Jeu', created: 20, resolved: 18 },
    { date: 'Ven', created: 16, resolved: 15 },
    { date: 'Sam', created: 8, resolved: 10 },
    { date: 'Dim', created: 5, resolved: 6 }
  ],
  ticketsByPriority: [
    { name: 'Critique', value: 3 },
    { name: 'Haute', value: 8 },
    { name: 'Moyenne', value: 15 },
    { name: 'Basse', value: 12 }
  ],
  ticketsByCategory: [
    { category: 'Technique', count: 18 },
    { category: 'Facturation', count: 12 },
    { category: 'Commercial', count: 8 },
    { category: 'Autre', count: 5 }
  ],
  recentTickets: [
    { id: 'TKT-1234', subject: 'Probleme connexion API', status: 'open', priority: 'high', customer: 'ACME Corp', created: '2024-12-14T09:30:00' },
    { id: 'TKT-1233', subject: 'Question facturation', status: 'pending', priority: 'medium', customer: 'TechStart SA', created: '2024-12-14T08:45:00' },
    { id: 'TKT-1232', subject: 'Demande de fonctionnalite', status: 'open', priority: 'low', customer: 'Digital AG', created: '2024-12-13T16:20:00' }
  ]
};

const SupportDashboard = ({ selectedCompany, view }) => {
  const getInitialTab = () => {
    if (view === 'tickets') return 'tickets';
    if (view === 'notifications') return 'notifications';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [dateRange, setDateRange] = useState('7d');

  const { data: overviewData, isLoading, refetch } = useQuery({
    queryKey: ['support-overview', selectedCompany, dateRange],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500));
      return mockOverviewData;
    },
    staleTime: 60000
  });

  const data = overviewData || mockOverviewData;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="badge bg-success">Ouvert</span>;
      case 'pending':
        return <span className="badge bg-warning">En attente</span>;
      case 'resolved':
        return <span className="badge bg-secondary">Resolu</span>;
      case 'closed':
        return <span className="badge bg-dark">Ferme</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="row g-3">
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <AlertCircle size={20} className="text-danger me-2" />
                <span className="text-muted small">Tickets ouverts</span>
              </div>
              <h3 className="mb-0">{data.kpis.openTickets}</h3>
              <small className="text-danger">+3 aujourd'hui</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <CheckCircle size={20} className="text-success me-2" />
                <span className="text-muted small">Resolus aujourd'hui</span>
              </div>
              <h3 className="mb-0">{data.kpis.resolvedToday}</h3>
              <small className="text-success">+8% vs hier</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Clock size={20} className="text-info me-2" />
                <span className="text-muted small">Temps reponse</span>
              </div>
              <h3 className="mb-0">{data.kpis.avgResponseTime}</h3>
              <small className="text-success">-15min vs moyenne</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <TrendingUp size={20} className="text-warning me-2" />
                <span className="text-muted small">Satisfaction</span>
              </div>
              <h3 className="mb-0">{data.kpis.satisfaction}%</h3>
              <small className="text-success">+2% ce mois</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Bell size={20} className="text-purple me-2" />
                <span className="text-muted small">Notifications</span>
              </div>
              <h3 className="mb-0">{data.kpis.pendingNotifications}</h3>
              <small className="text-muted">en attente</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Users size={20} className="text-primary me-2" />
                <span className="text-muted small">Agents actifs</span>
              </div>
              <h3 className="mb-0">{data.kpis.activeAgents}</h3>
              <small className="text-muted">en ligne</small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Evolution des tickets (7 jours)</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.ticketTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="created" fill="#ef4444" name="Crees" />
                  <Bar dataKey="resolved" fill="#10b981" name="Resolus" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Par priorite</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.ticketsByPriority}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.ticketsByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                {data.ticketsByPriority.map((item, index) => (
                  <div key={item.name} className="d-flex align-items-center">
                    <div
                      className="rounded-circle me-1"
                      style={{ width: 8, height: 8, backgroundColor: COLORS[index] }}
                    />
                    <small className="text-muted">{item.name} ({item.value})</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories and Recent */}
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Par categorie</h5>
            </div>
            <div className="card-body">
              {data.ticketsByCategory.map((cat, index) => (
                <div key={cat.category} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small">{cat.category}</span>
                    <span className="small fw-medium">{cat.count}</span>
                  </div>
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${(cat.count / 43) * 100}%`,
                        backgroundColor: COLORS[index]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Tickets recents</h5>
              <button className="btn btn-sm btn-primary" onClick={() => setActiveTab('tickets')}>
                Voir tous
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover card-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sujet</th>
                    <th>Client</th>
                    <th>Statut</th>
                    <th>Priorite</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="fw-medium text-primary">{ticket.id}</td>
                      <td>{ticket.subject}</td>
                      <td className="text-muted">{ticket.customer}</td>
                      <td>{getStatusBadge(ticket.status)}</td>
                      <td>
                        <span className={`badge bg-${getPriorityColor(ticket.priority)}-lt text-${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
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
  );

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Headphones className="me-2" size={24} />
              Support
            </h2>
            <div className="text-muted mt-1">
              Tickets et notifications
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
              Nouveau ticket
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
              {activeTab === 'tickets' && <TicketsManager selectedCompany={selectedCompany} />}
              {activeTab === 'notifications' && <NotificationsCenter selectedCompany={selectedCompany} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;

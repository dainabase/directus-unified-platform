// src/frontend/src/portals/superadmin/crm/components/CustomerSuccess.jsx
import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Heart, TrendingUp, Users, Star, AlertTriangle, CheckCircle,
  Phone, Mail, Calendar, Clock, RefreshCw, Filter, MoreVertical
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../../../../lib/axios';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount);

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_COLORS = {
  healthy: '#10b981',
  'at-risk': '#f59e0b',
  critical: '#ef4444'
};

// ── Data fetchers ────────────────────────────────────────────────────────────

const buildFilter = (selectedCompany) => {
  if (selectedCompany && selectedCompany !== 'all') {
    return { owner_company: { _eq: selectedCompany } };
  }
  return {};
};

const fetchCompanies = async (selectedCompany) => {
  const filter = buildFilter(selectedCompany);
  const res = await api.get('/items/companies', {
    params: {
      filter,
      fields: ['id', 'name', 'status', 'type', 'owner_company'],
      limit: -1
    }
  });
  return res.data?.data || [];
};

const fetchSubscriptions = async (selectedCompany) => {
  const filter = buildFilter(selectedCompany);
  const res = await api.get('/items/subscriptions', {
    params: {
      filter,
      fields: ['id', 'client_id', 'status', 'plan', 'amount', 'start_date', 'renewal_date', 'owner_company'],
      limit: -1
    }
  });
  return res.data?.data || [];
};

const fetchSupportTickets = async (selectedCompany) => {
  const filter = buildFilter(selectedCompany);
  const res = await api.get('/items/support_tickets', {
    params: {
      filter,
      fields: ['id', 'status', 'priority', 'date_created', 'owner_company'],
      limit: -1
    }
  });
  return res.data?.data || [];
};

// ── Health score logic ───────────────────────────────────────────────────────

/**
 * Compute a health score (0-100) per company based on:
 * - open tickets count (more = worse)
 * - active subscriptions count (more = better)
 * - subscription value (higher = better)
 */
const computeHealthScores = (companies, subscriptions, tickets) => {
  // Pre-index subscriptions & tickets by client_id
  const subsByClient = {};
  const ticketsByClient = {};

  subscriptions.forEach((sub) => {
    const cid = sub.client_id;
    if (!subsByClient[cid]) subsByClient[cid] = [];
    subsByClient[cid].push(sub);
  });

  tickets.forEach((t) => {
    // Tickets with status open, in_progress or similar are "open"
    const isOpen = !['closed', 'resolved', 'done'].includes((t.status || '').toLowerCase());
    if (!isOpen) return;
    // Associate ticket to all companies (global) if no direct mapping
    // In practice tickets may not have client_id; we count globally per owner_company
  });

  // Count open tickets globally for normalization
  const openTickets = tickets.filter(
    (t) => !['closed', 'resolved', 'done'].includes((t.status || '').toLowerCase())
  );
  const totalOpenTickets = openTickets.length;

  // For per-company ticket attribution, we distribute evenly if no client_id
  // (Best effort: in a real setup, tickets would link to a company)
  const ticketCountPerCompany = companies.length > 0
    ? Math.ceil(totalOpenTickets / companies.length)
    : 0;

  return companies.map((company) => {
    const companySubs = subsByClient[company.id] || [];
    const activeSubs = companySubs.filter(
      (s) => (s.status || '').toLowerCase() === 'active'
    );
    const totalValue = companySubs.reduce(
      (sum, s) => sum + parseFloat(s.amount || 0), 0
    );
    const mrr = activeSubs.reduce(
      (sum, s) => sum + parseFloat(s.amount || 0), 0
    );

    // Nearest renewal
    const now = new Date();
    const renewals = companySubs
      .filter((s) => s.renewal_date)
      .map((s) => new Date(s.renewal_date))
      .filter((d) => d > now)
      .sort((a, b) => a - b);
    const nextRenewal = renewals.length > 0 ? renewals[0] : null;

    // Score components (0-100 each)
    // 1. Tickets penalty: 0 open = 100, 1 = 80, 2 = 60, 3+ = 30, 5+ = 10
    const openCount = ticketCountPerCompany;
    let ticketScore = 100;
    if (openCount >= 5) ticketScore = 10;
    else if (openCount >= 3) ticketScore = 30;
    else if (openCount >= 2) ticketScore = 60;
    else if (openCount >= 1) ticketScore = 80;

    // 2. Subscription score: 0 active = 20, 1 = 60, 2+ = 90, 3+ = 100
    let subScore = 20;
    if (activeSubs.length >= 3) subScore = 100;
    else if (activeSubs.length >= 2) subScore = 90;
    else if (activeSubs.length >= 1) subScore = 60;

    // 3. Value score: normalized 0-100 (top = max value across all)
    const valueScore = totalValue > 0 ? Math.min(100, Math.round((totalValue / 10000) * 100)) : 20;

    // Weighted average
    const healthScore = Math.round(ticketScore * 0.35 + subScore * 0.35 + valueScore * 0.3);

    let status = 'healthy';
    if (healthScore < 60) status = 'critical';
    else if (healthScore < 80) status = 'at-risk';

    return {
      id: company.id,
      name: company.name,
      type: company.type,
      companyStatus: company.status,
      healthScore,
      status,
      mrr,
      totalValue,
      activeSubsCount: activeSubs.length,
      totalSubsCount: companySubs.length,
      openTickets: openCount,
      nextRenewal,
      subscriptions: companySubs
    };
  });
};

// ── Component ────────────────────────────────────────────────────────────────

const CustomerSuccess = ({ selectedCompany }) => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);

  // ── Queries ──
  const {
    data: companies = [],
    isLoading: companiesLoading,
    error: companiesError
  } = useQuery({
    queryKey: ['cs-companies', selectedCompany],
    queryFn: () => fetchCompanies(selectedCompany),
    staleTime: 1000 * 60 * 3,
    retry: 2
  });

  const {
    data: subscriptions = [],
    isLoading: subscriptionsLoading,
    error: subscriptionsError
  } = useQuery({
    queryKey: ['cs-subscriptions', selectedCompany],
    queryFn: () => fetchSubscriptions(selectedCompany),
    staleTime: 1000 * 60 * 3,
    retry: 2
  });

  const {
    data: tickets = [],
    isLoading: ticketsLoading,
    error: ticketsError
  } = useQuery({
    queryKey: ['cs-tickets', selectedCompany],
    queryFn: () => fetchSupportTickets(selectedCompany),
    staleTime: 1000 * 60 * 3,
    retry: 2
  });

  const isLoading = companiesLoading || subscriptionsLoading || ticketsLoading;
  const hasError = companiesError || subscriptionsError || ticketsError;

  // ── Computed data ──
  const customers = useMemo(
    () => computeHealthScores(companies, subscriptions, tickets),
    [companies, subscriptions, tickets]
  );

  const filteredCustomers = useMemo(
    () => customers.filter((c) => filterStatus === 'all' || c.status === filterStatus),
    [customers, filterStatus]
  );

  // ── Stats ──
  const stats = useMemo(() => {
    if (customers.length === 0) {
      return { avgHealthScore: 0, totalMrr: 0, atRiskCount: 0, upcomingRenewals: 0 };
    }

    const avgHealthScore = Math.round(
      customers.reduce((sum, c) => sum + c.healthScore, 0) / customers.length
    );
    const totalMrr = customers.reduce((sum, c) => sum + c.mrr, 0);
    const atRiskCount = customers.filter(
      (c) => c.status === 'at-risk' || c.status === 'critical'
    ).length;

    const now = new Date();
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const upcomingRenewals = customers.filter((c) => {
      return c.nextRenewal && c.nextRenewal <= sixtyDaysFromNow && c.nextRenewal > now;
    }).length;

    return { avgHealthScore, totalMrr, atRiskCount, upcomingRenewals };
  }, [customers]);

  // ── Chart data: health status distribution (PieChart) ──
  const statusDistribution = useMemo(() => {
    const healthyCount = customers.filter((c) => c.status === 'healthy').length;
    const atRiskCount = customers.filter((c) => c.status === 'at-risk').length;
    const criticalCount = customers.filter((c) => c.status === 'critical').length;
    return [
      { name: 'Sains (80+)', value: healthyCount, color: STATUS_COLORS.healthy },
      { name: 'A risque (60-79)', value: atRiskCount, color: STATUS_COLORS['at-risk'] },
      { name: 'Critiques (<60)', value: criticalCount, color: STATUS_COLORS.critical }
    ].filter((d) => d.value > 0);
  }, [customers]);

  // ── Chart data: health trend (last 6 months from subscriptions start_date) ──
  const healthTrend = useMemo(() => {
    const now = new Date();
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = MONTH_LABELS[d.getMonth()];

      // Count active subs that existed during this month
      const activeSubs = subscriptions.filter((s) => {
        const start = new Date(s.start_date || s.date_created || '2020-01-01');
        const isActive = (s.status || '').toLowerCase() === 'active';
        return isActive && start <= endOfMonth;
      });

      // Count open tickets created before end of month
      const openTicketsInMonth = tickets.filter((t) => {
        const created = new Date(t.date_created || '2020-01-01');
        const isOpen = !['closed', 'resolved', 'done'].includes((t.status || '').toLowerCase());
        return created <= endOfMonth && (isOpen || created.getMonth() === d.getMonth());
      });

      // Simplified score: more subs = better, more tickets = worse
      const subsBonus = Math.min(100, activeSubs.length * 15 + 40);
      const ticketPenalty = Math.min(50, openTicketsInMonth.length * 8);
      const score = Math.max(0, Math.min(100, subsBonus - ticketPenalty));

      data.push({ month: monthLabel, score });
    }
    return data;
  }, [subscriptions, tickets]);

  // ── Chart data: retention (last 6 months from subscriptions) ──
  const retentionData = useMemo(() => {
    const now = new Date();
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = MONTH_LABELS[d.getMonth()];

      const totalSubs = subscriptions.filter((s) => {
        const start = new Date(s.start_date || s.date_created || '2020-01-01');
        return start <= endOfMonth;
      });

      const activeSubs = totalSubs.filter(
        (s) => (s.status || '').toLowerCase() === 'active'
      );
      const cancelledSubs = totalSubs.filter(
        (s) => ['cancelled', 'expired', 'inactive'].includes((s.status || '').toLowerCase())
      );

      data.push({
        month: monthLabel,
        retained: activeSubs.length,
        churned: cancelledSubs.length
      });
    }
    return data;
  }, [subscriptions]);

  // ── UI Helpers ──
  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBg = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle size={12} />Sain
          </span>
        );
      case 'at-risk':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <AlertTriangle size={12} />A risque
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle size={12} />Critique
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['cs-companies'] });
    queryClient.invalidateQueries({ queryKey: ['cs-subscriptions'] });
    queryClient.invalidateQueries({ queryKey: ['cs-tickets'] });
    toast.success('Donnees actualisees');
  };

  const handleAction = (action, customer) => {
    toast.success(`Action "${action}" planifiee pour ${customer.name}`);
    setShowActionModal(false);
    setSelectedCustomer(null);
  };

  // ── Skeleton loader ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="ds-card p-6">
          <div className="h-12 ds-skeleton rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ds-card p-6">
              <div className="h-20 ds-skeleton rounded-lg" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ds-card p-6">
              <div className="h-48 ds-skeleton rounded-lg" />
            </div>
          ))}
        </div>
        <div className="ds-card p-6">
          <div className="h-64 ds-skeleton rounded-lg" />
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (hasError) {
    return (
      <div className="ds-card p-8 text-center">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Erreur de chargement</h3>
        <p className="text-sm text-gray-500 mb-4">
          Impossible de charger les donnees Customer Success.
        </p>
        <button
          onClick={handleRefresh}
          className="ds-btn ds-btn-primary" style={{ background: 'var(--accent)' }}
        >
          <RefreshCw size={16} className="mr-1 inline" />
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-green-600" />
            Customer Success
          </h2>
          <p className="text-sm text-gray-500 mt-1">Satisfaction et retention clients</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} className="ds-btn ds-btn-secondary text-gray-600">
            <RefreshCw size={16} className="mr-1 inline" />
            Actualiser
          </button>
          <button className="ds-btn ds-btn-primary" style={{ background: 'var(--accent)' }}>
            <Calendar size={16} className="mr-1 inline" />
            Planifier review
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={18} className="text-green-600" />
            <span className="text-sm text-gray-500">Health Score moyen</span>
          </div>
          <p className={`text-2xl font-bold ${getHealthColor(stats.avgHealthScore)}`}>
            {stats.avgHealthScore}%
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sur {customers.length} client(s)
          </p>
        </div>

        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-sm text-gray-500">MRR total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(stats.totalMrr)}</p>
          <p className="text-xs text-gray-400 mt-1">Abonnements actifs</p>
        </div>

        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-500" />
            <span className="text-sm text-gray-500">Clients a risque</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.atRiskCount}</p>
          <p className="text-xs text-red-400 mt-1">
            {stats.atRiskCount > 0 ? 'Action requise' : 'Aucun'}
          </p>
        </div>

        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-sm text-gray-500">Renouvellements</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.upcomingRenewals}</p>
          <p className="text-xs text-gray-400 mt-1">Dans les 60 prochains jours</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Health Trend */}
        <div className="ds-card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Health Score (6 mois)</h3>
          {healthTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={healthTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Score"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Aucune donnee disponible
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="ds-card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribution sante</h3>
          {statusDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1 mt-2">
                {statusDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Aucun client
            </div>
          )}
        </div>

        {/* Retention */}
        <div className="ds-card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Retention (6 mois)</h3>
          {retentionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="retained" stackId="a" fill="#10b981" name="Retenus" />
                <Bar dataKey="churned" stackId="a" fill="#ef4444" name="Churnes" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Aucune donnee disponible
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Filter size={16} className="text-gray-400" />
          <select
            className="ds-btn ds-btn-secondary text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous les clients</option>
            <option value="healthy">Sains</option>
            <option value="at-risk">A risque</option>
            <option value="critical">Critiques</option>
          </select>
        </div>
        <span className="text-sm text-gray-500">
          {filteredCustomers.length} client(s)
        </span>
      </div>

      {/* Customers Table */}
      <div className="ds-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Health Score</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">MRR</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Abonnements</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Renouvellement</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Statut</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-500">{customer.type || 'Client'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getHealthBg(customer.healthScore)}`}
                          style={{ width: `${customer.healthScore}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${getHealthColor(customer.healthScore)}`}>
                        {customer.healthScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatCHF(customer.mrr)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-700">{customer.activeSubsCount}</span>
                    <span className="text-gray-400"> / {customer.totalSubsCount}</span>
                    <span className="text-xs text-gray-400 ml-1">actifs</span>
                  </td>
                  <td className="px-4 py-3">
                    {customer.nextRenewal ? (
                      <span
                        className={`text-xs flex items-center gap-1 ${
                          customer.nextRenewal < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            ? 'text-red-600 font-medium'
                            : 'text-gray-500'
                        }`}
                      >
                        <Clock size={12} />
                        {customer.nextRenewal.toLocaleDateString('fr-CH')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(customer.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Appeler"
                        onClick={() => toast.success(`Appel vers ${customer.name}`)}
                      >
                        <Phone size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Email"
                        onClick={() => toast.success(`Email a ${customer.name}`)}
                      >
                        <Mail size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowActionModal(true);
                        }}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Aucun client trouve</p>
            <p className="text-xs text-gray-400 mt-1">
              {companies.length === 0
                ? 'Aucune entreprise dans la collection companies'
                : 'Essayez de modifier le filtre'}
            </p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowActionModal(false)}
        >
          <div
            className="ds-card p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Actions - {selectedCustomer.name}
              </h3>
              <button
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                onClick={() => setShowActionModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Heart size={14} className="text-gray-400" />
                <span className="text-gray-600">Health Score:</span>
                <span className={`font-medium ${getHealthColor(selectedCustomer.healthScore)}`}>
                  {selectedCustomer.healthScore}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star size={14} className="text-gray-400" />
                <span className="text-gray-600">MRR:</span>
                <span className="font-medium text-gray-900">
                  {formatCHF(selectedCustomer.mrr)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users size={14} className="text-gray-400" />
                <span className="text-gray-600">Abonnements actifs:</span>
                <span className="font-medium text-gray-900">
                  {selectedCustomer.activeSubsCount}
                </span>
              </div>
            </div>

            <hr className="border-gray-200 my-4" />

            <div className="flex flex-col gap-2">
              <button
                className="ds-btn ds-btn-secondary text-left text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2"
                onClick={() => handleAction('Planifier call de suivi', selectedCustomer)}
              >
                <Phone size={16} />
                Planifier call de suivi
              </button>
              <button
                className="ds-btn ds-btn-secondary text-left text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2"
                onClick={() => handleAction('Envoyer enquete satisfaction', selectedCustomer)}
              >
                <Mail size={16} />
                Envoyer enquete satisfaction
              </button>
              <button
                className="ds-btn ds-btn-secondary text-left text-sm text-green-700 hover:text-green-800 flex items-center gap-2"
                onClick={() => handleAction('Proposer upsell', selectedCustomer)}
              >
                <TrendingUp size={16} />
                Proposer upsell
              </button>
              <button
                className="ds-btn ds-btn-secondary text-left text-sm text-yellow-700 hover:text-yellow-800 flex items-center gap-2"
                onClick={() => handleAction('Creer plan de retention', selectedCustomer)}
              >
                <AlertTriangle size={16} />
                Creer plan de retention
              </button>
              <button
                className="ds-btn ds-btn-secondary text-left text-sm text-zinc-700 hover:text-zinc-800 flex items-center gap-2"
                onClick={() => handleAction('Planifier review trimestrielle', selectedCustomer)}
              >
                <Calendar size={16} />
                Planifier review trimestrielle
              </button>
            </div>

            <div className="mt-4 text-right">
              <button
                className="ds-btn ds-btn-secondary text-gray-600 text-sm"
                onClick={() => setShowActionModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSuccess;

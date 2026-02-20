// src/frontend/src/portals/superadmin/legal/components/ContractsManager.jsx
import React, { useState, useMemo } from 'react';
import {
  FileText, Plus, Search, Filter, Download, Upload, Eye, Edit2,
  Trash2, Calendar, Users, AlertTriangle, CheckCircle, Clock,
  Building2, DollarSign, MoreVertical, RefreshCw, Send, Loader2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import toast from 'react-hot-toast';

// ── Constants ──────────────────────────────────────────────────────
const CONTRACT_TYPES = {
  service: { label: 'Service', color: '#0071E3' },
  license: { label: 'Licence', color: '#34C759' },
  maintenance: { label: 'Maintenance', color: '#FF9500' },
  nda: { label: 'NDA', color: '#AF52DE' },
  partnership: { label: 'Partenariat', color: '#FF3B30' },
  supplier: { label: 'Fournisseur', color: '#6E6E73' }
};

const STATUS_CONFIG = {
  active: { label: 'Actif', cls: 'ds-badge ds-badge-success', icon: CheckCircle },
  'pending-signature': { label: 'En attente signature', cls: 'ds-badge ds-badge-warning', icon: Clock },
  'expiring-soon': { label: 'Expire bientot', cls: 'ds-badge ds-badge-danger', icon: AlertTriangle },
  expired: { label: 'Expire', cls: 'ds-badge ds-badge-default', icon: AlertTriangle },
  draft: { label: 'Brouillon', cls: 'ds-badge ds-badge-default', icon: Edit2 }
};

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount);

const getDaysUntilExpiry = (endDate) => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
};

// ── Skeleton Loader ────────────────────────────────────────────────
const SkeletonLoader = () => (
  <div className="space-y-6 p-6">
    {/* KPI skeletons */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="ds-card p-5">
          <div className="animate-pulse h-4 w-24 mb-3 rounded" />
          <div className="animate-pulse h-8 w-16 rounded" />
        </div>
      ))}
    </div>
    {/* Charts skeletons */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 ds-card p-6">
        <div className="animate-pulse h-4 w-48 mb-4 rounded" />
        <div className="animate-pulse h-56 w-full rounded" />
      </div>
      <div className="ds-card p-6">
        <div className="animate-pulse h-4 w-32 mb-4 rounded" />
        <div className="animate-pulse h-44 w-full rounded-full mx-auto" style={{ maxWidth: 180 }} />
      </div>
    </div>
    {/* Table skeleton */}
    <div className="ds-card p-6">
      <div className="animate-pulse h-4 w-40 mb-4 rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          <div className="animate-pulse h-4 flex-1 rounded" />
          <div className="animate-pulse h-4 w-20 rounded" />
          <div className="animate-pulse h-4 w-28 rounded" />
          <div className="animate-pulse h-4 w-24 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────
const ContractsManager = ({ selectedCompany }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // ── Fetch contracts ──────────────────────────────────────────────
  const contractsQuery = useQuery({
    queryKey: ['contracts', selectedCompany],
    queryFn: async () => {
      const params = { fields: ['*'] };
      if (selectedCompany && selectedCompany !== 'all') {
        params.filter = { owner_company: { _eq: selectedCompany } };
      }
      const { data } = await api.get('/items/contracts', { params });
      return data.data || [];
    }
  });

  // ── Fetch companies for client_id resolution ─────────────────────
  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data } = await api.get('/items/companies', {
        params: { fields: ['id', 'name'], limit: -1 }
      });
      return data.data || [];
    }
  });

  // ── Build a lookup map: company id -> name ───────────────────────
  const companyMap = useMemo(() => {
    const map = {};
    (companiesQuery.data || []).forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [companiesQuery.data]);

  const contracts = contractsQuery.data || [];

  // ── Delete mutation ──────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/items/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrat supprime avec succes');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du contrat');
    }
  });

  // ── Create mutation ──────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/items/contracts', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrat cree avec succes');
      setShowNewModal(false);
    },
    onError: () => {
      toast.error('Erreur lors de la creation du contrat');
    }
  });

  // ── Determine "expiring-soon" dynamically ────────────────────────
  // Any active contract with <= 60 days left should be treated as expiring-soon
  const enrichedContracts = useMemo(() => {
    return contracts.map((c) => {
      const daysLeft = getDaysUntilExpiry(c.end_date);
      let computedStatus = c.status;
      if (c.status === 'active' && daysLeft !== null && daysLeft <= 60 && daysLeft > 0) {
        computedStatus = 'expiring-soon';
      } else if (c.status === 'active' && daysLeft !== null && daysLeft <= 0) {
        computedStatus = 'expired';
      }
      return { ...c, computedStatus, daysLeft };
    });
  }, [contracts]);

  // ── Filtering ────────────────────────────────────────────────────
  const filteredContracts = useMemo(() => {
    return enrichedContracts.filter((c) => {
      const clientName = companyMap[c.client_id] || '';
      const matchesSearch =
        !searchTerm ||
        (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || c.type === filterType;
      const matchesStatus = filterStatus === 'all' || c.computedStatus === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [enrichedContracts, searchTerm, filterType, filterStatus, companyMap]);

  // ── Stats computed from data ─────────────────────────────────────
  const stats = useMemo(() => {
    const active = enrichedContracts.filter((c) => c.computedStatus === 'active');
    const pending = enrichedContracts.filter((c) => c.computedStatus === 'pending-signature');
    const expiringSoon = enrichedContracts.filter((c) => c.computedStatus === 'expiring-soon');
    const totalValue = active.reduce((sum, c) => sum + (c.value || 0), 0);
    return {
      total: enrichedContracts.length,
      active: active.length,
      pendingSignature: pending.length,
      expiringSoon: expiringSoon.length,
      totalValue
    };
  }, [enrichedContracts]);

  // ── Type distribution for PieChart (computed from data) ──────────
  const typeDistribution = useMemo(() => {
    const counts = {};
    enrichedContracts.forEach((c) => {
      const key = c.type || 'other';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, count]) => ({
      name: CONTRACT_TYPES[key]?.label || key,
      value: count,
      color: CONTRACT_TYPES[key]?.color || '#94a3b8'
    }));
  }, [enrichedContracts]);

  // ── Monthly value for BarChart (computed from data) ──────────────
  const monthlyValue = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const buckets = {};

    // Initialize the last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = { month: MONTH_NAMES[d.getMonth()], value: 0 };
    }

    // For each active contract, distribute its monthly value across months it covers
    enrichedContracts.forEach((c) => {
      if (!c.start_date || !c.end_date || !c.value) return;
      const start = new Date(c.start_date);
      const end = new Date(c.end_date);
      const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30)));
      const monthlyVal = c.value / months;

      Object.keys(buckets).forEach((key) => {
        const [y, m] = key.split('-').map(Number);
        const bucketStart = new Date(y, m - 1, 1);
        const bucketEnd = new Date(y, m, 0);
        if (start <= bucketEnd && end >= bucketStart) {
          buckets[key].value += monthlyVal;
        }
      });
    });

    return Object.values(buckets).map((b) => ({ ...b, value: Math.round(b.value) }));
  }, [enrichedContracts]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce contrat ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSendForSignature = (contract) => {
    toast.success(`Demande de signature envoyee pour "${contract.title}"`);
  };

  // ── Badges ───────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status];
    if (!config) return <span className="ds-badge ds-badge-default">{status}</span>;
    const Icon = config.icon;
    return (
      <span className={config.cls}>
        <Icon size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const config = CONTRACT_TYPES[type];
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: `${config?.color || '#94a3b8'}18`,
          color: config?.color || '#94a3b8'
        }}
      >
        {config?.label || type}
      </span>
    );
  };

  // ── Loading state ────────────────────────────────────────────────
  if (contractsQuery.isLoading || companiesQuery.isLoading) {
    return <SkeletonLoader />;
  }

  // ── Error state ──────────────────────────────────────────────────
  if (contractsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertTriangle size={48} className="mb-4 text-red-400" />
        <p className="text-lg font-medium mb-2">Erreur de chargement</p>
        <p className="text-sm mb-4">{contractsQuery.error?.message || 'Impossible de charger les contrats'}</p>
        <button
          className="ds-btn ds-btn-primary px-4 py-2 text-sm rounded-lg"
          onClick={() => contractsQuery.refetch()}
        >
          <RefreshCw size={14} className="mr-1 inline" />
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={24} className="text-[var(--accent)]" />
            Gestion des Contrats
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Contrats clients et fournisseurs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="ds-btn ds-btn-secondary flex items-center gap-1.5 text-sm"
            onClick={() => contractsQuery.refetch()}
            disabled={contractsQuery.isFetching}
          >
            <RefreshCw size={14} className={contractsQuery.isFetching ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button className="ds-btn ds-btn-secondary flex items-center gap-1.5 text-sm">
            <Download size={14} />
            Exporter
          </button>
          <button
            className="ds-btn ds-btn-primary flex items-center gap-1.5 text-sm"
            onClick={() => setShowNewModal(true)}
          >
            <Plus size={14} />
            Nouveau contrat
          </button>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: FileText, color: 'text-[var(--accent)]', label: 'Total contrats', value: stats.total },
          { icon: CheckCircle, color: 'text-[var(--success)]', label: 'Actifs', value: stats.active },
          { icon: Clock, color: 'text-[var(--warning)]', label: 'En attente', value: stats.pendingSignature },
          { icon: AlertTriangle, color: 'text-[var(--danger)]', label: 'Expirent bientot', value: stats.expiringSoon },
          { icon: DollarSign, color: 'text-[var(--accent)]', label: 'Valeur active', value: formatCurrency(stats.totalValue), wide: true }
        ].map((kpi, i) => (
          <div key={i} className={`ds-card p-5 ${kpi.wide ? 'col-span-2 md:col-span-1' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon size={18} className={kpi.color} />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── Charts ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart - Monthly value */}
        <div className="lg:col-span-2 ds-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Valeur mensuelle des contrats</h3>
          {monthlyValue.some((m) => m.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyValue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  formatter={(v) => [formatCurrency(v), 'Valeur']}
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-56 text-gray-400 text-sm">
              Aucune donnee a afficher
            </div>
          )}
        </div>

        {/* Pie Chart - Type distribution */}
        <div className="ds-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Repartition par type</h3>
          {typeDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [`${v} contrat${v > 1 ? 's' : ''}`, name]}
                    contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-3">
                {typeDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-44 text-gray-400 text-sm">
              Aucun contrat
            </div>
          )}
        </div>
      </div>

      {/* ── Search & Filters ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="ds-input w-full pl-9 pr-4 py-2 text-sm"
            placeholder="Rechercher un contrat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="ds-input py-2 px-3 text-sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tous types</option>
          {Object.entries(CONTRACT_TYPES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          className="ds-input py-2 px-3 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tous statuts</option>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* ── Contracts Table ────────────────────────────────────────── */}
      <div className="ds-card overflow-hidden overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Contrat</th>
                <th className="text-left">Type</th>
                <th className="text-left">Client</th>
                <th className="text-left">Valeur</th>
                <th className="text-left">Periode</th>
                <th className="text-left">Expiration</th>
                <th className="text-left">Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <FileText size={40} className="mb-3 opacity-40" />
                      <p className="text-sm">Aucun contrat trouve</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => {
                  const daysLeft = contract.daysLeft;
                  const clientName = companyMap[contract.client_id] || '-';
                  return (
                    <tr key={contract.id} className="group">
                      <td>
                        <div className="font-medium text-gray-800 text-sm">{contract.title || 'Sans titre'}</div>
                        {contract.renewal_type && (
                          <div className="text-xs text-gray-400 mt-0.5 capitalize">{contract.renewal_type}</div>
                        )}
                      </td>
                      <td>{getTypeBadge(contract.type)}</td>
                      <td>
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Building2 size={14} className="text-gray-400 shrink-0" />
                          {clientName}
                        </div>
                      </td>
                      <td className="font-medium text-sm text-gray-800">
                        {contract.value ? formatCurrency(contract.value) : '-'}
                      </td>
                      <td>
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {contract.start_date
                            ? new Date(contract.start_date).toLocaleDateString('fr-CH')
                            : '-'}
                          {' - '}
                          {contract.end_date
                            ? new Date(contract.end_date).toLocaleDateString('fr-CH')
                            : '-'}
                        </div>
                      </td>
                      <td>
                        {daysLeft !== null ? (
                          <span
                            className={`text-xs font-medium ${
                              daysLeft <= 0
                                ? 'text-[var(--danger)]'
                                : daysLeft <= 30
                                ? 'text-[var(--danger)]'
                                : daysLeft <= 90
                                ? 'text-[var(--warning)]'
                                : 'text-gray-500'
                            }`}
                          >
                            {daysLeft > 0 ? `${daysLeft} jours` : 'Expire'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td>{getStatusBadge(contract.computedStatus)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                            onClick={() => setSelectedContract(contract)}
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                          {contract.computedStatus === 'pending-signature' && (
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                              onClick={() => handleSendForSignature(contract)}
                              title="Envoyer pour signature"
                            >
                              <Send size={15} />
                            </button>
                          )}
                          <button
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-[var(--danger)] transition-colors"
                            onClick={() => handleDelete(contract.id)}
                            disabled={deleteMutation.isPending}
                            title="Supprimer"
                          >
                            {deleteMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Modal ───────────────────────────────────────────── */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          clientName={companyMap[selectedContract.client_id] || '-'}
          onClose={() => setSelectedContract(null)}
          getTypeBadge={getTypeBadge}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* ── Create Modal ───────────────────────────────────────────── */}
      {showNewModal && (
        <CreateContractModal
          selectedCompany={selectedCompany}
          companies={companiesQuery.data || []}
          onClose={() => setShowNewModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
};

// ── Detail Modal ───────────────────────────────────────────────────
const ContractDetailModal = ({ contract, clientName, onClose, getTypeBadge, getStatusBadge }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{contract.title || 'Sans titre'}</h3>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            <Building2 size={14} />
            {clientName}
          </p>
        </div>
        <button
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
        >
          <span className="text-xl leading-none">&times;</span>
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
              {getTypeBadge(contract.type)}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Statut</p>
              {getStatusBadge(contract.computedStatus || contract.status)}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Valeur</p>
              <span className="text-xl font-bold text-[var(--success)]">
                {contract.value ? formatCurrency(contract.value) : 'N/A'}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Periode</p>
              <span className="text-sm text-gray-700">
                {contract.start_date ? new Date(contract.start_date).toLocaleDateString('fr-CH') : '-'}
                {' - '}
                {contract.end_date ? new Date(contract.end_date).toLocaleDateString('fr-CH') : '-'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Renouvellement</p>
              <span className="text-sm text-gray-700 capitalize">{contract.renewal_type || '-'}</span>
            </div>
            {contract.date_created && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date de creation</p>
                <span className="text-sm text-gray-700">
                  {new Date(contract.date_created).toLocaleDateString('fr-CH')}
                </span>
              </div>
            )}
          </div>
        </div>

        {contract.description && (
          <div className="mt-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Description</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
              {contract.description}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-100">
        <button className="ds-btn ds-btn-secondary text-sm" onClick={onClose}>
          Fermer
        </button>
        <button className="ds-btn ds-btn-secondary flex items-center gap-1.5 text-sm">
          <Download size={14} />
          Telecharger PDF
        </button>
      </div>
    </div>
  </div>
);

// ── Create Modal ───────────────────────────────────────────────────
const CreateContractModal = ({ selectedCompany, companies, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'service',
    client_id: '',
    value: '',
    start_date: '',
    end_date: '',
    renewal_type: 'annual',
    status: 'draft',
    description: ''
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      value: formData.value ? parseFloat(formData.value) : 0,
      client_id: formData.client_id || null
    };
    if (selectedCompany && selectedCompany !== 'all') {
      payload.owner_company = selectedCompany;
    }
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Nouveau contrat</h3>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onClose}
            >
              <span className="text-xl leading-none">&times;</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du contrat <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                className="ds-input w-full text-sm"
                placeholder="ex: Contrat de service - Client"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="ds-input w-full text-sm"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  {Object.entries(CONTRACT_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  className="ds-input w-full text-sm"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client / Fournisseur</label>
              <select
                className="ds-input w-full text-sm"
                value={formData.client_id}
                onChange={(e) => handleChange('client_id', e.target.value)}
              >
                <option value="">-- Selectionner --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valeur (CHF)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="ds-input w-full text-sm"
                placeholder="0.00"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de debut</label>
                <input
                  type="date"
                  className="ds-input w-full text-sm"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input
                  type="date"
                  className="ds-input w-full text-sm"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Renouvellement</label>
              <select
                className="ds-input w-full text-sm"
                value={formData.renewal_type}
                onChange={(e) => handleChange('renewal_type', e.target.value)}
              >
                <option value="annual">Annuel</option>
                <option value="biennial">Bisannuel</option>
                <option value="monthly">Mensuel</option>
                <option value="none">Aucun</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="ds-input w-full text-sm"
                rows="3"
                placeholder="Description du contrat..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-100">
            <button type="button" className="ds-btn ds-btn-secondary text-sm" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="ds-btn ds-btn-primary flex items-center gap-1.5 text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creation...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Creer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractsManager;

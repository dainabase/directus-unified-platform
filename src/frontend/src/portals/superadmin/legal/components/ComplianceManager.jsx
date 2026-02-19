/**
 * ComplianceManager — Connected to Directus `compliance` collection
 * Tracks certifications, regulations, and audit compliance status.
 *
 * @version 2.0.0 — Replaced mock data with live Directus data
 */
import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Shield, CheckCircle, AlertTriangle, Clock, FileText, Calendar,
  Users, Target, TrendingUp, Download, RefreshCw, Eye, Edit2,
  Plus, Filter, AlertOctagon, CheckSquare, XCircle
} from 'lucide-react'
import {
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts'
import toast from 'react-hot-toast'
import api from '../../../../lib/axios'

// ── Constants ──────────────────────────────────────────────

const COMPLIANCE_TYPES = {
  'data-privacy': { label: 'Protection donnees', color: 'blue' },
  security: { label: 'Securite', color: 'green' },
  financial: { label: 'Finance', color: 'yellow' },
  employment: { label: 'Emploi', color: 'indigo' }
}

const STATUS_CONFIG = {
  compliant: { label: 'Conforme', color: 'green', badgeClass: 'glass-badge-success', icon: CheckCircle },
  partial: { label: 'Partiellement', color: 'yellow', badgeClass: 'glass-badge-warning', icon: AlertTriangle },
  'non-compliant': { label: 'Non conforme', color: 'red', badgeClass: 'glass-badge-danger', icon: XCircle },
  'in-progress': { label: 'En cours', color: 'blue', badgeClass: 'glass-badge-primary', icon: Clock }
}

const SCORE_MAP = {
  compliant: 100,
  partial: 70,
  'in-progress': 50,
  'non-compliant': 30
}

const PIE_COLORS = {
  compliant: '#10b981',
  partial: '#f59e0b',
  'non-compliant': '#ef4444',
  'in-progress': '#3b82f6'
}

const PIE_LABELS = {
  compliant: 'Conforme',
  partial: 'Partiel',
  'non-compliant': 'Non conforme',
  'in-progress': 'En cours'
}

// ── Fetch function ─────────────────────────────────────────

const fetchCompliance = async (company) => {
  try {
    const filter = company && company !== 'all'
      ? { owner_company: { _eq: company } }
      : {}
    const res = await api.get('/items/compliance', {
      params: { filter, fields: ['*'], sort: ['-date_created'], limit: -1 }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

// ── Helpers ────────────────────────────────────────────────

const getScoreColor = (score) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

const getScoreBarColor = (score) => {
  if (score >= 90) return 'bg-green-500'
  if (score >= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getRadialFill = (score) => {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

// ── Component ──────────────────────────────────────────────

const ComplianceManager = ({ selectedCompany }) => {
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['compliance', selectedCompany],
    queryFn: () => fetchCompliance(selectedCompany),
    staleTime: 1000 * 60 * 2
  })

  // Enrich items with derived score
  const enrichedItems = useMemo(() =>
    items.map(item => ({
      ...item,
      score: SCORE_MAP[item.status] ?? 50
    })),
    [items]
  )

  // Client-side filters
  const filteredItems = useMemo(() =>
    enrichedItems.filter(item => {
      const matchesType = filterType === 'all' || item.compliance_type === filterType
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      return matchesType && matchesStatus
    }),
    [enrichedItems, filterType, filterStatus]
  )

  // Stats
  const stats = useMemo(() => {
    const total = enrichedItems.length
    const compliant = enrichedItems.filter(i => i.status === 'compliant').length
    const avgScore = total > 0
      ? Math.round(enrichedItems.reduce((sum, i) => sum + i.score, 0) / total)
      : 0
    const now = new Date()
    const pendingAudits = enrichedItems.filter(i => {
      if (!i.due_date) return false
      const due = new Date(i.due_date)
      const diff = (due - now) / (1000 * 60 * 60 * 24)
      return diff <= 60 && diff > 0
    }).length
    const nonCompliant = enrichedItems.filter(i => i.status === 'non-compliant').length

    return { total, compliant, avgScore, pendingAudits, nonCompliant }
  }, [enrichedItems])

  // Radial bar data for global score
  const overallScore = useMemo(() => [{
    name: 'Score',
    value: stats.avgScore,
    fill: getRadialFill(stats.avgScore)
  }], [stats.avgScore])

  // Pie chart data for status distribution
  const statusDistribution = useMemo(() => {
    const counts = {}
    enrichedItems.forEach(item => {
      counts[item.status] = (counts[item.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      name: PIE_LABELS[status] || status,
      value: count,
      color: PIE_COLORS[status] || '#6b7280'
    }))
  }, [enrichedItems])

  // Refresh handler
  const handleRefresh = () => {
    refetch()
    toast.success('Donnees actualisees')
  }

  // ── Render helpers ────────────────────────────────────────

  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status]
    if (!config) return <span className="glass-badge">{status}</span>
    const Icon = config.icon
    return (
      <span className={`glass-badge ${config.badgeClass}`}>
        <Icon size={12} className="mr-1" />
        {config.label}
      </span>
    )
  }

  const renderTypeBadge = (type) => {
    const config = COMPLIANCE_TYPES[type]
    const colorMap = {
      blue: 'glass-badge-primary',
      green: 'glass-badge-success',
      yellow: 'glass-badge-warning',
      indigo: 'glass-badge-primary'
    }
    return (
      <span className={`glass-badge ${colorMap[config?.color] || ''}`}>
        {config?.label || type}
      </span>
    )
  }

  // ── Skeleton loader ────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="h-10 glass-skeleton rounded-lg w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="glass-card p-5">
              <div className="h-4 glass-skeleton rounded mb-3 w-24" />
              <div className="h-8 glass-skeleton rounded w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-5">
              <div className="h-48 glass-skeleton rounded-lg" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-5">
              <div className="h-40 glass-skeleton rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Conformite & Compliance
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Suivi des certifications et audits reglementaires
          </p>
        </div>
        <div className="flex gap-2">
          <button className="glass-button text-gray-600" onClick={handleRefresh}>
            <RefreshCw size={16} className="mr-1 inline" />
            Actualiser
          </button>
          <button className="glass-button text-gray-600">
            <Download size={16} className="mr-1 inline" />
            Rapport
          </button>
          <button className="glass-button bg-blue-600 text-white hover:bg-blue-700">
            <Plus size={16} className="mr-1 inline" />
            Nouvel audit
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} className="text-blue-600" />
            <span className="text-sm text-gray-500">Reglementations</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-sm text-gray-500">Conformes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.compliant}</p>
          {stats.total > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((stats.compliant / stats.total) * 100)}% du total
            </p>
          )}
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-blue-600" />
            <span className="text-sm text-gray-500">Score moyen</span>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(stats.avgScore)}`}>
            {stats.avgScore}%
          </p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={18} className="text-yellow-600" />
            <span className="text-sm text-gray-500">Audits proches</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingAudits}</p>
          <p className="text-xs text-gray-500 mt-1">Dans 60 jours</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon size={18} className="text-red-600" />
            <span className="text-sm text-gray-500">Non conformes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.nonCompliant}</p>
          {stats.nonCompliant > 0 && (
            <p className="text-xs text-red-500 mt-1">Action requise</p>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radial Bar — Global Score */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Score Global
          </h3>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                data={overallScore}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center -mt-10">
              <p className={`text-3xl font-bold ${getScoreColor(stats.avgScore)}`}>
                {stats.avgScore}%
              </p>
              <p className="text-sm text-gray-500">Conformite globale</p>
            </div>
          </div>
        </div>

        {/* Pie Chart — Status Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Repartition par statut
          </h3>
          {statusDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {statusDistribution.map(item => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-500">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Aucune donnee
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
        </div>
        <select
          className="glass-button text-sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Toutes categories</option>
          {Object.entries(COMPLIANCE_TYPES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          className="glass-button text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tous statuts</option>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Compliance Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`glass-card p-5 cursor-pointer ${
              item.status === 'non-compliant' ? 'border-red-300' : ''
            }`}
            onClick={() => setSelectedItem(item)}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900 leading-tight pr-2">
                {item.title}
              </h4>
              <button
                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); setSelectedItem(item) }}
                title="Voir details"
              >
                <Eye size={16} />
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {renderTypeBadge(item.compliance_type)}
              {renderStatusBadge(item.status)}
            </div>

            {/* Risk Level */}
            {item.risk_level && (
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">Risque:</span>
                <span className={`text-xs font-medium ${
                  item.risk_level === 'critical' ? 'text-red-600' :
                  item.risk_level === 'high' ? 'text-orange-600' :
                  item.risk_level === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {item.risk_level === 'critical' ? 'Critique' :
                   item.risk_level === 'high' ? 'Eleve' :
                   item.risk_level === 'medium' ? 'Moyen' : 'Faible'}
                </span>
              </div>
            )}

            {/* Score bar */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500">Score de conformite</span>
                <span className={`text-xs font-medium ${getScoreColor(item.score)}`}>
                  {item.score}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getScoreBarColor(item.score)}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              {item.due_date && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Echeance: {new Date(item.due_date).toLocaleDateString('fr-CH')}
                </span>
              )}
              {item.date_created && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(item.date_created).toLocaleDateString('fr-CH')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && !isLoading && (
        <div className="glass-card p-12 text-center">
          <Shield size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">Aucune reglementation trouvee</p>
          <p className="text-xs text-gray-400 mt-1">
            Ajustez les filtres ou ajoutez un nouvel audit
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="glass-modal w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedItem.title}</h3>
                <div className="flex gap-2 mt-2">
                  {renderTypeBadge(selectedItem.compliance_type)}
                  {renderStatusBadge(selectedItem.status)}
                  {selectedItem.risk_level && (
                    <span className={`glass-badge ${
                      selectedItem.risk_level === 'critical' || selectedItem.risk_level === 'high'
                        ? 'glass-badge-danger'
                        : selectedItem.risk_level === 'medium'
                        ? 'glass-badge-warning'
                        : 'glass-badge-success'
                    }`}>
                      <Target size={12} className="mr-1" />
                      {selectedItem.risk_level === 'critical' ? 'Critique' :
                       selectedItem.risk_level === 'high' ? 'Eleve' :
                       selectedItem.risk_level === 'medium' ? 'Moyen' : 'Faible'}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                onClick={() => setSelectedItem(null)}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Score */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Score de conformite
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getScoreBarColor(selectedItem.score)}`}
                          style={{ width: `${selectedItem.score}%` }}
                        />
                      </div>
                      <span className={`text-xl font-bold ${getScoreColor(selectedItem.score)}`}>
                        {selectedItem.score}%
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedItem.description && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Description
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedItem.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {selectedItem.due_date && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Echeance / Prochain audit
                      </p>
                      <p className="text-sm text-gray-700 flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(selectedItem.due_date).toLocaleDateString('fr-CH')}
                      </p>
                    </div>
                  )}
                  {selectedItem.date_created && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Date de creation
                      </p>
                      <p className="text-sm text-gray-700 flex items-center gap-1">
                        <Clock size={14} className="text-gray-400" />
                        {new Date(selectedItem.date_created).toLocaleDateString('fr-CH')}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 pt-2">
                    <button className="glass-button text-sm text-gray-600 w-full flex items-center justify-center gap-2">
                      <FileText size={14} />
                      Voir documentation
                    </button>
                    <button className="glass-button text-sm text-gray-600 w-full flex items-center justify-center gap-2">
                      <Calendar size={14} />
                      Planifier audit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-100">
              <button
                className="glass-button text-gray-600"
                onClick={() => setSelectedItem(null)}
              >
                Fermer
              </button>
              <button className="glass-button bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1">
                <Edit2 size={14} />
                Gerer exigences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplianceManager

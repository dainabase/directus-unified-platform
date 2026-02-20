/**
 * MilestoneInvoicingPage — Milestone-based Invoicing for Project Billing
 * Story 3.9 — Links project deliverables to client invoices.
 *
 * Features:
 * - Summary KPI cards (total budget, invoiced, remaining, billing rate)
 * - Active projects grid with budget progress
 * - Milestone/deliverable table per project with invoice status
 * - Checkbox selection to generate invoices from milestones
 * - Invoice generation modal with TVA selection (8.1%, 2.6%, 3.8%)
 *
 * Swiss VAT rates (CRITICAL — AFC 2025+):
 *   Standard:      8.1%
 *   Reduced:       2.6%
 *   Accommodation: 3.8%
 *
 * @version 1.0.0
 * @date 2026-02-20
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Milestone,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  Clock,
  CreditCard,
  Receipt,
  X,
  Check,
  TrendingUp,
  Wallet,
  BarChart3,
  CircleDollarSign
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'
import api from '../../../../lib/axios'

// ── Swiss VAT rates — NEVER change without AFC directive ──

const VAT_RATES = [
  { key: 'standard',      rate: 0.081, label: 'Taux normal',  display: '8.1%' },
  { key: 'reduced',       rate: 0.026, label: 'Taux reduit',  display: '2.6%' },
  { key: 'accommodation', rate: 0.038, label: 'Hebergement',  display: '3.8%' }
]

// ── Invoice status config ──

const INVOICE_STATUS_CONFIG = {
  not_invoiced:       { label: 'Non facture',             bg: 'bg-gray-100',   text: 'text-gray-600',   icon: Clock },
  partially_invoiced: { label: 'Partiellement facture',   bg: 'bg-amber-50',   text: 'text-amber-700',  icon: FileText },
  fully_invoiced:     { label: 'Facture',                 bg: 'bg-green-50',   text: 'text-green-700',  icon: CheckCircle2 },
  paid:               { label: 'Paye',                    bg: 'bg-blue-50',    text: 'text-blue-700',   icon: CreditCard }
}

// ── Formatters ──

const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2
  }).format(amount || 0)

const formatPercent = (value) =>
  `${Math.round((value || 0) * 100)}%`

const formatDate = (dateStr) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// ── StatusBadge ──

const InvoiceStatusBadge = ({ status }) => {
  const cfg = INVOICE_STATUS_CONFIG[status] || INVOICE_STATUS_CONFIG.not_invoiced
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}

// ── Progress Ring (SVG) ──

const ProgressRing = ({ value, size = 56, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(Math.max(value || 0, 0), 1)
  const offset = circumference * (1 - pct)

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#0071E3"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Data fetching helpers ──

async function fetchActiveProjects(companyFilter) {
  const filter = {
    status: { _in: ['active', 'in_progress'] },
    ...companyFilter
  }

  const { data } = await api.get('/items/projects', {
    params: {
      filter,
      fields: ['id', 'name', 'client_name', 'total_budget', 'currency', 'owner_company', 'date_created'],
      sort: ['-date_created'],
      limit: -1
    }
  })

  return data?.data || []
}

async function fetchProjectDeliverables(projectId) {
  const { data } = await api.get('/items/deliverables', {
    params: {
      filter: { project_id: { _eq: projectId } },
      fields: ['*'],
      sort: ['sort_order'],
      limit: -1
    }
  })

  return data?.data || []
}

async function fetchAllDeliverables(companyFilter) {
  const filter = companyFilter
  const { data } = await api.get('/items/deliverables', {
    params: {
      filter,
      fields: ['id', 'project_id', 'amount', 'invoice_status'],
      limit: -1
    }
  })

  return data?.data || []
}

// ── Main Component ──

const MilestoneInvoicingPage = ({ selectedCompany }) => {
  const queryClient = useQueryClient()
  const [expandedProjectId, setExpandedProjectId] = useState(null)
  const [selectedMilestones, setSelectedMilestones] = useState([])
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedVatRate, setSelectedVatRate] = useState(VAT_RATES[0])
  const [paymentTerms, setPaymentTerms] = useState(30)

  const companyFilter = selectedCompany && selectedCompany !== 'all'
    ? { owner_company: { _eq: selectedCompany } }
    : {}

  // ── Fetch active projects ──

  const {
    data: projects = [],
    isLoading: loadingProjects,
    error: errorProjects,
    refetch: refetchProjects
  } = useQuery({
    queryKey: ['milestone-projects', selectedCompany],
    queryFn: () => fetchActiveProjects(companyFilter),
    staleTime: 60_000
  })

  // ── Fetch all deliverables for aggregation ──

  const {
    data: allDeliverables = [],
    isLoading: loadingDeliverables
  } = useQuery({
    queryKey: ['milestone-all-deliverables', selectedCompany],
    queryFn: () => fetchAllDeliverables(companyFilter),
    staleTime: 60_000
  })

  // ── Fetch deliverables for expanded project ──

  const {
    data: projectDeliverables = [],
    isLoading: loadingProjectDeliverables
  } = useQuery({
    queryKey: ['milestone-deliverables', expandedProjectId],
    queryFn: () => fetchProjectDeliverables(expandedProjectId),
    enabled: !!expandedProjectId,
    staleTime: 30_000
  })

  // ── Aggregated data ──

  const aggregation = useMemo(() => {
    const projectMap = new Map()

    for (const d of allDeliverables) {
      if (!d.project_id) continue
      if (!projectMap.has(d.project_id)) {
        projectMap.set(d.project_id, { totalInvoiced: 0, totalAmount: 0 })
      }
      const entry = projectMap.get(d.project_id)
      const amount = parseFloat(d.amount) || 0
      entry.totalAmount += amount
      if (d.invoice_status === 'fully_invoiced' || d.invoice_status === 'paid') {
        entry.totalInvoiced += amount
      } else if (d.invoice_status === 'partially_invoiced') {
        entry.totalInvoiced += amount * 0.5
      }
    }

    let totalBudget = 0
    let totalInvoiced = 0

    for (const p of projects) {
      const budget = parseFloat(p.total_budget) || 0
      totalBudget += budget

      const deliverableData = projectMap.get(p.id)
      if (deliverableData) {
        totalInvoiced += deliverableData.totalInvoiced
      }
    }

    const remaining = totalBudget - totalInvoiced
    const billingRate = totalBudget > 0 ? totalInvoiced / totalBudget : 0

    return {
      totalBudget,
      totalInvoiced,
      remaining,
      billingRate,
      projectMap
    }
  }, [projects, allDeliverables])

  // ── Per-project billing percentage ──

  const getProjectBillingPct = useCallback((projectId, budget) => {
    const data = aggregation.projectMap.get(projectId)
    if (!data || !budget) return 0
    return Math.min(data.totalInvoiced / parseFloat(budget), 1)
  }, [aggregation])

  // ── Milestone selection ──

  const toggleMilestone = useCallback((deliverable) => {
    setSelectedMilestones((prev) => {
      const exists = prev.find((m) => m.id === deliverable.id)
      if (exists) return prev.filter((m) => m.id !== deliverable.id)
      return [...prev, deliverable]
    })
  }, [])

  const selectableMilestones = useMemo(
    () => projectDeliverables.filter(
      (d) => d.invoice_status === 'not_invoiced' || d.invoice_status === 'partially_invoiced' || !d.invoice_status
    ),
    [projectDeliverables]
  )

  const toggleAll = useCallback(() => {
    if (selectedMilestones.length === selectableMilestones.length) {
      setSelectedMilestones([])
    } else {
      setSelectedMilestones([...selectableMilestones])
    }
  }, [selectableMilestones, selectedMilestones])

  // ── Invoice computation ──

  const invoiceSummary = useMemo(() => {
    const subtotal = selectedMilestones.reduce(
      (sum, m) => sum + (parseFloat(m.amount) || 0), 0
    )
    const tva = subtotal * selectedVatRate.rate
    const total = subtotal + tva
    return { subtotal, tva, total }
  }, [selectedMilestones, selectedVatRate])

  // ── Create invoice mutation ──

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const currentProject = projects.find((p) => p.id === expandedProjectId)
      if (!currentProject) throw new Error('Projet introuvable')

      const invoiceData = {
        status: 'draft',
        client_name: currentProject.client_name || currentProject.name,
        project_id: expandedProjectId,
        total: invoiceSummary.subtotal,
        tax_rate: selectedVatRate.rate * 100,
        tax_amount: invoiceSummary.tva,
        total_ttc: invoiceSummary.total,
        currency: currentProject.currency || 'CHF',
        payment_terms: `${paymentTerms} jours net`,
        date_issued: new Date().toISOString().split('T')[0],
        date_due: new Date(Date.now() + paymentTerms * 86400000).toISOString().split('T')[0],
        notes: `Facture jalons: ${selectedMilestones.map((m) => m.name || m.title).join(', ')}`,
        ...(selectedCompany && selectedCompany !== 'all'
          ? { owner_company: selectedCompany }
          : currentProject.owner_company
            ? { owner_company: currentProject.owner_company }
            : {})
      }

      const { data: invoiceRes } = await api.post('/items/client_invoices', invoiceData)
      const invoiceId = invoiceRes?.data?.id

      const updatePromises = selectedMilestones.map((m) =>
        api.patch(`/items/deliverables/${m.id}`, {
          invoice_status: 'fully_invoiced',
          invoice_id: invoiceId || null
        })
      )

      await Promise.all(updatePromises)

      return invoiceRes?.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestone-projects'] })
      queryClient.invalidateQueries({ queryKey: ['milestone-all-deliverables'] })
      queryClient.invalidateQueries({ queryKey: ['milestone-deliverables'] })
      setSelectedMilestones([])
      setShowInvoiceModal(false)
    }
  })

  // ── Expand/collapse project ──

  const handleProjectClick = useCallback((projectId) => {
    setSelectedMilestones([])
    setExpandedProjectId((prev) => (prev === projectId ? null : projectId))
  }, [])

  // ── Refresh ──

  const handleRefresh = useCallback(() => {
    refetchProjects()
    queryClient.invalidateQueries({ queryKey: ['milestone-all-deliverables'] })
    if (expandedProjectId) {
      queryClient.invalidateQueries({ queryKey: ['milestone-deliverables', expandedProjectId] })
    }
  }, [refetchProjects, queryClient, expandedProjectId])

  // ── Loading state ──

  const isLoading = loadingProjects || loadingDeliverables

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#0071E3]" />
        <span className="ml-3 text-gray-500">Chargement des projets...</span>
      </div>
    )
  }

  if (errorProjects) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold text-red-800 mb-2">Erreur de chargement</h3>
        <p className="text-sm text-red-600 mb-4">
          {errorProjects.message || 'Impossible de charger les projets'}
        </p>
        <button onClick={handleRefresh} className="ds-btn ds-btn-primary">
          <RefreshCw size={14} className="mr-2" />
          Reessayer
        </button>
      </div>
    )
  }

  const expandedProject = projects.find((p) => p.id === expandedProjectId)

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Milestone size={24} className="text-[#0071E3]" />
            Facturation par jalons
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {projects.length} projet{projects.length !== 1 ? 's' : ''} actif{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="ds-btn ds-btn-ghost inline-flex items-center gap-2"
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ds-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Budget total
            </span>
            <Wallet size={18} className="text-[#0071E3]" />
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCHF(aggregation.totalBudget)}</p>
          <p className="text-xs text-gray-400 mt-1">Projets actifs</p>
        </div>

        <div className="ds-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Total facture
            </span>
            <Receipt size={18} className="text-green-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCHF(aggregation.totalInvoiced)}</p>
          <p className="text-xs text-gray-400 mt-1">Jalons factures</p>
        </div>

        <div className="ds-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Reste a facturer
            </span>
            <CircleDollarSign size={18} className="text-amber-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCHF(aggregation.remaining)}</p>
          <p className="text-xs text-gray-400 mt-1">En attente</p>
        </div>

        <div className="ds-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Taux de facturation
            </span>
            <BarChart3 size={18} className="text-[#0071E3]" />
          </div>
          <div className="flex items-center gap-3">
            <ProgressRing value={aggregation.billingRate} size={48} strokeWidth={4} />
            <p className="text-xl font-bold text-gray-900">
              {formatPercent(aggregation.billingRate)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Projects Grid ── */}
      {projects.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <FileText size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun projet actif</h3>
          <p className="text-sm text-gray-400">
            Les projets actifs apparaitront ici pour la facturation par jalons.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Projets actifs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => {
              const budget = parseFloat(project.total_budget) || 0
              const pct = getProjectBillingPct(project.id, budget)
              const isExpanded = expandedProjectId === project.id

              return (
                <button
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className={`ds-card p-5 text-left w-full transition-colors ${
                    isExpanded
                      ? 'ring-2 ring-[#0071E3] ring-offset-1'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {project.client_name || 'Client non defini'}
                      </p>
                    </div>
                    {isExpanded
                      ? <ChevronUp size={16} className="text-[#0071E3] flex-shrink-0 ml-2" />
                      : <ChevronDown size={16} className="text-gray-400 flex-shrink-0 ml-2" />}
                  </div>

                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-medium text-gray-900">{formatCHF(budget)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-400">Facture</span>
                    <span className="text-gray-600">{formatPercent(pct)}</span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round(pct * 100)}%`,
                        backgroundColor: '#0071E3'
                      }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Milestones Table (expanded project) ── */}
      {expandedProjectId && expandedProject && (
        <div className="ds-card overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="ds-card-title">
                  Jalons — {expandedProject.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {expandedProject.client_name || 'Client non defini'}
                </p>
              </div>
              {selectedMilestones.length > 0 && (
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="ds-btn ds-btn-primary inline-flex items-center gap-2"
                >
                  <Receipt size={14} />
                  Generer la facture ({selectedMilestones.length})
                </button>
              )}
            </div>
          </div>

          {loadingProjectDeliverables ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#0071E3]" />
              <span className="ml-2 text-sm text-gray-500">Chargement des jalons...</span>
            </div>
          ) : projectDeliverables.length === 0 ? (
            <div className="p-8 text-center">
              <FileText size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Aucun jalon pour ce projet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectableMilestones.length > 0 &&
                          selectedMilestones.length === selectableMilestones.length
                        }
                        onChange={toggleAll}
                        disabled={selectableMilestones.length === 0}
                        className="rounded border-gray-300 text-[#0071E3] focus:ring-[#0071E3]"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ordre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Jalon / Livrable
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Montant
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      % du budget
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Statut facturation
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Progression
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projectDeliverables.map((d, idx) => {
                    const amount = parseFloat(d.amount) || 0
                    const budget = parseFloat(expandedProject.total_budget) || 1
                    const budgetPct = budget > 0 ? amount / budget : 0
                    const status = d.invoice_status || 'not_invoiced'
                    const isSelectable = status === 'not_invoiced' || status === 'partially_invoiced'
                    const isSelected = selectedMilestones.some((m) => m.id === d.id)

                    const invoicedPct = status === 'fully_invoiced' || status === 'paid'
                      ? 1
                      : status === 'partially_invoiced'
                        ? 0.5
                        : 0

                    return (
                      <tr
                        key={d.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleMilestone(d)}
                            disabled={!isSelectable}
                            className="rounded border-gray-300 text-[#0071E3] focus:ring-[#0071E3] disabled:opacity-30"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                          {d.sort_order ?? idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{d.name || d.title || `Livrable #${idx + 1}`}</p>
                          {d.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                              {d.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCHF(amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {formatPercent(budgetPct)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <InvoiceStatusBadge status={status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-20 bg-gray-100 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${Math.round(invoicedPct * 100)}%`,
                                  backgroundColor: invoicedPct === 1 ? '#16a34a' : '#f59e0b'
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right">
                              {formatPercent(invoicedPct)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Bottom summary bar ── */}
          {selectedMilestones.length > 0 && (
            <div className="p-4 bg-blue-50/50 border-t border-blue-100 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-[#0071E3]">{selectedMilestones.length}</span>
                {' '}jalon{selectedMilestones.length > 1 ? 's' : ''} selectionne{selectedMilestones.length > 1 ? 's' : ''}
                {' — '}
                <span className="font-semibold">{formatCHF(invoiceSummary.subtotal)}</span> HT
              </p>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="ds-btn ds-btn-primary inline-flex items-center gap-2"
              >
                <Receipt size={14} />
                Generer la facture
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Invoice Generation Modal ── */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowInvoiceModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Receipt size={20} className="text-[#0071E3]" />
                Generer la facture
              </h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-5">
              {/* Client info */}
              {expandedProject && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Client</p>
                  <p className="font-medium text-gray-900">
                    {expandedProject.client_name || expandedProject.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Projet : {expandedProject.name}
                  </p>
                </div>
              )}

              {/* Selected milestones */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Jalons selectionnes ({selectedMilestones.length})
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedMilestones.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <span className="text-gray-700 truncate mr-4">
                        {m.name || m.title || `Livrable #${m.id}`}
                      </span>
                      <span className="font-medium text-gray-900 flex-shrink-0">
                        {formatCHF(parseFloat(m.amount) || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TVA rate selector */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Taux de TVA
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {VAT_RATES.map((vr) => (
                    <button
                      key={vr.key}
                      onClick={() => setSelectedVatRate(vr)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedVatRate.key === vr.key
                          ? 'border-[#0071E3] bg-blue-50 text-[#0071E3]'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-xs text-gray-400">{vr.label}</span>
                      <span className="block mt-0.5">{vr.display}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment terms */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Delai de paiement
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(Number(e.target.value))}
                  className="ds-input w-full"
                >
                  <option value={10}>10 jours net</option>
                  <option value={30}>30 jours net</option>
                  <option value={45}>45 jours net</option>
                  <option value={60}>60 jours net</option>
                  <option value={90}>90 jours net</option>
                </select>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sous-total HT</span>
                  <span className="font-medium text-gray-900">
                    {formatCHF(invoiceSummary.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">TVA ({selectedVatRate.display})</span>
                  <span className="font-medium text-gray-900">
                    {formatCHF(invoiceSummary.tva)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-900">Total TTC</span>
                  <span className="font-bold text-[#0071E3] text-lg">
                    {formatCHF(invoiceSummary.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="ds-btn ds-btn-ghost"
                disabled={createInvoiceMutation.isPending}
              >
                Annuler
              </button>
              <button
                onClick={() => createInvoiceMutation.mutate()}
                disabled={createInvoiceMutation.isPending || selectedMilestones.length === 0}
                className="ds-btn ds-btn-primary inline-flex items-center gap-2"
              >
                {createInvoiceMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Creation...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Confirmer et creer
                  </>
                )}
              </button>
            </div>

            {/* Mutation error */}
            {createInvoiceMutation.isError && (
              <div className="mx-5 mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">
                  {createInvoiceMutation.error?.message || 'Erreur lors de la creation de la facture.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MilestoneInvoicingPage

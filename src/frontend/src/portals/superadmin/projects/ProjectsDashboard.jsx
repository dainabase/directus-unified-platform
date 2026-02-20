/**
 * ProjectsDashboard — S-04-06
 * Dashboard analytique projets SuperAdmin.
 * PieChart statuts, BarChart budget par entreprise, LineChart creations/mois,
 * KPI retard moyen, top 5 budgets, taux completion.
 */

import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import {
  TrendingUp, AlertTriangle, CheckCircle2, DollarSign,
  Loader2, FolderKanban, Clock
} from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { fetchProjects, fetchDeliverables, companyLabel, formatCHF } from '../../../services/api/projects'

const STATUS_COLORS = {
  active: '#10b981',
  in_progress: '#6366f1',
  on_hold: '#f59e0b',
  completed: '#3b82f6',
  cancelled: '#ef4444',
  planning: '#9ca3af'
}

const STATUS_LABELS = {
  active: 'Actif',
  in_progress: 'En cours',
  on_hold: 'En pause',
  completed: 'Termine',
  cancelled: 'Annule',
  planning: 'Planification'
}

const COMPANY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

const ProjectsDashboard = ({ selectedCompany }) => {
  const company = selectedCompany === 'all' ? '' : selectedCompany

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects', { company }],
    queryFn: () => fetchProjects({ company }),
    staleTime: 30_000
  })

  const { data: deliverables = [], isLoading: loadingDel } = useQuery({
    queryKey: ['deliverables', { company }],
    queryFn: () => fetchDeliverables({ company }),
    staleTime: 30_000
  })

  const isLoading = loadingProjects || loadingDel

  // 1. Status distribution (PieChart)
  const statusData = useMemo(() => {
    const map = {}
    projects.forEach(p => {
      const s = p.status || 'active'
      map[s] = (map[s] || 0) + 1
    })
    return Object.entries(map).map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || '#9ca3af'
    }))
  }, [projects])

  // 2. Budget by company (BarChart)
  const budgetByCompany = useMemo(() => {
    const map = {}
    projects.forEach(p => {
      if (!p.owner_company) return
      const label = companyLabel(p.owner_company)
      map[label] = (map[label] || 0) + (p.budget || 0)
    })
    return Object.entries(map).map(([name, budget], i) => ({
      name: name.length > 12 ? name.slice(0, 12) + '...' : name,
      budget: Math.round(budget),
      fill: COMPANY_COLORS[i % COMPANY_COLORS.length]
    }))
  }, [projects])

  // 3. Projects by month (LineChart, 6 months)
  const projectsByMonth = useMemo(() => {
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(now, i)
      const start = startOfMonth(m)
      const end = endOfMonth(m)
      const label = format(m, 'MMM yy', { locale: fr })
      const count = projects.filter(p => {
        const d = p.date_created ? new Date(p.date_created) : null
        return d && d >= start && d <= end
      }).length
      months.push({ name: label, projets: count })
    }
    return months
  }, [projects])

  // 4. Average deliverable delay (KPI)
  const avgDelay = useMemo(() => {
    const overdue = deliverables.filter(d => d.status !== 'done' && d.due_date && new Date(d.due_date) < new Date())
    if (overdue.length === 0) return 0
    const totalDays = overdue.reduce((s, d) => s + differenceInDays(new Date(), new Date(d.due_date)), 0)
    return Math.round(totalDays / overdue.length)
  }, [deliverables])

  // 5. Top 5 projects by budget
  const topBudgets = useMemo(() => {
    return [...projects].sort((a, b) => (b.budget || 0) - (a.budget || 0)).slice(0, 5)
  }, [projects])

  // 6. Completion rate
  const completionRate = useMemo(() => {
    if (projects.length === 0) return 0
    const completed = projects.filter(p => p.status === 'completed').length
    return Math.round((completed / projects.length) * 100)
  }, [projects])

  // Total overdue deliverables
  const overdueCount = useMemo(() => {
    return deliverables.filter(d => d.status !== 'done' && d.due_date && new Date(d.due_date) < new Date()).length
  }, [deliverables])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Analytique</p>
        <h2 className="text-xl font-bold text-gray-900">Tableau de bord Projets</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FolderKanban size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Total projets</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
        </div>
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-xs text-gray-500">Taux completion</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{completionRate}%</p>
        </div>
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs text-gray-500">Retard moyen</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{avgDelay}j</p>
          <p className="text-xs text-gray-400">{overdueCount} livrable(s) en retard</p>
        </div>
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-blue-400" />
            <span className="text-xs text-gray-500">Budget total</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCHF(projects.reduce((s, p) => s + (p.budget || 0), 0))}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status PieChart */}
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Repartition par statut</h3>
          {statusData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {statusData.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-xs text-gray-600">{s.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12 text-sm">Aucun projet</div>
          )}
        </div>

        {/* Budget by Company BarChart */}
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Budget par entreprise</h3>
          {budgetByCompany.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={budgetByCompany}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => formatCHF(v)} />
                <Bar dataKey="budget" radius={[4, 4, 0, 0]}>
                  {budgetByCompany.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 py-12 text-sm">Aucun budget</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects by Month LineChart */}
        <div className="lg:col-span-2 ds-card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Projets crees par mois</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={projectsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="projets" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Budgets */}
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top 5 budgets</h3>
          {topBudgets.length > 0 ? (
            <div className="space-y-3">
              {topBudgets.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{companyLabel(p.owner_company)}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatCHF(p.budget)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8 text-sm">Aucun projet</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectsDashboard

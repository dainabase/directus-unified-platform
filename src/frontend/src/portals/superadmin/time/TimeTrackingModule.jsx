/**
 * TimeTrackingModule — S-04-03
 * Module Time Tracking SuperAdmin connecte a Directus.
 * Graphiques Recharts, filtres, CRUD.
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Clock, Plus, Search, Edit3, Trash2, Save, X, Loader2, Calendar, Receipt
} from 'lucide-react'
import TimeToInvoiceModule from './TimeToInvoiceModule'
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import toast from 'react-hot-toast'
import { format, startOfWeek, endOfWeek, subWeeks, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  fetchTimeEntries, fetchProjects, createTimeEntry,
  updateTimeEntry, deleteTimeEntry, COMPANIES
} from '../../../services/api/projects'

const PERIODS = [
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: '3months', label: '3 derniers mois' }
]

// ── Form Modal ──────────────────────────────────────────────

const TimeEntryForm = ({ entry, projects, onSave, onCancel }) => {
  const [form, setForm] = useState({
    date: entry?.date?.slice(0, 10) || format(new Date(), 'yyyy-MM-dd'),
    hours: entry?.hours || '',
    project_name: entry?.project_name || entry?.project_id || '',
    description: entry?.description || '',
    owner_company: entry?.owner_company || ''
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.hours || Number(form.hours) <= 0) { toast.error('Heures requises'); return }
    const payload = { ...form, hours: Number(form.hours) }
    onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">{entry ? 'Modifier' : 'Nouvelle saisie'}</h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heures *</label>
              <input type="number" value={form.hours} onChange={(e) => update('hours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" step="0.25" min="0" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projet</label>
            <select value={form.project_name} onChange={(e) => update('project_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">— Choisir —</option>
              {projects.map(p => <option key={p.id} value={p.name || p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={form.description} onChange={(e) => update('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Description..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
            <select value={form.owner_company} onChange={(e) => update('owner_company', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">— Toutes —</option>
              {COMPANIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
              <Save size={14} /> Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────

const TimeTrackingModule = ({ selectedCompany }) => {
  const qc = useQueryClient()
  const company = selectedCompany === 'all' ? '' : selectedCompany

  const [activeTab, setActiveTab] = useState('tracking')
  const [period, setPeriod] = useState('month')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState(null)

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['time-entries', { company }],
    queryFn: () => fetchTimeEntries({ company }),
    staleTime: 30_000
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', { company }],
    queryFn: () => fetchProjects({ company }),
    staleTime: 60_000
  })

  const createMut = useMutation({
    mutationFn: createTimeEntry,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['time-entries'] }); setShowForm(false); setEditEntry(null); toast.success('Entree ajoutee') }
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateTimeEntry(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['time-entries'] }); setShowForm(false); setEditEntry(null); toast.success('Entree mise a jour') }
  })

  const deleteMut = useMutation({
    mutationFn: deleteTimeEntry,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['time-entries'] }); toast.success('Entree supprimee') }
  })

  const handleSave = (formData) => {
    if (editEntry?.id) updateMut.mutate({ id: editEntry.id, data: formData })
    else createMut.mutate(formData)
  }

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette entree ?')) deleteMut.mutate(id)
  }

  // Filter by period
  const periodFiltered = useMemo(() => {
    const now = new Date()
    return entries.filter(e => {
      if (!e.date) return false
      const d = new Date(e.date)
      if (period === 'week') return isWithinInterval(d, { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) })
      if (period === 'month') return isWithinInterval(d, { start: startOfMonth(now), end: endOfMonth(now) })
      return isWithinInterval(d, { start: startOfMonth(subMonths(now, 3)), end: now })
    })
  }, [entries, period])

  const filtered = useMemo(() => {
    if (!search) return periodFiltered
    return periodFiltered.filter(e => (e.project_name || '').toLowerCase().includes(search.toLowerCase()) || (e.description || '').toLowerCase().includes(search.toLowerCase()))
  }, [periodFiltered, search])

  // Stats
  const totalHours = useMemo(() => filtered.reduce((s, e) => s + (e.hours || 0), 0), [filtered])

  // Chart: hours by project (top 5)
  const byProject = useMemo(() => {
    const map = {}
    filtered.forEach(e => {
      const name = e.project_name || 'Sans projet'
      map[name] = (map[name] || 0) + (e.hours || 0)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, hours]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, hours: Math.round(hours * 10) / 10 }))
  }, [filtered])

  // Chart: hours by week (last 6 weeks)
  const byWeek = useMemo(() => {
    const now = new Date()
    const weeks = []
    for (let i = 5; i >= 0; i--) {
      const ws = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
      const we = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
      const label = format(ws, 'dd/MM', { locale: fr })
      const hours = entries.filter(e => e.date && isWithinInterval(new Date(e.date), { start: ws, end: we }))
        .reduce((s, e) => s + (e.hours || 0), 0)
      weeks.push({ name: label, hours: Math.round(hours * 10) / 10 })
    }
    return weeks
  }, [entries])

  if (activeTab === 'billing') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Time Tracking</h1>
            <p className="text-sm text-gray-500 mt-0.5">Suivi du temps de travail</p>
          </div>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button onClick={() => setActiveTab('tracking')} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
            <Clock size={16} /> Saisie du temps
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-white shadow text-blue-600">
            <Receipt size={16} /> Facturation en regie
          </button>
        </div>
        <TimeToInvoiceModule />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-sm text-gray-500 mt-0.5">Suivi du temps de travail</p>
        </div>
        <button onClick={() => { setEditEntry(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
          <Plus size={16} /> Nouvelle entree
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-white shadow text-blue-600">
          <Clock size={16} /> Saisie du temps
        </button>
        <button onClick={() => setActiveTab('billing')} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
          <Receipt size={16} /> Facturation en regie
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Total heures (periode)</p>
          <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Entrees</p>
          <p className="text-2xl font-bold text-blue-600">{filtered.length}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Moyenne / entree</p>
          <p className="text-2xl font-bold text-indigo-600">{filtered.length > 0 ? (totalHours / filtered.length).toFixed(1) : 0}h</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Heures par projet (top 5)</h3>
          {byProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byProject}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}h`} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 py-12 text-sm">Aucune donnee</div>
          )}
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Heures par semaine (6 dernieres)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}h`} />
              <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par projet..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg" />
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg">
          {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Projet</th>
                  <th className="px-4 py-3">Heures</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />Aucune entree de temps
                  </td></tr>
                ) : filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {e.date ? format(new Date(e.date), 'dd MMM yyyy', { locale: fr }) : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{e.project_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                        {e.hours}h
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{e.description || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditEntry(e); setShowForm(true) }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(e.id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <TimeEntryForm entry={editEntry} projects={projects}
          onSave={handleSave} onCancel={() => { setShowForm(false); setEditEntry(null) }} />
      )}
    </div>
  )
}

export default TimeTrackingModule

/**
 * DeliverablesModule — S-04-02
 * Module Livrables SuperAdmin : liste, kanban, CRUD, sous-taches.
 * Connecte a Directus via TanStack Query.
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package, Plus, Search, List, BarChart3, Edit3, Trash2, Save, X,
  Loader2, Calendar, CheckCircle2, Clock, AlertTriangle, Eye, Target
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  fetchDeliverables, fetchProjects, createDeliverable,
  updateDeliverable, deleteDeliverable, companyLabel
} from '../../../services/api/projects'

const STATUS_CONFIG = {
  todo: { label: 'A faire', color: 'bg-gray-100 text-gray-600', icon: Clock },
  in_progress: { label: 'En cours', color: 'bg-zinc-100 text-zinc-700', icon: Target },
  review: { label: 'En review', color: 'bg-amber-100 text-amber-700', icon: Eye },
  done: { label: 'Termine', color: 'bg-green-50 text-green-700', icon: CheckCircle2 }
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.todo
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  )
}

const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false
  return new Date(dueDate) < new Date()
}

const dueDateColor = (dueDate, status) => {
  if (!dueDate || status === 'done') return 'text-gray-500'
  const days = differenceInDays(new Date(dueDate), new Date())
  if (days < 0) return 'text-red-600 font-medium'
  if (days <= 3) return 'text-amber-600'
  return 'text-gray-500'
}

// ── Form Modal ──────────────────────────────────────────────

const DeliverableForm = ({ deliverable, projects, allDeliverables, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: deliverable?.title || '',
    description: deliverable?.description || '',
    status: deliverable?.status || 'todo',
    due_date: deliverable?.due_date?.slice(0, 10) || '',
    project_id: deliverable?.project_id || '',
    assigned_to: deliverable?.assigned_to || '',
    parent_task_id: deliverable?.parent_task_id || '',
    owner_company: deliverable?.owner_company || ''
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Le titre est requis'); return }
    const payload = { ...form }
    if (!payload.parent_task_id) delete payload.parent_task_id
    if (!payload.due_date) delete payload.due_date
    onSave(payload)
  }

  // Only show top-level deliverables as parent options (no recursive nesting)
  const parentOptions = allDeliverables.filter(d => !d.parent_task_id && d.id !== deliverable?.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">{deliverable ? 'Modifier le livrable' : 'Nouveau livrable'}</h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows="2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Echeance</label>
              <input type="date" value={form.due_date} onChange={(e) => update('due_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projet</label>
              <select value={form.project_id} onChange={(e) => update('project_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">— Aucun —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
              <input type="text" value={form.assigned_to} onChange={(e) => update('assigned_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Nom" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tache parente (1 niveau max)</label>
            <select value={form.parent_task_id} onChange={(e) => update('parent_task_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">— Aucune —</option>
              {parentOptions.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white ds-btn-primary rounded-lg">
              <Save size={14} /> Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Kanban ───────────────────────────────────────────────────

const KanbanBoard = ({ deliverables, onEdit, onDelete, projects }) => {
  const columns = Object.entries(STATUS_CONFIG)
  const projectName = (id) => projects.find(p => p.id === id)?.name || '—'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(([statusKey, cfg]) => {
        const items = deliverables.filter(d => d.status === statusKey && !d.parent_task_id)
        return (
          <div key={statusKey}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <cfg.icon size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{cfg.label}</span>
              <span className="text-xs text-gray-400">{items.length}</span>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {items.map(d => {
                const subtasks = deliverables.filter(s => s.parent_task_id === d.id)
                return (
                  <div key={d.id} className="bg-white rounded-lg border border-gray-200/50 p-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900">{d.title}</p>
                      <div className="flex gap-0.5">
                        <button onClick={() => onEdit(d)} className="p-1 rounded hover:bg-gray-100 text-gray-400"><Edit3 size={12} /></button>
                        <button onClick={() => onDelete(d.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    {d.project_id && <p className="text-xs text-gray-400 mt-0.5">{projectName(d.project_id)}</p>}
                    <div className="flex items-center justify-between mt-2">
                      {d.assigned_to && <span className="text-xs text-gray-500">{d.assigned_to}</span>}
                      {d.due_date && (
                        <span className={`text-xs ${dueDateColor(d.due_date, d.status)}`}>
                          {format(new Date(d.due_date), 'dd MMM', { locale: fr })}
                        </span>
                      )}
                    </div>
                    {subtasks.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                        {subtasks.map(s => (
                          <div key={s.id} className="flex items-center gap-2 text-xs text-gray-500">
                            <StatusBadge status={s.status} />
                            <span className="truncate">{s.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────

const DeliverablesModule = ({ selectedCompany }) => {
  const qc = useQueryClient()
  const company = selectedCompany === 'all' ? '' : selectedCompany

  const [viewMode, setViewMode] = useState('list')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const { data: deliverables = [], isLoading } = useQuery({
    queryKey: ['deliverables', { company }],
    queryFn: () => fetchDeliverables({ company }),
    staleTime: 30_000
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', { company }],
    queryFn: () => fetchProjects({ company }),
    staleTime: 60_000
  })

  const createMut = useMutation({
    mutationFn: createDeliverable,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deliverables'] }); setShowForm(false); setEditItem(null); toast.success('Livrable cree') }
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateDeliverable(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deliverables'] }); setShowForm(false); setEditItem(null); toast.success('Livrable mis a jour') }
  })

  const deleteMut = useMutation({
    mutationFn: deleteDeliverable,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deliverables'] }); toast.success('Livrable supprime') }
  })

  const handleSave = (formData) => {
    if (editItem?.id) updateMut.mutate({ id: editItem.id, data: formData })
    else createMut.mutate(formData)
  }

  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce livrable ?')) deleteMut.mutate(id)
  }

  const projectName = (id) => projects.find(p => p.id === id)?.name || '—'

  const filtered = useMemo(() => {
    return deliverables.filter(d => {
      if (filterStatus !== 'all' && d.status !== filterStatus) return false
      if (search && !d.title?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [deliverables, filterStatus, search])

  const stats = useMemo(() => ({
    total: deliverables.length,
    inProgress: deliverables.filter(d => d.status === 'in_progress').length,
    overdue: deliverables.filter(d => isOverdue(d.due_date, d.status)).length,
    done: deliverables.filter(d => d.status === 'done').length
  }), [deliverables])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Livrables & Taches</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion des livrables projets</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white ds-btn-primary rounded-lg">
          <Plus size={16} /> Nouveau livrable
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Package, color: 'text-gray-900' },
          { label: 'En cours', value: stats.inProgress, icon: Target, color: 'text-zinc-900' },
          { label: 'En retard', value: stats.overdue, icon: AlertTriangle, color: 'text-red-600' },
          { label: 'Termines', value: stats.done, icon: CheckCircle2, color: 'text-zinc-900' }
        ].map((kpi, i) => (
          <div key={i} className="ds-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">{kpi.label}</span>
            </div>
            <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg">
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[{ id: 'list', icon: List, label: 'Liste' }, { id: 'kanban', icon: BarChart3, label: 'Kanban' }].map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${viewMode === v.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-gray-500'}`}>
              <v.icon size={14} /> {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-zinc-400 animate-spin" /></div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard deliverables={filtered} projects={projects}
          onEdit={(d) => { setEditItem(d); setShowForm(true) }} onDelete={handleDelete} />
      ) : (
        <div className="ds-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Projet</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Echeance</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />Aucun livrable
                  </td></tr>
                ) : filtered.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{d.title}</p>
                      {d.parent_task_id && <span className="text-xs text-gray-400">Sous-tache</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{projectName(d.project_id)}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3">
                      {d.due_date ? (
                        <span className={`text-xs ${dueDateColor(d.due_date, d.status)}`}>
                          {format(new Date(d.due_date), 'dd MMM yyyy', { locale: fr })}
                          {isOverdue(d.due_date, d.status) && ' (retard)'}
                        </span>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{d.assigned_to || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditItem(d); setShowForm(true) }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-zinc-900"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(d.id)}
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

      {/* Form Modal */}
      {showForm && (
        <DeliverableForm
          deliverable={editItem}
          projects={projects}
          allDeliverables={deliverables}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditItem(null) }}
        />
      )}
    </div>
  )
}

export default DeliverablesModule

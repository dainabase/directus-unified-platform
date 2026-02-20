/**
 * ProjectsModule — S-04-01
 * Module Projets SuperAdmin : liste, kanban, detail, formulaire.
 * Connecte a Directus via TanStack Query.
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FolderKanban, Plus, Search, List, BarChart3, Eye, Edit3, Trash2,
  Loader2, Calendar, DollarSign, Building2, AlertCircle, X, Save,
  ChevronRight, CheckCircle2, Clock, PauseCircle, XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  fetchProjects, fetchDeliverables, fetchSignatureLogs,
  createProject, updateProject, deleteProject,
  companyLabel, formatCHF, COMPANIES
} from '../../../services/api/projects'

const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'bg-green-50 text-green-700', icon: CheckCircle2 },
  on_hold: { label: 'En pause', color: 'bg-amber-100 text-amber-700', icon: PauseCircle },
  completed: { label: 'Termine', color: 'bg-zinc-100 text-zinc-700', icon: CheckCircle2 },
  cancelled: { label: 'Annule', color: 'bg-red-100 text-red-700', icon: XCircle },
  planning: { label: 'Planification', color: 'bg-gray-100 text-gray-600', icon: Clock },
  in_progress: { label: 'En cours', color: 'bg-zinc-200 text-zinc-700', icon: BarChart3 }
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.active
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  )
}

// ── Project Form Modal ──────────────────────────────────────

const ProjectForm = ({ project, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active',
    start_date: project?.start_date?.slice(0, 10) || '',
    end_date: project?.end_date?.slice(0, 10) || '',
    budget: project?.budget || 0,
    owner_company: project?.owner_company || '',
    client_id: project?.client_id || ''
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Le nom est requis'); return }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">{project ? 'Modifier le projet' : 'Nouveau projet'}</h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Nom du projet" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows="3" placeholder="Description..." />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget CHF</label>
              <input type="number" value={form.budget} onChange={(e) => update('budget', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" min="0" step="100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date debut</label>
              <input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input type="date" value={form.end_date} onChange={(e) => update('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
              <select value={form.owner_company} onChange={(e) => update('owner_company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">— Choisir —</option>
                {COMPANIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <input type="text" value={form.client_id} onChange={(e) => update('client_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="ID client" />
            </div>
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

// ── Project Detail ──────────────────────────────────────────

const ProjectDetail = ({ project, onBack, onEdit }) => {
  const { data: deliverables = [] } = useQuery({
    queryKey: ['deliverables', { projectId: project.id }],
    queryFn: () => fetchDeliverables({ projectId: project.id }),
    staleTime: 30_000
  })

  const { data: signatures = [] } = useQuery({
    queryKey: ['signature-logs', project.id],
    queryFn: () => fetchSignatureLogs({ projectId: project.id }),
    staleTime: 60_000
  })

  const doneCount = deliverables.filter(d => d.status === 'done').length
  const totalDel = deliverables.length
  const progress = totalDel > 0 ? Math.round((doneCount / totalDel) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Retour</button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-900">{project.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
            {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
            <div className="flex items-center gap-3 mt-3">
              <StatusBadge status={project.status} />
              {project.owner_company && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  <Building2 size={10} /> {companyLabel(project.owner_company)}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => onEdit(project)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Edit3 size={14} /> Modifier
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-xs text-gray-500">Budget</p>
            <p className="font-semibold text-gray-900">{formatCHF(project.budget)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Debut</p>
            <p className="font-semibold text-gray-900">{project.start_date ? format(new Date(project.start_date), 'dd MMM yyyy', { locale: fr }) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Fin</p>
            <p className="font-semibold text-gray-900">{project.end_date ? format(new Date(project.end_date), 'dd MMM yyyy', { locale: fr }) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avancement</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="h-full rounded-full" style={{ background: "var(--accent)", width: `${progress}%` }} />
              </div>
              <span className="text-sm font-bold text-gray-900">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverables */}
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Livrables ({totalDel})</h3>
        </div>
        {deliverables.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucun livrable pour ce projet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {deliverables.map(d => (
              <div key={d.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <StatusBadge status={d.status} />
                  <span className="text-sm font-medium text-gray-900">{d.title}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {d.assigned_to && <span>{d.assigned_to}</span>}
                  {d.due_date && (
                    <span className={new Date(d.due_date) < new Date() && d.status !== 'done' ? 'text-red-500 font-medium' : ''}>
                      {format(new Date(d.due_date), 'dd MMM', { locale: fr })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signatures */}
      {signatures.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Signatures</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {signatures.map(s => (
              <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-900">{s.signer_name || '—'}</span>
                <span className="text-xs text-gray-500">{s.signed_at ? format(new Date(s.signed_at), 'dd MMM yyyy HH:mm', { locale: fr }) : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Kanban View ─────────────────────────────────────────────

const KanbanView = ({ projects, onView }) => {
  const columns = [
    { id: 'active', label: 'Actifs', color: 'border-emerald-400' },
    { id: 'on_hold', label: 'En pause', color: 'border-amber-400' },
    { id: 'completed', label: 'Termines', color: 'border-blue-400' },
    { id: 'cancelled', label: 'Annules', color: 'border-red-400' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(col => {
        const items = projects.filter(p => p.status === col.id)
        return (
          <div key={col.id} className="space-y-2">
            <div className={`border-t-2 ${col.color} bg-white rounded-t-lg px-3 py-2`}>
              <span className="text-sm font-medium text-gray-700">{col.label}</span>
              <span className="ml-2 text-xs text-gray-400">{items.length}</span>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {items.map(p => (
                <div key={p.id} onClick={() => onView(p)}
                  className="bg-white rounded-lg border border-gray-200/50 p-3 cursor-pointer hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-gray-900 mb-1">{p.name}</p>
                  {p.owner_company && (
                    <span className="text-xs text-gray-500">{companyLabel(p.owner_company)}</span>
                  )}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    {p.budget > 0 && <span>{formatCHF(p.budget)}</span>}
                    {p.end_date && <span>{format(new Date(p.end_date), 'dd MMM', { locale: fr })}</span>}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center text-xs text-gray-300 py-8">Aucun projet</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────

const ProjectsModuleNew = ({ selectedCompany }) => {
  const qc = useQueryClient()
  const company = selectedCompany === 'all' ? '' : selectedCompany

  const [view, setView] = useState('list') // list | kanban | detail | form
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)
  const [editProject, setEditProject] = useState(null) // null = create, object = edit

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', { company }],
    queryFn: () => fetchProjects({ company }),
    staleTime: 30_000
  })

  const createMut = useMutation({
    mutationFn: (data) => createProject(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setView('list'); toast.success('Projet cree') }
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setView('list'); toast.success('Projet mis a jour') }
  })

  const deleteMut = useMutation({
    mutationFn: (id) => deleteProject(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Projet supprime') }
  })

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false
      if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [projects, filterStatus, search])

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
    budget: projects.reduce((s, p) => s + (p.budget || 0), 0),
    avgBudget: projects.length > 0 ? projects.reduce((s, p) => s + (p.budget || 0), 0) / projects.length : 0
  }), [projects])

  const handleSave = (formData) => {
    if (editProject?.id) {
      updateMut.mutate({ id: editProject.id, data: formData })
    } else {
      createMut.mutate(formData)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce projet ?')) deleteMut.mutate(id)
  }

  // ── Detail view ──
  if (view === 'detail' && selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => { setView('list'); setSelectedProject(null) }}
        onEdit={(p) => { setEditProject(p); setView('form') }}
      />
    )
  }

  // ── Form view ──
  if (view === 'form') {
    return (
      <ProjectForm
        project={editProject}
        onSave={handleSave}
        onCancel={() => { setView('list'); setEditProject(null) }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projets</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion des projets multi-entreprises</p>
        </div>
        <button onClick={() => { setEditProject(null); setView('form') }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white ds-btn-primary rounded-lg">
          <Plus size={16} /> Nouveau projet
        </button>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total projets', value: stats.total, icon: FolderKanban, color: 'text-gray-900' },
          { label: 'Actifs', value: stats.active, icon: CheckCircle2, color: 'text-zinc-900' },
          { label: 'Budget total', value: formatCHF(stats.budget), icon: DollarSign, color: 'text-zinc-900' },
          { label: 'Budget moyen', value: formatCHF(stats.avgBudget), icon: BarChart3, color: 'text-zinc-900' }
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
            placeholder="Rechercher un projet..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg">
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'list', icon: List, label: 'Liste' },
            { id: 'kanban', icon: BarChart3, label: 'Kanban' }
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${view === v.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <v.icon size={14} /> {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
        </div>
      ) : view === 'kanban' ? (
        <KanbanView projects={filtered} onView={(p) => { setSelectedProject(p); setView('detail') }} />
      ) : (
        <div className="ds-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-4 py-3">Projet</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Entreprise</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Aucun projet trouve
                  </td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => { setSelectedProject(p); setView('detail') }}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.client_id && <p className="text-xs text-gray-400">Client: {p.client_id}</p>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.start_date ? format(new Date(p.start_date), 'dd/MM/yy', { locale: fr }) : '—'}
                      {' → '}
                      {p.end_date ? format(new Date(p.end_date), 'dd/MM/yy', { locale: fr }) : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.budget > 0 ? formatCHF(p.budget) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{companyLabel(p.owner_company)}</span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setSelectedProject(p); setView('detail') }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-zinc-900" title="Voir">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => { setEditProject(p); setView('form') }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-zinc-900" title="Modifier">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsModuleNew

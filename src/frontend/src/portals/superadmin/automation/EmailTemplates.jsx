/**
 * EmailTemplates — Story 7.1
 * Email template library with Mautic sync.
 * CRUD via Directus email_templates collection.
 * Multi-language (FR/DE/EN), variable helpers, inline preview.
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Mail, Plus, Search, Edit3, X, Save, Loader2, Eye, RefreshCw,
  FileText, Globe, Copy, ChevronDown, AlertCircle, CheckCircle
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'

// ── Type config ──────────────────────────────────────────────
const TYPE_CONFIG = {
  devis: { label: 'Devis', color: 'bg-zinc-100 text-zinc-700' },
  facture: { label: 'Facture', color: 'bg-zinc-100 text-zinc-700' },
  relance: { label: 'Relance', color: 'bg-amber-50 text-amber-700' },
  confirmation: { label: 'Confirmation', color: 'bg-green-50 text-green-700' },
  paiement: { label: 'Paiement', color: 'bg-green-50 text-green-700' },
  notification: { label: 'Notification', color: 'bg-zinc-50 text-zinc-600' }
}

const LANGUAGES = [
  { key: 'fr', label: 'FR' },
  { key: 'de', label: 'DE' },
  { key: 'en', label: 'EN' }
]

const VARIABLES = [
  { token: '{{client.name}}', desc: 'Nom du client' },
  { token: '{{client.email}}', desc: 'Email du client' },
  { token: '{{invoice.number}}', desc: 'Numero de facture' },
  { token: '{{invoice.amount}}', desc: 'Montant de la facture' },
  { token: '{{quote.number}}', desc: 'Numero de devis' },
  { token: '{{project.name}}', desc: 'Nom du projet' },
  { token: '{{company.name}}', desc: 'Nom de l\'entreprise' }
]

const SAMPLE_DATA = {
  '{{client.name}}': 'Martin Keller',
  '{{client.email}}': 'martin.keller@example.ch',
  '{{invoice.number}}': 'INV-2026-0042',
  '{{invoice.amount}}': 'CHF 4\'850.00',
  '{{quote.number}}': 'DEV-2026-0018',
  '{{project.name}}': 'Refonte site web Corporate',
  '{{company.name}}': 'HYPERVISUAL'
}

// ── Skeleton loader ──────────────────────────────────────────
const SkeletonCard = () => (
  <div className="ds-card p-5">
    <div className="ds-skeleton h-5 w-3/4 mb-3" />
    <div className="ds-skeleton h-4 w-1/3 mb-4" />
    <div className="ds-skeleton h-3 w-1/2" />
  </div>
)

// ── Variables Helper Panel ───────────────────────────────────
const VariablesPanel = ({ onInsert }) => (
  <div className="border border-zinc-200 rounded-lg p-3 bg-zinc-50/50">
    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
      Variables disponibles
    </p>
    <div className="space-y-1.5">
      {VARIABLES.map(v => (
        <button
          key={v.token}
          type="button"
          onClick={() => onInsert(v.token)}
          className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded-md hover:bg-white transition-colors group"
        >
          <code className="text-xs font-mono" style={{ color: 'var(--accent)' }}>
            {v.token}
          </code>
          <span className="text-xs text-zinc-400 group-hover:text-zinc-600">{v.desc}</span>
        </button>
      ))}
    </div>
  </div>
)

// ── Preview Panel ────────────────────────────────────────────
const PreviewPanel = ({ subject, body, onClose }) => {
  const renderPreview = (text) => {
    if (!text) return ''
    let rendered = text
    Object.entries(SAMPLE_DATA).forEach(([token, value]) => {
      rendered = rendered.replaceAll(token, value)
    })
    return rendered
  }

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-200">
        <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
          Apercu avec donnees d'exemple
        </span>
        <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded">
          <X size={14} className="text-zinc-400" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-zinc-400 mb-1">Objet</p>
          <p className="text-sm font-medium text-zinc-900">{renderPreview(subject)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-1">Corps</p>
          <div
            className="text-sm text-zinc-700 whitespace-pre-wrap border border-zinc-100 rounded-lg p-3 bg-zinc-50/50 max-h-64 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: renderPreview(body) }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Editor Modal ─────────────────────────────────────────────
const TemplateEditorModal = ({ template, onSave, onClose, isSaving }) => {
  const isNew = !template
  const [form, setForm] = useState({
    name: template?.name || '',
    type: template?.type || 'notification',
    subject_fr: template?.subject_fr || '',
    subject_de: template?.subject_de || '',
    subject_en: template?.subject_en || '',
    body_fr: template?.body_fr || '',
    body_de: template?.body_de || '',
    body_en: template?.body_en || ''
  })
  const [activeLang, setActiveLang] = useState('fr')
  const [showPreview, setShowPreview] = useState(false)

  const subjectKey = `subject_${activeLang}`
  const bodyKey = `body_${activeLang}`

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleInsertVariable = useCallback((token) => {
    // Append to body for simplicity
    update(bodyKey, form[bodyKey] + token)
    toast.success(`${token} insere`)
  }, [bodyKey, form])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Le nom du template est requis')
      return
    }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">
              {isNew ? 'Nouveau template' : 'Modifier le template'}
            </h2>
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
              <X size={18} className="text-zinc-400" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Name + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nom du template *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="ex: Relance facture impayee"
                  className="ds-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => update('type', e.target.value)}
                  className="ds-input"
                >
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language tabs */}
            <div className="flex gap-1 bg-zinc-100 rounded-lg p-1 w-fit">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.key}
                  type="button"
                  onClick={() => setActiveLang(lang.key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeLang === lang.key
                      ? 'bg-white shadow text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Objet ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={form[subjectKey]}
                onChange={(e) => update(subjectKey, e.target.value)}
                placeholder="Objet de l'email..."
                className="ds-input"
              />
            </div>

            {/* Body + Variables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Corps ({activeLang.toUpperCase()})
                </label>
                <textarea
                  value={form[bodyKey]}
                  onChange={(e) => update(bodyKey, e.target.value)}
                  placeholder="Contenu HTML de l'email..."
                  rows={12}
                  className="ds-input font-mono text-xs leading-relaxed resize-y"
                  style={{ minHeight: '240px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Variables</label>
                <VariablesPanel onInsert={handleInsertVariable} />
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="ds-btn ds-btn-secondary text-sm"
              >
                <Eye size={14} />
                {showPreview ? 'Masquer l\'apercu' : 'Apercu'}
              </button>
            </div>

            {showPreview && (
              <PreviewPanel
                subject={form[subjectKey]}
                body={form[bodyKey]}
                onClose={() => setShowPreview(false)}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-5 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="ds-btn ds-btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="ds-btn ds-btn-primary"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isNew ? 'Creer' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────
export const EmailTemplates = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // Fetch templates
  const { data: templates = [], isLoading, isError } = useQuery({
    queryKey: ['email-templates', { type: typeFilter !== 'all' ? typeFilter : undefined }],
    queryFn: async () => {
      const params = {
        fields: ['id', 'name', 'type', 'subject_fr', 'subject_de', 'subject_en', 'body_fr', 'body_de', 'body_en', 'variables', 'status', 'date_created', 'date_updated'],
        sort: ['-date_updated'],
        limit: 100
      }
      if (typeFilter !== 'all') {
        params.filter = JSON.stringify({ type: { _eq: typeFilter } })
      }
      const res = await api.get('/items/email_templates', { params })
      return res.data?.data || []
    },
    staleTime: 15_000
  })

  // Create mutation
  const createMut = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/items/email_templates', payload)
      return res.data?.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast.success('Template cree')
      setShowEditor(false)
      setEditingTemplate(null)
    },
    onError: () => toast.error('Erreur lors de la creation')
  })

  // Update mutation
  const updateMut = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.patch(`/items/email_templates/${id}`, data)
      return res.data?.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast.success('Template mis a jour')
      setShowEditor(false)
      setEditingTemplate(null)
    },
    onError: () => toast.error('Erreur lors de la mise a jour')
  })

  // Save handler
  const handleSave = (formData) => {
    if (editingTemplate?.id) {
      updateMut.mutate({ id: editingTemplate.id, data: formData })
    } else {
      createMut.mutate(formData)
    }
  }

  // Mautic sync
  const handleMauticSync = async () => {
    setIsSyncing(true)
    try {
      const res = await api.post('/api/mautic/email-templates')
      toast.success(`Synchronisation Mautic terminee${res.data?.synced ? ` (${res.data.synced} templates)` : ''}`)
    } catch (err) {
      console.error('Mautic sync error:', err)
      toast.error('Erreur synchronisation Mautic')
    } finally {
      setIsSyncing(false)
    }
  }

  // Filtered templates
  const filtered = useMemo(() => {
    if (!searchQuery) return templates
    const q = searchQuery.toLowerCase()
    return templates.filter(t =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.type || '').toLowerCase().includes(q) ||
      (t.subject_fr || '').toLowerCase().includes(q)
    )
  }, [templates, searchQuery])

  // Language completeness check
  const getLangStatus = (template) => {
    const langs = []
    if (template.subject_fr || template.body_fr) langs.push('FR')
    if (template.subject_de || template.body_de) langs.push('DE')
    if (template.subject_en || template.body_en) langs.push('EN')
    return langs
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Automation</p>
          <h2 className="text-xl font-bold text-zinc-900">Email Templates</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMauticSync}
            disabled={isSyncing}
            className="ds-btn ds-btn-secondary"
          >
            {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Synchroniser Mautic
          </button>
          <button
            onClick={() => { setEditingTemplate(null); setShowEditor(true) }}
            className="ds-btn ds-btn-primary"
          >
            <Plus size={14} /> Nouveau template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un template..."
            className="ds-input pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="ds-input w-auto"
        >
          <option value="all">Tous les types</option>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <span className="text-sm text-zinc-500">{filtered.length} template(s)</span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <div className="ds-card p-12 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--semantic-red)' }} />
          <p className="text-zinc-700 font-medium">Erreur de chargement</p>
          <p className="text-sm text-zinc-400 mt-1">Impossible de charger les templates email</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <Mail className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">Aucun template email</p>
          <p className="text-sm text-zinc-400 mt-1">Creez un premier template pour commencer</p>
          <button
            onClick={() => { setEditingTemplate(null); setShowEditor(true) }}
            className="ds-btn ds-btn-primary mt-4"
          >
            <Plus size={14} /> Creer un template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(template => {
            const typeCfg = TYPE_CONFIG[template.type] || TYPE_CONFIG.notification
            const langs = getLangStatus(template)
            const updatedAt = template.date_updated || template.date_created

            return (
              <div
                key={template.id}
                className="ds-card p-5 cursor-pointer group"
                onClick={() => { setEditingTemplate(template); setShowEditor(true) }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                      <Mail size={14} className="text-zinc-500" />
                    </div>
                    <span className={`ds-badge ${typeCfg.color}`}>{typeCfg.label}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingTemplate(template); setShowEditor(true) }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 rounded-lg transition-all"
                  >
                    <Edit3 size={14} className="text-zinc-400" />
                  </button>
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 mb-1 line-clamp-1">
                  {template.name || '(sans nom)'}
                </h3>

                {template.subject_fr && (
                  <p className="text-xs text-zinc-500 line-clamp-1 mb-3">
                    {template.subject_fr}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-100">
                  <div className="flex items-center gap-1">
                    {LANGUAGES.map(lang => {
                      const isActive = langs.includes(lang.label)
                      return (
                        <span
                          key={lang.key}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            isActive
                              ? 'bg-zinc-900 text-white'
                              : 'bg-zinc-100 text-zinc-400'
                          }`}
                        >
                          {lang.label}
                        </span>
                      )
                    })}
                  </div>
                  {updatedAt && (
                    <span className="text-[11px] text-zinc-400">
                      {formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: fr })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <TemplateEditorModal
          template={editingTemplate}
          onSave={handleSave}
          onClose={() => { setShowEditor(false); setEditingTemplate(null) }}
          isSaving={createMut.isPending || updateMut.isPending}
        />
      )}
    </div>
  )
}

export default EmailTemplates

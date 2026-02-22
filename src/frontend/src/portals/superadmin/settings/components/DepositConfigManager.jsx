/**
 * DepositConfigManager — S-03-07
 * Gestion des configurations d'acomptes par type de projet et entreprise.
 * Lecture/ecriture dans la collection deposit_configs de Directus.
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard, Plus, Edit3, Trash2, Save, X,
  Loader2, AlertCircle, CheckCircle2, Percent
} from 'lucide-react'
import api from '../../../../lib/axios'

const COMPANIES = [
  { value: '2d6b906a-5b8a-4d9e-a37b-aee8c1281b22', label: 'HYPERVISUAL' },
  { value: '55483d07-6621-43d4-89a9-5ebbffe86fea', label: 'DAINAMICS' },
  { value: '6f4bc42a-d083-4df5-ace3-6b910164ae18', label: 'ENKI REALTY' },
  { value: '8db45f3b-4021-9556-3acaa5f35b3f', label: 'LEXAIA' },
  { value: 'a1313adf-0347-424b-aff2-c5f0b33c4a05', label: 'TAKEOUT' }
]

const PROJECT_TYPES = [
  { value: 'web_design', label: 'Web Design' },
  { value: 'ai_project', label: 'Projet IA' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'led_signage', label: 'Affichage LED' },
  { value: 'event_production', label: 'Production evenementielle' },
  { value: 'vr_ar', label: 'Realite virtuelle/augmentee' },
  { value: 'software_dev', label: 'Developpement logiciel' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'default', label: 'Par defaut' }
]

const formatCHF = (v) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v || 0)

// Fetch configs
async function fetchDepositConfigs() {
  const { data } = await api.get('/items/deposit_configs', {
    params: {
      fields: ['id', 'owner_company', 'project_type', 'deposit_percentage', 'min_amount', 'max_amount', 'description', 'is_active', 'date_created', 'date_updated'],
      sort: ['owner_company', 'project_type']
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

// --- Edit Row ---
const EditRow = ({ config, onSave, onCancel }) => {
  const [form, setForm] = useState({
    owner_company: config?.owner_company || '',
    project_type: config?.project_type || 'default',
    deposit_percentage: config?.deposit_percentage ?? 30,
    min_amount: config?.min_amount || 0,
    max_amount: config?.max_amount || 0,
    description: config?.description || '',
    is_active: config?.is_active !== false
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <tr className="bg-zinc-50/50">
      <td className="px-4 py-2">
        <select
          value={form.owner_company}
          onChange={(e) => update('owner_company', e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
        >
          <option value="">Toutes</option>
          {COMPANIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </td>
      <td className="px-4 py-2">
        <select
          value={form.project_type}
          onChange={(e) => update('project_type', e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
        >
          {PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={form.deposit_percentage}
            onChange={(e) => update('deposit_percentage', Number(e.target.value))}
            min="0"
            max="100"
            step="5"
            className="w-16 px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-right"
          />
          <Percent size={12} className="text-gray-400" />
        </div>
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          value={form.min_amount}
          onChange={(e) => update('min_amount', Number(e.target.value))}
          min="0"
          step="100"
          className="w-24 px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-right"
          placeholder="Min CHF"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          value={form.max_amount}
          onChange={(e) => update('max_amount', Number(e.target.value))}
          min="0"
          step="100"
          className="w-24 px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-right"
          placeholder="Max CHF"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
          placeholder="Description..."
        />
      </td>
      <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => update('is_active', e.target.checked)}
          className="rounded border-gray-300 text-zinc-900"
        />
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSave(form)}
            className="p-1.5 rounded hover:bg-green-100 text-green-600"
            title="Enregistrer"
          >
            <Save size={14} />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
            title="Annuler"
          >
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// --- Main Component ---
const DepositConfigManager = ({ selectedCompany }) => {
  const qc = useQueryClient()
  const [editId, setEditId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['deposit-configs'],
    queryFn: fetchDepositConfigs,
    staleTime: 30_000
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/items/deposit_configs', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deposit-configs'] })
      setIsCreating(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/items/deposit_configs/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deposit-configs'] })
      setEditId(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/items/deposit_configs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deposit-configs'] })
  })

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette configuration ?')) {
      deleteMutation.mutate(id)
    }
  }

  const companyLabel = (id) => COMPANIES.find(c => c.value === id)?.label || 'Toutes'
  const typeLabel = (type) => PROJECT_TYPES.find(t => t.value === type)?.label || type

  // Filter by selected company
  const filtered = selectedCompany && selectedCompany !== 'all'
    ? configs.filter(c => !c.owner_company || c.owner_company === selectedCompany)
    : configs

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Configuration des acomptes</h3>
            <p className="text-xs text-gray-500">{configs.length} configuration(s) — Defaut: 30%</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white ds-btn-primary bg-[var(--accent)] hover:opacity-90 rounded-lg disabled:opacity-50"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-zinc-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-zinc-800">
          <p className="font-medium">Comment fonctionne la configuration des acomptes</p>
          <p className="mt-1 text-zinc-900">
            Lorsqu'un devis est cree, le systeme cherche une configuration active correspondant a
            l'entreprise et au type de projet. Si aucune n'est trouvee, l'acompte par defaut de 30% est applique.
            Les montants min/max permettent de plafonner l'acompte.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-4 py-3">Entreprise</th>
                  <th className="px-4 py-3">Type projet</th>
                  <th className="px-4 py-3">Acompte</th>
                  <th className="px-4 py-3">Min CHF</th>
                  <th className="px-4 py-3">Max CHF</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Actif</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isCreating && (
                  <EditRow
                    config={{
                      owner_company: selectedCompany !== 'all' ? selectedCompany : '',
                      deposit_percentage: 30
                    }}
                    onSave={(data) => createMutation.mutate(data)}
                    onCancel={() => setIsCreating(false)}
                  />
                )}
                {filtered.length === 0 && !isCreating ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      Aucune configuration. L'acompte par defaut de 30% sera utilise.
                    </td>
                  </tr>
                ) : (
                  filtered.map((cfg) => (
                    editId === cfg.id ? (
                      <EditRow
                        key={cfg.id}
                        config={cfg}
                        onSave={(data) => updateMutation.mutate({ id: cfg.id, data })}
                        onCancel={() => setEditId(null)}
                      />
                    ) : (
                      <tr key={cfg.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {companyLabel(cfg.owner_company)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{typeLabel(cfg.project_type)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-50 text-zinc-700 rounded-full text-xs font-bold">
                            {cfg.deposit_percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {cfg.min_amount > 0 ? formatCHF(cfg.min_amount) : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {cfg.max_amount > 0 ? formatCHF(cfg.max_amount) : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{cfg.description || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {cfg.is_active !== false ? (
                            <CheckCircle2 size={16} className="inline" style={{ color: "var(--semantic-green)" }} />
                          ) : (
                            <X size={16} className="text-gray-300 inline" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditId(cfg.id)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-zinc-900"
                              title="Modifier"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(cfg.id)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DepositConfigManager

// src/frontend/src/portals/superadmin/legal/components/CGVManager.jsx
//
// Self-contained CGV versions manager.
// Fetches data directly from /items/cgv_versions (Directus).
// NOTE: This collection uses `owner_company_id` (UUID FK), not `owner_company`.
//
import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileText, CheckCircle, Clock, Archive
} from 'lucide-react'
import api from '../../../../lib/axios'

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  active:   { label: 'Active',    cls: 'ds-badge ds-badge-success' },
  draft:    { label: 'Brouillon', cls: 'ds-badge ds-badge-default' },
  archived: { label: 'Archivee',  cls: 'ds-badge ds-badge-warning' }
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
const CGVManagerSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="ds-card p-5">
          <div className="animate-pulse h-4 w-24 rounded mb-3" style={{ background: 'rgba(0,0,0,0.04)' }} />
          <div className="animate-pulse h-8 w-16 rounded" style={{ background: 'rgba(0,0,0,0.04)' }} />
        </div>
      ))}
    </div>
    <div className="ds-card p-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
          <div className="animate-pulse h-4 w-16 rounded" style={{ background: 'rgba(0,0,0,0.04)' }} />
          <div className="animate-pulse h-4 w-48 rounded" style={{ background: 'rgba(0,0,0,0.04)' }} />
          <div className="animate-pulse h-4 w-20 rounded" style={{ background: 'rgba(0,0,0,0.04)' }} />
          <div className="animate-pulse h-4 w-28 rounded" style={{ background: 'rgba(0,0,0,0.04)' }} />
        </div>
      ))}
    </div>
  </div>
)

// ── Component ────────────────────────────────────────────────────────────────
const CGVManager = ({ selectedCompany }) => {
  const company = selectedCompany === 'all' ? null : selectedCompany

  // ── Fetch CGV versions ──
  // This collection uses owner_company_id (UUID FK) instead of owner_company
  const { data: cgvVersions = [], isLoading, isError } = useQuery({
    queryKey: ['cgv-versions', company],
    queryFn: async () => {
      const filter = {}
      if (company) {
        filter.owner_company_id = { _eq: company }
      }
      const res = await api.get('/items/cgv_versions', {
        params: {
          filter,
          fields: ['id', 'version', 'title', 'status', 'effective_date', 'owner_company_id', 'sort'],
          sort: ['-version'],
          limit: -1
        }
      })
      return res.data?.data || []
    },
    staleTime: 2 * 60 * 1000,
    retry: 2
  })

  // ── KPIs ──
  const kpis = useMemo(() => ({
    total: cgvVersions.length,
    active: cgvVersions.filter(c => c.status === 'active').length,
    draft: cgvVersions.filter(c => c.status === 'draft').length,
    archived: cgvVersions.filter(c => c.status === 'archived').length
  }), [cgvVersions])

  // ── Loading ──
  if (isLoading && cgvVersions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-[var(--accent)]" />
          <h2 className="text-2xl font-bold text-gray-900">Gestion des CGV</h2>
        </div>
        <CGVManagerSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-[var(--accent)]" />
          Gestion des CGV
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Versions des conditions generales de vente
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-[var(--accent)]" />
            <span className="text-sm text-gray-500">Total versions</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.total}</div>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-[var(--semantic-green)]" />
            <span className="text-sm text-gray-500">Actives</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.active}</div>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">Brouillons</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.draft}</div>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Archive className="w-5 h-5 text-[var(--semantic-orange)]" />
            <span className="text-sm text-gray-500">Archivees</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.archived}</div>
        </div>
      </div>

      {/* Table */}
      <div className="ds-card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Versions CGV</h3>
        </div>
        {cgvVersions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText size={48} className="mb-3 opacity-40" />
            <p className="text-lg font-medium text-gray-500">Aucune version CGV trouvee</p>
            <p className="text-sm mt-1">
              Ajoutez des versions dans la collection cgv_versions de Directus.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3">Titre</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Date d'effet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cgvVersions.map(cgv => {
                  const cfg = STATUS_CFG[cgv.status] || STATUS_CFG.draft
                  return (
                    <tr key={cgv.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3 text-gray-900 whitespace-nowrap font-medium">
                        v{cgv.version ?? '-'}
                      </td>
                      <td className="px-5 py-3 text-gray-900 whitespace-nowrap">
                        {cgv.title || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={cfg.cls}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {cgv.effective_date
                          ? new Date(cgv.effective_date).toLocaleDateString('fr-CH')
                          : <span className="text-gray-300">-</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="ds-card p-6 text-center">
          <p className="text-sm" style={{ color: 'var(--semantic-red)' }}>
            Erreur lors du chargement des CGV. Verifiez que la collection cgv_versions existe dans Directus.
          </p>
        </div>
      )}
    </div>
  )
}

export default CGVManager

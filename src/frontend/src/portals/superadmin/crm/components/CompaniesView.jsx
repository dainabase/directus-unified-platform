// src/frontend/src/portals/superadmin/crm/components/CompaniesView.jsx
import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Building2, Search, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, UserPlus
} from 'lucide-react'
import api from '../../../../lib/axios'

// ── Helpers ──────────────────────────────────────────────────────────────────

const buildFilter = (selectedCompany, statusFilter, typeFilter, searchTerm) => {
  const filter = { _and: [] }

  if (selectedCompany && selectedCompany !== 'all') {
    filter._and.push({ owner_company: { _eq: selectedCompany } })
  }

  if (statusFilter && statusFilter !== 'all') {
    filter._and.push({ status: { _eq: statusFilter } })
  }

  if (typeFilter && typeFilter !== 'all') {
    filter._and.push({ type: { _eq: typeFilter } })
  }

  if (searchTerm) {
    filter._and.push({ name: { _icontains: searchTerm } })
  }

  return filter._and.length > 0 ? filter : {}
}

const FIELDS = ['id', 'name', 'status', 'type', 'owner_company', 'date_created']

const PAGE_SIZE = 25

const STATUS_CONFIG = {
  active: { label: 'Active', bg: 'bg-green-100', text: 'text-green-700' },
  inactive: { label: 'Inactive', bg: 'bg-gray-100', text: 'text-gray-600' },
  prospect: { label: 'Prospect', bg: 'bg-yellow-100', text: 'text-yellow-700' }
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

const CompaniesViewSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="glass-skeleton h-4 w-28 rounded mb-3" />
          <div className="glass-skeleton h-8 w-16 rounded" />
        </div>
      ))}
    </div>
    <div className="glass-card p-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
          <div className="glass-skeleton h-4 w-48 rounded" />
          <div className="glass-skeleton h-4 w-24 rounded" />
          <div className="glass-skeleton h-4 w-20 rounded" />
          <div className="glass-skeleton h-4 w-28 rounded" />
        </div>
      ))}
    </div>
  </div>
)

// ── Component ────────────────────────────────────────────────────────────────

const CompaniesView = ({ selectedCompany }) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(0)

  // Reset page on filter change
  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0) }
  const handleStatusChange = (e) => { setStatusFilter(e.target.value); setPage(0) }
  const handleTypeChange = (e) => { setTypeFilter(e.target.value); setPage(0) }

  // ── Fetch all companies for KPIs ──
  const { data: allCompanies = [], isLoading: loadingAll } = useQuery({
    queryKey: ['companies-view-all', selectedCompany],
    queryFn: async () => {
      const filter = selectedCompany && selectedCompany !== 'all'
        ? { owner_company: { _eq: selectedCompany } }
        : {}
      const res = await api.get('/items/companies', {
        params: { filter, fields: ['id', 'status'], limit: -1 }
      })
      return res.data?.data || []
    },
    staleTime: 2 * 60 * 1000,
    retry: 2
  })

  // ── Fetch filtered page ──
  const filter = useMemo(
    () => buildFilter(selectedCompany, statusFilter, typeFilter, search),
    [selectedCompany, statusFilter, typeFilter, search]
  )

  const { data: pageData, isLoading: loadingPage } = useQuery({
    queryKey: ['companies-view-page', selectedCompany, statusFilter, typeFilter, search, page],
    queryFn: async () => {
      const res = await api.get('/items/companies', {
        params: {
          filter,
          fields: FIELDS,
          sort: ['-date_created'],
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          meta: 'filter_count'
        }
      })
      return {
        items: res.data?.data || [],
        total: res.data?.meta?.filter_count || 0
      }
    },
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
    retry: 2
  })

  const companies = pageData?.items || []
  const totalFiltered = pageData?.total || 0
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE)

  const isLoading = loadingAll || loadingPage

  // ── KPIs ──
  const kpis = useMemo(() => {
    const total = allCompanies.length
    const active = allCompanies.filter(c => c.status === 'active').length
    const inactive = allCompanies.filter(c => c.status === 'inactive').length
    const prospect = allCompanies.filter(c => c.status === 'prospect').length
    return { total, active, inactive, prospect }
  }, [allCompanies])

  // ── Loading state ──
  if (isLoading && companies.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Building2 className="w-6 h-6 text-blue-600" />
          Entreprises
        </h2>
        <CompaniesViewSkeleton />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Entreprises
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Repertoire des entreprises clientes, fournisseurs et partenaires
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.total}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Actives</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.active}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">Inactives</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.inactive}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-500">Prospects</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.prospect}</div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white/80 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <select
          value={typeFilter}
          onChange={handleTypeChange}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white/80 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">Tous les types</option>
          <option value="client">Client</option>
          <option value="supplier">Fournisseur</option>
          <option value="partner">Partenaire</option>
          <option value="prospect">Prospect</option>
        </select>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white/80 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="prospect">Prospect</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card p-0 overflow-hidden">
        {companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Building2 size={48} className="mb-3 opacity-40" />
            <p className="text-lg font-medium text-gray-500">Aucune entreprise trouvee</p>
            <p className="text-sm mt-1">
              {search
                ? 'Aucun resultat ne correspond a votre recherche.'
                : 'Commencez par ajouter votre premiere entreprise dans Directus.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Date de creation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies.map(company => {
                  const statusCfg = STATUS_CONFIG[company.status] || STATUS_CONFIG.active
                  return (
                    <tr key={company.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-gray-400 flex-shrink-0" />
                          {company.name}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap capitalize">
                        {company.type || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {company.date_created
                          ? new Date(company.date_created).toLocaleDateString('fr-CH')
                          : <span className="text-gray-300">-</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/40 text-sm">
            <span className="text-gray-500">
              {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, totalFiltered)} sur {totalFiltered}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-gray-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i
                } else if (page <= 2) {
                  pageNum = i
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 5 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-200/60 text-gray-600'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-gray-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompaniesView

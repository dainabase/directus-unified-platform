// src/frontend/src/portals/superadmin/crm/components/ContactsView.jsx
import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users, UserCheck, UserX, Search, ChevronLeft, ChevronRight
} from 'lucide-react'
import api from '../../../../lib/axios'

// ── Helpers ──────────────────────────────────────────────────────────────────

const buildFilter = (selectedCompany, typeFilter, searchTerm) => {
  const filter = { _and: [] }

  if (selectedCompany && selectedCompany !== 'all') {
    filter._and.push({ owner_company: { _eq: selectedCompany } })
  }

  if (typeFilter === 'employees') {
    filter._and.push({ is_employee: { _eq: true } })
  } else if (typeFilter === 'external') {
    filter._and.push({ is_employee: { _eq: false } })
  }

  if (searchTerm) {
    filter._and.push({
      _or: [
        { first_name: { _icontains: searchTerm } },
        { last_name: { _icontains: searchTerm } },
        { email: { _icontains: searchTerm } }
      ]
    })
  }

  return filter._and.length > 0 ? filter : {}
}

const FIELDS = [
  'id', 'first_name', 'last_name', 'email', 'phone',
  'position', 'company_id', 'is_employee', 'employee_company',
  'owner_company', 'date_created'
]

const PAGE_SIZE = 25

// ── Skeleton ─────────────────────────────────────────────────────────────────

const ContactsViewSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="glass-skeleton h-4 w-28 rounded mb-3" />
          <div className="glass-skeleton h-8 w-16 rounded" />
        </div>
      ))}
    </div>
    <div className="glass-card p-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
          <div className="glass-skeleton h-4 w-40 rounded" />
          <div className="glass-skeleton h-4 w-48 rounded" />
          <div className="glass-skeleton h-4 w-28 rounded" />
          <div className="glass-skeleton h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  </div>
)

// ── Component ────────────────────────────────────────────────────────────────

const ContactsView = ({ selectedCompany }) => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // all | employees | external
  const [page, setPage] = useState(0)

  // Reset page when filters change
  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0) }
  const handleTypeChange = (e) => { setTypeFilter(e.target.value); setPage(0) }

  // ── Fetch all contacts (for KPIs + table) ──
  const { data: allContacts = [], isLoading: loadingAll } = useQuery({
    queryKey: ['contacts-view-all', selectedCompany],
    queryFn: async () => {
      const filter = selectedCompany && selectedCompany !== 'all'
        ? { owner_company: { _eq: selectedCompany } }
        : {}
      const res = await api.get('/items/people', {
        params: { filter, fields: ['id', 'is_employee'], limit: -1 }
      })
      return res.data?.data || []
    },
    staleTime: 2 * 60 * 1000,
    retry: 2
  })

  // ── Fetch filtered page ──
  const filter = useMemo(
    () => buildFilter(selectedCompany, typeFilter, search),
    [selectedCompany, typeFilter, search]
  )

  const { data: pageData, isLoading: loadingPage } = useQuery({
    queryKey: ['contacts-view-page', selectedCompany, typeFilter, search, page],
    queryFn: async () => {
      const res = await api.get('/items/people', {
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

  const contacts = pageData?.items || []
  const totalFiltered = pageData?.total || 0
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE)

  const isLoading = loadingAll || loadingPage

  // ── KPIs ──
  const kpis = useMemo(() => {
    const total = allContacts.length
    const employees = allContacts.filter(c => c.is_employee === true).length
    const external = total - employees
    return { total, employees, external }
  }, [allContacts])

  // ── Loading state ──
  if (isLoading && contacts.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-blue-600" />
          Contacts
        </h2>
        <ContactsViewSkeleton />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Contacts
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Annuaire des contacts et collaborateurs
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500">Total contacts</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.total}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Employes</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.employees}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-500">Contacts externes</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.external}</div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prenom, email..."
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
          <option value="employees">Employes</option>
          <option value="external">Externes</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card p-0 overflow-hidden">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users size={48} className="mb-3 opacity-40" />
            <p className="text-lg font-medium text-gray-500">Aucun contact trouve</p>
            <p className="text-sm mt-1">
              {search
                ? 'Aucun resultat ne correspond a votre recherche.'
                : 'Commencez par ajouter votre premier contact dans Directus.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Telephone</th>
                  <th className="px-5 py-3">Poste</th>
                  <th className="px-5 py-3">Entreprise</th>
                  <th className="px-5 py-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {contact.first_name} {contact.last_name}
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="hover:text-blue-600 transition-colors">
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      {contact.phone ? (
                        <a href={`tel:${contact.phone}`} className="hover:text-blue-600 transition-colors">
                          {contact.phone}
                        </a>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      {contact.position || <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      {contact.employee_company || <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {contact.is_employee ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <UserCheck size={12} />
                          Employe
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <UserX size={12} />
                          Externe
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
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

export default ContactsView

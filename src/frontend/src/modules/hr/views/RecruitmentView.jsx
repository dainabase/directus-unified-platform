import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../../lib/axios'
import {
  UserPlus,
  FileText,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Search
} from 'lucide-react'
import { Card, Badge, Button, Table } from '../../../components/ui'

const RecruitmentView = ({ selectedCompany }) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch non-employee people (candidates / external contacts)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['recruitment-candidates', selectedCompany],
    queryFn: async () => {
      const params = {
        'filter[is_employee][_eq]': false,
        fields: ['id', 'first_name', 'last_name', 'email', 'phone', 'position', 'company_id', 'owner_company', 'date_created'].join(','),
        sort: '-date_created',
        limit: -1
      }

      if (selectedCompany && selectedCompany !== 'all') {
        params['filter[owner_company][_eq]'] = selectedCompany
      }

      const response = await api.get('/items/people', { params })
      return response.data?.data || []
    },
    staleTime: 30000,
    refetchOnWindowFocus: true
  })

  const candidates = data || []

  // Search filter
  const filteredCandidates = useMemo(() => {
    if (!searchTerm.trim()) return candidates
    const term = searchTerm.toLowerCase()
    return candidates.filter(c =>
      (c.first_name || '').toLowerCase().includes(term) ||
      (c.last_name || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.phone || '').toLowerCase().includes(term) ||
      (c.position || '').toLowerCase().includes(term)
    )
  }, [candidates, searchTerm])

  // KPI calculations
  const stats = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const positionCounts = {}
    candidates.forEach(c => {
      const pos = c.position || 'Non renseigne'
      positionCounts[pos] = (positionCounts[pos] || 0) + 1
    })

    const recentCount = candidates.filter(c => {
      if (!c.date_created) return false
      return new Date(c.date_created) >= thirtyDaysAgo
    }).length

    return {
      total: candidates.length,
      uniquePositions: Object.keys(positionCounts).length,
      positionCounts,
      recentCount
    }
  }, [candidates])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Skeleton loader
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-8 w-8 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-100 rounded" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 w-full bg-gray-50 rounded" />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="font-medium mb-2" style={{color:'var(--semantic-red)'}}>Erreur de chargement</p>
        <p className="text-sm text-gray-500">{error?.message || 'Impossible de charger les candidats.'}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8" style={{color:'var(--accent)'}} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total candidats</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-8 h-8" style={{color:'var(--semantic-green)'}} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.uniquePositions}</p>
          <p className="text-sm text-gray-600">Postes distincts</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8" style={{color:'var(--accent)'}} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.recentCount}</p>
          <p className="text-sm text-gray-600">Ajouts (30 derniers jours)</p>
        </Card>
      </div>

      {/* Positions breakdown */}
      {Object.keys(stats.positionCounts).length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Repartition par poste</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.positionCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([position, count]) => (
                <Badge key={position} variant="primary" size="sm">
                  {position}: {count}
                </Badge>
              ))}
          </div>
        </Card>
      )}

      {/* Candidates Table */}
      <Card className="p-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Candidats et contacts externes
            </h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ds-input pl-9 pr-4 py-2 text-sm w-64"
              />
            </div>
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="py-16 text-center">
            <UserPlus size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">Aucun candidat trouve</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm
                ? 'Essayez de modifier votre recherche.'
                : 'Les personnes non-employes apparaitront ici.'}
            </p>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Nom</Table.Header>
                <Table.Header>Email</Table.Header>
                <Table.Header>Telephone</Table.Header>
                <Table.Header>Poste</Table.Header>
                <Table.Header>Entreprise</Table.Header>
                <Table.Header>Date ajout</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredCandidates.map((candidate) => (
                <Table.Row key={candidate.id}>
                  <Table.Cell>
                    <p className="font-medium text-gray-900">
                      {[candidate.first_name, candidate.last_name].filter(Boolean).join(' ') || '-'}
                    </p>
                  </Table.Cell>
                  <Table.Cell>
                    {candidate.email ? (
                      <a
                        href={`mailto:${candidate.email}`}
                        className="hover:underline text-sm"
                        style={{color:'var(--accent)'}}
                      >
                        {candidate.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-700">
                      {candidate.phone || '-'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    {candidate.position ? (
                      <Badge variant="default" size="sm">{candidate.position}</Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-700">
                      {candidate.company_id || '-'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={14} className="text-gray-400" />
                      {formatDate(candidate.date_created)}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        {filteredCandidates.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
            {filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} affiche{filteredCandidates.length > 1 ? 's' : ''}
            {searchTerm && ` sur ${candidates.length} au total`}
          </div>
        )}
      </Card>
    </div>
  )
}

export default RecruitmentView

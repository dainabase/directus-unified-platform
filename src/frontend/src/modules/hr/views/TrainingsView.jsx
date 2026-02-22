import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../../lib/axios'
import {
  GraduationCap, Search, Calendar, Clock,
  BookOpen, TrendingUp, BarChart3
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import toast from 'react-hot-toast'
import { Card, Badge, Table } from '../../../components/ui'

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'
]

const CHART_COLORS = [
  'var(--accent-hover)', 'var(--semantic-green)', 'var(--semantic-orange)', '#5856D6',
  'var(--semantic-red)', '#00C7BE', '#FF2D55', 'var(--semantic-orange)',
  'var(--semantic-green)', '#5856D6', '#30D158', '#AF52DE'
]

const TrainingsView = ({ selectedCompany }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('catalogue')

  // Fetch trainings from Directus
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['trainings', selectedCompany],
    queryFn: async () => {
      const params = {
        fields: '*',
        sort: '-date_created',
        limit: -1
      }

      if (selectedCompany && selectedCompany !== 'all') {
        params['filter[owner_company][_eq]'] = selectedCompany
      }

      const response = await api.get('/items/trainings', { params })
      return response.data?.data || []
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    onError: () => {
      toast.error('Erreur lors du chargement des formations')
    }
  })

  const trainings = data || []

  // Detect available fields dynamically from data
  const dynamicFields = useMemo(() => {
    if (trainings.length === 0) return []
    const knownFields = new Set(['id', 'date_created', 'owner_company', 'date_updated', 'user_created', 'user_updated', 'sort'])
    const allKeys = new Set()
    trainings.forEach(t => {
      Object.keys(t).forEach(k => {
        if (!knownFields.has(k) && t[k] !== null && t[k] !== undefined) {
          allKeys.add(k)
        }
      })
    })
    return Array.from(allKeys)
  }, [trainings])

  // Search filter across all fields
  const filteredTrainings = useMemo(() => {
    if (!searchTerm.trim()) return trainings
    const term = searchTerm.toLowerCase()
    return trainings.filter(t =>
      Object.values(t).some(val =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(term)
      )
    )
  }, [trainings, searchTerm])

  // Monthly distribution from date_created for BarChart
  const monthlyData = useMemo(() => {
    const counts = {}
    trainings.forEach(t => {
      if (!t.date_created) return
      const d = new Date(t.date_created)
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
      const label = `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`
      if (!counts[key]) counts[key] = { key, month: label, count: 0 }
      counts[key].count += 1
    })
    return Object.values(counts).sort((a, b) => a.key.localeCompare(b.key)).slice(-12)
  }, [trainings])

  // Category distribution (if category/type field exists)
  const categoryData = useMemo(() => {
    const categoryField = dynamicFields.find(f =>
      ['category', 'type', 'categorie', 'training_type'].includes(f.toLowerCase())
    )
    if (!categoryField) return []
    const counts = {}
    trainings.forEach(t => {
      const val = t[categoryField] || 'Non classe'
      counts[val] = (counts[val] || 0) + 1
    })
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: CHART_COLORS[i % CHART_COLORS.length]
    }))
  }, [trainings, dynamicFields])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatFieldLabel = (field) => {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
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
            {[1, 2, 3, 4, 5].map(i => (
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
        <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="font-medium mb-2" style={{color:'var(--semantic-red)'}}>Erreur de chargement</p>
        <p className="text-sm text-gray-500">{error?.message || 'Impossible de charger les formations.'}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap size={24} />
            Formations
          </h1>
          <p className="text-gray-600 mt-1">Catalogue et suivi des formations</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8" style={{color:'var(--accent)'}} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{trainings.length}</p>
          <p className="text-sm text-gray-600">Total formations</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8" style={{color:'var(--semantic-green)'}} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{dynamicFields.length}</p>
          <p className="text-sm text-gray-600">Champs disponibles</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8" style={{color:'var(--accent)'}} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{monthlyData.length}</p>
          <p className="text-sm text-gray-600">Mois avec formations</p>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex">
          {[
            { id: 'catalogue', label: 'Catalogue', icon: <BookOpen size={18} /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2
                px-4 py-3 rounded-md transition-all duration-200
                ${activeTab === tab.id
                  ? 'text-white shadow-lg'
                  : 'text-gray-700'}
                style={activeTab === tab.id ? {background:'var(--accent)'} : {}}
              `}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Catalogue Tab */}
      {activeTab === 'catalogue' && (
        <>
          {/* Search */}
          <Card className="p-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les formations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ds-input w-full pl-9 pr-4 py-2 text-sm"
              />
            </div>
          </Card>

          {/* Trainings Table */}
          <Card className="p-0">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Liste des formations ({filteredTrainings.length})
              </h2>
            </div>

            {filteredTrainings.length === 0 ? (
              <div className="py-16 text-center">
                <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">Aucune formation trouvee</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm
                    ? 'Essayez de modifier votre recherche.'
                    : 'Aucune formation enregistree dans Directus.'}
                </p>
              </div>
            ) : (
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header>ID</Table.Header>
                    {dynamicFields.map(field => (
                      <Table.Header key={field}>{formatFieldLabel(field)}</Table.Header>
                    ))}
                    <Table.Header>Date creation</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {filteredTrainings.map((training) => (
                    <Table.Row key={training.id}>
                      <Table.Cell>
                        <span className="text-xs font-mono text-gray-500">
                          {typeof training.id === 'string' ? training.id.slice(0, 8) : training.id}
                        </span>
                      </Table.Cell>
                      {dynamicFields.map(field => (
                        <Table.Cell key={field}>
                          {training[field] !== null && training[field] !== undefined ? (
                            typeof training[field] === 'boolean' ? (
                              <Badge variant={training[field] ? 'success' : 'default'} size="sm">
                                {training[field] ? 'Oui' : 'Non'}
                              </Badge>
                            ) : typeof training[field] === 'number' ? (
                              <span className="text-sm font-medium text-gray-900">
                                {training[field]}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-700">
                                {String(training[field]).length > 60
                                  ? `${String(training[field]).slice(0, 60)}...`
                                  : String(training[field])}
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </Table.Cell>
                      ))}
                      <Table.Cell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          {formatDate(training.date_created)}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}

            {filteredTrainings.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
                {filteredTrainings.length} formation{filteredTrainings.length > 1 ? 's' : ''}
                {searchTerm && ` sur ${trainings.length} au total`}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trainings by month BarChart */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Formations par mois
            </h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="count"
                    name="Formations"
                    fill="var(--accent)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>Pas de donnees temporelles disponibles</p>
              </div>
            )}
          </Card>

          {/* Category PieChart (if category data detected) */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Repartition par categorie
            </h3>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-3">
                  {categoryData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>Aucun champ de categorie detecte dans les donnees</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

export default TrainingsView

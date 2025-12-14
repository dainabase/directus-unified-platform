import React, { useState } from 'react'
import { 
  Grid3X3, 
  List, 
  Calendar,
  BarChart3,
  Plus,
  Filter,
  Search,
  Download,
  MoreVertical
} from 'lucide-react'
import { Button, Input, Select, Badge, GlassCard } from '../../components/ui'
import GridView from './views/GridView'
import ListView from './views/ListView'
import KanbanView from './views/KanbanView'
import TimelineView from './views/TimelineView'
import { useProjects } from '../../services/hooks/useProjects'

const ProjectsModule = ({ selectedCompany }) => {
  const [currentView, setCurrentView] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  // Fetch projects data
  const { data: projects, isLoading } = useProjects({ 
    company: selectedCompany === 'all' ? undefined : selectedCompany 
  })

  // View options
  const viewOptions = [
    { id: 'grid', label: 'Grille', icon: <Grid3X3 size={18} /> },
    { id: 'list', label: 'Liste', icon: <List size={18} /> },
    { id: 'kanban', label: 'Kanban', icon: <BarChart3 size={18} /> },
    { id: 'timeline', label: 'Timeline', icon: <Calendar size={18} /> }
  ]

  // Filter projects
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  }) || []

  // Stats
  const stats = {
    total: filteredProjects.length,
    active: filteredProjects.filter(p => p.status === 'active').length,
    completed: filteredProjects.filter(p => p.status === 'completed').length,
    totalBudget: filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-600 mt-1">
            Gérez tous vos projets en cours
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />}>
          Nouveau Projet
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <p className="text-sm text-gray-600">Total Projets</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-sm text-gray-600">Projets Actifs</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.active}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-sm text-gray-600">Terminés</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-sm text-gray-600">Budget Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {(stats.totalBudget / 1000).toFixed(0)}K CHF
          </p>
        </GlassCard>
      </div>

      {/* Filters and View Switcher */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <Input
            type="search"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
            className="lg:w-96"
          />

          {/* Filters */}
          <div className="flex gap-4 flex-1">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'active', label: 'Actif' },
                { value: 'pending', label: 'En attente' },
                { value: 'completed', label: 'Terminé' },
                { value: 'on_hold', label: 'En pause' }
              ]}
              className="w-48"
            />

            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              options={[
                { value: 'all', label: 'Toutes les priorités' },
                { value: 'critical', label: 'Critique' },
                { value: 'high', label: 'Haute' },
                { value: 'medium', label: 'Moyenne' },
                { value: 'low', label: 'Basse' }
              ]}
              className="w-48"
            />
          </div>

          {/* View Switcher */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {viewOptions.map(view => (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md
                  transition-all duration-200
                  ${currentView === view.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'}
                `}
              >
                {view.icon}
                <span className="text-sm font-medium">{view.label}</span>
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Projects View */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {currentView === 'grid' && <GridView projects={filteredProjects} />}
            {currentView === 'list' && <ListView projects={filteredProjects} />}
            {currentView === 'kanban' && <KanbanView projects={filteredProjects} />}
            {currentView === 'timeline' && <TimelineView projects={filteredProjects} />}
          </>
        )}
      </div>
    </div>
  )
}

export default ProjectsModule
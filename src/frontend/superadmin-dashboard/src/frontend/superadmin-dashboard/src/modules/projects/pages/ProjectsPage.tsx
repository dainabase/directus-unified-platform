import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { collections } from '../../../core/api/client'
import { useAppStore } from '../../../core/store/appStore'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Calendar,
  Download,
  Upload
} from 'lucide-react'
import { ProjectsGrid } from '../components/ProjectsGrid'
import { ProjectsList } from '../components/ProjectsList'
import { ProjectsKanban } from '../components/ProjectsKanban'

type ViewMode = 'grid' | 'list' | 'kanban'

const ProjectsPage: React.FC = () => {
  const { selectedCompany } = useAppStore()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', selectedCompany?.id, filterStatus, searchQuery],
    queryFn: () => collections.projects.list({
      filter: {
        ...(selectedCompany && { owner_company: { _eq: selectedCompany.id } }),
        ...(filterStatus !== 'all' && { status: { _eq: filterStatus } }),
        ...(searchQuery && { name: { _contains: searchQuery } })
      },
      fields: ['*', 'client.*', 'project_manager.*'],
      sort: ['-created_at']
    }),
    enabled: !!selectedCompany?.id
  })

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">
            Manage and track all your projects in one place
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="h-5 w-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Filters and actions */}
          <div className="flex items-center space-x-3">
            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* More filters */}
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm">More filters</span>
            </button>

            {/* View mode */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 border-l transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-5 w-5" />
              </button>
            </div>

            {/* Actions */}
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects view */}
      {viewMode === 'grid' && (
        <ProjectsGrid projects={projects || []} loading={isLoading} />
      )}
      {viewMode === 'list' && (
        <ProjectsList projects={projects || []} loading={isLoading} />
      )}
      {viewMode === 'kanban' && (
        <ProjectsKanban projects={projects || []} loading={isLoading} />
      )}
    </div>
  )
}

export default ProjectsPage
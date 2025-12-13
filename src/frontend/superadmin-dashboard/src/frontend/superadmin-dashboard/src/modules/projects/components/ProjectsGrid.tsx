import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Pause,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface Project {
  id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  budget: number
  spent: number
  progress: number
  client?: {
    name: string
    logo?: string
  }
  project_manager?: {
    first_name: string
    last_name: string
    avatar?: string
  }
  team_members?: any[]
}

interface ProjectsGridProps {
  projects: Project[]
  loading?: boolean
}

const getStatusIcon = (status: Project['status']) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'on_hold':
      return <Pause className="h-5 w-5 text-yellow-500" />
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-gray-500" />
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-red-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-blue-500" />
  }
}

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'planning':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
  }
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="mt-6 h-2 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!projects.length) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-gray-500">No projects found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link
          key={project.id}
          to={`/projects/${project.id}`}
          className="glass rounded-xl p-6 hover:shadow-lg transition-all group"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              {project.client && (
                <p className="text-sm text-gray-500 mt-1">{project.client.name}</p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                // Handle menu
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2 mb-4">
            {getStatusIcon(project.status)}
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium text-gray-900">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <DollarSign className="h-4 w-4 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Budget</p>
              <p className="text-sm font-medium text-gray-900">
                CHF {(project.budget / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="text-center">
              <Calendar className="h-4 w-4 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Due Date</p>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(project.end_date), 'MMM d')}
              </p>
            </div>
          </div>

          {/* Team */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex -space-x-2">
              {project.project_manager && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
                  {project.project_manager.first_name[0]}{project.project_manager.last_name[0]}
                </div>
              )}
              {project.team_members?.slice(0, 3).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white"
                />
              ))}
              {project.team_members && project.team_members.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    +{project.team_members.length - 3}
                  </span>
                </div>
              )}
            </div>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
        </Link>
      ))}
    </div>
  )
}
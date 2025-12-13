import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { collections } from '../../../core/api/client'
import { useAppStore } from '../../../core/store/appStore'
import { FolderOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Project {
  id: string
  name: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  progress: number
  due_date: string
  client: {
    name: string
  }
  budget: number
  spent: number
}

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'planning':
      return 'bg-blue-100 text-blue-800'
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
  }
}

const getStatusIcon = (status: Project['status']) => {
  switch (status) {
    case 'planning':
      return <Clock className="h-4 w-4" />
    case 'active':
      return <FolderOpen className="h-4 w-4" />
    case 'completed':
      return <CheckCircle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

export const ProjectsOverview: React.FC = () => {
  const { selectedCompany } = useAppStore()

  const { data: projects, isLoading } = useQuery({
    queryKey: ['dashboard-projects', selectedCompany?.id],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: '1',
          name: 'Website Redesign',
          status: 'active' as const,
          progress: 65,
          due_date: '2024-02-15',
          client: { name: 'Acme Corp' },
          budget: 25000,
          spent: 16250
        },
        {
          id: '2',
          name: 'Mobile App Development',
          status: 'active' as const,
          progress: 40,
          due_date: '2024-03-30',
          client: { name: 'TechStart Inc' },
          budget: 45000,
          spent: 18000
        },
        {
          id: '3',
          name: 'Marketing Campaign',
          status: 'planning' as const,
          progress: 15,
          due_date: '2024-04-15',
          client: { name: 'Global Retail' },
          budget: 15000,
          spent: 2250
        },
        {
          id: '4',
          name: 'E-commerce Platform',
          status: 'active' as const,
          progress: 80,
          due_date: '2024-01-30',
          client: { name: 'Fashion House' },
          budget: 35000,
          spent: 28000
        }
      ]
    },
    enabled: !!selectedCompany?.id
  })

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
        <Link 
          to="/projects" 
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View all projects
        </Link>
      </div>

      <div className="space-y-4">
        {projects?.map((project) => (
          <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                <p className="text-sm text-gray-500">{project.client.name}</p>
              </div>
              <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                <span className="capitalize">{project.status}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
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

              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-500">Budget: </span>
                  <span className="font-medium text-gray-900">
                    CHF {project.spent.toLocaleString()} / {project.budget.toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-500">
                  Due: {new Date(project.due_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
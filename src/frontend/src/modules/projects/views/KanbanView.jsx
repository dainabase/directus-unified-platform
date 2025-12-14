import React, { useState } from 'react'
import { 
  Calendar,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../../components/ui'

const KanbanView = ({ projects }) => {
  const [draggingProject, setDraggingProject] = useState(null)

  // Kanban columns configuration
  const columns = [
    { id: 'pending', title: 'En attente', color: 'gray' },
    { id: 'active', title: 'En cours', color: 'blue' },
    { id: 'on_hold', title: 'En pause', color: 'yellow' },
    { id: 'completed', title: 'Terminé', color: 'green' }
  ]

  // Group projects by status
  const projectsByStatus = columns.reduce((acc, column) => {
    acc[column.id] = projects.filter(p => p.status === column.id)
    return acc
  }, {})

  const handleDragStart = (e, project) => {
    setDraggingProject(project)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, newStatus) => {
    e.preventDefault()
    if (draggingProject) {
      // Here you would update the project status in the backend
      console.log(`Moving project ${draggingProject.id} to ${newStatus}`)
      setDraggingProject(null)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-CH', {
      day: 'numeric',
      month: 'short'
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-blue-600 bg-blue-50'
      case 'low': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {column.title}
              </h3>
              <Badge variant="default" size="sm">
                {projectsByStatus[column.id].length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="p-1">
              <Plus size={16} />
            </Button>
          </div>

          {/* Column Content */}
          <div className="space-y-3">
            {projectsByStatus[column.id].map((project) => {
              const isOverdue = new Date(project.end_date) < new Date() && column.id !== 'completed'
              const progress = project.completion_percentage || 0

              return (
                <GlassCard
                  key={project.id}
                  className="cursor-move p-4"
                  draggable
                  onDragStart={(e) => handleDragStart(e, project)}
                >
                  {/* Project Header */}
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {project.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {project.owner_company}
                    </p>
                  </div>

                  {/* Priority Badge */}
                  <div className="mb-3">
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                      ${getPriorityColor(project.priority)}
                    `}>
                      {project.priority}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Progression</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          column.color === 'blue' ? 'bg-blue-600' :
                          column.color === 'green' ? 'bg-green-600' :
                          column.color === 'yellow' ? 'bg-yellow-600' :
                          'bg-gray-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar size={14} />
                        <span>Échéance</span>
                      </div>
                      <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(project.end_date)}
                      </span>
                    </div>

                    {project.budget && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <DollarSign size={14} />
                          <span>Budget</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {(project.budget / 1000).toFixed(0)}K
                        </span>
                      </div>
                    )}

                    {project.team_size && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users size={14} />
                          <span>Équipe</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {project.team_size}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Warning */}
                  {isOverdue && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle size={12} />
                        <span>En retard</span>
                      </div>
                    </div>
                  )}
                </GlassCard>
              )
            })}

            {/* Empty State */}
            {projectsByStatus[column.id].length === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500">
                  Aucun projet
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KanbanView
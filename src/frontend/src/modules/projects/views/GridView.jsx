import React from 'react'
import { 
  Calendar,
  Users,
  DollarSign,
  Clock,
  MoreVertical,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { Card, Badge, Button } from '../../../components/ui'

const GridView = ({ projects }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'primary'
      case 'completed': return 'success'
      case 'on_hold': return 'warning'
      case 'pending': return 'default'
      default: return 'default'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-CH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => {
        const progress = project.completion_percentage || 0
        const isOverBudget = project.spent_amount > project.budget
        const isOverdue = new Date(project.end_date) < new Date() && project.status !== 'completed'

        return (
          <Card
            key={project.id}
            hoverable
            className="relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {project.owner_company}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="p-1">
                <MoreVertical size={16} />
              </Button>
            </div>

            {/* Status and Priority */}
            <div className="flex gap-2 mb-4">
              <Badge variant={getStatusColor(project.status)} size="sm">
                {project.status}
              </Badge>
              <Badge variant={getPriorityColor(project.priority)} size="sm">
                {project.priority}
              </Badge>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progression</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{background:'var(--accent)'}}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={14} />
                  <span>Échéance</span>
                </div>
                <span className="font-medium" style={isOverdue ? {color:'var(--danger)'} : {color:'#1D1D1F'}}>
                  {formatDate(project.end_date)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign size={14} />
                  <span>Budget</span>
                </div>
                <span className="font-medium" style={isOverBudget ? {color:'var(--danger)'} : {color:'#1D1D1F'}}>
                  {(project.budget / 1000).toFixed(0)}K CHF
                </span>
              </div>

              {project.team_size && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} />
                    <span>Équipe</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {project.team_size} pers.
                  </span>
                </div>
              )}
            </div>

            {/* Warnings */}
            {(isOverBudget || isOverdue) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle size={14} style={{color:'var(--danger)'}} />
                  <span style={{color:'var(--danger)'}}>
                    {isOverBudget && isOverdue 
                      ? 'Budget dépassé & En retard'
                      : isOverBudget 
                      ? 'Budget dépassé'
                      : 'En retard'}
                  </span>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

export default GridView
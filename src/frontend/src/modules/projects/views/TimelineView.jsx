import React from 'react'
import { 
  Calendar,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, Badge, Button } from '../../../components/ui'

const TimelineView = ({ projects }) => {
  // Get current date and calculate date range
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Generate months for the timeline (6 months view)
  const months = []
  for (let i = -2; i < 4; i++) {
    const date = new Date(currentYear, currentMonth + i)
    months.push({
      month: date.toLocaleDateString('fr-CH', { month: 'short' }),
      year: date.getFullYear(),
      fullDate: date
    })
  }

  // Generate days for the current month view
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Calculate project position on timeline
  const getProjectPosition = (project, viewType = 'month') => {
    const startDate = new Date(project.start_date)
    const endDate = new Date(project.end_date)
    
    if (viewType === 'month') {
      const firstDay = new Date(currentYear, currentMonth, 1)
      const lastDay = new Date(currentYear, currentMonth + 1, 0)
      
      // Calculate position and width as percentages
      const projectStart = Math.max(startDate, firstDay)
      const projectEnd = Math.min(endDate, lastDay)
      
      if (projectEnd < firstDay || projectStart > lastDay) {
        return null // Project not in current month
      }
      
      const startOffset = Math.max(0, (projectStart - firstDay) / (1000 * 60 * 60 * 24))
      const duration = (projectEnd - projectStart) / (1000 * 60 * 60 * 24) + 1
      
      return {
        left: `${(startOffset / daysInMonth) * 100}%`,
        width: `${(duration / daysInMonth) * 100}%`
      }
    }
  }

  // Group projects by company
  const projectsByCompany = projects.reduce((acc, project) => {
    if (!acc[project.owner_company]) {
      acc[project.owner_company] = []
    }
    acc[project.owner_company].push(project)
    return acc
  }, {})

  const getStatusBg = (status) => {
    switch (status) {
      case 'active': return 'var(--accent)'
      case 'completed': return 'var(--success)'
      case 'on_hold': return 'var(--warning)'
      case 'pending': return '#AEAEB2'
      default: return '#AEAEB2'
    }
  }

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Timeline - {months[2].month} {months[2].year}
            </h3>
            <div className="flex gap-2">
              <Badge variant="primary" size="sm">Active</Badge>
              <Badge variant="success" size="sm">Terminé</Badge>
              <Badge variant="warning" size="sm">En pause</Badge>
              <Badge variant="default" size="sm">En attente</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={<ChevronLeft size={16} />}>
              Précédent
            </Button>
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />}>
              Suivant
            </Button>
          </div>
        </div>

        {/* Days Header */}
        <div className="relative border-b border-gray-200 pb-2 mb-4">
          <div className="flex">
            {days.map((day) => {
              const isToday = day === today.getDate()
              return (
                <div
                  key={day}
                  className={`
                    flex-1 text-center text-xs
                    ${isToday ? 'font-bold' : 'text-gray-600'}
                  `}
                  style={isToday ? { minWidth: '30px', color: 'var(--accent)' } : { minWidth: '30px' }}
                >
                  {day}
                </div>
              )
            })}
          </div>
          {/* Today marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 z-10"
            style={{background:'var(--danger)'}}
            style={{ left: `${(today.getDate() / daysInMonth) * 100}%` }}
          />
        </div>

        {/* Projects Timeline */}
        <div className="space-y-6">
          {Object.entries(projectsByCompany).map(([company, companyProjects]) => (
            <div key={company}>
              <h4 className="font-medium text-gray-700 mb-3">{company}</h4>
              <div className="relative" style={{ minHeight: `${companyProjects.length * 40}px` }}>
                {companyProjects.map((project, index) => {
                  const position = getProjectPosition(project)
                  if (!position) return null

                  const isOverdue = new Date(project.end_date) < today && project.status !== 'completed'

                  return (
                    <div
                      key={project.id}
                      className={`
                        absolute h-8 rounded-md overflow-hidden cursor-pointer
                        transition-all duration-200 hover:shadow-lg hover:z-20
                        ${getStatusColor(project.status)}
                      `}
                      style={{
                        ...position,
                        top: `${index * 40}px`,
                        minWidth: '80px'
                      }}
                      title={`${project.name} (${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()})`}
                    >
                      <div className="h-full px-2 flex items-center gap-2">
                        {isOverdue && (
                          <AlertCircle size={14} className="text-white flex-shrink-0" />
                        )}
                        <span className="text-xs text-white font-medium truncate">
                          {project.name}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Projects List */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Détails des projets
        </h3>
        <div className="space-y-3">
          {projects
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
            .map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                  <div>
                    <p className="font-medium text-gray-900">
                      {project.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {project.owner_company}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-700">
                      {new Date(project.start_date).toLocaleDateString('fr-CH')} - {new Date(project.end_date).toLocaleDateString('fr-CH')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.ceil((new Date(project.end_date) - new Date(project.start_date)) / (1000 * 60 * 60 * 24))} jours
                    </p>
                  </div>
                  <Badge variant={
                    project.status === 'active' ? 'primary' :
                    project.status === 'completed' ? 'success' :
                    project.status === 'on_hold' ? 'warning' :
                    'default'
                  } size="sm">
                    {project.status}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}

export default TimelineView
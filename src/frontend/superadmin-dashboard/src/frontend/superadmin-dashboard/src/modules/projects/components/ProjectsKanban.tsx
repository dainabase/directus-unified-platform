import React from 'react'

interface ProjectsKanbanProps {
  projects: any[]
  loading?: boolean
}

export const ProjectsKanban: React.FC<ProjectsKanbanProps> = ({ projects, loading }) => {
  const columns = [
    { id: 'planning', title: 'Planning', color: 'bg-blue-500' },
    { id: 'active', title: 'Active', color: 'bg-green-500' },
    { id: 'on_hold', title: 'On Hold', color: 'bg-yellow-500' },
    { id: 'completed', title: 'Completed', color: 'bg-gray-500' },
  ]

  if (loading) {
    return (
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className="glass rounded-xl p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const projectsByStatus = projects.reduce((acc, project) => {
    const status = project.status || 'planning'
    if (!acc[status]) acc[status] = []
    acc[status].push(project)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                {projectsByStatus[column.id]?.length || 0}
              </span>
            </div>
            <div className={`h-1 ${column.color} rounded mb-4`} />
            
            <div className="space-y-3">
              {projectsByStatus[column.id]?.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h4 className="font-medium text-gray-900 mb-2">{project.name}</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    {project.client?.name || 'No client'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1">
                      <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                        PM
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {project.progress}% complete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
import React, { useState } from 'react'
import { CheckCircle2, Circle, Clock, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: Date
  assignee: {
    name: string
    avatar?: string
  }
}

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return 'text-red-500'
    case 'medium':
      return 'text-yellow-500'
    case 'low':
      return 'text-green-500'
  }
}

export const TasksWidget: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all')
  
  // Mock data
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Review Q4 financial reports',
      status: 'todo',
      priority: 'high',
      due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      assignee: { name: 'Sarah Johnson' }
    },
    {
      id: '2',
      title: 'Update client onboarding process',
      description: 'Implement new requirements from legal team',
      status: 'in_progress',
      priority: 'medium',
      due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      assignee: { name: 'Michael Chen' }
    },
    {
      id: '3',
      title: 'Deploy new features to production',
      status: 'todo',
      priority: 'high',
      due_date: new Date(Date.now() + 1000 * 60 * 60 * 24),
      assignee: { name: 'Alex Turner' }
    },
    {
      id: '4',
      title: 'Prepare monthly team meeting',
      status: 'done',
      priority: 'low',
      due_date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      assignee: { name: 'Emma Wilson' }
    }
  ]

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter)

  const toggleTaskStatus = (taskId: string) => {
    // In real app, this would update via API
    console.log('Toggle task:', taskId)
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          Add task
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-4 mb-4 text-sm">
        {['all', 'todo', 'in_progress', 'done'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`pb-1 border-b-2 transition-colors ${
              filter === status 
                ? 'text-primary border-primary' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {status === 'todo' && 'To Do'}
            {status === 'in_progress' && 'In Progress'}
            {status === 'done' && 'Done'}
            {status === 'all' && 'All'}
          </button>
        ))}
      </div>

      {/* Tasks list */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div 
            key={task.id} 
            className={`border rounded-lg p-3 hover:shadow-sm transition-all ${
              task.status === 'done' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <button
                onClick={() => toggleTaskStatus(task.id)}
                className="mt-0.5"
              >
                {task.status === 'done' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 hover:text-primary" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium text-gray-900 ${
                    task.status === 'done' ? 'line-through' : ''
                  }`}>
                    {task.title}
                  </h4>
                  <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                )}
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(task.due_date, 'MMM d')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{task.assignee.name}</span>
                  </div>
                  {task.status === 'in_progress' && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>In progress</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks found</p>
        </div>
      )}
    </div>
  )
}
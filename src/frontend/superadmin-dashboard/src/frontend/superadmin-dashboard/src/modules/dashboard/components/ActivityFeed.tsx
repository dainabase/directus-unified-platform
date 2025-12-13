import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { 
  FileText, 
  UserPlus, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Archive
} from 'lucide-react'

interface Activity {
  id: string
  type: 'invoice' | 'user' | 'payment' | 'task' | 'alert' | 'project'
  title: string
  description: string
  timestamp: Date
  user: {
    name: string
    avatar?: string
  }
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'invoice':
      return <FileText className="h-5 w-5 text-blue-500" />
    case 'user':
      return <UserPlus className="h-5 w-5 text-green-500" />
    case 'payment':
      return <DollarSign className="h-5 w-5 text-emerald-500" />
    case 'task':
      return <CheckCircle className="h-5 w-5 text-purple-500" />
    case 'alert':
      return <AlertCircle className="h-5 w-5 text-red-500" />
    case 'project':
      return <Archive className="h-5 w-5 text-orange-500" />
  }
}

export const ActivityFeed: React.FC = () => {
  // Mock data - in real app, this would come from API
  const activities: Activity[] = [
    {
      id: '1',
      type: 'invoice',
      title: 'New invoice created',
      description: 'Invoice #INV-2024-001 for CHF 12,500',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      user: { name: 'Sarah Johnson' }
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment received',
      description: 'CHF 8,200 from Acme Corp',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: { name: 'System' }
    },
    {
      id: '3',
      type: 'user',
      title: 'New team member',
      description: 'Michael Chen joined as Developer',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      user: { name: 'HR Admin' }
    },
    {
      id: '4',
      type: 'task',
      title: 'Task completed',
      description: 'Website redesign phase 1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      user: { name: 'Alex Turner' }
    },
    {
      id: '5',
      type: 'alert',
      title: 'Overdue invoice',
      description: 'Invoice #INV-2023-089 is 15 days overdue',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      user: { name: 'System' }
    }
  ]

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <div className="mt-1 flex items-center space-x-2 text-xs text-gray-400">
                <span>{activity.user.name}</span>
                <span>•</span>
                <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-500">Updated just now</span>
        </div>
      </div>
    </div>
  )
}
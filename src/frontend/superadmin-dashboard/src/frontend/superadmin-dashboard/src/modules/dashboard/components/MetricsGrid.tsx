import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, Users, FolderOpen, Clock } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  prefix?: string
  suffix?: string
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  prefix = '',
  suffix = ''
}) => {
  const isPositive = change >= 0

  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          <div className="mt-2 flex items-center">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="ml-1 text-sm text-gray-500">vs last month</span>
          </div>
        </div>
        <div className="ml-4 p-3 bg-primary/10 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  )
}

interface MetricsGridProps {
  loading?: boolean
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ loading = false }) => {
  const metrics = [
    {
      title: 'Total Revenue',
      value: 254320,
      change: 12.5,
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      prefix: 'CHF '
    },
    {
      title: 'Active Projects',
      value: 24,
      change: 8.3,
      icon: <FolderOpen className="h-6 w-6 text-primary" />
    },
    {
      title: 'Total Clients',
      value: 186,
      change: -2.4,
      icon: <Users className="h-6 w-6 text-primary" />
    },
    {
      title: 'Pending Tasks',
      value: 47,
      change: 15.7,
      icon: <Clock className="h-6 w-6 text-primary" />
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass p-6 rounded-xl animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  )
}
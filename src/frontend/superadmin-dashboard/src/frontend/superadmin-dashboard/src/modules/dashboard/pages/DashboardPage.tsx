import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { collections } from '../../../core/api/client'
import { useAppStore } from '../../../core/store/appStore'
import { MetricsGrid } from '../components/MetricsGrid'
import { ActivityFeed } from '../components/ActivityFeed'
import { ProjectsOverview } from '../components/ProjectsOverview'
import { FinanceOverview } from '../components/FinanceOverview'
import { TasksWidget } from '../components/TasksWidget'
import { CalendarWidget } from '../components/CalendarWidget'

const DashboardPage: React.FC = () => {
  const { selectedCompany } = useAppStore()

  // Fetch dashboard KPIs
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis', selectedCompany?.id],
    queryFn: () => collections.kpis.list({
      filter: {
        owner_company: { _eq: selectedCompany?.id }
      }
    }),
    enabled: !!selectedCompany?.id
  })

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Download Report
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">
            Quick Action
          </button>
        </div>
      </div>

      {/* Metrics */}
      <MetricsGrid loading={kpisLoading} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2 cols wide */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects Overview */}
          <ProjectsOverview />
          
          {/* Finance Overview */}
          <FinanceOverview />
        </div>

        {/* Right column - 1 col wide */}
        <div className="space-y-6">
          {/* Tasks */}
          <TasksWidget />
          
          {/* Calendar */}
          <CalendarWidget />
          
          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
// 🎯 DATA DISPLAY SECTION - ANALYTICS & BUSINESS INTELLIGENCE SHOWCASE
// Demonstrates charts, tables, grids, and data visualization components

import React, { useState } from 'react';
import { 
  Table,
  DataGrid,
  Chart,
  Calendar,
  Timeline,
  Badge,
  Card,
  Progress
} from '../components';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Table as TableIcon,
  Activity,
  PieChart,
  LineChart,
  Target,
  Users,
  DollarSign,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

// =================== DEMO DATA ===================

const salesData = [
  { month: 'Jan', revenue: 42000, growth: 12 },
  { month: 'Feb', revenue: 47000, growth: 18 },
  { month: 'Mar', revenue: 53000, growth: 15 },
  { month: 'Apr', revenue: 61000, growth: 22 },
  { month: 'May', revenue: 58000, growth: -8 },
  { month: 'Jun', revenue: 68000, growth: 25 }
];

const tableData = [
  { id: 1, customer: 'Acme Corp', revenue: '$125,000', status: 'active', growth: 15.2 },
  { id: 2, customer: 'TechStart Inc', revenue: '$89,000', status: 'pending', growth: -3.1 },
  { id: 3, customer: 'Global Dynamics', revenue: '$234,000', status: 'active', growth: 8.7 },
  { id: 4, customer: 'Innovation Labs', revenue: '$156,000', status: 'inactive', growth: 22.4 },
  { id: 5, customer: 'Future Systems', revenue: '$98,000', status: 'active', growth: -1.8 }
];

const timelineData = [
  { date: '2025-01-15', title: 'Q1 Planning', type: 'milestone', status: 'completed' },
  { date: '2025-02-01', title: 'Product Launch', type: 'event', status: 'completed' },
  { date: '2025-02-15', title: 'Marketing Campaign', type: 'task', status: 'in-progress' },
  { date: '2025-03-01', title: 'Q1 Review', type: 'milestone', status: 'upcoming' },
  { date: '2025-03-15', title: 'Feature Release', type: 'event', status: 'upcoming' }
];

// =================== COMPONENTS ===================

const StatCard = ({ icon: Icon, value, label, trend }: { 
  icon: any, value: string, label: string, trend?: number 
}) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-2">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
    {trend !== undefined && (
      <div className={`text-xs font-medium mt-1 flex items-center justify-center ${
        trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {trend > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : 
         trend < 0 ? <ArrowDown className="w-3 h-3 mr-1" /> : 
         <Minus className="w-3 h-3 mr-1" />}
        {Math.abs(trend)}%
      </div>
    )}
  </div>
);

const ComponentDemo = ({ 
  title, 
  description, 
  children, 
  fullWidth = false 
}: { 
  title: string, 
  description: string, 
  children: React.ReactNode,
  fullWidth?: boolean
}) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    <div className="p-6">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className={fullWidth ? "w-full" : "flex flex-wrap gap-4"}>
        {children}
      </div>
    </div>
  </div>
);

const KPICard = ({ title, value, change, icon: Icon }: {
  title: string, value: string, change: number, icon: any
}) => (
  <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-medium text-gray-600">{title}</h4>
      <Icon className="w-5 h-5 text-gray-500" />
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
    <div className={`text-sm font-medium flex items-center ${
      change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
    }`}>
      {change > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : 
       change < 0 ? <ArrowDown className="w-4 h-4 mr-1" /> : 
       <Minus className="w-4 h-4 mr-1" />}
      {Math.abs(change)}% from last month
    </div>
  </div>
);

// =================== MAIN SECTION ===================

export const DataSection = () => {
  const [activeDemo, setActiveDemo] = useState<string>('charts');

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Data Display & Analytics
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-6">
          Professional data visualization components for business intelligence, 
          analytics dashboards, and enterprise reporting with real-time updates.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <StatCard icon={BarChart3} value="6+" label="Components" trend={15} />
          <StatCard icon={Target} value="Real-time" label="Updates" />
          <StatCard icon={TrendingUp} value="Interactive" label="Charts" />
          <StatCard icon={TableIcon} value="Advanced" label="Tables" />
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {[
          { id: 'charts', label: 'Charts & Graphs', icon: BarChart3 },
          { id: 'tables', label: 'Data Tables', icon: TableIcon },
          { id: 'grids', label: 'Advanced Grids', icon: Activity },
          { id: 'timeline', label: 'Timeline & Calendar', icon: CalendarIcon },
          { id: 'dashboard', label: 'Dashboard Example', icon: Target }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveDemo(id)}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeDemo === id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Demo Content */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Charts Demo */}
        {activeDemo === 'charts' && (
          <>
            <ComponentDemo
              title="Interactive Charts"
              description="Beautiful data visualizations with hover effects and responsive design"
              fullWidth
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                    <LineChart className="w-5 h-5 mr-2" />
                    Revenue Trend
                  </h4>
                  <div className="h-48 bg-white rounded-lg p-4 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Interactive Line Chart</p>
                      <p className="text-xs">Revenue: $68K (+25%)</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg p-6">
                  <h4 className="font-semibold text-emerald-900 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Market Distribution
                  </h4>
                  <div className="h-48 bg-white rounded-lg p-4 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Interactive Pie Chart</p>
                      <p className="text-xs">5 Segments</p>
                    </div>
                  </div>
                </div>
              </div>
            </ComponentDemo>

            <ComponentDemo
              title="Chart Variants"
              description="Multiple chart types for different data visualization needs"
              fullWidth
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {[
                  { name: 'Area Chart', icon: Activity, color: 'blue' },
                  { name: 'Bar Chart', icon: BarChart3, color: 'emerald' },
                  { name: 'Line Chart', icon: LineChart, color: 'purple' },
                  { name: 'Donut Chart', icon: PieChart, color: 'orange' }
                ].map((chart) => (
                  <div key={chart.name} className={`bg-gradient-to-br from-${chart.color}-50 to-${chart.color}-100 rounded-lg p-4 text-center`}>
                    <chart.icon className={`w-8 h-8 mx-auto mb-2 text-${chart.color}-600`} />
                    <h5 className={`font-medium text-${chart.color}-900 text-sm`}>{chart.name}</h5>
                  </div>
                ))}
              </div>
            </ComponentDemo>
          </>
        )}

        {/* Tables Demo */}
        {activeDemo === 'tables' && (
          <ComponentDemo
            title="Professional Data Tables"
            description="Feature-rich tables with sorting, filtering, and pagination"
            fullWidth
          >
            <div className="w-full">
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Growth
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tableData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{row.customer}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{row.revenue}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={
                              row.status === 'active' ? 'success' : 
                              row.status === 'pending' ? 'warning' : 
                              'secondary'
                            }
                          >
                            {row.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium flex items-center ${
                            row.growth > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {row.growth > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                            {Math.abs(row.growth)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ComponentDemo>
        )}

        {/* Timeline Demo */}
        {activeDemo === 'timeline' && (
          <ComponentDemo
            title="Timeline & Calendar Components"
            description="Project timelines, event calendars, and scheduling interfaces"
            fullWidth
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Project Timeline
                </h4>
                <div className="space-y-4">
                  {timelineData.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'in-progress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`}></div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.title}</h5>
                        <p className="text-sm text-gray-500">{item.date}</p>
                        <Badge 
                          variant={
                            item.status === 'completed' ? 'success' :
                            item.status === 'in-progress' ? 'default' :
                            'secondary'
                          }
                          className="mt-1"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Calendar View
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Interactive Calendar</p>
                    <p className="text-xs">Event scheduling & management</p>
                  </div>
                </div>
              </div>
            </div>
          </ComponentDemo>
        )}

        {/* Dashboard Example */}
        {activeDemo === 'dashboard' && (
          <ComponentDemo
            title="Executive Dashboard Example"
            description="Real-world dashboard combining multiple data components"
            fullWidth
          >
            <div className="w-full space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard 
                  title="Total Revenue" 
                  value="$847K" 
                  change={12.5} 
                  icon={DollarSign} 
                />
                <KPICard 
                  title="Active Users" 
                  value="24,891" 
                  change={8.2} 
                  icon={Users} 
                />
                <KPICard 
                  title="Conversion Rate" 
                  value="3.24%" 
                  change={-2.1} 
                  icon={Target} 
                />
                <KPICard 
                  title="Avg. Session" 
                  value="4:32" 
                  change={15.7} 
                  icon={Clock} 
                />
              </div>

              {/* Progress Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h5 className="font-medium text-gray-800 mb-3">Q1 Goals Progress</h5>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Revenue Target</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>User Acquisition</span>
                        <span>64%</span>
                      </div>
                      <Progress value={64} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Feature Rollout</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h5 className="font-medium text-gray-800 mb-3">Top Performers</h5>
                  <div className="space-y-3">
                    {tableData.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.customer}</span>
                        <span className="text-sm font-medium text-gray-900">{item.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h5 className="font-medium text-gray-800 mb-3">Recent Activities</h5>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="text-gray-900">New user registration</p>
                      <p className="text-gray-500">2 minutes ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900">Payment received</p>
                      <p className="text-gray-500">15 minutes ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900">Report generated</p>
                      <p className="text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ComponentDemo>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Rich Visualizations</h3>
          <p className="text-gray-600 text-sm">Interactive charts, graphs, and data displays with real-time updates and smooth animations.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-xl mb-4">
            <TableIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Advanced Tables</h3>
          <p className="text-gray-600 text-sm">Feature-rich data tables with sorting, filtering, pagination, and advanced grid capabilities.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl mb-4">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Business Intelligence</h3>
          <p className="text-gray-600 text-sm">Executive dashboards, KPI tracking, and comprehensive analytics for data-driven decisions.</p>
        </div>
      </div>
    </div>
  );
};
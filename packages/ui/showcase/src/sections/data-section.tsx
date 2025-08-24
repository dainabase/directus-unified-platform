import React, { useState } from 'react';
import {
  Database,
  BarChart3,
  LineChart,
  Activity,
  TrendingUp,
  Users,
  Package,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Clock,
  Target,
  Grid,
  List
} from 'lucide-react';

export const DataSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Sample data for demonstrations
  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active', lastLogin: '5 minutes ago' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '3 days ago' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active', lastLogin: '1 hour ago' },
  ];

  const statsData = [
    { label: 'Total Revenue', value: '$45,231', change: '+20.1%', trend: 'up' },
    { label: 'Active Users', value: '2,338', change: '+15.3%', trend: 'up' },
    { label: 'Orders', value: '1,234', change: '-5.4%', trend: 'down' },
    { label: 'Conversion', value: '3.2%', change: '+2.1%', trend: 'up' },
  ];

  const chartData = [65, 78, 85, 92, 88, 95, 98, 102, 96, 105, 110, 108];

  return (
    <div className="space-y-12">
      {/* Stats Cards */}
      <div>
        <h3 className="modern-subheading mb-2">Stats Cards</h3>
        <p className="modern-body mb-6">Key metrics and performance indicators</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <div key={index} className="modern-card p-6">
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm text-gray-600">{stat.label}</p>
                {stat.trend === 'up' ? (
                  <ArrowUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="flex items-end justify-between">
                <h4 className="text-2xl font-bold">{stat.value}</h4>
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-gray-700' : 'text-gray-500'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div>
        <h3 className="modern-subheading mb-2">Data Tables</h3>
        <p className="modern-body mb-6">Sortable and interactive data display</p>
        <div className="modern-card p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Users</h4>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Filter size={16} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {row.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {row.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        row.status === 'Active' 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {row.lastLogin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div>
        <h3 className="modern-subheading mb-2">Charts & Graphs</h3>
        <p className="modern-body mb-6">Data visualization components</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="modern-card">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-semibold">Monthly Revenue</h4>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-48 flex items-end justify-between gap-2">
              {chartData.map((value, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gray-200 rounded-t"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart */}
          <div className="modern-card">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-semibold">Growth Trend</h4>
              <LineChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-48 relative">
              <svg className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="#737373"
                  strokeWidth="2"
                  points={chartData.map((v, i) => 
                    `${(i / (chartData.length - 1)) * 100}%,${100 - v}%`
                  ).join(' ')}
                />
                {chartData.map((v, i) => (
                  <circle
                    key={i}
                    cx={`${(i / (chartData.length - 1)) * 100}%`}
                    cy={`${100 - v}%`}
                    r="3"
                    fill="#737373"
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div>
        <h3 className="modern-subheading mb-2">Progress & Loading</h3>
        <p className="modern-body mb-6">Visual feedback for ongoing operations</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="modern-card">
            <h4 className="font-semibold mb-4">Progress Bars</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Upload Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-600 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Processing</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-500 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Complete</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-700 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="modern-card">
            <h4 className="font-semibold mb-4">Activity Timeline</h4>
            <div className="space-y-4">
              {['User login', 'File uploaded', 'Task completed', 'Report generated'].map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity}</p>
                    <p className="text-xs text-gray-500">{i + 1} hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Display */}
      <div>
        <h3 className="modern-subheading mb-2">Metrics & KPIs</h3>
        <p className="modern-body mb-6">Key performance indicators</p>
        <div className="modern-card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="#525252" strokeWidth="8" fill="none"
                    strokeDasharray={`${2 * Math.PI * 36 * 0.75} ${2 * Math.PI * 36}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">75%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Completion</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="#737373" strokeWidth="8" fill="none"
                    strokeDasharray={`${2 * Math.PI * 36 * 0.92} ${2 * Math.PI * 36}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">92%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Efficiency</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="#404040" strokeWidth="8" fill="none"
                    strokeDasharray={`${2 * Math.PI * 36 * 0.68} ${2 * Math.PI * 36}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">68%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Performance</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="#262626" strokeWidth="8" fill="none"
                    strokeDasharray={`${2 * Math.PI * 36 * 0.85} ${2 * Math.PI * 36}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">85%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* List View Toggle */}
      <div>
        <h3 className="modern-subheading mb-2">View Modes</h3>
        <p className="modern-body mb-6">Switch between different data presentations</p>
        <div className="modern-card">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Products</h4>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
          
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {['Product A', 'Product B', 'Product C', 'Product D'].map((product, i) => (
                <div key={i} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">{product}</h5>
                      <p className="text-sm text-gray-600">Description of {product}</p>
                    </div>
                    <span className="text-sm font-medium">${(i + 1) * 99}.00</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {['Product A', 'Product B', 'Product C', 'Product D'].map((product, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="h-24 bg-gray-100 rounded mb-3"></div>
                  <h5 className="font-medium">{product}</h5>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <span className="text-sm font-medium">${(i + 1) * 99}.00</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
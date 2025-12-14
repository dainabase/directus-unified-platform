import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Building,
  CreditCard,
  AlertCircle,
  DollarSign,
  Briefcase,
  BarChart3,
  Target,
  Activity,
  RefreshCw,
  Zap
} from 'lucide-react'

import { GlassCard, Badge } from '../../components/ui'
import { useKPIData, useMultipleCompanyKPIs, useKPIPrefetch } from '../../hooks/useKPIData'

// Import Recharts components from wrapper
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from '../../utils/recharts'

const Dashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  
  // Fetch KPI data with caching
  const { 
    overview, 
    trends, 
    loading, 
    error, 
    isStale, 
    refresh 
  } = useKPIData({
    company: selectedCompany,
    period: selectedPeriod,
    prefetchOnMount: true
  })

  // Prefetch hooks
  const { prefetchCompany } = useKPIPrefetch()

  // Company list
  const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI REALTY', 'TAKEOUT']

  // Prefetch company data on hover
  const handleCompanyHover = (company) => {
    prefetchCompany(company)
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  // Format percentage
  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Loading skeleton
  if (loading && !overview) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <GlassCard className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-4">
            Impossible de charger les données du dashboard
          </p>
          <button
            onClick={() => refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </GlassCard>
      </div>
    )
  }

  const data = overview || {}
  const { financial = {}, projects = {}, people = {}, performance = {}, alerts = [] } = data

  return (
    <div className="p-6 space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard SuperAdmin
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble {selectedCompany || 'toutes entreprises'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Company Filter */}
          <select
            value={selectedCompany || ''}
            onChange={(e) => setSelectedCompany(e.target.value || null)}
            onMouseEnter={(e) => {
              // Prefetch on hover over options
              const options = e.target.options
              for (let i = 0; i < options.length; i++) {
                if (options[i].value) {
                  handleCompanyHover(options[i].value)
                }
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes entreprises</option>
            {companies.map(company => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>

          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
            <option value="90d">90 jours</option>
            <option value="1y">1 année</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => refresh()}
            className={`p-2 rounded-lg border ${
              isStale 
                ? 'border-yellow-300 bg-yellow-50 text-yellow-600' 
                : 'border-gray-300 hover:bg-gray-50'
            } transition-colors`}
            title={isStale ? "Données périmées, cliquez pour actualiser" : "Actualiser"}
          >
            <RefreshCw 
              size={20} 
              className={`${isStale ? 'animate-spin' : ''}`} 
            />
          </button>

          {/* Cache Indicator */}
          {!loading && !isStale && (
            <Badge variant="success" size="sm">
              <Zap size={12} className="mr-1" />
              Cached
            </Badge>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border flex items-center gap-3 ${
                alert.type === 'error' 
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-700'
              }`}
            >
              <AlertCircle size={20} />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            {financial.growth > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(financial.mrr)}
          </p>
          <p className="text-sm text-gray-600">MRR</p>
          <p className={`text-sm mt-1 ${
            financial.growth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(financial.growth)} vs mois dernier
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-8 h-8 text-green-600" />
            <Badge 
              variant={financial.health === 'healthy' ? 'success' : 
                      financial.health === 'warning' ? 'warning' : 'error'}
              size="sm"
            >
              {financial.runway}m
            </Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(financial.balance)}
          </p>
          <p className="text-sm text-gray-600">Cash Balance</p>
          <p className="text-sm text-gray-500 mt-1">
            Burn rate: {formatCurrency(financial.burnRate)}/mois
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-gray-500">
              {Math.round(projects.budgetUtilization)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {projects.active}/{projects.total}
          </p>
          <p className="text-sm text-gray-600">Projets actifs</p>
          {projects.overdue > 0 && (
            <p className="text-sm text-red-600 mt-1">
              {projects.overdue} en retard
            </p>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-indigo-600" />
            <Badge variant="primary" size="sm">
              {people.departments} depts
            </Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {people.active}/{people.total}
          </p>
          <p className="text-sm text-gray-600">Employés actifs</p>
          <p className="text-sm text-gray-500 mt-1">
            Turnover: {people.turnoverRate}%
          </p>
        </GlassCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendances des Revenus
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trends?.revenue || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Performance Metrics */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Métriques de Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">NPS Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                    style={{ width: `${performance.nps}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{performance.nps}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">EBITDA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-400"
                    style={{ width: `${Math.min(performance.ebitda * 2, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{performance.ebitda}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">LTV/CAC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                    style={{ width: `${Math.min(performance.ltvcac * 20, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{performance.ltvcac}x</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Cash Runway</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                    style={{ width: `${Math.min(performance.cashRunway * 8, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{performance.cashRunway} mois</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Health Score */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Score de Santé Global
          </h3>
          <Badge 
            variant={data.summary?.overallHealth >= 80 ? 'success' :
                    data.summary?.overallHealth >= 60 ? 'warning' : 'error'}
          >
            {data.summary?.overallHealth || 0}%
          </Badge>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              data.summary?.overallHealth >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
              data.summary?.overallHealth >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
              'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${data.summary?.overallHealth || 0}%` }}
          />
        </div>
      </GlassCard>
    </div>
  )
}

export default Dashboard
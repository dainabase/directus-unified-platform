import React from 'react'
import {
  UserPlus, Users, Target, TrendingUp, DollarSign, Star, CheckCircle, XCircle, Loader2
} from 'lucide-react'
import { Badge } from '../../../../components/ui'

const LeadStats = ({ stats, isLoading }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  const statCards = [
    {
      label: 'Total Leads',
      value: stats?.total ?? 0,
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Nouveaux',
      value: stats?.new ?? 0,
      icon: UserPlus,
      color: 'cyan'
    },
    {
      label: 'Qualifiés',
      value: stats?.qualified ?? 0,
      icon: Target,
      color: 'blue'
    },
    {
      label: 'Conversion',
      value: `${stats?.conversionRate ?? 0}%`,
      icon: TrendingUp,
      color: 'emerald'
    },
    {
      label: 'Deal Moyen',
      value: formatCurrency(stats?.avgDealSize),
      icon: DollarSign,
      color: 'yellow'
    },
    {
      label: 'Score Moyen',
      value: stats?.avgScore ?? 0,
      icon: Star,
      color: 'amber'
    },
    {
      label: 'Gagnés',
      value: stats?.won ?? 0,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Perdus',
      value: stats?.lost ?? 0,
      icon: XCircle,
      color: 'red'
    }
  ]

  const colorStyles = {
    blue: { background: 'rgba(0,113,227,0.08)', color: 'var(--accent)' },
    cyan: { background: 'rgba(0,113,227,0.08)', color: 'var(--accent)' },
    green: { background: 'rgba(52,199,89,0.08)', color: 'var(--success)' },
    emerald: { background: 'rgba(52,199,89,0.08)', color: 'var(--success)' },
    yellow: { background: 'rgba(255,149,0,0.08)', color: 'var(--warning)' },
    amber: { background: 'rgba(255,149,0,0.08)', color: 'var(--warning)' },
    red: { background: 'rgba(255,59,48,0.08)', color: 'var(--danger)' }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {statCards.map((_, index) => (
          <div key={index} className="ds-card p-4 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-gray-200 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="ds-card p-4 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={colorStyles[stat.color]}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        )
      })}
    </div>
  )
}

export default LeadStats

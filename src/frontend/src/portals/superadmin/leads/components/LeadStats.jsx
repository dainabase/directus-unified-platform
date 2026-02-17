import React from 'react'
import {
  UserPlus, Users, Target, TrendingUp, DollarSign, Star, CheckCircle, XCircle, Loader2
} from 'lucide-react'
import { GlassCard, Badge } from '../../../../components/ui'

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
      color: 'purple'
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
      color: 'orange'
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

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {statCards.map((_, index) => (
          <GlassCard key={index} className="p-4 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-gray-200 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </GlassCard>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <GlassCard key={index} className="p-4 hover:shadow-lg transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[stat.color]}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </GlassCard>
        )
      })}
    </div>
  )
}

export default LeadStats

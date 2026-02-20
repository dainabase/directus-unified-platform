import React from 'react'
import { 
  TrendingUp,
  Target,
  Award,
  AlertCircle,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react'
import { Card, Badge, Button, Table } from '../../../components/ui'

const PerformanceView = ({ people }) => {
  // Mock performance data
  const performanceData = people.map(person => ({
    ...person,
    objectives: Math.floor(Math.random() * 5) + 3,
    completedObjectives: Math.floor(Math.random() * 5),
    performanceScore: Math.random() * 5,
    lastReview: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
    nextReview: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000), // Next 90 days
    trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down'
  }))

  // Performance distribution
  const performanceDistribution = {
    excellent: performanceData.filter(p => p.performanceScore >= 4.5).length,
    good: performanceData.filter(p => p.performanceScore >= 3.5 && p.performanceScore < 4.5).length,
    satisfactory: performanceData.filter(p => p.performanceScore >= 2.5 && p.performanceScore < 3.5).length,
    needsImprovement: performanceData.filter(p => p.performanceScore < 2.5).length
  }

  // Upcoming reviews
  const upcomingReviews = performanceData
    .filter(p => p.nextReview > new Date())
    .sort((a, b) => a.nextReview - b.nextReview)
    .slice(0, 5)

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-CH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getPerformanceColor = (score) => {
    if (score >= 4.5) return 'success'
    if (score >= 3.5) return 'primary'
    if (score >= 2.5) return 'warning'
    return 'error'
  }

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp size={14} style={{color:'var(--success)'}} />
    if (trend === 'down') return <TrendingUp size={14} className="rotate-180" style={{color:'var(--danger)'}} />
    return <div className="w-3.5 h-0.5 bg-gray-400" />
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8" style={{color:'var(--success)'}} />
            <Badge variant="success" size="sm">Excellent</Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {performanceDistribution.excellent}
          </p>
          <p className="text-sm text-gray-600">Score ≥ 4.5</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8" style={{color:'var(--accent)'}} />
            <Badge variant="primary" size="sm">Bon</Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {performanceDistribution.good}
          </p>
          <p className="text-sm text-gray-600">Score 3.5-4.5</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8" style={{color:'var(--warning)'}} />
            <Badge variant="warning" size="sm">Satisfaisant</Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {performanceDistribution.satisfactory}
          </p>
          <p className="text-sm text-gray-600">Score 2.5-3.5</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8" style={{color:'var(--danger)'}} />
            <Badge variant="error" size="sm">À améliorer</Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {performanceDistribution.needsImprovement}
          </p>
          <p className="text-sm text-gray-600">Score &lt; 2.5</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Rankings */}
        <div className="lg:col-span-2">
          <Card className="p-0">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Évaluations de Performance
              </h2>
            </div>
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Employé</Table.Header>
                  <Table.Header align="center">Score</Table.Header>
                  <Table.Header align="center">Objectifs</Table.Header>
                  <Table.Header align="center">Tendance</Table.Header>
                  <Table.Header>Dernière Éval.</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {performanceData
                  .sort((a, b) => b.performanceScore - a.performanceScore)
                  .slice(0, 10)
                  .map((employee) => (
                    <Table.Row key={employee.id}>
                      <Table.Cell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {employee.role} • {employee.employee_company}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell align="center">
                        <div className="flex flex-col items-center">
                          <Badge 
                            variant={getPerformanceColor(employee.performanceScore)} 
                            size="sm"
                          >
                            {employee.performanceScore.toFixed(1)}/5
                          </Badge>
                          <div className="flex gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className={`w-2 h-2 rounded-full ${
                                  star <= Math.round(employee.performanceScore)
                                    ? 'bg-yellow-400'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell align="center">
                        <div className="text-center">
                          <p className="font-medium">
                            {employee.completedObjectives}/{employee.objectives}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Math.round((employee.completedObjectives / employee.objectives) * 100)}%
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell align="center">
                        {getTrendIcon(employee.trend)}
                      </Table.Cell>
                      <Table.Cell>
                        <p className="text-sm text-gray-700">
                          {formatDate(employee.lastReview)}
                        </p>
                      </Table.Cell>
                      <Table.Cell>
                        <Button variant="ghost" size="sm">
                          Voir détails
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Reviews */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Prochaines Évaluations
              </h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingReviews.map((employee) => {
                const daysUntil = Math.ceil((employee.nextReview - new Date()) / (1000 * 60 * 60 * 24))
                return (
                  <div 
                    key={employee.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {employee.role}
                        </p>
                      </div>
                      <Badge 
                        variant={daysUntil <= 7 ? 'error' : daysUntil <= 30 ? 'warning' : 'default'} 
                        size="sm"
                      >
                        {daysUntil}j
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(employee.nextReview)}
                    </p>
                  </div>
                )
              })}
            </div>
            <Button variant="secondary" fullWidth className="mt-4">
              Voir toutes les évaluations
            </Button>
          </Card>

          {/* Performance Insights */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Insights Performance
              </h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{background:'var(--success-light)'}}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" style={{color:'var(--success)'}} />
                  <span className="text-sm font-medium" style={{color:'var(--success)'}}>
                    Progression globale
                  </span>
                </div>
                <p className="text-xs" style={{color:'var(--success)'}}>
                  +12% vs trimestre précédent
                </p>
              </div>

              <div className="p-3 rounded-lg" style={{background:'var(--accent-light)'}}>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4" style={{color:'var(--accent)'}} />
                  <span className="text-sm font-medium" style={{color:'var(--accent)'}}>
                    Objectifs atteints
                  </span>
                </div>
                <p className="text-xs" style={{color:'var(--accent)'}}>
                  78% des objectifs Q4 complétés
                </p>
              </div>

              <div className="p-3 rounded-lg" style={{background:'var(--warning-light)'}}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4" style={{color:'var(--warning)'}} />
                  <span className="text-sm font-medium" style={{color:'var(--warning)'}}>
                    Attention requise
                  </span>
                </div>
                <p className="text-xs" style={{color:'var(--warning)'}}>
                  {performanceDistribution.needsImprovement} employés nécessitent un suivi
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PerformanceView
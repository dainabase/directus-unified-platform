import React from 'react'
import { 
  UserPlus,
  FileText,
  Calendar,
  Clock,
  Send,
  Users,
  Briefcase,
  TrendingUp,
  Target
} from 'lucide-react'
import { GlassCard, Badge, Button, Table } from '../../../components/ui'

const RecruitmentView = () => {
  // Mock recruitment data
  const openPositions = [
    {
      id: 1,
      title: 'Senior React Developer',
      department: 'Tech',
      company: 'DAINAMICS',
      location: 'Genève',
      type: 'CDI',
      posted: '2024-01-15',
      applications: 23,
      interviews: 5,
      status: 'active'
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      department: 'Design',
      company: 'HYPERVISUAL',
      location: 'Lausanne',
      type: 'CDI',
      posted: '2024-01-10',
      applications: 18,
      interviews: 3,
      status: 'active'
    },
    {
      id: 3,
      title: 'Legal Advisor',
      department: 'Legal',
      company: 'LEXAIA',
      location: 'Zurich',
      type: 'CDI',
      posted: '2024-01-05',
      applications: 12,
      interviews: 2,
      status: 'active'
    }
  ]

  const candidates = [
    {
      id: 1,
      name: 'Marie Dubois',
      position: 'Senior React Developer',
      status: 'interview_scheduled',
      rating: 4.5,
      experience: '8 ans',
      stage: 'Entretien technique',
      nextStep: '2024-01-25'
    },
    {
      id: 2,
      name: 'Thomas Bernard',
      position: 'UX/UI Designer',
      status: 'screening',
      rating: 4.0,
      experience: '5 ans',
      stage: 'Screening CV',
      nextStep: '2024-01-24'
    },
    {
      id: 3,
      name: 'Sophie Martin',
      position: 'Legal Advisor',
      status: 'offer_sent',
      rating: 4.8,
      experience: '10 ans',
      stage: 'Offre envoyée',
      nextStep: '2024-01-23'
    }
  ]

  const recruitmentStats = {
    totalPositions: openPositions.length,
    totalApplications: openPositions.reduce((sum, p) => sum + p.applications, 0),
    averageTimeToHire: 28,
    offerAcceptanceRate: 85
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 7) return `${diffDays} jours`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semaines`
    return date.toLocaleDateString('fr-CH')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'screening': return 'default'
      case 'interview_scheduled': return 'primary'
      case 'offer_sent': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'screening': return 'Screening'
      case 'interview_scheduled': return 'Entretien prévu'
      case 'offer_sent': return 'Offre envoyée'
      case 'rejected': return 'Rejeté'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {recruitmentStats.totalPositions}
          </p>
          <p className="text-sm text-gray-600">Postes ouverts</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {recruitmentStats.totalApplications}
          </p>
          <p className="text-sm text-gray-600">Candidatures reçues</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {recruitmentStats.averageTimeToHire}j
          </p>
          <p className="text-sm text-gray-600">Temps moyen d'embauche</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {recruitmentStats.offerAcceptanceRate}%
          </p>
          <p className="text-sm text-gray-600">Taux d'acceptation</p>
        </GlassCard>
      </div>

      {/* Open Positions */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Postes Ouverts
          </h2>
          <Button variant="primary" leftIcon={<UserPlus size={18} />}>
            Nouveau Poste
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {openPositions.map((position) => (
            <GlassCard key={position.id} hoverable className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {position.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {position.company} • {position.department}
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  {position.type}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Publié il y a {formatDate(position.posted)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  <span>{position.applications} candidatures</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>{position.interviews} entretiens prévus</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  Voir candidats
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  Modifier
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </GlassCard>

      {/* Candidate Pipeline */}
      <GlassCard className="p-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Pipeline de Candidats
            </h2>
            <div className="flex gap-2">
              <Badge variant="default">Screening: 8</Badge>
              <Badge variant="primary">Entretiens: 5</Badge>
              <Badge variant="success">Offres: 2</Badge>
            </div>
          </div>
        </div>

        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Header>Candidat</Table.Header>
              <Table.Header>Poste</Table.Header>
              <Table.Header align="center">Évaluation</Table.Header>
              <Table.Header>Étape actuelle</Table.Header>
              <Table.Header>Prochaine action</Table.Header>
              <Table.Header align="center">Actions</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {candidates.map((candidate) => (
              <Table.Row key={candidate.id}>
                <Table.Cell>
                  <div>
                    <p className="font-medium text-gray-900">{candidate.name}</p>
                    <p className="text-sm text-gray-600">{candidate.experience}</p>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <p className="text-sm text-gray-700">{candidate.position}</p>
                </Table.Cell>
                <Table.Cell align="center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-medium">{candidate.rating}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className={`w-3 h-3 ${
                            star <= Math.round(candidate.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </div>
                      ))}
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant={getStatusColor(candidate.status)} size="sm">
                    {getStatusLabel(candidate.status)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-sm">{formatDate(candidate.nextStep)}</span>
                  </div>
                </Table.Cell>
                <Table.Cell align="center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" className="p-1">
                      <FileText size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Send size={16} />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </GlassCard>

      {/* Recruitment Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Funnel de Recrutement (30 derniers jours)
          </h3>
          <div className="space-y-3">
            {[
              { stage: 'Candidatures reçues', count: 156, percentage: 100 },
              { stage: 'CV sélectionnés', count: 48, percentage: 31 },
              { stage: 'Entretiens téléphoniques', count: 24, percentage: 15 },
              { stage: 'Entretiens techniques', count: 12, percentage: 8 },
              { stage: 'Entretiens finaux', count: 6, percentage: 4 },
              { stage: 'Offres envoyées', count: 3, percentage: 2 },
              { stage: 'Offres acceptées', count: 2, percentage: 1.3 }
            ].map((stage, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{stage.stage}</span>
                  <span className="font-medium">{stage.count}</span>
                </div>
                <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sources de Candidatures
          </h3>
          <div className="space-y-4">
            {[
              { source: 'LinkedIn', count: 45, color: 'bg-blue-500' },
              { source: 'Site carrières', count: 38, color: 'bg-green-500' },
              { source: 'Références internes', count: 28, color: 'bg-purple-500' },
              { source: 'Indeed', count: 23, color: 'bg-yellow-500' },
              { source: 'Universités', count: 15, color: 'bg-pink-500' },
              { source: 'Autres', count: 7, color: 'bg-gray-500' }
            ].map((source) => {
              const percentage = (source.count / 156) * 100
              return (
                <div key={source.source} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${source.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{source.source}</span>
                      <span className="font-medium">{source.count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${source.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default RecruitmentView
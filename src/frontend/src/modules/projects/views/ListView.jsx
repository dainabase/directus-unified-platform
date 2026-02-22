import React from 'react'
import { 
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  MoreVertical,
  ExternalLink
} from 'lucide-react'
import { Card, Table, Badge, Button } from '../../../components/ui'

const ListView = ({ projects }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'primary'
      case 'completed': return 'success'
      case 'on_hold': return 'warning'
      case 'pending': return 'default'
      default: return 'default'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card className="p-0 overflow-hidden">
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Header>Projet</Table.Header>
            <Table.Header>Client</Table.Header>
            <Table.Header>Statut</Table.Header>
            <Table.Header>Priorité</Table.Header>
            <Table.Header align="center">Progression</Table.Header>
            <Table.Header>Échéance</Table.Header>
            <Table.Header align="right">Budget</Table.Header>
            <Table.Header align="right">Dépensé</Table.Header>
            <Table.Header align="center">Actions</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {projects.map((project) => {
            const progress = project.completion_percentage || 0
            const budgetUtilization = project.budget > 0 
              ? ((project.spent_amount || 0) / project.budget) * 100 
              : 0

            return (
              <Table.Row key={project.id}>
                <Table.Cell>
                  <div>
                    <p className="font-medium text-gray-900">
                      {project.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {project.owner_company}
                    </p>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <p className="text-sm text-gray-700">
                    {project.client_name || 'N/A'}
                  </p>
                </Table.Cell>
                <Table.Cell>
                  <Badge 
                    variant={getStatusColor(project.status)} 
                    size="sm"
                  >
                    {project.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge 
                    variant={getPriorityColor(project.priority)} 
                    size="sm"
                  >
                    {project.priority}
                  </Badge>
                </Table.Cell>
                <Table.Cell align="center">
                  <div className="w-full max-w-[100px]">
                    <div className="text-xs text-gray-600 mb-1">
                      {progress}%
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-300"
                        style={{background:'var(--accent)'}}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    <span
                      className="text-sm"
                      style={new Date(project.end_date) < new Date() && project.status !== 'completed'
                        ? {color:'var(--semantic-red)', fontWeight:500}
                        : {color:'var(--label-1)'}}
                    >
                      {formatDate(project.end_date)}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell align="right">
                  <p className="text-sm font-medium">
                    {formatCurrency(project.budget)}
                  </p>
                </Table.Cell>
                <Table.Cell align="right">
                  <div className="text-right">
                    <p
                      className="text-sm font-medium"
                      style={budgetUtilization > 90 ? {color:'var(--semantic-red)'} :
                        budgetUtilization > 75 ? {color:'var(--semantic-orange)'} :
                        {color:'var(--label-1)'}}
                    >
                      {formatCurrency(project.spent_amount || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {budgetUtilization.toFixed(0)}% utilisé
                    </p>
                  </div>
                </Table.Cell>
                <Table.Cell align="center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" className="p-1">
                      <ExternalLink size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </Card>
  )
}

export default ListView
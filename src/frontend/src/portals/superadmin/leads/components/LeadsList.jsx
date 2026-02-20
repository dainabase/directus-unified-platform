import React from 'react'
import {
  Phone, Mail, Building, Clock, Star, MoreVertical, Edit, Trash2, Eye
} from 'lucide-react'
import { Badge, Table } from '../../../../components/ui'

const LeadsList = ({ leads, onEdit, onDelete }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: 'Nouveau', variant: 'default' },
      contacted: { label: 'Contacté', variant: 'info' },
      qualified: { label: 'Qualifié', variant: 'primary' },
      proposal: { label: 'Proposition', variant: 'warning' },
      negotiation: { label: 'Négociation', variant: 'warning' },
      won: { label: 'Gagné', variant: 'success' },
      lost: { label: 'Perdu', variant: 'error' },
      inactive: { label: 'Inactif', variant: 'default' }
    }
    const config = statusConfig[status] || { label: status, variant: 'default' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const sourceLabels = {
    web: 'Site Web',
    linkedin: 'LinkedIn',
    referral: 'Recommandation',
    email: 'Email',
    phone: 'Téléphone',
    whatsapp: 'WhatsApp',
    google_ads: 'Google Ads',
    facebook: 'Facebook'
  }

  const columns = [
    {
      key: 'name',
      label: 'Contact',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">
            {row.first_name} {row.last_name}
          </p>
          {row.company_name && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Building size={12} />
              {row.company_name}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (row) => (
        <div className="space-y-1">
          {row.email && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Mail size={12} />
              {row.email}
            </p>
          )}
          {row.phone && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Phone size={12} />
              {row.phone}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'source',
      label: 'Source',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {sourceLabels[row.source] || row.source}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'score',
      label: 'Score',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(row.score)}`}>
          {row.score}
        </span>
      )
    },
    {
      key: 'value',
      label: 'Valeur',
      render: (row) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.estimated_value)}
        </span>
      )
    },
    {
      key: 'assigned',
      label: 'Assigné',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.assigned_to || '-'}
        </span>
      )
    },
    {
      key: 'followup',
      label: 'Prochain RDV',
      render: (row) => (
        <span className={`text-sm ${row.next_followup_at ? 'text-amber-600' : 'text-gray-400'}`}>
          {formatDate(row.next_followup_at)}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(row); }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Modifier"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Supprimer ce lead ?')) onDelete(row.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="ds-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map(lead => (
              <tr
                key={lead.id}
                onClick={() => onEdit(lead)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-4">
                    {col.render(lead)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {leads.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Aucun lead trouvé
          </div>
        )}
      </div>
    </div>
  )
}

export default LeadsList

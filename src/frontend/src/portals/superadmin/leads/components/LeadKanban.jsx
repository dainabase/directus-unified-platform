import React from 'react'
import {
  Phone, Mail, Building, Clock, Star, MoreVertical, User, Calendar
} from 'lucide-react'
import { Badge } from '../../../../components/ui'

const LeadKanban = ({ leads, onEdit, onDelete, onStatusChange }) => {
  const columns = [
    { id: 'new', label: 'Nouveau', color: 'bg-gray-500' },
    { id: 'contacted', label: 'Contacté', color: 'bg-blue-500' },
    { id: 'qualified', label: 'Qualifié', color: 'bg-blue-500' },
    { id: 'proposal', label: 'Proposition', color: 'bg-yellow-500' },
    { id: 'negotiation', label: 'Négociation', color: 'bg-amber-500' },
    { id: 'won', label: 'Gagné', color: 'bg-green-500' },
    { id: 'lost', label: 'Perdu', color: 'bg-red-500' }
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: 'short'
    })
  }

  const getLeadsByStatus = (status) => {
    return leads.filter(lead => lead.status === status)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700'
    if (score >= 50) return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-700'
  }

  const sourceIcons = {
    web: '🌐',
    linkedin: '💼',
    referral: '👥',
    email: '📧',
    phone: '📞',
    whatsapp: '💬',
    google_ads: '📊',
    facebook: '📘'
  }

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, newStatus) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    onStatusChange(leadId, newStatus)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(column => {
        const columnLeads = getLeadsByStatus(column.id)
        const totalValue = columnLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0)

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-gray-900">{column.label}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {columnLeads.length}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatCurrency(totalValue)}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {columnLeads.map(lead => (
                <div
                  key={lead.id}
                  className="ds-card p-4 cursor-pointer hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => onEdit(lead)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {lead.first_name} {lead.last_name}
                      </h4>
                      {lead.company_name && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Building size={14} />
                          {lead.company_name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                      <span className="text-lg" title={lead.source}>
                        {sourceIcons[lead.source] || '📋'}
                      </span>
                    </div>
                  </div>

                  {/* Value */}
                  {lead.estimated_value > 0 && (
                    <div className="text-lg font-bold text-blue-600 mb-3">
                      {formatCurrency(lead.estimated_value)}
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-1 mb-3">
                    {lead.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail size={12} />
                        {lead.email}
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone size={12} />
                        {lead.phone}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {lead.tags && lead.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {lead.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {lead.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{lead.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    {lead.assigned_to && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User size={12} />
                        {lead.assigned_to.split(' ')[0]}
                      </div>
                    )}
                    {lead.next_followup_at && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Calendar size={12} />
                        {formatDate(lead.next_followup_at)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {columnLeads.length === 0 && (
                <div className="p-4 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  Aucun lead
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default LeadKanban

/**
 * DocumentsClient — Unified documents view for client portal
 *
 * 4 horizontal tabs: Devis | Contrats | Factures | Autres
 * Each tab queries Directus collections filtered by the authenticated client.
 *
 * @date 2026-02-20
 */

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  FileText, FileSignature, Receipt, FolderOpen,
  Download, PenTool, CreditCard, Loader2, File,
  FileSpreadsheet, FileImage, FileArchive
} from 'lucide-react'
import api from '../../../lib/axios'
import { useClientAuth } from '../hooks/useClientAuth'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'

// ── Helpers ──

const formatCHF = (value, currency = 'CHF') =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency }).format(value || 0)

const formatDate = (d) => {
  if (!d) return '\u2014'
  return new Date(d).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatFileSize = (bytes) => {
  if (!bytes) return '\u2014'
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

const getFileIcon = (type) => {
  if (!type) return File
  if (type.includes('pdf')) return FileText
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return FileSpreadsheet
  if (type.includes('image')) return FileImage
  if (type.includes('zip') || type.includes('archive')) return FileArchive
  return File
}

// ── Tab definitions ──

const TABS = [
  { key: 'devis', label: 'Devis', icon: FileText },
  { key: 'contrats', label: 'Contrats', icon: FileSignature },
  { key: 'factures', label: 'Factures', icon: Receipt },
  { key: 'autres', label: 'Autres', icon: FolderOpen }
]

// ── Fetch functions ──

async function fetchQuotes(contactId) {
  const { data } = await api.get('/items/quotes', {
    params: {
      filter: {
        contact_id: { _eq: contactId },
        status: { _neq: 'draft' }
      },
      fields: [
        'id', 'quote_number', 'name', 'description', 'status',
        'subtotal', 'total', 'tax_rate', 'tax_amount',
        'valid_until', 'signed_at', 'currency', 'date_created'
      ],
      sort: ['-date_created'],
      limit: 100
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function fetchContracts(companyId) {
  const { data } = await api.get('/items/contracts', {
    params: {
      filter: { company_id: { _eq: companyId } },
      fields: [
        'id', 'contract_number', 'title', 'status',
        'value', 'company_id', 'created_at', 'updated_at'
      ],
      sort: ['-created_at'],
      limit: 100
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function fetchInvoices(contactId) {
  const { data } = await api.get('/items/client_invoices', {
    params: {
      filter: { contact_id: { _eq: contactId } },
      fields: [
        'id', 'invoice_number', 'amount', 'total', 'status',
        'due_date', 'date_created', 'tax_rate', 'tax_amount', 'currency'
      ],
      sort: ['-date_created'],
      limit: 100
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function fetchFiles() {
  const { data } = await api.get('/files', {
    params: {
      fields: ['id', 'title', 'filename_download', 'type', 'filesize', 'uploaded_on'],
      sort: ['-uploaded_on'],
      limit: 50
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

// ── Sub-components ──

const TabButton = ({ tab, isActive, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
    style={{
      background: isActive ? 'rgba(0,113,227,0.10)' : 'transparent',
      color: isActive ? '#0071E3' : 'var(--text-secondary, #6E6E73)'
    }}
  >
    <tab.icon size={16} />
    {tab.label}
  </button>
)

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#0071E3' }} />
  </div>
)

const TableContainer = ({ children }) => (
  <div className="ds-card overflow-hidden">
    <div className="overflow-x-auto">
      {children}
    </div>
  </div>
)

// ── Tab: Devis ──

const TabDevis = ({ contactId }) => {
  const navigate = useNavigate()

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['client-documents-quotes', contactId],
    queryFn: () => fetchQuotes(contactId),
    enabled: !!contactId,
    staleTime: 30_000
  })

  if (isLoading) return <LoadingSpinner />

  if (quotes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Aucun devis"
        subtitle="Vos devis apparaitront ici une fois envoyes par votre gestionnaire."
      />
    )
  }

  return (
    <TableContainer>
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-xs uppercase tracking-wide"
            style={{ color: 'var(--text-tertiary, #AEAEB2)', borderBottom: '1px solid var(--border-light, #E5E5EA)' }}
          >
            <th className="text-left px-5 py-3 font-medium">Numero</th>
            <th className="text-left px-5 py-3 font-medium">Date</th>
            <th className="text-right px-5 py-3 font-medium">Montant HT</th>
            <th className="text-right px-5 py-3 font-medium">Total TTC</th>
            <th className="text-left px-5 py-3 font-medium">Statut</th>
            <th className="text-right px-5 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--border-light, #F5F5F7)' }}>
          {quotes.map((q) => (
            <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3">
                <p className="font-medium" style={{ color: 'var(--text-primary, #1D1D1F)' }}>
                  {q.quote_number || '\u2014'}
                </p>
                {q.name && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary, #AEAEB2)' }}>
                    {q.name}
                  </p>
                )}
              </td>
              <td className="px-5 py-3" style={{ color: 'var(--text-secondary, #6E6E73)' }}>
                {formatDate(q.date_created)}
              </td>
              <td className="px-5 py-3 text-right" style={{ color: 'var(--text-secondary, #6E6E73)' }}>
                {formatCHF(q.subtotal, q.currency || 'CHF')}
              </td>
              <td className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-primary, #1D1D1F)' }}>
                {formatCHF(q.total, q.currency || 'CHF')}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={q.status} />
              </td>
              <td className="px-5 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {(q.status === 'sent' || q.status === 'viewed') && (
                    <button
                      onClick={() => navigate(`/client/quotes?sign=${q.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors"
                      style={{ background: '#0071E3' }}
                    >
                      <PenTool size={12} />
                      Signer
                    </button>
                  )}
                  <button
                    onClick={() => {
                      window.open(`/assets/${q.id}`, '_blank')
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                    style={{
                      background: 'var(--bg-secondary, #F5F5F7)',
                      color: 'var(--text-secondary, #6E6E73)'
                    }}
                  >
                    <Download size={12} />
                    PDF
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  )
}

// ── Tab: Contrats ──

const TabContrats = ({ companyId }) => {
  const { data: contracts = [], isLoading, isError } = useQuery({
    queryKey: ['client-documents-contracts', companyId],
    queryFn: () => fetchContracts(companyId),
    enabled: !!companyId,
    staleTime: 30_000,
    retry: 1
  })

  if (isLoading) return <LoadingSpinner />

  if (isError || contracts.length === 0) {
    return (
      <EmptyState
        icon={FileSignature}
        title="Aucun contrat"
        subtitle="Vos contrats seront disponibles ici une fois generes."
      />
    )
  }

  return (
    <TableContainer>
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-xs uppercase tracking-wide"
            style={{ color: 'var(--text-tertiary, #AEAEB2)', borderBottom: '1px solid var(--border-light, #E5E5EA)' }}
          >
            <th className="text-left px-5 py-3 font-medium">Numero</th>
            <th className="text-left px-5 py-3 font-medium">Titre</th>
            <th className="text-left px-5 py-3 font-medium">Statut</th>
            <th className="text-right px-5 py-3 font-medium">Valeur CHF</th>
            <th className="text-left px-5 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--border-light, #F5F5F7)' }}>
          {contracts.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary, #1D1D1F)' }}>
                {c.contract_number || '\u2014'}
              </td>
              <td className="px-5 py-3" style={{ color: 'var(--text-secondary, #6E6E73)' }}>
                {c.title || '\u2014'}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={c.status} />
              </td>
              <td className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-primary, #1D1D1F)' }}>
                {c.value != null ? formatCHF(c.value) : '\u2014'}
              </td>
              <td className="px-5 py-3" style={{ color: 'var(--text-secondary, #6E6E73)' }}>
                {formatDate(c.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  )
}

// ── Tab: Factures ──

const TabFactures = ({ contactId }) => {
  const navigate = useNavigate()

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['client-documents-invoices', contactId],
    queryFn: () => fetchInvoices(contactId),
    enabled: !!contactId,
    staleTime: 30_000
  })

  if (isLoading) return <LoadingSpinner />

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Aucune facture"
        subtitle="Vos factures apparaitront ici une fois emises."
      />
    )
  }

  return (
    <TableContainer>
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-xs uppercase tracking-wide"
            style={{ color: 'var(--text-tertiary, #AEAEB2)', borderBottom: '1px solid var(--border-light, #E5E5EA)' }}
          >
            <th className="text-left px-5 py-3 font-medium">Numero</th>
            <th className="text-left px-5 py-3 font-medium">Date</th>
            <th className="text-left px-5 py-3 font-medium">Echeance</th>
            <th className="text-right px-5 py-3 font-medium">Montant CHF</th>
            <th className="text-left px-5 py-3 font-medium">Statut</th>
            <th className="text-right px-5 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--border-light, #F5F5F7)' }}>
          {invoices.map((inv) => {
            const isOverdue = inv.status === 'overdue' ||
              (inv.due_date && inv.status === 'sent' && new Date(inv.due_date) < new Date())

            return (
              <tr
                key={inv.id}
                className="hover:bg-gray-50/50 transition-colors"
                style={isOverdue ? { background: 'rgba(255,59,48,0.04)' } : undefined}
              >
                <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary, #1D1D1F)' }}>
                  {inv.invoice_number || '\u2014'}
                </td>
                <td className="px-5 py-3" style={{ color: 'var(--text-secondary, #6E6E73)' }}>
                  {formatDate(inv.date_created)}
                </td>
                <td className="px-5 py-3" style={{ color: isOverdue ? '#FF3B30' : 'var(--text-secondary, #6E6E73)' }}>
                  {formatDate(inv.due_date)}
                </td>
                <td className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-primary, #1D1D1F)' }}>
                  {formatCHF(inv.total, inv.currency || 'CHF')}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={isOverdue ? 'overdue' : inv.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {(inv.status === 'sent' || inv.status === 'overdue' || isOverdue) && (
                      <button
                        onClick={() => navigate(`/client/payment/${inv.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors"
                        style={{ background: '#0071E3' }}
                      >
                        <CreditCard size={12} />
                        Payer
                      </button>
                    )}
                    <button
                      onClick={() => {
                        window.open(`/assets/${inv.id}`, '_blank')
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                      style={{
                        background: 'var(--bg-secondary, #F5F5F7)',
                        color: 'var(--text-secondary, #6E6E73)'
                      }}
                    >
                      <Download size={12} />
                      PDF
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </TableContainer>
  )
}

// ── Tab: Autres (fichiers) ──

const TabAutres = () => {
  const { data: files = [], isLoading, isError } = useQuery({
    queryKey: ['client-documents-files'],
    queryFn: fetchFiles,
    staleTime: 60_000,
    retry: 1
  })

  if (isLoading) return <LoadingSpinner />

  if (isError || files.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Aucun document"
        subtitle="Les documents partages apparaitront ici."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => {
        const IconComponent = getFileIcon(file.type)
        return (
          <div key={file.id} className="ds-card p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,113,227,0.08)' }}
            >
              <IconComponent size={20} style={{ color: '#0071E3' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'var(--text-primary, #1D1D1F)' }}
              >
                {file.title || file.filename_download || 'Document'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs" style={{ color: 'var(--text-tertiary, #AEAEB2)' }}>
                  {formatDate(file.uploaded_on)}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary, #AEAEB2)' }}>
                  {formatFileSize(file.filesize)}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                window.open(`/assets/${file.id}?download`, '_blank')
              }}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 flex-shrink-0"
              style={{ color: 'var(--text-secondary, #6E6E73)' }}
              title="Telecharger"
            >
              <Download size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Component ──

const DocumentsClient = () => {
  const { client } = useClientAuth()
  const [activeTab, setActiveTab] = useState('devis')

  const contactId = client?.id
  const companyId = client?.company_id

  const renderTabContent = () => {
    switch (activeTab) {
      case 'devis':
        return <TabDevis contactId={contactId} />
      case 'contrats':
        return <TabContrats companyId={companyId} />
      case 'factures':
        return <TabFactures contactId={contactId} />
      case 'autres':
        return <TabAutres />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--text-primary, #1D1D1F)' }}
        >
          Mes documents
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--text-secondary, #6E6E73)' }}
        >
          Retrouvez tous vos devis, contrats, factures et documents partages.
        </p>
      </div>

      {/* Horizontal pill tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: 'var(--bg-secondary, #F5F5F7)' }}
      >
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </div>

      {/* Tab content */}
      {renderTabContent()}
    </div>
  )
}

export default DocumentsClient

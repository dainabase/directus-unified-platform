/**
 * ClientDashboard — C-02
 * Connected to Directus, filtered by contact_id.
 * Shows: greeting, stat cards, action required section, project timeline.
 */
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  FileText, FolderKanban, Receipt, Calendar,
  AlertTriangle, PenTool, CreditCard, Loader2,
  ChevronRight, CheckCircle
} from 'lucide-react'
import api from '../../lib/axios'
import { useClientAuth } from './hooks/useClientAuth'

const formatCHF = (v) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v || 0)
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const ClientDashboard = () => {
  const { client } = useClientAuth()
  const navigate = useNavigate()
  const contactId = client?.id

  // Fetch quotes for this client
  const { data: quotes = [] } = useQuery({
    queryKey: ['client-quotes', contactId],
    queryFn: async () => {
      const { data } = await api.get('/items/quotes', {
        params: {
          filter: { contact_id: { _eq: contactId }, status: { _nin: ['draft'] } },
          fields: ['id', 'quote_number', 'status', 'total', 'valid_until', 'description', 'signed_at'],
          sort: ['-created_at'],
          limit: 20
        }
      })
      return data?.data || []
    },
    enabled: !!contactId
  })

  // Fetch projects for this client
  const { data: projects = [] } = useQuery({
    queryKey: ['client-projects', contactId],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: {
            _or: [
              { client_id: { _eq: client?.company_id } },
              { company_id: { _eq: client?.company_id } }
            ]
          },
          fields: ['id', 'name', 'status', 'start_date', 'end_date', 'date_created'],
          sort: ['-date_created'],
          limit: 20
        }
      })
      return data?.data || []
    },
    enabled: !!contactId
  })

  // Fetch invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['client-invoices', contactId],
    queryFn: async () => {
      const { data } = await api.get('/items/client_invoices', {
        params: {
          filter: { contact_id: { _eq: contactId } },
          fields: ['id', 'invoice_number', 'amount', 'status', 'date_created'],
          sort: ['-date_created'],
          limit: 20
        }
      })
      return data?.data || []
    },
    enabled: !!contactId
  })

  // Fetch latest project deliverables
  const latestProject = projects.filter(p => ['active', 'in_progress', 'in_preparation'].includes(p.status))[0]
  const { data: deliverables = [] } = useQuery({
    queryKey: ['client-deliverables', latestProject?.id],
    queryFn: async () => {
      const { data } = await api.get('/items/deliverables', {
        params: {
          filter: { project_id: { _eq: latestProject.id } },
          fields: ['id', 'title', 'status', 'due_date'],
          sort: ['due_date']
        }
      })
      return data?.data || []
    },
    enabled: !!latestProject?.id
  })

  // Computed stats
  const pendingQuotes = quotes.filter(q => q.status === 'sent' || q.status === 'viewed')
  const activeProjects = projects.filter(p => !['cancelled', 'completed'].includes(p.status))
  const unpaidInvoices = invoices.filter(i => ['pending', 'overdue'].includes(i.status))
  const totalDue = unpaidInvoices.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0)
  const completedDel = deliverables.filter(d => d.status === 'completed').length
  const totalDel = deliverables.length
  const progressPct = totalDel > 0 ? Math.round((completedDel / totalDel) * 100) : 0

  // Next deadline
  const allDates = [
    ...quotes.filter(q => q.valid_until).map(q => ({ date: q.valid_until, label: `Devis ${q.quote_number}` })),
    ...deliverables.filter(d => d.due_date && d.status !== 'completed').map(d => ({ date: d.due_date, label: d.title }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date))
  const nextDeadline = allDates[0]

  if (!contactId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour {client?.first_name} 👋
        </h1>
        <p className="text-gray-500 mt-1">Bienvenue sur votre espace HYPERVISUAL</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-5 cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => navigate('/client/quotes')}>
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900">{pendingQuotes.length}</span>
          </div>
          <p className="text-sm text-gray-600">Devis à signer</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-5 cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => navigate('/client/projects')}>
          <div className="flex items-center justify-between mb-3">
            <FolderKanban className="w-8 h-8 text-emerald-500" />
            <span className="text-2xl font-bold text-gray-900">{activeProjects.length}</span>
          </div>
          <p className="text-sm text-gray-600">Projets actifs</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-5 cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => navigate('/client/invoices')}>
          <div className="flex items-center justify-between mb-3">
            <Receipt className="w-8 h-8 text-amber-500" />
            <span className="text-2xl font-bold text-gray-900">{formatCHF(totalDue)}</span>
          </div>
          <p className="text-sm text-gray-600">{unpaidInvoices.length} facture(s) à régler</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-purple-500" />
            <span className="text-sm font-medium text-gray-900">{nextDeadline ? formatDate(nextDeadline.date) : '—'}</span>
          </div>
          <p className="text-sm text-gray-600">{nextDeadline ? nextDeadline.label : 'Aucune échéance'}</p>
        </div>
      </div>

      {/* Action Required */}
      {(pendingQuotes.length > 0 || unpaidInvoices.filter(i => i.status === 'overdue').length > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Action requise</h3>
          </div>
          <div className="space-y-2">
            {pendingQuotes.map(q => (
              <div key={q.id} className="flex items-center justify-between bg-white/80 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Devis {q.quote_number} — {formatCHF(q.total)}</p>
                  <p className="text-xs text-gray-500">Valide jusqu'au {formatDate(q.valid_until)}</p>
                </div>
                <button onClick={() => navigate(`/client/quotes?sign=${q.id}`)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700">
                  <PenTool size={14} /> Signer
                </button>
              </div>
            ))}
            {unpaidInvoices.filter(i => i.status === 'overdue').map(inv => (
              <div key={inv.id} className="flex items-center justify-between bg-white/80 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-red-700">Facture {inv.invoice_number} en retard — {formatCHF(inv.amount)}</p>
                </div>
                <button onClick={() => navigate('/client/invoices')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700">
                  <CreditCard size={14} /> Payer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Timeline */}
      {latestProject && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">{latestProject.name}</h3>
              <p className="text-xs text-gray-500">Projet en cours</p>
            </div>
            <button onClick={() => navigate(`/client/projects/${latestProject.id}`)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              Voir détails <ChevronRight size={14} />
            </button>
          </div>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Progression</span>
              <span className="font-medium text-gray-900">{progressPct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          {/* Deliverables */}
          <div className="space-y-2">
            {deliverables.slice(0, 5).map(d => (
              <div key={d.id} className="flex items-center gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  d.status === 'completed' ? 'bg-emerald-500' :
                  d.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
                <span className={d.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'}>
                  {d.title}
                </span>
                {d.due_date && <span className="text-xs text-gray-400 ml-auto">{formatDate(d.due_date)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDashboard

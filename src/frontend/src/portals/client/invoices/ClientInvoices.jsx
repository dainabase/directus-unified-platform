/**
 * ClientInvoices — C-05
 * Client views invoices, prints them, sees outstanding balance.
 */
import React, { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Receipt, Printer, Download, X, Loader2, AlertCircle,
  CheckCircle, Clock, AlertTriangle, MessageSquare
} from 'lucide-react'
import api from '../../../lib/axios'
import { useClientAuth } from '../hooks/useClientAuth'

const formatCHF = (v) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v || 0)
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const STATUS_CONFIG = {
  pending: { label: 'En attente', bg: 'rgba(255,149,0,0.12)', fg: 'var(--semantic-orange)', icon: Clock },
  paid: { label: 'Payée', bg: 'rgba(52,199,89,0.12)', fg: 'var(--semantic-green)', icon: CheckCircle },
  overdue: { label: 'En retard', bg: 'rgba(255,59,48,0.12)', fg: 'var(--semantic-red)', icon: AlertTriangle },
  cancelled: { label: 'Annulée', bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-3)', icon: AlertCircle },
  draft: { label: 'Brouillon', bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-2)', icon: Receipt },
  sent: { label: 'Envoyée', bg: 'rgba(0,113,227,0.10)', fg: 'var(--accent)', icon: Receipt }
}

const ClientInvoices = () => {
  const { client } = useClientAuth()
  const contactId = client?.id
  const navigate = useNavigate()
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const printRef = useRef()

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['client-invoices-list', contactId],
    queryFn: async () => {
      const { data } = await api.get('/items/client_invoices', {
        params: {
          filter: { contact_id: { _eq: contactId } },
          fields: ['id', 'invoice_number', 'client_name', 'amount', 'status', 'date_created', 'owner_company', 'project_id'],
          sort: ['-date_created']
        }
      })
      return data?.data || []
    },
    enabled: !!contactId
  })

  const unpaid = invoices.filter(i => ['pending', 'overdue', 'sent'].includes(i.status))
  const totalOutstanding = unpaid.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const inv = selectedInvoice
    printWindow.document.write(`
      <html><head><title>Facture ${inv.invoice_number}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#333}
      h1{color:#059669;margin-bottom:5px}
      .info{display:flex;justify-content:space-between;margin:20px 0;padding:20px;background:#f9f9f9;border-radius:8px}
      .amount{font-size:32px;font-weight:bold;text-align:center;margin:30px 0;color:#059669}
      .footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:12px;color:#999}
      </style></head><body>
      <h1>Facture ${inv.invoice_number}</h1>
      <p style="color:#666">HYPERVISUAL Switzerland</p>
      <div class="info">
        <div><strong>Client</strong><br/>${inv.client_name || client?.first_name + ' ' + client?.last_name}</div>
        <div><strong>Date</strong><br/>${formatDate(inv.date_created)}</div>
        <div><strong>Statut</strong><br/>${(STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending).label}</div>
      </div>
      <div class="amount">${formatCHF(inv.amount)}</div>
      <div class="footer">
        <p>HYPERVISUAL Switzerland — Fribourg, Suisse</p>
        <p>Document généré le ${formatDate(new Date())}</p>
      </div>
      </body></html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin" style={{color:"var(--accent)"}} /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes factures</h1>
        <p className="text-gray-500 text-sm mt-1">Historique et suivi de vos factures</p>
      </div>

      {/* Outstanding total */}
      {totalOutstanding > 0 && (
        <div className="rounded-xl p-5 flex items-center justify-between" style={{background:"rgba(255,149,0,0.08)", border:"1px solid rgba(255,149,0,0.25)"}}>
          <div>
            <p className="text-sm font-medium" style={{color:"var(--semantic-orange)"}}>Montant total à régler</p>
            <p className="text-xs" style={{color:"var(--semantic-orange)"}}>{unpaid.length} facture(s) en attente</p>
          </div>
          <p className="text-2xl font-bold" style={{color:"var(--semantic-orange)"}}>{formatCHF(totalOutstanding)}</p>
        </div>
      )}

      {/* Invoices list */}
      {invoices.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune facture</p>
        </div>
      ) : (
        <div className="ds-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3">N° Facture</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Montant</th>
                <th className="px-5 py-3 text-center">Statut</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => {
                const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending
                const Icon = cfg.icon
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900">{inv.invoice_number}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(inv.date_created)}</td>
                    <td className="px-5 py-3 text-right font-semibold">{formatCHF(inv.amount)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{background: cfg.bg, color: cfg.fg}}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[var(--accent)]" title="Voir / Imprimer">
                          <Printer size={14} />
                        </button>
                        {inv.status === 'overdue' && (
                          <button onClick={() => navigate('/client/messages')}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[var(--accent)]" title="Contacter HYPERVISUAL">
                            <MessageSquare size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice detail modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" ref={printRef}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Facture {selectedInvoice.invoice_number}</h2>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Client</p>
                  <p className="font-medium text-gray-900">{selectedInvoice.client_name || `${client?.first_name} ${client?.last_name}`}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedInvoice.date_created)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Émetteur</p>
                  <p className="font-medium text-gray-900">{selectedInvoice.owner_company || 'HYPERVISUAL'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Statut</p>
                  <p className="font-medium">{(STATUS_CONFIG[selectedInvoice.status] || STATUS_CONFIG.pending).label}</p>
                </div>
              </div>
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">{formatCHF(selectedInvoice.amount)}</p>
                <p className="text-sm text-gray-500 mt-1">CHF</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-gray-100">
              <button onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-white bg-[var(--accent-hover)] hover:opacity-90">
                <Printer size={16} /> Imprimer
              </button>
              <button onClick={() => setSelectedInvoice(null)}
                className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientInvoices

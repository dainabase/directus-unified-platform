/**
 * ProvidersModule — Phase D-07
 * SuperAdmin gestion prestataires :
 * 1. Liste prestataires
 * 2. Creer demande de devis (POST proposals)
 * 3. Voir offres soumises + accepter/refuser
 * 4. Badge alerte si nouvelle offre
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  Users, Plus, FileText, CheckCircle, XCircle, Send,
  X, Loader2, AlertTriangle, Eye, Clock, Building2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)

// -- Create quote request modal --
const CreateQuoteRequestModal = ({ onClose, providers, selectedCompany }) => {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm()

  // Fetch projects for dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['admin-projects-for-proposal', selectedCompany],
    queryFn: async () => {
      const params = {
        fields: ['id', 'name'],
        sort: ['-date_created'],
        limit: 100
      }
      if (selectedCompany && selectedCompany !== 'all') {
        params.filter = { owner_company: { _eq: selectedCompany } }
      }
      const { data } = await api.get('/items/projects', { params })
      return data?.data || []
    }
  })

  const createMutation = useMutation({
    mutationFn: (formData) =>
      api.post('/items/proposals', {
        name: formData.name,
        description: formData.description,
        mission_description: formData.mission_description,
        provider_id: formData.provider_id,
        project_id: formData.project_id || null,
        status: 'pending',
        owner_company: selectedCompany !== 'all' ? selectedCompany : null
      }),
    onSuccess: () => {
      toast.success('Demande de devis envoyee au prestataire')
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] })
      onClose()
    },
    onError: () => {
      toast.error('Erreur lors de la creation')
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Creer une demande de devis</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="p-6 space-y-4">
          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prestataire <span className="text-red-500">*</span>
            </label>
            <select
              {...register('provider_id', { required: 'Selectionnez un prestataire' })}
              className="w-full pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Selectionner...</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.specialty ? `(${p.specialty})` : ''}</option>
              ))}
            </select>
            {errors.provider_id && <p className="text-xs text-red-600 mt-1">{errors.provider_id.message}</p>}
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projet associe</label>
            <select
              {...register('project_id')}
              className="w-full pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Aucun projet specifique</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre de la demande <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', { required: 'Le titre est obligatoire' })}
              className="w-full pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Installation LED facade..."
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          {/* Mission description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description de la mission <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('mission_description', { required: 'La description est obligatoire' })}
              rows={4}
              className="w-full pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
              placeholder="Decrire en detail ce qui est attendu du prestataire..."
            />
            {errors.mission_description && <p className="text-xs text-red-600 mt-1">{errors.mission_description.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Envoyer la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// -- Main module --
const ProvidersModule = ({ selectedCompany }) => {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('providers') // 'providers' | 'proposals'

  // Fetch providers
  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ['admin-providers', selectedCompany],
    queryFn: async () => {
      const params = {
        fields: ['id', 'name', 'email', 'phone', 'contact_person', 'specialty', 'status', 'date_created'],
        sort: ['name'],
        limit: 100
      }
      if (selectedCompany && selectedCompany !== 'all') {
        params.filter = { owner_company: { _eq: selectedCompany } }
      }
      const { data } = await api.get('/items/providers', { params })
      return data?.data || []
    },
    staleTime: 1000 * 60 * 2
  })

  // Fetch proposals (all status)
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ['admin-proposals', selectedCompany],
    queryFn: async () => {
      const params = {
        fields: ['id', 'name', 'description', 'status', 'amount', 'total_ttc', 'provider_id', 'project_id', 'created_at', 'submitted_at', 'deadline', 'notes'],
        sort: ['-created_at'],
        limit: 100
      }
      if (selectedCompany && selectedCompany !== 'all') {
        params.filter = { owner_company: { _eq: selectedCompany } }
      }
      const { data } = await api.get('/items/proposals', { params })
      return data?.data || []
    },
    staleTime: 1000 * 60 * 2
  })

  // Accept/Reject proposal mutations
  const acceptMutation = useMutation({
    mutationFn: async (proposal) => {
      // Accept proposal
      await api.patch(`/items/proposals/${proposal.id}`, { status: 'accepted' })
      // Set main_provider_id on project if project_id exists
      if (proposal.project_id) {
        await api.patch(`/items/projects/${proposal.project_id}`, {
          main_provider_id: proposal.provider_id
        })
      }
    },
    onSuccess: () => {
      toast.success('Offre acceptee — prestataire assigne au projet')
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] })
    },
    onError: () => toast.error('Erreur lors de l\'acceptation')
  })

  const rejectMutation = useMutation({
    mutationFn: (proposalId) =>
      api.patch(`/items/proposals/${proposalId}`, { status: 'rejected' }),
    onSuccess: () => {
      toast.success('Offre refusee')
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] })
    },
    onError: () => toast.error('Erreur lors du refus')
  })

  const submittedCount = proposals.filter(p => p.status === 'submitted').length
  const providerMap = {}
  providers.forEach(p => { providerMap[p.id] = p })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion prestataires</h1>
          <p className="text-sm text-gray-500 mt-1">
            {providers.length} prestataire{providers.length > 1 ? 's' : ''} — {proposals.length} demande{proposals.length > 1 ? 's' : ''} de devis
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Creer demande de devis
        </button>
      </div>

      {/* Alert: new offers submitted */}
      {submittedCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              {submittedCount} nouvelle{submittedCount > 1 ? 's' : ''} offre{submittedCount > 1 ? 's' : ''} soumise{submittedCount > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">Cliquez sur "Offres" pour les examiner</p>
          </div>
          <button
            onClick={() => setActiveTab('proposals')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 text-white hover:bg-amber-700"
          >
            Voir les offres
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('providers')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'providers' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={16} className="inline mr-1.5" />
          Prestataires ({providers.length})
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors relative ${
            activeTab === 'proposals' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} className="inline mr-1.5" />
          Offres ({proposals.length})
          {submittedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {submittedCount}
            </span>
          )}
        </button>
      </div>

      {/* Providers tab */}
      {activeTab === 'providers' && (
        <div className="glass-card p-6">
          {providersLoading ? (
            <div className="h-48 animate-pulse bg-gray-100 rounded-lg" />
          ) : providers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">Aucun prestataire enregistre</p>
              <p className="text-xs text-gray-400 mt-1">Ajoutez des prestataires dans Directus pour commencer</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 text-xs text-gray-500 font-medium">Nom</th>
                    <th className="text-left py-3 text-xs text-gray-500 font-medium">Contact</th>
                    <th className="text-left py-3 text-xs text-gray-500 font-medium">Email</th>
                    <th className="text-left py-3 text-xs text-gray-500 font-medium">Specialite</th>
                    <th className="text-left py-3 text-xs text-gray-500 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="py-3 text-gray-600">{p.contact_person || '—'}</td>
                      <td className="py-3 text-gray-600">{p.email || '—'}</td>
                      <td className="py-3 text-gray-600">{p.specialty || '—'}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === 'active' ? 'bg-green-100 text-green-700' :
                          p.status === 'suspended' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {p.status === 'active' ? 'Actif' : p.status === 'suspended' ? 'Suspendu' : p.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Proposals tab */}
      {activeTab === 'proposals' && (
        <div className="glass-card p-6">
          {proposalsLoading ? (
            <div className="h-48 animate-pulse bg-gray-100 rounded-lg" />
          ) : proposals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">Aucune demande de devis</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map(p => {
                const prov = providerMap[p.provider_id]
                const isSubmitted = p.status === 'submitted'

                return (
                  <div
                    key={p.id}
                    className={`border rounded-xl p-5 ${
                      isSubmitted ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-900">{p.name}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            p.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                            p.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {p.status === 'pending' ? 'En attente' :
                             p.status === 'submitted' ? 'Offre soumise' :
                             p.status === 'accepted' ? 'Accepte' :
                             p.status === 'rejected' ? 'Refuse' : p.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mb-2">
                          Prestataire : <span className="font-medium text-gray-700">{prov?.name || 'Inconnu'}</span>
                          {p.created_at && ` — ${format(new Date(p.created_at), 'dd.MM.yyyy', { locale: fr })}`}
                        </p>

                        {p.description && (
                          <p className="text-sm text-gray-600 mb-2">{p.description}</p>
                        )}

                        {isSubmitted && p.amount && (
                          <div className="flex gap-4 text-sm mt-2">
                            <span className="text-gray-500">Montant HT : <span className="font-semibold text-gray-900">{formatCHF(p.amount)}</span></span>
                            {p.total_ttc && <span className="text-gray-500">TTC : <span className="font-medium">{formatCHF(p.total_ttc)}</span></span>}
                            {p.deadline && <span className="text-gray-500">Delai : {format(new Date(p.deadline), 'dd.MM.yyyy', { locale: fr })}</span>}
                          </div>
                        )}

                        {isSubmitted && p.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic">Notes : {p.notes}</p>
                        )}
                      </div>

                      {/* Actions */}
                      {isSubmitted && (
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          <button
                            onClick={() => acceptMutation.mutate(p)}
                            disabled={acceptMutation.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            Accepter
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Refuser cette offre ?')) rejectMutation.mutate(p.id)
                            }}
                            disabled={rejectMutation.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Create quote request modal */}
      {showCreate && (
        <CreateQuoteRequestModal
          onClose={() => setShowCreate(false)}
          providers={providers}
          selectedCompany={selectedCompany}
        />
      )}
    </div>
  )
}

export default ProvidersModule

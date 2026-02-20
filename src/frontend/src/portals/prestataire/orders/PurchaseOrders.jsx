/**
 * PurchaseOrders — Phase D-04
 * Bons de commande pour le prestataire.
 * Affiche les projets actifs ou le prestataire est main_provider_id.
 * Bouton "Confirmer reception BC".
 */

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package, CheckCircle, Clock, Calendar, Building2, Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useProviderAuth } from '../hooks/useProviderAuth'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

const PurchaseOrders = () => {
  const { provider } = useProviderAuth()
  const providerId = provider?.id
  const queryClient = useQueryClient()

  // Fetch projects where this provider is the main_provider
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['provider-purchase-orders', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: {
            main_provider_id: { _eq: providerId },
            status: { _in: ['active', 'in_progress', 'in-progress', 'completed'] }
          },
          fields: ['id', 'name', 'description', 'status', 'start_date', 'end_date', 'budget', 'owner_company', 'date_created'],
          sort: ['-date_created'],
          limit: 50
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Fetch orders that exist for these projects (if any)
  const projectIds = projects.map(p => p.id)
  const { data: orders = [] } = useQuery({
    queryKey: ['provider-orders', providerId, projectIds],
    queryFn: async () => {
      if (projectIds.length === 0) return []
      const { data } = await api.get('/items/orders', {
        params: {
          filter: { provider_id: { _eq: providerId } },
          fields: ['id', 'name', 'project_id', 'amount', 'status', 'confirmed_at', 'order_number'],
          limit: 100
        }
      })
      return data?.data || []
    },
    enabled: !!providerId && projectIds.length > 0,
    staleTime: 1000 * 60 * 2
  })

  // Confirm order reception
  const confirmMutation = useMutation({
    mutationFn: async (projectId) => {
      // Check if order exists for this project
      const existingOrder = orders.find(o => o.project_id === projectId)
      if (existingOrder) {
        return api.patch(`/items/orders/${existingOrder.id}`, {
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
      }
      // Create an order record if none exists
      const project = projects.find(p => p.id === projectId)
      return api.post('/items/orders', {
        name: `BC - ${project?.name || 'Projet'}`,
        project_id: projectId,
        provider_id: providerId,
        amount: project?.budget || 0,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        owner_company: project?.owner_company
      })
    },
    onSuccess: () => {
      toast.success('Reception du bon de commande confirmee')
      queryClient.invalidateQueries({ queryKey: ['provider-purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['provider-orders'] })
    },
    onError: () => {
      toast.error('Erreur lors de la confirmation')
    }
  })

  // Map orders by project_id for quick lookup
  const ordersByProject = {}
  orders.forEach(o => { ordersByProject[o.project_id] = o })

  const getStatusBadge = (status) => {
    const styles = {
      active: { label: 'Actif', color: 'bg-green-100 text-green-700' },
      in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
      'in-progress': { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Termine', color: 'bg-gray-100 text-gray-600' }
    }
    const s = styles[status] || { label: status, color: 'bg-gray-100 text-gray-500' }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
        {s.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Bons de commande</h1></div>
        <div className="ds-card p-6">
          <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bons de commande</h1>
        <p className="text-sm text-gray-500 mt-1">
          Projets actifs ou vous etes prestataire principal — confirmez la reception du BC
        </p>
      </div>

      {/* Orders list */}
      <div className="ds-card p-6">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Aucun bon de commande</p>
            <p className="text-xs text-gray-400 mt-1">Les bons de commande apparaitront lorsqu'un projet vous sera attribue</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(project => {
              const order = ordersByProject[project.id]
              const isConfirmed = order?.status === 'confirmed'

              return (
                <div
                  key={project.id}
                  className="border border-gray-100 rounded-xl p-5 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">{project.name}</h3>
                        {getStatusBadge(project.status)}
                      </div>

                      {project.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {project.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Debut : {format(new Date(project.start_date), 'dd.MM.yyyy', { locale: fr })}
                          </div>
                        )}
                        {project.end_date && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Fin : {format(new Date(project.end_date), 'dd.MM.yyyy', { locale: fr })}
                          </div>
                        )}
                        {project.budget && (
                          <div className="flex items-center gap-1 font-medium text-gray-700">
                            Montant : {formatCHF(project.budget)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 shrink-0">
                      {isConfirmed ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                          <CheckCircle size={16} className="text-green-600" />
                          <div>
                            <span className="text-xs font-medium text-green-700">BC confirme</span>
                            {order.confirmed_at && (
                              <p className="text-[10px] text-green-600">
                                {format(new Date(order.confirmed_at), 'dd.MM.yyyy', { locale: fr })}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => confirmMutation.mutate(project.id)}
                          disabled={confirmMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#0071E3] text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {confirmMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          Confirmer reception BC
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default PurchaseOrders

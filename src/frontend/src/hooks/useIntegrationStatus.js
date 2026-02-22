/**
 * useIntegrationStatus — Story C.7
 * Polls backend /api/integrations/health every 60s.
 * Returns normalised status array for IntegrationStatusBar.
 * Graceful degradation: endpoint failure -> 'unknown', never crash.
 */

import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

/**
 * Fetch health status from backend Express API.
 * The backend checks env-var presence + live connectivity for each service.
 */
const fetchIntegrationHealth = async () => {
  const res = await api.get('/api/integrations/health')
  return res.data
}

/**
 * Map backend status to UI status.
 * @param {Object} serviceStatus - { available: boolean, error: string|null, warning: string|null }
 * @returns {'online'|'warning'|'offline'|'unknown'}
 */
const resolveStatus = (serviceStatus) => {
  if (!serviceStatus) return 'unknown'
  if (serviceStatus.warning) return 'warning'
  if (serviceStatus.available) return 'online'
  if (serviceStatus.error) return 'offline'
  return 'unknown'
}

export const useIntegrationStatus = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['integration-health'],
    queryFn: fetchIntegrationHealth,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
    // Never let a failed health check crash the dashboard
    throwOnError: false
  })

  const integrations = data?.integrations || {}

  return {
    isLoading,
    isError,
    services: [
      {
        id: 'invoice-ninja',
        name: 'Invoice Ninja',
        status: resolveStatus(integrations.invoiceNinja),
        isLoading,
        path: '/superadmin/settings',
        warningText: integrations.invoiceNinja?.warning || null,
        errorText: integrations.invoiceNinja?.error || null
      },
      {
        id: 'mautic',
        name: 'Mautic',
        status: resolveStatus(integrations.mautic),
        isLoading,
        path: '/superadmin/settings',
        warningText: integrations.mautic?.warning || null,
        errorText: integrations.mautic?.error || null
      },
      {
        id: 'revolut',
        name: 'Revolut',
        status: resolveStatus(integrations.revolut),
        isLoading,
        path: '/superadmin/finance/banking',
        warningText: integrations.revolut?.warning || null,
        errorText: integrations.revolut?.error || null
      },
      {
        id: 'erpnext',
        name: 'ERPNext',
        status: resolveStatus(integrations.erpnext),
        isLoading,
        path: '/superadmin/settings',
        warningText: integrations.erpnext?.warning || null,
        errorText: integrations.erpnext?.error || null
      },
      {
        id: 'docuseal',
        name: 'DocuSeal',
        status: resolveStatus(integrations.docuseal),
        isLoading,
        path: '/superadmin/settings',
        warningText: integrations.docuseal?.warning || null,
        errorText: integrations.docuseal?.error || null
      }
    ]
  }
}

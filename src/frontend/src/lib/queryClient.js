/**
 * TanStack Query Client configuration
 * Extracted from App.jsx for reuse across portals.
 *
 * @version 1.0.0
 * @date 2026-02-19
 */

import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      gcTime: 1000 * 60 * 10,     // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 401/403
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true
    },
    mutations: {
      retry: false
    }
  }
})

export default queryClient

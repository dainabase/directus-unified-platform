/**
 * useNotifications — S-05-05
 * Hook for notifications with 30s polling from Directus.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../services/api/crm'
import { useAuthStore } from '../stores/authStore'

const POLL_INTERVAL = 30_000

export function useNotifications() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const userId = user?.id

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications({ user_id: userId, limit: 50 }),
    refetchInterval: POLL_INTERVAL,
    staleTime: 15_000,
    enabled: !!userId
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markReadMutation = useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending
  }
}

/**
 * usePolling — Story 2.12
 * Generic polling hook with visibility API support.
 *
 * Pauses polling when the browser tab is hidden (Page Visibility API)
 * and resumes immediately when the tab becomes visible again.
 *
 * @param {Function} callback - Async function to call periodically
 * @param {number} intervalMs - Poll interval in milliseconds (default 30000)
 * @param {boolean} enabled - Whether polling is active (default true)
 * @returns {{ lastUpdated: Date|null, isRefreshing: boolean }}
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export function usePolling(callback, intervalMs = 30_000, enabled = true) {
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const intervalRef = useRef(null)
  const callbackRef = useRef(callback)
  const enabledRef = useRef(enabled)

  // Keep refs in sync so the interval always calls the latest callback
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const executePoll = useCallback(async () => {
    if (!enabledRef.current) return
    if (document.hidden) return

    setIsRefreshing(true)
    try {
      await callbackRef.current()
      setLastUpdated(new Date())
    } catch (error) {
      // Graceful degradation — log but never crash
      console.warn('[usePolling] Poll cycle failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(executePoll, intervalMs)
  }, [executePoll, intervalMs])

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Handle Page Visibility API — pause when hidden, resume when visible
  useEffect(() => {
    if (!enabled) {
      stopInterval()
      return
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopInterval()
      } else {
        // Tab became visible — poll immediately then restart interval
        executePoll()
        startInterval()
      }
    }

    // Start polling
    startInterval()

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopInterval()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, startInterval, stopInterval, executePoll])

  return { lastUpdated, isRefreshing }
}

export default usePolling

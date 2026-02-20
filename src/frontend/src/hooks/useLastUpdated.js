/**
 * useLastUpdated — Story 2.10
 * Tracks the last time data was fetched/refreshed.
 * Returns a formatted "Last updated" string that auto-updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function useLastUpdated(refreshIntervalMs = 30_000) {
  const [lastUpdated, setLastUpdated] = useState(null)
  const [label, setLabel] = useState('')
  const timerRef = useRef(null)

  const markUpdated = useCallback(() => {
    setLastUpdated(new Date())
  }, [])

  useEffect(() => {
    if (!lastUpdated) return

    const updateLabel = () => {
      setLabel(formatDistanceToNow(lastUpdated, { addSuffix: true, locale: fr }))
    }

    updateLabel()
    timerRef.current = setInterval(updateLabel, refreshIntervalMs)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [lastUpdated, refreshIntervalMs])

  return { lastUpdated, label, markUpdated }
}

export default useLastUpdated

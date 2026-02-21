import { useState, useCallback } from 'react'

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((variant, message, duration = 4000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, variant, message, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((msg, dur) => addToast('success', msg, dur), [addToast])
  const error = useCallback((msg, dur) => addToast('error', msg, dur), [addToast])
  const warning = useCallback((msg, dur) => addToast('warning', msg, dur), [addToast])
  const info = useCallback((msg, dur) => addToast('info', msg, dur), [addToast])

  return { toasts, removeToast, success, error, warning, info }
}

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MdCheckCircle, MdClose, MdErrorOutline, MdInfoOutline, MdWarningAmber } from 'react-icons/md'
import './Toast.css'

const ICONS = {
  success: MdCheckCircle,
  error: MdErrorOutline,
  info: MdInfoOutline,
  warning: MdWarningAmber
}

const ToastContext = createContext({
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
  dismiss: () => {}
})

/**
 * A single toast. Exported as the default so it can also be dropped in
 * standalone (e.g. an inline form confirmation).
 */
export default function Toast({ type = 'info', title, message, onClose }) {
  const Icon = ICONS[type] || MdInfoOutline

  return (
    <div className={`rk-toast rk-toast--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="rk-toast__icon" aria-hidden="true">
        <Icon />
      </span>
      <div className="rk-toast__content">
        {title && <strong className="rk-toast__title">{title}</strong>}
        {message && <span className="rk-toast__message">{message}</span>}
      </div>
      {onClose && (
        <button type="button" className="rk-toast__close" onClick={onClose} aria-label="Dismiss notification">
          <MdClose aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

/**
 * Mount once near the app root. Anything below can call `useToast()`.
 *
 *   const { success, error } = useToast()
 *   success('Enquiry sent', 'Our Faridabad team will call you shortly.')
 */
export function ToastProvider({ children, duration = 5000 }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (type, title, message, options = {}) => {
      idRef.current += 1
      const id = idRef.current
      setToasts((list) => [...list, { id, type, title, message }].slice(-4))
      const life = options.duration ?? duration
      if (life > 0) {
        timersRef.current.set(
          id,
          setTimeout(() => dismiss(id), life)
        )
      }
      return id
    },
    [dismiss, duration]
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
      timers.clear()
    }
  }, [])

  const value = useMemo(
    () => ({
      toast: push,
      success: (title, message, options) => push('success', title, message, options),
      error: (title, message, options) => push('error', title, message, options),
      info: (title, message, options) => push('info', title, message, options),
      warning: (title, message, options) => push('warning', title, message, options),
      dismiss
    }),
    [push, dismiss]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="rk-toasts" aria-live="polite" aria-atomic="false">
            {toasts.map((t) => (
              <Toast key={t.id} {...t} onClose={() => dismiss(t.id)} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

export { ToastContext }

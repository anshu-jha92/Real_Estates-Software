import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MdClose } from 'react-icons/md'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import './Modal.css'

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'

/**
 * Accessible dialog: rendered in a portal, closes on Esc and backdrop click,
 * traps Tab focus and restores focus to the trigger on close.
 *
 * @param {{ open: boolean, onClose: () => void, title?: string,
 *           children: React.ReactNode, footer?: React.ReactNode,
 *           size?: 'sm'|'md'|'lg'|'full', closeOnBackdrop?: boolean,
 *           labelledBy?: string, className?: string }} props
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  labelledBy,
  className = ''
}) {
  const panelRef = useRef(null)
  const restoreRef = useRef(null)
  const uid = useId().replace(/:/g, '')
  const titleId = labelledBy || `rk-modal-title-${uid}`

  useLockBodyScroll(open)

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose?.()
        return
      }

      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const nodes = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )
      if (!nodes.length) {
        event.preventDefault()
        panel.focus()
        return
      }

      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return undefined

    restoreRef.current = document.activeElement

    const timer = setTimeout(() => {
      const panel = panelRef.current
      if (!panel) return
      const target = panel.querySelector('[data-autofocus]') || panel.querySelector(FOCUSABLE) || panel
      target.focus?.()
    }, 20)

    return () => {
      clearTimeout(timer)
      const previous = restoreRef.current
      if (previous && typeof previous.focus === 'function') previous.focus()
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="rk-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose?.()
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="rk-modal__backdrop" aria-hidden="true" />

      <div
        ref={panelRef}
        className={`rk-modal__panel rk-modal__panel--${size} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Dialog'}
        tabIndex={-1}
      >
        <div className="rk-modal__head">
          {title && (
            <h2 id={titleId} className="rk-modal__title">
              {title}
            </h2>
          )}
          <button type="button" className="rk-modal__close" onClick={onClose} aria-label="Close dialog">
            <MdClose aria-hidden="true" />
          </button>
        </div>

        <div className="rk-modal__body">{children}</div>

        {footer && <div className="rk-modal__foot">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

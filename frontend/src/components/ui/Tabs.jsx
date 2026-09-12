import { useRef } from 'react'
import './Tabs.css'

/**
 * Controlled tab strip (Buy / Rent / Plots / Commercial, portfolio filters,
 * admin sub-views). Arrow keys, Home and End move between tabs, per the
 * WAI-ARIA tabs pattern.
 *
 * @param {{ tabs: Array<{ value: string, label: React.ReactNode, count?: number, icon?: React.ElementType }>,
 *           value: string, onChange: (value: string) => void,
 *           ariaLabel?: string, variant?: 'pill'|'underline'|'glass',
 *           panelId?: string, className?: string }} props
 */
export default function Tabs({
  tabs = [],
  value,
  onChange,
  ariaLabel = 'Filter',
  variant = 'pill',
  panelId,
  className = ''
}) {
  const listRef = useRef(null)

  const focusTab = (index) => {
    const buttons = listRef.current?.querySelectorAll('[role="tab"]')
    if (!buttons || !buttons.length) return
    const next = (index + buttons.length) % buttons.length
    buttons[next].focus()
    onChange?.(tabs[next].value)
  }

  const handleKeyDown = (event, index) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        focusTab(index + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        focusTab(index - 1)
        break
      case 'Home':
        event.preventDefault()
        focusTab(0)
        break
      case 'End':
        event.preventDefault()
        focusTab(tabs.length - 1)
        break
      default:
        break
    }
  }

  if (!tabs.length) return null

  return (
    <div
      ref={listRef}
      className={`rk-tabs rk-tabs--${variant} ${className}`.trim()}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab, index) => {
        const Icon = tab.icon
        const selected = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            id={`rk-tab-${tab.value}`}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            className={`rk-tabs__tab ${selected ? 'is-active' : ''}`.trim()}
            onClick={() => onChange?.(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {Icon && (
              <span className="rk-tabs__icon" aria-hidden="true">
                <Icon />
              </span>
            )}
            <span className="rk-tabs__label">{tab.label}</span>
            {typeof tab.count === 'number' && <span className="rk-tabs__count">{tab.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

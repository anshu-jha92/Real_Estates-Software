import { useId, useState } from 'react'
import { MdAdd, MdRemove } from 'react-icons/md'
import './Accordion.css'

/**
 * Keyboard-accessible accordion (FAQ blocks, mobile filter groups, mobile nav
 * submenus). Buttons carry `aria-expanded` and control their panel by id.
 *
 * @param {{ items: Array<{ id?: string, title: React.ReactNode, content: React.ReactNode }>,
 *           allowMultiple?: boolean, defaultOpen?: number|number[]|null,
 *           className?: string }} props
 */
export default function Accordion({ items = [], allowMultiple = false, defaultOpen = 0, className = '' }) {
  const uid = useId().replace(/:/g, '')

  const initial = () => {
    if (defaultOpen === null || defaultOpen === undefined) return []
    return Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen]
  }

  const [open, setOpen] = useState(initial)

  const toggle = (index) => {
    setOpen((current) => {
      const isOpen = current.includes(index)
      if (isOpen) return current.filter((i) => i !== index)
      return allowMultiple ? [...current, index] : [index]
    })
  }

  if (!items.length) return null

  return (
    <div className={`rk-accordion ${className}`.trim()}>
      {items.map((item, index) => {
        const isOpen = open.includes(index)
        const key = item.id || `${uid}-${index}`
        const panelId = `rk-acc-panel-${key}`
        const buttonId = `rk-acc-button-${key}`

        return (
          <div className={`rk-accordion__item ${isOpen ? 'is-open' : ''}`.trim()} key={key}>
            <h3 className="rk-accordion__heading">
              <button
                type="button"
                id={buttonId}
                className="rk-accordion__button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
              >
                <span className="rk-accordion__title">{item.title}</span>
                <span className="rk-accordion__icon" aria-hidden="true">
                  {isOpen ? <MdRemove /> : <MdAdd />}
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="rk-accordion__panel"
              hidden={!isOpen}
            >
              <div className="rk-accordion__content">{item.content}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

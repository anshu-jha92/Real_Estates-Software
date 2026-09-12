import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { MdCheck, MdExpandMore, MdSearch } from 'react-icons/md'
import './SearchSelect.css'

/**
 * A select you can type into. Closed it looks like a normal field; open it shows a
 * filter box above the option list, so a long ladder of prices or 23 Faridabad
 * localities stays usable.
 *
 * Values are compared as strings because form state keeps everything as strings.
 */
export default function SearchSelect({
  id: triggerId,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select',
  clearLabel = 'Any',
  searchPlaceholder = 'Type to search…',
  ariaLabel,
  variant = 'glass',
  name,
  disabled = false,
}) {
  const reactId = useId()
  const id = `rk-ss-${reactId.replace(/[:]/g, '')}`

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [dropUp, setDropUp] = useState(false)

  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  /** True while the highlight is being moved by the keyboard, false when the mouse moves it. */
  const viaKeyboardRef = useRef(false)

  // `clearLabel` is option 0 so "Any" is always reachable by keyboard.
  const allOptions = useMemo(
    () => [{ label: clearLabel, value: '' }, ...options.map((o) => ({ ...o, value: String(o.value) }))],
    [options, clearLabel]
  )

  const shown = useMemo(() => {
    // Every typed word must appear somewhere in the label, so "sec 8" finds
    // "Sector 84" and "3 bhk" finds "3 BHK Apartment". Punctuation is ignored
    // on both sides so digits typed into a price box match "Rs.5,00,000" too.
    const tokens = query.toLowerCase().split(/\s+/).map((t) => t.replace(/[^a-z0-9]/g, '')).filter(Boolean)
    if (!tokens.length) return allOptions
    return allOptions.filter((o) => {
      if (!o.value) return true // keep the "Any" row reachable
      const bare = o.label.toLowerCase().replace(/[^a-z0-9]/g, '')
      return tokens.every((t) => bare.includes(t))
    })
  }, [allOptions, query])

  const selected = allOptions.find((o) => o.value === String(value ?? ''))

  function close(refocus = true) {
    setOpen(false)
    setQuery('')
    // preventScroll: refocusing the trigger must not yank the page around.
    if (refocus) triggerRef.current?.focus({ preventScroll: true })
  }

  function pick(option) {
    onChange?.(option.value)
    close()
  }

  // Panel height cap from the stylesheet; keep the two in step.
  const PANEL_H = 268

  // Open with the current selection highlighted, and focus the filter box.
  useEffect(() => {
    if (!open) return
    const box = triggerRef.current?.getBoundingClientRect()
    if (box) {
      const below = window.innerHeight - box.bottom
      // Flip up only when there is genuinely more room the other way.
      setDropUp(below < PANEL_H + 16 && box.top > below)
    }
    viaKeyboardRef.current = true
    setActive(Math.max(0, shown.findIndex((o) => o.value === String(value ?? ''))))
    inputRef.current?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) close(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open])

  // Keep the keyboard-highlighted row inside the list. This scrolls ONLY the
  // list: scrollIntoView would also scroll every ancestor, including the page,
  // and it fired on every mouse hover — which is what made the hero jump.
  useEffect(() => {
    if (!open || !viaKeyboardRef.current) return
    const list = listRef.current
    const row = list?.querySelector('[data-active="true"]')
    if (!list || !row) return
    const box = list.getBoundingClientRect()
    const item = row.getBoundingClientRect()
    if (item.top < box.top) list.scrollTop -= box.top - item.top
    else if (item.bottom > box.bottom) list.scrollTop += item.bottom - box.bottom
  }, [active, open])

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!shown.length) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      viaKeyboardRef.current = true
      setActive((i) => (i + step + shown.length) % shown.length)
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      viaKeyboardRef.current = true
      setActive(event.key === 'Home' ? 0 : shown.length - 1)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (shown[active]) pick(shown[active])
      return
    }
    if (event.key === 'Tab') close(false)
  }

  const listId = `${id}-list`

  return (
    <div
      ref={rootRef}
      className={`rk-ss rk-ss--${variant}${open ? ' is-open' : ''}${
        open && dropUp ? ' is-up' : ''
      }${disabled ? ' is-disabled' : ''}`}
    >
      {name && <input type="hidden" name={name} value={value ?? ''} />}

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className="rk-ss__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        disabled={disabled}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen(true)
          }
        }}
      >
        <span className={`rk-ss__value${selected && selected.value ? '' : ' is-placeholder'}`}>
          {selected && selected.value ? selected.label : placeholder}
        </span>
        <MdExpandMore className="rk-ss__caret" aria-hidden="true" />
      </button>

      {open && (
        <div className="rk-ss__panel">
          <div className="rk-ss__search">
            <MdSearch aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              className="rk-ss__input"
              value={query}
              placeholder={searchPlaceholder}
              aria-label={ariaLabel ? `Filter ${ariaLabel}` : 'Filter options'}
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={shown[active] ? `${id}-opt-${active}` : undefined}
              autoComplete="off"
              onChange={(event) => {
                setQuery(event.target.value)
                setActive(0)
              }}
              onKeyDown={onKeyDown}
            />
          </div>

          <ul ref={listRef} id={listId} role="listbox" className="rk-ss__list" aria-label={ariaLabel}>
            {shown.length === 0 && <li className="rk-ss__empty">No match for “{query}”</li>}

            {shown.map((option, index) => {
              const isSelected = option.value === String(value ?? '')
              return (
                <li
                  key={`${option.value}-${option.label}`}
                  id={`${id}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  data-active={index === active}
                  className={`rk-ss__option${index === active ? ' is-active' : ''}${
                    isSelected ? ' is-selected' : ''
                  }`}
                  onMouseEnter={() => {
                    viaKeyboardRef.current = false
                    setActive(index)
                  }}
                  // mousedown fires before the outside-click handler can close the panel
                  onMouseDown={(event) => {
                    event.preventDefault()
                    pick(option)
                  }}
                >
                  <span>{option.label}</span>
                  {isSelected && <MdCheck aria-hidden="true" />}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

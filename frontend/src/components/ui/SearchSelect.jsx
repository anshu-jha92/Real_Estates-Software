import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { MdCheck, MdExpandMore } from 'react-icons/md'
import './SearchSelect.css'

/**
 * "sec 8" -> ["sec", "8"];  "1bhk" -> ["1", "bhk"];  "₹50,000" -> ["50", "000"].
 * Splits on anything that is not a letter or digit, and between letters and
 * digits, so what people type and what the labels say break up the same way.
 */
const words = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/([a-z])(\d)|(\d)([a-z])/g, '$1$3 $2$4')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

/**
 * Every typed word must START some word of the label. So "50" matches
 * "₹50,000" and "₹50 Lac" but not "₹5,000" or "₹25,000"; "sec 8" matches
 * "Sector 84" but not "Sector 12". Prefix-on-words is what people expect
 * from an autocomplete — plain substring matching was reading "50" into
 * "5,000" and looked broken.
 */
const matches = (label, typed) => {
  const needles = words(typed)
  if (!needles.length) return true
  const hay = words(label)
  return needles.every((n) => hay.some((w) => w.startsWith(n)))
}

/**
 * A select you type into. The field itself is the text box: click it, type,
 * the list underneath narrows, pick a row and its label sits in the field.
 * Leaving without picking puts the previous choice back.
 *
 * Values are compared as strings because form state keeps everything as strings.
 */
export default function SearchSelect({
  id: inputId,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select',
  clearLabel = 'Any',
  ariaLabel,
  variant = 'glass',
  name,
  disabled = false,
}) {
  const reactId = useId()
  const id = `rk-ss-${reactId.replace(/[:]/g, '')}`
  const listId = `${id}-list`

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [typed, setTyped] = useState(false) // true once the visitor edits the text
  const [active, setActive] = useState(-1)
  const [dropUp, setDropUp] = useState(false)

  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const viaKeyboardRef = useRef(false)

  // `clearLabel` is option 0 so "Any" is always reachable by keyboard.
  const allOptions = useMemo(
    () => [{ label: clearLabel, value: '' }, ...options.map((o) => ({ ...o, value: String(o.value) }))],
    [options, clearLabel]
  )

  const selected = allOptions.find((o) => o.value === String(value ?? ''))
  const selectedLabel = selected && selected.value ? selected.label : ''

  // Until the visitor types, the whole list shows — opening the field must not
  // hide everything but the current choice.
  const shown = useMemo(() => {
    if (!typed) return allOptions
    return allOptions.filter((o) => !o.value || matches(o.label, query))
  }, [allOptions, query, typed])

  const realMatches = shown.filter((o) => o.value)
  const nothingMatches = typed && query.trim() && realMatches.length === 0

  function openList() {
    if (disabled || open) return
    setOpen(true)
    setTyped(false)
    setQuery(selectedLabel)
    setActive(-1)
  }

  function closeList() {
    setOpen(false)
    setTyped(false)
    setActive(-1)
  }

  function pick(option) {
    onChange?.(option.value)
    closeList()
    inputRef.current?.blur()
  }

  // Panel height cap from the stylesheet; keep the two in step.
  const PANEL_H = 268

  useEffect(() => {
    if (!open) return
    const box = inputRef.current?.getBoundingClientRect()
    if (box) {
      const below = window.innerHeight - box.bottom
      setDropUp(below < PANEL_H + 16 && box.top > below)
    }
    // Show the current choice highlighted, and select the text so typing replaces it.
    const idx = allOptions.findIndex((o) => o.value === String(value ?? ''))
    setActive(idx > 0 ? idx : -1)
    inputRef.current?.select()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) closeList()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open])

  // Keep the keyboard-highlighted row inside the list — the list only, never the page.
  useEffect(() => {
    if (!open || active < 0 || !viaKeyboardRef.current) return
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
      closeList()
      return
    }
    if (event.key === 'Tab') {
      closeList()
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        openList()
        return
      }
      if (!shown.length) return
      viaKeyboardRef.current = true
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((i) => {
        if (i < 0) return step > 0 ? 0 : shown.length - 1
        return (i + step + shown.length) % shown.length
      })
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      if (!open) return
      event.preventDefault()
      viaKeyboardRef.current = true
      setActive(event.key === 'Home' ? 0 : shown.length - 1)
      return
    }
    if (event.key === 'Enter') {
      if (!open) return
      event.preventDefault()
      if (active >= 0 && shown[active]) pick(shown[active])
      // Typed something that narrows to exactly one real option — take it.
      else if (typed && realMatches.length === 1) pick(realMatches[0])
    }
  }

  const displayValue = open ? query : selectedLabel

  return (
    <div
      ref={rootRef}
      className={`rk-ss rk-ss--${variant}${open ? ' is-open' : ''}${
        open && dropUp ? ' is-up' : ''
      }${disabled ? ' is-disabled' : ''}`}
    >
      {name && <input type="hidden" name={name} value={value ?? ''} />}

      <div className="rk-ss__field">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          className="rk-ss__input"
          value={displayValue}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          disabled={disabled}
          onFocus={openList}
          onClick={openList}
          onChange={(event) => {
            setQuery(event.target.value)
            setTyped(true)
            setActive(-1)
            if (!open) setOpen(true)
          }}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className="rk-ss__caret"
          tabIndex={-1}
          aria-label={open ? 'Close list' : 'Open list'}
          disabled={disabled}
          // mousedown, not click: keeps the input focused so the list does not flicker shut
          onMouseDown={(event) => {
            event.preventDefault()
            if (open) closeList()
            else {
              inputRef.current?.focus()
              openList()
            }
          }}
        >
          <MdExpandMore aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div className="rk-ss__panel">
          <ul ref={listRef} id={listId} role="listbox" className="rk-ss__list" aria-label={ariaLabel}>
            {nothingMatches && (
              <li className="rk-ss__empty">
                No match for “{query.trim()}” — try fewer letters
              </li>
            )}

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
                  // mousedown fires before the input blurs and the panel closes
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

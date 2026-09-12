import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { MdApartment, MdBusiness, MdHomeWork, MdPlace, MdSearch } from 'react-icons/md'
import useDebounce from '../../hooks/useDebounce'
import { api } from '../../api/client'
import './SearchSuggest.css'

/** Display order: shortest, most useful first. Icon + word say what each row is. */
const GROUPS = {
  localities: { icon: MdPlace, label: 'Locality' },
  projects: { icon: MdApartment, label: 'Project' },
  developers: { icon: MdBusiness, label: 'Developer' },
  propertyTypes: { icon: MdHomeWork, label: 'Property type' }
}
const GROUP_ORDER = Object.keys(GROUPS)

const EMPTY = { localities: [], projects: [], developers: [], propertyTypes: [] }
const MIN_CHARS = 2

/** One flat list so arrow keys can walk it; `group` stays on each row for routing. */
function flatten(data) {
  const out = []
  GROUP_ORDER.forEach((group) => {
    ;(data?.[group] || []).forEach((item) => {
      const isString = typeof item === 'string'
      out.push({
        group,
        label: isString ? item : item.title,
        slug: isString ? undefined : item.slug
      })
    })
  })
  return out
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Same split the server uses, so what is bold is what actually matched. */
const tokenize = (term) =>
  term
    .toLowerCase()
    .split(/[\s,/|-]+/)
    .filter((t) => t && (t.length >= 2 || /^\d$/.test(t)))

/** "Puri Pratham, Sector 84" with "sector 84, neharpar" -> Puri Pratham, <b>Sector</b> <b>84</b>. */
function highlight(label, term) {
  const tokens = tokenize(term)
  if (!tokens.length) return label
  const rx = new RegExp(`(${tokens.map(escapeRegex).join('|')})`, 'gi')
  return label.split(rx).map((part, i) =>
    tokens.includes(part.toLowerCase()) ? <strong key={i}>{part}</strong> : part
  )
}

/**
 * A search box with type-ahead. Suggestions come from live listings via
 * /properties/suggest and render as one plain list, the way a browser address
 * bar does: a search icon, the text, the part you typed in bold.
 *
 * @param {{ id: string, value: string, onChange: (text: string) => void,
 *           onPick: (item: { group: string, label: string, slug?: string }) => void,
 *           placeholder?: string, className?: string, ariaLabel?: string }} props
 */
export default function SearchSuggest({
  id,
  value,
  onChange,
  onPick,
  placeholder = 'Search',
  className = '',
  ariaLabel
}) {
  const reactId = useId()
  const listId = `rk-sg-${reactId.replace(/[:]/g, '')}-list`

  const [data, setData] = useState(EMPTY)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [loading, setLoading] = useState(false)

  const rootRef = useRef(null)
  const listRef = useRef(null)
  const viaKeyboardRef = useRef(false)

  const term = useDebounce(value.trim(), 250)

  /* ---------- Fetch ---------- */
  useEffect(() => {
    if (term.length < MIN_CHARS) {
      setData(EMPTY)
      setLoading(false)
      return undefined
    }
    const controller = new AbortController()
    setLoading(true)
    api
      .suggest(term, { signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return
        setData(res?.data || EMPTY)
        setActive(-1)
      })
      .catch(() => {
        if (!controller.signal.aborted) setData(EMPTY)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [term])

  const items = useMemo(() => flatten(data), [data])
  const hasResults = items.length > 0
  const showPanel = open && value.trim().length >= MIN_CHARS && (hasResults || !loading)

  /* ---------- Close on outside click ---------- */
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open])

  /* ---------- Keep the keyboard-highlighted row in view (list only, never the page) ---------- */
  useEffect(() => {
    if (!showPanel || active < 0 || !viaKeyboardRef.current) return
    const list = listRef.current
    const row = list?.querySelector('[data-active="true"]')
    if (!list || !row) return
    const box = list.getBoundingClientRect()
    const item = row.getBoundingClientRect()
    if (item.top < box.top) list.scrollTop -= box.top - item.top
    else if (item.bottom > box.bottom) list.scrollTop += item.bottom - box.bottom
  }, [active, showPanel])

  function pick(item) {
    setOpen(false)
    setActive(-1)
    onPick?.(item)
  }

  function onKeyDown(event) {
    if (!showPanel || !hasResults) {
      if (event.key === 'Escape') setOpen(false)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      viaKeyboardRef.current = true
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((i) => {
        const next = i + step
        if (next < -1) return items.length - 1
        if (next >= items.length) return -1
        return next
      })
      return
    }
    if (event.key === 'Enter' && active >= 0 && items[active]) {
      event.preventDefault()
      pick(items[active])
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setActive(-1)
    }
  }

  const typed = value.trim()

  return (
    <div ref={rootRef} className={`rk-sg ${className}`.trim()}>
      <input
        id={id}
        className="rk-input"
        type="search"
        name="search"
        role="combobox"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listId : undefined}
        aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
        autoComplete="off"
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {showPanel && (
        <div className="rk-sg__panel">
          {hasResults ? (
            <ul ref={listRef} id={listId} role="listbox" className="rk-sg__list" aria-label="Suggestions">
              {items.map((item, index) => {
                const { icon: Icon, label: kind } = GROUPS[item.group]
                return (
                <li
                  key={`${item.group}-${item.slug || item.label}`}
                  id={`${listId}-opt-${index}`}
                  role="option"
                  aria-selected={index === active}
                  data-active={index === active}
                  className={`rk-sg__option${index === active ? ' is-active' : ''}`}
                  onMouseEnter={() => {
                    viaKeyboardRef.current = false
                    setActive(index)
                  }}
                  // mousedown fires before the input blurs and the panel closes
                  onMouseDown={(event) => {
                    event.preventDefault()
                    pick(item)
                  }}
                >
                  <Icon className="rk-sg__icon" aria-hidden="true" />
                  <span className="rk-sg__label">{highlight(item.label, typed)}</span>
                  <span className="rk-sg__kind">{kind}</span>
                </li>
                )
              })}
            </ul>
          ) : (
            <p className="rk-sg__empty">
              <MdSearch className="rk-sg__icon" aria-hidden="true" />
              <span>
                No match for <strong>{typed}</strong> — press Enter to search anyway
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

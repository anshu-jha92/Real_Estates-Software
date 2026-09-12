import { useId } from 'react'
import { MdErrorOutline } from 'react-icons/md'
import SearchSelect from '../ui/SearchSelect'
import './Field.css'

/* ------------------------------------------------------------------ */
/* Shared form validation (used by every form in this folder)          */
/* ------------------------------------------------------------------ */

/** Indian mobile: optional +91 prefix, then 10 digits starting 6-9. */
export const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** "+91 98110 00000" -> "+919811000000" so the strict pattern can match it. */
const compactPhone = (value) => String(value || '').trim().replace(/[\s-]/g, '')

export function validateName(value, label = 'name') {
  const trimmed = String(value || '').trim()
  if (!trimmed) return `Please enter your ${label}.`
  if (trimmed.length < 2) return `Your ${label} must be at least 2 characters.`
  if (trimmed.length > 80) return `Your ${label} cannot exceed 80 characters.`
  return ''
}

export function validatePhone(value) {
  const compact = compactPhone(value)
  if (!compact) return 'Please enter your mobile number.'
  if (!PHONE_RE.test(compact)) return 'Enter a valid 10-digit Indian mobile number, e.g. 98110 00000.'
  return ''
}

/** Email is optional unless `required` is true. */
export function validateEmail(value, required = false) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return required ? 'Please enter your email address.' : ''
  if (!EMAIL_RE.test(trimmed)) return 'Enter a valid email address, e.g. name@example.com.'
  return ''
}

/** Normalise the phone before it goes to the API. */
export const normalisePhone = (value) => {
  const compact = compactPhone(value)
  return compact.startsWith('+91') ? compact : `+91${compact}`
}

/** Focus the first control the browser flagged as invalid, for keyboard users. */
export function focusFirstError(formEl) {
  const first = formEl?.querySelector('[aria-invalid="true"]')
  if (first) first.focus()
}

/* ------------------------------------------------------------------ */
/* Field                                                               */
/* ------------------------------------------------------------------ */

const toOption = (opt) =>
  typeof opt === 'object' && opt !== null
    ? { value: opt.value ?? opt.key ?? '', label: opt.label ?? opt.name ?? String(opt.value ?? '') }
    : { value: opt, label: String(opt) }

/**
 * A labelled form control: real <label htmlFor>, red asterisk when required,
 * and an error message wired up through aria-invalid / aria-describedby.
 */
export default function Field({
  as = 'input',
  label,
  name,
  value,
  onChange,
  error = '',
  required = false,
  icon = null,
  options = [],
  hint = '',
  placeholder = '',
  className = '',
  searchable = false,
  ...rest
}) {
  const uid = useId()
  const id = rest.id || `rk-${name || 'field'}-${uid}`
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  const controlProps = {
    ...rest,
    id,
    name,
    value: value ?? '',
    onChange,
    required,
    'aria-required': required || undefined,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy || undefined
  }

  let control
  if (as === 'textarea') {
    control = <textarea {...controlProps} placeholder={placeholder} className="rk-textarea" rows={rest.rows || 5} />
  } else if (as === 'select' && searchable) {
    // Same label/icon chrome, but a type-to-filter list instead of the OS picker.
    // The page's handler still receives an event-shaped object, so nothing there changes.
    control = (
      <SearchSelect
        id={id}
        name={name}
        value={value ?? ''}
        options={options.map(toOption)}
        placeholder={placeholder}
        clearLabel={placeholder || 'Any'}
        ariaLabel={label}
        variant="light"
        disabled={rest.disabled}
        onChange={(next) => onChange?.({ target: { name, value: next } })}
      />
    )
  } else if (as === 'select') {
    control = (
      <select {...controlProps} className="rk-select">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(toOption).map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  } else {
    control = <input {...controlProps} type={rest.type || 'text'} placeholder={placeholder} className="rk-input" />
  }

  return (
    <div className={`rk-field ${error ? 'rk-field--invalid' : ''} ${className}`.trim()}>
      {label && (
        <label className="rk-label" htmlFor={id}>
          {label}
          {required && (
            <span className="rk-label__req" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={`rk-field__control ${icon ? 'rk-field__control--icon' : ''}`.trim()}>
        {icon && (
          <span className="rk-field__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {control}
      </div>

      {hint && !error && (
        <p className="rk-hint rk-field__hint" id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <p className="rk-error rk-field__error" id={errorId} role="alert">
          <MdErrorOutline aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

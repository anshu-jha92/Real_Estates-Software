import { useId } from 'react'
import { MdSwapVert } from 'react-icons/md'
import { SORTS } from '../../data/constants'
import './SortSelect.css'

/**
 * Sort control for the property listing. Bound to SORTS from constants.
 *
 * @param {{ value?: string, onChange: (value: string) => void,
 *           label?: string, id?: string, className?: string }} props
 */
export default function SortSelect({ value = 'newest', onChange, label = 'Sort by', id, className = '' }) {
  const uid = useId().replace(/:/g, '')
  const selectId = id || `rk-sort-${uid}`
  const current = SORTS.some((s) => s.value === value) ? value : SORTS[0].value

  return (
    <div className={`rk-sort ${className}`.trim()}>
      <label className="rk-sort__label" htmlFor={selectId}>
        <MdSwapVert aria-hidden="true" />
        <span>{label}</span>
      </label>

      <select
        id={selectId}
        className="rk-select rk-sort__select"
        value={current}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {SORTS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

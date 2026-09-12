import {
  MdFirstPage,
  MdLastPage,
  MdChevronLeft,
  MdChevronRight
} from 'react-icons/md'
import './Pagination.css'

/**
 * Page numbers with ellipses: 1 … 4 [5] 6 … 20
 * Always shows the first page, the last page and `siblings` on either side.
 */
export function pageItems(page, pages, siblings = 1) {
  if (pages <= 1) return [1]

  const items = []
  const start = Math.max(2, page - siblings)
  const end = Math.min(pages - 1, page + siblings)

  items.push(1)
  if (start > 2) items.push('gap-start')
  for (let i = start; i <= end; i += 1) items.push(i)
  if (end < pages - 1) items.push('gap-end')
  items.push(pages)

  return items
}

/**
 * @param {{ page?: number, pages?: number, onPageChange?: (page: number) => void,
 *           onChange?: (page: number) => void, siblings?: number, className?: string }} props
 */
export default function Pagination({
  page = 1,
  pages = 1,
  onPageChange,
  onChange,
  siblings = 1,
  className = ''
}) {
  const total = Math.max(1, Number(pages) || 1)
  const current = Math.min(Math.max(1, Number(page) || 1), total)
  const go = onPageChange || onChange

  if (total <= 1) return null

  const move = (next) => {
    if (next < 1 || next > total || next === current) return
    go?.(next)
  }

  const atStart = current === 1
  const atEnd = current === total

  return (
    <nav className={`rk-pagi ${className}`.trim()} aria-label="Property pages">
      <ul className="rk-pagi__list">
        <li className="rk-pagi__edge">
          <button
            type="button"
            className="rk-pagi__btn"
            onClick={() => move(1)}
            disabled={atStart}
            aria-label="First page"
          >
            <MdFirstPage aria-hidden="true" />
          </button>
        </li>

        <li>
          <button
            type="button"
            className="rk-pagi__btn"
            onClick={() => move(current - 1)}
            disabled={atStart}
            aria-label="Previous page"
          >
            <MdChevronLeft aria-hidden="true" />
            <span className="rk-pagi__btntext">Prev</span>
          </button>
        </li>

        {pageItems(current, total, siblings).map((item) =>
          typeof item === 'number' ? (
            <li key={item} className="rk-pagi__num">
              <button
                type="button"
                className={`rk-pagi__btn rk-pagi__page ${item === current ? 'is-current' : ''}`.trim()}
                onClick={() => move(item)}
                aria-current={item === current ? 'page' : undefined}
                aria-label={`Page ${item}${item === current ? ', current page' : ''}`}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className="rk-pagi__num rk-pagi__gap" aria-hidden="true">
              …
            </li>
          )
        )}

        <li>
          <button
            type="button"
            className="rk-pagi__btn"
            onClick={() => move(current + 1)}
            disabled={atEnd}
            aria-label="Next page"
          >
            <span className="rk-pagi__btntext">Next</span>
            <MdChevronRight aria-hidden="true" />
          </button>
        </li>

        <li className="rk-pagi__edge">
          <button
            type="button"
            className="rk-pagi__btn"
            onClick={() => move(total)}
            disabled={atEnd}
            aria-label="Last page"
          >
            <MdLastPage aria-hidden="true" />
          </button>
        </li>
      </ul>

      {/* Condensed label, shown instead of the numbers under 640px */}
      <p className="rk-pagi__status" aria-live="polite">
        Page {current} of {total}
      </p>
    </nav>
  )
}

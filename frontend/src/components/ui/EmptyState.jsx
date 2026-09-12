import { MdSearchOff } from 'react-icons/md'
import './EmptyState.css'

/**
 * Shown whenever a list has nothing to show — no results, a failed request or
 * an empty admin table. Never leave a blank screen.
 *
 * @param {{ icon?: React.ElementType, title?: string, message?: React.ReactNode,
 *           action?: React.ReactNode, tone?: 'default'|'error', className?: string }} props
 */
export default function EmptyState({
  icon: Icon = MdSearchOff,
  title = 'No properties matched your search',
  message = 'Try widening the budget, clearing a filter, or tell us what you need and we will find it in Faridabad for you.',
  action,
  tone = 'default',
  className = ''
}) {
  return (
    <div className={`rk-empty rk-empty--${tone} ${className}`.trim()} role="status">
      <span className="rk-empty__icon" aria-hidden="true">
        <Icon />
      </span>
      <h3 className="rk-empty__title">{title}</h3>
      {message && <p className="rk-empty__message">{message}</p>}
      {action && <div className="rk-empty__action">{action}</div>}
    </div>
  )
}

import useCountUp from '../../hooks/useCountUp'
import { formatNumber } from '../../utils/format'
import './StatsBand.css'

const STATS = [
  { value: 18, suffix: '+', label: 'Years of Experience', note: 'Working Faridabad since 2007' },
  { value: 1200, suffix: '+', label: 'Happy Families', note: 'Settled across the city' },
  { value: 250, suffix: '+', label: 'Projects Delivered', note: 'Homes, plots, shops, offices' },
  { value: 40, suffix: '+', label: 'Developer Tie-ups', note: 'BPTP, Omaxe, Puri, RPS and more' }
]

/** One stat. Separate component so each gets its own count-up observer. */
function Stat({ value, suffix, label, note }) {
  const { ref, value: current } = useCountUp(value)

  return (
    <li className="rk-statsband__item" ref={ref}>
      <p className="rk-statsband__value">
        {formatNumber(current)}
        <span className="rk-statsband__suffix">{suffix}</span>
      </p>
      <p className="rk-statsband__label">{label}</p>
      <p className="rk-statsband__note">{note}</p>
    </li>
  )
}

/**
 * Deep-green band of count-up numbers. Each figure animates once, the first
 * time it scrolls into view.
 */
export default function StatsBand() {
  return (
    <section className="rk-statsband" aria-label="Rama Kripa Estates in numbers">
      <div className="rk-container">
        <ul className="rk-statsband__list">
          {STATS.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </ul>
      </div>
    </section>
  )
}

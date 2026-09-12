import { MdArrowForward } from 'react-icons/md'
import { formatPrice, formatArea } from '../../utils/format'
import './ConfigTable.css'

/**
 * Configuration / area / price table for a project. Becomes stacked cards
 * under 640px. The action button hands the whole config back to the page so it
 * can prefill the enquiry form.
 *
 * @param {{ configurations?: Array<{label?: string, areaValue?: number, areaUnit?: string,
 *           price?: number, priceOnRequest?: boolean}>,
 *           areaUnit?: string, priceUnit?: string,
 *           onEnquire?: (config: object) => void, className?: string }} props
 */
export default function ConfigTable({
  configurations,
  areaUnit = 'sqft',
  priceUnit = 'total',
  onEnquire,
  className = ''
}) {
  const rows = (Array.isArray(configurations) ? configurations : []).filter(
    (row) => row && (row.label || row.areaValue || row.price)
  )

  if (!rows.length) {
    return (
      <p className={`rk-config__none ${className}`.trim()}>
        Unit-wise pricing for this property is shared on request. Send us an enquiry and we will
        email the current price list with the payment plan the same day.
      </p>
    )
  }

  return (
    <div className={`rk-config ${className}`.trim()}>
      <table className="rk-config__table">
        <caption className="sr-only">Available configurations, areas and prices</caption>

        <thead>
          <tr>
            <th scope="col">Configuration</th>
            <th scope="col">Area</th>
            <th scope="col">Price</th>
            <th scope="col">
              <span className="sr-only">Enquire</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => {
            const label = row.label || `Unit ${index + 1}`
            const area = formatArea(row.areaValue, null, row.areaUnit || areaUnit)
            const price = formatPrice(row.price, {
              priceOnRequest: row.priceOnRequest,
              priceUnit: row.priceUnit || priceUnit
            })

            return (
              <tr key={`${label}-${row.areaValue || index}`}>
                <td data-label="Configuration" className="rk-config__label">
                  {label}
                </td>
                <td data-label="Area">{area}</td>
                <td data-label="Price" className="rk-config__price">
                  {price}
                </td>
                <td data-label="" className="rk-config__actions">
                  <button
                    type="button"
                    className="rk-config__btn"
                    onClick={() => onEnquire?.(row)}
                  >
                    Enquire
                    <MdArrowForward aria-hidden="true" />
                    <span className="sr-only"> about {label}</span>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

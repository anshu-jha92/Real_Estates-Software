/**
 * Hand-drawn multi-tone icons for Rama Kripa Estates.
 *
 * Written in-house rather than pulled from an icon marketplace: no attribution
 * string to carry, no licence to renew, and the palette is the site's own so the
 * icons can never drift from the brand.
 *
 * Every icon is a 48x48 grid, sized by CSS (`font-size` on the container drives
 * `1em`). Colours come from the design tokens, so a palette change updates them
 * all. Each is decorative — the labels beside them carry the meaning — so they
 * render `aria-hidden` and take no title.
 */

const G_DARK = 'var(--rk-green-800)'
const G_MID = 'var(--rk-green-600)'
const G_DEEP = 'var(--rk-green-900)'
const GOLD = 'var(--rk-gold-500)'
const GOLD_LT = 'var(--rk-gold-400)'
const GOLD_PALE = 'var(--rk-gold-300)'
const CREAM = 'var(--rk-cream)'

function Svg({ children }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width="1em"
      height="1em"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="rk-icon"
    >
      {children}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Category icons                                                      */
/* ------------------------------------------------------------------ */

/** Residential — a tower block with lit windows and a small garden strip. */
export function IconResidential() {
  return (
    <Svg>
      <path d="M7 41V17.5a2 2 0 0 1 1.1-1.8l9-4.5a2 2 0 0 1 1.8 0l9 4.5a2 2 0 0 1 1.1 1.8V41Z" fill={G_DARK} />
      <path d="M29 41V24.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2V41Z" fill={G_MID} />
      <path d="M18 6.4 30.2 12a1 1 0 0 1-.4 1.9H6.2A1 1 0 0 1 5.8 12L18 6.4Z" fill={GOLD} />
      <g fill={GOLD_PALE}>
        <rect x="11" y="20" width="4.5" height="4.5" rx="1" />
        <rect x="20" y="20" width="4.5" height="4.5" rx="1" />
        <rect x="11" y="28" width="4.5" height="4.5" rx="1" />
        <rect x="20" y="28" width="4.5" height="4.5" rx="1" />
      </g>
      <g fill={CREAM} opacity=".85">
        <rect x="32.5" y="27" width="4" height="4" rx="1" />
        <rect x="32.5" y="34" width="4" height="4" rx="1" />
      </g>
      <rect x="4" y="41" width="40" height="3" rx="1.5" fill={GOLD} />
    </Svg>
  )
}

/** Commercial — a shopfront under a striped awning. */
export function IconCommercial() {
  return (
    <Svg>
      <path d="M9 21h30v20a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2Z" fill={G_DARK} />
      <path d="M6 12.5A1.5 1.5 0 0 1 7.5 11h33a1.5 1.5 0 0 1 1.5 1.5V16a5 5 0 0 1-9 3.2A5 5 0 0 1 24 19.2a5 5 0 0 1-9 0A5 5 0 0 1 6 16Z" fill={GOLD} />
      <path d="M15 11h4.5l-1.2 8.9a5 5 0 0 1-3.3-3.1Zm13.5 0H33l.9 8.9a5 5 0 0 1-3.3-3.1Z" fill={GOLD_PALE} />
      <rect x="13.5" y="25" width="12" height="9" rx="1.5" fill={GOLD_LT} />
      <path d="M29.5 30.5a2 2 0 0 1 2-2H35a2 2 0 0 1 2 2V43h-7.5Z" fill={G_MID} />
      <rect x="4" y="43" width="40" height="3" rx="1.5" fill={GOLD} />
    </Svg>
  )
}

/**
 * Plots — an empty parcel of land pegged out for sale.
 * Deliberately pin-free: IconLocalExpert already owns the map-pin shape, and two
 * gold pins side by side made the two icons hard to tell apart.
 */
export function IconPlots() {
  return (
    <Svg>
      <path d="M24 14 45 26 24 38 3 26Z" fill={G_MID} />
      <path d="M24 26 45 26 24 38 3 26Z" fill={G_DARK} />
      <path
        d="M24 20.5 35.5 26.8 24 33.2 12.5 26.8Z"
        fill="none"
        stroke={GOLD}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeDasharray="3 3"
      />
      <g fill={GOLD_PALE}>
        <circle cx="24" cy="14.6" r="2.1" />
        <circle cx="44" cy="26" r="2.1" />
        <circle cx="24" cy="37.4" r="2.1" />
        <circle cx="4" cy="26" r="2.1" />
      </g>
      <path d="M33.5 5.5h2.6v13.8h-2.6Z" fill={G_DEEP} />
      <path d="M36.1 5.5h8.4l-2.4 3.4 2.4 3.4h-8.4Z" fill={GOLD} />
    </Svg>
  )
}

/** Rent — a key turning in a keyhole plate. */
export function IconRent() {
  return (
    <Svg>
      <rect x="5" y="8" width="24" height="32" rx="3" fill={G_DARK} />
      <path d="M8 8h18a3 3 0 0 1 3 3v3H8Z" fill={G_MID} />
      <circle cx="17" cy="24" r="5.2" fill={GOLD} />
      <path d="M15.6 27.5h2.8l.9 7.2a.9.9 0 0 1-.9 1h-2.8a.9.9 0 0 1-.9-1Z" fill={GOLD} />
      <circle cx="17" cy="23.6" r="1.9" fill={G_DEEP} />
      <circle cx="35.5" cy="18.5" r="7.5" fill={GOLD_LT} />
      <circle cx="35.5" cy="18.5" r="3" fill={CREAM} />
      <path d="M34 25.5h3v13.6l-1.5 2.4-1.5-2.4Z" fill={GOLD_LT} />
      <rect x="37" y="29" width="4.5" height="2.6" rx="1.3" fill={GOLD} />
      <rect x="37" y="34" width="3.5" height="2.6" rx="1.3" fill={GOLD} />
    </Svg>
  )
}

/** Office spaces — a glass tower beside a low block. */
export function IconOfficeSpace() {
  return (
    <Svg>
      <path d="M17 43V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v34Z" fill={G_DARK} />
      <path d="M5 43V25a2 2 0 0 1 2-2h10v20Z" fill={G_MID} />
      <path d="M35 43V19h6a2 2 0 0 1 2 2v22Z" fill={G_MID} />
      <g fill={GOLD_PALE}>
        <rect x="20.5" y="12" width="4" height="4" rx=".8" />
        <rect x="27.5" y="12" width="4" height="4" rx=".8" />
        <rect x="20.5" y="19" width="4" height="4" rx=".8" />
        <rect x="27.5" y="19" width="4" height="4" rx=".8" />
        <rect x="20.5" y="26" width="4" height="4" rx=".8" />
        <rect x="27.5" y="26" width="4" height="4" rx=".8" />
      </g>
      <path d="M22 43v-7a3 3 0 0 1 6 0v7Z" fill={GOLD} />
      <g fill={CREAM} opacity=".8">
        <rect x="8.5" y="28" width="4" height="3.4" rx=".8" />
        <rect x="8.5" y="34" width="4" height="3.4" rx=".8" />
        <rect x="37.5" y="24" width="3.4" height="3.4" rx=".8" />
        <rect x="37.5" y="30" width="3.4" height="3.4" rx=".8" />
      </g>
      <rect x="3" y="43" width="42" height="3" rx="1.5" fill={GOLD} />
    </Svg>
  )
}

/* ------------------------------------------------------------------ */
/* "Why choose us" icons                                               */
/* ------------------------------------------------------------------ */

/** Verified / RERA-checked — a shield with a tick. */
export function IconVerified() {
  return (
    <Svg>
      <path d="M24 4l15 5.5v13c0 10.4-6.6 19.6-15 22.5-8.4-2.9-15-12.1-15-22.5v-13Z" fill={G_DARK} />
      <path d="M24 4l15 5.5v13c0 10.4-6.6 19.6-15 22.5Z" fill={G_MID} />
      <path
        d="m16.5 24.5 5.4 5.4 10-10.4"
        stroke={GOLD}
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

/** Faridabad-only expertise — a pin dropped on a folded map. */
export function IconLocalExpert() {
  return (
    <Svg>
      <path d="M4 14.8 16 10v27.2L4 42Z" fill={G_MID} />
      <path d="M16 10l16 4.6v27.2L16 37.2Z" fill={G_DARK} />
      <path d="M32 14.6 44 10v27.2L32 41.8Z" fill={G_MID} />
      <path d="M24 6c5.2 0 9.5 4.2 9.5 9.4 0 6.8-9.5 15.8-9.5 15.8s-9.5-9-9.5-15.8C14.5 10.2 18.8 6 24 6Z" fill={GOLD} />
      <circle cx="24" cy="15.3" r="3.7" fill={CREAM} />
    </Svg>
  )
}

/** Site visits with transport — a car with a route line. */
export function IconSiteVisit() {
  return (
    <Svg>
      <path d="M7 32v-5.4a4 4 0 0 1 .8-2.4l4.3-5.7A4 4 0 0 1 15.3 17h17.4a4 4 0 0 1 3.2 1.5l4.3 5.7a4 4 0 0 1 .8 2.4V32a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z" fill={G_DARK} />
      <path d="M14.8 20.5h18.4a1 1 0 0 1 .8.4l3 4a.8.8 0 0 1-.6 1.3H11.6a.8.8 0 0 1-.6-1.3l3-4a1 1 0 0 1 .8-.4Z" fill={GOLD_PALE} />
      <g fill={G_DEEP}>
        <circle cx="14.5" cy="34" r="4.6" />
        <circle cx="33.5" cy="34" r="4.6" />
      </g>
      <g fill={GOLD}>
        <circle cx="14.5" cy="34" r="2" />
        <circle cx="33.5" cy="34" r="2" />
      </g>
      <path d="M5 12.5h11" stroke={GOLD} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M22 8h21" stroke={GOLD_LT} strokeWidth="2.6" strokeLinecap="round" />
    </Svg>
  )
}

/** Home-loan assistance — a house holding a rupee coin. */
export function IconHomeLoan() {
  return (
    <Svg>
      <path d="M24 6 42 19.5V40a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V19.5Z" fill={G_DARK} />
      <path d="M24 6 42 19.5V40a2 2 0 0 1-2 2H24Z" fill={G_MID} />
      <path d="M23 4.2a1.6 1.6 0 0 1 2 0l19.4 14.5a1.4 1.4 0 0 1-.9 2.5H4.5a1.4 1.4 0 0 1-.9-2.5Z" fill={GOLD} />
      <circle cx="24" cy="31" r="9" fill={GOLD_LT} />
      <path
        d="M20.7 25.8h6.6M20.7 29h6.6M25.4 25.8c1.9 0 3 1.3 3 3s-1.1 3-3 3h-4.7l6 5.4"
        stroke={G_DEEP}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

/** Legal and documentation — a stamped deed. */
export function IconLegal() {
  return (
    <Svg>
      <path d="M9 7a2 2 0 0 1 2-2h17.5L39 15.5V41a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2Z" fill={G_DARK} />
      <path d="M28.5 5 39 15.5h-8.5a2 2 0 0 1-2-2Z" fill={G_MID} />
      <g stroke={GOLD_PALE} strokeWidth="2.2" strokeLinecap="round">
        <path d="M15 20h11" />
        <path d="M15 26h18" />
        <path d="M15 32h9" />
      </g>
      <circle cx="33" cy="34.5" r="8" fill={GOLD} />
      <circle cx="33" cy="34.5" r="5.2" fill="none" stroke={G_DEEP} strokeWidth="1.6" strokeDasharray="2 2" />
      <path d="m30.4 34.6 1.9 1.9 3.5-3.7" stroke={G_DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

/** Post-sale support — a headset. */
export function IconSupport() {
  return (
    <Svg>
      <path d="M9 27v-3a15 15 0 0 1 30 0v3" stroke={GOLD} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M5.5 27.5A2.5 2.5 0 0 1 8 25h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8a2.5 2.5 0 0 1-2.5-2.5Z" fill={G_DARK} />
      <path d="M35 27a2 2 0 0 1 2-2h3a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 40 38h-3a2 2 0 0 1-2-2Z" fill={G_DARK} />
      <path d="M42.5 36v1.5A5.5 5.5 0 0 1 37 43h-6" stroke={G_MID} strokeWidth="3" strokeLinecap="round" />
      <rect x="21" y="39.5" width="9" height="6" rx="3" fill={GOLD} />
    </Svg>
  )
}

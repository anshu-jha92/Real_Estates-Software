/**
 * Rama Kripa Estates — static site constants (BUILD_SPEC §5, §10).
 *
 * Every `icon` field is a real react-icons component so consumers can render
 * `<item.icon />` directly; `iconName` keeps the string form for labels/debug.
 */

import {
  MdPool,
  MdFitnessCenter,
  MdLocalParking,
  MdElevator,
  MdSecurity,
  MdVideocam,
  MdPark,
  MdChildFriendly,
  MdSportsTennis,
  MdSportsBasketball,
  MdOutdoorGrill,
  MdPowerSettingsNew,
  MdWaterDrop,
  MdBolt,
  MdWifi,
  MdMeetingRoom,
  MdSpa,
  MdSelfImprovement,
  MdRestaurant,
  MdLocalHospital,
  MdSchool,
  MdShoppingCart,
  MdDirectionsBus,
  MdTheaters,
  MdLocalLaundryService,
  MdAir,
  MdKitchen,
  MdBalcony,
  MdAccessible,
  MdPets,
  MdSolarPower,
  MdRecycling,
  MdEvStation,
  MdDeck,
  MdCleaningServices,
  MdLock,
  MdGolfCourse,
  MdVerifiedUser,
  MdCheckCircle
} from 'react-icons/md'
import { FaGopuram } from 'react-icons/fa'
import {
  FiMapPin,
  FiHome,
  FiKey,
  FiTrendingUp,
  FiCamera,
  FiClipboard,
  FiUsers
} from 'react-icons/fi'
import {
  IconResidential,
  IconCommercial,
  IconPlots,
  IconRent,
  IconOfficeSpace,
  IconVerified,
  IconLocalExpert,
  IconSiteVisit,
  IconHomeLoan,
  IconLegal,
  IconSupport
} from '../components/icons/RkIcons'
import { formatPrice } from '../utils/format'


/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

/** Build an approved Unsplash URL. `id` is the photo id without the `photo-` prefix. */
export const UNSPLASH = (id, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

/** Square crop, for avatars. */
export const UNSPLASH_AVATAR = (id, s = 200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${s}&h=${s}&q=80`

/** Approved photo ids (BUILD_SPEC §10) — never invent new ones. */
export const IMAGE_IDS = {
  hero: [
    '1486406146926-c627a92ad1ab',
    '1449824913935-59a10b8d2000',
    '1477959858617-67f85cf4f1df',
    '1470723710355-95304d8aece4',
    '1493246507139-91e8fad9978e',
    '1518005020951-eccb494ad742'
  ],
  residential: [
    '1512917774080-9991f1c4c750',
    '1568605114967-8130f3a36994',
    '1600596542815-ffad4c1539a9',
    '1600585154340-be6161a56a0c',
    '1580587771525-78b9dba3b914',
    '1613490493576-7fde63acd811',
    '1560448204-e02f11c3d0e2',
    '1502005229762-cf1b2da7c5d6',
    '1570129477492-45c003edd2be'
  ],
  interior: [
    '1600607687939-ce8a6c25118c',
    '1600566753086-00f18fb6b3ea',
    '1522708323590-d24dbb6b0267',
    '1554995207-c18c203602cb',
    '1600210492486-724fe5c67fb0',
    '1616486338812-3dadae4b4ace'
  ],
  commercial: [
    '1497366216548-37526070297c',
    '1497366754035-f200968a6e72',
    '1524758631624-e2822e304c36',
    '1541888946425-d81bb19240f5',
    '1519389950473-47ba0277781c',
    '1497215728101-856f4ea42174'
  ],
  plots: [
    '1500382017468-9049fed747ef',
    '1416879595882-3373a0480b5b',
    '1464822759023-fed622ff2c3b',
    '1543965170-4c01a586684e',
    '1595246140625-573b715d11dc'
  ],
  people: [
    '1507003211169-0a1dd7228f2d',
    '1494790108377-be9c29b29330',
    '1500648767791-00dcc994a43e',
    '1544005313-94ddf0286df2',
    '1472099645785-5658abf4ff4e',
    '1438761681033-6461ffad8d80'
  ]
}

/**
 * Mandatory fallback for every remote <img>:
 * `onError={e => { e.currentTarget.src = IMAGE_FALLBACK }}`
 */
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img" aria-label="Rama Kripa Estates">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#08251B"/><stop offset="0.55" stop-color="#14513C"/><stop offset="1" stop-color="#A98218"/>
</linearGradient>
</defs>
<rect width="800" height="600" fill="url(#bg)"/>
<circle cx="400" cy="250" r="112" fill="#FFFFFF"/>
<g transform="translate(400 250) scale(3.5) translate(-32 -32)">
<circle cx="32" cy="32" r="30.2" fill="none" stroke="#111111" stroke-width="2.6"/>
<circle cx="32" cy="32" r="26.4" fill="none" stroke="#E8262C" stroke-width="1.5"/>
<g fill="#111111">
<path d="M11.8 25.4 20.0 21.6V44H11.8Z"/><path d="M20.6 19.0 27.4 15.6V44H20.6Z"/>
<path d="M28.0 13.4 33.2 10.8V44H28.0Z"/><path d="M33.8 9.0 38.4 11.4V44H33.8Z"/>
<path d="M45.0 21.6 50.2 25.4V44H45.0Z"/>
<path fill-rule="evenodd" d="M39.0 14.0 44.4 15.6V44H39.0Z M39.8 19.0H43.6V20.6H39.8Z M39.8 23.0H43.6V24.6H39.8Z M39.8 27.0H43.6V28.6H39.8Z M39.8 31.0H43.6V32.6H39.8Z"/>
</g>
<text x="32" y="53.6" font-family="Helvetica,Arial,sans-serif" font-size="12.5" font-weight="700" fill="#E8262C" text-anchor="middle">RKE</text>
</g>
<text x="400" y="404" font-family="Helvetica,Arial,sans-serif" font-size="30" font-weight="700" letter-spacing="8" fill="#FFFFFF" text-anchor="middle">RAMA KRIPA ESTATES</text>
<text x="400" y="440" font-family="Helvetica,Arial,sans-serif" font-size="16" letter-spacing="4" fill="#FAF7F1" fill-opacity="0.7" text-anchor="middle">BLESSINGS IN EVERY ADDRESS</text>
</svg>`

export const IMAGE_FALLBACK = `data:image/svg+xml,${encodeURIComponent(FALLBACK_SVG.replace(/\n/g, ''))}`

/** Convenience handler: `<img onError={onImageError} />` */
export const onImageError = (event) => {
  const el = event.currentTarget
  if (el.dataset.fallbackApplied === '1') return
  el.dataset.fallbackApplied = '1'
  el.src = IMAGE_FALLBACK
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export const CATEGORIES = [
  {
    key: 'residential',
    label: 'Residential',
    slug: '/residential',
    icon: IconResidential,
    iconName: 'IconResidential',
    image: UNSPLASH(IMAGE_IDS.residential[0], 800),
    blurb:
      'Ready-to-move and under-construction 2, 3 and 4 BHK apartments, builder floors and villas across Greater Faridabad and the old sectors.'
  },
  {
    key: 'commercial',
    label: 'Commercial',
    slug: '/commercial',
    icon: IconCommercial,
    iconName: 'IconCommercial',
    image: UNSPLASH(IMAGE_IDS.commercial[2], 800),
    blurb:
      'Retail shops, showrooms and SCO units on Sector 88 and 89 main roads with high footfall and assured rental demand.'
  },
  {
    key: 'plots',
    label: 'Plots',
    slug: '/plots',
    icon: IconPlots,
    iconName: 'IconPlots',
    image: UNSPLASH(IMAGE_IDS.plots[0], 800),
    blurb:
      'HSVP and licensed-colony residential plots plus SCO commercial plots in Neharpar, Tigaon Road and the Faridabad bypass belt.'
  },
  {
    key: 'rent',
    label: 'Rent',
    slug: '/rent',
    icon: IconRent,
    iconName: 'IconRent',
    image: UNSPLASH(IMAGE_IDS.interior[0], 800),
    blurb:
      'Furnished and semi-furnished flats, floors and kothis for families and working professionals, from NIT Faridabad to Sector 86.'
  },
  {
    key: 'office-space',
    label: 'Office Spaces',
    slug: '/office-spaces',
    icon: IconOfficeSpace,
    iconName: 'IconOfficeSpace',
    image: UNSPLASH(IMAGE_IDS.commercial[0], 800),
    blurb:
      'Fitted and bare-shell offices, coworking desks and IT suites near the Mathura Road and Badarpur border corridor.'
  }
]

export const CATEGORY_BY_KEY = CATEGORIES.reduce((acc, c) => {
  acc[c.key] = c
  return acc
}, {})

/* ------------------------------------------------------------------ */
/* Filter option sets                                                  */
/* ------------------------------------------------------------------ */

/** Rupee label with Indian digit grouping, e.g. 5000000 -> "Rs.50,00,000". */

/** Minimum budget ladder: Rs.5,000 -> Rs.50,00,000. */
export const MIN_PRICE_STEPS = [
  5000, 10000, 25000, 50000, 75000,
  100000, 200000, 300000, 500000, 750000,
  1000000, 1500000, 2000000, 2500000, 3000000,
  3500000, 4000000, 4500000, 5000000
].map((value) => ({ label: formatPrice(value), value }))

/** Maximum budget ladder: Rs.10,000 -> Rs.1,00,00,000. */
export const MAX_PRICE_STEPS = [
  10000, 25000, 50000, 75000,
  100000, 200000, 300000, 500000, 750000,
  1000000, 1500000, 2000000, 2500000, 3000000,
  3500000, 4000000, 4500000, 5000000, 6000000,
  7000000, 8000000, 9000000, 10000000
].map((value) => ({ label: formatPrice(value), value }))

/** Kept for filter panels that show a single budget ladder. */
export const PRICE_STEPS = MAX_PRICE_STEPS

/** Monthly rent ladder. */
export const RENT_PRICE_STEPS = [
  { label: '₹5,000', value: 5000 },
  { label: '₹8,000', value: 8000 },
  { label: '₹10,000', value: 10000 },
  { label: '₹12,000', value: 12000 },
  { label: '₹15,000', value: 15000 },
  { label: '₹20,000', value: 20000 },
  { label: '₹25,000', value: 25000 },
  { label: '₹30,000', value: 30000 },
  { label: '₹40,000', value: 40000 },
  { label: '₹50,000', value: 50000 },
  { label: '₹75,000', value: 75000 },
  { label: '₹1 Lac', value: 100000 },
  { label: '₹1.5 Lac', value: 150000 },
  { label: '₹2 Lac', value: 200000 },
  { label: '₹3 Lac', value: 300000 },
  { label: '₹5 Lac', value: 500000 }
]

export const SORTS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
  { label: 'Most viewed', value: 'popular' }
]

export const BEDROOM_OPTIONS = [
  { label: '1 BHK', value: 1 },
  { label: '2 BHK', value: 2 },
  { label: '3 BHK', value: 3 },
  { label: '4 BHK', value: 4 },
  { label: '5+ BHK', value: 5 }
]

export const STATUS_OPTIONS = [
  { label: 'New Launch', value: 'new-launch' },
  { label: 'Under Construction', value: 'under-construction' },
  { label: 'Ready to Move', value: 'ready-to-move' },
  { label: 'Resale', value: 'resale' },
  { label: 'Sold Out', value: 'sold-out' }
]

export const LISTING_TYPES = [
  { label: 'Buy', value: 'sale' },
  { label: 'Rent', value: 'rent' }
]

export const FURNISHING_OPTIONS = [
  { label: 'Unfurnished', value: 'unfurnished' },
  { label: 'Semi-furnished', value: 'semi-furnished' },
  { label: 'Furnished', value: 'furnished' }
]

export const PROPERTY_TYPES = [
  '2 BHK Apartment',
  '3 BHK Apartment',
  '4 BHK Apartment',
  'Independent Floor',
  'Builder Floor',
  'Independent House',
  'Villa',
  'Studio Apartment',
  'Residential Plot',
  'SCO Plot',
  'Industrial Plot',
  'Retail Shop',
  'Showroom',
  'Office Space',
  'Coworking Desk',
  'Warehouse'
]

export const AREA_UNITS = [
  { label: 'sq. ft.', value: 'sqft' },
  { label: 'sq. yd.', value: 'sqyd' },
  { label: 'acre', value: 'acre' }
]

/* ------------------------------------------------------------------ */
/* Amenities                                                           */
/* ------------------------------------------------------------------ */

/** ~35 amenity names → react-icons components. Keys match the seeded data. */
export const AMENITY_ICONS = {
  'Swimming Pool': MdPool,
  Gymnasium: MdFitnessCenter,
  'Covered Parking': MdLocalParking,
  'Visitor Parking': MdLocalParking,
  Lift: MdElevator,
  '24x7 Security': MdSecurity,
  'CCTV Surveillance': MdVideocam,
  'Gated Community': MdLock,
  'Landscaped Garden': MdPark,
  "Children's Play Area": MdChildFriendly,
  'Tennis Court': MdSportsTennis,
  'Basketball Court': MdSportsBasketball,
  'Jogging Track': MdDeck,
  'Barbecue Area': MdOutdoorGrill,
  'Power Backup': MdPowerSettingsNew,
  '24x7 Water Supply': MdWaterDrop,
  'Rainwater Harvesting': MdRecycling,
  'Solar Lighting': MdSolarPower,
  'High-speed Internet': MdWifi,
  'Club House': MdMeetingRoom,
  'Banquet Hall': MdMeetingRoom,
  Spa: MdSpa,
  'Yoga Deck': MdSelfImprovement,
  'Temple in Complex': FaGopuram,
  'Food Court': MdRestaurant,
  'Multipurpose Hall': MdTheaters,
  'Hospital Nearby': MdLocalHospital,
  'School Nearby': MdSchool,
  'Market Nearby': MdShoppingCart,
  'Metro Connectivity': MdDirectionsBus,
  'Laundry Service': MdLocalLaundryService,
  'Air Conditioning': MdAir,
  'Modular Kitchen': MdKitchen,
  Balcony: MdBalcony,
  'Wheelchair Access': MdAccessible,
  'Pet Friendly': MdPets,
  'EV Charging': MdEvStation,
  Housekeeping: MdCleaningServices,
  'Golf Putting Green': MdGolfCourse,
  'Fire Safety': MdBolt,
  'RERA Approved': MdVerifiedUser
}

/** Resolve an amenity to an icon, always returning something renderable. */
export const getAmenityIcon = (name) => AMENITY_ICONS[name] || MdCheckCircle

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  {
    label: 'Who We Are',
    to: '/about',
    children: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Team', to: '/about#team' },
      { label: 'Why Us', to: '/about#why-us' }
    ]
  },
  { label: 'Residential', to: '/residential' },
  { label: 'Commercial', to: '/commercial' },
  {
    label: 'Plots',
    to: '/plots',
    children: [
      { label: 'Plots in Faridabad', to: '/plots' },
      { label: 'SCO / Commercial Plots', to: '/plots?propertyType=SCO%20Plot' }
    ]
  },
  { label: 'Rent', to: '/rent' },
  { label: 'Office Spaces', to: '/office-spaces' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' }
]

export const FOOTER_LINKS = {
  quick: [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'All Properties', to: '/properties' },
    { label: 'Localities', to: '/localities' },
    { label: 'Insights & Guides', to: '/blog' },
    { label: 'Post an Enquiry', to: '/enquiry' },
    { label: 'Contact Us', to: '/contact' }
  ],
  types: [
    { label: 'Flats & Apartments', to: '/residential' },
    { label: 'Builder Floors', to: '/residential?propertyType=Builder%20Floor' },
    { label: 'Residential Plots', to: '/plots' },
    { label: 'SCO / Commercial Plots', to: '/plots?propertyType=SCO%20Plot' },
    { label: 'Shops & Showrooms', to: '/commercial' },
    { label: 'Office Spaces', to: '/office-spaces' },
    { label: 'Homes on Rent', to: '/rent' }
  ],
  localities: [
    { label: 'Greater Faridabad (Neharpar)', to: '/properties?locality=Greater%20Faridabad' },
    { label: 'Sector 88', to: '/properties?locality=Sector%2088' },
    { label: 'Sector 89', to: '/properties?locality=Sector%2089' },
    { label: 'Sector 75-80', to: '/properties?locality=Sector%2078' },
    { label: 'Old Faridabad', to: '/properties?locality=Old%20Faridabad' },
    { label: 'Ballabgarh', to: '/properties?locality=Ballabgarh' },
    { label: 'Sohna Road', to: '/properties?locality=Sohna%20Road' },
    { label: 'Surajkund', to: '/properties?locality=Surajkund' }
  ],
  legal: [
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms of Use', to: '/terms' }
  ]
}

/* ------------------------------------------------------------------ */
/* Faridabad localities                                                */
/* ------------------------------------------------------------------ */

export const FARIDABAD_LOCALITIES = [
  {
    name: 'Greater Faridabad (Neharpar)',
    slug: 'greater-faridabad',
    query: 'Greater Faridabad',
    image: UNSPLASH(IMAGE_IDS.residential[1], 900),
    blurb:
      'The city’s planned new belt across Sectors 75 to 89 — wide sectoral roads, group-housing societies and the FMDA master plan.'
  },
  {
    name: 'Sector 88 & 89',
    slug: 'sector-88-89',
    query: 'Sector 88',
    image: UNSPLASH(IMAGE_IDS.commercial[3], 900),
    blurb:
      'Our home ground. SCO commercial plots, ready 3 BHK societies and the busiest retail frontage in Neharpar.'
  },
  {
    name: 'Sector 75 - 80',
    slug: 'sector-75-80',
    query: 'Sector 78',
    image: UNSPLASH(IMAGE_IDS.residential[3], 900),
    blurb:
      'Established towers from BPTP, Puri and RPS with schools, hospitals and the Bypass Road link already in place.'
  },
  {
    name: 'Old Faridabad',
    slug: 'old-faridabad',
    query: 'Old Faridabad',
    image: UNSPLASH(IMAGE_IDS.residential[4], 900),
    blurb:
      'Independent kothis and builder floors in Sectors 14, 15, 16 and 21C — walkable markets and the Old Faridabad metro station.'
  },
  {
    name: 'Ballabgarh',
    slug: 'ballabgarh',
    query: 'Ballabgarh',
    image: UNSPLASH(IMAGE_IDS.residential[7], 900),
    blurb:
      'Value-priced floors and plots near the industrial belt, with metro connectivity up to Raja Nahar Singh station.'
  },
  {
    name: 'Sohna Road',
    slug: 'sohna-road',
    query: 'Sohna Road',
    image: UNSPLASH(IMAGE_IDS.plots[1], 900),
    blurb:
      'Faridabad’s Gurugram-facing corridor — plotted colonies and farmhouse land holding steady appreciation.'
  },
  {
    name: 'Surajkund',
    slug: 'surajkund',
    query: 'Surajkund',
    image: UNSPLASH(IMAGE_IDS.residential[5], 900),
    blurb:
      'Aravalli-side premium addresses near the Surajkund Mela ground, minutes from South Delhi via the Anangpur road.'
  },
  {
    name: 'Bypass Road',
    slug: 'bypass-road',
    query: 'Bypass Road',
    image: UNSPLASH(IMAGE_IDS.hero[3], 900),
    blurb:
      'The six-lane spine linking Sector 88 to Mathura Road — the fastest-moving investment stretch in the city.'
  }
]

/* ------------------------------------------------------------------ */
/* Why us / services                                                   */
/* ------------------------------------------------------------------ */

export const WHY_US = [
  {
    title: 'Verified, RERA-checked listings',
    icon: IconVerified,
    iconName: 'IconVerified',
    text: 'Every project we list is checked against the Haryana RERA register and the builder’s licence before it reaches you.'
  },
  {
    title: 'Faridabad-only expertise',
    icon: IconLocalExpert,
    iconName: 'IconLocalExpert',
    text: 'We work one city, sector by sector. We can tell you why Sector 86 rents better than Sector 82 without opening a file.'
  },
  {
    title: 'Site visits with transport',
    icon: IconSiteVisit,
    iconName: 'IconSiteVisit',
    text: 'Pick a Sunday and we will drive you across three to four shortlisted projects in a single visit, at no charge.'
  },
  {
    title: 'Home-loan assistance',
    icon: IconHomeLoan,
    iconName: 'IconHomeLoan',
    text: 'Empanelled with SBI, HDFC, LIC HFL and PNB Housing. We arrange sanction letters before you pay a token amount.'
  },
  {
    title: 'Legal and documentation',
    icon: IconLegal,
    iconName: 'IconLegal',
    text: 'Title search, mutation, builder-buyer agreement review and registry at the Faridabad tehsil, handled end to end.'
  },
  {
    title: 'Post-sale support',
    icon: IconSupport,
    iconName: 'IconSupport',
    text: 'Possession, electricity and water connections, society handover and tenant search — the relationship does not end at registry.'
  }
]

export const SERVICES = [
  {
    title: 'Buying a home',
    icon: FiHome,
    iconName: 'FiHome',
    text: 'Shortlisting, negotiation and paperwork for apartments, floors and independent houses across Faridabad.',
    to: '/residential'
  },
  {
    title: 'Selling your property',
    icon: FiTrendingUp,
    iconName: 'FiTrendingUp',
    text: 'Honest valuation based on recent registry rates, professional photos and a buyer list we already know.',
    to: '/enquiry'
  },
  {
    title: 'Renting and leasing',
    icon: FiKey,
    iconName: 'FiKey',
    text: 'Tenant screening, rent agreement drafting and police verification for owners; furnished options for tenants.',
    to: '/rent'
  },
  {
    title: 'Investment advisory',
    icon: FiClipboard,
    iconName: 'FiClipboard',
    text: 'Plot versus flat, Neharpar versus old sectors — a rental-yield and exit view before you commit capital.',
    to: '/plots'
  },
  {
    title: 'Site visits and inspection',
    icon: FiCamera,
    iconName: 'FiCamera',
    text: 'Guided project tours, construction-stage checks and comparison notes you can share with your family.',
    to: '/contact'
  },
  {
    title: 'NRI and outstation clients',
    icon: FiUsers,
    iconName: 'FiUsers',
    text: 'Video walkthroughs, power-of-attorney guidance and registry representation for buyers who cannot fly down.',
    to: '/contact'
  }
]

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const HERO_WORDS = ['Homes', 'Plots', 'Offices', 'Shops']

export const HERO_SLIDES = [
  {
    id: IMAGE_IDS.hero[0],
    image: UNSPLASH(IMAGE_IDS.hero[0], 1800),
    alt: 'Evening skyline of high-rise residential towers in the Delhi NCR region',
    caption: 'Greater Faridabad, Sector 88'
  },
  {
    id: IMAGE_IDS.hero[1],
    image: UNSPLASH(IMAGE_IDS.hero[1], 1800),
    alt: 'City skyline at dusk with residential and commercial buildings',
    caption: 'Neharpar growth corridor'
  },
  {
    id: IMAGE_IDS.hero[2],
    image: UNSPLASH(IMAGE_IDS.hero[2], 1800),
    alt: 'Aerial view of a planned urban sector with wide roads',
    caption: 'Bypass Road, Faridabad'
  },
  {
    id: IMAGE_IDS.hero[3],
    image: UNSPLASH(IMAGE_IDS.hero[3], 1800),
    alt: 'Modern apartment towers rising over a green landscaped podium',
    caption: 'Sector 78 - 80'
  },
  {
    id: IMAGE_IDS.hero[4],
    image: UNSPLASH(IMAGE_IDS.hero[4], 1800),
    alt: 'Wide arterial road cutting through a new city sector at sunrise',
    caption: 'Sohna Road corridor'
  }
]

export const TRUST_PILLS = [
  { label: 'RERA Registered', icon: MdVerifiedUser, iconName: 'MdVerifiedUser' },
  { label: '1200+ Families Settled', icon: FiUsers, iconName: 'FiUsers' },
  { label: '18+ Years in Faridabad', icon: FiMapPin, iconName: 'FiMapPin' }
]

/* ------------------------------------------------------------------ */
/* Misc site copy                                                      */
/* ------------------------------------------------------------------ */

export const BRAND = {
  name: 'Rama Kripa Estates',
  tagline: 'Blessings in Every Address',
  city: 'Faridabad',
  state: 'Haryana',
  established: 2007
}

export const INTERESTED_IN_OPTIONS = [
  'Buying a flat or apartment',
  'Buying a residential plot',
  'Buying an SCO / commercial plot',
  'Shop or showroom',
  'Office space',
  'Renting a home',
  'Selling my property',
  'Investment advice'
]

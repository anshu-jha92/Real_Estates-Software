/**
 * Rama Kripa Estates - database seed.
 *
 *   npm run seed
 *
 * Idempotent: wipes the collections it owns, then inserts the full Faridabad
 * showcase data set (properties, localities, developers, testimonials, blogs,
 * one admin user and the site settings document).
 */
import 'dotenv/config';
import connectDB, { disconnectDB } from '../config/db.js';
import Property from '../models/Property.js';
import Locality from '../models/Locality.js';
import Developer from '../models/Developer.js';
import Testimonial from '../models/Testimonial.js';
import TeamMember from '../models/TeamMember.js';
import Blog from '../models/Blog.js';
import Enquiry from '../models/Enquiry.js';
import User from '../models/User.js';
import Setting, { DEFAULT_SETTINGS } from '../models/Setting.js';
import slugify from '../utils/slugify.js';

/* ------------------------------------------------------------------ helpers */

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;
const avatar = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=200&h=200&q=80`;
const set = (...ids) => ids.map(img);
const mapUrl = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

const L = 100000; // 1 Lakh
const CR = 10000000; // 1 Crore

/* Approved image ids (spec section 10). H = hero/city, R = residential,
   I = interiors, C = commercial, P = plots, U = people. */
const H1 = '1486406146926-c627a92ad1ab';
const H2 = '1449824913935-59a10b8d2000';
const H3 = '1477959858617-67f85cf4f1df';
const H4 = '1470723710355-95304d8aece4';
const H5 = '1493246507139-91e8fad9978e';
const H6 = '1518005020951-eccb494ad742';

const R1 = '1512917774080-9991f1c4c750';
const R2 = '1568605114967-8130f3a36994';
const R3 = '1600596542815-ffad4c1539a9';
const R4 = '1600585154340-be6161a56a0c';
const R5 = '1580587771525-78b9dba3b914';
const R6 = '1613490493576-7fde63acd811';
const R7 = '1560448204-e02f11c3d0e2';
const R8 = '1502005229762-cf1b2da7c5d6';
const R9 = '1570129477492-45c003edd2be';

const I1 = '1600607687939-ce8a6c25118c';
const I2 = '1600566753086-00f18fb6b3ea';
const I3 = '1522708323590-d24dbb6b0267';
const I4 = '1554995207-c18c203602cb';
const I5 = '1600210492486-724fe5c67fb0';
const I6 = '1616486338812-3dadae4b4ace';

const C1 = '1497366216548-37526070297c';
const C2 = '1497366754035-f200968a6e72';
const C3 = '1524758631624-e2822e304c36';
const C4 = '1541888946425-d81bb19240f5';
const C5 = '1519389950473-47ba0277781c';
const C6 = '1497215728101-856f4ea42174';

const P1 = '1500382017468-9049fed747ef';
const P2 = '1416879595882-3373a0480b5b';
const P3 = '1464822759023-fed622ff2c3b';
const P4 = '1543965170-4c01a586684e';
const P5 = '1595246140625-573b715d11dc';

const U1 = '1507003211169-0a1dd7228f2d';
const U2 = '1494790108377-be9c29b29330';
const U3 = '1500648767791-00dcc994a43e';
const U4 = '1544005313-94ddf0286df2';
const U5 = '1472099645785-5658abf4ff4e';
const U6 = '1438761681033-6461ffad8d80';

/**
 * Fills in everything that can be derived: slug, thumbnail, map embed url and a
 * real SEO block built from the listing's own facts.
 */
let seq = 0;
const p = (data) => {
  const { location = {}, images = [], ...rest } = data;
  const place = [location.sector, location.locality, location.city || 'Faridabad']
    .filter(Boolean)
    .join(', ');

  return {
    ...rest,
    images,
    thumbnail: images[0] || '',
    slug: slugify(data.title),
    order: (seq += 1),
    location: {
      city: 'Faridabad',
      state: 'Haryana',
      ...location,
      mapEmbedUrl:
        location.lat && location.lng
          ? mapUrl(location.lat, location.lng)
          : `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed`,
    },
    seo: {
      metaTitle: `${data.title} | ${place} | Rama Kripa Estates`,
      metaDescription: (data.shortDescription || '').slice(0, 158),
      keywords: [
        data.title,
        data.propertyType,
        `${data.propertyType} in ${location.sector || location.locality}`,
        `property in ${location.locality || 'Faridabad'}`,
        data.developer,
        'Faridabad real estate',
      ].filter(Boolean),
    },
  };
};

/* ------------------------------------------------- properties: residential */

const residential = [
  p({
    title: 'BPTP Park Elite Premium, Sector 84',
    shortDescription:
      'Ready-to-move 3 and 4 BHK apartments facing the central green in Sector 84, five minutes from Bypass Road.',
    description:
      'BPTP Park Elite Premium sits in Sector 84 on the Neharpar side of Faridabad, about five minutes from the Bypass Road and roughly twenty-five minutes from the Badarpur border on NH-19. The towers are fully occupied, so you are buying into a finished, running society rather than a promise: lifts, DG backup, the sewage treatment plant and the club are all in daily use. This apartment faces the central green, takes cross ventilation from two sides and stays noticeably cooler through the Faridabad summer because no tower blocks its east face. Floors are vitrified throughout, the kitchen carries a granite counter with a chimney point, and both larger bedrooms have fitted wardrobes. Each flat gets a covered parking bay, with visitor parking near gate two. Sector 84 suits families with school-going children - Delhi Public School, Grand Columbus and Modern Vidya Niketan are all within a four kilometre radius, and the Sector 88 market with its supermarket, chemists and bank branches is a six minute drive. Escorts Mujesar metro station is about seven kilometres away and the widened Neharpar sector roads have cut the run to Old Faridabad to under twenty minutes. A sensible upgrade for a family moving out of a builder floor into gated security, a working club and dependable resale.',
    category: 'residential',
    propertyType: '3 BHK Apartment',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 72 * L,
    maxPrice: 92 * L,
    priceUnit: 'total',
    areaMin: 1450,
    areaMax: 1875,
    areaUnit: 'sqft',
    bedrooms: 3,
    bathrooms: 3,
    balconies: 3,
    floorsTotal: 14,
    parking: 1,
    furnishing: 'semi-furnished',
    configurations: [
      { label: '3 BHK', areaValue: 1450, areaUnit: 'sqft', price: 72 * L },
      { label: '3 BHK + Study', areaValue: 1660, areaUnit: 'sqft', price: 82 * L },
      { label: '4 BHK', areaValue: 1875, areaUnit: 'sqft', price: 92 * L },
    ],
    location: {
      locality: 'Neharpar',
      sector: 'Sector 84',
      pincode: '121002',
      address: 'BPTP Park Elite Premium, Sector 84, Greater Faridabad, Haryana',
      landmark: 'Opposite Sector 84 community park, off Bypass Road',
      lat: 28.4046,
      lng: 77.3372,
    },
    developer: 'BPTP',
    reraNumber: 'HRERA/FBD/2018/0084/BPTP',
    possession: 'Ready to move',
    launchDate: 'March 2013',
    amenities: [
      'Clubhouse',
      'Swimming Pool',
      'Gymnasium',
      'Landscaped Gardens',
      'Kids Play Area',
      'Power Backup',
      '24x7 Security',
      'CCTV Surveillance',
      'Covered Parking',
      'Rainwater Harvesting',
    ],
    highlights: [
      'Green-facing tower with two-side cross ventilation',
      'Occupation certificate received, society fully running',
      '5 minutes from Bypass Road, 20 minutes to Badarpur border',
      'Covered car park plus dedicated visitor bays',
    ],
    nearby: [
      { label: 'Sector 88 Market', distance: '3.2 km' },
      { label: 'Delhi Public School, Sector 81', distance: '2.6 km' },
      { label: 'Escorts Mujesar Metro Station', distance: '7.1 km' },
      { label: 'Sarvodaya Hospital, Sector 8', distance: '9.4 km' },
      { label: 'Bypass Road (Sector 84 crossing)', distance: '1.4 km' },
    ],
    images: set(R1, I1, R3, I3, H4, I5),
    badges: ['Ready to Move', 'Green Facing'],
    isFeatured: true,
    isTrending: true,
    views: 1840,
  }),

  p({
    title: 'Omaxe Heights, Sector 86',
    shortDescription:
      'Well-maintained 3 BHK apartments in Sector 86 with a full clubhouse, close to the Neharpar arterial road.',
    description:
      'Omaxe Heights is one of the more settled societies in Sector 86 and remains a favourite with families who want a Greater Faridabad address without paying new-launch premiums. The complex is spread over landscaped podiums with a proper clubhouse, a lap pool, badminton courts and a hall the residents welfare association rents out for functions. This 3 BHK is on a mid floor of a fourteen-storey tower, has a separate utility balcony off the kitchen and a servant toilet, and looks over the internal garden rather than the road, so evenings stay quiet. Maintenance is the reason buyers keep coming back here: the lifts, fire system and STP are under annual contract and the corridors are genuinely clean. Sector 86 is a five minute drive from the Sector 88 market and about ten minutes from Sector 81, where most of the newer schools have come up. The Faridabad Bypass Road is close enough for a quick exit towards Ballabgarh or the Delhi-Mathura NH-19 stretch, and autos to Bata Chowk run from the sector gate through the day. Good stock for a first apartment purchase in the 65 to 85 lakh band, and it rents easily to Escorts and Whirlpool staff working in the older industrial sectors.',
    category: 'residential',
    propertyType: '3 BHK Apartment',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 65 * L,
    maxPrice: 84 * L,
    priceUnit: 'total',
    areaMin: 1360,
    areaMax: 1690,
    areaUnit: 'sqft',
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    floorsTotal: 14,
    parking: 1,
    furnishing: 'unfurnished',
    configurations: [
      { label: '3 BHK', areaValue: 1360, areaUnit: 'sqft', price: 65 * L },
      { label: '3 BHK + Servant', areaValue: 1550, areaUnit: 'sqft', price: 74 * L },
      { label: '4 BHK', areaValue: 1690, areaUnit: 'sqft', price: 84 * L },
    ],
    location: {
      locality: 'Neharpar',
      sector: 'Sector 86',
      pincode: '121002',
      address: 'Omaxe Heights, Sector 86, Greater Faridabad, Haryana',
      landmark: 'Sector 86 main road, 5 minutes from Sector 88 market',
      lat: 28.4082,
      lng: 77.3312,
    },
    developer: 'Omaxe',
    reraNumber: 'HRERA/FBD/2017/0086/OMX',
    possession: 'Ready to move',
    launchDate: 'August 2011',
    amenities: [
      'Clubhouse',
      'Swimming Pool',
      'Gymnasium',
      'Badminton Court',
      'Community Hall',
      'Power Backup',
      '24x7 Security',
      'Landscaped Gardens',
      'Lift',
    ],
    highlights: [
      'Garden-facing flat away from road noise',
      'Servant room and utility balcony with the larger layouts',
      'Active RWA with annual maintenance contracts in place',
      'Strong rental demand from Escorts and Whirlpool staff',
    ],
    nearby: [
      { label: 'Sector 88 Market', distance: '2.4 km' },
      { label: 'Modern Vidya Niketan, Sector 87', distance: '1.8 km' },
      { label: 'Asian Hospital, Sector 21A', distance: '11.5 km' },
      { label: 'Bata Chowk Metro Station', distance: '9.8 km' },
    ],
    images: set(R2, I2, R4, I4, H2),
    badges: ['Ready to Move', 'Family Society'],
    isFeatured: true,
    isTrending: false,
    views: 1420,
  }),

  p({
    title: 'Puri Pratham, Sector 84',
    shortDescription:
      'Low-density 3 and 4 BHK residences in Sector 84 with deep balconies, servant quarters and a rooftop deck.',
    description:
      'Puri Pratham is the address people in Greater Faridabad point to when they want space without leaving the sector belt. The project keeps a low density - only four apartments per floor - so lobbies stay quiet and the lift wait is short even in the evening rush. Ceilings are higher than the Faridabad norm, the living and dining run in a single line out to a deep balcony, and every apartment includes a servant room with its own toilet at the rear. The kitchen is laid out for an Indian household, with a separate wet balcony and provision for a water purifier and a chimney. Common areas are the real strength here: a rooftop deck, an air-conditioned banquet, a properly equipped gym and a swimming pool that is maintained through winter as well. Sector 84 puts you two minutes from Bypass Road, so the Sector 88 market, the Neharpar schools and the NH-19 slip road towards Delhi are all easy runs. Buyers who already own in Sectors 15 and 16 of Old Faridabad often move here for the security and lift access while staying in the same city. Resale demand stays firm because there is very little comparable low-density stock anywhere in the sector.',
    category: 'residential',
    propertyType: '4 BHK Apartment',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 82 * L,
    maxPrice: 1 * CR,
    priceUnit: 'total',
    areaMin: 1725,
    areaMax: 2260,
    areaUnit: 'sqft',
    bedrooms: 3,
    bathrooms: 4,
    balconies: 3,
    floorsTotal: 12,
    parking: 2,
    furnishing: 'semi-furnished',
    configurations: [
      { label: '3 BHK + Servant', areaValue: 1725, areaUnit: 'sqft', price: 82 * L },
      { label: '4 BHK + Servant', areaValue: 2015, areaUnit: 'sqft', price: 92 * L },
      { label: '4 BHK Corner', areaValue: 2260, areaUnit: 'sqft', price: 1 * CR },
    ],
    location: {
      locality: 'Neharpar',
      sector: 'Sector 84',
      pincode: '121002',
      address: 'Puri Pratham, Sector 84, Greater Faridabad, Haryana',
      landmark: 'Sector 84 main road, near the Bypass Road crossing',
      lat: 28.4029,
      lng: 77.3348,
    },
    developer: 'Puri Constructions',
    reraNumber: 'HRERA/FBD/2019/0091/PURI',
    possession: 'Ready to move',
    launchDate: 'November 2014',
    amenities: [
      'Clubhouse',
      'Swimming Pool',
      'Gymnasium',
      'Community Hall',
      'Landscaped Gardens',
      'Kids Play Area',
      'Power Backup',
      '24x7 Security',
      'Covered Parking',
      'Fire Safety',
    ],
    highlights: [
      'Only four apartments per floor - genuinely low density',
      'Servant room with attached toilet in every layout',
      'Two covered parking bays with the 4 BHK plans',
      'Rooftop deck and air-conditioned banquet hall',
    ],
    nearby: [
      { label: 'Bypass Road', distance: '0.9 km' },
      { label: 'Sector 88 Market', distance: '3.6 km' },
      { label: 'Grand Columbus International School', distance: '3.1 km' },
      { label: 'Escorts Mujesar Metro Station', distance: '7.4 km' },
      { label: 'NH-19 Delhi-Mathura Road slip', distance: '5.2 km' },
    ],
    images: set(R3, I3, R5, I5, H1, I6),
    badges: ['Low Density', 'Premium'],
    isFeatured: true,
    isTrending: true,
    views: 2110,
  }),

  p({
    title: 'RPS Savana, Sector 88',
    shortDescription:
      'Established 3 BHK apartments in Sector 88, walking distance from the sector market and the Neharpar schools.',
    description:
      'RPS Savana is a completed township-style development in Sector 88 and one of the few Greater Faridabad societies where the market, schools and chemists are genuinely within walking distance. The campus is gated end to end with a single controlled entry, wide internal roads and enough surface parking that visitors are never a problem. This 3 BHK sits on a higher floor with an open view towards the Sector 89 green belt; both bedrooms and the living room open onto balconies, and the flat gets sun for most of the day through winter. Each core has two lifts, full DG backup on common areas and lights, and a piped water supply backed by a softening plant, which matters in this part of Faridabad where borewell water runs hard. RPS runs its own maintenance company on site, so complaints get logged and closed rather than passed around. Families like the location because a school run under fifteen minutes is realistic here: Delhi Public School Sector 81, Modern Vidya Niketan Sector 87 and the Neharpar playschools are all close. For investors, this is one of the more liquid resale addresses in Greater Faridabad, and rental yield on a furnished 3 BHK sits around three per cent.',
    category: 'residential',
    propertyType: '3 BHK Apartment',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 68 * L,
    maxPrice: 88 * L,
    priceUnit: 'total',
    areaMin: 1580,
    areaMax: 1980,
    areaUnit: 'sqft',
    bedrooms: 3,
    bathrooms: 3,
    balconies: 3,
    floorsTotal: 15,
    parking: 1,
    furnishing: 'unfurnished',
    configurations: [
      { label: '3 BHK', areaValue: 1580, areaUnit: 'sqft', price: 68 * L },
      { label: '3 BHK + Servant', areaValue: 1795, areaUnit: 'sqft', price: 78 * L },
      { label: '4 BHK', areaValue: 1980, areaUnit: 'sqft', price: 88 * L },
    ],
    location: {
      locality: 'Sector 88',
      sector: 'Sector 88',
      pincode: '121002',
      address: 'RPS Savana, Sector 88, Greater Faridabad, Haryana',
      landmark: 'Walking distance from Sector 88 market',
      lat: 28.4179,
      lng: 77.3298,
    },
    developer: 'RPS Group',
    reraNumber: 'HRERA/FBD/2018/0102/RPS',
    possession: 'Ready to move',
    launchDate: 'June 2012',
    amenities: [
      'Clubhouse',
      'Swimming Pool',
      'Gymnasium',
      'Water Softening Plant',
      'Power Backup',
      '24x7 Security',
      'Wide Internal Roads',
      'Kids Play Area',
      'Visitor Parking',
      'Sewage Treatment Plant',
    ],
    highlights: [
      'Sector 88 market and chemists within walking distance',
      'Water softening plant on site - no hard water complaints',
      'In-house maintenance team with a logged complaint system',
      'Higher floor with an open green-belt view',
    ],
    nearby: [
      { label: 'Sector 88 Market', distance: '0.6 km' },
      { label: 'Delhi Public School, Sector 81', distance: '3.4 km' },
      { label: 'Sector 89 Green Belt', distance: '1.1 km' },
      { label: 'Escorts Mujesar Metro Station', distance: '8.6 km' },
      { label: 'Bypass Road', distance: '2.2 km' },
    ],
    images: set(R4, I4, R6, I6, H3),
    badges: ['Ready to Move', 'Walk to Market'],
    isFeatured: true,
    isTrending: true,
    views: 1975,
  }),

  p({
    title: 'Adore Happy Homes Ecstasy, Sector 86',
    shortDescription:
      'Affordable-housing 2 BHK in Sector 86 - the lowest entry price into a gated Greater Faridabad society.',
    description:
      'Adore Happy Homes Ecstasy is an affordable-housing project in Sector 86 built under the Haryana Affordable Housing Policy, and it remains the cheapest legitimate way into a gated society in Greater Faridabad. This is a resale unit on a middle floor: a compact but well-planned 2 BHK with both bedrooms taking outside light, a functional kitchen with a utility balcony, and a living room that comfortably seats a family of four. The complex is fully occupied, with lift access in every block, DG backup for common areas, boundary security with CCTV at the gates and a small park with play equipment inside. Because the original allotment was policy-priced, the ticket size stays far below a comparable freehold flat, and resale is straightforward once the five-year lock-in from allotment is complete - we verify that date in writing before showing any unit here. Sector 86 is a five to seven minute drive from the Sector 88 market and about fifteen minutes from Bypass Road, with the Neharpar schools clustered in Sectors 81 and 87 nearby. Rama Kripa Estates handles a steady stream of these for first-time buyers and for parents buying a starter flat for a working son or daughter. Rental demand from young couples stays consistent through the year.',
    category: 'residential',
    propertyType: '2 BHK Apartment',
    listingType: 'sale',
    status: 'resale',
    price: 28 * L,
    maxPrice: 36 * L,
    priceUnit: 'total',
    areaMin: 645,
    areaMax: 780,
    areaUnit: 'sqft',
    bedrooms: 2,
    bathrooms: 2,
    balconies: 2,
    floorsTotal: 14,
    parking: 1,
    furnishing: 'unfurnished',
    configurations: [
      { label: '2 BHK', areaValue: 645, areaUnit: 'sqft', price: 28 * L },
      { label: '2 BHK Corner', areaValue: 780, areaUnit: 'sqft', price: 36 * L },
    ],
    location: {
      locality: 'Neharpar',
      sector: 'Sector 86',
      pincode: '121002',
      address: 'Adore Happy Homes Ecstasy, Sector 86, Greater Faridabad, Haryana',
      landmark: 'Near Sector 86 sector road, behind the community park',
      lat: 28.4101,
      lng: 77.3286,
    },
    developer: 'Adore',
    reraNumber: 'HRERA/FBD/2017/0057/ADORE',
    possession: 'Ready to move',
    launchDate: 'February 2016',
    amenities: [
      'Lift',
      'Power Backup',
      '24x7 Security',
      'CCTV Surveillance',
      'Kids Play Area',
      'Landscaped Gardens',
      'Visitor Parking',
      'Fire Safety',
    ],
    highlights: [
      'Lowest entry price for a gated society in Greater Faridabad',
      'Affordable Housing Policy project - lock-in verified before sale',
      'Both bedrooms take direct outside light',
      'Steady rental demand from young working couples',
    ],
    nearby: [
      { label: 'Sector 86 Community Park', distance: '0.3 km' },
      { label: 'Sector 88 Market', distance: '2.9 km' },
      { label: 'Modern Vidya Niketan, Sector 87', distance: '1.5 km' },
      { label: 'Bypass Road', distance: '4.1 km' },
    ],
    images: set(R5, I5, R7, I1),
    badges: ['Budget Friendly', 'Resale'],
    isFeatured: false,
    isTrending: true,
    views: 2460,
  }),
];

const residential2 = [
  p({
    title: 'Amolik Heights, Sector 86',
    shortDescription:
      'Value 2 and 3 BHK resale in Sector 86 with lift, power backup and gated security under 75 lakh.',
    description:
      'Amolik Heights sits on the inner sector road of Sector 86 and is a practical middle-budget option for buyers who find the 1 crore societies a stretch but do not want to give up a gated address. The flat on offer is a 2 BHK on the fifth floor with a south-east opening, which means morning light in both bedrooms and a living room that stays bright without turning into an oven in May. The layout is efficient with no wasted passage, and the kitchen has a separate utility balcony where a washing machine drain point is already provided. The society has two lifts per tower, power backup for lifts and common lighting, a boundary wall with a manned gate, and covered two-wheeler parking along with an allotted car bay. Because the towers are fully occupied and the RWA is functional, maintenance stays modest at around two rupees per square foot. Sector 86 is a straightforward drive to the Sector 88 market, the Neharpar schools and Bypass Road, and the sector bus stop on the main road links to Bata Chowk and Old Faridabad. This is the sort of listing we recommend to a young family making a first purchase, or to an investor who wants reliable occupancy rather than a headline yield.',
    category: 'residential',
    propertyType: '2 BHK Apartment',
    listingType: 'sale',
    status: 'resale',
    price: 58 * L,
    maxPrice: 74 * L,
    priceUnit: 'total',
    areaMin: 990,
    areaMax: 1230,
    areaUnit: 'sqft',
    bedrooms: 2,
    bathrooms: 2,
    balconies: 2,
    floorsTotal: 11,
    parking: 1,
    furnishing: 'unfurnished',
    configurations: [
      { label: '2 BHK', areaValue: 990, areaUnit: 'sqft', price: 58 * L },
      { label: '3 BHK', areaValue: 1230, areaUnit: 'sqft', price: 74 * L },
    ],
    location: {
      locality: 'Neharpar',
      sector: 'Sector 86',
      pincode: '121002',
      address: 'Amolik Heights, Sector 86, Greater Faridabad, Haryana',
      landmark: 'Sector 86 inner road, near the sector bus stop',
      lat: 28.4067,
      lng: 77.3261,
    },
    developer: 'Amolik',
    reraNumber: 'HRERA/FBD/2018/0073/AMK',
    possession: 'Ready to move',
    launchDate: 'September 2014',
    amenities: [
      'Lift',
      'Power Backup',
      '24x7 Security',
      'Covered Parking',
      'Kids Play Area',
      'Intercom',
      'Rainwater Harvesting',
      'Fire Safety',
    ],
    highlights: [
      'South-east opening - morning light in both bedrooms',
      'Maintenance held at roughly Rs 2 per sq ft',
      'Sector bus stop for Bata Chowk and Old Faridabad at the gate',
      'Washing machine point already provided in the utility balcony',
    ],
    nearby: [
      { label: 'Sector 86 Bus Stop', distance: '0.2 km' },
      { label: 'Sector 88 Market', distance: '3.1 km' },
      { label: 'Sarvodaya Hospital, Sector 8', distance: '10.2 km' },
      { label: 'Bypass Road', distance: '3.8 km' },
    ],
    images: set(R6, I6, R8, I2),
    badges: ['Value Buy', 'Resale'],
    isFeatured: false,
    isTrending: false,
    views: 980,
  }),

  p({
    title: 'SRS Pearl Floors, Sector 87',
    shortDescription:
      'Independent 3 BHK builder floors in Sector 87 with stilt parking and a private terrace on the top unit.',
    description:
      'SRS Pearl Floors offers independent floors in Sector 87 for buyers who want the privacy of a floor with the security of a planned colony. Each block has stilt parking below and three floors above, one family per level, so there is no shared lobby and no lift maintenance bill. The unit on offer is a 3 BHK with a wide front balcony over the internal street, a separate dining space, three toilets including one attached to the master, and a modular kitchen with a granite platform. The top floor carries an exclusive terrace, which in Faridabad is genuinely useful - winter sun, drying space and the occasional family function. Construction is conventional brick and RCC with proper external plaster, and this stock has aged noticeably better than the thin-wall floors that came up around the same time. Sector 87 is a settled pocket with parks, a temple and daily-needs shops inside the colony, and the sector road reaches Sector 88 market in under ten minutes. For families moving out of NIT Faridabad or Old Faridabad who want an independent unit with clean title and a registry-ready file, this is a straightforward transaction our team can close in three to four weeks including loan sanction.',
    category: 'residential',
    propertyType: 'Independent Floor',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 78 * L,
    maxPrice: 96 * L,
    priceUnit: 'total',
    areaMin: 1250,
    areaMax: 1450,
    areaUnit: 'sqft',
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    floorsTotal: 4,
    parking: 1,
    furnishing: 'unfurnished',
    configurations: [
      { label: '3 BHK First Floor', areaValue: 1250, areaUnit: 'sqft', price: 78 * L },
      { label: '3 BHK Second Floor', areaValue: 1250, areaUnit: 'sqft', price: 82 * L },
      { label: '3 BHK Top Floor + Terrace', areaValue: 1450, areaUnit: 'sqft', price: 96 * L },
    ],
    location: {
      locality: 'Neharpar',
      sector: 'Sector 87',
      pincode: '121002',
      address: 'SRS Pearl Floors, Sector 87, Greater Faridabad, Haryana',
      landmark: 'Near the Sector 87 park and temple',
      lat: 28.4131,
      lng: 77.3255,
    },
    developer: 'SRS',
    reraNumber: 'HRERA/FBD/2019/0118/SRS',
    possession: 'Ready to move',
    launchDate: 'January 2016',
    amenities: [
      'Covered Parking',
      'Power Backup',
      '24x7 Security',
      'Gated Community',
      'Landscaped Gardens',
      'Wide Internal Roads',
      'Vaastu Compliant',
    ],
    highlights: [
      'One family per floor - no shared lobby or lift bill',
      'Exclusive terrace with the top-floor unit',
      'Stilt parking below every block',
      'Registry-ready title, loan sanction typically inside three weeks',
    ],
    nearby: [
      { label: 'Sector 87 Park', distance: '0.3 km' },
      { label: 'Modern Vidya Niketan, Sector 87', distance: '0.9 km' },
      { label: 'Sector 88 Market', distance: '2.7 km' },
      { label: 'Bypass Road', distance: '3.4 km' },
    ],
    images: set(R7, I1, R9, I3, H5),
    badges: ['Independent Floor', 'Ready to Move'],
    isFeatured: true,
    isTrending: false,
    views: 1310,
  }),

  p({
    title: 'Piyush Heights, Sector 89',
    shortDescription:
      'Spacious 3 BHK apartments in Sector 89 with club, pool and a clear view over the Neharpar green belt.',
    description:
      'Piyush Heights occupies a corner site in Sector 89 where the Neharpar green belt runs behind the towers, so the rear-facing apartments keep an open outlook that later construction in the sector cannot block. The society is complete and occupied, with a clubhouse, swimming pool, gym, indoor games room and a landscaped central lawn residents use for morning walks and evening cricket. The apartment listed here is a 3 BHK on the ninth floor: living and dining in an L, a wide balcony off the living room, three bedrooms with wardrobes, an attached toilet with the master and a separate puja niche that most Faridabad families ask for. Water is a treated municipal and borewell mix through a softening plant, and the DG covers lifts, common areas and one light-plus-fan point in every flat during outages. Sector 89 is the quieter end of Greater Faridabad, roughly ten minutes from the Sector 88 market and twenty from Bypass Road, and the sector road towards Tigaon has shortened the drive to the eastern industrial belt. Buyers who work in Faridabad but want to avoid NIT congestion shortlist this project consistently, and it holds value because the surrounding sectors are already largely developed rather than open land.',
    category: 'residential',
    propertyType: '3 BHK Apartment',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 62 * L,
    maxPrice: 80 * L,
    priceUnit: 'total',
    areaMin: 1420,
    areaMax: 1760,
    areaUnit: 'sqft',
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    floorsTotal: 13,
    parking: 1,
    furnishing: 'unfurnished',
    configurations: [
      { label: '3 BHK', areaValue: 1420, areaUnit: 'sqft', price: 62 * L },
      { label: '3 BHK + Study', areaValue: 1585, areaUnit: 'sqft', price: 70 * L },
      { label: '4 BHK', areaValue: 1760, areaUnit: 'sqft', price: 80 * L },
    ],
    location: {
      locality: 'Sector 89',
      sector: 'Sector 89',
      pincode: '121002',
      address: 'Piyush Heights, Sector 89, Greater Faridabad, Haryana',
      landmark: 'Backing the Sector 89 green belt',
      lat: 28.4252,
      lng: 77.3341,
    },
    developer: 'Piyush Group',
    reraNumber: 'HRERA/FBD/2018/0064/PIYUSH',
    possession: 'Ready to move',
    launchDate: 'April 2013',
    amenities: [
      'Clubhouse',
      'Swimming Pool',
      'Gymnasium',
      'Indoor Games',
      'Landscaped Gardens',
      'Power Backup',
      '24x7 Security',
      'Water Softening Plant',
      'Jogging Track',
    ],
    highlights: [
      'Rear apartments face the protected green belt',
      'Separate puja niche in the standard layout',
      'DG point inside every flat, not just common areas',
      'Quieter sector, ten minutes from Sector 88 market',
    ],
    nearby: [
      { label: 'Sector 89 Green Belt', distance: '0.2 km' },
      { label: 'Sector 88 Market', distance: '2.1 km' },
      { label: 'Tigaon Road', distance: '4.6 km' },
      { label: 'Escorts Mujesar Metro Station', distance: '9.3 km' },
      { label: 'Delhi Public School, Sector 81', distance: '4.2 km' },
    ],
    images: set(R8, I2, R1, I4, H6),
    badges: ['Green Belt View', 'Club Facilities'],
    isFeatured: true,
    isTrending: false,
    views: 1655,
  }),

  p({
    title: 'Ansal Highland Park, Sector 77',
    shortDescription:
      'Under-construction 4 BHK independent floors in Sector 77 with a private lift and December 2026 handover.',
    description:
      'Ansal Highland Park in Sector 77 is one of the few under-construction independent floor projects left in the western Neharpar sectors, and it is aimed squarely at families who want a new build rather than a decade-old resale. Each block is stilt plus four floors with a private lift, one unit per level and a covered parking bay per family. The 4 BHK layout runs a little over two thousand square feet, with a drawing-dining opening to a front balcony, four bedrooms of which two have attached toilets, a servant room with its own toilet at the rear and a modular kitchen with a dedicated store. Specification is a clear step above the sector average: vitrified flooring in the living areas, laminated wooden flooring in the master bedroom, UPVC windows and a video door phone at the entrance. The structure is complete and finishing is underway, with handover scheduled for December 2026 and a construction-linked payment plan available through the major banks. Sector 77 connects quickly to Bypass Road and onward to NH-19, and Sectors 75 to 80 already have functioning markets, parks and schools, so buyers are not moving into an empty pocket. Bookings at this stage still carry a pre-completion price advantage of roughly eight to ten per cent.',
    category: 'residential',
    propertyType: 'Builder Floor',
    listingType: 'sale',
    status: 'under-construction',
    price: 88 * L,
    maxPrice: 1 * CR,
    priceUnit: 'total',
    areaMin: 2100,
    areaMax: 2450,
    areaUnit: 'sqft',
    bedrooms: 4,
    bathrooms: 4,
    balconies: 3,
    floorsTotal: 5,
    parking: 1,
    furnishing: 'unfurnished',
    configurations: [
      { label: '4 BHK First Floor', areaValue: 2100, areaUnit: 'sqft', price: 88 * L },
      { label: '4 BHK Second Floor', areaValue: 2100, areaUnit: 'sqft', price: 92 * L },
      { label: '4 BHK Top Floor + Terrace', areaValue: 2450, areaUnit: 'sqft', price: 1 * CR },
    ],
    location: {
      locality: 'Neharpar',
      sector: 'Sector 77',
      pincode: '121004',
      address: 'Ansal Highland Park, Sector 77, Greater Faridabad, Haryana',
      landmark: 'Off the Sector 77-78 dividing road',
      lat: 28.4361,
      lng: 77.3241,
    },
    developer: 'Ansal',
    reraNumber: 'HRERA/FBD/2022/0031/ANSAL',
    possession: 'December 2026',
    launchDate: 'February 2023',
    amenities: [
      'Lift',
      'Covered Parking',
      'Power Backup',
      '24x7 Security',
      'CCTV Surveillance',
      'Gated Community',
      'Landscaped Gardens',
      'Intercom',
      'Wide Internal Roads',
    ],
    highlights: [
      'Private lift and one family per floor',
      'Construction-linked payment plan with bank tie-ups',
      'UPVC windows and video door phone as standard',
      'Structure complete, finishing underway',
      'Pre-completion pricing still available',
    ],
    nearby: [
      { label: 'Sector 78 Market', distance: '1.3 km' },
      { label: 'Bypass Road', distance: '2.8 km' },
      { label: 'Aravali International School, Sector 76', distance: '2.2 km' },
      { label: 'NH-19 Delhi-Mathura Road', distance: '6.4 km' },
    ],
    images: set(R9, I3, R2, I5, H2),
    badges: ['New Construction', 'Dec 2026 Possession'],
    isFeatured: true,
    isTrending: true,
    views: 1520,
  }),

  p({
    title: '4 BHK Independent House in Sector 15, Old Faridabad',
    shortDescription:
      'Freehold 300 sq. yd. kothi in Sector 15 Old Faridabad on a 40-foot road, walking distance from the market.',
    description:
      'This is a proper Old Faridabad kothi - a 300 square yard freehold plot in Sector 15 with a double-storey house built across it, standing on a forty-foot internal road two streets from the sector market. The ground floor has a drawing room, a separate dining area, two bedrooms with attached toilets, a large kitchen with a store and a covered rear verandah opening to a small garden. The first floor repeats the plan with two more bedrooms, a family lounge and a front terrace that catches the winter sun. Construction is solid nine-inch brickwork from the HUDA era and has been maintained since: the roof was re-treated three years ago, wiring runs on modern MCB boards, and both the overhead and underground tanks were replaced. Two cars park inside the gate, with street parking that is never contested. Sector 15 remains one of the most convenient addresses in the city - the Sector 15 market, banks and chemists are minutes away, Old Faridabad metro station is under three kilometres, Mathura Road is a five minute drive and Badkhal Lake is close enough for an evening walk. Buyers looking at this usually want land ownership rather than an apartment share, and the plot alone justifies the price at current Sector 15 circle rates.',
    category: 'residential',
    propertyType: 'Independent House',
    listingType: 'sale',
    status: 'resale',
    price: 90 * L,
    maxPrice: null,
    priceUnit: 'total',
    areaMin: 2700,
    areaMax: 2700,
    areaUnit: 'sqft',
    bedrooms: 4,
    bathrooms: 4,
    balconies: 2,
    floorsTotal: 2,
    parking: 2,
    furnishing: 'semi-furnished',
    configurations: [
      { label: 'Ground Floor - 2 BHK with drawing and dining', areaValue: 1350, areaUnit: 'sqft', price: 90 * L },
      { label: 'First Floor - 2 BHK with lounge and terrace', areaValue: 1350, areaUnit: 'sqft', priceOnRequest: true },
    ],
    location: {
      locality: 'Old Faridabad',
      sector: 'Sector 15',
      pincode: '121007',
      address: 'Sector 15, Old Faridabad, Haryana',
      landmark: 'Two streets from Sector 15 market, on a 40 ft road',
      lat: 28.4089,
      lng: 77.3178,
    },
    developer: 'Independent',
    reraNumber: '',
    possession: 'Immediate',
    launchDate: '',
    amenities: [
      'Covered Parking',
      'Power Backup',
      'Rainwater Harvesting',
      'Vaastu Compliant',
      'Wide Internal Roads',
      'Landscaped Gardens',
      'Intercom',
    ],
    highlights: [
      '300 sq. yd. freehold plot - land ownership, not an apartment share',
      'Located on a 40-foot internal road with easy parking',
      'Roof re-treated and wiring upgraded within the last three years',
      'Walking distance from Sector 15 market and banks',
      'Old Faridabad metro station under 3 km',
    ],
    nearby: [
      { label: 'Sector 15 Market', distance: '0.7 km' },
      { label: 'Old Faridabad Metro Station', distance: '2.6 km' },
      { label: 'Mathura Road (NH-19)', distance: '2.9 km' },
      { label: 'Badkhal Lake', distance: '4.8 km' },
      { label: 'Sarvodaya Hospital, Sector 8', distance: '3.5 km' },
    ],
    images: set(R3, I6, R5, I2, H3),
    badges: ['Freehold', 'Land Ownership'],
    isFeatured: false,
    isTrending: true,
    views: 2280,
  }),
];

/* -------------------------------------------------- properties: commercial */

const commercial = [
  p({
    title: 'Retail Shop at Omaxe World Street, Sector 79',
    shortDescription:
      'Ground-floor retail shop on the main pedestrian street of Omaxe World Street, Sector 79, with running footfall.',
    description:
      'Omaxe World Street on the Sector 79 stretch of Greater Faridabad is the most active high-street format in this half of the city, and this shop sits on the ground floor of the main pedestrian spine where footfall is already established rather than promised. The unit has a 12-foot frontage with a full glass shopfront, a rear shutter for stock movement, a mezzanine-height ceiling that allows a loft, and its own toilet - a detail most Faridabad shops of this size skip. Power is a three-phase connection with DG backup on the common areas, and the complex runs air-conditioned corridors, escalators between floors, lift access, fire sprinklers and manned security through the night. The surrounding catchment is what makes the numbers work: Sectors 76 to 89 are largely occupied residential now, and the street draws families from Neharpar through the evening, particularly on weekends. Existing tenants include food and beverage brands, salons, mobile retail and a gym, so a new entrant is not opening in isolation. Bypass Road is four minutes away and NH-19 about fifteen. Suitable for an owner-operator opening a store, or for an investor buying a leased unit at a yield of roughly six per cent.',
    category: 'commercial',
    propertyType: 'Retail Shop',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 48 * L,
    maxPrice: 82 * L,
    priceUnit: 'total',
    areaMin: 320,
    areaMax: 620,
    areaUnit: 'sqft',
    bedrooms: 0,
    bathrooms: 1,
    floorsTotal: 3,
    parking: 1,
    furnishing: 'unfurnished',
    configurations: [
      { label: 'Ground Floor Shop', areaValue: 320, areaUnit: 'sqft', price: 48 * L },
      { label: 'Ground Floor Corner Shop', areaValue: 450, areaUnit: 'sqft', price: 65 * L },
      { label: 'First Floor Retail Unit', areaValue: 620, areaUnit: 'sqft', price: 82 * L },
    ],
    location: {
      locality: 'Neharpar',
      sector: 'Sector 79',
      pincode: '121004',
      address: 'Omaxe World Street, Sector 79, Greater Faridabad, Haryana',
      landmark: 'Main pedestrian street, opposite the central plaza',
      lat: 28.4218,
      lng: 77.3358,
    },
    developer: 'Omaxe',
    reraNumber: 'HRERA/FBD/2018/0079/OMXC',
    possession: 'Ready to move',
    launchDate: 'October 2012',
    amenities: [
      'Escalators',
      'Lift',
      'Central Air Conditioning',
      'Power Backup',
      '24x7 Security',
      'CCTV Surveillance',
      'Fire Safety',
      'Ample Parking',
      'Food Court',
    ],
    highlights: [
      '12-foot glass frontage on the main pedestrian spine',
      'Attached toilet and rear shutter for stock movement',
      'Loft-height ceiling usable as a mezzanine',
      'Established evening and weekend footfall from Neharpar',
      'Approximately 6 per cent rental yield on a leased unit',
    ],
    nearby: [
      { label: 'Sector 79 Residential Belt', distance: '0.4 km' },
      { label: 'Bypass Road', distance: '2.3 km' },
      { label: 'Sector 88 Market', distance: '4.9 km' },
      { label: 'NH-19 Delhi-Mathura Road', distance: '7.2 km' },
    ],
    images: set(C1, C3, C5, C2, H5),
    badges: ['High Street', 'Running Footfall'],
    isFeatured: true,
    isTrending: true,
    views: 2540,
  }),

  p({
    title: 'Piyush Business Park Retail Shop, Sector 88',
    shortDescription:
      'New-launch double-height retail shop in Sector 88, directly opposite the sector market catchment.',
    description:
      'This retail unit is part of a new commercial block coming up in Sector 88, positioned to catch the daily traffic already moving to and from the established Sector 88 market. The shop is double-height at the front, which allows a mezzanine of nearly the same footprint again, effectively giving a buyer two usable levels for the price of one carpet area. The frontage faces the 24-metre sector road, so signage is visible from both approach directions, and there is dedicated parking in front plus basement parking for staff. The building specification covers a passenger lift, a service lift, DG backup, fire sprinklers, a fire alarm panel and a manned reception. Sector 88 is the natural retail centre for the Neharpar sectors: the residential catchment across Sectors 85 to 89 is dense and largely occupied, and the SCO belt here rents faster than anywhere else in Greater Faridabad. Rama Kripa Estates has closed several units in this pocket over the last two years, and the pattern is consistent - clinics, coaching centres, banks and food brands take the ground and first floors quickly. Construction-linked payments are available, with possession scheduled about eighteen months out and a soft-launch price on the first tranche of units.',
    category: 'commercial',
    propertyType: 'Retail Shop',
    listingType: 'sale',
    status: 'new-launch',
    price: 38 * L,
    maxPrice: 68 * L,
    priceUnit: 'total',
    areaMin: 280,
    areaMax: 560,
    areaUnit: 'sqft',
    bedrooms: 0,
    bathrooms: 1,
    floorsTotal: 4,
    parking: 1,
    furnishing: 'unfurnished',
    configurations: [
      { label: 'Ground Floor Shop', areaValue: 280, areaUnit: 'sqft', price: 38 * L },
      { label: 'Ground Floor with Mezzanine', areaValue: 420, areaUnit: 'sqft', price: 54 * L },
      { label: 'Corner Unit with Mezzanine', areaValue: 560, areaUnit: 'sqft', price: 68 * L },
    ],
    location: {
      locality: 'Sector 88',
      sector: 'Sector 88',
      pincode: '121002',
      address: 'Sector 88 commercial belt, Greater Faridabad, Haryana',
      landmark: 'Facing the 24 m sector road, opposite Sector 88 market',
      lat: 28.4162,
      lng: 77.3274,
    },
    developer: 'Piyush Group',
    reraNumber: 'HRERA/FBD/2024/0012/PIYUSHC',
    possession: 'March 2027',
    launchDate: 'January 2025',
    amenities: [
      'Lift',
      'Service Lift',
      'Power Backup',
      'Fire Safety',
      'CCTV Surveillance',
      '24x7 Security',
      'Ample Parking',
      'Wide Internal Roads',
    ],
    highlights: [
      'Double-height front allowing a full mezzanine',
      'Frontage on the 24-metre sector road with two-way visibility',
      'Basement parking for staff plus front customer parking',
      'Soft-launch pricing on the first tranche of units',
    ],
    nearby: [
      { label: 'Sector 88 Market', distance: '0.3 km' },
      { label: 'RPS Savana residential campus', distance: '0.8 km' },
      { label: 'Sector 89 Green Belt', distance: '2.4 km' },
      { label: 'Bypass Road', distance: '2.6 km' },
    ],
    images: set(C2, C4, C6, C1),
    badges: ['New Launch', 'Mezzanine Included'],
    isFeatured: true,
    isTrending: false,
    views: 1190,
  }),

  p({
    title: 'Highway-Facing Showroom on Mathura Road, Sector 37',
    shortDescription:
      'Two-level showroom with 30-foot frontage on the Delhi-Mathura NH-19 service road at Sector 37.',
    description:
      'A showroom on the Mathura Road service lane at Sector 37 is a different asset class from a sector-market shop: the customer here arrives by car from the highway, so frontage and parking decide the rent. This unit has a thirty-foot glass frontage facing the NH-19 service road, a clear ground floor of around 1,800 square feet with no internal columns breaking the display area, and a first floor of similar size reached by an internal staircase and a separate rear entry. There is a loading bay behind, three-phase power with a 45 kVA DG, and hard-paved parking for eight to ten cars in front. The stretch already carries car dealerships, furniture and tile showrooms, branded electronics outlets and a bank, which is exactly the co-tenancy an incoming brand looks for. Sector 37 sits between Old Faridabad and the Ballabgarh side, with the Bypass Road interchange minutes away and the Delhi border about twenty-five minutes on a clear run. The property is on resale from an owner exiting the market, the title is clean and commercial-use permissions are in order, and the current tenant is on a lease that can either be continued or vacated on three months notice.',
    category: 'commercial',
    propertyType: 'Showroom',
    listingType: 'sale',
    status: 'resale',
    price: 58 * L,
    maxPrice: 95 * L,
    priceUnit: 'total',
    areaMin: 1800,
    areaMax: 3600,
    areaUnit: 'sqft',
    bedrooms: 0,
    bathrooms: 2,
    floorsTotal: 2,
    parking: 8,
    furnishing: 'unfurnished',
    configurations: [
      { label: 'Ground Floor Showroom', areaValue: 1800, areaUnit: 'sqft', price: 58 * L },
      { label: 'Ground + First Floor', areaValue: 3600, areaUnit: 'sqft', price: 95 * L },
    ],
    location: {
      locality: 'Mathura Road',
      sector: 'Sector 37',
      pincode: '121003',
      address: 'NH-19 service road, Sector 37, Faridabad, Haryana',
      landmark: 'Delhi-Mathura Road service lane, near the Sector 37 crossing',
      lat: 28.4457,
      lng: 77.2985,
    },
    developer: 'Independent',
    reraNumber: '',
    possession: 'On agreement',
    launchDate: '',
    amenities: [
      'Ample Parking',
      'Power Backup',
      'Loading Bay',
      'CCTV Surveillance',
      '24x7 Security',
      'Fire Safety',
      'Wide Internal Roads',
    ],
    highlights: [
      '30-foot frontage directly on the NH-19 service road',
      'Column-free ground floor display area',
      'Parking for eight to ten cars in front, loading bay behind',
      'Existing tenant can be continued or vacated on notice',
      'Clean title with commercial-use permissions in order',
    ],
    nearby: [
      { label: 'NH-19 Delhi-Mathura Road', distance: '0.1 km' },
      { label: 'Bypass Road interchange', distance: '3.1 km' },
      { label: 'Old Faridabad Metro Station', distance: '5.4 km' },
      { label: 'Badkhal Lake', distance: '3.8 km' },
    ],
    images: set(C3, C5, C1, C6, H1),
    badges: ['Highway Frontage', 'Leased Asset'],
    isFeatured: true,
    isTrending: true,
    views: 1870,
  }),

  p({
    title: 'Industrial Warehouse on Tigaon Road, Faridabad',
    shortDescription:
      '12,000 sq. ft. warehouse on Tigaon Road with 28-foot clear height, truck access and a dedicated transformer.',
    description:
      'A purpose-built warehouse on Tigaon Road, positioned for businesses supplying the Faridabad industrial belt and the eastern NCR distribution routes. The shed covers roughly 12,000 square feet under a single pre-engineered steel roof with a 28-foot clear height at the eaves, so racking can go four levels without compromise. The floor is a power-trowelled concrete slab rated for pallet-truck movement, there are two loading docks at truck-bed height plus a ground-level ramp, and the compound allows a full trailer to turn without reversing onto the road. Power is a dedicated 100 kVA transformer with a separate meter, and there is an office block of about 600 square feet with a toilet and a pantry at the front, plus quarters for a watchman. Tigaon Road connects to the Bypass Road and onward to NH-19 and the Kundli-Manesar-Palwal Expressway, which is why third-party logistics operators keep taking space along this corridor. The plot is on clear title with change-of-land-use in place - a point worth checking carefully anywhere on this road, and something our team verifies at the tehsil before we list. Available for outright purchase or on a long lease at a mutually agreed rent.',
    category: 'commercial',
    propertyType: 'Warehouse',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 75 * L,
    maxPrice: null,
    priceUnit: 'total',
    areaMin: 12000,
    areaMax: 12000,
    areaUnit: 'sqft',
    bedrooms: 0,
    bathrooms: 2,
    floorsTotal: 1,
    parking: 6,
    furnishing: 'unfurnished',
    configurations: [
      { label: 'Warehouse Shed', areaValue: 12000, areaUnit: 'sqft', price: 75 * L },
      { label: 'Front Office Block', areaValue: 600, areaUnit: 'sqft', priceOnRequest: true },
    ],
    location: {
      locality: 'Tigaon Road',
      sector: 'Dayalpur',
      pincode: '121101',
      address: 'Tigaon Road, near Dayalpur, Faridabad, Haryana',
      landmark: 'On Tigaon Road, 4 km from the Sector 89 crossing',
      lat: 28.4093,
      lng: 77.339,
    },
    developer: 'Independent',
    reraNumber: '',
    possession: 'Immediate',
    launchDate: '',
    amenities: [
      'Loading Bay',
      'Power Backup',
      '24x7 Security',
      'CCTV Surveillance',
      'Fire Safety',
      'Ample Parking',
      'Wide Internal Roads',
    ],
    highlights: [
      '28-foot clear height suitable for four-level racking',
      'Two dock-height loading bays plus a ground-level ramp',
      'Dedicated 100 kVA transformer on a separate meter',
      'Trailer turning radius inside the compound',
      'Change of land use verified at the tehsil',
    ],
    nearby: [
      { label: 'Sector 89 crossing', distance: '4.2 km' },
      { label: 'Bypass Road', distance: '6.8 km' },
      { label: 'NH-19 Delhi-Mathura Road', distance: '11.4 km' },
      { label: 'KMP Expressway approach', distance: '18.0 km' },
    ],
    images: set(C4, C6, C2, P4),
    badges: ['Industrial', 'Immediate Possession'],
    isFeatured: false,
    isTrending: false,
    views: 760,
  }),
];

/* ------------------------------------------------------- properties: plots */

const plots = [
  p({
    title: 'BPTP Parklands Residential Plot, Sector 76',
    shortDescription:
      'Licensed residential plots of 75 to 88 sq. yd. in BPTP Parklands, Sector 76, on 18 and 24 metre internal roads.',
    description:
      'BPTP Parklands is the plotted township that anchors Sectors 75 to 77 in Greater Faridabad, and plots here remain the most straightforward land buy in the city for anyone who wants to build their own house. Internal roads are laid at 18 and 24 metres, sewer and storm water lines are in the ground, street lighting works, and the colony is gated with boundary security - so a buyer is not waiting on infrastructure that may or may not arrive. The plots on offer run from 75 to 88 square yards, with a mix of park-facing, corner and standard positions; the park-facing ones command a premium of roughly ten per cent and are worth it if you plan a front lawn. Building bye-laws allow stilt plus four floors under the current Haryana norms, which is why several owners here build four independent floors and retain one. The location works: Bypass Road is a five minute drive, the Sector 78 and 81 markets are close, and the school cluster in Sectors 76 and 81 keeps demand steady from families rather than only investors. Title is licensed and conveyance-deed ready, and we walk every buyer through the demarcation on site before token.',
    category: 'plots',
    propertyType: 'Residential Plot',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 92000,
    maxPrice: 112000,
    priceUnit: 'per-sqyd',
    areaMin: 75,
    areaMax: 88,
    areaUnit: 'sqyd',
    bedrooms: 0,
    bathrooms: 0,
    floorsTotal: 0,
    parking: 0,
    furnishing: 'unfurnished',
    configurations: [
      { label: '75 sq. yd. Standard Plot', areaValue: 75, areaUnit: 'sqyd', price: 69 * L },
      { label: '80 sq. yd. Park Facing', areaValue: 80, areaUnit: 'sqyd', price: 80 * L },
      { label: '88 sq. yd. Corner Plot', areaValue: 88, areaUnit: 'sqyd', price: 98 * L },
    ],
    location: {
      locality: 'Neharpar',
      sector: 'Sector 76',
      pincode: '121004',
      address: 'BPTP Parklands, Sector 76, Greater Faridabad, Haryana',
      landmark: 'Inside the gated Parklands plotted colony',
      lat: 28.4304,
      lng: 77.3195,
    },
    developer: 'BPTP',
    reraNumber: 'HRERA/FBD/2017/0076/BPTPL',
    possession: 'Immediate',
    launchDate: 'July 2010',
    amenities: [
      'Gated Community',
      'Wide Internal Roads',
      '24x7 Security',
      'Landscaped Gardens',
      'Sewage Treatment Plant',
      'Rainwater Harvesting',
      'Kids Play Area',
    ],
    highlights: [
      '18 and 24 metre internal roads already laid',
      'Sewer, storm water and street lighting in place',
      'Stilt plus four floors permitted under current bye-laws',
      'Licensed colony with conveyance-deed-ready title',
      'Park-facing and corner positions available',
    ],
    nearby: [
      { label: 'Sector 78 Market', distance: '1.6 km' },
      { label: 'Bypass Road', distance: '3.4 km' },
      { label: 'Aravali International School, Sector 76', distance: '1.1 km' },
      { label: 'Sector 81 school cluster', distance: '4.3 km' },
    ],
    images: set(P1, P3, P5, H4),
    badges: ['Licensed Colony', 'Build Your Own'],
    isFeatured: true,
    isTrending: true,
    views: 2320,
  }),

  p({
    title: 'HUDA Freehold Plot in Sector 15, Old Faridabad',
    shortDescription:
      '80 sq. yd. freehold HUDA plot in Sector 15 Old Faridabad, fully developed pocket with immediate registry.',
    description:
      'An 80 square yard freehold plot in Sector 15, one of the original HUDA sectors of Old Faridabad and still among the most stable addresses in the city. Everything around this plot is already built and lived in: neighbours on both sides, a 30-foot road in front, functioning sewer and water connections at the boundary, and street lighting maintained by the municipal corporation. There is no waiting for a colony to fill up, which is the practical difference between an old HUDA sector and a new licensed one. The plot is rectangular with a north-east opening, which suits a conventional house plan with the entrance and kitchen positioned the way most families here prefer. Current bye-laws for HUDA residential plots of this size allow basement plus stilt plus four floors with the applicable ground coverage, so it works either as a family home or as four floors for sale. Location is the real value: the Sector 15 market, Sector 16 shopping centre, banks, schools and clinics are all within a couple of kilometres, Old Faridabad metro station is a short drive, and Mathura Road gives a clean run to Delhi. Registry can be completed within a week as the title is single-owner and unencumbered.',
    category: 'plots',
    propertyType: 'Residential Plot',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 115000,
    maxPrice: null,
    priceUnit: 'per-sqyd',
    areaMin: 80,
    areaMax: 80,
    areaUnit: 'sqyd',
    bedrooms: 0,
    bathrooms: 0,
    floorsTotal: 0,
    parking: 0,
    furnishing: 'unfurnished',
    configurations: [
      { label: '80 sq. yd. Freehold Plot', areaValue: 80, areaUnit: 'sqyd', price: 92 * L },
    ],
    location: {
      locality: 'Old Faridabad',
      sector: 'Sector 15',
      pincode: '121007',
      address: 'Sector 15, Old Faridabad, Haryana',
      landmark: '30-foot road, walking distance from Sector 15 market',
      lat: 28.4103,
      lng: 77.3162,
    },
    developer: 'HUDA',
    reraNumber: '',
    possession: 'Immediate',
    launchDate: '',
    amenities: [
      'Wide Internal Roads',
      'Sewage Treatment Plant',
      'Rainwater Harvesting',
      'Vaastu Compliant',
      'Landscaped Gardens',
      'Kids Play Area',
      'Ample Parking',
    ],
    highlights: [
      'Fully developed HUDA sector - no waiting for infrastructure',
      'North-east opening on a 30-foot road',
      'Basement plus stilt plus four floors permitted',
      'Single-owner, unencumbered title - registry inside a week',
      'Old Faridabad metro station a short drive away',
    ],
    nearby: [
      { label: 'Sector 15 Market', distance: '0.5 km' },
      { label: 'Sector 16 Shopping Centre', distance: '1.4 km' },
      { label: 'Old Faridabad Metro Station', distance: '2.8 km' },
      { label: 'Mathura Road (NH-19)', distance: '3.0 km' },
      { label: 'Badkhal Lake', distance: '5.1 km' },
    ],
    images: set(P2, P4, P1, H3),
    badges: ['Freehold', 'Registry Ready'],
    isFeatured: true,
    isTrending: false,
    views: 1610,
  }),

  p({
    title: 'SCO Plot in the Sector 88 Commercial Belt',
    shortDescription:
      'Corner SCO plot of 50 to 80 sq. yd. in the Sector 88 commercial belt, licensed for shop-cum-office use.',
    description:
      'SCO plots in the Sector 88 belt are the closest thing Greater Faridabad has to a blue-chip commercial land buy. The plot on offer is a corner position of 50 to 80 square yards facing the internal commercial road, licensed for shop-cum-office use, which allows a ground-floor shop with offices, clinics or coaching space on the floors above. Under the current Haryana norms an SCO plot of this size can be built to basement plus ground plus three floors, and owners in this belt typically keep the ground floor for a bank, chemist or food brand at premium rent and lease the upper floors to service businesses. The catchment is the reason this belt performs: Sectors 85 to 89 are dense and largely occupied, and the Sector 88 market already pulls daily traffic that a new SCO row inherits rather than has to create. Roads, sewer, power and street lighting are complete, so construction can begin immediately after registry. We advise buyers here to budget realistically for construction at current Faridabad rates before committing, and our team will share a floor-wise rental estimate for the specific plot so the yield calculation is done on numbers, not optimism.',
    category: 'plots',
    propertyType: 'SCO Plot',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 120000,
    maxPrice: null,
    priceUnit: 'per-sqyd',
    areaMin: 50,
    areaMax: 80,
    areaUnit: 'sqyd',
    bedrooms: 0,
    bathrooms: 0,
    floorsTotal: 0,
    parking: 0,
    furnishing: 'unfurnished',
    configurations: [
      { label: '50 sq. yd. SCO Plot', areaValue: 50, areaUnit: 'sqyd', price: 60 * L },
      { label: '80 sq. yd. Corner SCO Plot', areaValue: 80, areaUnit: 'sqyd', price: 96 * L },
    ],
    location: {
      locality: 'Sector 88',
      sector: 'Sector 88',
      pincode: '121002',
      address: 'Sector 88 commercial belt, Greater Faridabad, Haryana',
      landmark: 'Corner position on the internal commercial road',
      lat: 28.4155,
      lng: 77.3312,
    },
    developer: 'Independent',
    reraNumber: 'HRERA/FBD/2020/0044/SCO88',
    possession: 'Immediate',
    launchDate: '',
    amenities: [
      'Wide Internal Roads',
      'Ample Parking',
      '24x7 Security',
      'Sewage Treatment Plant',
      'Gated Community',
      'CCTV Surveillance',
      'Power Backup',
    ],
    highlights: [
      'Licensed for shop-cum-office use',
      'Basement plus ground plus three floors permitted',
      'Corner plot with two-side frontage',
      'Services complete - construction can start after registry',
      'Floor-wise rental estimate shared before purchase',
    ],
    nearby: [
      { label: 'Sector 88 Market', distance: '0.4 km' },
      { label: 'RPS Savana residential campus', distance: '1.0 km' },
      { label: 'Sector 86 residential belt', distance: '2.3 km' },
      { label: 'Bypass Road', distance: '2.7 km' },
    ],
    images: set(P3, C2, P1, C6),
    badges: ['Corner Plot', 'Commercial Licence'],
    isFeatured: true,
    isTrending: true,
    views: 1980,
  }),

  p({
    title: 'Residential Plot on Tigaon Road, Dayalpur',
    shortDescription:
      'Budget residential plots of 100 to 140 sq. yd. on Tigaon Road near Dayalpur, from Rs 58,000 per sq. yd.',
    description:
      'These plots sit on an approved colony road off Tigaon Road near Dayalpur, and they exist for a specific kind of buyer: someone who wants land in Faridabad at a price the sector belt no longer offers. At around fifty-eight thousand rupees per square yard, a 100 square yard plot here costs about the same as a two-bedroom flat in Sector 86. The colony has metalled internal roads, electricity poles with a working connection, a bore for water and demarcated plot boundaries with corner stones in place. It is honest to say what this is and is not - the surrounding development is still filling in, and a buyer building here today will be among the earlier residents, though the Tigaon Road corridor has seen steady construction since the road was widened. What makes the location worth a look is direction of growth: Greater Faridabad has expanded east and this road connects to the Sector 89 crossing, the Bypass Road and onward to the KMP Expressway. Rama Kripa Estates checks the colony approval, the mutation record and the seller chain at the tehsil before listing any plot on this stretch, because paperwork rather than price is where buyers get into trouble here.',
    category: 'plots',
    propertyType: 'Residential Plot',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 58000,
    maxPrice: 68000,
    priceUnit: 'per-sqyd',
    areaMin: 100,
    areaMax: 140,
    areaUnit: 'sqyd',
    bedrooms: 0,
    bathrooms: 0,
    floorsTotal: 0,
    parking: 0,
    furnishing: 'unfurnished',
    configurations: [
      { label: '100 sq. yd. Plot', areaValue: 100, areaUnit: 'sqyd', price: 58 * L },
      { label: '120 sq. yd. Plot', areaValue: 120, areaUnit: 'sqyd', price: 72 * L },
      { label: '140 sq. yd. Corner Plot', areaValue: 140, areaUnit: 'sqyd', price: 95 * L },
    ],
    location: {
      locality: 'Tigaon Road',
      sector: 'Dayalpur',
      pincode: '121101',
      address: 'Approved colony off Tigaon Road, Dayalpur, Faridabad, Haryana',
      landmark: '3 km from the Sector 89 crossing on Tigaon Road',
      lat: 28.4071,
      lng: 77.3384,
    },
    developer: 'Independent',
    reraNumber: '',
    possession: 'Immediate',
    launchDate: '',
    amenities: [
      'Wide Internal Roads',
      'Rainwater Harvesting',
      '24x7 Security',
      'Gated Community',
      'Ample Parking',
      'Kids Play Area',
    ],
    highlights: [
      'Entry price around Rs 58,000 per sq. yd.',
      'Metalled internal roads with electricity connection in place',
      'Plot boundaries demarcated with corner stones',
      'Colony approval, mutation and seller chain verified at the tehsil',
    ],
    nearby: [
      { label: 'Sector 89 crossing', distance: '3.1 km' },
      { label: 'Tigaon Road main carriageway', distance: '0.4 km' },
      { label: 'Sector 88 Market', distance: '6.2 km' },
      { label: 'Bypass Road', distance: '7.5 km' },
    ],
    images: set(P4, P5, P2, H6),
    badges: ['Budget Plot', 'Verified Papers'],
    isFeatured: false,
    isTrending: true,
    views: 2140,
  }),

  p({
    title: 'Residential Plot in a Licensed Colony, Sector 89',
    shortDescription:
      'Park-facing residential plots of 100 to 110 sq. yd. in a licensed Sector 89 colony with services in place.',
    description:
      'This licensed plotted colony in Sector 89 sits at the quieter eastern edge of Greater Faridabad, backing the sector green belt, and it appeals to buyers who want to build a house rather than move into a tower. The plots run from 100 to 110 square yards on 12 and 18 metre internal roads, with underground sewer, water lines, electrical ducting and street lights already commissioned - the developer completed external development before releasing this phase, which is unusual enough to be worth stating. Several houses on the street are complete and occupied, so a new owner is building among neighbours rather than in an empty field, and the colony gate is manned around the clock. Plot boundaries are demarcated and the layout plan is sanctioned, so a building plan can be filed with the municipal corporation immediately after registry. Sector 89 is roughly ten minutes from the Sector 88 market, twenty from Bypass Road and about half an hour from the Escorts Mujesar metro station, and the Tigaon Road link handles traffic towards the eastern industrial belt. For a family planning a stilt-plus-three-floor house with rental income from the upper floors, the arithmetic in this pocket still works.',
    category: 'plots',
    propertyType: 'Residential Plot',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 78000,
    maxPrice: 88000,
    priceUnit: 'per-sqyd',
    areaMin: 100,
    areaMax: 110,
    areaUnit: 'sqyd',
    bedrooms: 0,
    bathrooms: 0,
    floorsTotal: 0,
    parking: 0,
    furnishing: 'unfurnished',
    configurations: [
      { label: '100 sq. yd. Plot', areaValue: 100, areaUnit: 'sqyd', price: 78 * L },
      { label: '105 sq. yd. Park Facing', areaValue: 105, areaUnit: 'sqyd', price: 86 * L },
      { label: '110 sq. yd. Corner Plot', areaValue: 110, areaUnit: 'sqyd', price: 96 * L },
    ],
    location: {
      locality: 'Sector 89',
      sector: 'Sector 89',
      pincode: '121002',
      address: 'Licensed plotted colony, Sector 89, Greater Faridabad, Haryana',
      landmark: 'Backing the Sector 89 green belt',
      lat: 28.4231,
      lng: 77.3369,
    },
    developer: 'TDI',
    reraNumber: 'HRERA/FBD/2021/0026/TDIP',
    possession: 'Immediate',
    launchDate: 'March 2021',
    amenities: [
      'Gated Community',
      'Wide Internal Roads',
      '24x7 Security',
      'Sewage Treatment Plant',
      'Landscaped Gardens',
      'Rainwater Harvesting',
    ],
    highlights: [
      'External development completed before release of this phase',
      'Park-facing and corner positions on 12 and 18 metre roads',
      'Sanctioned layout - building plan can be filed after registry',
      'Several neighbouring houses already complete and occupied',
    ],
    nearby: [
      { label: 'Sector 89 Green Belt', distance: '0.2 km' },
      { label: 'Sector 88 Market', distance: '2.6 km' },
      { label: 'Tigaon Road', distance: '3.9 km' },
      { label: 'Bypass Road', distance: '5.4 km' },
    ],
    images: set(P5, P1, P3, H2),
    badges: ['Park Facing', 'Licensed Colony'],
    isFeatured: false,
    isTrending: false,
    views: 1240,
  }),
];

/* -------------------------------------------------------- properties: rent */

const rentals = [
  p({
    title: 'Semi-Furnished 3 BHK for Rent in Omaxe Heights, Sector 86',
    shortDescription:
      'Semi-furnished 3 BHK on rent in Sector 86 with modular kitchen, two ACs and covered parking at Rs 28,000 a month.',
    description:
      'A semi-furnished 3 BHK available on rent in Omaxe Heights, Sector 86, suitable for a working family that wants a gated society with a club rather than a standalone floor. The flat is on the eighth floor facing the internal garden, so it stays quiet, and it comes with a modular kitchen with chimney and hob, wardrobes in two bedrooms, split air conditioners in the master and living room, ceiling fans and light fittings throughout, and geysers in both bathrooms. The tenant gets one covered parking bay, club membership included in the society charges, and access to the pool, gym and badminton court. Power backup covers the lifts and common areas along with one light-and-fan point in the flat, so short cuts are never a problem. Water supply is treated and piped. Sector 86 works well for families employed in the Faridabad industrial sectors or commuting to Delhi - the sector bus stop is at the gate, Bata Chowk metro is around thirty minutes by road, and the Sector 88 market covers daily needs. The owner prefers a family on a eleven-month agreement with two months security, and is open to a small furniture addition for a longer commitment. Rama Kripa Estates handles the agreement, police verification and handover inventory.',
    category: 'rent',
    propertyType: '3 BHK Apartment',
    listingType: 'rent',
    status: 'ready-to-move',
    price: 28000,
    maxPrice: null,
    priceUnit: 'per-month',
    areaMin: 1360,
    areaMax: 1360,
    areaUnit: 'sqft',
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    floorsTotal: 14,
    parking: 1,
    furnishing: 'semi-furnished',
    configurations: [
      { label: '3 BHK Semi-Furnished', areaValue: 1360, areaUnit: 'sqft', price: 28000 },
    ],
    location: {
      locality: 'Neharpar',
      sector: 'Sector 86',
      pincode: '121002',
      address: 'Omaxe Heights, Sector 86, Greater Faridabad, Haryana',
      landmark: 'Sector 86 main road, near the sector bus stop',
      lat: 28.4079,
      lng: 77.3305,
    },
    developer: 'Omaxe',
    reraNumber: '',
    possession: 'Immediate',
    launchDate: '',
    amenities: [
      'Clubhouse',
      'Swimming Pool',
      'Gymnasium',
      'Power Backup',
      '24x7 Security',
      'Covered Parking',
      'Lift',
      'Landscaped Gardens',
    ],
    highlights: [
      'Modular kitchen with chimney and hob already fitted',
      'Split ACs in the master bedroom and living room',
      'Garden-facing eighth floor - quiet through the evening',
      'Club, pool and gym included in society charges',
      'Agreement, police verification and inventory handled by us',
    ],
    nearby: [
      { label: 'Sector 86 Bus Stop', distance: '0.2 km' },
      { label: 'Sector 88 Market', distance: '2.4 km' },
      { label: 'Modern Vidya Niketan, Sector 87', distance: '1.8 km' },
      { label: 'Bata Chowk Metro Station', distance: '9.8 km' },
    ],
    images: set(I1, R2, I4, R4),
    badges: ['Semi-Furnished', 'Family Preferred'],
    isFeatured: true,
    isTrending: true,
    views: 1780,
  }),

  p({
    title: '2 BHK Builder Floor for Rent in Sector 15, Old Faridabad',
    shortDescription:
      'Independent 2 BHK first floor on rent in Sector 15 Old Faridabad at Rs 18,500 a month, separate entry.',
    description:
      'An independent 2 BHK first floor on rent in Sector 15, Old Faridabad, with a separate staircase entry so the tenant shares nothing with the ground-floor owner. The floor has two bedrooms with built-in wardrobes, a living-cum-dining space, a kitchen with a granite platform and a stainless sink, two bathrooms - one Indian and one western, which older tenants in this belt often specifically want - and a front balcony over the street. The house is on a 30-foot road in a settled residential pocket where power supply is stable and water comes from both the municipal line and a bore with a submersible pump. There is covered two-wheeler parking in the porch and space for one car outside the gate. What makes Sector 15 attractive for renting rather than buying is convenience: the Sector 15 market, chemists, ATMs, a Mother Dairy booth and a bus stop are inside a kilometre, Old Faridabad metro station is a ten minute auto ride, and Mathura Road gives a direct run to Delhi for anyone commuting. The owner lives on the ground floor, keeps the property maintained and prefers a small family or working professionals on an eleven-month agreement with two months security deposit.',
    category: 'rent',
    propertyType: 'Independent Floor',
    listingType: 'rent',
    status: 'ready-to-move',
    price: 18500,
    maxPrice: null,
    priceUnit: 'per-month',
    areaMin: 950,
    areaMax: 950,
    areaUnit: 'sqft',
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    floorsTotal: 2,
    parking: 1,
    furnishing: 'unfurnished',
    configurations: [{ label: '2 BHK First Floor', areaValue: 950, areaUnit: 'sqft', price: 18500 }],
    location: {
      locality: 'Old Faridabad',
      sector: 'Sector 15',
      pincode: '121007',
      address: 'Sector 15, Old Faridabad, Haryana',
      landmark: '30-foot road, under 1 km from Sector 15 market',
      lat: 28.4096,
      lng: 77.3171,
    },
    developer: 'Independent',
    reraNumber: '',
    possession: 'Immediate',
    launchDate: '',
    amenities: [
      'Covered Parking',
      'Power Backup',
      'Intercom',
      'Rainwater Harvesting',
      'Wide Internal Roads',
      'Vaastu Compliant',
    ],
    highlights: [
      'Separate staircase entry - nothing shared with the owner',
      'Built-in wardrobes in both bedrooms',
      'Municipal water plus a submersible bore',
      'Sector 15 market and bus stop within a kilometre',
    ],
    nearby: [
      { label: 'Sector 15 Market', distance: '0.8 km' },
      { label: 'Old Faridabad Metro Station', distance: '2.7 km' },
      { label: 'Mathura Road (NH-19)', distance: '3.0 km' },
      { label: 'Sarvodaya Hospital, Sector 8', distance: '3.6 km' },
    ],
    images: set(I2, R6, I5, R8),
    badges: ['Independent Entry', 'Immediate'],
    isFeatured: false,
    isTrending: true,
    views: 1520,
  }),

  p({
    title: 'Furnished 4 BHK Independent House for Rent in Sector 21C',
    shortDescription:
      'Fully furnished 4 BHK house on rent in Sector 21C with garden, servant room and parking for three cars.',
    description:
      'A fully furnished four-bedroom independent house available on rent in Sector 21C, one of the better-planned residential sectors on the Delhi side of Faridabad and a common choice for senior executives posted to the NCR industrial belt. The house occupies a 350 square yard plot with a lawn in front, a rear service yard and parking for three cars inside the gate. Furnishing is complete and usable, not token: beds with mattresses and wardrobes in all four bedrooms, a sofa set and dining table, a fully fitted modular kitchen with a hob, chimney, refrigerator and water purifier, five air conditioners, geysers in every bathroom and curtains throughout. There is a separate servant room with its own toilet at the rear, a study that can double as a fifth bedroom, and an inverter with battery backup for the essential circuits. Sector 21C connects quickly to Mathura Road and the Badarpur border, which puts South Delhi within about forty minutes outside peak hours, and Surajkund and Badkhal Lake are close for weekend walks. The landlord is a long-term owner, prefers a company lease or a settled family, and asks for an eleven-month agreement with three months security.',
    category: 'rent',
    propertyType: 'Independent House',
    listingType: 'rent',
    status: 'ready-to-move',
    price: 55000,
    maxPrice: null,
    priceUnit: 'per-month',
    areaMin: 3150,
    areaMax: 3150,
    areaUnit: 'sqft',
    bedrooms: 4,
    bathrooms: 4,
    balconies: 3,
    floorsTotal: 2,
    parking: 3,
    furnishing: 'furnished',
    configurations: [
      { label: '4 BHK Fully Furnished House', areaValue: 3150, areaUnit: 'sqft', price: 55000 },
    ],
    location: {
      locality: 'Badkhal',
      sector: 'Sector 21C',
      pincode: '121001',
      address: 'Sector 21C, Faridabad, Haryana',
      landmark: 'Near the Sector 21C park, close to Mathura Road',
      lat: 28.4451,
      lng: 77.305,
    },
    developer: 'Independent',
    reraNumber: '',
    possession: 'Immediate',
    launchDate: '',
    amenities: [
      'Covered Parking',
      'Power Backup',
      '24x7 Security',
      'Landscaped Gardens',
      'CCTV Surveillance',
      'Intercom',
      'Vaastu Compliant',
      'Wide Internal Roads',
    ],
    highlights: [
      'Genuinely complete furnishing including white goods',
      'Servant room with attached toilet at the rear',
      'Parking for three cars inside the gate',
      'Inverter backup on essential circuits',
      'About 40 minutes to South Delhi off peak',
    ],
    nearby: [
      { label: 'Mathura Road (NH-19)', distance: '2.2 km' },
      { label: 'Badkhal Lake', distance: '2.9 km' },
      { label: 'Badarpur Border', distance: '9.6 km' },
      { label: 'Surajkund', distance: '6.4 km' },
      { label: 'Asian Hospital, Sector 21A', distance: '1.8 km' },
    ],
    images: set(I3, R5, I6, R7, H4),
    badges: ['Fully Furnished', 'Company Lease Welcome'],
    isFeatured: true,
    isTrending: false,
    views: 1345,
  }),
];

/* ------------------------------------------------ properties: office space */

const offices = [
  p({
    title: 'Office Space in the Sector 88 SCO Complex',
    shortDescription:
      'First-floor office of 1,250 sq. ft. in the Sector 88 SCO complex, ready for fit-out with lift and power backup.',
    description:
      'A first-floor office unit of about 1,250 square feet in the Sector 88 SCO complex, offered for outright purchase. The space comes as a bare shell with a screeded floor, plastered walls, electrical points at the distribution board and a common toilet block on the floor, which lets a buyer plan a fit-out around their own layout rather than pay for someone else\'s cabins. The floor plate is regular with a single structural column, so it partitions cleanly into a reception, four cabins and an open workstation bay of about twenty seats. Building services include a passenger lift, DG backup sized for the full floor, three-phase power, fire extinguishers with a hydrant line, and security at the complex gate through the night. The Sector 88 belt is where professional practices in Greater Faridabad have consolidated - chartered accountants, architects, insurance offices, coaching centres and a few small IT firms - so the address reads as a business location rather than a converted flat. Parking is the practical advantage: the front court and basement together take far more cars than a comparable NIT Faridabad office. Buyers should budget separately for fit-out; we can share current Faridabad contractor rates per square foot on request.',
    category: 'office-space',
    propertyType: 'Office Space',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 52 * L,
    maxPrice: 78 * L,
    priceUnit: 'total',
    areaMin: 1250,
    areaMax: 1950,
    areaUnit: 'sqft',
    bedrooms: 0,
    bathrooms: 2,
    floorsTotal: 4,
    parking: 4,
    furnishing: 'unfurnished',
    configurations: [
      { label: 'First Floor Office', areaValue: 1250, areaUnit: 'sqft', price: 52 * L },
      { label: 'Second Floor Office', areaValue: 1950, areaUnit: 'sqft', price: 78 * L },
    ],
    location: {
      locality: 'Sector 88',
      sector: 'Sector 88',
      pincode: '121002',
      address: 'SCO complex, Sector 88, Greater Faridabad, Haryana',
      landmark: 'Sector 88 commercial belt, near the market crossing',
      lat: 28.4168,
      lng: 77.3289,
    },
    developer: 'Independent',
    reraNumber: 'HRERA/FBD/2020/0052/SCO88O',
    possession: 'Immediate',
    launchDate: '',
    amenities: [
      'Lift',
      'Power Backup',
      '24x7 Security',
      'CCTV Surveillance',
      'Fire Safety',
      'Ample Parking',
      'Visitor Parking',
    ],
    highlights: [
      'Regular floor plate with a single column - partitions cleanly',
      'Bare shell, so the fit-out follows your own layout',
      'DG backup sized for the full floor',
      'Established professional address in the Sector 88 belt',
      'Front court and basement parking',
    ],
    nearby: [
      { label: 'Sector 88 Market', distance: '0.3 km' },
      { label: 'RPS Savana residential campus', distance: '0.9 km' },
      { label: 'Bypass Road', distance: '2.5 km' },
      { label: 'Escorts Mujesar Metro Station', distance: '8.4 km' },
    ],
    images: set(C5, C1, C6, C3),
    badges: ['Bare Shell', 'Ready for Fit-Out'],
    isFeatured: true,
    isTrending: false,
    views: 1085,
  }),

  p({
    title: 'Furnished Office on Lease near Bypass Road, Sector 12',
    shortDescription:
      'Plug-and-play 2,400 sq. ft. furnished office near Bypass Road, Sector 12, at Rs 1.8 lakh a month.',
    description:
      'A plug-and-play office of about 2,400 square feet available on lease near the Bypass Road end of Sector 12, aimed at a company that needs to move a team in without spending three months on a fit-out. The floor is already built out with a reception, a conference room for ten, six cabins, an open bay of thirty-two workstations, a pantry with a sink and counter, a small server room with a dedicated UPS point and two washrooms. Furniture, workstations, chairs, air conditioning and light fittings all stay. The building has a lift, a 62.5 kVA DG that covers the entire tenancy rather than just common areas, three-phase power on a separate commercial meter, fibre connections from two providers already terminated in the server room, and security with visitor logging at the entrance. Parking is allotted for eight cars in the basement plus open two-wheeler space. Sector 12 puts you minutes from Bypass Road and the Mathura Road corridor, so staff commuting from Old Faridabad, NIT and the Neharpar sectors all have a straightforward run, and Bata Chowk metro station is close for anyone coming in from Delhi. Offered on a three-year lease with a standard escalation and six months security.',
    category: 'office-space',
    propertyType: 'Office Space',
    listingType: 'rent',
    status: 'ready-to-move',
    price: 180000,
    maxPrice: null,
    priceUnit: 'per-month',
    areaMin: 2400,
    areaMax: 2400,
    areaUnit: 'sqft',
    bedrooms: 0,
    bathrooms: 2,
    floorsTotal: 3,
    parking: 8,
    furnishing: 'furnished',
    configurations: [
      { label: 'Furnished Floor - 32 workstations', areaValue: 2400, areaUnit: 'sqft', price: 180000 },
    ],
    location: {
      locality: 'Bypass Road',
      sector: 'Sector 12',
      pincode: '121007',
      address: 'Sector 12, near Bypass Road, Faridabad, Haryana',
      landmark: 'Close to the Bypass Road and Mathura Road link',
      lat: 28.4136,
      lng: 77.3096,
    },
    developer: 'Independent',
    reraNumber: '',
    possession: 'Immediate',
    launchDate: '',
    amenities: [
      'Lift',
      'Power Backup',
      'Central Air Conditioning',
      '24x7 Security',
      'CCTV Surveillance',
      'Fire Safety',
      'Ample Parking',
      'Visitor Parking',
    ],
    highlights: [
      'Fully fitted - 32 workstations, six cabins and a conference room',
      'DG covers the tenancy, not only common areas',
      'Fibre from two providers already terminated on site',
      'Eight allotted basement car parks',
      'Three-year lease, six months security',
    ],
    nearby: [
      { label: 'Bypass Road', distance: '1.1 km' },
      { label: 'Bata Chowk Metro Station', distance: '3.4 km' },
      { label: 'Mathura Road (NH-19)', distance: '2.6 km' },
      { label: 'Old Faridabad Metro Station', distance: '4.2 km' },
    ],
    images: set(C6, C2, C4, C5, H6),
    badges: ['Plug and Play', 'On Lease'],
    isFeatured: false,
    isTrending: true,
    views: 940,
  }),
];

const properties = [...residential, ...residential2, ...commercial, ...plots, ...rentals, ...offices];

/* ------------------------------------ properties: Ballabgarh and Sohna Road */

const outerBelt = [
  p({
    title: '3 BHK Builder Floor in Sector 64, Ballabgarh',
    shortDescription:
      'Newly built 3 BHK builder floor in Sector 64 Ballabgarh with lift, stilt parking and registry-ready papers.',
    description:
      'A newly completed 3 BHK builder floor in Sector 64, Ballabgarh, for buyers who want a new construction at a price the Greater Faridabad sectors no longer offer. The building is stilt plus four floors with a lift, one family per level and an allotted parking bay in the stilt. Inside there are three bedrooms with the master taking an attached toilet, a combined drawing-dining that opens to a front balcony, a modular kitchen with a granite platform and chimney point, and a utility balcony at the rear with a washing machine drain. Finishes are current-specification rather than builder-basic: vitrified flooring, anti-skid tiles in wet areas, concealed copper wiring on MCB boards, and branded CP fittings. Ballabgarh has its own municipal identity within Faridabad, and this pocket is well served - the Ballabgarh bus stand, the Sector 64 market and government schools are close, and the Ballabgarh metro terminal at the end of the Violet Line puts central Delhi within a single train journey. The Bypass Road and NH-19 are both a short drive, which matters for anyone working in the Faridabad industrial sectors. Papers are clear with registry possible immediately, and bank loans are sanctioned on this address without difficulty.',
    category: 'residential',
    propertyType: 'Builder Floor',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 62 * L,
    maxPrice: 78 * L,
    priceUnit: 'total',
    areaMin: 1150,
    areaMax: 1400,
    areaUnit: 'sqft',
    bedrooms: 3,
    bathrooms: 2,
    balconies: 2,
    floorsTotal: 5,
    parking: 1,
    furnishing: 'unfurnished',
    configurations: [
      { label: '3 BHK First Floor', areaValue: 1150, areaUnit: 'sqft', price: 62 * L },
      { label: '3 BHK Second Floor', areaValue: 1150, areaUnit: 'sqft', price: 66 * L },
      { label: '3 BHK Top Floor + Terrace', areaValue: 1400, areaUnit: 'sqft', price: 78 * L },
    ],
    location: {
      locality: 'Ballabgarh',
      sector: 'Sector 64',
      pincode: '121004',
      address: 'Sector 64, Ballabgarh, Faridabad, Haryana',
      landmark: 'Near the Sector 64 market, off the Ballabgarh main road',
      lat: 28.3492,
      lng: 77.3252,
    },
    developer: 'Independent',
    reraNumber: 'HRERA/FBD/2023/0088/BLB',
    possession: 'Ready to move',
    launchDate: 'June 2024',
    amenities: [
      'Lift',
      'Covered Parking',
      'Power Backup',
      '24x7 Security',
      'CCTV Surveillance',
      'Intercom',
      'Vaastu Compliant',
      'Fire Safety',
    ],
    highlights: [
      'New construction with lift and stilt parking',
      'One family per floor, no shared lobby',
      'Ballabgarh metro terminal a short drive away',
      'Registry possible immediately, home loans sanctioned easily',
    ],
    nearby: [
      { label: 'Sector 64 Market', distance: '0.6 km' },
      { label: 'Ballabgarh Metro Station', distance: '2.9 km' },
      { label: 'Ballabgarh Bus Stand', distance: '2.1 km' },
      { label: 'NH-19 Delhi-Mathura Road', distance: '3.7 km' },
    ],
    images: set(R7, I4, R9, I1),
    badges: ['New Construction', 'Value Buy'],
    isFeatured: false,
    isTrending: true,
    views: 1420,
  }),

  p({
    title: 'Industrial Plot on Ballabgarh-Sohna Road',
    shortDescription:
      'Approved industrial plots of 150 to 175 sq. yd. on Ballabgarh-Sohna Road from Rs 55,000 per sq. yd.',
    description:
      'Industrial plots on the Ballabgarh-Sohna Road stretch, suited to a manufacturing or warehousing unit that needs land with road access rather than a built shed. The plots run from 150 to 175 square yards on a 60-foot approach road, with a boundary wall in place on the road side, electricity poles along the frontage and a bore already sunk on the larger parcel. Change of land use is approved for industrial purpose, which is the single most important thing to establish on this road, and our team pulls the CLU letter and the mutation record from the tehsil for every buyer before token money is discussed. The Ballabgarh-Sohna corridor has attracted small and mid-sized units because of what it connects to: NH-19 is about ten minutes east, the KMP Expressway runs west towards Manesar and Sohna, and the Ballabgarh industrial area supplies skilled labour and vendors within a few kilometres. Rates here remain well below the Faridabad sector belt, so the same capital buys three to four times the land. Suitable for a fabrication unit, a cold store, a distribution depot or as a straightforward land hold in the path of the expressway corridor.',
    category: 'plots',
    propertyType: 'Industrial Plot',
    listingType: 'sale',
    status: 'ready-to-move',
    price: 55000,
    maxPrice: 62000,
    priceUnit: 'per-sqyd',
    areaMin: 150,
    areaMax: 175,
    areaUnit: 'sqyd',
    bedrooms: 0,
    bathrooms: 0,
    floorsTotal: 0,
    parking: 0,
    furnishing: 'unfurnished',
    configurations: [
      { label: '150 sq. yd. Industrial Plot', areaValue: 150, areaUnit: 'sqyd', price: 84 * L },
      { label: '175 sq. yd. Corner Parcel', areaValue: 175, areaUnit: 'sqyd', price: 98 * L },
    ],
    location: {
      locality: 'Sohna Road',
      sector: 'Ballabgarh-Sohna Road',
      pincode: '121004',
      address: 'Ballabgarh-Sohna Road, Faridabad, Haryana',
      landmark: '60-foot approach road, 6 km west of Ballabgarh',
      lat: 28.3468,
      lng: 77.2861,
    },
    developer: 'Independent',
    reraNumber: '',
    possession: 'Immediate',
    launchDate: '',
    amenities: [
      'Wide Internal Roads',
      '24x7 Security',
      'Power Backup',
      'Ample Parking',
      'CCTV Surveillance',
      'Loading Bay',
    ],
    highlights: [
      'Change of land use approved for industrial purpose',
      'CLU letter and mutation record verified at the tehsil',
      '60-foot approach road with boundary wall on the frontage',
      'KMP Expressway to the west, NH-19 about ten minutes east',
      'Rates well below the Faridabad sector belt',
    ],
    nearby: [
      { label: 'Ballabgarh Industrial Area', distance: '5.8 km' },
      { label: 'NH-19 Delhi-Mathura Road', distance: '9.2 km' },
      { label: 'KMP Expressway approach', distance: '12.5 km' },
      { label: 'Ballabgarh Metro Station', distance: '7.4 km' },
    ],
    images: set(P5, P2, P4, P1),
    badges: ['CLU Approved', 'Industrial Land'],
    isFeatured: false,
    isTrending: false,
    views: 690,
  }),
];

properties.push(...outerBelt);

/* ---------------------------------------------------------------- localities */

const localities = [
  {
    name: 'Greater Faridabad (Neharpar)',
    slug: 'greater-faridabad',
    image: img(H4),
    description:
      'The planned half of the city across the Bypass Road, running from Sector 75 to Sector 89. Wide sector roads, newer societies, working schools and the best supply of ready-to-move apartments in Faridabad.',
    aliases: [
      'Neharpar',
      'Sector 75',
      'Sector 76',
      'Sector 77',
      'Sector 78',
      'Sector 79',
      'Sector 80',
      'Sector 81',
      'Sector 82',
      'Sector 84',
      'Sector 85',
      'Sector 86',
      'Sector 87',
      'Sector 88',
      'Sector 89',
    ],
    priceFrom: 28 * L,
    priceNote: 'Apartments from Rs 28 Lakh',
    isFeatured: true,
    order: 1,
  },
  {
    name: 'Sector 88 & 89',
    slug: 'sector-88-89',
    image: img(H1),
    description:
      'The commercial heart of Greater Faridabad. The Sector 88 market, SCO belt and the Sector 89 green belt make this the most convenient pocket in Neharpar for both homes and shops.',
    aliases: ['Sector 88', 'Sector 89'],
    priceFrom: 62 * L,
    priceNote: 'Apartments from Rs 62 Lakh',
    isFeatured: true,
    order: 2,
  },
  {
    name: 'Sector 75-80',
    slug: 'sector-75-80',
    image: img(H2),
    description:
      'Plotted colonies and independent floors on the western Neharpar sectors, closest to Bypass Road. Where most families building their own house in Faridabad end up buying land.',
    aliases: ['Sector 75', 'Sector 76', 'Sector 77', 'Sector 78', 'Sector 79', 'Sector 80'],
    priceFrom: 92000,
    priceNote: 'Plots from Rs 92,000 per sq. yd.',
    isFeatured: true,
    order: 3,
  },
  {
    name: 'Old Faridabad',
    slug: 'old-faridabad',
    image: img(H3),
    description:
      'The original HUDA sectors around Sector 14, 15 and 16 - freehold kothis, established markets, the metro station and everything already built. Land ownership rather than apartment shares.',
    aliases: ['Old Faridabad', 'Sector 14', 'Sector 15', 'Sector 16', 'Sector 17', 'Sector 19'],
    priceFrom: 115000,
    priceNote: 'Plots from Rs 1,15,000 per sq. yd.',
    isFeatured: true,
    order: 4,
  },
  {
    name: 'Ballabgarh',
    slug: 'ballabgarh',
    image: img(H6),
    description:
      'The southern end of the city with its own municipal identity, the Violet Line metro terminal and the industrial area. New builder floors here cost far less than the Neharpar sectors.',
    aliases: ['Ballabgarh', 'Sector 62', 'Sector 63', 'Sector 64', 'Sector 65'],
    priceFrom: 62 * L,
    priceNote: 'Builder floors from Rs 62 Lakh',
    isFeatured: false,
    order: 5,
  },
  {
    name: 'Sohna Road',
    slug: 'sohna-road',
    image: img(P5),
    description:
      'The Ballabgarh-Sohna corridor heading west towards the KMP Expressway. Industrial and commercial land at rates well below the sector belt, with vendor and labour supply close by.',
    aliases: ['Sohna Road', 'Ballabgarh-Sohna Road'],
    priceFrom: 55000,
    priceNote: 'Industrial land from Rs 55,000 per sq. yd.',
    isFeatured: false,
    order: 6,
  },
  {
    name: 'Surajkund & Badkhal',
    slug: 'surajkund',
    image: img(H5),
    description:
      'The Aravalli side of Faridabad - Surajkund, Anangpur, Badkhal Lake and Sector 21C. Low-density housing, the closest Faridabad addresses to South Delhi and the quietest air in the city.',
    aliases: ['Surajkund', 'Anangpur', 'Badkhal', 'Sector 21C', 'Sector 21A', 'Sector 21B'],
    priceFrom: 55000,
    priceNote: 'Houses on rent from Rs 55,000 a month',
    isFeatured: true,
    order: 7,
  },
  {
    name: 'Bypass Road',
    slug: 'bypass-road',
    image: img(H2),
    description:
      'The spine that connects old Faridabad to Neharpar, meeting Mathura Road and NH-19 at both ends. Offices, showrooms and highway-facing commercial space cluster along this stretch.',
    aliases: ['Bypass Road', 'Sector 12', 'Sector 37', 'Mathura Road', 'NIT Faridabad', 'Tigaon Road'],
    priceFrom: 180000,
    priceNote: 'Offices on lease from Rs 1.8 Lakh a month',
    isFeatured: true,
    order: 8,
  },
];

/* ---------------------------------------------------------------- developers */

/** Inline SVG wordmark - no external logo files, always renders, filter-friendly. */
const logo = (name) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 72" width="240" height="72"><rect width="240" height="72" rx="10" fill="#FAF7F1"/><rect x="10" y="10" width="6" height="52" rx="3" fill="#C9A227"/><text x="30" y="44" font-family="Georgia,serif" font-size="24" fill="#0F3D2E">${name}</text></svg>`
  )}`;

const developerNames = [
  ['BPTP', 'https://www.bptp.com', 2005],
  ['Omaxe', 'https://www.omaxe.com', 1989],
  ['Adore', 'https://www.adoreindia.com', 2013],
  ['Puri Constructions', 'https://www.puriconstructions.com', 1971],
  ['RPS Group', 'https://www.rpsgroup.in', 1993],
  ['Amolik', 'https://www.amolikgroup.com', 2003],
  ['SRS', 'https://www.srsparivar.com', 2000],
  ['Ansal', 'https://www.ansals.com', 1967],
  ['TDI', 'https://www.tdiindia.com', 1998],
  ['Piyush Group', 'https://www.piyushgroup.com', 1994],
  ['Vatika', 'https://www.vatikagroup.com', 1986],
  ['Signature Global', 'https://www.signatureglobal.in', 2014],
];

const developers = developerNames.map(([name, website, establishedYear], i) => ({
  name,
  slug: slugify(name),
  logo: logo(name),
  website,
  establishedYear,
  description: `${name} projects in Faridabad are listed and resold through Rama Kripa Estates, with title, RERA status and possession record verified before every viewing.`,
  order: i + 1,
}));

/* -------------------------------------------------------------- testimonials */

const testimonials = [
  {
    name: 'Rajesh Chauhan',
    role: 'Production Manager, Escorts',
    locality: 'Sector 86, Greater Faridabad',
    message:
      'We had been looking in Neharpar for almost a year and kept getting shown flats that did not match the photos. Rama Kripa shortlisted four honest options in one afternoon, told us plainly which tower had a water problem, and we closed on the third one. The registry and loan file were handled without a single extra trip.',
    rating: 5,
    avatar: avatar(U1),
    propertyTitle: 'Omaxe Heights, Sector 86',
    order: 1,
  },
  {
    name: 'Meenakshi Sharma',
    role: 'School Teacher',
    locality: 'Sector 15, Old Faridabad',
    message:
      'Selling my father-in-law\'s kothi in Sector 15 was emotional and complicated because the papers were old. Their team sat with the tehsil records, sorted the mutation and found a buyer who paid the full circle rate. They never once pushed us to reduce the price to close faster.',
    rating: 5,
    avatar: avatar(U2),
    propertyTitle: '4 BHK Independent House, Sector 15',
    order: 2,
  },
  {
    name: 'Amit Bhardwaj',
    role: 'Retail Business Owner',
    locality: 'Sector 79, Greater Faridabad',
    message:
      'I bought a shop on the Omaxe World Street ground floor. What helped was that they gave me actual footfall timings and the rent numbers of two neighbouring units instead of a brochure. Two years on, the shop is leased at close to the figure they estimated.',
    rating: 5,
    avatar: avatar(U3),
    propertyTitle: 'Retail Shop at Omaxe World Street, Sector 79',
    order: 3,
  },
  {
    name: 'Sunita Rani',
    role: 'Bank Officer',
    locality: 'Sector 88, Greater Faridabad',
    message:
      'First home purchase, and I was nervous about everything. They explained the affordable housing lock-in rules properly, showed me the allotment date in writing, and arranged the site visit on a Sunday because that is when I was free. Genuinely patient people.',
    rating: 4,
    avatar: avatar(U4),
    propertyTitle: 'Adore Happy Homes Ecstasy, Sector 86',
    order: 4,
  },
  {
    name: 'Vikram Singh Tomar',
    role: 'Logistics Entrepreneur',
    locality: 'Tigaon Road, Faridabad',
    message:
      'For the warehouse on Tigaon Road they checked the change of land use at the tehsil before showing me the property. That one step saved me from a plot I had almost booked elsewhere on the same road with incomplete papers.',
    rating: 5,
    avatar: avatar(U5),
    propertyTitle: 'Industrial Warehouse on Tigaon Road',
    order: 5,
  },
  {
    name: 'Priya Malhotra',
    role: 'HR Lead, NCR',
    locality: 'Sector 21C, Faridabad',
    message:
      'We needed a furnished house on a company lease within three weeks. They understood the brief, showed us only fully furnished options, and handled the agreement and police verification themselves. Our team moved in on schedule.',
    rating: 5,
    avatar: avatar(U6),
    propertyTitle: 'Furnished 4 BHK Independent House, Sector 21C',
    order: 6,
  },
];

/* --------------------------------------------------------------------- blogs */
/* content is HTML - render it with dangerouslySetInnerHTML on the detail page. */

const blogs = [
  {
    title: 'Buying a Home in Greater Faridabad: A Sector-by-Sector Guide',
    slug: 'buying-a-home-in-greater-faridabad-sector-guide',
    excerpt:
      'Sectors 75 to 89 are not interchangeable. Here is what actually separates them on price, infrastructure, schools and resale before you shortlist a flat in Neharpar.',
    coverImage: img(H4),
    tags: ['Greater Faridabad', 'Neharpar', 'Buying Guide'],
    category: 'Buying Guide',
    author: 'Rama Kripa Estates',
    authorRole: 'Property Advisory Team',
    content: `<p>Ask ten buyers in Faridabad where they are looking and eight will say "Neharpar" or "Greater Faridabad" as though it were one place. It is not. The belt across the Bypass Road runs from Sector 75 to Sector 89, and the difference between two sectors four kilometres apart can be twenty lakh on the same size of flat. This is how we break the belt down for clients.</p>

<h2>Sectors 75 to 80: the plotted west</h2>
<p>This is where plotted colonies dominate - BPTP Parklands anchors Sectors 75 to 77, and the internal roads here were laid at 18 and 24 metres, which is wider than most of the eastern sectors. If you want to build your own house rather than buy a flat, this is the first place to look. Plot rates sit around Rs 92,000 to Rs 1,12,000 per square yard depending on whether you are park-facing or on a standard internal street. The trade-off is that ready apartment supply is thinner here, so families who want to move in next month usually look further east.</p>

<h2>Sectors 81 to 87: the school and society belt</h2>
<p>Most of the completed apartment stock sits here. Sector 84 and Sector 86 carry the largest societies, and this is also where the school cluster has settled - Delhi Public School in Sector 81, Modern Vidya Niketan in Sector 87 and Grand Columbus nearby. A 3 BHK of 1,350 to 1,600 square feet trades between Rs 62 lakh and Rs 88 lakh, and low-density projects like Puri Pratham in Sector 84 go higher. If you have school-going children, buy in this pocket and your morning run stays under fifteen minutes for the next decade.</p>

<h2>Sectors 88 and 89: convenience and commerce</h2>
<p>Sector 88 is the practical centre of Greater Faridabad. The market, the SCO belt, chemists, bank branches and clinics are all here, and it is the one pocket where a family can genuinely live without a car for daily needs. Sector 89 backs the green belt and is quieter. Apartment prices are comparable to Sector 86, but the resale liquidity is better because buyers understand the address immediately.</p>

<h2>The four questions that decide the sector</h2>
<ul>
<li><strong>Where do your children study, or where will they?</strong> Sectors 81 to 87 if the answer is Neharpar schools.</li>
<li><strong>How often do you drive to Delhi?</strong> Sectors 75 to 79 reach Bypass Road and NH-19 fastest.</li>
<li><strong>Flat or your own house?</strong> Plots are in the west, apartments in the centre and east.</li>
<li><strong>Are you buying to live or to let?</strong> Rental demand concentrates around Sector 86 and Sector 88, where tenants working at Escorts, Whirlpool and the industrial sectors want a gated society with a club.</li>
</ul>

<h2>Two things buyers underestimate</h2>
<p>The first is water. Borewell water in parts of this belt runs hard, and societies with a working softening plant - RPS Savana and Piyush Heights among them - save residents a recurring plumbing and appliance bill. Ask to see the plant, not the brochure line about it.</p>
<p>The second is the difference between an occupied society and a completed one. A tower can be complete and still be half empty, which means the maintenance collection is thin, the lifts get patchy service and the club stays shut. Walk the corridors on a weekday evening. If lights are on across most floors and the parking is full, the society is alive.</p>

<h2>What we tell first-time buyers</h2>
<p>Shortlist three sectors, not nine. Visit each twice, once on a weekday morning during the school run and once on a Sunday evening. Check the distance to the nearest chemist and the nearest ATM on foot. Then compare only the flats that survive that test. It sounds slow, but it is much faster than looking at forty flats across the whole belt and remembering none of them.</p>`,
    readTime: 6,
    isPublished: true,
    publishedAt: new Date('2026-01-14'),
    views: 1840,
    seo: {
      metaTitle: 'Buying a Home in Greater Faridabad: Sector-by-Sector Guide | Rama Kripa Estates',
      metaDescription:
        'Sectors 75 to 89 compared on price, schools, infrastructure and resale, with practical checks before you buy an apartment or plot in Neharpar, Faridabad.',
      keywords: ['Greater Faridabad property', 'Neharpar sectors', 'buy flat Faridabad', 'Sector 86 apartments'],
    },
  },

  {
    title: 'Nine Documents to Check Before You Buy Property in Faridabad',
    slug: 'documents-to-check-before-buying-property-in-faridabad',
    excerpt:
      'Title chain, mutation, CLU, RERA registration and six more papers - what each one proves, where to get it in Faridabad, and the red flags we walk away from.',
    coverImage: img(I3),
    tags: ['Legal', 'Documentation', 'Buying Guide'],
    category: 'Legal & Documentation',
    author: 'Rama Kripa Estates',
    authorRole: 'Legal Desk',
    content: `<p>Almost every property dispute we see in Faridabad could have been avoided at the paperwork stage. Price gets negotiated for weeks; the file gets read in ten minutes. Here is the list we work through before a client pays token money, and what each document actually proves.</p>

<h2>1. Title deed and the chain of ownership</h2>
<p>The sale deed in the seller's name is the starting point, not the end. Ask for the previous deeds going back at least thirteen years so the chain of transfer is unbroken. A gap in the chain is the single most common defect in Old Faridabad and Ballabgarh resale files.</p>

<h2>2. Mutation record (intkaal)</h2>
<p>Mutation confirms that the revenue records at the tehsil were updated after the last sale. A registered deed without mutation means the government record still shows an older owner. For agricultural-turned-residential land on Tigaon Road and the Sohna Road belt, this is the check that matters most.</p>

<h2>3. Encumbrance certificate</h2>
<p>This shows whether the property carries a mortgage, lien or court attachment. If the seller has an outstanding home loan, insist on a no-objection certificate and a foreclosure letter from the bank, and route the payment so the loan is cleared directly.</p>

<h2>4. Approved building plan or layout plan</h2>
<p>For a flat or a floor, the sanctioned plan tells you whether what is built matches what was approved. Unapproved extra floors are common in builder-floor construction; banks refuse loans on them and municipal action can follow.</p>

<h2>5. Occupation certificate</h2>
<p>An OC means the local authority has certified the building fit for occupation. Buying a flat without one leaves you exposed on water and electricity connections, and it weakens your position in any dispute with the builder.</p>

<h2>6. HRERA registration</h2>
<p>Any project with more than eight units or over 500 square metres must be registered with the Haryana Real Estate Regulatory Authority. The registration number should be quoted in the builder's advertising, and you can verify it against the authority's public register along with the promised completion date.</p>

<h2>7. Change of land use (CLU)</h2>
<p>Essential for anything commercial or industrial, and for plots on the city edge. A CLU letter converts land from agricultural to the permitted use. Without it, construction is illegal regardless of what the seller has already built on the plot.</p>

<h2>8. Property tax receipts and utility clearances</h2>
<p>Collect the last three years of municipal property tax receipts, plus the latest electricity and water bills. Unpaid dues transfer with the property, and a pending tax file can hold up your registry on the day.</p>

<h2>9. Society or RWA no-objection certificate</h2>
<p>For an apartment resale, the society confirms that maintenance dues are clear and no penalty is outstanding against the flat. It takes a week to obtain, so ask for it early rather than on registry morning.</p>

<h2>Red flags we do not negotiate on</h2>
<ul>
<li>A seller who will only show photocopies and promises originals at registry.</li>
<li>A general power of attorney presented as a substitute for a sale deed.</li>
<li>Any plot on the city edge without a CLU letter or a licensed colony approval.</li>
<li>A price meaningfully below the circle rate for that sector, which usually signals a defect in the file.</li>
</ul>

<h2>Where to verify in Faridabad</h2>
<p>The tehsil office holds revenue and mutation records, the Municipal Corporation of Faridabad handles building plans, sanctions and property tax, and HRERA's Panchkula register covers project registrations. A local advocate will complete a title search in three to five working days for a modest fee. On a purchase worth a crore, that is the cheapest insurance you will ever buy.</p>`,
    readTime: 7,
    isPublished: true,
    publishedAt: new Date('2026-02-02'),
    views: 2410,
    seo: {
      metaTitle: 'Property Documents Checklist for Faridabad Buyers | Rama Kripa Estates',
      metaDescription:
        'Title chain, mutation, encumbrance, OC, HRERA and CLU - the nine documents to verify before buying property in Faridabad, and where to check each one.',
      keywords: ['property documents Faridabad', 'HRERA', 'CLU Faridabad', 'title verification'],
    },
  },

  {
    title: 'Plots in Faridabad: What Your Rate Per Square Yard Actually Buys',
    slug: 'plots-in-faridabad-rate-per-square-yard-guide',
    excerpt:
      'From Rs 55,000 on Tigaon Road to Rs 1,20,000 for an SCO plot in Sector 88 - a plain reading of what each price band gives you and what it does not.',
    coverImage: img(P1),
    tags: ['Plots', 'Investment', 'Greater Faridabad'],
    category: 'Investment',
    author: 'Rama Kripa Estates',
    authorRole: 'Land Advisory',
    content: `<p>Land is the one asset in Faridabad where buyers still shop mainly on rate per square yard, and it is also where the rate tells you least about what you are getting. Two plots at Rs 78,000 and Rs 1,15,000 can be four kilometres apart and represent completely different risks. Here is how the bands break down across the city today.</p>

<h2>Rs 55,000 to Rs 68,000 - the city edge</h2>
<p>This is the Tigaon Road, Dayalpur and Ballabgarh-Sohna Road belt. At these rates a 100 square yard plot costs about the same as a two-bedroom flat in Sector 86, which is genuinely attractive. What you are accepting in return is that the surrounding development is still filling in, services may be colony-provided rather than municipal, and resale depends on the corridor continuing to grow. Buy here only after the CLU letter, the colony approval and the mutation record have been read at the tehsil - on this belt, paperwork is where money is lost, not price.</p>

<h2>Rs 78,000 to Rs 92,000 - the licensed Neharpar colonies</h2>
<p>Sector 89 and the outer Neharpar colonies sit in this band. External development is usually complete before plots are released: sewer lines in the ground, electrical ducting, street lights commissioned and a manned gate. Several houses on the street will already be occupied. You can file a building plan with the corporation immediately after registry, and under current Haryana norms a plot of this size supports stilt plus four floors. For a family planning to live on one floor and let the others, the arithmetic works at this rate.</p>

<h2>Rs 92,000 to Rs 1,15,000 - Sectors 75 to 80 and Old Faridabad</h2>
<p>BPTP Parklands in Sector 76 and the HUDA sectors of Old Faridabad occupy this band. In Parklands you pay for wide internal roads, a gated boundary and a colony that is already functioning. In Sector 15 or 16 you pay for something different - a fully built neighbourhood where nothing remains to be developed, the market is a walk away and the metro station is a short drive. Old Faridabad plots are freehold and registry is usually straightforward, which is why they hold value through every slow patch in the market.</p>

<h2>Rs 1,20,000 and above - SCO and commercial plots</h2>
<p>An SCO plot in the Sector 88 belt is a different calculation altogether. You are buying a licence to build shop-cum-office space - basement plus ground plus three floors under current norms - in a catchment that already has daily footfall. Ground floors here let to banks, chemists and food brands at premium rent, and upper floors to clinics and coaching centres. Before committing, price the construction honestly at current Faridabad contractor rates and work out the floor-wise rent. If the yield only works with optimistic rent assumptions, walk away.</p>

<h2>Five checks for any plot, at any rate</h2>
<ul>
<li>Walk the demarcation on site with the layout plan in hand. Corner stones should exist.</li>
<li>Confirm the road width in front of the plot against the sanctioned layout, not the broker's description.</li>
<li>Check where the sewer and water lines actually terminate.</li>
<li>Ask what floors are permitted and what ground coverage applies to that plot size.</li>
<li>Verify the seller's chain of title and mutation before token money changes hands.</li>
</ul>

<h2>A note on holding period</h2>
<p>Land in Faridabad rewards patience rather than trading. The corridors that moved fastest over the last decade - Neharpar after the Bypass Road, and now the eastern stretch towards Tigaon - moved because infrastructure arrived, not because sentiment turned. If you cannot hold a plot for five to seven years, an apartment with rental income is usually the better instrument.</p>`,
    readTime: 6,
    isPublished: true,
    publishedAt: new Date('2026-02-20'),
    views: 1985,
    seo: {
      metaTitle: 'Plot Rates in Faridabad: What Each Price Band Buys | Rama Kripa Estates',
      metaDescription:
        'Plot prices in Faridabad from Rs 55,000 to over Rs 1,20,000 per sq. yd. explained, with checks for Tigaon Road, Sector 76, Old Faridabad and SCO plots.',
      keywords: ['plots in Faridabad', 'plot rate per sq yd', 'SCO plot Sector 88', 'BPTP Parklands'],
    },
  },
];

blogs.push(
  {
    title: 'Home Loans in Faridabad: Getting Sanctioned Without the Runaround',
    slug: 'home-loans-in-faridabad-getting-sanctioned-faster',
    excerpt:
      'How banks value Faridabad property, why some addresses get rejected, and the file that gets a sanction letter in ten days instead of six weeks.',
    coverImage: img(I5),
    tags: ['Home Loan', 'Finance', 'Buying Guide'],
    category: 'Finance',
    author: 'Rama Kripa Estates',
    authorRole: 'Loan Assistance Desk',
    content: `<p>A home loan sanction in Faridabad is rarely refused because of the buyer. It is refused because of the property. Understanding how a bank looks at an address in this city will save you weeks, and occasionally the deal itself.</p>

<h2>How the bank actually values your flat</h2>
<p>The bank sends an empanelled valuer who works from three inputs: the circle rate for that sector, recent registered transactions in the same project, and the physical condition of the unit. The valuation that comes back is often below your agreed price, particularly on resale in the older sectors, and the bank lends against the lower of the two figures. Budget for that gap in your own funds rather than discovering it a week before registry.</p>

<h2>Addresses that create trouble</h2>
<ul>
<li><strong>Unapproved extra floors.</strong> If the building has four floors and the sanctioned plan shows three, no bank will fund the top unit.</li>
<li><strong>Missing occupation certificate.</strong> Some lenders fund it, most price it higher, a few refuse outright.</li>
<li><strong>Power of attorney sales.</strong> A GPA is not a title. Loans against it are effectively unavailable.</li>
<li><strong>Plots in unlicensed colonies.</strong> A plot loan needs an approved colony; construction finance needs a sanctioned building plan.</li>
<li><strong>Affordable housing inside the lock-in.</strong> Resale before the policy lock-in period ends is not fundable and, more importantly, not legal.</li>
</ul>

<h2>The file that moves in ten days</h2>
<p>We hand banks the same folder every time, and it is the reason our clients get sanctions quickly. Keep these ready before you apply: three years of income tax returns with computation, six months of salary slips or two years of business financials, twelve months of bank statements from your salary account, PAN and Aadhaar, the property's chain of title, the sanctioned plan, the occupation certificate where applicable, the society NOC, and the seller's latest property tax receipt. A complete file removes the two-week ping-pong that most applications get stuck in.</p>

<h2>Which lender for which property</h2>
<p>Public sector banks are usually the cheapest and are comfortable with HUDA plots and older Old Faridabad houses, but their processing is slower. Private banks move faster on approved builder projects in Neharpar, where their legal teams have already vetted the project once and can reuse that approval. Housing finance companies are the most flexible on self-employed income and on properties with a small documentation gap, at a slightly higher rate. Match the lender to the property, not to whoever called you first.</p>

<h2>Under construction versus ready to move</h2>
<p>On an under-construction purchase such as a Sector 77 floor with a December 2026 handover, the bank disburses in tranches against the builder's demand letters, and you pay pre-EMI interest on the drawn amount until possession. On a ready flat the full disbursement happens at registry. The under-construction route saves capital early but carries delivery risk, so check the HRERA-registered completion date and the developer's record on their last two projects before you commit.</p>

<h2>Practical numbers</h2>
<p>Lenders in this market typically fund up to 80 per cent of the valuation for loans above Rs 30 lakh, expect your total EMIs to stay under roughly half of net monthly income, and want a credit score above 750 for the best rate. Registration and stamp duty in Haryana are payable by you in cash at registry and are not part of the loan, so keep that provision aside from day one.</p>

<h2>What we do on every transaction</h2>
<p>We share the property file with two or three lenders before the buyer applies, so any objection surfaces while the deal can still be structured around it. It costs us a few days at the start and saves everyone a month at the end.</p>`,
    readTime: 6,
    isPublished: true,
    publishedAt: new Date('2026-03-08'),
    views: 1620,
    seo: {
      metaTitle: 'Home Loan Guide for Faridabad Property Buyers | Rama Kripa Estates',
      metaDescription:
        'How banks value Faridabad property, which addresses get rejected, the documents that speed up sanction, and choosing between bank types.',
      keywords: ['home loan Faridabad', 'property valuation', 'HUDA plot loan', 'under construction loan'],
    },
  },

  {
    title: 'Renting Out in Faridabad: What Landlords Actually Earn',
    slug: 'renting-out-property-in-faridabad-landlord-guide',
    excerpt:
      'Real rent bands by sector, the yields we see on 3 BHKs in Neharpar, and the five clauses that keep a tenancy out of trouble.',
    coverImage: img(I1),
    tags: ['Rent', 'Landlords', 'Investment'],
    category: 'Rental Advice',
    author: 'Rama Kripa Estates',
    authorRole: 'Rentals Desk',
    content: `<p>Rental yield in Faridabad is modest and dependable, which is exactly what most owners here want. Nobody is getting rich letting a flat in Sector 86, but a well-chosen unit covers its maintenance, keeps the property occupied and appreciates alongside the sector. Here are the numbers we see in the market.</p>

<h2>What flats actually rent for</h2>
<ul>
<li><strong>2 BHK builder floor, Old Faridabad:</strong> Rs 16,000 to Rs 20,000 a month, unfurnished with a separate entry.</li>
<li><strong>3 BHK in a Neharpar society, semi-furnished:</strong> Rs 26,000 to Rs 32,000, higher if the club and pool are functional.</li>
<li><strong>3 BHK unfurnished, Sector 86 or 88:</strong> Rs 22,000 to Rs 26,000.</li>
<li><strong>4 BHK furnished independent house, Sector 21C or Surajkund side:</strong> Rs 50,000 to Rs 65,000, often on a company lease.</li>
<li><strong>Fitted office space near Bypass Road:</strong> Rs 70 to Rs 90 per square foot per month.</li>
</ul>
<p>On a 3 BHK bought at Rs 68 lakh and let at Rs 28,000, gross yield works out near five per cent. Net of maintenance and the months a flat sits empty between tenants, treat 3.5 to 4 per cent as the realistic figure and view the rest of your return as capital appreciation.</p>

<h2>What lifts the rent, and what does not</h2>
<p>Three things reliably add rent in this city: a modular kitchen with a chimney and hob, air conditioners in the master bedroom and living room, and wardrobes. Together they cost around Rs 1.5 lakh to fit and add Rs 3,000 to Rs 4,000 a month, so they pay back inside four years and make the flat let faster. What does not move the needle is expensive flooring, designer light fittings or a fresh coat of paint in an unusual colour. Tenants in Faridabad are practical.</p>

<h2>Who your tenant will be</h2>
<p>In the Neharpar sectors, most tenants work at Escorts, Whirlpool or the industrial sectors, or commute to South Delhi via the Badarpur border. They tend to be families on eleven-month agreements who stay two or three terms if the landlord is reasonable. In Old Faridabad the mix includes more young professionals and small families who value the metro station and the market over a clubhouse. On the Surajkund and Sector 21C side, company leases for senior staff are common and are the most stable tenancies available in the city.</p>

<h2>Five clauses worth insisting on</h2>
<ul>
<li>Eleven-month term with a defined escalation, usually five to eight per cent on renewal.</li>
<li>Two months security for a flat, three for a furnished house, refundable against an inventory signed at handover.</li>
<li>A clear split of society maintenance - normally the owner pays the sinking fund and the tenant pays usage charges.</li>
<li>Notice period of one or two months on both sides, in writing.</li>
<li>Police verification completed before handover. It is a legal requirement and it is also the cheapest background check available to you.</li>
</ul>

<h2>The mistakes that cost owners money</h2>
<p>Leaving a flat vacant for months chasing an extra Rs 1,500 a month is the most common. Two empty months wipe out a year of that increase. The second is handing over without a photographed inventory, which turns every deposit refund into an argument. The third is letting maintenance dues build up in the owner's name while the tenant occupies the flat - societies pursue the owner, not the tenant.</p>

<h2>How we manage it</h2>
<p>For owners who live outside Faridabad we handle tenant screening, the agreement, police verification, the handover inventory and rent follow-up. The property stays occupied and the owner deals with one point of contact instead of five.</p>`,
    readTime: 6,
    isPublished: true,
    publishedAt: new Date('2026-03-26'),
    views: 1390,
    seo: {
      metaTitle: 'Rental Yields and Rent Rates in Faridabad | Rama Kripa Estates',
      metaDescription:
        'Real rent bands for 2 and 3 BHKs across Faridabad, yields on a Neharpar 3 BHK, and the tenancy clauses landlords should insist on.',
      keywords: ['rent in Faridabad', 'rental yield', '3 BHK rent Sector 86', 'landlord guide'],
    },
  },

  {
    title: 'Commercial Property in Faridabad: Shops, SCO Plots and Office Space',
    slug: 'commercial-property-in-faridabad-shops-sco-office',
    excerpt:
      'Where retail actually works in this city, how SCO plots are priced, what a Bypass Road office costs to run, and the yields worth believing.',
    coverImage: img(C1),
    tags: ['Commercial', 'SCO Plots', 'Investment'],
    category: 'Commercial',
    author: 'Rama Kripa Estates',
    authorRole: 'Commercial Desk',
    content: `<p>Commercial property rewards location precision far more than residential does. A shop thirty metres off the main pedestrian line can earn half the rent of one on it. Here is how the Faridabad commercial market breaks down and what each format demands from an owner.</p>

<h2>High-street retail</h2>
<p>The Omaxe World Street stretch in Sector 79 is the most active high-street format in Greater Faridabad, and the ground floor of the main pedestrian spine is where footfall already exists rather than being promised. Ground-floor shops of 300 to 450 square feet trade between Rs 48 lakh and Rs 65 lakh, and leased units yield roughly six per cent. Before buying, sit in the complex for an hour on a weekday evening and again on Sunday. Count people, not brochures. Note which units are shuttered - a row with three empty shops is telling you something about the rent expectations on that floor.</p>

<h2>Sector market shops</h2>
<p>The Sector 88 belt behaves differently from a high street. Demand here is driven by daily needs from the surrounding residential sectors: chemists, clinics, banks, grocery, salons and coaching. Rents are steadier and less fashion-dependent than a mall-format street, and vacancy is lower. Double-height units that allow a mezzanine are worth the premium because you effectively get two levels of usable space against one carpet area.</p>

<h2>SCO plots</h2>
<p>A shop-cum-office plot lets you build rather than buy built space - basement plus ground plus three floors under current Haryana norms. In the Sector 88 belt these trade around Rs 1,20,000 per square yard, so an 80 square yard corner plot is close to Rs 96 lakh before construction. The economics only work if you price construction realistically at today's Faridabad contractor rates and then compute rent floor by floor: ground to a bank or a food brand at premium rent, first floor to a clinic or a coaching centre, upper floors to offices. Owners who model the whole building at ground-floor rent are the ones who end up disappointed.</p>

<h2>Office space</h2>
<p>Faridabad office demand is local - chartered accountants, architects, insurance, logistics back offices, coaching and small IT firms - and it clusters where parking exists. The Sector 88 SCO complex and the Bypass Road belt near Sector 12 are the two addresses that read as business locations. A bare-shell first floor of 1,250 square feet sells around Rs 52 lakh; a plug-and-play fitted floor of 2,400 square feet leases near Rs 1.8 lakh a month on a three-year term. Fitted space commands a clear premium because tenants value moving in next week over saving on rent.</p>

<h2>Warehousing on the eastern corridor</h2>
<p>Tigaon Road and the Ballabgarh-Sohna belt have drawn logistics operators because of NH-19 and the KMP Expressway. What buyers must verify here is the change of land use, without exception - it is the difference between a functioning asset and a demolition notice. Clear height, dock levels and trailer turning radius inside the compound decide who will lease the shed.</p>

<h2>Five checks before any commercial purchase</h2>
<ul>
<li>Ask for the actual rent of two neighbouring units, not the asking rent for yours.</li>
<li>Confirm the parking allocation in writing - it decides your tenant pool.</li>
<li>Check power sanction and DG coverage. Retail and clinics cannot operate on common-area backup alone.</li>
<li>Read the maintenance charge per square foot and factor it into your yield.</li>
<li>Verify the commercial licence or CLU for the specific unit, not the complex in general.</li>
</ul>

<h2>The honest summary</h2>
<p>Commercial property in Faridabad pays roughly twice the yield of residential and takes roughly twice the diligence. If you are buying to lease, buy the tenant's convenience - frontage, parking and neighbours - and the rent follows.</p>`,
    readTime: 7,
    isPublished: true,
    publishedAt: new Date('2026-04-12'),
    views: 1470,
    seo: {
      metaTitle: 'Commercial Property in Faridabad: Shops, SCO and Offices | Rama Kripa Estates',
      metaDescription:
        'Retail, SCO plots, office space and warehousing in Faridabad - real price bands, yields and the checks that decide whether a commercial buy works.',
      keywords: ['commercial property Faridabad', 'SCO plot', 'office space Faridabad', 'retail shop investment'],
    },
  }
);

/* ------------------------------------------------------------------- runner */

/* ------------------------------------------------------------------ */
/* Team - the "Our team" band on /about, admin-editable from the panel  */
/* ------------------------------------------------------------------ */

const team = [
  {
    name: 'Mahesh Chand Sharma',
    role: 'Founder & Principal Consultant',
    image: avatar(U1),
    note: 'Has negotiated in Faridabad since 2008. Knows the collector rate of almost every sector by heart.',
    order: 1,
  },
  {
    name: 'Ritu Bhardwaj',
    role: 'Head - Residential Sales',
    image: avatar(U2),
    note: 'Runs the Neharpar residential desk and the Sunday site-visit rounds across Sectors 75 to 89.',
    order: 2,
  },
  {
    name: 'Ankit Nagar',
    role: 'Head - Commercial & SCO',
    image: avatar(U3),
    note: 'Handles SCO plots, shops and office leasing, and advises on rental yield and tenant mix.',
    order: 3,
  },
  {
    name: 'Neha Chauhan',
    role: 'Legal & Documentation Manager',
    image: avatar(U4),
    note: 'Title searches, mutation, builder-buyer agreements and registry at the Faridabad tehsil.',
    order: 4,
  },
];

const summary = (label, n) => console.log(`  ${String(n).padStart(3, ' ')}  ${label}`);

const run = async () => {
  const started = Date.now();

  try {
    await connectDB();
  } catch (err) {
    console.error('\n[seed] Could not connect to MongoDB:', err.message);
    console.error('[seed] Check MONGO_URI in backend/.env, then run `npm run seed` again.\n');
    process.exit(1);
  }

  console.log('[seed] Clearing existing data...');
  await Promise.all([
    Property.deleteMany({}),
    Locality.deleteMany({}),
    Developer.deleteMany({}),
    Testimonial.deleteMany({}),
    TeamMember.deleteMany({}),
    Blog.deleteMany({}),
    Setting.deleteMany({}),
    User.deleteMany({}),
  ]);
  // Enquiries are real customer leads - never wiped by a reseed.
  const keptEnquiries = await Enquiry.countDocuments();

  console.log('[seed] Inserting Faridabad data...');
  const [insertedProperties, insertedLocalities, insertedDevelopers, insertedTestimonials, insertedBlogs, insertedTeam] =
    await Promise.all([
      Property.create(properties),
      Locality.create(localities),
      Developer.create(developers),
      Testimonial.create(testimonials),
      Blog.create(blogs),
      TeamMember.create(team),
    ]);

  await Setting.create(DEFAULT_SETTINGS);

  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Rama Kripa Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@rke.com').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'rke@2026',
    role: 'admin',
  });

  const byCategory = insertedProperties.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  console.log('\n[seed] Done in %ss:', ((Date.now() - started) / 1000).toFixed(1));
  summary('properties', insertedProperties.length);
  Object.entries(byCategory)
    .sort()
    .forEach(([key, n]) => summary(`  - ${key}`, n));
  summary('localities', insertedLocalities.length);
  summary('developers', insertedDevelopers.length);
  summary('testimonials', insertedTestimonials.length);
  summary('team members', insertedTeam.length);
  summary('blog posts', insertedBlogs.length);
  summary('settings document', 1);
  summary('admin user', 1);
  summary('enquiries kept', keptEnquiries);

  console.log(`\n[seed] Admin login: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'rke@2026'}`);
  console.log('[seed] Start the API with `npm run dev`.\n');

  await disconnectDB();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('\n[seed] Failed:', err.message);
  if (err.errors) console.error(Object.entries(err.errors).map(([k, v]) => `  ${k}: ${v.message}`).join('\n'));
  await disconnectDB().catch(() => {});
  process.exit(1);
});

import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
  {
    image: { type: String, trim: true, required: true },
    alt: { type: String, trim: true, default: '' },
    eyebrow: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: '' },
    subtitle: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const statSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true },
    value: { type: Number, required: true },
    suffix: { type: String, trim: true, default: '+' },
  },
  { _id: false }
);

const settingSchema = new mongoose.Schema(
  {
    /** Singleton guard - only one Setting document may exist. */
    key: { type: String, default: 'site', unique: true, immutable: true },

    brandName: { type: String, trim: true, default: 'Rama Kripa Estates' },
    tagline: { type: String, trim: true, default: 'Blessings in Every Address' },

    phones: { type: [String], default: [] },
    email: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    whatsapp: { type: String, trim: true, default: '' },
    hours: { type: String, trim: true, default: '' },

    socials: {
      facebook: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      youtube: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
    },

    mapEmbedUrl: { type: String, trim: true, default: '' },
    directionsUrl: { type: String, trim: true, default: '' },

    heroSlides: { type: [heroSlideSchema], default: [] },
    about: { type: String, trim: true, default: '' },
    stats: { type: [statSchema], default: [] },

    reraNumber: { type: String, trim: true, default: '' },
    footerNote: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

/** Single source of truth for the site settings. Used by the seed and as an API fallback. */
export const DEFAULT_SETTINGS = {
  key: 'site',
  brandName: 'Rama Kripa Estates',
  tagline: 'Blessings in Every Address',
  phones: ['+91 98110 00000', '+91 92120 00000'],
  email: 'info@ramakripaestate.com',
  address: 'SCO 12, Sector 88, Greater Faridabad, Haryana 121002',
  whatsapp: '+919811000000',
  hours: '10:00 - 19:00, Mon-Sun',
  socials: {
    facebook: 'https://www.facebook.com/ramakripaestate',
    instagram: 'https://www.instagram.com/ramakripaestate',
    youtube: 'https://www.youtube.com/@ramakripaestate',
    linkedin: 'https://www.linkedin.com/company/ramakripaestate',
    twitter: 'https://x.com/ramakripaestate',
  },
  mapEmbedUrl: 'https://www.google.com/maps?q=Sector+88,+Greater+Faridabad,+Haryana+121002&output=embed',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Sector+88,+Greater+Faridabad,+Haryana+121002',
  heroSlides: [
    {
      image: img('1486406146926-c627a92ad1ab'),
      alt: 'High rise apartment towers in Greater Faridabad at dusk',
      eyebrow: 'Faridabad Real Estate Consultants',
      title: 'Looking For Luxury Homes in Faridabad?',
      subtitle: 'Handpicked apartments, floors and plots across Neharpar, Sector 88 and Old Faridabad.',
    },
    {
      image: img('1449824913935-59a10b8d2000'),
      alt: 'Wide arterial road running past new residential towers',
      eyebrow: 'Greater Faridabad Specialists',
      title: 'Homes On The Right Side Of The Bypass',
      subtitle: 'Sector 75 to Sector 89, walking distance from the Badarpur to Ballabgarh metro corridor.',
    },
    {
      image: img('1470723710355-95304d8aece4'),
      alt: 'Modern apartment complex with landscaped gardens',
      eyebrow: '18 Years in Faridabad',
      title: 'Buy, Rent or Invest With Confidence',
      subtitle: 'RERA checked listings, clear titles and site visits arranged the same week.',
    },
  ],
  about:
    'Rama Kripa Estates is a Faridabad-born property consultancy working only in this city and its immediate belt - Greater Faridabad (Neharpar), Old Faridabad, NIT, Ballabgarh, Surajkund and the Bypass Road corridor. We match families and investors with apartments, builder floors, plots, shops and office space, verify every title and RERA registration before we show it, and stay with our clients through the loan, registry and possession.',
  stats: [
    { label: 'Years in Faridabad', value: 18, suffix: '+' },
    { label: 'Happy Families', value: 1200, suffix: '+' },
    { label: 'Projects Covered', value: 250, suffix: '+' },
    { label: 'Developer Tie-ups', value: 40, suffix: '+' },
  ],
  reraNumber: 'HRERA/FBD/AGENT/2019/0142',
  footerNote:
    'Rama Kripa Estates is a registered property consultant. All prices are indicative and subject to change by the developer or owner.',
};

export default mongoose.models.Setting || mongoose.model('Setting', settingSchema);

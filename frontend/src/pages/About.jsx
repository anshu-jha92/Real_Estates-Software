import { Link } from 'react-router-dom'
import {
  MdArrowForward,
  MdFlag,
  MdVisibility,
  MdGavel,
  MdCall,
  MdLocationOn,
  MdVerifiedUser
} from 'react-icons/md'
import PageHero from '../components/layout/PageHero'
import Section from '../components/ui/Section'
import SectionTitle from '../components/ui/SectionTitle'
import Reveal from '../components/ui/Reveal'
import WhyChooseUs from '../components/home/WhyChooseUs'
import StatsBand from '../components/home/StatsBand'
import useSeo from '../hooks/useSeo'
import useFetch from '../hooks/useFetch'
import { api } from '../api/client'
import { useSite } from '../context/SiteContext'
import { IMAGE_IDS, UNSPLASH, UNSPLASH_AVATAR, onImageError } from '../data/constants'
import { phoneHref } from '../utils/format'
import './About.css'

const HERO_IMAGE = UNSPLASH(IMAGE_IDS.hero[1], 1600)

const COLLAGE = [
  {
    src: UNSPLASH(IMAGE_IDS.residential[1], 900),
    alt: 'Residential towers in the Greater Faridabad sectors at golden hour',
    className: 'rk-about__collageMain'
  },
  {
    src: UNSPLASH(IMAGE_IDS.commercial[3], 700),
    alt: 'SCO commercial frontage with shops and showrooms in Sector 88, Faridabad',
    className: 'rk-about__collageSmall'
  },
  {
    src: UNSPLASH(IMAGE_IDS.plots[0], 700),
    alt: 'Open plotted land ready for construction on the Faridabad bypass belt',
    className: 'rk-about__collageWide'
  }
]

const PILLARS = [
  {
    key: 'mission',
    icon: MdFlag,
    eyebrow: 'Mission',
    title: 'Make one address decision go right',
    text: 'Most families in Faridabad buy property once or twice in a lifetime. Our job is to make that one transaction correct end to end — the right sector, a clean title, a sanctioned loan and a registry that holds up twenty years later.'
  },
  {
    key: 'vision',
    icon: MdVisibility,
    eyebrow: 'Vision',
    title: 'The consultancy Faridabad recommends first',
    text: 'To be the firm a Faridabad resident names without hesitation when a neighbour, a colleague or a cousin asks who to trust with a property — because we handled theirs properly and told them the truth about it.'
  },
  {
    key: 'values',
    icon: MdGavel,
    eyebrow: 'Values',
    title: 'Say the inconvenient thing early',
    text: 'If a project is stuck at the licence stage, if the collector rate will not support the loan, if a resale flat has an unpaid maintenance dues history — you hear it from us before you pay a token, not after.'
  }
]

const MILESTONES = [
  {
    year: '2008',
    title: 'The Sector 15 desk opens',
    text: 'Rama Kripa Estates starts as a two-person desk in Old Faridabad, handling resale kothis and builder floors in Sectors 14, 15, 16 and 21C.'
  },
  {
    year: '2013',
    title: 'First 100 families settled',
    text: 'The hundredth registry is completed. By now the practice covers NIT Faridabad, Ballabgarh and the first group-housing launches along Sohna Road.'
  },
  {
    year: '2018',
    title: 'Moving to Greater Faridabad',
    text: 'The office shifts to SCO 12, Sector 88, putting us in the middle of Neharpar as Sectors 75 to 89 come alive with BPTP, Puri, RPS and Omaxe deliveries.'
  },
  {
    year: '2022',
    title: 'A dedicated commercial desk',
    text: 'A separate team takes on SCO plots, retail shops, showrooms and office leasing on the Sector 88 and 89 frontage and the Mathura Road corridor.'
  },
  {
    year: '2026',
    title: '1,200+ families and counting',
    text: 'Eighteen years in one city: over 1,200 families settled, 250+ projects handled and tie-ups with more than 40 developers across Faridabad.'
  }
]

/** Shown only if the team API is unreachable — the live list is admin-managed. */
const TEAM_FALLBACK = [
  {
    name: 'Mahesh Chand Sharma',
    role: 'Founder & Principal Consultant',
    image: UNSPLASH_AVATAR(IMAGE_IDS.people[0], 400),
    note: 'Has negotiated in Faridabad since 2008. Knows the collector rate of almost every sector by heart.'
  },
  {
    name: 'Ritu Bhardwaj',
    role: 'Head — Residential Sales',
    image: UNSPLASH_AVATAR(IMAGE_IDS.people[1], 400),
    note: 'Runs the Neharpar residential desk and the Sunday site-visit rounds across Sectors 75 to 89.'
  },
  {
    name: 'Ankit Nagar',
    role: 'Head — Commercial & SCO',
    image: UNSPLASH_AVATAR(IMAGE_IDS.people[2], 400),
    note: 'Handles SCO plots, shops and office leasing, and advises on rental yield and tenant mix.'
  },
  {
    name: 'Neha Chauhan',
    role: 'Legal & Documentation Manager',
    image: UNSPLASH_AVATAR(IMAGE_IDS.people[3], 400),
    note: 'Title searches, mutation, builder-buyer agreements and registry at the Faridabad tehsil.'
  }
]

export default function About() {
  const { settings } = useSite()

  const { data: teamResponse } = useFetch((signal) => api.team({ signal }), [])
  const liveTeam = Array.isArray(teamResponse?.data)
    ? teamResponse.data
    : Array.isArray(teamResponse)
      ? teamResponse
      : []
  const team = liveTeam.length ? liveTeam : TEAM_FALLBACK

  useSeo({
    title: 'Who We Are — 18 Years of Property Advice in Faridabad',
    description:
      'Rama Kripa Estates is a Faridabad-only property consultancy founded in 2008. Meet the team behind 1,200+ settled families, 250+ projects and 40+ developer tie-ups across Greater Faridabad, Old Faridabad and Ballabgarh.',
    keywords:
      'about Rama Kripa Estates, property consultant Faridabad, real estate company Greater Faridabad, Faridabad property advisors',
    image: HERO_IMAGE
  })

  const phones = Array.isArray(settings.phones) && settings.phones.length ? settings.phones : ['+91 98110 00000']
  const primaryPhone = phones[0]
  const address = settings.address || 'SCO 12, Sector 88, Greater Faridabad, Haryana 121002'

  return (
    <div className="rk-about">
      <PageHero
        eyebrow="Since 2008, one city only"
        title="Who We Are"
        subtitle="A Faridabad property consultancy that has never opened a second-city branch — because knowing one market properly is worth more than knowing ten of them vaguely."
        image={HERO_IMAGE}
        breadcrumb={[{ label: 'Who We Are' }]}
      />

      <Section tone="cream" size="md" className="rk-about__story" ariaLabel="Our story">
        <div className="rk-about__storyRow">
          <Reveal className="rk-about__collage" variant="left">
            <div className="rk-about__collageGrid">
              {COLLAGE.map((item) => (
                <figure className={`rk-about__collageItem ${item.className}`} key={item.src}>
                  <img src={item.src} alt={item.alt} loading="lazy" decoding="async" onError={onImageError} />
                </figure>
              ))}
              <p className="rk-about__badge">
                <span className="rk-about__badgeNum">18</span>
                <span className="rk-about__badgeText">
                  years
                  <br />
                  in Faridabad
                </span>
              </p>
            </div>
          </Reveal>

          <Reveal className="rk-about__copy" variant="right" delay={120}>
            <SectionTitle
              eyebrow="Our story"
              title={
                <>
                  Built on registries, not <em>brochures</em>
                </>
              }
              as="h2"
            />

            <p>
              Rama Kripa Estates began in 2008 with a single desk in Old Faridabad and one stubborn idea: that a property
              consultant should know the ground better than the developer&rsquo;s marketing team. In those years the work was
              resale kothis in Sector 15, builder floors in 21C, and long afternoons at the tehsil learning what a clean chain of
              title actually looks like.
            </p>
            <p>
              When Neharpar opened up, we moved with it. Today the office sits on the SCO frontage of Sector 88, in the middle of
              the belt we advise on most: Sectors 75 to 89, the Bypass Road, Tigaon Road and the plotted colonies running towards
              Sohna Road. We still handle Old Faridabad, NIT and Ballabgarh, because a city is not only its newest sectors.
            </p>
            <p>
              Eighteen years on, the practice covers homes, plots, shops, offices and rentals — but the method has not changed.
              We check the licence and the HRERA registration, we walk the site, we compare the asking price against registries
              we have actually done nearby, and then we tell you what we would do if it were our own money.
            </p>

            <ul className="rk-about__proof">
              <li>
                <MdVerifiedUser aria-hidden="true" />
                Every listing checked against the Haryana RERA register
              </li>
              <li>
                <MdLocationOn aria-hidden="true" />
                {address}
              </li>
              <li>
                <MdCall aria-hidden="true" />
                <a href={phoneHref(primaryPhone)}>{primaryPhone}</a> — 10:00 to 19:00, all week
              </li>
            </ul>

            <Link className="rk-btn rk-btn--green rk-about__storyCta" to="/properties">
              See What We Are Selling
              <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </Section>

      <Section tone="white" size="md" className="rk-about__pillars" ariaLabel="Mission, vision and values">
        <SectionTitle
          eyebrow="What drives us"
          title="Mission, vision and the rules we keep"
          align="center"
          subtitle="Three sentences we have not needed to rewrite in eighteen years."
        />

        <ul className="rk-about__pillarGrid">
          {PILLARS.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <Reveal as="li" key={pillar.key} delay={index * 100} className="rk-about__pillar">
                <span className="rk-about__pillarIcon" aria-hidden="true">
                  <Icon />
                </span>
                <p className="rk-eyebrow">{pillar.eyebrow}</p>
                <h3 className="rk-about__pillarTitle">{pillar.title}</h3>
                <p className="rk-about__pillarText">{pillar.text}</p>
              </Reveal>
            )
          })}
        </ul>
      </Section>

      <WhyChooseUs />

      <Section tone="cream" size="md" className="rk-about__timeline" ariaLabel="Our milestones">
        <SectionTitle
          eyebrow="Milestones"
          title="Eighteen years, in order"
          align="center"
          subtitle="From a two-person desk in Sector 15 to a full residential, commercial and legal practice in Sector 88."
        />

        <ol className="rk-about__milestones">
          {MILESTONES.map((item, index) => (
            <Reveal as="li" key={item.year} delay={index * 90} className="rk-about__milestone">
              <span className="rk-about__msYear">{item.year}</span>
              <span className="rk-about__msDot" aria-hidden="true" />
              <div className="rk-about__msBody">
                <h3 className="rk-about__msTitle">{item.title}</h3>
                <p className="rk-about__msText">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="white" size="md" id="team" className="rk-about__team" ariaLabel="Our team">
        <SectionTitle
          eyebrow="Our team"
          title="The people who will actually pick up the phone"
          align="center"
          subtitle="One office in Sector 88. No call centre in between."
        />

        <ul className="rk-about__teamGrid">
          {team.map((member, index) => (
            <Reveal
              as="li"
              key={member._id || member.name}
              delay={index * 90}
              className="rk-about__memberWrap"
            >
              <article className="rk-about__member">
                <div className="rk-about__memberMedia">
                  <img
                    src={member.image}
                    alt={`${member.name}, ${member.role} at Rama Kripa Estates`}
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="400"
                    onError={onImageError}
                  />
                </div>
                <h3 className="rk-about__memberName">{member.name}</h3>
                <p className="rk-about__memberRole">{member.role}</p>
                <p className="rk-about__memberNote">{member.note}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </Section>

      <StatsBand />

      <Section tone="cream" size="md" className="rk-about__cta" ariaLabel="Talk to us">
        <div className="rk-about__ctaCard">
          <div className="rk-about__ctaCopy">
            <p className="rk-eyebrow rk-eyebrow--light">Next step</p>
            <h2 className="rk-about__ctaTitle">
              Tell us the sector and the budget. We will do the <em>legwork</em>.
            </h2>
            <p className="rk-about__ctaText">
              Walk into SCO 12, Sector 88, call us, or send a two-line brief. Either way you get an honest read on what your
              money buys in Faridabad this month — including the projects we do not sell.
            </p>
          </div>

          <div className="rk-about__ctaActions">
            <Link className="rk-btn rk-btn--gold" to="/contact">
              Contact Us
              <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
            </Link>
            <a className="rk-btn rk-btn--ghost" href={phoneHref(primaryPhone)}>
              <MdCall className="rk-btn__icon" aria-hidden="true" />
              {primaryPhone}
            </a>
          </div>
        </div>
      </Section>
    </div>
  )
}

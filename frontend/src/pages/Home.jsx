import Hero from '../components/home/Hero'
import CategoryStrip from '../components/home/CategoryStrip'
import FeaturedProperties from '../components/home/FeaturedProperties'
import StatsBand from '../components/home/StatsBand'
import WhyChooseUs from '../components/home/WhyChooseUs'
import LocalityShowcase from '../components/home/LocalityShowcase'
import TrendingSplit from '../components/home/TrendingSplit'
import DeveloperMarquee from '../components/home/DeveloperMarquee'
import Testimonials from '../components/home/Testimonials'
import BlogTeaser from '../components/home/BlogTeaser'
import CtaEnquiry from '../components/home/CtaEnquiry'
import MapBand from '../components/home/MapBand'
import useSeo from '../hooks/useSeo'
import './Home.css'

/**
 * Home page — BUILD_SPEC §5, sections 3 to 14 in order.
 * TopBar, Header, Footer and FloatingActions come from MainLayout, so this
 * page is purely composition: every section owns its own data and states.
 */
export default function Home() {
  useSeo({
    title: 'Property in Faridabad — Flats, Plots, Shops & Office Spaces',
    description:
      'Rama Kripa Estates is a Faridabad-only property consultancy. Buy, rent or invest in RERA-checked flats, builder floors, residential and SCO plots, shops and offices across Greater Faridabad, Sector 88, Old Faridabad, Ballabgarh and Sohna Road.',
    keywords:
      'property in Faridabad, flats in Greater Faridabad, plots in Neharpar, SCO plots Sector 88, office space Faridabad, property dealer Faridabad',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80'
  })

  return (
    <div className="rk-home">
      <Hero />
      <CategoryStrip />
      <FeaturedProperties />
      <StatsBand />
      <WhyChooseUs />
      <LocalityShowcase />
      <TrendingSplit />
      <DeveloperMarquee />
      <Testimonials />
      <BlogTeaser />
      <CtaEnquiry />
      <MapBand />
    </div>
  )
}

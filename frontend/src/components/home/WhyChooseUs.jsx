import { Link } from 'react-router-dom'
import { MdArrowForward } from 'react-icons/md'
import Section from '../ui/Section'
import SectionTitle from '../ui/SectionTitle'
import Reveal from '../ui/Reveal'
import { WHY_US } from '../../data/constants'
import './WhyChooseUs.css'

/**
 * Home section 8 — the six reasons a Faridabad buyer should work with us.
 * Content comes from WHY_US so About / Why Us can reuse the same copy.
 */
export default function WhyChooseUs() {
  return (
    <Section tone="surface" id="why-us" className="rk-why" ariaLabel="Why choose Rama Kripa Estates">
      <SectionTitle
        eyebrow="Why Rama Kripa Estates"
        title={
          <>
            One city, done <em>properly</em>
          </>
        }
        subtitle="Eighteen years of registries, site visits and possession letters — all of them in Faridabad. Here is what that buys you."
        align="center"
      />

      <ul className="rk-why__grid">
        {WHY_US.map((item, index) => {
          const Icon = item.icon
          return (
            <Reveal as="li" key={item.title} delay={index * 80} className="rk-why__item">
              <article className="rk-why__card">
                <span className="rk-why__num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="rk-why__icon" aria-hidden="true">
                  <Icon />
                </span>

                <h3 className="rk-why__title">{item.title}</h3>

                <span className="rk-why__rule" aria-hidden="true" />

                <p className="rk-why__text">{item.text}</p>
              </article>
            </Reveal>
          )
        })}
      </ul>

      <div className="rk-why__foot">
        <p className="rk-why__footText">
          Not sure where to start? Tell us your budget and preferred sector — we will shortlist three
          honest options for you.
        </p>
        <Link className="rk-btn rk-btn--outline" to="/enquiry">
          Get a Free Consultation
          <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
        </Link>
      </div>
    </Section>
  )
}

import { Outlet } from 'react-router-dom'
import ScrollToTop from '../components/layout/ScrollToTop'
import TopBar from '../components/layout/TopBar'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/layout/FloatingActions'
import './MainLayout.css'

/** Public site shell: TopBar + Header + page + Footer + floating call/WhatsApp. */
export default function MainLayout() {
  return (
    <div className="rk-layout">
      <ScrollToTop />

      <a className="sr-only sr-only-focusable" href="#main-content">
        Skip to main content
      </a>

      <TopBar />
      <Header />

      <main id="main-content" className="rk-layout__main" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}

import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import Loader from './components/ui/Loader'
import { ToastProvider } from './components/ui/Toast'
import { getToken } from './api/client'

/* ---------------- Public pages ---------------- */
const Home = lazy(() => import('./pages/Home'))
const Properties = lazy(() => import('./pages/Properties'))
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'))
const Localities = lazy(() => import('./pages/Localities'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Enquiry = lazy(() => import('./pages/Enquiry'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const Legal = lazy(() => import('./pages/Legal'))
const NotFound = lazy(() => import('./pages/NotFound'))

/* ---------------- Admin pages ---------------- */
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'))
const AdminPropertyForm = lazy(() => import('./pages/admin/AdminPropertyForm'))
const AdminEnquiries = lazy(() => import('./pages/admin/AdminEnquiries'))
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'))
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'))
const AdminTeam = lazy(() => import('./pages/admin/AdminTeam'))
const AdminLocalities = lazy(() => import('./pages/admin/AdminLocalities'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminAccount = lazy(() => import('./pages/admin/AdminAccount'))

/** Blocks the admin area until a JWT is present; remembers where you wanted to go. */
function RequireAdmin({ children }) {
  const location = useLocation()
  const token = getToken()

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />
  }

  return children
}

/** /locality/:slug reuses the Properties page with the locality pre-applied. */
function LocalityProperties() {
  const { slug } = useParams()
  return <Properties preset={{ locality: slug }} />
}

export default function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<Loader full />}>
        <Routes>
          {/* -------- Public site -------- */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />

            <Route path="/properties" element={<Properties />} />
            <Route path="/residential" element={<Properties preset={{ category: 'residential' }} />} />
            <Route path="/commercial" element={<Properties preset={{ category: 'commercial' }} />} />
            <Route path="/plots" element={<Properties preset={{ category: 'plots' }} />} />
            <Route path="/rent" element={<Properties preset={{ listingType: 'rent' }} />} />
            <Route
              path="/office-spaces"
              element={<Properties preset={{ category: 'office-space' }} />}
            />
            <Route path="/property/:slug" element={<PropertyDetail />} />

            <Route path="/localities" element={<Localities />} />
            <Route path="/locality/:slug" element={<LocalityProperties />} />

            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/enquiry" element={<Enquiry />} />

            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />

            <Route path="/privacy-policy" element={<Legal type="privacy" />} />
            <Route path="/terms" element={<Legal type="terms" />} />

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* -------- Admin -------- */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="properties/new" element={<AdminPropertyForm />} />
            <Route path="properties/:id/edit" element={<AdminPropertyForm />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="localities" element={<AdminLocalities />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="account" element={<AdminAccount />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ToastProvider>
  )
}

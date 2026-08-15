import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './BookingExperience'
import './style.css'
import SiteHeader from './SiteHeader'
import { ForgotPasswordPage, ResetPasswordPage } from './PasswordResetPages'
import HistoryPage from './HistoryPage'
import AdminBookingsPage from './AdminBookingsPage'
import FacilitiesPage from './FacilitiesPage'
import RulesPage from './RulesPage'

function EventPage() {
  return <div className="empty-event-page"><SiteHeader active="events" /><main><span>EVENTS</span><h1>Coming soon.</h1><p>Our events calendar is being prepared.</p><a href="/">Return home</a></main></div>
}

const routes: Record<string, React.ComponentType> = { '/event': EventPage, '/events': EventPage, '/facilities': FacilitiesPage, '/rules': RulesPage, '/history': HistoryPage, '/bookings': AdminBookingsPage, '/admin/bookings': AdminBookingsPage, '/forgot-password': ForgotPasswordPage, '/reset-password': ResetPasswordPage }
function Router() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const update = () => setPath(window.location.pathname)
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  const Page = routes[path] ?? App
  return <Page />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)

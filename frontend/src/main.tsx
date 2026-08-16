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
import { LanguageProvider, useLanguage } from './LanguageContext'
import SiteFooter from './SiteFooter'

function EventPage() {
  const { language } = useLanguage()
  return <div className="empty-event-page"><SiteHeader active="events" /><main><span>{language === 'id' ? 'ACARA' : 'EVENTS'}</span><h1>{language === 'id' ? 'Segera hadir.' : 'Coming soon.'}</h1><p>{language === 'id' ? 'Kalender acara kami sedang disiapkan.' : 'Our events calendar is being prepared.'}</p><a href="/">{language === 'id' ? 'Kembali ke beranda' : 'Return home'}</a></main></div>
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
  return <><Page /><SiteFooter /></>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider><Router /></LanguageProvider>
  </StrictMode>,
)

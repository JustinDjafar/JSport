import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './BookingExperience'
import './style.css'

function EventPage() {
  return <div className="empty-event-page"><header className="site-header"><a href="/" className="event-header-brand" aria-label="JSport home"><span className="brand"><span className="brand-shuttle"><i /><i /><i /></span><span>JSPORT<small>RACQUET CLUB</small></span></span></a><nav className="header-tabs" aria-label="Primary navigation"><a href="/">Home</a><a className="active" href="/events">Events</a></nav><a className="header-cta" href="/">Reserve a court</a></header><main><span>EVENTS</span><h1>Coming soon.</h1><p>Our events calendar is being prepared.</p><a href="/">Return home</a></main></div>
}

const Root = ['/event', '/events'].includes(window.location.pathname) ? EventPage : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

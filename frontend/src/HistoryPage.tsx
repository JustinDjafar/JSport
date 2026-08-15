import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { CalendarDays, Clock3, LoaderCircle } from 'lucide-react'
import { api, type Booking } from './api'
import { auth } from './firebase'
import SiteHeader from './SiteHeader'

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const bookingStatus = (value: string | number) => typeof value === 'string' ? value : ['PendingPayment', 'Confirmed', 'Cancelled', 'Expired', 'PaymentFailed'][value] ?? 'Unknown'

export default function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => onAuthStateChanged(auth, user => {
    setSignedIn(Boolean(user))
    if (!user) { setLoading(false); return }
    api.getBookingHistory().then(setBookings).catch(reason => setError(reason instanceof Error ? reason.message : 'Could not load booking history.')).finally(() => setLoading(false))
  }), [])

  return <div className="history-page"><SiteHeader active="home"/><main>
    <div className="history-heading"><span className="step-label">YOUR ACCOUNT</span><h1>Booking history.</h1><p>Past and upcoming court reservations connected to your account.</p></div>
    {loading ? <div className="history-state"><LoaderCircle className="spin"/> Loading your bookings…</div>
      : !signedIn ? <div className="history-state"><h2>Sign in to see your history.</h2><p>Your reservations are private and only available to your account.</p><a className="primary-button" href="/">Return home</a></div>
      : error ? <div className="history-state"><h2>We couldn’t load your bookings.</h2><p>{error}</p></div>
      : bookings.length === 0 ? <div className="history-state"><CalendarDays/><h2>No bookings yet.</h2><p>Your first reservation will appear here after you book a court.</p><a className="primary-button" href="/?reserve=1">Reserve a court</a></div>
      : <div className="history-list">{bookings.map(booking => { const status = bookingStatus(booking.status); return <article key={booking.id}><div><small>{booking.bookingCode}</small><h2>{booking.courtName}</h2><p><CalendarDays size={15}/>{date.format(new Date(booking.startsAt))}<Clock3 size={15}/>{time.format(new Date(booking.startsAt))}–{time.format(new Date(booking.endsAt))}</p></div><div className="history-meta"><span className={`booking-status ${status.toLowerCase()}`}>{status.replace(/([A-Z])/g, ' $1')}</span><strong>{rupiah.format(booking.totalAmount)}</strong></div></article> })}</div>}
  </main></div>
}

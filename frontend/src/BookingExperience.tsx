import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, Check, ChevronDown, Clock3, LoaderCircle, MapPin, ShieldCheck, Sparkles, Users, X } from 'lucide-react'
import { api, type Booking, type Court, type Venue } from './api'
import heroImage from './assets/luxury-court-hero.png'

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const displayDate = new Intl.DateTimeFormat('en-ID', { weekday: 'short', day: 'numeric', month: 'long' })

function localDate(offsetDays = 1) {
  const value = new Date()
  value.setDate(value.getDate() + offsetDays)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function toIso(date: string, time: string) { return new Date(`${date}T${time}:00`).toISOString() }

function Brand() {
  return <span className="brand"><span className="brand-shuttle"><i /><i /><i /></span><span>JSPORT<small>RACQUET CLUB</small></span></span>
}

function GoogleMapsIcon() {
  return <svg className="google-maps-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 10c0 5.5-8 12-8 12S4 15.5 4 10a8 8 0 1 1 16 0Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
}

export default function BookingExperience() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [venueId, setVenueId] = useState('')
  const [date, setDate] = useState(localDate())
  const [startTime, setStartTime] = useState('18:00')
  const [duration, setDuration] = useState(60)
  const [courts, setCourts] = useState<Court[]>([])
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [reservationOpen, setReservationOpen] = useState(false)
  const [form, setForm] = useState({ customerName: '', customerEmail: '', customerPhone: '' })

  const range = useMemo(() => {
    const startsAt = toIso(date, startTime)
    const end = new Date(startsAt)
    end.setMinutes(end.getMinutes() + duration)
    return { startsAt, endsAt: end.toISOString() }
  }, [date, startTime, duration])

  const venue = venues.find((item) => item.id === venueId)

  useEffect(() => {
    api.getVenues().then((data) => { setVenues(data); setVenueId(data[0]?.id ?? '') })
      .catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false))
  }, [])

  async function findCourts() {
    if (!venueId) return
    setSearching(true); setSelectedCourt(null); setError('')
    try { setCourts(await api.getCourts(venueId, range.startsAt, range.endsAt)) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not load courts.') }
    finally { setSearching(false) }
  }

  async function submitBooking(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedCourt) return
    setSubmitting(true); setError('')
    try { setBooking(await api.createBooking({ venueId, ...form, ...range })) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not create booking.') }
    finally { setSubmitting(false) }
  }

  return <div className="app-shell">
    <header className="site-header">
      <a href="#top" aria-label="JSport home"><Brand /></a>
      <button className="header-cta" onClick={() => setReservationOpen(true)}>Reserve a court <ArrowRight size={16} /></button>
    </header>

    <main id="top">
      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(4,13,10,.97) 0%, rgba(4,13,10,.85) 37%, rgba(4,13,10,.15) 72%), url(${heroImage})` }}>
        <div className="hero-copy">
          <p className="overline"><span /> Jakarta's private court experience</p>
          <h1>Where every<br />rally feels <em>rare.</em></h1>
          <p className="hero-lead">Exceptional courts. Effortless reservations.<br />Badminton, elevated.</p>
          <div className="hero-actions"><button className="primary-button" onClick={() => setReservationOpen(true)}>Reserve your court <ArrowRight size={18} /></button><a className="maps-button" href="https://maps.google.com" target="_blank" rel="noreferrer"><GoogleMapsIcon /> View our location</a></div>
        </div>
        <div className="hero-aside"><span>EST.</span><strong>2026</strong><i /></div>
      </section>

      {reservationOpen && <div className="reservation-backdrop" role="dialog" aria-modal="true" aria-label="Reserve a court">
      <section className="booking-section reservation-dialog" id="book">
        <button className="reservation-close" aria-label="Close reservation" onClick={() => setReservationOpen(false)}><X size={20} /></button>
        <div className="booking-heading"><div><p className="overline gold">Court reservations</p><h2>Your next match,<br /><em>beautifully arranged.</em></h2></div><p>Select a date and time. We’ll take care of everything else.</p></div>

        <div className="search-panel">
          <label><span><MapPin size={15} /> Club</span><div className="select-wrap"><select value={venueId} onChange={(e) => setVenueId(e.target.value)} disabled={loading}>{loading ? <option>Loading clubs…</option> : venues.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><ChevronDown size={16} /></div></label>
          <label><span><CalendarDays size={15} /> Date</span><input type="date" min={localDate(0)} value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label><span><Clock3 size={15} /> Start time</span><input type="time" step="1800" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label>
          <label><span><Clock3 size={15} /> Duration</span><div className="select-wrap"><select value={duration} onChange={(e) => setDuration(Number(e.target.value))}><option value={60}>1 hour</option><option value={90}>1.5 hours</option><option value={120}>2 hours</option><option value={180}>3 hours</option></select><ChevronDown size={16} /></div></label>
          <button className="search-button" onClick={findCourts} disabled={searching || !venueId}>{searching ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={17} />} Check availability</button>
        </div>

        {error && <div className="alert"><X size={17} /><span>{error}</span></div>}

        {courts.length > 0 && <div className="results-area">
          <div className="results-title"><div><p className="overline gold">Available at {startTime}</p><h3>Choose your court</h3></div><span>{courts.filter((court) => court.isAvailable).length} courts ready</span></div>
          <div className="court-grid">{courts.map((court, index) => {
            const selected = selectedCourt?.id === court.id
            return <button type="button" className={`court-card ${selected ? 'selected' : ''} ${!court.isAvailable ? 'unavailable' : ''}`} key={court.id} disabled={!court.isAvailable} onClick={() => setSelectedCourt(court)}>
              <div className="court-visual"><span className="court-lines" /><span className="court-badge">0{index + 1}</span>{selected && <span className="selected-check"><Check size={15} /></span>}</div>
              <div className="court-details"><div><small>{court.surfaceType} · INDOOR</small><h3>{court.name}</h3><p><Users size={14} /> Up to 4 players</p></div><div className="court-price"><strong>{rupiah.format(court.pricePerHour)}</strong><small>PER HOUR</small></div></div>
              <span className="card-action">{court.isAvailable ? selected ? 'Selected' : 'Select this court' : 'Unavailable'} <ArrowRight size={15} /></span>
            </button>
          })}</div>
        </div>}

        {selectedCourt && <div className="checkout-panel">
          <div className="checkout-summary"><p className="overline gold">Your reservation</p><h2>One final detail.</h2><p>Your court is ready. Add your details and we’ll hold it for 15 minutes.</p>
            <div className="summary-card"><div><small>CLUB</small><strong>{venue?.name}</strong></div><div><small>COURT</small><strong>{selectedCourt.name}</strong></div><div><small>WHEN</small><strong>{displayDate.format(new Date(`${date}T12:00:00`))} · {startTime}</strong></div><div className="total"><small>TOTAL</small><strong>{rupiah.format(selectedCourt.pricePerHour * duration / 60)}</strong></div></div>
          </div>
          <form onSubmit={submitBooking}><div className="form-heading"><span>PLAYER DETAILS</span><ShieldCheck size={18} /></div>
            <label>Full name<input required maxLength={150} placeholder="Enter your full name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} /></label>
            <div className="form-row"><label>Email address<input required type="email" maxLength={254} placeholder="you@example.com" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} /></label><label>WhatsApp<input required type="tel" maxLength={30} placeholder="+62 812 3456 7890" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} /></label></div>
            <button className="primary-button submit-button" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={19} /> : <ShieldCheck size={18} />} Reserve securely <ArrowRight size={18} /></button><small className="secure-note">Secure checkout · No hidden fees · Instant confirmation</small>
          </form>
        </div>}
      </section>
      </div>}

    </main>

    <footer id="contact"><Brand /><p>Private courts. Exceptional play.</p><div><button className="footer-reserve" onClick={() => setReservationOpen(true)}>Reservations</button><span>© 2026 JSport</span></div></footer>

    {booking && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="success-title"><div className="success-modal"><div className="success-icon"><Check size={26} /></div><p className="overline gold">Reservation held</p><h2 id="success-title">See you on court.</h2><p>Your court is held for 15 minutes while payment is completed.</p><div className="booking-code"><small>BOOKING REFERENCE</small><strong>{booking.bookingCode}</strong></div><button className="primary-button" onClick={() => setBooking(null)}>Done <ArrowRight size={17} /></button></div></div>}
  </div>
}

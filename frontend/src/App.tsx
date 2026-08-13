import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, Check, ChevronDown, Clock3, LoaderCircle, MapPin, ShieldCheck, Sparkles, Users, X } from 'lucide-react'
import { api, type Booking, type Court, type Venue } from './api'

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

function localDate(offsetDays = 1) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function toIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString()
}

function App() {
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
  const [form, setForm] = useState({ customerName: '', customerEmail: '', customerPhone: '' })

  const range = useMemo(() => {
    const startsAt = toIso(date, startTime)
    const end = new Date(startsAt)
    end.setMinutes(end.getMinutes() + duration)
    return { startsAt, endsAt: end.toISOString() }
  }, [date, startTime, duration])

  useEffect(() => {
    api.getVenues()
      .then((data) => {
        setVenues(data)
        setVenueId(data[0]?.id ?? '')
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false))
  }, [])

  async function findCourts() {
    if (!venueId) return
    setSearching(true)
    setSelectedCourt(null)
    setError('')
    try {
      setCourts(await api.getCourts(venueId, range.startsAt, range.endsAt))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load courts.')
    } finally {
      setSearching(false)
    }
  }

  async function submitBooking(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedCourt) return
    setSubmitting(true)
    setError('')
    try {
      const result = await api.createBooking({ venueId, ...form, ...range })
      setBooking(result)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create booking.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="JSport home">
          <span className="brand-mark"><span /></span>
          <span>JSPORT</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#book">Book a court</a>
          <a href="#why">Why JSport</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="header-cta" href="#book">Book now <ArrowRight size={16} /></a>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={15} /> Your court is waiting</div>
            <h1>Play more.<br /><em>Wait less.</em></h1>
            <p>Find your perfect badminton court and lock in your game in under a minute.</p>
            <a className="primary-button" href="#book">Find a court <ArrowRight size={18} /></a>
            <div className="hero-proof">
              <div className="avatars"><span>JD</span><span>AR</span><span>MS</span></div>
              <div><strong>Built for every player</strong><small>Simple booking. Secure payment.</small></div>
            </div>
          </div>
          <div className="court-art" aria-label="Stylized badminton court illustration">
            <div className="court-lines"><span className="net" /><span className="center-line" /></div>
            <div className="shuttle"><i /><b /></div>
            <div className="court-card"><Clock3 size={19} /><span><small>Fast booking</small><strong>Under 60 seconds</strong></span></div>
          </div>
        </section>

        <section className="booking-section" id="book">
          <div className="section-heading">
            <div><span className="step-label">01 — BOOK</span><h2>When do you want to play?</h2></div>
            <p>Choose your schedule and we'll show you every available court.</p>
          </div>

          <div className="search-panel">
            <label><span><MapPin size={17} /> Venue</span><div className="select-wrap"><select value={venueId} onChange={(event) => setVenueId(event.target.value)} disabled={loading}>{loading ? <option>Loading venues…</option> : venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select><ChevronDown size={17} /></div></label>
            <label><span><CalendarDays size={17} /> Date</span><input type="date" min={localDate(0)} value={date} onChange={(event) => setDate(event.target.value)} /></label>
            <label><span><Clock3 size={17} /> Start</span><input type="time" step="1800" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
            <label><span><Clock3 size={17} /> Duration</span><div className="select-wrap"><select value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value={60}>1 hour</option><option value={90}>1.5 hours</option><option value={120}>2 hours</option><option value={180}>3 hours</option></select><ChevronDown size={17} /></div></label>
            <button className="search-button" onClick={findCourts} disabled={searching || !venueId}>{searching ? <LoaderCircle className="spin" size={19} /> : <ArrowRight size={19} />} Find courts</button>
          </div>

          {error && <div className="alert"><X size={18} /><span>{error}</span></div>}

          {courts.length > 0 && <div className="results-area">
            <div className="results-title"><h3>Available courts</h3><span>{courts.filter((court) => court.isAvailable).length} of {courts.length} available</span></div>
            <div className="court-grid">
              {courts.map((court, index) => <article className={`court-option ${selectedCourt?.id === court.id ? 'selected' : ''} ${!court.isAvailable ? 'unavailable' : ''}`} key={court.id}>
                <div className="court-number">0{index + 1}</div>
                <div className="court-icon"><span /><i /></div>
                <div className="court-info"><small>{court.surfaceType} court</small><h3>{court.name}</h3><p><Users size={15} /> Up to 4 players</p></div>
                <div className="court-price"><strong>{rupiah.format(court.pricePerHour)}</strong><small>/ hour</small></div>
                <button disabled={!court.isAvailable} onClick={() => setSelectedCourt(court)}>{court.isAvailable ? selectedCourt?.id === court.id ? <><Check size={16} /> Selected</> : 'Select court' : 'Unavailable'}</button>
              </article>)}
            </div>
          </div>}

          {selectedCourt && <div className="checkout-panel">
            <div className="checkout-summary">
              <span className="step-label">02 — DETAILS</span>
              <h2>Almost game time.</h2>
              <p>We'll hold this slot for 15 minutes while you complete payment.</p>
              <div className="summary-card">
                <div><small>COURT</small><strong>{selectedCourt.name}</strong></div>
                <div><small>DATE & TIME</small><strong>{new Date(range.startsAt).toLocaleDateString('en-ID', { day: 'numeric', month: 'short' })} · {startTime}</strong></div>
                <div><small>TOTAL</small><strong>{rupiah.format(selectedCourt.pricePerHour * duration / 60)}</strong></div>
              </div>
            </div>
            <form onSubmit={submitBooking}>
              <label>Full name<input required maxLength={150} placeholder="Your full name" value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} /></label>
              <label>Email address<input required type="email" maxLength={254} placeholder="you@example.com" value={form.customerEmail} onChange={(event) => setForm({ ...form, customerEmail: event.target.value })} /></label>
              <label>WhatsApp number<input required type="tel" maxLength={30} placeholder="+62 812 3456 7890" value={form.customerPhone} onChange={(event) => setForm({ ...form, customerPhone: event.target.value })} /></label>
              <button className="primary-button submit-button" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={19} /> : <ShieldCheck size={19} />} Reserve & continue to payment</button>
              <small className="secure-note"><ShieldCheck size={14} /> Secure payment powered by Midtrans</small>
            </form>
          </div>}
        </section>

        <section className="why-section" id="why">
          <div><span className="step-label">WHY JSPORT</span><h2>Less admin.<br />More badminton.</h2></div>
          <div className="benefits"><article><strong>01</strong><h3>Real-time availability</h3><p>What you see is what you can book. No chats, no waiting.</p></article><article><strong>02</strong><h3>Instant confirmation</h3><p>Your court is secured the moment your payment lands.</p></article><article><strong>03</strong><h3>Built for Indonesia</h3><p>Local time, Rupiah pricing, and trusted Midtrans payments.</p></article></div>
        </section>
      </main>

      <footer id="contact"><div className="brand"><span className="brand-mark"><span /></span><span>JSPORT</span></div><p>Good games start with an easy booking.</p><span>© 2026 JSport</span></footer>

      {booking && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="success-title">
        <div className="success-modal"><div className="success-icon"><Check size={30} /></div><span className="step-label">COURT RESERVED</span><h2 id="success-title">You're on the court.</h2><p>Your slot is held for 15 minutes. Midtrans payment will be connected next.</p><div className="booking-code"><small>BOOKING CODE</small><strong>{booking.bookingCode}</strong></div><button className="primary-button" onClick={() => setBooking(null)}>Done</button></div>
      </div>}
    </div>
  )
}

export default App

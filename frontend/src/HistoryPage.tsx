import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { CalendarDays, Clock3, LoaderCircle } from 'lucide-react'
import { api, type Booking } from './api'
import { auth } from './firebase'
import SiteHeader from './SiteHeader'
import { useLanguage } from './LanguageContext'

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const bookingStatus = (value: string | number) => typeof value === 'string' ? value : ['PendingPayment', 'Confirmed', 'Cancelled', 'Expired', 'PaymentFailed'][value] ?? 'Unknown'

export default function HistoryPage() {
  const { language } = useLanguage()
  const id = language === 'id'
  const date = new Intl.DateTimeFormat(id ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const statusLabel = (status: string) => id ? ({ PendingPayment: 'Menunggu pembayaran', Confirmed: 'Dikonfirmasi', Cancelled: 'Dibatalkan', Expired: 'Kedaluwarsa', PaymentFailed: 'Pembayaran gagal', Unknown: 'Tidak diketahui' }[status] ?? status) : status.replace(/([A-Z])/g, ' $1')
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
    <div className="history-heading"><span className="step-label">{id ? 'AKUN ANDA' : 'YOUR ACCOUNT'}</span><h1>{id ? 'Riwayat pemesanan.' : 'Booking history.'}</h1><p>{id ? 'Reservasi lapangan yang akan datang dan yang telah berlalu di akun Anda.' : 'Past and upcoming court reservations connected to your account.'}</p></div>
    {loading ? <div className="history-state"><LoaderCircle className="spin"/> {id ? 'Memuat pemesanan Anda…' : 'Loading your bookings…'}</div>
      : !signedIn ? <div className="history-state"><h2>{id ? 'Masuk untuk melihat riwayat Anda.' : 'Sign in to see your history.'}</h2><p>{id ? 'Reservasi Anda bersifat privat dan hanya tersedia melalui akun Anda.' : 'Your reservations are private and only available to your account.'}</p><a className="primary-button" href="/">{id ? 'Kembali ke beranda' : 'Return home'}</a></div>
      : error ? <div className="history-state"><h2>{id ? 'Pemesanan Anda tidak dapat dimuat.' : 'We couldn’t load your bookings.'}</h2><p>{error}</p></div>
      : bookings.length === 0 ? <div className="history-state"><CalendarDays/><h2>{id ? 'Belum ada pemesanan.' : 'No bookings yet.'}</h2><p>{id ? 'Reservasi pertama Anda akan muncul di sini setelah memesan lapangan.' : 'Your first reservation will appear here after you book a court.'}</p><a className="primary-button" href="/?reserve=1">{id ? 'Pesan lapangan' : 'Reserve a court'}</a></div>
      : <div className="history-list">{bookings.map(booking => { const status = bookingStatus(booking.status); return <article key={booking.id}><div><small>{booking.bookingCode}</small><h2>{booking.courtName}</h2><p><CalendarDays size={15}/>{date.format(new Date(booking.startsAt))}<Clock3 size={15}/>{time.format(new Date(booking.startsAt))}–{time.format(new Date(booking.endsAt))}</p></div><div className="history-meta"><span className={`booking-status ${status.toLowerCase()}`}>{statusLabel(status)}</span><strong>{rupiah.format(booking.totalAmount)}</strong></div></article> })}</div>}
  </main></div>
}

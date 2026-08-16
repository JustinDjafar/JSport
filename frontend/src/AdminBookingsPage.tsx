import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { ArrowDownAZ, CalendarDays, Clock3, LoaderCircle, ShieldX } from 'lucide-react'
import { api, type Booking } from './api'
import { auth } from './firebase'
import SiteHeader from './SiteHeader'
import { useLanguage } from './LanguageContext'

type SortKey = 'name' | 'date' | 'court'
const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const bookingStatus = (value: string | number) => typeof value === 'string' ? value : ['PendingPayment', 'Confirmed', 'Cancelled', 'Expired', 'PaymentFailed'][value] ?? 'Unknown'

export default function AdminBookingsPage() {
  const { language } = useLanguage()
  const id = language === 'id'
  const date = new Intl.DateTimeFormat(id ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const statusLabel = (status: string) => id ? ({ PendingPayment: 'Menunggu pembayaran', Confirmed: 'Dikonfirmasi', Cancelled: 'Dibatalkan', Expired: 'Kedaluwarsa', PaymentFailed: 'Pembayaran gagal', Unknown: 'Tidak diketahui' }[status] ?? status) : status.replace(/([A-Z])/g, ' $1')
  const [state, setState] = useState<'loading' | 'allowed' | 'denied' | 'error'>('loading')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [sort, setSort] = useState<SortKey>('date')
  const [ascending, setAscending] = useState(false)

  useEffect(() => onAuthStateChanged(auth, user => {
    if (!user) { setState('denied'); return }
    Promise.all([api.verifyAdminAccess(), api.getAdminBookings()])
      .then(([, values]) => { setBookings(values); setState('allowed') })
      .catch(() => setState('denied'))
  }), [])

  const sorted = useMemo(() => [...bookings].sort((a, b) => {
    const left = sort === 'name' ? a.customerName.toLocaleLowerCase() : sort === 'court' ? a.courtName.toLocaleLowerCase() : new Date(a.startsAt).getTime()
    const right = sort === 'name' ? b.customerName.toLocaleLowerCase() : sort === 'court' ? b.courtName.toLocaleLowerCase() : new Date(b.startsAt).getTime()
    const comparison = left < right ? -1 : left > right ? 1 : 0
    return ascending ? comparison : -comparison
  }), [bookings, sort, ascending])

  return <div className="history-page admin-bookings-page"><SiteHeader active="home"/><main>
    <div className="history-heading"><span className="step-label">{id ? 'ADMINISTRASI' : 'ADMINISTRATION'}</span><h1>{id ? 'Semua pemesanan.' : 'All bookings.'}</h1><p>{id ? 'Seluruh reservasi lapangan dari semua anggota JSport.' : 'Every court reservation across all JSport members.'}</p></div>
    {state === 'loading' ? <div className="history-state"><LoaderCircle className="spin"/> {id ? 'Memverifikasi akses dan memuat pemesanan…' : 'Verifying access and loading bookings…'}</div>
      : state === 'denied' ? <div className="history-state"><ShieldX/><h2>{id ? 'Khusus admin.' : 'Admins only.'}</h2><p>{id ? 'Akun Anda tidak memiliki izin untuk melihat semua pemesanan.' : 'Your account does not have permission to view all bookings.'}</p><a className="primary-button" href="/">{id ? 'Kembali ke beranda' : 'Return home'}</a></div>
      : <><div className="booking-sort-bar"><div><ArrowDownAZ size={17}/><span>{id ? 'Urutkan pemesanan berdasarkan' : 'Sort bookings by'}</span></div><div className="sort-controls"><select aria-label={id ? 'Urutkan pemesanan berdasarkan' : 'Sort bookings by'} value={sort} onChange={event => setSort(event.target.value as SortKey)}><option value="name">{id ? 'Nama pelanggan' : 'Customer name'}</option><option value="date">{id ? 'Tanggal pemesanan' : 'Booking date'}</option><option value="court">{id ? 'Nomor lapangan' : 'Court number'}</option></select><button onClick={() => setAscending(value => !value)}>{ascending ? (id ? 'Menaik' : 'Ascending') : (id ? 'Menurun' : 'Descending')}</button></div></div>
        {sorted.length === 0 ? <div className="history-state"><CalendarDays/><h2>{id ? 'Belum ada pemesanan.' : 'No bookings yet.'}</h2><p>{id ? 'Reservasi anggota baru akan muncul di sini.' : 'New member reservations will appear here.'}</p></div>
          : <div className="history-list admin-booking-list">{sorted.map(booking => { const status = bookingStatus(booking.status); return <article key={booking.id}><div className="booking-customer"><small>{booking.bookingCode}</small><h2>{booking.customerName}</h2><a href={`mailto:${booking.customerEmail}`}>{booking.customerEmail}</a><span>{booking.customerPhone}</span></div><div className="booking-schedule"><strong>{booking.courtName}</strong><p><CalendarDays size={15}/>{date.format(new Date(booking.startsAt))}</p><p><Clock3 size={15}/>{time.format(new Date(booking.startsAt))}–{time.format(new Date(booking.endsAt))}</p></div><div className="history-meta"><span className={`booking-status ${status.toLowerCase()}`}>{statusLabel(status)}</span><strong>{rupiah.format(booking.totalAmount)}</strong></div></article> })}</div>}
      </>}
  </main></div>
}

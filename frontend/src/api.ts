import { auth } from './firebase'

export type Court = {
  id: string
  name: string
  isAvailable: boolean
  status: 'available' | 'held' | 'booked'
}

export type Booking = {
  id: string
  bookingCode: string
  courtId: string
  courtName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  startsAt: string
  endsAt: string
  totalAmount: number
  status: string | number
  holdExpiresAt: string
}

export type CreateBooking = {
  startsAt: string
  endsAt: string
}

export type BookingGroup = {
  bookings: Booking[]
  courtCount: number
  totalAmount: number
  holdExpiresAt: string
}

export type AvailabilitySlot = {
  startsAt: string
  endsAt: string
  availableCourts: number
  heldCourts: number
  bookedCourts: number
  totalCourts: number
}

const apiUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await auth.currentUser?.getIdToken()
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
  })

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string; title?: string } | null
    throw new Error(problem?.detail ?? problem?.title ?? 'Something went wrong. Please try again.')
  }

  return response.json() as Promise<T>
}

export const api = {
  getCourts: (startsAt: string, endsAt: string) => {
    const query = new URLSearchParams({ startsAt, endsAt })
    return request<Court[]>(`/api/courts?${query}`)
  },
  getAvailability: (startsAt: string, endsAt: string, durationMinutes: number) => {
    const query = new URLSearchParams({ startsAt, endsAt, durationMinutes: String(durationMinutes) })
    return request<AvailabilitySlot[]>(`/api/courts/availability?${query}`)
  },
  createBooking: (booking: CreateBooking) => request<Booking>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  }),
  createBookingGroup: (booking: CreateBooking & { courtIds: string[] }) => request<BookingGroup>('/api/bookings/group', {
    method: 'POST',
    body: JSON.stringify(booking),
  }),
  getBookingHistory: () => request<Booking[]>('/api/bookings'),
  verifyAdminAccess: () => request<{ role: 'admin' }>('/api/admin/access'),
  getAdminBookings: () => request<Booking[]>('/api/admin/bookings'),
  getProfile: () => request<UserProfile>('/api/users/me'),
  saveProfile: (profile: Pick<UserProfile, 'username' | 'phoneNumber'>) => request<UserProfile>('/api/users/me', { method: 'PUT', body: JSON.stringify(profile) }),
}

export type UserProfile = { id: string; username: string; phoneNumber: string; email: string; role: string }

export type Venue = {
  id: string
  name: string
  address: string
  timeZone: string
}

export type Court = {
  id: string
  name: string
  surfaceType: string
  pricePerHour: number
  isAvailable: boolean
}

export type Booking = {
  id: string
  bookingCode: string
  courtId: string
  courtName: string
  venueName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  startsAt: string
  endsAt: string
  totalAmount: number
  status: string
  holdExpiresAt: string
}

export type CreateBooking = {
  venueId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  startsAt: string
  endsAt: string
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
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string; title?: string } | null
    throw new Error(problem?.detail ?? problem?.title ?? 'Something went wrong. Please try again.')
  }

  return response.json() as Promise<T>
}

export const api = {
  getVenues: () => request<Venue[]>('/api/venues'),
  getCourts: (venueId: string, startsAt: string, endsAt: string) => {
    const query = new URLSearchParams({ startsAt, endsAt })
    return request<Court[]>(`/api/venues/${venueId}/courts?${query}`)
  },
  getAvailability: (venueId: string, startsAt: string, endsAt: string, durationMinutes: number) => {
    const query = new URLSearchParams({ startsAt, endsAt, durationMinutes: String(durationMinutes) })
    return request<AvailabilitySlot[]>(`/api/venues/${venueId}/availability?${query}`)
  },
  createBooking: (booking: CreateBooking) => request<Booking>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  }),
}

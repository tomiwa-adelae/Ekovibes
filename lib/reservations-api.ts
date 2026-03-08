import { fetchData, postData, updateData, publicFetch } from './api';

export type VenueType = 'RESTAURANT' | 'NIGHTCLUB' | 'LOUNGE' | 'PRIVATE_DINING' | 'ROOFTOP';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface Venue {
  id: string;
  name: string;
  description: string | null;
  type: VenueType;
  address: string;
  city: string;
  coverImage: string | null;
  instagram: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { reservations: number };
}

export interface Reservation {
  id: string;
  venueId: string;
  userId: string;
  date: string;
  time: string;
  partySize: number;
  notes: string | null;
  status: ReservationStatus;
  adminNote: string | null;
  createdAt: string;
  venue?: Pick<Venue, 'id' | 'name' | 'type' | 'coverImage' | 'city'>;
  user?: { firstName: string; lastName: string; email: string; phone: string | null };
}

export interface PaginatedReservations {
  data: Reservation[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ── Public ─────────────────────────────────────────────────────────────────────

export function getVenues(query: { city?: string; type?: VenueType } = {}): Promise<Venue[]> {
  const params = new URLSearchParams();
  if (query.city) params.set('city', query.city);
  if (query.type) params.set('type', query.type);
  const qs = params.toString();
  return publicFetch<Venue[]>(`/venues${qs ? `?${qs}` : ''}`);
}

export function getVenueById(id: string): Promise<Venue> {
  return publicFetch<Venue>(`/venues/${id}`);
}

// ── User ───────────────────────────────────────────────────────────────────────

export function createReservation(dto: {
  venueId: string;
  date: string;
  time: string;
  partySize: number;
  notes?: string;
}): Promise<Reservation> {
  return postData<Reservation>('/reservations', dto);
}

export function getUserReservations(): Promise<Reservation[]> {
  return fetchData<Reservation[]>('/reservations/my');
}

export function cancelReservation(id: string): Promise<Reservation> {
  return updateData<Reservation>(`/reservations/${id}/cancel`, {});
}

// ── Admin ──────────────────────────────────────────────────────────────────────

export function getAdminVenues(): Promise<Venue[]> {
  return fetchData<Venue[]>('/a/venues');
}

export function createVenue(dto: Partial<Venue>): Promise<Venue> {
  return postData<Venue>('/a/venues', dto);
}

export function updateVenue(id: string, dto: Partial<Venue>): Promise<Venue> {
  return updateData<Venue>(`/a/venues/${id}`, dto);
}

export function getAdminReservations(query: {
  status?: ReservationStatus;
  venueId?: string;
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedReservations> {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.venueId) params.set('venueId', query.venueId);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();
  return fetchData<PaginatedReservations>(`/a/reservations${qs ? `?${qs}` : ''}`);
}

export function confirmReservation(id: string, adminNote?: string): Promise<Reservation> {
  return postData<Reservation>(`/a/reservations/${id}/confirm`, { adminNote: adminNote ?? '' });
}

export function rejectReservation(id: string, adminNote?: string): Promise<Reservation> {
  return postData<Reservation>(`/a/reservations/${id}/reject`, { adminNote: adminNote ?? '' });
}

import { fetchData, postData, updateData, deleteData, publicFetch, uploadFile } from './api';

// ─── Shared Types ──────────────────────────────────────────────────────────────

export type EventCategory =
  | 'CONCERT'
  | 'PRIVATE_DINING'
  | 'ART_EXHIBITION'
  | 'NIGHTLIFE'
  | 'FESTIVAL'
  | 'WELLNESS'
  | 'SPORT'
  | 'OTHER';

export type EventStatus = 'DRAFT' | 'LIVE' | 'SOLD_OUT' | 'CANCELLED' | 'ENDED';

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number; // kobo
  quantity: number;
  sold: number;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: EventCategory;
  status: EventStatus;
  coverImage?: string;
  date: string;
  doorsOpen: string;
  venueName: string;
  venueAddress?: string;
  city?: string;
  dressCode?: string;
  isMemberOnly: boolean;
  ticketTiers: TicketTier[];
  totalCapacity?: number;
  totalSold?: number;
  totalRevenue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEventWithStats extends Event {
  totalCapacity: number;
  totalSold: number;
  totalRevenue: number;
  _count?: { orders: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminStats {
  totalEvents: number;
  liveEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalOrders: number;
}

export interface Ticket {
  id: string;
  code: string;
  orderId: string;
  isUsed: boolean;
  usedAt?: string;
  order: {
    reference: string;
    event: {
      title: string;
      slug: string;
      date: string;
      doorsOpen: string;
      venueName: string;
      venueAddress?: string;
      coverImage?: string;
      category: EventCategory;
    };
  };
  orderItem: {
    ticketTier: {
      name: string;
      price: number;
    };
  };
}

export interface InitiateOrderResponse {
  orderId: string;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  total: number;
  subtotal: number;
  serviceFee: number;
}

export interface ScanResult {
  valid: boolean;
  reason?: string;
  holder: string;
  tier: string;
  event: string;
  usedAt?: string;
}

// ─── Event Queries ─────────────────────────────────────────────────────────────

export interface EventQuery {
  search?: string;
  category?: EventCategory;
  status?: EventStatus;
  page?: number;
  limit?: number;
}

// ─── Public API (no auth) ──────────────────────────────────────────────────────

export function getPublicEvents(
  query: Omit<EventQuery, 'status'> = {},
): Promise<PaginatedResponse<Event>> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();
  return publicFetch<PaginatedResponse<Event>>(`/events${qs ? `?${qs}` : ''}`);
}

export function getEventBySlug(slug: string): Promise<Event> {
  return publicFetch<Event>(`/events/${slug}`);
}

// ─── Admin API (auth + admin role required) ────────────────────────────────────

export function getAdminEvents(
  query: EventQuery = {},
): Promise<PaginatedResponse<AdminEventWithStats>> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  if (query.status) params.set('status', query.status);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();
  return fetchData<PaginatedResponse<AdminEventWithStats>>(
    `/a/events${qs ? `?${qs}` : ''}`,
  );
}

export function getAdminEventById(id: string): Promise<AdminEventWithStats> {
  return fetchData<AdminEventWithStats>(`/a/events/${id}`);
}

export function getAdminStats(): Promise<AdminStats> {
  return fetchData<AdminStats>('/a/events/stats');
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  category: EventCategory;
  coverImage?: string;
  date: string;
  doorsOpen: string;
  venueName: string;
  venueAddress?: string;
  city?: string;
  dressCode?: string;
  isMemberOnly?: boolean;
  ticketTiers: {
    name: string;
    description?: string;
    price: number; // kobo
    quantity: number;
  }[];
}

export async function uploadEventCover(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await uploadFile<{ url: string }>('/upload/event-cover', formData);
  return res.url;
}

export function createEvent(dto: CreateEventPayload): Promise<Event> {
  return postData<Event>('/a/events', dto);
}

export function updateEvent(
  id: string,
  dto: Partial<CreateEventPayload>,
): Promise<Event> {
  return updateData<Event>(`/a/events/${id}`, dto);
}

export function updateEventStatus(
  id: string,
  status: EventStatus,
): Promise<Event> {
  return updateData<Event>(`/a/events/${id}/status`, { status });
}

export function deleteEvent(id: string): Promise<void> {
  return deleteData<void>(`/a/events/${id}`);
}

// ─── Orders & Tickets ──────────────────────────────────────────────────────────

export function initiateOrder(dto: {
  eventId: string;
  tierId: string;
  quantity: number;
}): Promise<InitiateOrderResponse> {
  return postData<InitiateOrderResponse>('/orders/initiate', dto);
}

export function verifyOrder(reference: string): Promise<{
  order: { reference: string; total: number };
  tickets: Ticket[];
}> {
  return postData('/orders/verify', { reference });
}

export function getMyTickets(): Promise<Ticket[]> {
  return fetchData<Ticket[]>('/orders/my-tickets');
}

export function scanTicket(code: string): Promise<ScanResult> {
  return postData<ScanResult>('/a/tickets/scan', { code });
}

// ─── Utility ───────────────────────────────────────────────────────────────────

/** Convert kobo to formatted naira string */
export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(naira);
}

/** Convert naira to kobo for API calls */
export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  CONCERT: 'Concert / Live Music',
  PRIVATE_DINING: 'Private Dining',
  ART_EXHIBITION: 'Art Exhibition',
  NIGHTLIFE: 'Nightlife / Club',
  FESTIVAL: 'Festival',
  WELLNESS: 'Wellness',
  SPORT: 'Sport',
  OTHER: 'Other',
};

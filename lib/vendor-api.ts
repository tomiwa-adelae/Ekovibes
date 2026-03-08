import { fetchData, postData, updateData, deleteData, uploadFile } from './api';
import type {
  AdminEventWithStats,
  AdminStats,
  CreateEventPayload,
  Event,
  EventQuery,
  EventStatus,
  PaginatedResponse,
  ScanResult,
} from './events-api';

// ─── Vendor Stats ──────────────────────────────────────────────────────────────

export interface VendorStats {
  totalEvents: number;
  liveEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalOrders: number;
}

export function getVendorStats(): Promise<VendorStats> {
  return fetchData<VendorStats>('/vendor/events/stats');
}

// ─── Vendor Events ─────────────────────────────────────────────────────────────

export function getVendorEvents(
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
    `/vendor/events${qs ? `?${qs}` : ''}`,
  );
}

export function getVendorEventById(id: string): Promise<AdminEventWithStats> {
  return fetchData<AdminEventWithStats>(`/vendor/events/${id}`);
}

export function createVendorEvent(dto: CreateEventPayload): Promise<Event> {
  return postData<Event>('/vendor/events', dto);
}

export function updateVendorEvent(
  id: string,
  dto: Partial<CreateEventPayload>,
): Promise<Event> {
  return updateData<Event>(`/vendor/events/${id}`, dto);
}

export function updateVendorEventStatus(
  id: string,
  status: EventStatus,
): Promise<Event> {
  return updateData<Event>(`/vendor/events/${id}/status`, { status });
}

export function deleteVendorEvent(id: string): Promise<void> {
  return deleteData<void>(`/vendor/events/${id}`);
}

export function resubmitVendorEvent(id: string): Promise<Event> {
  return postData<Event>(`/vendor/events/${id}/resubmit`, {});
}

export async function uploadVendorEventCover(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await uploadFile<{ url: string }>('/upload/event-cover', formData);
  return res.url;
}

// ─── Vendor Profile ────────────────────────────────────────────────────────────

export interface VendorProfile {
  id: string;
  brandName: string;
  brandBio: string | null;
  website: string | null;
  instagram: string | null;
  logoUrl: string | null;
}

export function getVendorProfile(): Promise<VendorProfile> {
  return fetchData<VendorProfile>('/auth/vendor-profile');
}

export function updateVendorProfile(dto: Partial<Omit<VendorProfile, 'id'>>): Promise<VendorProfile> {
  return updateData<VendorProfile>('/auth/vendor-profile', dto);
}

export async function uploadVendorLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await uploadFile<{ url: string }>('/upload/event-cover', formData);
  return res.url;
}

// ─── Vendor Tickets / Scan ─────────────────────────────────────────────────────

export interface AttendeeTicket {
  id: string;
  code: string;
  holder: string;
  email: string;
  tier: string;
  isUsed: boolean;
  usedAt: string | null;
  orderRef: string;
}

export interface AttendeesResponse {
  total: number;
  checkedIn: number;
  tickets: AttendeeTicket[];
}

export function getVendorEventAttendees(eventId: string): Promise<AttendeesResponse> {
  return fetchData<AttendeesResponse>(`/vendor/events/${eventId}/attendees`);
}

export function getVendorTicketByCode(code: string): Promise<any> {
  return fetchData<any>(`/vendor/tickets/${code}`);
}

export function scanVendorTicket(code: string): Promise<ScanResult> {
  return postData<ScanResult>('/vendor/tickets/scan', { code });
}

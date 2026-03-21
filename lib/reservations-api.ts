import { fetchData, postData, updateData, deleteData, publicFetch, uploadFile } from './api';
import api from './api';

// ── Enums & Types ──────────────────────────────────────────────────────────────

export type VenueCategory =
  | 'RESTAURANT' | 'BAR' | 'NIGHTCLUB' | 'LOUNGE' | 'ROOFTOP_BAR'
  | 'BEACH_CLUB' | 'POOL_CLUB' | 'SPA' | 'WELLNESS_CENTER'
  | 'PRIVATE_MEMBERS_CLUB' | 'PRIVATE_DINING' | 'CIGAR_LOUNGE'
  | 'WINE_BAR' | 'COCKTAIL_BAR' | 'JAZZ_CLUB' | 'LIVE_MUSIC_VENUE'
  | 'SPORTS_BAR' | 'HOOKAH_LOUNGE' | 'POP_UP' | 'YACHT' | 'OTHER';

export type VenueStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'LIVE' | 'SUSPENDED';
export type BookingMode = 'INSTANT' | 'REQUEST';
export type SpaceType = 'TABLE' | 'SECTION' | 'PRIVATE_ROOM' | 'BAR_SEATING' | 'OUTDOOR';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type DepositType = 'NONE' | 'FLAT' | 'PERCENTAGE_OF_MIN_SPEND';
export type ReservationStatus =
  | 'PENDING_PAYMENT' | 'PENDING_APPROVAL' | 'CONFIRMED' | 'REJECTED'
  | 'MODIFIED' | 'CANCELLED_BY_GUEST' | 'CANCELLED_BY_VENUE' | 'COMPLETED' | 'NO_SHOW';
export type ReservationPaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED_FULL' | 'REFUNDED_PARTIAL' | 'FAILED';
export type WaitlistStatus = 'WAITING' | 'NOTIFIED' | 'CLAIMED' | 'EXPIRED';

export const VENUE_CATEGORY_LABELS: Record<VenueCategory, string> = {
  RESTAURANT: 'Restaurant', BAR: 'Bar', NIGHTCLUB: 'Nightclub', LOUNGE: 'Lounge',
  ROOFTOP_BAR: 'Rooftop Bar', BEACH_CLUB: 'Beach Club', POOL_CLUB: 'Pool Club',
  SPA: 'Spa', WELLNESS_CENTER: 'Wellness Centre', PRIVATE_MEMBERS_CLUB: 'Private Members Club',
  PRIVATE_DINING: 'Private Dining', CIGAR_LOUNGE: 'Cigar Lounge', WINE_BAR: 'Wine Bar',
  COCKTAIL_BAR: 'Cocktail Bar', JAZZ_CLUB: 'Jazz Club', LIVE_MUSIC_VENUE: 'Live Music',
  SPORTS_BAR: 'Sports Bar', HOOKAH_LOUNGE: 'Hookah Lounge', POP_UP: 'Pop-Up',
  YACHT: 'Yacht', OTHER: 'Other',
};

export const VENUE_CATEGORIES: VenueCategory[] = Object.keys(VENUE_CATEGORY_LABELS) as VenueCategory[];

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  TABLE: 'Table', SECTION: 'Section', PRIVATE_ROOM: 'Private Room',
  BAR_SEATING: 'Bar Seating', OUTDOOR: 'Outdoor',
};

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
];

// ── Interfaces ─────────────────────────────────────────────────────────────────

export interface VenueOwnerProfile {
  id: string;
  userId: string;
  businessName: string;
  businessEmail: string | null;
  businessPhone: string | null;
  paystackSubaccountCode: string | null;
  bankCode: string | null;
  accountNumber: string | null;
  accountName: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  venues?: { id: string; name: string; slug: string; status: VenueStatus }[];
}

export interface VenueSpace {
  id: string;
  venueId: string;
  name: string;
  type: SpaceType;
  capacity: number;
  description: string | null;
  minSpend: number | null;
  images: string[];
  isActive: boolean;
}

export interface VenueOperatingHours {
  id: string;
  venueId: string;
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface VenueSession {
  id: string;
  venueId: string;
  name: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  daysOfWeek: DayOfWeek[];
  isActive: boolean;
}

export interface VenueBlockedDate {
  id: string;
  venueId: string;
  spaceId: string | null;
  date: string;
  reason: string | null;
  createdAt: string;
}

export interface ReservationPolicy {
  id: string;
  venueId: string;
  depositType: DepositType;
  depositAmount: number | null;
  depositPercent: number | null;
  fullRefundHoursThreshold: number | null;
  partialRefundHoursThreshold: number | null;
  partialRefundPercent: number | null;
  modificationAllowedHoursBefore: number;
}

export interface Venue {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: VenueCategory;
  status: VenueStatus;
  bookingMode: BookingMode;
  address: string;
  city: string;
  state: string | null;
  country: string;
  coverImage: string | null;
  images: string[];
  phone: string | null;
  email: string | null;
  instagram: string | null;
  website: string | null;
  platformFeePercent: number;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  // Includes
  spaces?: VenueSpace[];
  operatingHours?: VenueOperatingHours[];
  sessions?: VenueSession[];
  blockedDates?: VenueBlockedDate[];
  policy?: ReservationPolicy | null;
  owner?: VenueOwnerProfile & {
    user?: { firstName: string; lastName: string; email: string };
  };
  _count?: { spaces: number; reservations: number };
}

export interface ReservationPayment {
  id: string;
  reservationId: string;
  paystackReference: string | null;
  amount: number;
  platformFee: number;
  venuePayout: number;
  refundedAmount: number;
  status: ReservationPaymentStatus;
  paidAt: string | null;
  refundedAt: string | null;
}

export interface ReservationSpace {
  id: string;
  spaceId: string;
  space: Pick<VenueSpace, 'name' | 'type'>;
}

export interface Reservation {
  id: string;
  reference: string;
  venueId: string;
  userId: string;
  sessionId: string | null;
  date: string;
  timeSlot: string;
  partySize: number;
  status: ReservationStatus;
  notes: string | null;
  specialRequests: string | null;
  venueNote: string | null;
  adminNote: string | null;
  depositAmount: number;
  platformFee: number;
  venuePayout: number;
  confirmedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Includes
  venue?: Pick<Venue, 'id' | 'name' | 'slug' | 'coverImage' | 'city' | 'address' | 'phone' | 'category' | 'bookingMode'>;
  user?: { firstName: string; lastName: string; email: string; phoneNumber: string | null };
  session?: { name: string } | null;
  spaces?: ReservationSpace[];
  payment?: ReservationPayment | null;
}

export interface ReservationWaitlist {
  id: string;
  venueId: string;
  userId: string;
  sessionId: string | null;
  date: string;
  timeSlot: string;
  partySize: number;
  status: WaitlistStatus;
  notifiedAt: string | null;
  claimExpiresAt: string | null;
  createdAt: string;
}

export interface AvailableSlot {
  timeSlot: string;
  available: boolean;
  availableSpaces: Pick<VenueSpace, 'id' | 'name' | 'type' | 'capacity' | 'minSpend'>[];
}

export interface AvailabilitySession {
  sessionId: string;
  sessionName: string;
  startTime: string;
  endTime: string;
  slots: AvailableSlot[];
}

export interface AvailabilityResult {
  date: string;
  blocked?: boolean;
  closed?: boolean;
  venue?: { id: string; slug: string; bookingMode: BookingMode };
  sessions: AvailabilitySession[];
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
}

// ── Public ─────────────────────────────────────────────────────────────────────

export function getVenues(query: {
  city?: string;
  category?: VenueCategory;
  page?: number;
  limit?: number;
} = {}): Promise<Paginated<Venue>> {
  const p = new URLSearchParams();
  if (query.city) p.set('city', query.city);
  if (query.category) p.set('category', query.category);
  if (query.page) p.set('page', String(query.page));
  if (query.limit) p.set('limit', String(query.limit));
  const qs = p.toString();
  return publicFetch<Paginated<Venue>>(`/venues${qs ? `?${qs}` : ''}`);
}

export function getVenueBySlug(slug: string): Promise<Venue> {
  return publicFetch<Venue>(`/venues/${slug}`);
}

export function getAvailability(slug: string, date: string, partySize: number): Promise<AvailabilityResult> {
  return publicFetch<AvailabilityResult>(`/venues/${slug}/availability?date=${date}&partySize=${partySize}`);
}

// ── Customer: Reservations ─────────────────────────────────────────────────────

export function initiateReservation(dto: {
  venueSlug: string;
  sessionId: string;
  date: string;
  timeSlot: string;
  partySize: number;
  spaceIds: string[];
  notes?: string;
  specialRequests?: string;
}): Promise<{
  reservation: Reservation;
  payment?: { authorizationUrl: string; accessCode: string; paystackReference: string };
  message?: string;
}> {
  return postData('/reservations/initiate', dto);
}

export function verifyReservationPayment(paystackReference: string): Promise<{
  reservation: Reservation;
  payment: ReservationPayment;
}> {
  return postData('/reservations/verify', { paystackReference });
}

export function getMyReservations(status?: ReservationStatus): Promise<Reservation[]> {
  const qs = status ? `?status=${status}` : '';
  return fetchData<Reservation[]>(`/reservations/my${qs}`);
}

export function getMyReservationById(id: string): Promise<Reservation> {
  return fetchData<Reservation>(`/reservations/my/${id}`);
}

export function modifyReservation(id: string, dto: {
  date?: string;
  timeSlot?: string;
  sessionId?: string;
  partySize?: number;
  spaceIds?: string[];
  notes?: string;
  specialRequests?: string;
}): Promise<Reservation> {
  return updateData<Reservation>(`/reservations/my/${id}/modify`, dto);
}

export function cancelReservation(id: string): Promise<{ reservation: Reservation; refundAmount: number }> {
  return postData(`/reservations/my/${id}/cancel`, {});
}

// ── Customer: Waitlist ─────────────────────────────────────────────────────────

export function joinWaitlist(dto: {
  venueSlug: string;
  sessionId?: string;
  date: string;
  timeSlot: string;
  partySize: number;
}): Promise<ReservationWaitlist> {
  return postData('/reservations/waitlist', dto);
}

export function getMyWaitlistEntries(): Promise<ReservationWaitlist[]> {
  return fetchData('/reservations/waitlist/my');
}

export function leaveWaitlist(id: string): Promise<{ message: string }> {
  return deleteData(`/reservations/waitlist/${id}`);
}

// ── Shared Paystack utilities ─────────────────────────────────────────────────

export interface Bank {
  name: string;
  code: string;
}

export function listBanks(): Promise<Bank[]> {
  return fetchData<Bank[]>('/banks');
}

export function verifyBankAccount(
  accountNumber: string,
  bankCode: string,
): Promise<{ account_name: string; account_number: string }> {
  return fetchData<{ account_name: string; account_number: string }>(
    `/verify-account?account_number=${accountNumber}&bank_code=${bankCode}`,
  );
}

export async function uploadVenueCover(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await uploadFile<{ url: string }>('/upload/event-cover', formData);
  return res.url;
}

export async function updateVenueImages(slug: string, images: string[]): Promise<{ id: string; images: string[] }> {
  return updateData<{ id: string; images: string[] }>(`/venue-owner/venues/${slug}/images`, { images });
}

// ── Venue Owner: Onboarding ────────────────────────────────────────────────────

export function onboardVenueOwner(dto: {
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}): Promise<VenueOwnerProfile> {
  return postData('/venue-owner/onboard', dto);
}

export function getMyOwnerProfile(): Promise<VenueOwnerProfile> {
  return fetchData('/venue-owner/me');
}

export function updateMyOwnerProfile(dto: Partial<{
  businessName: string;
  businessEmail: string;
  businessPhone: string;
}>): Promise<VenueOwnerProfile> {
  return updateData('/venue-owner/me', dto);
}

// ── Venue Owner: Venue Management ──────────────────────────────────────────────

export function applyVenue(dto: {
  name: string;
  description?: string;
  category: VenueCategory;
  bookingMode?: BookingMode;
  address: string;
  city: string;
  state?: string;
  country?: string;
  coverImage?: string;
  images?: string[];
  phone?: string;
  email?: string;
  instagram?: string;
  website?: string;
}): Promise<Venue> {
  return postData('/venue-owner/venues', dto);
}

export function getMyVenues(): Promise<Venue[]> {
  return fetchData('/venue-owner/venues');
}

export function getMyVenueBySlug(slug: string): Promise<Venue> {
  return fetchData(`/venue-owner/venues/${slug}`);
}

export function updateMyVenue(slug: string, dto: Partial<{
  name: string; description: string; category: VenueCategory;
  bookingMode: BookingMode; address: string; city: string; state: string;
  coverImage: string; images: string[]; phone: string; email: string;
  instagram: string; website: string;
}>): Promise<Venue> {
  return updateData(`/venue-owner/venues/${slug}`, dto);
}

// ── Venue Owner: Spaces ────────────────────────────────────────────────────────

export function addSpace(slug: string, dto: {
  name: string; type: SpaceType; capacity: number;
  description?: string; minSpend?: number; images?: string[];
}): Promise<VenueSpace> {
  return postData(`/venue-owner/venues/${slug}/spaces`, dto);
}

export function updateSpace(slug: string, spaceId: string, dto: Partial<{
  name: string; type: SpaceType; capacity: number;
  description: string; minSpend: number; images: string[]; isActive: boolean;
}>): Promise<VenueSpace> {
  return updateData(`/venue-owner/venues/${slug}/spaces/${spaceId}`, dto);
}

export function removeSpace(slug: string, spaceId: string): Promise<{ message: string }> {
  return deleteData(`/venue-owner/venues/${slug}/spaces/${spaceId}`);
}

// ── Venue Owner: Operating Hours ───────────────────────────────────────────────

export function setOperatingHours(slug: string, hours: {
  dayOfWeek: DayOfWeek; isClosed: boolean; openTime?: string; closeTime?: string;
}[]): Promise<VenueOperatingHours[]> {
  return api.put(`/venue-owner/venues/${slug}/hours`, { hours }).then(r => r.data);
}

// ── Venue Owner: Sessions ──────────────────────────────────────────────────────

export function addSession(slug: string, dto: {
  name: string; startTime: string; endTime: string;
  slotDurationMinutes?: number; daysOfWeek: DayOfWeek[];
}): Promise<VenueSession> {
  return postData(`/venue-owner/venues/${slug}/sessions`, dto);
}

export function updateSession(slug: string, sessionId: string, dto: Partial<{
  name: string; startTime: string; endTime: string;
  slotDurationMinutes: number; daysOfWeek: DayOfWeek[]; isActive: boolean;
}>): Promise<VenueSession> {
  return updateData(`/venue-owner/venues/${slug}/sessions/${sessionId}`, dto);
}

export function removeSession(slug: string, sessionId: string): Promise<{ message: string }> {
  return deleteData(`/venue-owner/venues/${slug}/sessions/${sessionId}`);
}

// ── Venue Owner: Blocked Dates ─────────────────────────────────────────────────

export function blockDate(slug: string, dto: {
  date: string; reason?: string; spaceId?: string;
}): Promise<VenueBlockedDate> {
  return postData(`/venue-owner/venues/${slug}/blocked-dates`, dto);
}

export function unblockDate(slug: string, blockId: string): Promise<{ message: string }> {
  return deleteData(`/venue-owner/venues/${slug}/blocked-dates/${blockId}`);
}

// ── Venue Owner: Policy ────────────────────────────────────────────────────────

export function setPolicy(slug: string, dto: {
  depositType: DepositType;
  depositAmount?: number;
  depositPercent?: number;
  fullRefundHoursThreshold?: number;
  partialRefundHoursThreshold?: number;
  partialRefundPercent?: number;
  modificationAllowedHoursBefore?: number;
}): Promise<ReservationPolicy> {
  return api.put(`/venue-owner/venues/${slug}/policy`, dto).then(r => r.data);
}

// ── Venue Owner: Reservations ──────────────────────────────────────────────────

export function getVenueOwnerReservations(query: {
  status?: ReservationStatus; venueSlug?: string; page?: number; limit?: number;
} = {}): Promise<Paginated<Reservation>> {
  const p = new URLSearchParams();
  if (query.status) p.set('status', query.status);
  if (query.venueSlug) p.set('venueSlug', query.venueSlug);
  if (query.page) p.set('page', String(query.page));
  if (query.limit) p.set('limit', String(query.limit));
  const qs = p.toString();
  return fetchData(`/venue-owner/reservations${qs ? `?${qs}` : ''}`);
}

export function getVenueOwnerReservationById(id: string): Promise<Reservation> {
  return fetchData(`/venue-owner/reservations/${id}`);
}

export function venueOwnerConfirm(id: string, venueNote?: string): Promise<Reservation> {
  return postData(`/venue-owner/reservations/${id}/confirm`, { venueNote: venueNote ?? '' });
}

export function venueOwnerReject(id: string, venueNote?: string): Promise<Reservation> {
  return postData(`/venue-owner/reservations/${id}/reject`, { venueNote: venueNote ?? '' });
}

export function venueOwnerMarkCompleted(id: string): Promise<Reservation> {
  return postData(`/venue-owner/reservations/${id}/complete`, {});
}

export function venueOwnerMarkNoShow(id: string): Promise<Reservation> {
  return postData(`/venue-owner/reservations/${id}/no-show`, {});
}

// ── Venue Owner: Wallet ────────────────────────────────────────────────────────

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'TRANSFERRED';

export interface VenueOwnerWallet {
  id: string;
  ownerId: string;
  balance: number;
  totalEarned: number;
  updatedAt: string;
}

export interface VenueOwnerWithdrawal {
  id: string;
  walletId: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  paystackRef: string | null;
  note: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export function getVenueOwnerWallet(): Promise<VenueOwnerWallet> {
  return fetchData('/venue-owner/wallet');
}

export function getVenueOwnerWithdrawals(): Promise<VenueOwnerWithdrawal[]> {
  return fetchData('/venue-owner/wallet/withdrawals');
}

export function requestVenueOwnerWithdrawal(body: {
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}): Promise<VenueOwnerWithdrawal> {
  return postData('/venue-owner/wallet/withdraw', body);
}

// ── Admin: Venues ──────────────────────────────────────────────────────────────

export function getAdminVenues(query: {
  status?: VenueStatus; category?: VenueCategory; page?: number; limit?: number;
} = {}): Promise<Paginated<Venue>> {
  const p = new URLSearchParams();
  if (query.status) p.set('status', query.status);
  if (query.category) p.set('category', query.category);
  if (query.page) p.set('page', String(query.page));
  if (query.limit) p.set('limit', String(query.limit));
  const qs = p.toString();
  return fetchData(`/a/venues${qs ? `?${qs}` : ''}`);
}

export interface AdminReservationRow {
  id: string;
  reference: string;
  date: string;
  timeSlot: string;
  partySize: number;
  status: ReservationStatus;
  depositAmount: number;
  platformFee: number;
  venuePayout: number;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  session: { name: string } | null;
  spaces: { space: { name: string } }[];
}

export interface AdminVenueDetail extends Venue {
  stats: {
    totalReservations: number;
    totalDeposits: number;
    totalPlatformFee: number;
    totalVenuePayout: number;
    byStatus: Record<string, number>;
  };
  recentReservations: AdminReservationRow[];
}

export function getAdminVenueById(id: string): Promise<AdminVenueDetail> {
  return fetchData(`/a/venues/${id}`);
}

export function approveVenue(id: string): Promise<Venue> {
  return postData(`/a/venues/${id}/approve`, {});
}

export function rejectVenue(id: string, reason: string): Promise<Venue> {
  return postData(`/a/venues/${id}/reject`, { reason });
}

export function suspendVenue(id: string): Promise<Venue> {
  return postData(`/a/venues/${id}/suspend`, {});
}

export function updatePlatformFee(id: string, platformFeePercent: number): Promise<Venue> {
  return updateData(`/a/venues/${id}/platform-fee`, { platformFeePercent });
}

// ── Admin: Reservations ────────────────────────────────────────────────────────

export function getAdminReservations(query: {
  status?: ReservationStatus; venueId?: string; page?: number; limit?: number;
} = {}): Promise<Paginated<Reservation>> {
  const p = new URLSearchParams();
  if (query.status) p.set('status', query.status);
  if (query.venueId) p.set('venueId', query.venueId);
  if (query.page) p.set('page', String(query.page));
  if (query.limit) p.set('limit', String(query.limit));
  const qs = p.toString();
  return fetchData(`/a/reservations${qs ? `?${qs}` : ''}`);
}

export function adminConfirmReservation(id: string, adminNote?: string): Promise<Reservation> {
  return postData(`/a/reservations/${id}/confirm`, { adminNote: adminNote ?? '' });
}

export function adminCancelReservation(id: string, adminNote?: string): Promise<Reservation> {
  return postData(`/a/reservations/${id}/cancel`, { adminNote: adminNote ?? '' });
}

// ── Admin: Venue Owner Withdrawals ─────────────────────────────────────────────

export interface AdminVenueOwnerWithdrawal extends VenueOwnerWithdrawal {
  wallet: {
    owner: {
      id: string;
      businessName: string;
      accountName: string | null;
      user: { firstName: string; lastName: string; email: string };
    };
  };
}

export function getAdminVenueOwnerWithdrawals(query: {
  status?: WithdrawalStatus; page?: number; limit?: number;
} = {}): Promise<Paginated<AdminVenueOwnerWithdrawal>> {
  const p = new URLSearchParams();
  if (query.status) p.set('status', query.status);
  if (query.page) p.set('page', String(query.page));
  if (query.limit) p.set('limit', String(query.limit));
  const qs = p.toString();
  return fetchData(`/a/venue-owner-withdrawals${qs ? `?${qs}` : ''}`);
}

export function approveVenueOwnerWithdrawal(id: string, note?: string) {
  return postData(`/a/venue-owner-withdrawals/${id}/approve`, { note: note ?? '' });
}

export function rejectVenueOwnerWithdrawal(id: string, note?: string) {
  return postData(`/a/venue-owner-withdrawals/${id}/reject`, { note: note ?? '' });
}

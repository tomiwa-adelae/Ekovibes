import { fetchData, postData, updateData } from "./api";
import { formatNaira } from "./events-api";

export type UserRole = "USER" | "VENDOR" | "VENUE_OWNER" | "ADMIN" | string;

export interface AdminUserListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string | null;
  role: UserRole;
  userTier: string | null;
  image: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  totalTicketOrders: number;
  totalTickets: number;
  totalReservations: number;
  totalEcomOrders: number;
  totalSpend: number; // in kobo
}

export interface VendorEvent {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  coverImage: string | null;
  date: string;
  venueName: string;
  isMemberOnly: boolean;
  createdAt: string;
  totalRevenue: number; // kobo
  totalSold: number;
  totalCapacity: number;
  ticketTiers: { name: string; price: number; quantity: number; sold: number }[];
  _count: { orders: number };
}

export interface VenueOwnerVenue {
  id: string;
  name: string;
  slug: string;
  status: string;
  city: string;
  coverImage: string | null;
  category: string;
  createdAt: string;
  _count: { reservations: number };
}

export interface AdminUserDetail extends AdminUserListItem {
  dob: string | null;
  address: string | null;
  gender: string | null;
  interests: string[];
  emailVerified: boolean;
  // Computed on backend
  totalTicketOrders: number;
  totalTickets: number;
  totalReservations: number;
  totalEcomOrders: number;
  vendorTotalRevenue: number; // kobo — vendor events revenue
  walletBalance: number | null; // kobo — vendor wallet
  admin: { position: string } | null;
  vendorProfile: {
    brandName: string;
    brandBio: string | null;
    website: string | null;
    instagram: string | null;
    logoUrl: string | null;
  } | null;
  venueOwnerProfile: {
    id: string;
    businessName: string;
    businessEmail: string | null;
    businessPhone: string | null;
    isVerified: boolean;
    venues: VenueOwnerVenue[];
  } | null;
  wallet: { balance: number } | null;
  events: VendorEvent[]; // events created by this user (vendor)
  orders: TicketOrder[];
  tickets: UserTicket[];
  reservations: UserReservation[];
  ecomOrders: UserEcomOrder[];
}

export interface TicketOrder {
  id: string;
  reference: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  total: number; // kobo
  subtotal: number;
  serviceFee: number;
  createdAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    coverImage: string | null;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    ticketTier: { name: string; price: number };
  }[];
}

export interface UserTicket {
  id: string;
  code: string;
  isUsed: boolean;
  usedAt: string | null;
  createdAt: string;
  orderItem: {
    quantity: number;
    ticketTier: { name: string };
    order: {
      event: { title: string; date: string; coverImage: string | null };
    };
  };
}

export interface UserReservation {
  id: string;
  reference: string;
  status: string;
  date: string;
  timeSlot: string;
  partySize: number;
  depositAmount: number;
  createdAt: string;
  venue: {
    id: string;
    name: string;
    coverImage: string | null;
    city: string;
  };
  payment: {
    amount: number;
    status: string;
  } | null;
}

export interface UserEcomOrder {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  deliveryFee: number;
  recipientName: string;
  city: string;
  state: string;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    price: number;
  }[];
}

export interface AdminUsersResponse {
  data: AdminUserListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function getAdminUsers(query: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}): Promise<AdminUsersResponse> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.role) params.set("role", query.role);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return fetchData<AdminUsersResponse>(`/auth/a/users${qs ? `?${qs}` : ""}`);
}

export function getAdminUserById(id: string): Promise<AdminUserDetail> {
  return fetchData<AdminUserDetail>(`/auth/a/users/${id}`);
}

export function adminCreateVenueOwnerProfile(
  userId: string,
  dto: { businessName: string; businessEmail?: string; businessPhone?: string },
) {
  return postData(`/auth/a/users/${userId}/venue-owner-profile`, dto);
}

export function adminAssignVenueOwner(venueId: string, ownerProfileId: string) {
  return updateData(`/a/venues/${venueId}/assign-owner`, { ownerProfileId });
}

export { formatNaira };

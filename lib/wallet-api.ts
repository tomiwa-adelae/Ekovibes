import { fetchData, postData } from './api';

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'TRANSFERRED';

export interface VendorWallet {
  id: string;
  vendorId: string;
  balance: number; // kobo
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  vendorId: string;
  amount: number; // kobo
  bankCode: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  paystackRef: string | null;
  note: string | null;
  createdAt: string;
  resolvedAt: string | null;
  vendor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    vendorProfile: { brandName: string } | null;
  };
}

export interface Bank {
  name: string;
  code: string;
}

export interface PaginatedWithdrawals {
  data: WithdrawalRequest[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ── Vendor ─────────────────────────────────────────────────────────────────────

export function getVendorWallet(): Promise<VendorWallet> {
  return fetchData<VendorWallet>('/vendor/wallet');
}

export function getVendorWithdrawalHistory(): Promise<WithdrawalRequest[]> {
  return fetchData<WithdrawalRequest[]>('/vendor/wallet/withdrawals');
}

export function requestWithdrawal(dto: {
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}): Promise<WithdrawalRequest> {
  return postData<WithdrawalRequest>('/vendor/wallet/withdraw', dto);
}

export function listBanks(): Promise<Bank[]> {
  return fetchData<Bank[]>('/vendor/wallet/banks');
}

export function verifyBankAccount(
  accountNumber: string,
  bankCode: string,
): Promise<{ account_name: string; account_number: string }> {
  return fetchData<{ account_name: string; account_number: string }>(
    `/vendor/wallet/verify-account?account_number=${accountNumber}&bank_code=${bankCode}`,
  );
}

// ── Admin: vendors ─────────────────────────────────────────────────────────────

export interface VendorListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  vendorProfile: { brandName: string; logoUrl: string | null; instagram: string | null } | null;
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  walletBalance: number;
}

export interface PaginatedVendors {
  data: VendorListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface VendorDetail extends VendorListItem {
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  createdAt: string;
  withdrawalRequests: WithdrawalRequest[];
  events: Array<{
    id: string;
    title: string;
    slug: string;
    date: string;
    venueName: string;
    status: string;
    totalRevenue: number;
    totalSold: number;
  }>;
}

export function getAdminVendorById(id: string): Promise<VendorDetail> {
  return fetchData<VendorDetail>(`/auth/a/vendors/${id}`);
}

export function getAdminVendors(
  query: { search?: string; page?: number; limit?: number } = {},
): Promise<PaginatedVendors> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();
  return fetchData<PaginatedVendors>(`/auth/a/vendors${qs ? `?${qs}` : ''}`);
}

// ── Admin: withdrawals ─────────────────────────────────────────────────────────

export function getAdminWithdrawals(query: {
  status?: WithdrawalStatus;
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedWithdrawals> {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();
  return fetchData<PaginatedWithdrawals>(`/a/withdrawals${qs ? `?${qs}` : ''}`);
}

export function approveWithdrawal(
  id: string,
  note?: string,
): Promise<WithdrawalRequest> {
  return postData<WithdrawalRequest>(`/a/withdrawals/${id}/approve`, {
    note: note ?? '',
  });
}

export function rejectWithdrawal(
  id: string,
  note?: string,
): Promise<{ success: boolean }> {
  return postData<{ success: boolean }>(`/a/withdrawals/${id}/reject`, {
    note: note ?? '',
  });
}

import { fetchData, postData, updateData } from './api';
import type { User } from '@/store/useAuth';

// ─── Profile ───────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export function updateProfile(dto: UpdateProfilePayload): Promise<User> {
  return updateData<User>('/auth/profile', dto);
}

// ─── Password ──────────────────────────────────────────────────────────────────

export function changePassword(dto: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> {
  return postData<{ message: string }>('/auth/change-password', dto);
}

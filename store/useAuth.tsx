import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  otherName: string;
  username: string;
  phoneNumber: string;
  image: string | null;
  dob: string | null;
  createdAt: string | null;
  city: string | null;
  address: string | null;
  state: string | null;
  country: string | null;
  gender: string | null;
  role: string;
  userTier?: string | null;
  onboardingCompleted?: boolean;
  isAdmin?: boolean;
  isVendor?: boolean;
} | null;

type AuthState = {
  user: User;
  setUser: (user: User) => void;
  clearUser: () => void;
  _hasHydrated: boolean; // ✅ added
  setHasHydrated: (hasHydrated: boolean) => void; // ✅ added
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      currentRole: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      _hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: "auth-user",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

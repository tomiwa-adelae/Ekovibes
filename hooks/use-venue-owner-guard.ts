"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";

/** Protects venue owner routes (/venue-dashboard/*)
 *  Redirects to /login if not authenticated.
 *  The layout itself checks for VenueOwnerProfile and shows onboarding if missing.
 */
export function useVenueOwnerGuard() {
  const { user, _hasHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, _hasHydrated, router]);

  return {
    user,
    isReady: _hasHydrated && !!user,
  };
}

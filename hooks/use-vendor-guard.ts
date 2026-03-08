"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";

/** Protects vendor-only routes (/vendor/*)
 *  Redirects to /login if not authenticated, /dashboard if not a vendor.
 *  Returns { user, isReady } — render nothing until isReady is true.
 */
export function useVendorGuard() {
  const { user, _hasHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "VENDOR") {
      router.replace("/dashboard");
    }
  }, [user, _hasHydrated, router]);

  return {
    user,
    isReady: _hasHydrated && !!user && user.role === "VENDOR",
  };
}

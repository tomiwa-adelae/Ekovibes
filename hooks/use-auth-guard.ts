"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const { user, _hasHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    // if (!user) {
    //   router.push("/login");
    // } else if (!user.onboardingCompleted) {
    //   router.push("/onboarding");
    // } else if (user.role === "BRAND" && !user.brandOnboardingCompleted) {
    //   router.push("/brand-onboarding");
    // }
  }, [user, _hasHydrated, router]);

  // const isBrandReady =
  //   user?.role !== "BRAND" || !!user?.brandOnboardingCompleted;
  const isBrandReady = false;

  return {
    user,
    // isReady: _hasHydrated && !!user && user.onboardingCompleted && isBrandReady,
    isReady: _hasHydrated && !!user && isBrandReady,
  };
}

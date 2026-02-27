import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { env } from "@/lib/env";
import { useAuth, User } from "@/store/useAuth";
import { useSignout } from "./use-signout";

/** ✅ Hook version (auto-redirect when needed) */
export function useRoleRedirect(user: any) {
  const router = useRouter();
  const pathname = usePathname();
  const handleSignout = useSignout();

  useEffect(() => {
    if (!user || !user.schoolId) return;

    const path = getDashboardPath(user.role);
    if (!path) return;

    // Only redirect if they're at role root
    const rolePrefix = `/${path.split("/")[1]}`;
    const isAtRoleRoot =
      pathname === "/" ||
      pathname === rolePrefix ||
      pathname === `${rolePrefix}/`;

    if (isAtRoleRoot && pathname !== path) {
      router.replace(path);
    }
  }, [user, pathname, router, handleSignout]);
}

/** ✅ Utility version (imperative redirect for logo click, etc.) */
export function getDashboardPath(role: string) {
  const roleRoutes: Record<string, string> = {
    ADMINISTRATOR: "/a/dashboard",
    TEACHER: "/t/dashboard",
    STUDENT: "/s/dashboard",
    PARENT: "/p/dashboard",
    IT_SUPPORT: "/it/dashboard",
    DATA_ANALYST: "/da/dashboard",
    BURSAR: "/b/dashboard",
    EXAM_OFFICER: "/eo/dashboard",
  };

  return roleRoutes[role] ?? "/";
}

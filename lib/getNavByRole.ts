import { User } from "@/store/useAuth";
import { adminNavLinks, memberNavLinks } from "@/constants/nav-links";
import { roleNavMap } from "@/constants/roleNavMap";

export function getNavByRole(user?: User | null, isAdminArea = false) {
  if (!user) return memberNavLinks;

  const role = user.role;
  const position = user.adminPosition;
  const modules = user.adminModules ?? [];

  // If the user is an admin but is viewing the member area, show member nav
  if (!user.isAdmin || !isAdminArea) {
    // @ts-ignore
    return roleNavMap[role] ?? memberNavLinks;
  }

  // SUPER_ADMIN sees everything
  if (position === "SUPER_ADMIN") {
    return adminNavLinks;
  }

  // ADMIN sees everything except superAdminOnly items
  if (position === "ADMIN") {
    return adminNavLinks.filter((item) => !(item as any).superAdminOnly);
  }

  // MODERATOR: dashboard always + items whose module is in their modules array
  return adminNavLinks.filter((item: any) => {
    if (item.superAdminOnly) return false;
    if (item.slug === "/a/dashboard") return true;
    if (!item.module) return false;
    return modules.includes(item.module);
  });
}

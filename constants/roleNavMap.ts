import { adminNavLinks, memberNavLinks, vendorNavLinks } from "./nav-links";

export type UserRole = "ADMINISTRATOR" | "MEMBER" | "SUPER_ADMIN" | "VENDOR";

export const roleNavMap: Record<string, typeof memberNavLinks> = {
  ADMINISTRATOR: adminNavLinks,
  SUPER_ADMIN: adminNavLinks,
  MEMBER: memberNavLinks,
  VENDOR: vendorNavLinks,
};

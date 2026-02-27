import { adminNavLinks, memberNavLinks } from "./nav-links";

export type UserRole = "ADMINISTRATOR" | "MEMBER" | "SUPER_ADMIN";

export const roleNavMap: Record<UserRole, typeof memberNavLinks> = {
  ADMINISTRATOR: adminNavLinks,
  SUPER_ADMIN: adminNavLinks,
  MEMBER: memberNavLinks,
};

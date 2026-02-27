import { memberNavLinks } from "@/constants/nav-links";
import { roleNavMap } from "@/constants/roleNavMap";

export function getNavByRole(role?: string) {
  if (!role) return memberNavLinks;
  //   @ts-ignore
  return roleNavMap[role as UserRole] ?? memberNavLinks;
}

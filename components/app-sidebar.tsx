"use client";

import * as React from "react";
import { IconSettings, IconHelp } from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/store/useAuth";
import { getNavByRole } from "@/lib/getNavByRole";
import { Logo } from "./Logo";
import { usePathname } from "next/navigation";

const sidebarData = {
  navSecondary: [
    { title: "Settings", url: "/settings", icon: IconSettings },
    { title: "Get Help", url: "/help", icon: IconHelp, comingSoon: true },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAdminArea = pathname.startsWith("/a/") || pathname === "/a";

  const navItems = React.useMemo(
    () => getNavByRole(user, isAdminArea),
    [user, isAdminArea],
  );

  // if (isLoading) return null; // or skeleton

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent"
            >
              <a href="/">
                <Logo type="green" size="h-10" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

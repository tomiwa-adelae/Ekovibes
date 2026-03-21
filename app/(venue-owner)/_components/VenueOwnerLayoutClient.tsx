"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  IconLayoutDashboard,
  IconBuilding,
  IconCalendar,
  IconSettings,
} from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { Logo } from "@/components/Logo";
import { useVenueOwnerGuard } from "@/hooks/use-venue-owner-guard";
import { getMyOwnerProfile } from "@/lib/reservations-api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { venueOwnerNavLinks } from "@/constants/nav-links";

function VenueOwnerSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

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
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {venueOwnerNavLinks.map((item) => {
                const isActive =
                  item.slug === "/venue-dashboard"
                    ? pathname === item.slug
                    : pathname === item.slug ||
                      pathname.startsWith(`${item.slug}/`);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.slug}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      className={cn(
                        isActive &&
                          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                      )}
                    >
                      <Link href={item.slug}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

export default function VenueOwnerLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady } = useVenueOwnerGuard();
  const router = useRouter();
  const pathname = usePathname();
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (pathname === "/venue-dashboard/onboard") {
      setProfileChecked(true);
      return;
    }
    getMyOwnerProfile()
      .then(() => setProfileChecked(true))
      .catch(() => {
        router.replace("/venue-dashboard/onboard");
      });
  }, [isReady, pathname, router]);

  if (!isReady || !profileChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <VenueOwnerSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main container py-8 flex flex-1 flex-col gap-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

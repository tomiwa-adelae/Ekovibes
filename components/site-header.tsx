"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/store/useAuth";

const roleTitles: Record<string, string> = {
  ADMINISTRATOR: "Admin Panel",
  BRAND: "Brand Management Center",
  PROFESSIONAL: "Professional Dashboard",
  ARTISAN: "Artisan Dashboard",
};

export function SiteHeader() {
  const { user } = useAuth();
  const title = roleTitles[user?.role || ""] || "Dashboard";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur-md sticky top-0 z-10 transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <h1 className="text-sm font-semibold text-neutral-600 uppercase tracking-wider">
          {title}
        </h1>
        <div className="ml-auto flex items-center gap-4">
          {user?.role === "BRAND" && (
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Live Storefront
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

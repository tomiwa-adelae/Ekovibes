"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/store/useAuth";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

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
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center justify-start gap-2">
          <div className="md:hidden">
            <Logo type="green" size="h-10" />
          </div>
        </div>
        <div className="w-full flex justify-end">
          <ThemeToggle color="black" />
        </div>
      </div>
    </header>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IconLogout, IconMenu2, IconMoon, IconSun } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { useTheme } from "next-themes";
import { useSignout } from "@/hooks/use-signout";
import { homeNavLinksMobile } from "@/constants/nav-links";

export function MobileNavbar() {
  const pathname = usePathname();
  // const { user } = useAuth(); // Assuming logout is in your store
  const { theme, setTheme } = useTheme();
  const handleSignout = useSignout();

  const handleLinkClick = () => setOpen(false);

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    handleSignout();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isActive = (slug: string) =>
    pathname === slug || pathname.startsWith(`${slug}/`);

  // Helper to render link items to avoid repetition
  const renderNavLinks = (links: any[]) => (
    <div className="grid gap-1 px-2">
      {links.map(({ icon: Icon, slug, label, comingSoon }, index) =>
        comingSoon ? (
          <Button
            key={index}
            className="justify-start gap-3"
            variant="ghost"
            disabled
          >
            {/* <Icon size={20} /> */}
            {label}
            <Badge variant="secondary" className="ml-auto">
              Soon
            </Badge>
          </Button>
        ) : (
          <Button
            key={index}
            asChild
            className="justify-start gap-3"
            variant={isActive(slug) ? "default" : "ghost"}
            onClick={handleLinkClick}
          >
            <Link href={slug}>
              {/* <Icon size={20} /> */}
              {label}
            </Link>
          </Button>
        ),
      )}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="text-white" size="icon" variant="ghost">
          <IconMenu2 />
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={handleLinkClick}>
              <Logo size="h-12" type="green" />
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <IconSun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <IconMoon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="overflow-y-auto">
          <div className="space-y-6">
            {/* General Navigation */}
            <div>
              <p className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Menu
              </p>
              {renderNavLinks(homeNavLinksMobile)}
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t bg-muted/30">
          {false ? (
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={handleLogout}
            >
              <IconLogout />
              Log out
            </Button>
          ) : (
            <div className="flex flex-col w-full gap-2">
              <Button asChild variant="outline" onClick={handleLinkClick}>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild onClick={handleLinkClick}>
                <Link href="/register">Join now</Link>
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

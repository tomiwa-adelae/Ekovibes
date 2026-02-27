"use client";

import {
  LogOutIcon,
  SettingsIcon,
  ChevronDownIcon,
  LayoutDashboardIcon,
  ShoppingBagIcon,
  CalendarCheckIcon,
  HeartIcon,
  PackageIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserIcon,
  ClipboardListIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignout } from "@/hooks/use-signout";
import { useAuth } from "@/store/useAuth";
import Link from "next/link";
import { DEFAULT_PROFILE_IMAGE } from "@/constants";

type RoleConfig = {
  label: string;
  badgeClass: string;
  links: { href: string; label: string; icon: React.ReactNode }[];
};

const ROLE_CONFIG: Record<string, RoleConfig> = {
  CLIENT: {
    label: "Customer",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    links: [
      { href: "/account", label: "My Account", icon: <UserIcon size={15} /> },
      { href: "/bookings", label: "My Bookings", icon: <CalendarCheckIcon size={15} /> },
      { href: "/orders", label: "My Orders", icon: <ShoppingBagIcon size={15} /> },
      { href: "/saved", label: "Saved Items", icon: <HeartIcon size={15} /> },
    ],
  },
  PROFESSIONAL: {
    label: "Professional",
    badgeClass: "bg-primary/10 text-primary",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboardIcon size={15} /> },
      { href: "/dashboard/services", label: "My Services", icon: <ClipboardListIcon size={15} /> },
      { href: "/dashboard/bookings", label: "Bookings", icon: <CalendarCheckIcon size={15} /> },
      { href: "/account", label: "My Account", icon: <UserIcon size={15} /> },
    ],
  },
  BRAND: {
    label: "Brand",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboardIcon size={15} /> },
      { href: "/dashboard/products", label: "My Products", icon: <PackageIcon size={15} /> },
      { href: "/dashboard/orders", label: "Orders", icon: <ShoppingBagIcon size={15} /> },
      { href: "/account", label: "My Account", icon: <UserIcon size={15} /> },
    ],
  },
  ADMINISTRATOR: {
    label: "Admin",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    links: [
      { href: "/admin", label: "Admin Panel", icon: <ShieldCheckIcon size={15} /> },
      { href: "/admin/users", label: "Users", icon: <UsersIcon size={15} /> },
      { href: "/admin/orders", label: "Orders", icon: <ShoppingBagIcon size={15} /> },
      { href: "/admin/services", label: "Services", icon: <ClipboardListIcon size={15} /> },
    ],
  },
};

export function UserDropdown() {
  const { user } = useAuth();
  const handleSignout = useSignout();

  if (!user) return null;

  const role = ROLE_CONFIG[user.role] ?? ROLE_CONFIG["CLIENT"];
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "N";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 hover:bg-transparent gap-2 focus-visible:ring-0"
        >
          <Avatar className="size-9 border-2 border-white/30">
            <AvatarImage
              src={user.image || DEFAULT_PROFILE_IMAGE}
              alt={`${user.firstName} ${user.lastName}`}
              className="size-full object-cover"
            />
            <AvatarFallback className="bg-white/20 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDownIcon size={14} className="text-white/70" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        {/* User identity */}
        <DropdownMenuLabel className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage
                src={user.image || DEFAULT_PROFILE_IMAGE}
                alt={`${user.firstName} ${user.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <span
                className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${role.badgeClass}`}
              >
                {role.label}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Role-specific links */}
        <DropdownMenuGroup>
          {role.links.map(({ href, label, icon }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href} className="flex items-center gap-2.5">
                <span className="text-muted-foreground">{icon}</span>
                <span>{label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Settings — available to all */}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2.5">
            <SettingsIcon size={15} className="text-muted-foreground" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignout}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOutIcon size={15} className="mr-2.5" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

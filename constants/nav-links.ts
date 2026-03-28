import {
  IconArchive,
  IconBell,
  IconBuilding,
  IconCalendar,
  IconCash,
  IconLayoutDashboard,
  IconQrcode,
  IconSettings,
  IconShoppingBag,
  IconTicket,
  IconUsers,
  IconUsersGroup,
  IconVideo,
  IconWallet,
} from "@tabler/icons-react";

interface NavLinks {
  comingSoon?: boolean;
  label: string;
  slug: string;
  superAdminOnly?: boolean;
  module?: string;
}
[];

export const homeNavLinks: NavLinks[] = [
  { label: "The Black Book", slug: "/reservations" }, // Clubs, Restaurants
  { label: "Experiences", slug: "/ticketing" }, // Events, Concerts
  { label: "The Vault", slug: "/vault" }, // E-commerce/Merch
  { label: "Vibe Report", slug: "/media" }, // Blog/Video content
];

export const homeNavLinksMobile = [
  { label: "The Black Book", slug: "/reservations" }, // Clubs, Restaurants
  { label: "Experiences", slug: "/ticketing" }, // Events, Concerts
  { label: "The Vault", slug: "/vault" }, // E-commerce/Merch
  { label: "Vibe Report", slug: "/media" }, // Blog/Video content
  { label: "For Venues", slug: "/partners" }, // High-end services
  { label: "Concierge", slug: "/concierge", comingSoon: true }, // High-end services
];

export const adminNavLinks = [
  // Core Management
  { label: "Dashboard", slug: "/a/dashboard", icon: IconLayoutDashboard },
  { label: "Users", slug: "/a/users", icon: IconUsers, module: "users" },
  { label: "Members", slug: "/a/membership", icon: IconUsers, module: "users" },

  // The Black Book (Reservations)
  {
    label: "Bookings",
    slug: "/a/reservations",
    icon: IconCalendar,
    module: "reservations",
  },
  {
    label: "Venues",
    slug: "/a/venues",
    icon: IconBuilding,
    module: "reservations",
  },

  // Vendors
  {
    label: "Vendors",
    slug: "/a/vendors",
    icon: IconBuilding,
    module: "vendors",
  },

  // Experiences (Ticketing)
  { label: "Events", slug: "/a/events", icon: IconTicket, module: "events" },
  {
    label: "Ticket Orders",
    slug: "/a/orders",
    icon: IconCalendar,
    module: "events",
  },
  {
    label: "Scanner Mode",
    slug: "/a/scan",
    icon: IconQrcode,
    module: "events",
  },

  // The Vault (Shop)
  { label: "Shop", slug: "/a/vault", icon: IconShoppingBag, module: "vault" },
  {
    label: "Orders",
    slug: "/a/vault/orders",
    icon: IconShoppingBag,
    module: "vault",
  },

  // Vibe Report (Media)
  { label: "CMS / Media", slug: "/a/media", icon: IconVideo, module: "media" },

  // High-End (Concierge)
  {
    label: "Concierge Requests",
    slug: "/a/requests",
    icon: IconBell,
    comingSoon: true,
    module: "concierge",
  },

  // System
  {
    label: "Withdrawals",
    slug: "/a/withdrawals",
    icon: IconWallet,
    module: "withdrawals",
  },
  {
    label: "Financials",
    slug: "/a/finance",
    icon: IconCash,
    comingSoon: true,
    module: "withdrawals",
  },
  {
    label: "Team",
    slug: "/a/team",
    icon: IconUsersGroup,
    superAdminOnly: true,
  },
];

export const venueOwnerNavLinks = [
  { label: "Dashboard", slug: "/venue-dashboard", icon: IconLayoutDashboard },
  { label: "My Venues", slug: "/venue-dashboard/venues", icon: IconBuilding },
  {
    label: "Reservations",
    slug: "/venue-dashboard/reservations",
    icon: IconCalendar,
  },
  { label: "My Wallet", slug: "/venue-dashboard/wallet", icon: IconWallet },
  { label: "Settings", slug: "/settings", icon: IconSettings },
];

export const vendorNavLinks = [
  { label: "Dashboard", slug: "/vendor/dashboard", icon: IconLayoutDashboard },
  { label: "My Events", slug: "/vendor/events", icon: IconTicket },
  { label: "Wallet", slug: "/vendor/wallet", icon: IconWallet },
  { label: "Scanner Mode", slug: "/vendor/scan", icon: IconQrcode },
  { label: "Brand Profile", slug: "/vendor/settings", icon: IconSettings },
];

export const memberNavLinks = [
  { label: "My Dashboard", slug: "/dashboard" }, // Personal info & Tier status
  { label: "My Tickets", slug: "/tickets" }, // Active Tickets & QR Codes
  { label: "My Tables", slug: "/tables" }, // Pending/Confirmed Bookings
  { label: "Orders", slug: "/orders" }, // Vault purchases
  { label: "Vibe Perks", slug: "/perks", comingSoon: true }, // Member-only discounts
  // { label: "Security", slug: "/security", comingSoon: true }, // Password/2FA
];

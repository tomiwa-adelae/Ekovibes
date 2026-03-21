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
  IconVideo,
  IconWallet,
} from "@tabler/icons-react";

export const homeNavLinks = [
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
  { label: "Members", slug: "/a/membership", icon: IconUsers }, // Membership applications

  // The Black Book (Reservations)
  { label: "Bookings", slug: "/a/reservations", icon: IconCalendar },
  { label: "Venues", slug: "/a/venues", icon: IconBuilding },

  // Vendors
  { label: "Vendors", slug: "/a/vendors", icon: IconBuilding },

  // Experiences (Ticketing)
  { label: "Events", slug: "/a/events", icon: IconTicket },
  { label: "Ticket Orders", slug: "/a/orders", icon: IconCalendar },
  { label: "Scanner Mode", slug: "/a/scan", icon: IconQrcode }, // For door staff

  // The Vault (Shop)
  {
    label: "Shop",
    slug: "/a/vault",
    icon: IconShoppingBag,
  },
  {
    label: "Orders",
    slug: "/a/vault/orders",
    icon: IconShoppingBag,
  },

  // Vibe Report (Media)
  { label: "CMS / Media", slug: "/a/media", icon: IconVideo },

  // High-End (Concierge)
  {
    label: "Concierge Requests",
    slug: "/a/requests",
    icon: IconBell,
    comingSoon: true,
  }, // Jet/Yacht/Protocol

  // System
  { label: "Withdrawals", slug: "/a/withdrawals", icon: IconWallet },
  { label: "Financials", slug: "/a/finance", icon: IconCash, comingSoon: true },
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

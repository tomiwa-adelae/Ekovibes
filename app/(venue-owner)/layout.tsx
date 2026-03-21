import type { Metadata } from "next";
import React from "react";
import VenueOwnerLayoutClient from "./_components/VenueOwnerLayoutClient";

export const metadata: Metadata = {
  title: "Venue Dashboard",
  robots: { index: false, follow: false },
};

export default function VenueOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VenueOwnerLayoutClient>{children}</VenueOwnerLayoutClient>;
}

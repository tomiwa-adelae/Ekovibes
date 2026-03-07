import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Events & Experiences",
  description:
    "Browse and book tickets to Lagos' best events — concerts, nightlife, private dining, art exhibitions, wellness retreats, and more. Instant QR delivery on Ekovibe.",
  openGraph: {
    title: "Events & Experiences | Ekovibe",
    description:
      "Browse Lagos' best concerts, nightlife, private dining, art exhibitions, and more. Instant QR ticket delivery.",
    url: "https://www.ekovibe.com.ng/ticketing",
  },
  alternates: { canonical: "https://www.ekovibe.com.ng/ticketing" },
};
import { Hero } from "./_components/Hero";
import { FeaturedEvents } from "./_components/FeaturedEvents";
import { EventDiscovery } from "./_components/EventDiscovery";
import { TicketingTrust } from "./_components/TicketingTrust";

const page = () => {
  return (
    <div>
      <Hero />
      <FeaturedEvents />
      <EventDiscovery />
      <TicketingTrust />
    </div>
  );
};

export default page;

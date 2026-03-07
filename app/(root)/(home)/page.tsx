import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Ekovibe — Lagos' Premier Event & Experience Platform",
  description:
    "The hottest concerts, private dining, art shows, and nightlife in Lagos — all in one place. Discover what's on and secure your tickets instantly on Ekovibe.",
  openGraph: {
    title: "Ekovibe — Lagos' Premier Event & Experience Platform",
    description:
      "The hottest concerts, private dining, art shows, and nightlife in Lagos — all in one place. Secure your tickets instantly.",
    url: "https://www.ekovibe.com.ng",
  },
  alternates: { canonical: "https://www.ekovibe.com.ng" },
};
import { Hero } from "./_components/Hero";
import { VibeCategories } from "./_components/VibeCategories";
import { TheHotList } from "./_components/TheHotList";
import { UpcomingEvents } from "./_components/UpcomingEvents";
import { Membership } from "./_components/Membership";
import { VibeReport } from "./_components/VibeReport";

const page = () => {
  return (
    <div>
      <Hero />
      <VibeCategories />
      <TheHotList />
      <UpcomingEvents />
      <Membership />
      <VibeReport />
    </div>
  );
};

export default page;

import React from "react";
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

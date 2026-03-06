import React from "react";
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

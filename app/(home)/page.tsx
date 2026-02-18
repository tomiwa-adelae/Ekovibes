import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import React from "react";
import { Hero } from "./_components/Hero";
import { VibeCategories } from "./_components/VibeCategories";
import { TheHotList } from "./_components/TheHotList";
import { Membership } from "./_components/Membership";
import { VibeReport } from "./_components/VibeReport";

const page = () => {
  return (
    <div>
      <Header />
      <Hero />
      <VibeCategories />
      <TheHotList />
      <Membership />
      <VibeReport />
    </div>
  );
};

export default page;

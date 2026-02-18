"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { IconSearch, IconCalendar, IconMapPin } from "@tabler/icons-react";

export const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* 1. Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105" // scale-105 prevents white edges
        >
          <source src="/assets/videos/hero.mp4" type="video/mp4" />
          {/* Fallback image if video fails */}
          <img
            src="/assets/images/hero-fallback.png"
            alt="Ekovibes Destination"
            className="w-full h-full object-cover"
          />
        </video>
        {/* Dark Overlay Scrim */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* 2. Content */}
      <div className="relative z-10 container text-center">
        <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tighter uppercase">
          Destination <span className="text-white/50">&</span> Vibes
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto font-light tracking-wide">
          Your Life-OS for the Lagos social elite. Access the city’s most
          exclusive tables, events, and style.
        </p>

        {/* 3. The "Vibe Search" Bar */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-md md:rounded-full flex flex-col md:flex-row items-center gap-2 shadow-2xl">
          {/* Location/Spot */}
          <div className="flex items-center w-full px-6 py-3 border-b md:border-b-0 md:border-r border-white/10">
            <IconMapPin className="text-white/60 mr-3" size={20} />
            <input
              type="text"
              placeholder="Where to? (e.g. Victoria Island)"
              className="bg-transparent border-none outline-none text-white placeholder:text-white/40 w-full text-sm"
            />
          </div>

          {/* Vibe Selection */}
          <div className="flex items-center w-full px-6 py-3 border-b md:border-b-0 md:border-r border-white/10">
            <IconSearch className="text-white/60 mr-3" size={20} />
            <input
              type="text"
              placeholder="The Vibe? (e.g. Quiet Luxury, High Energy)"
              className="bg-transparent border-none outline-none text-white placeholder:text-white/40 w-full text-sm"
            />
          </div>

          {/* Date/Time */}
          <div className="flex items-center w-full px-6 py-3">
            <IconCalendar className="text-white/60 mr-3" size={20} />
            <span className="text-white/40 text-sm cursor-pointer">When?</span>
          </div>

          <Button className="w-full md:w-auto rounded-full">
            Find the Vibe
          </Button>
        </div>

        {/* 4. Social Proof / Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
      </div>
    </section>
  );
};

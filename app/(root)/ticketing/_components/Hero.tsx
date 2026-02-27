"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  IconTicket,
  IconFilter,
  IconSearch,
  IconCalendarEvent,
} from "@tabler/icons-react";

export const Hero = () => {
  return (
    <section className="relative w-full min-h-[80vh] py-16 flex items-center overflow-hidden bg-black">
      {/* 1. Background Visual with Gradient Mask */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/images/events.jpg" // High-fidelity concert/crowd shot
          alt="Lagos Live Events"
          className="w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* 2. Content Area */}
      <div className="relative z-10 container grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter uppercase mb-6 leading-[0.9]">
            The <br /> <span className="text-white/40 italic">Box Office</span>
          </h1>

          <p className="text-white/70 text-lg font-light mb-8 max-w-md leading-relaxed">
            From underground gallery openings to stadium-sized anthems. Secure
            your entry to the pulse of the city.
          </p>

          {/* Quick Stats/Social Proof */}
          <div className="flex gap-8 border-l border-white/20 pl-6 mb-10">
            <div>
              <p className="text-xl font-bold text-white">12</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">
                Active Festivals
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">150+</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">
                Private Events
              </p>
            </div>
          </div>
        </div>

        {/* 3. The Interactive Ticket Search (Right Side / Floating) */}
        <div className="hidden lg:block">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-sm">
            <h4 className="text-white text-xs uppercase tracking-widest mb-6 font-bold flex items-center gap-2">
              <IconCalendarEvent size={16} /> Filter Experiences
            </h4>

            <div className="space-y-4">
              <div className="relative">
                <IconSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by Artist or Event"
                  className="w-full bg-white/5 border border-white/10 py-3 pl-10 pr-4 text-sm text-white focus:border-white/40 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select className="bg-white/5 border border-white/10 py-3 px-4 text-xs text-white/60 outline-none uppercase tracking-widest">
                  <option>All Dates</option>
                  <option>This Weekend</option>
                  <option>Next Month</option>
                </select>
                <select className="bg-white/5 border border-white/10 py-3 px-4 text-xs text-white/60 outline-none uppercase tracking-widest">
                  <option>Category</option>
                  <option>Music</option>
                  <option>Art</option>
                  <option>Nightlife</option>
                </select>
              </div>

              <Button className="w-full">Find Tickets</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

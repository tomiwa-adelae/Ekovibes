"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { IconFlame, IconStar } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";

const hotItems = [
  {
    name: "Zaza Lagos",
    category: "Fine Dining / Lounge",
    vibe: "Quiet Luxury",
    image: "/assets/images/zaza.jpg",
    status: "Limited Tables",
    tag: "Trending",
  },
  {
    name: "Cene Sundays",
    category: "Beach Club",
    vibe: "High Energy",
    image: "/assets/images/cene.jpg",
    status: "Tickets Available",
    tag: "Exclusive",
  },
  {
    name: "The Library",
    category: "Speakeasy / Club",
    vibe: "Intimate",
    image: "/assets/images/club.jpg",
    status: "Members Only",
    tag: "Hot",
  },
  {
    name: "Flytime Fest",
    category: "Music Festival",
    vibe: "Cultural Pulse",
    image: "/assets/images/flytime.jpg",
    status: "Phase 1 Sold Out",
    tag: "Event",
  },
];

export const TheHotList = () => {
  return (
    <section className="py-16md:py-24 bg-neutral-950 overflow-hidden">
      <div className="container mb-12">
        <div className="flex items-center gap-2 mb-2">
          <IconFlame className="text-yellow" size={20} fill="currentColor" />
          <span className="text-xs uppercase tracking-[0.4em] text-white/60">
            Live Inventory
          </span>
        </div>
        <div className="flex justify-between items-end">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter uppercase">
            The Hot List
          </h2>
          <Link
            href="/reservations"
            className="hidden md:block text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            View All Destinations →
          </Link>
        </div>
      </div>

      {/* Horizontal Scroller */}
      <div className="flex gap-3 overflow-x-auto px-6 pb-12 scrollbar-hide snap-x snap-mandatory">
        {hotItems.map((item, index) => (
          <div
            key={index}
            className="min-w-[300px] md:min-w-[400px] snap-start group  relative"
          >
            <div className="aspect-[3/4] rounded-md overflow-hidden bg-neutral-900 mb-4">
              <Image
                width={1000}
                height={1000}
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase font-bold px-3 py-1 tracking-widest">
                  {item.tag}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
                  {item.category}
                </p>
                <h4 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-yellow font-bold uppercase">
                    {item.status}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="text-[10px] text-white/40 uppercase italic">
                    {item.vibe}
                  </span>
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Access
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

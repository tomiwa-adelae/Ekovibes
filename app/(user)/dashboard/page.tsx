"use client";
import React from "react";
import {
  IconTicket,
  IconCalendar,
  IconUserCircle,
  IconCrown,
  IconArrowUpRight,
  IconMapPin,
  IconSettings,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/store/useAuth";
import { formatDate } from "@/lib/utils";

const page = () => {
  const { user } = useAuth();
  return (
    <main>
      <PageHeader
        title={`Welcome, ${user?.firstName}`}
        description={`Member since ${formatDate(user?.createdAt!)}`}
      />
      {/* 1. Header & Identity Card */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
        {/* Digital Membership Card */}
        <div className="w-full max-w-sm bg-card border border-border p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <IconCrown size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold py-1 px-3 border border-yellow-500/40 text-yellow-500">
                Gold Member
              </span>
              <IconSettings
                size={18}
                className="text-white/20 cursor-pointer hover:text-white"
              />
            </div>
            <p className="text-lg font-bold tracking-widest mb-1">
              TUNDE ADELEKE
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              ID: EV-882-GOLD
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* LEFT: UPCOMING ACCESS (2/3 Column) */}
        <div className="lg:col-span-2 space-y-12">
          {/* Next Up Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-8 border-b border-border pb-4">
              Next Entry
            </h3>
            <div className="bg-card border border-border flex flex-col md:flex-row group cursor-pointer">
              <div className="md:w-1/3 aspect-video md:aspect-square overflow-hidden">
                <img
                  src="/images/event-square.jpg"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-8 flex flex-col justify-between flex-grow">
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    Tonight • 21:00
                  </span>
                  <h4 className="text-2xl font-bold uppercase tracking-tight">
                    The Alára Private Dinner
                  </h4>
                  <p className="text-[10px] text-foreground/60 uppercase flex items-center gap-1">
                    <IconMapPin size={12} /> Victoria Island, Lagos
                  </p>
                </div>
                <Button className="mt-6 md:mt-0 w-fit bg-foreground text-background hover:bg-foreground/90 rounded-none text-[10px] font-bold uppercase tracking-widest py-6 px-8">
                  View Pass <IconArrowUpRight size={14} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Vibe Feed (Recommendations) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-8 border-b border-border pb-4">
              Curated For You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Zaza Friday Night",
                  cat: "Nightlife",
                  img: "/images/zaza.jpg",
                },
                {
                  title: "Wizkid: Secret Set",
                  cat: "Concert",
                  img: "/images/wiz.jpg",
                },
              ].map((item, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="aspect-[16/9] overflow-hidden mb-4 border border-border">
                    <img
                      src={item.img}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
                    {item.cat}
                  </p>
                  <h5 className="text-sm font-bold uppercase">{item.title}</h5>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: ACCOUNT OVERVIEW & QUICK LINKS (1/3 Column) */}
        <div className="space-y-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-card border border-border text-center">
              <IconTicket
                size={24}
                className="mx-auto mb-2 text-muted-foreground"
              />
              <p className="text-xl font-bold">03</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Active Tickets
              </p>
            </div>
            <div className="p-6 bg-card border border-border text-center">
              <IconCalendar
                size={24}
                className="mx-auto mb-2 text-muted-foreground"
              />
              <p className="text-xl font-bold">01</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Table Bookings
              </p>
            </div>
          </div>

          {/* VIP Concierge Card */}
          <div className="p-8 bg-card border border-border">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">
              Request Concierge
            </h4>
            <p className="text-[10px] text-muted-foreground uppercase leading-relaxed mb-6">
              Need a chauffeur or yacht charter? Our 24/7 lifestyle team is
              ready.
            </p>
            <Button
              variant="outline"
              className="w-full rounded-none border-border text-foreground text-[9px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background"
            >
              Start Chat
            </Button>
          </div>

          {/* Loyalty / Spend Progress (Subtle) */}
          <div className="space-y-4">
            <div className="flex justify-between text-[9px] uppercase tracking-widest">
              <span className="text-muted-foreground">
                Tier Progress (Gold → Black)
              </span>
              <span className="text-white">65%</span>
            </div>
            <div className="h-[2px] w-full bg-muted">
              <div className="h-full bg-foreground w-[65%]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;

"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { IconShieldCheck, IconRefresh, IconHeadset } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";

export const TicketingTrust = () => {
  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container">
        {/* 1. Trust Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
          <div className="text-center md:text-left">
            <IconShieldCheck
              className="text-foreground mb-6 mx-auto md:mx-0"
              size={32}
              stroke={1}
            />
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] mb-4">
              Verified Entry
            </h4>
            <p className="text-[11px] text-muted-foreground uppercase leading-relaxed tracking-widest">
              Every ticket is a unique, encrypted QR code synced directly with
              venue protocol. No duplicates. No fraud.
            </p>
          </div>

          <div className="text-center md:text-left">
            <IconRefresh
              className="text-foreground mb-6 mx-auto md:mx-0"
              size={32}
              stroke={1}
            />
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] mb-4">
              Secure Resale
            </h4>
            <p className="text-[11px] text-muted-foreground uppercase leading-relaxed tracking-widest">
              Changed your mind? Resell your tickets exclusively within the
              Ekovibe ecosystem to verified members.
            </p>
          </div>

          <div className="text-center md:text-left">
            <IconHeadset
              className="text-foreground mb-6 mx-auto md:mx-0"
              size={32}
              stroke={1}
            />
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] mb-4">
              At-The-Gate Support
            </h4>
            <p className="text-[11px] text-muted-foreground uppercase leading-relaxed tracking-widest">
              Gold and Black members have access to a dedicated on-site
              concierge for any entry disputes or VIP upgrades.
            </p>
          </div>
        </div>

        {/* 2. Final Newsletter CTA (The Vibe List) */}
        <div className="bg-card p-12 md:p-20 text-center relative rounded-md overflow-hidden border border-border">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase mb-6">
              Never Miss <br />{" "}
              <span className="italic text-foreground/40">The Drop</span>
            </h3>
            <p className="text-xs text-foreground/60 uppercase tracking-[0.2em] mb-10 leading-relaxed">
              The most exclusive events sell out in minutes. Join our priority
              list for SMS alerts on secret sets and headliner tickets.
            </p>

            <div className="flex flex-col md:flex-row gap-2">
              <Input type="email" placeholder="Enter your email" />
              <Button>Join The List</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

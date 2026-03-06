"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowUpRight, IconLoader2 } from "@tabler/icons-react";
import { getPublicEvents, formatNaira, type Event } from "@/lib/events-api";
import { EventCard } from "@/components/EventCard";

export const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicEvents({ limit: 4 })
      .then((res) => setEvents(res.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  // Don't render the section at all if there are no events
  if (!loading && events.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container">
        {/* Header */}
        <div className="flex justify-between items-end mb-12 border-b border-border pb-8">
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Live Now
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase">
              Upcoming{" "}
              <span className="text-foreground/40 italic">Experiences</span>
            </h3>
          </div>
          <Link
            href="/ticketing"
            className="hidden md:flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
          >
            View All
            <IconArrowUpRight
              size={14}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground/30">
            <IconLoader2 size={24} className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href="/ticketing"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            View All Experiences →
          </Link>
        </div>
      </div>
    </section>
  );
};

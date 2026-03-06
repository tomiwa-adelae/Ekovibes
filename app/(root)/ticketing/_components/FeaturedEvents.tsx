"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  IconLock,
  IconCalendarEvent,
  IconMapPin,
  IconLoader2,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  getPublicEvents,
  formatNaira,
  type Event,
  type EventCategory,
} from "@/lib/events-api";
import Image from "next/image";
import { DEFAULT_IMAGE } from "@/constants";
import { formatDate } from "@/lib/utils";
import { EventCard } from "@/components/EventCard";

const FILTERS: { label: string; value: EventCategory | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Music", value: "CONCERT" },
  { label: "Art", value: "ART_EXHIBITION" },
  { label: "Dining", value: "PRIVATE_DINING" },
  { label: "Nightlife", value: "NIGHTLIFE" },
];

export const FeaturedEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<EventCategory | "ALL">(
    "ALL",
  );

  useEffect(() => {
    setLoading(true);
    getPublicEvents({
      category: activeFilter === "ALL" ? undefined : activeFilter,
      limit: 6,
    })
      .then((res) => setEvents(res.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  return (
    <section className="py-16 bg-background text-foreground">
      <div className="container">
        <div className="flex justify-between items-end mb-16 border-b border-border pb-8">
          <div>
            <h2 className="text-sm uppercase text-muted-foreground mb-4 font-medium">
              Curated Access
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold uppercase">
              Featured <span className="text-foreground/40">Drops</span>
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-white/20">
            <IconLoader2 size={20} className="animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[10px] uppercase tracking-widest text-white/20">
              No events available right now
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

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
        <div className="flex justify-jetween items-end mb-16 border-b border-border pb-8">
          <div>
            <h2 className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4 font-medium">
              Curated Access
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase">
              Featured <span className="italic text-foreground/40">Drops</span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event) => {
              const minPrice = event.ticketTiers.length
                ? Math.min(...event.ticketTiers.map((t) => t.price))
                : null;
              const allSoldOut = event.ticketTiers.every(
                (t) => t.sold >= t.quantity,
              );

              return (
                <div
                  key={event.id}
                  className="group relative flex flex-col h-full"
                >
                  <div className="relative aspect-4/5 overflow-hidden mb-6">
                    <Image
                      width={1000}
                      height={1000}
                      src={event.coverImage || DEFAULT_IMAGE}
                      alt={event.title}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                        event.isMemberOnly ? "blur-sm grayscale" : ""
                      }`}
                    />

                    <div className="absolute top-4 left-4">
                      <span className="bg-black/80 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest">
                        {event.category.replace(/_/g, " ")}
                      </span>
                    </div>
                    {event.isMemberOnly && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                        <IconLock
                          size={32}
                          className="text-white mb-4"
                          stroke={1.5}
                        />
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4">
                          Membership Required
                        </p>
                        <Link href="/register">
                          <Button
                            variant="outline"
                            className="rounded-none border-white text-white hover:bg-white hover:text-black text-[10px] uppercase tracking-widest px-6"
                          >
                            Unlock Access
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="grow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold uppercase tracking-tight max-w-[70%]">
                        {event.title}
                      </h4>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase pt-1">
                        {allSoldOut
                          ? "Sold Out"
                          : event.isMemberOnly
                            ? "Members Only"
                            : minPrice !== null
                              ? `From ${formatNaira(minPrice)}`
                              : "Free"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground mb-6">
                      <div className="flex items-center gap-1">
                        <IconCalendarEvent size={14} />
                        <span className="text-xs">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconMapPin size={14} />
                        <span className="text-xs truncate max-w-25">
                          {event.venueName}
                        </span>
                      </div>
                    </div>
                    {!event.isMemberOnly && !allSoldOut && (
                      <Button className="w-full" asChild>
                        <Link href={`/${event.slug}`}>Buy Tickets</Link>
                      </Button>
                    )}
                    {allSoldOut && (
                      <Button
                        disabled
                        className="w-full bg-muted text-muted-foreground rounded-none font-bold uppercase tracking-[0.2em] text-[10px] py-6"
                      >
                        Sold Out
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

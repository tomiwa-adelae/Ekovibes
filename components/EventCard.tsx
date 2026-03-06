import { DEFAULT_IMAGE } from "@/constants";
import { IconCalendarEvent, IconLock, IconMapPin } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { Event, formatNaira } from "@/lib/events-api";
import { formatDate } from "@/lib/utils";

export const EventCard = ({ event }: { event: Event }) => {
  const minPrice = event.ticketTiers.length
    ? Math.min(...event.ticketTiers.map((t) => t.price))
    : null;
  const allSoldOut = event.ticketTiers.every((t) => t.sold >= t.quantity);
  return (
    <div className="group relative flex flex-col h-full">
      <div className="relative aspect-4/5 rounded-md overflow-hidden mb-3">
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
          <span className="bg-black/80 rounded-md backdrop-blur-md border border-white/20 text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest">
            {event.category.replace(/_/g, " ")}
          </span>
        </div>
        {event.isMemberOnly && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
            <IconLock size={32} className="text-white mb-4" stroke={1.5} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4">
              Membership Required
            </p>
            <Link href="/register">
              <Button variant="outline">Unlock Access</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grow">
        <div className="flex justify-between items-start mb-2">
          <Link
            href={`/${event.slug}`}
            className="text-lg hover:underline hover:text-primary font-semibold line-clamp-2 uppercase max-w-[70%]"
          >
            {event.title}
          </Link>
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
            <span className="text-xs">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <IconMapPin size={14} />
            <span className="text-xs truncate max-w-25">{event.venueName}</span>
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
};

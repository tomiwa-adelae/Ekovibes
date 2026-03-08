"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconCalendar,
  IconLoader2,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVendorEvents } from "@/lib/vendor-api";
import {
  formatNaira,
  type AdminEventWithStats,
  type EventStatus,
} from "@/lib/events-api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";

const STATUS_STYLES: Record<EventStatus, string> = {
  LIVE: "bg-green-500/10 text-green-500",
  SOLD_OUT: "bg-red-500/10 text-red-500",
  DRAFT: "bg-muted text-muted-foreground",
  CANCELLED: "bg-orange-500/10 text-orange-500",
  ENDED: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  REJECTED: "bg-red-500/10 text-red-400",
};

export default function VendorEventsPage() {
  const [events, setEvents] = useState<AdminEventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tab, setTab] = useState<"active" | "archived">("active");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    getVendorEvents({ search: debouncedSearch || undefined, limit: 50 })
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          back
          title="My Events"
          description="Manage your events and ticket tiers."
        />
        <Button asChild>
          <Link href="/vendor/events/new">
            <IconPlus size={16} className="mr-1" /> New Event
          </Link>
        </Button>
      </div>

      <div className="relative">
        <IconSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search events..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={tab === "active" ? "default" : "outline"}
          onClick={() => setTab("active")}
        >
          Active
        </Button>
        <Button
          size="sm"
          variant={tab === "archived" ? "default" : "outline"}
          onClick={() => setTab("archived")}
        >
          Deleted
          {events.filter((e) => e.status === "CANCELLED").length > 0 && (
            <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 text-[10px]">
              {events.filter((e) => e.status === "CANCELLED").length}
            </span>
          )}
        </Button>
      </div>

      {(() => {
        const filtered = events
          .filter((e) =>
            tab === "archived"
              ? e.status === "CANCELLED"
              : e.status !== "CANCELLED",
          )
          .filter(
            (e) =>
              !debouncedSearch ||
              e.title.toLowerCase().includes(debouncedSearch.toLowerCase()),
          );

        if (loading) {
          return (
            <div className="flex items-center justify-center h-40">
              <IconLoader2 className="animate-spin text-muted-foreground" />
            </div>
          );
        }

        if (filtered.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <IconCalendar size={36} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {debouncedSearch
                  ? "No events match your search."
                  : tab === "archived"
                    ? "No cancelled events."
                    : "You haven't created any events yet."}
              </p>
              {!debouncedSearch && tab === "active" && (
                <Button size="sm" asChild>
                  <Link href="/vendor/events/new">Create your first event</Link>
                </Button>
              )}
            </div>
          );
        }

        return (
          <div className="divide-y border rounded-lg overflow-hidden">
            {filtered.map((event) => (
              <Link
                key={event.id}
                href={`/vendor/events/${event.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors bg-card"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {event.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="size-12 rounded-md object-cover shrink-0 hidden sm:block"
                    />
                  ) : (
                    <div className="size-12 rounded-md bg-muted shrink-0 hidden sm:block" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(event.date)} · {event.venueName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 ml-4 shrink-0">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-muted-foreground">Sold</p>
                    <p className="text-sm font-semibold">
                      {event.totalSold ?? 0}/{event.totalCapacity ?? 0}
                    </p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-sm font-semibold">
                      {formatNaira(event.totalRevenue ?? 0)}
                    </p>
                  </div>
                  <Badge
                    className={`text-[10px] uppercase tracking-widest ${STATUS_STYLES[event.status]}`}
                  >
                    {event.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

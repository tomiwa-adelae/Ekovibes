"use client";
import React, { useEffect, useState } from "react";
import {
  IconTicket,
  IconCalendar,
  IconCrown,
  IconArrowUpRight,
  IconMapPin,
  IconSettings,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/store/useAuth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_IMAGE } from "@/constants";
import Image from "next/image";
import {
  getPublicEvents,
  getMyTickets,
  type Event,
  type EventCategory,
  type Ticket,
} from "@/lib/events-api";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";

const page = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [activeFilter] = useState<EventCategory | "ALL">("ALL");
  const { user } = useAuth();

  useEffect(() => {
    setEventsLoading(true);
    getPublicEvents({
      category: activeFilter === "ALL" ? undefined : activeFilter,
      limit: 6,
    })
      .then((res) => setEvents(res.data))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, [activeFilter]);

  useEffect(() => {
    getMyTickets()
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setTicketsLoading(false));
  }, []);

  // Derived stats
  const activeTickets = tickets.filter((t) => !t.isUsed);
  const uniqueEvents = new Set(tickets.map((t) => t.order.event.slug)).size;

  // Next entry: earliest upcoming ticket that hasn't been used
  const now = new Date();
  const nextTicket = activeTickets
    .filter((t) => new Date(t.order.event.date) > now)
    .sort(
      (a, b) =>
        new Date(a.order.event.date).getTime() -
        new Date(b.order.event.date).getTime(),
    )[0];

  return (
    <main>
      <PageHeader
        title={`Welcome, ${user?.firstName}`}
        description={`Member since ${formatDate(user?.createdAt!)}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* LEFT: Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Gold Membership Card */}
          {user?.userTier === "gold" && (
            <Card>
              <CardContent>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <IconCrown size={80} />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-10">
                    <span className="text-[9px] uppercase rounded-md font-bold py-1 px-3 border border-yellow-500/40 text-yellow-500 bg-yellow-500/5">
                      Gold Member
                    </span>
                    <Link href="/settings">
                      <IconSettings
                        size={18}
                        className="text-white/20 cursor-pointer hover:text-white transition-colors"
                      />
                    </Link>
                  </div>
                  <p className="text-lg font-bold mb-1 uppercase">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase">
                    Gold Member
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Entry */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Next Entry</CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground/50">
                  <IconLoader2 size={20} className="animate-spin" />
                </div>
              ) : nextTicket ? (
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="md:w-1/3 aspect-[4/3] rounded-lg overflow-hidden relative">
                    <Image
                      fill
                      src={nextTicket.order.event.coverImage || DEFAULT_IMAGE}
                      alt={nextTicket.order.event.title}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase text-yellow-500 tracking-tighter">
                        {new Date(
                          nextTicket.order.event.date,
                        ).toLocaleDateString("en-NG", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        • {nextTicket.order.event.doorsOpen}
                      </span>
                      <h4 className="text-2xl font-bold uppercase">
                        {nextTicket.order.event.title}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <IconMapPin size={14} />{" "}
                        {nextTicket.order.event.venueName}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {nextTicket.orderItem.ticketTier.name} Ticket
                      </p>
                    </div>
                    <div className="pt-4">
                      <Button asChild>
                        <Link href={`/tickets/${nextTicket.code}`}>View Pass</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                  <p className="text-xs uppercase text-muted-foreground tracking-widest">
                    No upcoming events
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/ticketing">Browse Experiences</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Curated Events Grid */}
          <Card className="p-0 pt-4 shadow-none border-0">
            <CardHeader className="p-0 border-b">
              <CardTitle>Curated For You</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {eventsLoading ? (
                <div className="flex items-center justify-center py-24">
                  <IconLoader2
                    size={20}
                    className="animate-spin text-muted-foreground/50"
                  />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-24 border border-dashed rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    No events available
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <EventCard event={event} key={event.id} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="bg-background/50">
              <CardContent className="pt-6 text-center">
                <IconTicket
                  size={24}
                  className="mx-auto mb-2 text-muted-foreground"
                />
                {ticketsLoading ? (
                  <div className="flex justify-center py-1">
                    <IconLoader2
                      size={16}
                      className="animate-spin text-muted-foreground"
                    />
                  </div>
                ) : (
                  <div className="text-2xl font-bold">
                    {String(activeTickets.length).padStart(2, "0")}
                  </div>
                )}
                <p className="text-xs uppercase text-muted-foreground">
                  Active Tickets
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/50">
              <CardContent className="pt-6 text-center">
                <IconCalendar
                  size={24}
                  className="mx-auto mb-2 text-muted-foreground"
                />
                {ticketsLoading ? (
                  <div className="flex justify-center py-1">
                    <IconLoader2
                      size={16}
                      className="animate-spin text-muted-foreground"
                    />
                  </div>
                ) : (
                  <div className="text-2xl font-bold">
                    {String(uniqueEvents).padStart(2, "0")}
                  </div>
                )}
                <p className="text-xs uppercase text-muted-foreground">
                  Events
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <Card>
            <CardContent className="space-y-0">
              {[
                { label: "My Ticket Wallet", href: "/tickets" },
                { label: "Browse Experiences", href: "/ticketing" },
                { label: "Account Settings", href: "/settings" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:text-muted-foreground transition-colors"
                >
                  <span className="text-sm font-medium uppercase">
                    {l.label}
                  </span>
                  <IconArrowUpRight size={14} />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Concierge */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-xs font-bold uppercase mb-1">
                  Request Concierge
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Need a chauffeur or yacht charter? Our 24/7 lifestyle team is
                  ready.
                </p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default page;

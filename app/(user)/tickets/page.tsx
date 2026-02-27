"use client";
import { useEffect, useState } from "react";
import {
  IconTicket,
  IconLoader2,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconX,
  IconCalendar,
  IconMapPin,
} from "@tabler/icons-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { getMyTickets, type Ticket } from "@/lib/events-api";
import { PageHeader } from "@/components/PageHeader";
import Image from "next/image";
import { DEFAULT_IMAGE } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type GroupedEvent = {
  eventTitle: string;
  eventSlug: string;
  eventDate: string;
  venueName: string;
  coverImage?: string;
  tickets: Ticket[];
};

const MyAccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupedEvent[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getMyTickets()
      .then((tickets) => {
        // Group by event slug
        const map = new Map<string, GroupedEvent>();
        for (const t of tickets) {
          const e = t.order.event;
          if (!map.has(e.slug)) {
            map.set(e.slug, {
              eventTitle: e.title,
              eventSlug: e.slug,
              eventDate: e.date,
              venueName: e.venueName,
              coverImage: e.coverImage,
              tickets: [],
            });
          }
          map.get(e.slug)!.tickets.push(t);
        }
        const gs = Array.from(map.values()).sort(
          (a, b) =>
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
        );
        setGroups(gs);
        // Auto-expand first group
        if (gs.length > 0) setExpanded({ [gs[0].eventSlug]: true });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (slug: string) =>
    setExpanded((e) => ({ ...e, [slug]: !e[slug] }));

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <main>
      {/* Header */}
      <PageHeader
        back
        title="Ticket Wallet"
        description={"Your active passes and event access codes."}
      />

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground/50">
          <IconLoader2 size={24} className="animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center flex flex-col items-center justify-center py-24 space-y-6">
          <p className="text-sm text-muted-foreground">No tickets yet</p>
          <Link href="/ticketing">
            <Button>Browse Events</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const expired = isExpired(group.eventDate);
            const open = expanded[group.eventSlug];
            const usedCount = group.tickets.filter((t) => t.isUsed).length;
            const activeCount = group.tickets.length - usedCount;

            return (
              <Card
                key={group.eventSlug}
                className={`${expired ? " opacity-60" : ""} p-0`}
              >
                <CardContent className="px-0">
                  <button
                    onClick={() => toggle(group.eventSlug)}
                    className="w-full flex items-center gap-3 p-6 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-card rounded-md shrink-0 overflow-hidden border border-border">
                      <Image
                        width={1000}
                        height={1000}
                        src={group.coverImage || DEFAULT_IMAGE}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="grow">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold">
                          {group.eventTitle}
                        </p>
                        {expired && (
                          <span className="text-xs px-2 py-0.5 bg-white/5 text-muted-foreground">
                            Past
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconCalendar size={11} />
                          {formatDate(group.eventDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconMapPin size={11} />
                          {group.venueName}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold">
                        {group.tickets.length} ticket
                        {group.tickets.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase">
                        {activeCount} active
                      </p>
                    </div>
                    <div className="text-muted-foreground ml-2">
                      {open ? (
                        <IconChevronUp size={16} />
                      ) : (
                        <IconChevronDown size={16} />
                      )}
                    </div>
                  </button>

                  {/* Tickets */}
                  {open && (
                    <div className="border-t border-border p-6 space-y-6 animate-in fade-in duration-200">
                      {group.tickets.map((ticket, i) => (
                        <Card
                          key={ticket.id}
                          className={`${ticket.isUsed ? "opacity-50" : ""} p-0 py-2`}
                        >
                          <CardContent className="flex flex-col sm:flex-row gap-3 px-2 items-center">
                            {/* QR */}
                            <div
                              className={`bg-white p-3 shrink-0 ${ticket.isUsed ? "grayscale opacity-50" : ""}`}
                            >
                              <QRCodeSVG
                                value={ticket.code}
                                size={120}
                                level="H"
                                bgColor="#ffffff"
                                fgColor="#000000"
                              />
                            </div>

                            {/* Info */}
                            <div className="space-y-3 text-center sm:text-left grow">
                              <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <p className="text-sm font-bold uppercase">
                                  {ticket.orderItem.ticketTier.name}
                                </p>
                                <span
                                  className={`text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold flex items-center gap-1 ${
                                    ticket.isUsed
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-green-500/10 text-green-500"
                                  }`}
                                >
                                  {ticket.isUsed ? (
                                    <>
                                      <IconX size={10} /> Used
                                    </>
                                  ) : (
                                    <>
                                      <IconCheck size={10} /> Active
                                    </>
                                  )}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground break-all">
                                {ticket.code}
                              </p>
                              {ticket.isUsed && ticket.usedAt && (
                                <p className="text-[9px] text-muted-foreground uppercase">
                                  Scanned {formatDate(ticket.usedAt)}
                                </p>
                              )}
                              <p className="text-[9px] text-muted-foreground/50 uppercase">
                                Ticket {i + 1} of {group.tickets.length}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyAccessPage;

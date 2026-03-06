"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconTicket,
  IconLoader2,
  IconCheck,
  IconX,
  IconClock,
  IconShirt,
  IconReceipt,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { getMyTicketByCode, formatNaira, type Ticket } from "@/lib/events-api";
import { DEFAULT_IMAGE } from "@/constants";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TicketDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getMyTicketByCode(code)
      .then(setTicket)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <main className="flex items-center justify-center py-24">
        <IconLoader2
          size={28}
          className="animate-spin text-muted-foreground/50"
        />
      </main>
    );
  }

  if (notFound || !ticket) {
    return (
      <main className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <p className="text-sm uppercase text-muted-foreground tracking-widest">
          Ticket not found
        </p>
        <Button asChild variant="outline">
          <Link href="/tickets">Back to Wallet</Link>
        </Button>
      </main>
    );
  }

  const event = ticket.order.event;
  const tier = ticket.orderItem.ticketTier;
  const isExpired = new Date(event.date) < new Date();

  return (
    <main>
      {/* Back nav */}
      <PageHeader back title={`${event.title} - ${ticket.code}`} />

      <div>
        {/* Event hero */}
        <div className="relative w-full aspect-[16/6] rounded-xl overflow-hidden mb-8 border border-border">
          <Image
            src={event.coverImage || DEFAULT_IMAGE}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
              {event.category.replace(/_/g, " ")}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold uppercase text-white leading-tight">
              {event.title}
            </h1>
          </div>
          {(ticket.isUsed || isExpired) && (
            <div className="absolute top-4 right-4">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-black/60 text-white/50 border border-white/10 backdrop-blur-sm">
                {ticket.isUsed ? "Used" : "Past Event"}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left: QR + code */}
          <div className="md:col-span-2 flex flex-col items-center gap-4">
            <div
              className={`bg-white p-5 rounded-xl shadow-lg ${ticket.isUsed || isExpired ? "grayscale opacity-50" : ""}`}
            >
              <QRCodeSVG
                value={ticket.code}
                size={180}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>

            <div className="text-center space-y-1">
              <p className="font-mono text-base font-bold tracking-widest">
                {ticket.code}
              </p>
              <p className="text-[10px] uppercase text-muted-foreground">
                Show this at the door
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase rounded-md ${
                ticket.isUsed
                  ? "bg-red-500/10 text-red-500"
                  : isExpired
                    ? "bg-white/5 text-muted-foreground"
                    : "bg-green-500/10 text-green-500"
              }`}
            >
              {ticket.isUsed ? (
                <>
                  <IconX size={12} /> Used
                </>
              ) : isExpired ? (
                <>
                  <IconX size={12} /> Expired
                </>
              ) : (
                <>
                  <IconCheck size={12} /> Active
                </>
              )}
            </div>

            {ticket.isUsed && ticket.usedAt && (
              <p className="text-xs text-muted-foreground text-center">
                Scanned on {formatDate(ticket.usedAt)}
              </p>
            )}
          </div>

          {/* Right: Event + ticket details */}
          <div className="md:col-span-3 space-y-4">
            {/* Event details */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-3 py-1">
                  <IconCalendar
                    size={15}
                    className="text-muted-foreground mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>
                <Separator />

                <div className="flex items-start gap-3 py-1">
                  <IconClock
                    size={15}
                    className="text-muted-foreground mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground mb-0.5">
                      Doors Open
                    </p>
                    <p className="text-sm font-semibold uppercase">
                      {event.doorsOpen}
                    </p>
                  </div>
                </div>

                <Separator />
                <div className="flex items-start gap-3 py-1">
                  <IconMapPin
                    size={15}
                    className="text-muted-foreground mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold uppercase">
                      {event.venueName}
                    </p>
                    {event.venueAddress && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.venueAddress}
                      </p>
                    )}
                  </div>
                </div>
                <Separator />

                {(event as any).dressCode && (
                  <div className="flex items-start gap-3 py-1">
                    <IconShirt
                      size={15}
                      className="text-muted-foreground mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-0.5">
                        Dress Code
                      </p>
                      <p className="text-sm font-semibold uppercase">
                        {(event as any).dressCode}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ticket details */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconTicket
                      size={15}
                      className="text-muted-foreground shrink-0"
                    />
                    <p className="text-sm font-semibold uppercase">
                      {tier.name}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{formatNaira(tier.price)}</p>
                </div>
                <Separator />

                <div className="flex items-center gap-3">
                  <IconReceipt
                    size={15}
                    className="text-muted-foreground shrink-0"
                  />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground mb-0.5">
                      Order Reference
                    </p>
                    <p className="text-sm">{ticket.order.reference}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/${event.slug}`}>View Event Page</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/tickets">Back to Wallet</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

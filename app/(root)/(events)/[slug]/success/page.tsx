"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { getMyTickets, type Ticket } from "@/lib/events-api";
import { Card, CardContent } from "@/components/ui/card";

const SuccessPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTickets()
      .then((all) => {
        const forThisOrder = ref
          ? all.filter((t) => t.order.reference === ref)
          : all.slice(0, 3);
        setTickets(forThisOrder);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ref]);

  const event = tickets[0]?.order?.event;

  return (
    <main className="py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs text-muted-foreground mb-3">
            Booking Confirmed
          </p>
          <h1 className="text-4xl font-bold uppercase mb-4">You&apos;re In</h1>
          {event && (
            <p className="text-sm text-foreground/50">
              Your tickets for{" "}
              <span className="text-foreground font-bold uppercase">
                {event.title}
              </span>{" "}
              are confirmed.
            </p>
          )}
          {ref && (
            <p className="text-xs text-muted-foreground mt-3">Ref: {ref}</p>
          )}
        </div>

        {/* Tickets */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <IconLoader2 size={24} className="animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-xs">
              Your tickets will appear in your access portal shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {tickets.map((ticket, i) => (
              <Card key={ticket.id}>
                <CardContent className="flex flex-col sm:flex-row gap-8 items-start justify-center">
                  {/* QR Code */}
                  <div className="w-full sm:w-auto flex items-center sm:items-start justify-center sm:justify-start">
                    <QRCodeSVG
                      value={ticket.code}
                      size={140}
                      level="H"
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>

                  {/* Ticket Info */}
                  <div className="space-y-4 text-center flex-1 sm:text-left">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Ticket {i + 1} of {tickets.length}
                      </p>
                      <p className="text-sm font-semibold uppercase">
                        {ticket.orderItem.ticketTier.name}
                      </p>
                    </div>
                    {event && (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">
                            Event
                          </p>
                          <p className="text-sm font-semibold uppercase">
                            {event.title}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">
                            Date
                          </p>
                          <p className="text-sm font-semibold uppercase">
                            {new Date(event.date).toLocaleDateString("en-NG", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">
                            Venue
                          </p>
                          <p className="text-sm font-semibold uppercase">
                            {event.venueName}
                          </p>
                        </div>
                      </>
                    )}
                    <p className="text-xs text-muted-foreground break-all">
                      {ticket.code}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/tickets" className="flex-1">
            <Button className="w-full">View All My Tickets</Button>
          </Link>
          <Link href="/ticketing" className="flex-1">
            <Button variant="outline" className="w-full">
              Discover More Events
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default SuccessPage;

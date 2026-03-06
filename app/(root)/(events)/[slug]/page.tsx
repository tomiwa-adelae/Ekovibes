"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  IconCalendar,
  IconMapPin,
  IconClock,
  IconTicket,
  IconLoader2,
  IconLock,
} from "@tabler/icons-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/store/useAuth";
import {
  getEventBySlug,
  initiateOrder,
  verifyOrder,
  formatNaira,
  type Event,
} from "@/lib/events-api";
import { env } from "@/lib/env";
import Image from "next/image";
import { DEFAULT_IMAGE } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/Loader";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const SERVICE_FEE_PER_TICKET = 15000; // kobo — matches backend

const EventDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  // quantities: tierId → quantity selected (0 = not selected)
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getEventBySlug(slug)
      .then((e) => {
        setEvent(e);
        const init: Record<string, number> = {};
        e.ticketTiers.forEach((t) => {
          init[t.id] = 0;
        });
        setQuantities(init);
      })
      .catch(() => toast.error("Event not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  // Inject Paystack script
  useEffect(() => {
    const existing = document.getElementById("paystack-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "paystack-script";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const setQty = (tierId: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [tierId]: value }));
  };

  // Only tiers with qty > 0
  const selectedItems = event
    ? event.ticketTiers
        .filter((t) => (quantities[t.id] ?? 0) > 0)
        .map((t) => ({ tier: t, quantity: quantities[t.id] }))
    : [];

  const totalTickets = selectedItems.reduce((s, i) => s + i.quantity, 0);
  const subtotal = selectedItems.reduce(
    (s, i) => s + i.tier.price * i.quantity,
    0,
  );
  const serviceFee = SERVICE_FEE_PER_TICKET * totalTickets;
  const total = subtotal + serviceFee;

  console.log(total);

  const handlePay = async () => {
    if (!user) {
      toast.error("Please log in to purchase tickets");
      router.push("/login");
      return;
    }
    if (!event || selectedItems.length === 0) return;

    setPaying(true);
    try {
      const order = await initiateOrder({
        eventId: event.id,
        items: selectedItems.map((i) => ({
          tierId: i.tier.id,
          quantity: i.quantity,
        })),
      });

      const handler = window.PaystackPop.setup({
        key: env.NEXT_PUBLIC_PAYSTACK_KEY,
        email: user.email,
        amount: order.total,
        ref: order.reference,
        metadata: { orderId: order.orderId },
        callback: (response: { reference: string }) => {
          verifyOrder(response.reference)
            .then(() => {
              toast.success("Payment confirmed! Your tickets are ready.");
              router.push(`/${slug}/success?ref=${response.reference}`);
            })
            .catch(() => {
              toast.error(
                "Payment verification failed. Contact support with ref: " +
                  response.reference,
              );
            })
            .finally(() => setPaying(false));
        },
        onClose: () => {
          toast("Payment cancelled");
          setPaying(false);
        },
      });

      handler.openIframe();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Could not initiate payment");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="pt-24 bg-background text-foreground min-h-screen flex items-center justify-center">
        <IconLoader2 size={32} className="animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="pt-24 bg-background text-foreground min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-sm uppercase text-muted-foreground">
          Event not found
        </p>
        <Link href="/ticketing">
          <Button variant="outline">Browse Events</Button>
        </Link>
      </main>
    );
  }

  const allSoldOut = event.ticketTiers.every((t) => t.sold >= t.quantity);

  return (
    <main className="py-16">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* LEFT — Event info */}
          <div className="lg:w-[65%]">
            <div className="aspect-video w-full rounded-md overflow-hidden mb-6 border border-border">
              <Image
                width={1000}
                height={1000}
                src={event.coverImage || DEFAULT_IMAGE}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mb-8">
              <Badge variant={"secondary"}>
                {event.category.replace(/_/g, " ")}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 uppercase mb-8">
                {event.title}
              </h1>

              <div className="grid grid-cols-2 2xl:grid-cols-4 gap-6 py-8 border-y border-border">
                {[
                  {
                    label: "Date",
                    value: event.date && formatDate(event.date),
                    icon: <IconCalendar size={14} />,
                  },
                  {
                    label: "Doors Open",
                    value: event.doorsOpen,
                    icon: <IconClock size={14} />,
                  },
                  {
                    label: "Location",
                    value: event.venueName,
                    icon: <IconMapPin size={14} />,
                  },
                  {
                    label: "Dress Code",
                    value: event.dressCode ?? "Smart Casual",
                    icon: null,
                  },
                ].map((m) => (
                  <div key={m.label} className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {m.icon} {m.label}
                    </p>
                    <p className="text-sm font-semibold uppercase">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {event.description && (
              <div className="mb-16">
                <h3 className="text-lg font-semibold uppercase mb-4">
                  The Experience
                </h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — Box Office */}
          <div className="lg:w-[35%]">
            <Card className="sticky top-28">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <IconTicket size={16} /> Select Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                {event.isMemberOnly && !user ? (
                  <div className="text-center py-4 space-y-4">
                    <IconLock
                      size={32}
                      className="mx-auto text-muted-foreground"
                      stroke={1}
                    />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Member access required
                    </p>
                    <Link href="/register">
                      <Button className="w-full">Become a Member</Button>
                    </Link>
                  </div>
                ) : allSoldOut ? (
                  <p className="text-center text-sm text-muted-foreground py-6 uppercase tracking-widest">
                    Sold Out
                  </p>
                ) : (
                  <>
                    {/* Per-tier quantity steppers */}
                    <div className="space-y-3 mb-6">
                      {event.ticketTiers.map((tier) => {
                        const isSoldOut = tier.sold >= tier.quantity;
                        const remaining = tier.quantity - tier.sold;
                        const qty = quantities[tier.id] ?? 0;

                        return (
                          <div
                            key={tier.id}
                            className={`border rounded-lg p-4 transition-all ${
                              isSoldOut
                                ? "border-border opacity-40"
                                : qty > 0
                                  ? "border-foreground bg-muted"
                                  : "border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">
                                  {tier.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatNaira(tier.price)} each
                                </p>
                                {isSoldOut ? (
                                  <p className="text-[10px] text-muted-foreground uppercase mt-1">
                                    Sold Out
                                  </p>
                                ) : remaining <= 10 ? (
                                  <p className="text-[10px] text-orange-400 uppercase mt-1">
                                    {remaining} left
                                  </p>
                                ) : null}
                              </div>

                              {!isSoldOut && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <Button
                                    size="icon-sm"
                                    variant="secondary"
                                    onClick={() =>
                                      setQty(tier.id, Math.max(0, qty - 1))
                                    }
                                    disabled={qty === 0}
                                  >
                                    −
                                  </Button>
                                  <span className="text-sm font-semibold w-5 text-center tabular-nums">
                                    {qty}
                                  </span>
                                  <Button
                                    size="icon-sm"
                                    variant="secondary"
                                    onClick={() =>
                                      setQty(
                                        tier.id,
                                        Math.min(remaining, qty + 1),
                                      )
                                    }
                                    disabled={qty >= remaining}
                                  >
                                    +
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order summary — visible when at least one tier selected */}
                    {selectedItems.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-2 mb-4">
                          {selectedItems.map((item) => (
                            <div
                              key={item.tier.id}
                              className="flex justify-between text-xs text-muted-foreground"
                            >
                              <span>
                                {item.tier.name} × {item.quantity}
                              </span>
                              <span>
                                {formatNaira(item.tier.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              Service Fee ({totalTickets} ticket
                              {totalTickets !== 1 ? "s" : ""})
                            </span>
                            <span>{formatNaira(serviceFee)}</span>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex justify-between text-base font-semibold">
                            <span>Total</span>
                            <span>{formatNaira(total)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <Button
                      onClick={handlePay}
                      disabled={selectedItems.length === 0 || paying}
                      className="w-full"
                    >
                      {paying ? (
                        <Loader />
                      ) : selectedItems.length === 0 ? (
                        "Select tickets above"
                      ) : (
                        `Confirm & Pay — ${formatNaira(total)}`
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground mt-6">
                      Instant QR Delivery • No Refunds
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EventDetailsPage;

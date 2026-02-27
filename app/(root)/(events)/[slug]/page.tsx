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
  type TicketTier,
} from "@/lib/events-api";
import { env } from "@/lib/env";
import Image from "next/image";
import { DEFAULT_IMAGE } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/Loader";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const EventDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getEventBySlug(slug)
      .then((e) => {
        setEvent(e);
        const firstAvailable = e.ticketTiers.find((t) => t.sold < t.quantity);
        if (firstAvailable) setSelectedTier(firstAvailable);
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

  const serviceFee = 250000 * quantity;
  const subtotal = selectedTier ? selectedTier.price * quantity : 0;
  const total = subtotal + serviceFee;

  const availableQty = selectedTier
    ? selectedTier.quantity - selectedTier.sold
    : 0;

  const handlePay = async () => {
    if (!user) {
      toast.error("Please log in to purchase tickets");
      router.push("/login");
      return;
    }
    if (!selectedTier || !event) return;

    setPaying(true);
    try {
      const order = await initiateOrder({
        eventId: event.id,
        tierId: selectedTier.id,
        quantity,
      });

      const handler = window.PaystackPop.setup({
        key: env.NEXT_PUBLIC_PAYSTACK_KEY,
        email: user.email,
        amount: order.total,
        ref: order.reference,
        metadata: { orderId: order.orderId },
        // Must be a plain (non-async) function — Paystack validates this
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
            .finally(() => {
              setPaying(false);
            });
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
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Event not found
        </p>
        <Link href="/ticketing">
          <Button
            variant="outline"
            className="rounded-none text-[10px] uppercase tracking-widest"
          >
            Browse Events
          </Button>
        </Link>
      </main>
    );
  }

  const allSoldOut = event.ticketTiers.every((t) => t.sold >= t.quantity);

  return (
    <main className="py-16">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT — The Vibe (65%) */}
          <div className="lg:w-[65%]">
            {/* Hero Image */}
            <div className="aspect-video w-full overflow-hidden mb-6 border border-border">
              <Image
                width={1000}
                height={1000}
                src={event.coverImage || DEFAULT_IMAGE}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Headline & Meta */}
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

            {/* Description */}
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

          {/* RIGHT — Box Office (35%, sticky) */}
          <div className="lg:w-[35%]">
            <Card className="sticky top-28">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center">
                  <IconTicket size={16} /> Select Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                {event.isMemberOnly && !user && (
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
                )}

                {(!event.isMemberOnly || user) && (
                  <>
                    {/* Tier Selection */}
                    <div className="space-y-3 mb-6">
                      {event.ticketTiers.map((tier) => {
                        const isSoldOut = tier.sold >= tier.quantity;
                        const remaining = tier.quantity - tier.sold;
                        const isSelected = selectedTier?.id === tier.id;

                        return (
                          <Card
                            key={tier.id}
                            onClick={() => !isSoldOut && setSelectedTier(tier)}
                            className={`cursor-pointer py-4 transition-all ${
                              isSoldOut
                                ? "border-border opacity-40 cursor-not-allowed"
                                : isSelected
                                  ? "border-foreground bg-muted"
                                  : "border-border hover:border-foreground/30"
                            }`}
                          >
                            <CardContent>
                              <div className="flex items-center justify-between gap-2">
                                <CardDescription>{tier.name}</CardDescription>
                                <CardDescription>
                                  {isSoldOut
                                    ? "Sold Out"
                                    : remaining <= 10
                                      ? `${remaining} Left`
                                      : "Available"}
                                </CardDescription>
                              </div>
                              <CardTitle className="text-sm mt-2">
                                {formatNaira(tier.price)}
                              </CardTitle>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    <Separator className="my-6" />

                    {/* Quantity */}
                    {selectedTier && !allSoldOut && (
                      <Card>
                        <CardContent className="flex items-center justify-between ">
                          <CardDescription>Quantity</CardDescription>
                          <div className="flex items-center gap-4">
                            <Button
                              size={"icon-sm"}
                              variant={"secondary"}
                              onClick={() =>
                                setQuantity((q) => Math.max(1, q - 1))
                              }
                            >
                              −
                            </Button>
                            <span className="text-sm font-semibold w-4 text-center">
                              {quantity}
                            </span>
                            <Button
                              size={"icon-sm"}
                              variant={"secondary"}
                              onClick={() =>
                                setQuantity((q) =>
                                  Math.min(availableQty, q + 1),
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Separator className="my-6" />

                    {/* Order Summary */}
                    {selectedTier && (
                      <div className="mb-4 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {selectedTier.name} × {quantity}
                          </span>
                          <span>{formatNaira(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Service Fee</span>
                          <span>{formatNaira(serviceFee)}</span>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex justify-between text-base font-semibold">
                          <span>Total</span>
                          <span>{formatNaira(total)}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handlePay}
                      disabled={!selectedTier || allSoldOut || paying}
                      className="w-full"
                    >
                      {paying ? (
                        <Loader />
                      ) : allSoldOut ? (
                        "Sold Out"
                      ) : (
                        "Confirm & Pay"
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

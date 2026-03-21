"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconChevronRight,
  IconChevronLeft,
  IconClock,
  IconLoader2,
  IconMapPin,
  IconMinus,
  IconPlus,
  IconUsers,
  IconWorld,
  IconBrandInstagram,
  IconPhone,
  IconCheck,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/store/useAuth";
import {
  getVenueBySlug,
  getAvailability,
  initiateReservation,
  joinWaitlist,
  formatNaira,
  VENUE_CATEGORY_LABELS,
  SPACE_TYPE_LABELS,
  DAYS_OF_WEEK,
  type Venue,
  type AvailabilitySession,
  type AvailableSlot,
  type VenueSpace,
  type DayOfWeek,
} from "@/lib/reservations-api";
import { AuthModal } from "@/components/AuthModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatPhoneNumber } from "@/lib/utils";

type Step = "date" | "slots" | "spaces" | "confirm";

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

function toDateInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function VenueDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Booking state
  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState(toDateInput(new Date()));
  const [partySize, setPartySize] = useState(2);

  // Availability
  const [availability, setAvailability] = useState<
    AvailabilitySession[] | null
  >(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [availChecked, setAvailChecked] = useState(false);

  // Selections
  const [selectedSession, setSelectedSession] =
    useState<AvailabilitySession | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedSpaces, setSelectedSpaces] = useState<
    Pick<VenueSpace, "id" | "name" | "type" | "capacity" | "minSpend">[]
  >([]);

  // Gallery lightbox
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Notes
  const [notes, setNotes] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Submission
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getVenueBySlug(slug as string)
      .then(setVenue)
      .catch(() => toast.error("Venue not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  const checkAvailability = async () => {
    if (!venue) return;
    setAvailLoading(true);
    setAvailChecked(false);
    setSelectedSession(null);
    setSelectedSlot(null);
    setSelectedSpaces([]);
    try {
      const res = await getAvailability(venue.slug, date, partySize);
      if (res.blocked) {
        toast.error("This venue is not available on the selected date.");
        setAvailability([]);
      } else if (res.closed) {
        toast.error("This venue is closed on the selected day.");
        setAvailability([]);
      } else {
        setAvailability(res.sessions);
        if (res.sessions.length === 0)
          toast.info("No sessions available for this date.");
      }
      setAvailChecked(true);
      setStep("slots");
    } catch {
      toast.error("Failed to check availability.");
    } finally {
      setAvailLoading(false);
    }
  };

  const handleSelectSlot = (
    session: AvailabilitySession,
    slot: AvailableSlot,
  ) => {
    if (!slot.available) {
      toast.info("This slot is full. You can join the waitlist.");
      return;
    }
    setSelectedSession(session);
    setSelectedSlot(slot);
    setSelectedSpaces([]);
    setStep("spaces");
  };

  const toggleSpace = (space: AvailableSlot["availableSpaces"][0]) => {
    setSelectedSpaces((prev) =>
      prev.find((s) => s.id === space.id)
        ? prev.filter((s) => s.id !== space.id)
        : [...prev, space],
    );
  };

  const handleConfirm = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (
      !venue ||
      !selectedSession ||
      !selectedSlot ||
      selectedSpaces.length === 0
    )
      return;
    setSubmitting(true);
    try {
      const res = await initiateReservation({
        venueSlug: venue.slug,
        sessionId: selectedSession.sessionId,
        date,
        timeSlot: selectedSlot.timeSlot,
        partySize,
        spaceIds: selectedSpaces.map((s) => s.id),
        notes: notes || undefined,
        specialRequests: specialRequests || undefined,
      });

      if (res.payment?.authorizationUrl) {
        window.location.href = res.payment.authorizationUrl;
      } else {
        toast.success("Reservation confirmed!");
        router.push(`/tables`);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to submit reservation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinWaitlist = async (
    slot: AvailableSlot,
    session: AvailabilitySession,
  ) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!venue) return;
    try {
      await joinWaitlist({
        venueSlug: venue.slug,
        sessionId: session.sessionId,
        date,
        timeSlot: slot.timeSlot,
        partySize,
      });
      toast.success(
        "You've been added to the waitlist. We'll notify you if a spot opens up.",
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to join waitlist");
    }
  };

  // Deposit calculation
  const depositAmount = (() => {
    if (!venue?.policy || !selectedSpaces.length) return 0;
    const p = venue.policy;
    if (p.depositType === "FLAT" && p.depositAmount) return p.depositAmount;
    if (p.depositType === "PERCENTAGE_OF_MIN_SPEND" && p.depositPercent) {
      const totalMinSpend = selectedSpaces.reduce(
        (s, sp) => s + (sp.minSpend ?? 0),
        0,
      );
      return Math.round((totalMinSpend * p.depositPercent) / 100);
    }
    return 0;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <IconLoader2 className="animate-spin text-muted-foreground" size={28} />
      </div>
    );
  }

  if (!venue) return null;

  const operatingHoursFormatted = DAYS_OF_WEEK.map((day) => {
    const h = venue.operatingHours?.find((oh) => oh.dayOfWeek === day);
    return {
      day: DAY_LABELS[day],
      closed: !h || h.isClosed,
      open: h?.openTime,
      close: h?.closeTime,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      <div className="container py-8">
        {/* Back */}
        <Link
          href="/reservations"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <IconArrowLeft size={15} /> Back to venues
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* LEFT: Venue Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cover / Gallery */}
            {venue.images.length === 0 &&
              (venue.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={venue.coverImage}
                  alt={venue.name}
                  className="w-full aspect-video object-cover rounded-xl cursor-pointer"
                  onClick={() => {
                    setGalleryIndex(0);
                    setGalleryOpen(true);
                  }}
                />
              ) : (
                <div className="w-full aspect-video bg-muted rounded-xl flex items-center justify-center">
                  <IconBuilding
                    size={48}
                    className="text-muted-foreground/30"
                  />
                </div>
              ))}

            {/* Gallery grid (includes cover) */}
            {venue.images.length > 0 &&
              (() => {
                const allImages = [
                  ...(venue.coverImage ? [venue.coverImage] : []),
                  ...venue.images,
                ];
                const preview = allImages.slice(0, 4);
                return (
                  <div className="relative">
                    <div
                      className={`grid gap-1.5 rounded-xl overflow-hidden ${
                        preview.length === 1
                          ? "grid-cols-1"
                          : preview.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-2"
                      }`}
                    >
                      {preview.length <= 2 ? (
                        preview.map((img, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="w-full aspect-video object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              setGalleryIndex(i);
                              setGalleryOpen(true);
                            }}
                          />
                        ))
                      ) : (
                        <>
                          {/* Left: big image */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview[0]}
                            alt=""
                            className="w-full aspect-square object-cover cursor-pointer hover:opacity-90 transition-opacity row-span-2"
                            onClick={() => {
                              setGalleryIndex(0);
                              setGalleryOpen(true);
                            }}
                          />
                          {/* Right: up to 3 smaller */}
                          <div className="grid grid-rows-2 gap-1.5">
                            {preview.slice(1, 3).map((img, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={i}
                                src={img}
                                alt=""
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ aspectRatio: "16/9" }}
                                onClick={() => {
                                  setGalleryIndex(i + 1);
                                  setGalleryOpen(true);
                                }}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {/* View all button */}
                    {allImages.length > 4 && (
                      <button
                        onClick={() => {
                          setGalleryIndex(0);
                          setGalleryOpen(true);
                        }}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-background transition-colors"
                      >
                        <IconPhoto size={13} />
                        View all {allImages.length} photos
                      </button>
                    )}
                  </div>
                );
              })()}

            {/* Lightbox */}
            {galleryOpen &&
              (() => {
                const allImages = [
                  ...(venue.coverImage ? [venue.coverImage] : []),
                  ...venue.images,
                ];
                return (
                  <div
                    className="fixed inset-0 z-50 bg-black/95 flex flex-col"
                    onClick={() => setGalleryOpen(false)}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center justify-between px-4 py-3 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-white/70 text-sm">
                        {galleryIndex + 1} / {allImages.length}
                      </span>
                      <button
                        onClick={() => setGalleryOpen(false)}
                        className="text-white/70 hover:text-white p-1"
                      >
                        <IconX size={20} />
                      </button>
                    </div>

                    {/* Main image */}
                    <div
                      className="flex-1 flex items-center justify-center relative px-12 min-h-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={allImages[galleryIndex]}
                        alt=""
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                      {/* Prev */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setGalleryIndex(
                                (i) =>
                                  (i - 1 + allImages.length) % allImages.length,
                              )
                            }
                            className="absolute left-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                          >
                            <IconChevronLeft size={20} />
                          </button>
                          <button
                            onClick={() =>
                              setGalleryIndex((i) => (i + 1) % allImages.length)
                            }
                            className="absolute right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                          >
                            <IconChevronRight size={20} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail strip */}
                    <div
                      className="flex gap-2 px-4 py-3 overflow-x-auto shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {allImages.map((img, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={img}
                          alt=""
                          onClick={() => setGalleryIndex(i)}
                          className={`h-14 w-20 object-cover rounded cursor-pointer shrink-0 transition-opacity ${
                            i === galleryIndex
                              ? "opacity-100 ring-2 ring-white"
                              : "opacity-50 hover:opacity-80"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

            {/* Title */}
            <div>
              <div className="flex items-start gap-3 justify-between">
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1">
                    {VENUE_CATEGORY_LABELS[venue.category]}
                  </p>
                  <h1 className="text-3xl font-bold uppercase">{venue.name}</h1>
                </div>
                <Badge variant="outline" className="mt-1">
                  {venue.bookingMode === "INSTANT"
                    ? "Instant Book"
                    : "Request to Book"}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                <IconMapPin size={14} />
                {venue.address}, {venue.city}
              </div>
            </div>

            {/* Description */}
            {venue.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {venue.description}
              </p>
            )}

            {/* Contact */}
            <div className="flex flex-wrap gap-4 text-sm">
              {venue.phone && (
                <a
                  href={`tel:${venue.phone}`}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <IconPhone size={14} /> {formatPhoneNumber(venue.phone)}
                </a>
              )}
              {venue.instagram && (
                <a
                  href={`https://instagram.com/${venue.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <IconBrandInstagram size={14} /> {venue.instagram}
                </a>
              )}
              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <IconWorld size={14} /> Website
                </a>
              )}
            </div>

            {/* Operating Hours */}
            {venue.operatingHours && venue.operatingHours.length > 0 && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Operating Hours</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                  {operatingHoursFormatted.map(
                    ({ day, closed, open, close }) => (
                      <div
                        key={day}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground w-8">{day}</span>
                        {closed ? (
                          <span className="text-muted-foreground/50 text-xs">
                            Closed
                          </span>
                        ) : (
                          <span>
                            {open} – {close}
                          </span>
                        )}
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>
            )}

            {/* Spaces overview */}
            {venue.spaces && venue.spaces.length > 0 && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Available Spaces</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {venue.spaces.map((space) => (
                    <div
                      key={space.id}
                      className="border rounded-lg p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{space.name}</p>
                        <Badge variant="outline" className="text-[10px]">
                          {SPACE_TYPE_LABELS[space.type]}
                        </Badge>
                      </div>
                      <div className="grid gap-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconUsers size={11} /> Up to {space.capacity}
                        </span>
                        {space.minSpend && (
                          <span>{formatNaira(space.minSpend)} min spend</span>
                        )}
                      </div>
                      {space.description && (
                        <p className="text-xs text-muted-foreground">
                          {space.description}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Cancellation policy */}
            {venue.policy && venue.policy.depositType !== "NONE" && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Booking Policy</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1 text-muted-foreground">
                  {venue.policy.depositType === "FLAT" &&
                    venue.policy.depositAmount && (
                      <p>
                        Deposit required:{" "}
                        {formatNaira(venue.policy.depositAmount)} per booking
                      </p>
                    )}
                  {venue.policy.depositType === "PERCENTAGE_OF_MIN_SPEND" &&
                    venue.policy.depositPercent && (
                      <p>
                        Deposit: {venue.policy.depositPercent}% of minimum spend
                      </p>
                    )}
                  {venue.policy.fullRefundHoursThreshold && (
                    <p>
                      Full refund if cancelled{" "}
                      {venue.policy.fullRefundHoursThreshold}+ hours before
                    </p>
                  )}
                  {venue.policy.partialRefundHoursThreshold &&
                    venue.policy.partialRefundPercent && (
                      <p>
                        {venue.policy.partialRefundPercent}% refund if cancelled{" "}
                        {venue.policy.partialRefundHoursThreshold}+ hours before
                      </p>
                    )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT: Booking Widget */}
          <div className="lg:col-span-2">
            <Card className="sticky top-20">
              <CardHeader className="border-b">
                <CardTitle>Book a Table</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Step indicator */}
                <div className="flex items-center pb-2.5 border-b text-xs gap-1 text-muted-foreground">
                  {(["date", "slots", "spaces", "confirm"] as Step[]).map(
                    (s, i) => (
                      <React.Fragment key={s}>
                        {i > 0 && <IconChevronRight size={12} />}
                        <span
                          className={
                            step === s ? "text-foreground font-medium" : ""
                          }
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </span>
                      </React.Fragment>
                    ),
                  )}
                </div>

                <div className="pt-4 space-y-4">
                  {/* Step 1: Date + party size */}
                  {step === "date" && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="mb-2.5">Date</Label>
                        <input
                          type="date"
                          value={date}
                          min={toDateInput(new Date())}
                          onChange={(e) => {
                            setDate(e.target.value);
                            setAvailChecked(false);
                            setAvailability(null);
                          }}
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="mb-2.5">Party Size</Label>
                        <div className="flex items-center gap-3">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              setPartySize((n) => Math.max(1, n - 1))
                            }
                          >
                            <IconMinus size={12} />
                          </Button>
                          <span className="w-12 text-center font-bold text-base">
                            {partySize}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              setPartySize((n) => Math.min(50, n + 1))
                            }
                          >
                            <IconPlus size={12} />
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {partySize === 1 ? "guest" : "guests"}
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={checkAvailability}
                        disabled={availLoading || !date}
                      >
                        {availLoading ? (
                          <IconLoader2
                            size={14}
                            className="animate-spin mr-1"
                          />
                        ) : (
                          <IconCalendar />
                        )}
                        Check Availability
                      </Button>
                    </>
                  )}

                  {/* Step 2: Slot selection */}
                  {step === "slots" && availChecked && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold">
                            {formatDisplayDate(date)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {partySize} guests
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          onClick={() => {
                            setStep("date");
                            setAvailability(null);
                            setAvailChecked(false);
                          }}
                        >
                          Change
                        </Button>
                      </div>

                      {!availability || availability.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground border rounded-md">
                          No available slots for this date.
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                          {availability.map((session) => (
                            <div key={session.sessionId} className="space-y-2">
                              <p className="text-xs font-semibold uppercase text-muted-foreground">
                                {session.sessionName}
                                <span className="ml-2 font-normal">
                                  ({session.startTime}–{session.endTime})
                                </span>
                              </p>
                              <div className="grid grid-cols-3 gap-1.5">
                                {session.slots.map((slot) => (
                                  <div key={slot.timeSlot} className="relative">
                                    <button
                                      onClick={() =>
                                        slot.available
                                          ? handleSelectSlot(session, slot)
                                          : handleJoinWaitlist(slot, session)
                                      }
                                      className={`w-full py-1.5 text-xs rounded-lg border text-center transition-colors ${
                                        slot.available
                                          ? "hover:bg-primary hover:text-background border-border"
                                          : "border-dashed border-muted text-muted-foreground/50 text-[10px]"
                                      }`}
                                    >
                                      {slot.timeSlot}
                                      {!slot.available && (
                                        <span className="block text-[9px] leading-none mt-0.5">
                                          Waitlist
                                        </span>
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Step 3: Space selection */}
                  {step === "spaces" && selectedSlot && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">
                            {selectedSession?.sessionName} ·{" "}
                            {selectedSlot.timeSlot}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDisplayDate(date)} · {partySize} guests
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          onClick={() => setStep("slots")}
                        >
                          Change
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          Select a space
                        </p>
                        {selectedSlot.availableSpaces.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No spaces available for this slot.
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {selectedSlot.availableSpaces.map((space) => {
                              const isSelected = selectedSpaces.some(
                                (s) => s.id === space.id,
                              );
                              return (
                                <button
                                  key={space.id}
                                  onClick={() => toggleSpace(space)}
                                  className={`w-full text-left border rounded-lg p-3 transition-colors ${
                                    isSelected
                                      ? "border-foreground bg-foreground/5"
                                      : "hover:border-foreground/40"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium">
                                        {space.name}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <span>
                                          {SPACE_TYPE_LABELS[space.type]}
                                        </span>
                                        <span>·</span>
                                        <span>
                                          <IconUsers
                                            size={10}
                                            className="inline"
                                          />{" "}
                                          {space.capacity}
                                        </span>
                                        {space.minSpend && (
                                          <>
                                            <span>·</span>
                                            <span>
                                              {formatNaira(space.minSpend)} min
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <IconCheck
                                        size={16}
                                        className="text-foreground shrink-0"
                                      />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        disabled={selectedSpaces.length === 0}
                        onClick={() => setStep("confirm")}
                      >
                        Continue
                      </Button>
                    </>
                  )}

                  {/* Step 4: Confirm */}
                  {step === "confirm" && (
                    <>
                      <div className="border rounded-lg p-3 space-y-2 bg-muted/30 text-sm">
                        <p className="font-bold">{venue.name}</p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <IconCalendar size={11} /> {formatDisplayDate(date)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <IconClock size={11} />
                            {selectedSession?.sessionName} ·{" "}
                            {selectedSlot?.timeSlot}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <IconUsers size={11} /> {partySize}{" "}
                            {partySize === 1 ? "guest" : "guests"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <IconBuilding size={11} />
                            {selectedSpaces.map((s) => s.name).join(", ")}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="mb-2.5">
                            Notes{" "}
                            <span className="text-muted-foreground font-normal">
                              (optional)
                            </span>
                          </Label>
                          <Textarea
                            placeholder="Any additional notes…"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="mb-2.5">
                            Special Requests{" "}
                            <span className="text-muted-foreground font-normal">
                              (optional)
                            </span>
                          </Label>
                          <Textarea
                            placeholder="Dietary requirements, occasion, seating preferences…"
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      {depositAmount > 0 && (
                        <div className="border rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Deposit required
                            </span>
                            <span className="font-bold">
                              {formatNaira(depositAmount)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            You will be redirected to pay via Paystack.
                          </p>
                        </div>
                      )}

                      {!user && (
                        <p className="text-xs text-yellow-500 bg-yellow-500/10 rounded-lg px-3 py-2">
                          You must be logged in to make a reservation.
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setStep("spaces")}
                          disabled={submitting}
                        >
                          Back
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleConfirm}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <IconLoader2
                              size={14}
                              className="animate-spin mr-1"
                            />
                          ) : (
                            <IconCheck size={14} className="mr-1" />
                          )}
                          {depositAmount > 0 ? "Pay & Book" : "Confirm"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

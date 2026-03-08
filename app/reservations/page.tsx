"use client";

import React, { useEffect, useState } from "react";
import {
  IconLoader2,
  IconBuilding,
  IconMapPin,
  IconCalendar,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/store/useAuth";
import { getVenues, createReservation, type Venue, type VenueType } from "@/lib/reservations-api";

const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  RESTAURANT: "Restaurant",
  NIGHTCLUB: "Nightclub",
  LOUNGE: "Lounge",
  PRIVATE_DINING: "Private Dining",
  ROOFTOP: "Rooftop",
};

const TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30",
];

export default function ReservationsPage() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Venue | null>(null);

  // Form state
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getVenues()
      .then(setVenues)
      .finally(() => setLoading(false));
  }, []);

  const openBooking = (venue: Venue) => {
    setSelected(venue);
    setDate("");
    setTime("");
    setPartySize("2");
    setNotes("");
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!selected || !date || !time || !partySize) return;
    if (!user) {
      toast.error("Please log in to make a reservation");
      return;
    }
    setSubmitting(true);
    try {
      await createReservation({
        venueId: selected.id,
        date,
        time,
        partySize: Number(partySize),
        notes: notes || undefined,
      });
      setSuccess(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to submit reservation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <IconLoader2 className="animate-spin text-muted-foreground" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            The Black Book
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight">
            Reserve Your Table
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Exclusive access to Lagos' finest restaurants, lounges, and dining
            experiences — curated for Ekovibe members.
          </p>
        </div>

        {venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <IconBuilding size={40} className="text-muted-foreground/30" />
            <p className="text-muted-foreground">
              No venues available yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="group border rounded-xl overflow-hidden bg-card hover:border-foreground/20 transition-colors cursor-pointer"
                onClick={() => openBooking(venue)}
              >
                {venue.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={venue.coverImage}
                    alt={venue.name}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video bg-muted flex items-center justify-center">
                    <IconBuilding size={32} className="text-muted-foreground/30" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm">{venue.name}</h3>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider shrink-0">
                      {VENUE_TYPE_LABELS[venue.type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconMapPin size={12} />
                    {venue.address}, {venue.city}
                  </div>
                  {venue.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {venue.description}
                    </p>
                  )}
                  <Button size="sm" className="w-full mt-2">
                    <IconCalendar size={14} className="mr-1" /> Request Booking
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="size-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <IconCalendar size={24} className="text-green-500" />
              </div>
              <h3 className="font-bold text-lg">Request Submitted</h3>
              <p className="text-sm text-muted-foreground">
                We've received your reservation request for{" "}
                <strong>{selected?.name}</strong>. Our team will confirm your
                booking within 24 hours.
              </p>
              <Button
                className="w-full mt-2"
                onClick={() => setSelected(null)}
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Time</label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Party Size</label>
                  <Select value={partySize} onValueChange={setPartySize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {n === 1 ? "guest" : "guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Special Requests{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </label>
                  <Textarea
                    placeholder="Dietary requirements, occasion, seating preferences…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                {!user && (
                  <p className="text-xs text-yellow-500 bg-yellow-500/10 rounded-lg px-3 py-2">
                    You must be logged in to make a reservation.
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelected(null)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!date || !time || !partySize || submitting || !user}
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <IconLoader2 size={14} className="animate-spin mr-1" />
                  ) : (
                    <IconCalendar size={14} className="mr-1" />
                  )}
                  Request Booking
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

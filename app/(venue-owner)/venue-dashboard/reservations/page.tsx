"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  IconCalendar,
  IconLoader2,
  IconCheck,
  IconX,
  IconUsers,
  IconClock,
  IconBuilding,
  IconArrowRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  getVenueOwnerReservations,
  venueOwnerConfirm,
  venueOwnerReject,
  venueOwnerMarkCompleted,
  venueOwnerMarkNoShow,
  getMyVenues,
  formatNaira,
  type Reservation,
  type ReservationStatus,
  type Venue,
} from "@/lib/reservations-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING_PAYMENT: "bg-orange-500/10 text-orange-500",
  PENDING_APPROVAL: "bg-yellow-500/10 text-yellow-500",
  CONFIRMED: "bg-green-500/10 text-green-500",
  REJECTED: "bg-red-500/10 text-red-400",
  MODIFIED: "bg-blue-500/10 text-blue-400",
  CANCELLED_BY_GUEST: "bg-muted text-muted-foreground",
  CANCELLED_BY_VENUE: "bg-muted text-muted-foreground",
  COMPLETED: "bg-muted text-muted-foreground",
  NO_SHOW: "bg-muted text-muted-foreground",
};

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING_PAYMENT: "Awaiting Payment",
  PENDING_APPROVAL: "Pending Approval",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  MODIFIED: "Modified",
  CANCELLED_BY_GUEST: "Cancelled by Guest",
  CANCELLED_BY_VENUE: "Cancelled by Venue",
  COMPLETED: "Completed",
  NO_SHOW: "No Show",
};

const FILTER_TABS: {
  label: string;
  value: ReservationStatus | "ALL" | "UPCOMING";
}[] = [
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Upcoming", value: "UPCOMING" },
  { label: "All", value: "ALL" },
  { label: "Completed", value: "COMPLETED" },
];

type ActionType = "confirm" | "reject" | "complete" | "no-show";

export default function VenueOwnerReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ReservationStatus | "ALL" | "UPCOMING">(
    "PENDING_APPROVAL",
  );
  const [venueSlug, setVenueSlug] = useState<string>("ALL");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [action, setAction] = useState<ActionType | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const statusFilter: ReservationStatus | undefined =
      tab === "ALL" || tab === "UPCOMING" ? undefined : tab;
    getVenueOwnerReservations({
      status: statusFilter,
      venueSlug: venueSlug !== "ALL" ? venueSlug : undefined,
      limit: 50,
    })
      .then((res) => setReservations(res.data))
      .finally(() => setLoading(false));
  }, [tab, venueSlug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getMyVenues()
      .then(setVenues)
      .catch(() => {});
  }, []);

  const filtered = reservations.filter((r) => {
    if (tab === "UPCOMING") {
      return (
        [
          "CONFIRMED",
          "PENDING_APPROVAL",
          "PENDING_PAYMENT",
          "MODIFIED",
        ].includes(r.status) && new Date(r.date) >= new Date()
      );
    }
    return true;
  });

  const openAction = (res: Reservation, act: ActionType) => {
    setSelected(res);
    setAction(act);
    setNote("");
  };

  const handleSubmit = async () => {
    if (!selected || !action) return;
    setSubmitting(true);
    try {
      if (action === "confirm") {
        await venueOwnerConfirm(selected.id, note || undefined);
        toast.success("Reservation confirmed.");
      } else if (action === "reject") {
        await venueOwnerReject(selected.id, note || undefined);
        toast.success("Reservation rejected.");
      } else if (action === "complete") {
        await venueOwnerMarkCompleted(selected.id);
        toast.success("Marked as completed.");
      } else if (action === "no-show") {
        await venueOwnerMarkNoShow(selected.id);
        toast.success("Marked as no-show.");
      }
      setSelected(null);
      setAction(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const canConfirm = (r: Reservation) =>
    r.status === "PENDING_APPROVAL" || r.status === "MODIFIED";
  const canReject = (r: Reservation) =>
    r.status === "PENDING_APPROVAL" || r.status === "MODIFIED";
  const canComplete = (r: Reservation) => r.status === "CONFIRMED";
  const canMarkNoShow = (r: Reservation) => r.status === "CONFIRMED";

  return (
    <main className="space-y-6">
      <PageHeader
        back
        title="Reservations"
        description="Manage bookings across your venues."
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map((t) => (
            <Button
              key={t.value}
              size="sm"
              variant={tab === t.value ? "default" : "outline"}
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        {venues.length > 1 && (
          <Select value={venueSlug} onValueChange={setVenueSlug}>
            <SelectTrigger className="w-48 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All venues</SelectItem>
              {venues.map((v) => (
                <SelectItem key={v.slug} value={v.slug}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3 border rounded-xl">
          <IconCalendar size={36} className="text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">
            No reservations found.
          </p>
        </div>
      ) : (
        <div className="border rounded-xl divide-y overflow-hidden">
          {filtered.map((res) => (
            <div key={res.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">
                      {res.user
                        ? `${res.user.firstName} ${res.user.lastName}`
                        : res.reference}
                    </p>
                    <Badge
                      className={`text-[10px] uppercase tracking-wider ${STATUS_STYLES[res.status]}`}
                    >
                      {STATUS_LABELS[res.status]}
                    </Badge>
                  </div>
                  {res.user?.email && (
                    <p className="text-xs text-muted-foreground">
                      {res.user.email}
                    </p>
                  )}
                </div>
                <p className="text-xs font-mono text-muted-foreground shrink-0">
                  {res.reference}
                </p>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {res.venue && (
                  <span className="flex items-center gap-1">
                    <IconBuilding size={11} /> {res.venue.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <IconCalendar size={11} />
                  {new Date(res.date).toLocaleDateString("en-NG", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <IconClock size={11} /> {res.timeSlot}
                  {res.session && ` · ${res.session.name}`}
                </span>
                <span className="flex items-center gap-1">
                  <IconUsers size={11} /> {res.partySize} guests
                </span>
                {res.depositAmount > 0 && (
                  <span>Deposit: {formatNaira(res.depositAmount)}</span>
                )}
              </div>

              {res.notes && (
                <p className="text-xs text-muted-foreground border-l-2 pl-2">
                  <span className="font-medium">Guest note:</span> {res.notes}
                </p>
              )}
              {res.venueNote && (
                <p className="text-xs text-muted-foreground border-l-2 border-green-500/40 pl-2">
                  <span className="font-medium text-green-500">Your note:</span>{" "}
                  {res.venueNote}
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button asChild size="sm" variant="ghost" className="text-muted-foreground">
                  <Link href={`/venue-dashboard/reservations/${res.id}`}>
                    Details <IconArrowRight size={12} className="ml-1" />
                  </Link>
                </Button>
                {canConfirm(res) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                    onClick={() => openAction(res, "confirm")}
                  >
                    <IconCheck size={13} className="mr-1" /> Confirm
                  </Button>
                )}
                {canReject(res) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => openAction(res, "reject")}
                  >
                    <IconX size={13} className="mr-1" /> Reject
                  </Button>
                )}
                {canComplete(res) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAction(res, "complete")}
                  >
                    Mark Completed
                  </Button>
                )}
                {canMarkNoShow(res) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => openAction(res, "no-show")}
                  >
                    No Show
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action dialog */}
      <Dialog
        open={!!selected && !!action}
        onOpenChange={(o) => {
          if (!o) {
            setSelected(null);
            setAction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === "confirm" && "Confirm Reservation"}
              {action === "reject" && "Reject Reservation"}
              {action === "complete" && "Mark as Completed"}
              {action === "no-show" && "Mark as No-Show"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                <p className="font-medium">
                  {selected.user
                    ? `${selected.user.firstName} ${selected.user.lastName}`
                    : selected.reference}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selected.date).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  at {selected.timeSlot} · {selected.partySize} guests
                </p>
                {selected.depositAmount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Deposit paid: {formatNaira(selected.depositAmount)}
                  </p>
                )}
              </div>
              {(action === "confirm" || action === "reject") && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Note to guest{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </label>
                  <Textarea
                    placeholder={
                      action === "confirm"
                        ? "e.g. Your table is confirmed. Please arrive 10 mins early."
                        : "e.g. Apologies, we are fully booked on this date."
                    }
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
              {action === "reject" && selected.depositAmount > 0 && (
                <p className="text-xs text-muted-foreground">
                  The guest&apos;s deposit of{" "}
                  {formatNaira(selected.depositAmount)} will be fully refunded.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelected(null);
                setAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              variant={
                action === "reject" || action === "no-show"
                  ? "destructive"
                  : "default"
              }
            >
              {submitting && (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              )}
              {action === "confirm" && "Confirm Booking"}
              {action === "reject" && "Reject Booking"}
              {action === "complete" && "Mark Completed"}
              {action === "no-show" && "Mark No-Show"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

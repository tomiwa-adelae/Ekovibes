"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  IconCalendar,
  IconLoader2,
  IconBuilding,
  IconUsers,
  IconClock,
  IconMapPin,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getMyReservations,
  cancelReservation,
  getMyWaitlistEntries,
  leaveWaitlist,
  formatNaira,
  VENUE_CATEGORY_LABELS,
  type Reservation,
  type ReservationStatus,
  type ReservationWaitlist,
} from "@/lib/reservations-api";

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
  CANCELLED_BY_GUEST: "Cancelled",
  CANCELLED_BY_VENUE: "Cancelled by Venue",
  COMPLETED: "Completed",
  NO_SHOW: "No Show",
};

const TABS: { label: string; value: ReservationStatus | "ALL" | "UPCOMING" }[] =
  [
    { label: "Upcoming", value: "UPCOMING" },
    { label: "All", value: "ALL" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED_BY_GUEST" },
  ];

export default function MyTablesPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitlist, setWaitlist] = useState<ReservationWaitlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | "UPCOMING" | ReservationStatus>(
    "UPCOMING",
  );
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getMyReservations(), getMyWaitlistEntries().catch(() => [])])
      .then(([res, wl]) => {
        setReservations(res);
        setWaitlist(wl);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = reservations.filter((r) => {
    if (tab === "ALL") return true;
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
    return r.status === tab;
  });

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await cancelReservation(cancelTarget.id);
      toast.success(
        res.refundAmount > 0
          ? `Reservation cancelled. Refund of ${formatNaira(res.refundAmount)} will be processed.`
          : "Reservation cancelled.",
      );
      setCancelTarget(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to cancel reservation");
    } finally {
      setCancelling(false);
    }
  };

  const handleLeaveWaitlist = async (id: string) => {
    try {
      await leaveWaitlist(id);
      toast.success("Removed from waitlist");
      load();
    } catch {
      toast.error("Failed to leave waitlist");
    }
  };

  const canCancel = (r: Reservation) =>
    ["CONFIRMED", "PENDING_APPROVAL", "PENDING_PAYMENT", "MODIFIED"].includes(
      r.status,
    );

  return (
    <main>
      <PageHeader
        back
        title="My Tables"
        description="Your reservation history and upcoming bookings."
      />

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {TABS.map((t) => (
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

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border rounded-xl">
          <IconCalendar size={36} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No reservations found.
          </p>
          <Button asChild size="sm">
            <Link href="/reservations">Browse Venues</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((res) => (
            <div
              key={res.id}
              className="border rounded-xl p-4 space-y-3 relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/tables/${res.id}`}
                      className="font-bold text-sm hover:underline"
                    >
                      {res.venue?.name ?? "—"}
                    </Link>
                    <Badge
                      className={`text-[10px] uppercase tracking-wider ${STATUS_STYLES[res.status]}`}
                    >
                      {STATUS_LABELS[res.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {res.reference}
                  </p>
                </div>
                {res.venue?.category && (
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {VENUE_CATEGORY_LABELS[res.venue.category]}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <IconCalendar size={11} />
                  {new Date(res.date).toLocaleDateString("en-NG", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <IconClock size={11} /> {res.timeSlot}
                  {res.session && ` · ${res.session.name}`}
                </span>
                <span className="flex items-center gap-1">
                  <IconUsers size={11} /> {res.partySize} guests
                </span>
                {res.venue?.city && (
                  <span className="flex items-center gap-1">
                    <IconMapPin size={11} /> {res.venue.city}
                  </span>
                )}
              </div>

              {res.spaces && res.spaces.length > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <IconBuilding size={11} />
                  {res.spaces.map((s) => s.space.name).join(", ")}
                </p>
              )}

              {res.depositAmount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Deposit:{" "}
                  <span className="font-medium text-foreground">
                    {formatNaira(res.depositAmount)}
                  </span>
                  {res.payment?.status === "REFUNDED_FULL" && " · Refunded"}
                  {res.payment?.status === "REFUNDED_PARTIAL" &&
                    ` · Partial refund: ${formatNaira(res.payment.refundedAmount)}`}
                </p>
              )}

              {res.venueNote && (
                <p className="text-xs text-muted-foreground border-l-2 pl-2">
                  <span className="font-medium">Note from venue:</span>{" "}
                  {res.venueNote}
                </p>
              )}

              {canCancel(res) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                  onClick={() => setCancelTarget(res)}
                >
                  <IconX size={13} className="mr-1" /> Cancel Reservation
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Waitlist */}
      {waitlist.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Waitlist ({waitlist.length})
          </p>
          {waitlist.map((entry) => (
            <div
              key={entry.id}
              className="border border-dashed rounded-xl p-4 flex items-center justify-between gap-3"
            >
              <div className="text-sm space-y-0.5">
                <p className="font-medium">Waitlist slot</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  at {entry.timeSlot} · {entry.partySize} guests
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => handleLeaveWaitlist(entry.id)}
              >
                Leave
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Cancel dialog */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
          </DialogHeader>
          {cancelTarget && (
            <div className="space-y-3 py-2">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                <p className="font-medium">{cancelTarget.venue?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(cancelTarget.date).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  at {cancelTarget.timeSlot} · {cancelTarget.partySize} guests
                </p>
              </div>
              {cancelTarget.depositAmount > 0 && (
                <p className="text-xs text-muted-foreground">
                  A refund may apply based on the venue's cancellation policy.
                </p>
              )}
              <p className="text-xs text-red-400">
                This action cannot be undone.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling && (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              )}
              Cancel Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

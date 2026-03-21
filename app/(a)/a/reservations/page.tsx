"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  IconCalendar,
  IconLoader2,
  IconCheck,
  IconX,
  IconUsers,
  IconClock,
  IconBuilding,
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
  getAdminReservations,
  adminConfirmReservation,
  adminCancelReservation,
  formatNaira,
  type Reservation,
  type ReservationStatus,
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
  CANCELLED_BY_GUEST: "Cancelled by Guest",
  CANCELLED_BY_VENUE: "Cancelled by Venue",
  COMPLETED: "Completed",
  NO_SHOW: "No Show",
};

const FILTER_TABS: { label: string; value: ReservationStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Awaiting Payment", value: "PENDING_PAYMENT" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ReservationStatus | "ALL">("PENDING_APPROVAL");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [action, setAction] = useState<"confirm" | "cancel" | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getAdminReservations({
      status: tab === "ALL" ? undefined : tab,
      limit: 50,
    })
      .then((res) => setReservations(res.data))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const openAction = (res: Reservation, act: "confirm" | "cancel") => {
    setSelected(res);
    setAction(act);
    setNote("");
  };

  const handleSubmit = async () => {
    if (!selected || !action) return;
    setSubmitting(true);
    try {
      if (action === "confirm") {
        await adminConfirmReservation(selected.id, note || undefined);
        toast.success("Reservation confirmed.");
      } else {
        await adminCancelReservation(selected.id, note || undefined);
        toast.success("Reservation cancelled and refund issued.");
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

  return (
    <div className="space-y-6">
      <PageHeader
        back
        title="Bookings"
        description="Oversight of all reservations across The Black Book."
      />

      {/* Filter tabs */}
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

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3 border rounded-xl">
          <IconCalendar size={36} className="text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">
            No reservations found.
          </p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden divide-y">
          {reservations.map((res) => (
            <div key={res.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">
                      {res.user
                        ? `${res.user.firstName} ${res.user.lastName}`
                        : "Unknown"}
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
                {res.depositAmount > 0 && (
                  <span>Deposit: {formatNaira(res.depositAmount)}</span>
                )}
              </div>

              {res.notes && (
                <p className="text-xs text-muted-foreground italic">
                  "{res.notes}"
                </p>
              )}
              {res.adminNote && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">
                    Admin note:
                  </span>{" "}
                  {res.adminNote}
                </p>
              )}
              {res.venueNote && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">
                    Venue note:
                  </span>{" "}
                  {res.venueNote}
                </p>
              )}

              {/* Admin override actions */}
              <div className="flex gap-2 pt-1">
                {(res.status === "PENDING_APPROVAL" ||
                  res.status === "PENDING_PAYMENT") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                    onClick={() => openAction(res, "confirm")}
                  >
                    <IconCheck size={13} className="mr-1" /> Override Confirm
                  </Button>
                )}
                {![
                  "CANCELLED_BY_GUEST",
                  "CANCELLED_BY_VENUE",
                  "COMPLETED",
                  "NO_SHOW",
                  "REJECTED",
                ].includes(res.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => openAction(res, "cancel")}
                  >
                    <IconX size={13} className="mr-1" /> Override Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
              {action === "confirm"
                ? "Override Confirm Reservation"
                : "Override Cancel Reservation"}
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
                  {selected.venue?.name} ·{" "}
                  {new Date(selected.date).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  at {selected.timeSlot} · {selected.partySize} guests
                </p>
                {selected.depositAmount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Deposit: {formatNaira(selected.depositAmount)}
                  </p>
                )}
              </div>
              {action === "cancel" && selected.depositAmount > 0 && (
                <p className="text-xs text-amber-500 border border-amber-500/20 rounded px-2 py-1.5 bg-amber-500/5">
                  A full refund of {formatNaira(selected.depositAmount)} will be
                  issued to the guest.
                </p>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Admin note{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Textarea
                  placeholder={
                    action === "confirm"
                      ? "Reason for override confirmation…"
                      : "Reason for cancellation…"
                  }
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
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
              variant={action === "cancel" ? "destructive" : "default"}
            >
              {submitting && (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              )}
              {action === "confirm" ? "Confirm Reservation" : "Cancel & Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

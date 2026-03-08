"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  IconCalendar,
  IconLoader2,
  IconCheck,
  IconX,
  IconMapPin,
  IconUsers,
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  getAdminReservations,
  confirmReservation,
  rejectReservation,
  type Reservation,
  type ReservationStatus,
} from "@/lib/reservations-api";

const STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500",
  CONFIRMED: "bg-green-500/10 text-green-500",
  REJECTED: "bg-red-500/10 text-red-400",
  CANCELLED: "bg-muted text-muted-foreground",
  COMPLETED: "bg-muted text-muted-foreground",
};

const TABS: { label: string; value: ReservationStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ReservationStatus | "ALL">("PENDING");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [action, setAction] = useState<"confirm" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getAdminReservations(tab === "ALL" ? {} : { status: tab })
      .then((res) => setReservations(res.data))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const openAction = (reservation: Reservation, act: "confirm" | "reject") => {
    setSelected(reservation);
    setAction(act);
    setNote("");
  };

  const handleSubmit = async () => {
    if (!selected || !action) return;
    setSubmitting(true);
    try {
      if (action === "confirm") {
        await confirmReservation(selected.id, note || undefined);
        toast.success("Reservation confirmed");
      } else {
        await rejectReservation(selected.id, note || undefined);
        toast.success("Reservation rejected");
      }
      setSelected(null);
      setAction(null);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update reservation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        back
        title="Bookings"
        description="Review and manage reservation requests from The Black Book."
      />

      {/* Filter tabs */}
      <div className="flex gap-2">
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
      ) : reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3 border rounded-xl">
          <IconCalendar size={36} className="text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">
            No reservations found.
          </p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <div className="divide-y">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">
                      {res.user
                        ? `${res.user.firstName} ${res.user.lastName}`
                        : "Unknown User"}
                    </p>
                    <Badge
                      className={`text-[10px] uppercase tracking-widest ${STATUS_STYLES[res.status]}`}
                    >
                      {res.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <IconMapPin size={11} />
                      {res.venue?.name ?? "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconCalendar size={11} />
                      {res.date} at {res.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconUsers size={11} />
                      {res.partySize} {res.partySize === 1 ? "guest" : "guests"}
                    </span>
                  </div>
                  {res.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      "{res.notes}"
                    </p>
                  )}
                  {res.adminNote && (
                    <p className="text-xs text-muted-foreground">
                      <span className="text-foreground font-medium">Note:</span>{" "}
                      {res.adminNote}
                    </p>
                  )}
                  {res.user?.email && (
                    <p className="text-xs text-muted-foreground">
                      {res.user.email}
                    </p>
                  )}
                </div>
                {res.status === "PENDING" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                      onClick={() => openAction(res, "confirm")}
                    >
                      <IconCheck size={14} className="mr-1" /> Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                      onClick={() => openAction(res, "reject")}
                    >
                      <IconX size={14} className="mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog
        open={!!selected && !!action}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setAction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === "confirm"
                ? "Confirm Reservation"
                : "Reject Reservation"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1 text-sm">
                <p className="font-medium">
                  {selected.user
                    ? `${selected.user.firstName} ${selected.user.lastName}`
                    : "Unknown"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {selected.venue?.name} · {selected.date} at {selected.time} ·{" "}
                  {selected.partySize}{" "}
                  {selected.partySize === 1 ? "guest" : "guests"}
                </p>
                {selected.notes && (
                  <p className="text-muted-foreground text-xs italic">
                    "{selected.notes}"
                  </p>
                )}
              </div>
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
                      ? "e.g. Your table has been reserved. Please arrive 10 minutes early."
                      : "e.g. Unfortunately we are fully booked on that date."
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
              variant={action === "reject" ? "destructive" : "default"}
            >
              {submitting && (
                <IconLoader2 size={14} className="animate-spin mr-1" />
              )}
              {action === "confirm" ? "Confirm Booking" : "Reject Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

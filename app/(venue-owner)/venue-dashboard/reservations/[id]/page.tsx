"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  IconLoader2,
  IconCalendar,
  IconClock,
  IconUsers,
  IconBuilding,
  IconMapPin,
  IconPhone,
  IconMail,
  IconReceipt,
  IconCheck,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  getVenueOwnerReservationById,
  venueOwnerConfirm,
  venueOwnerReject,
  venueOwnerMarkCompleted,
  venueOwnerMarkNoShow,
  formatNaira,
  SPACE_TYPE_LABELS,
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
  MODIFIED: "Modified (Pending Review)",
  CANCELLED_BY_GUEST: "Cancelled by Guest",
  CANCELLED_BY_VENUE: "Cancelled by Venue",
  COMPLETED: "Completed",
  NO_SHOW: "No Show",
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

type ActionType = "confirm" | "reject" | "complete" | "no-show";

export default function VenueOwnerReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<ActionType | null>(null);
  const [venueNote, setVenueNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getVenueOwnerReservationById(id)
      .then(setReservation)
      .catch(() => toast.error("Failed to load reservation"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const openAction = (type: ActionType) => {
    setVenueNote("");
    setAction(type);
  };

  const handleAction = async () => {
    if (!reservation || !action) return;
    setSubmitting(true);
    try {
      if (action === "confirm") {
        await venueOwnerConfirm(reservation.id, venueNote || undefined);
        toast.success("Reservation confirmed. Guest has been notified.");
      } else if (action === "reject") {
        await venueOwnerReject(reservation.id, venueNote || undefined);
        toast.success("Reservation rejected.");
      } else if (action === "complete") {
        await venueOwnerMarkCompleted(reservation.id);
        toast.success("Marked as completed.");
      } else if (action === "no-show") {
        await venueOwnerMarkNoShow(reservation.id);
        toast.success("Marked as no-show.");
      }
      setAction(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <IconLoader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <IconAlertCircle size={36} className="text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Reservation not found.</p>
      </div>
    );
  }

  const r = reservation;
  const canConfirm = r.status === "PENDING_APPROVAL" || r.status === "MODIFIED";
  const canReject = r.status === "PENDING_APPROVAL" || r.status === "MODIFIED";
  const canComplete = r.status === "CONFIRMED";
  const canMarkNoShow = r.status === "CONFIRMED";

  return (
    <main className="space-y-5 pb-10">
      <PageHeader
        back
        title={
          <>
            <p>
              {r.user ? `${r.user.firstName} ${r.user.lastName}` : r.reference}{" "}
              <Badge className={`uppercase ${STATUS_STYLES[r.status]}`}>
                {STATUS_LABELS[r.status]}
              </Badge>
            </p>
          </>
        }
        description={
          <p className="text-xs text-muted-foreground font-mono">{r.reference}</p>
        }
      />

      {/* Guest Info */}
      {r.user && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Guest</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              icon={IconUsers}
              label="Name"
              value={`${r.user.firstName} ${r.user.lastName}`}
            />
            <InfoRow icon={IconMail} label="Email" value={r.user.email} />
            {r.user.phoneNumber && (
              <InfoRow icon={IconPhone} label="Phone" value={r.user.phoneNumber} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Details */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow
            icon={IconCalendar}
            label="Date"
            value={new Date(r.date).toLocaleDateString("en-NG", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
          <InfoRow
            icon={IconClock}
            label="Time"
            value={r.session ? `${r.timeSlot} · ${r.session.name}` : r.timeSlot}
          />
          <InfoRow
            icon={IconUsers}
            label="Party Size"
            value={`${r.partySize} ${r.partySize === 1 ? "guest" : "guests"}`}
          />
          {r.venue && (
            <InfoRow icon={IconBuilding} label="Venue" value={r.venue.name} />
          )}
          {r.spaces && r.spaces.length > 0 && (
            <InfoRow
              icon={IconBuilding}
              label="Spaces"
              value={r.spaces
                .map((s) => `${s.space.name} (${SPACE_TYPE_LABELS[s.space.type]})`)
                .join(", ")}
            />
          )}
          {r.venue?.address && (
            <InfoRow
              icon={IconMapPin}
              label="Address"
              value={[r.venue.address, r.venue.city].filter(Boolean).join(", ")}
            />
          )}
        </CardContent>
      </Card>

      {/* Payment */}
      {r.depositAmount > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Deposit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconReceipt size={14} className="text-muted-foreground" />
                <span className="text-sm">Deposit charged</span>
              </div>
              <span className="font-bold text-sm">{formatNaira(r.depositAmount)}</span>
            </div>
            {r.payment && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Payment status</span>
                  <span
                    className={
                      r.payment.status === "PAID"
                        ? "text-green-500 font-medium"
                        : r.payment.status === "PENDING"
                          ? "text-orange-500 font-medium"
                          : "text-muted-foreground"
                    }
                  >
                    {r.payment.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Your payout</span>
                  <span className="font-medium text-green-500">
                    {formatNaira(r.venuePayout)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {(r.specialRequests || r.notes || r.venueNote) && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {r.specialRequests && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Special Requests from Guest</p>
                <p className="text-sm">{r.specialRequests}</p>
              </div>
            )}
            {r.notes && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Guest Notes</p>
                <p className="text-sm">{r.notes}</p>
              </div>
            )}
            {r.venueNote && (
              <div className="space-y-1 border-l-2 border-green-500/40 pl-3">
                <p className="text-xs text-green-500 font-medium">Your Note to Guest</p>
                <p className="text-sm">{r.venueNote}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {(canConfirm || canReject || canComplete || canMarkNoShow) && (
        <div className="flex gap-2 flex-wrap pt-2">
          {canConfirm && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => openAction("confirm")}
            >
              <IconCheck size={13} className="mr-1" /> Confirm
            </Button>
          )}
          {canReject && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => openAction("reject")}
            >
              <IconX size={13} className="mr-1" /> Reject
            </Button>
          )}
          {canComplete && (
            <Button size="sm" variant="outline" onClick={() => openAction("complete")}>
              Mark Completed
            </Button>
          )}
          {canMarkNoShow && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => openAction("no-show")}
            >
              No Show
            </Button>
          )}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!action} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === "confirm" && "Confirm Reservation"}
              {action === "reject" && "Reject Reservation"}
              {action === "complete" && "Mark as Completed"}
              {action === "no-show" && "Mark as No-Show"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
              <p className="font-medium">
                {r.user ? `${r.user.firstName} ${r.user.lastName}` : r.reference}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(r.date).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                at {r.timeSlot} · {r.partySize} guests
              </p>
            </div>
            {(action === "confirm" || action === "reject") && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Note to guest{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Textarea
                  rows={3}
                  placeholder={
                    action === "reject"
                      ? "Reason for rejection (visible to guest)…"
                      : "Any message for the guest (e.g. directions, arrival instructions)…"
                  }
                  value={venueNote}
                  onChange={(e) => setVenueNote(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button
              variant={action === "reject" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={submitting}
            >
              {submitting && (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              )}
              {action === "confirm" && "Confirm"}
              {action === "reject" && "Reject"}
              {action === "complete" && "Mark Completed"}
              {action === "no-show" && "Mark No-Show"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

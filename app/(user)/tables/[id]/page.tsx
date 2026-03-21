"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCalendar,
  IconLoader2,
  IconBuilding,
  IconUsers,
  IconClock,
  IconMapPin,
  IconPhone,
  IconReceipt,
  IconX,
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle,
  IconPencil,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getMyReservationById,
  cancelReservation,
  modifyReservation,
  formatNaira,
  VENUE_CATEGORY_LABELS,
  SPACE_TYPE_LABELS,
  type Reservation,
  type ReservationStatus,
} from "@/lib/reservations-api";
import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Payment Pending",
  PAID: "Paid",
  REFUNDED_FULL: "Fully Refunded",
  REFUNDED_PARTIAL: "Partially Refunded",
  FAILED: "Payment Failed",
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

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [modifyOpen, setModifyOpen] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [modifyForm, setModifyForm] = useState({
    date: "",
    timeSlot: "",
    partySize: "",
    notes: "",
    specialRequests: "",
  });

  const load = useCallback(() => {
    setLoading(true);
    getMyReservationById(id)
      .then(setReservation)
      .catch(() => toast.error("Failed to load reservation"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const canCancel = (r: Reservation) =>
    ["CONFIRMED", "PENDING_APPROVAL", "PENDING_PAYMENT", "MODIFIED"].includes(
      r.status,
    );

  const canModify = (r: Reservation) =>
    ["CONFIRMED", "PENDING_APPROVAL", "MODIFIED"].includes(r.status);

  const openModify = (r: Reservation) => {
    setModifyForm({
      date: r.date.slice(0, 10),
      timeSlot: r.timeSlot,
      partySize: String(r.partySize),
      notes: r.notes ?? "",
      specialRequests: r.specialRequests ?? "",
    });
    setModifyOpen(true);
  };

  const handleModify = async () => {
    if (!reservation) return;
    setModifying(true);
    try {
      await modifyReservation(reservation.id, {
        date: modifyForm.date || undefined,
        timeSlot: modifyForm.timeSlot || undefined,
        partySize: modifyForm.partySize
          ? Number(modifyForm.partySize)
          : undefined,
        notes: modifyForm.notes || undefined,
        specialRequests: modifyForm.specialRequests || undefined,
      });
      toast.success("Modification request submitted.");
      setModifyOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to modify reservation");
    } finally {
      setModifying(false);
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;
    setCancelling(true);
    try {
      const res = await cancelReservation(reservation.id);
      toast.success(
        res.refundAmount > 0
          ? `Reservation cancelled. Refund of ${formatNaira(res.refundAmount)} will be processed.`
          : "Reservation cancelled.",
      );
      setCancelOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to cancel reservation");
    } finally {
      setCancelling(false);
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
        <Button asChild size="sm" variant="outline">
          <Link href="/tables">
            <IconArrowLeft size={13} className="mr-1" /> Back to My Tables
          </Link>
        </Button>
      </div>
    );
  }

  const r = reservation;
  const isPaid =
    r.payment?.status === "PAID" ||
    r.payment?.status === "REFUNDED_FULL" ||
    r.payment?.status === "REFUNDED_PARTIAL";

  return (
    <main className="space-y-5 pb-10">
      <PageHeader
        back
        title={
          <>
            <p>
              {r.venue?.name ?? "—"}{" "}
              <Badge className={`uppercase ${STATUS_STYLES[r.status]}`}>
                {STATUS_LABELS[r.status]}
              </Badge>
            </p>
          </>
        }
        description={
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs text-muted-foreground">{r.reference}</p>{" "}
            {r.venue?.category && (
              <Badge variant="outline">
                {VENUE_CATEGORY_LABELS[r.venue.category]}
              </Badge>
            )}
          </div>
        }
      />

      {/* Venue cover */}
      {r.venue?.coverImage && (
        <div className="rounded-xl overflow-hidden border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={r.venue.coverImage}
            alt={r.venue.name}
            className="w-full aspect-video object-cover"
          />
        </div>
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
          {r.spaces && r.spaces.length > 0 && (
            <InfoRow
              icon={IconBuilding}
              label="Spaces"
              value={r.spaces
                .map(
                  (s) => `${s.space.name} (${SPACE_TYPE_LABELS[s.space.type]})`,
                )
                .join(", ")}
            />
          )}
        </CardContent>
      </Card>

      {/* Venue Info */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Venue</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {r.venue?.address && (
            <InfoRow
              icon={IconMapPin}
              label="Address"
              value={[r.venue.address, r.venue.city].filter(Boolean).join(", ")}
            />
          )}
          {r.venue?.phone && (
            <InfoRow icon={IconPhone} label="Phone" value={r.venue.phone} />
          )}
        </CardContent>
      </Card>

      {/* Payment / Deposit */}
      {r.depositAmount > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Deposit Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconReceipt size={14} className="text-muted-foreground" />
                <span className="text-sm">Amount paid</span>
              </div>
              <span className="font-bold text-sm">
                {formatNaira(r.depositAmount)}
              </span>
            </div>

            {r.payment && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Payment status</span>
                  <span
                    className={
                      isPaid
                        ? "text-green-500 font-medium"
                        : "text-orange-500 font-medium"
                    }
                  >
                    {PAYMENT_STATUS_LABELS[r.payment.status] ??
                      r.payment.status}
                  </span>
                </div>

                {r.payment.status === "REFUNDED_FULL" && (
                  <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 rounded-lg px-3 py-2">
                    <IconCircleCheck size={13} />
                    Full refund of {formatNaira(r.payment.amount)} processed
                    {r.payment.refundedAt &&
                      ` on ${new Date(r.payment.refundedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`}
                  </div>
                )}

                {r.payment.status === "REFUNDED_PARTIAL" && (
                  <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 rounded-lg px-3 py-2">
                    <IconInfoCircle size={13} />
                    Partial refund of {formatNaira(
                      r.payment.refundedAmount,
                    )}{" "}
                    processed
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guest Notes */}
      {(r.specialRequests || r.notes) && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Your Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {r.specialRequests && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Special Requests
                </p>
                <p className="text-sm">{r.specialRequests}</p>
              </div>
            )}
            {r.notes && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Additional Notes
                </p>
                <p className="text-sm">{r.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Note from Venue */}
      {r.venueNote && (
        <div className="border-l-2 border-muted-foreground/30 pl-3 py-1 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Note from venue
          </p>
          <p className="text-sm">{r.venueNote}</p>
        </div>
      )}

      {/* Actions */}
      {(canModify(r) || canCancel(r)) && (
        <div className="flex gap-2 pt-2 flex-wrap">
          {canModify(r) && (
            <Button size="sm" variant="outline" onClick={() => openModify(r)}>
              <IconPencil size={13} className="mr-1" /> Modify Booking
            </Button>
          )}
          {canCancel(r) && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              onClick={() => setCancelOpen(true)}
            >
              <IconX size={13} className="mr-1" /> Cancel Reservation
            </Button>
          )}
        </div>
      )}

      {/* Modify Dialog */}
      <Dialog
        open={modifyOpen}
        onOpenChange={(o) => !o && setModifyOpen(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modify Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto">
            <p className="text-xs text-muted-foreground">
              Your request will be reviewed by the venue. Changes take effect
              once confirmed.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={modifyForm.date}
                  onChange={(e) =>
                    setModifyForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Time Slot</label>
                <Input
                  placeholder="e.g. 19:00"
                  value={modifyForm.timeSlot}
                  onChange={(e) =>
                    setModifyForm((p) => ({ ...p, timeSlot: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Party Size</label>
              <Input
                type="number"
                min={1}
                value={modifyForm.partySize}
                onChange={(e) =>
                  setModifyForm((p) => ({ ...p, partySize: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Special Requests</label>
              <Textarea
                rows={2}
                placeholder="Any special requests…"
                value={modifyForm.specialRequests}
                onChange={(e) =>
                  setModifyForm((p) => ({
                    ...p,
                    specialRequests: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                rows={2}
                placeholder="Additional notes…"
                value={modifyForm.notes}
                onChange={(e) =>
                  setModifyForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModifyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleModify} disabled={modifying}>
              {modifying && (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              )}
              Submit Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelOpen}
        onOpenChange={(o) => !o && setCancelOpen(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
              <p className="font-medium">{r.venue?.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(r.date).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                at {r.timeSlot} · {r.partySize} guests
              </p>
            </div>
            {r.depositAmount > 0 && (
              <p className="text-xs text-muted-foreground">
                A refund may apply based on the venue's cancellation policy.
              </p>
            )}
            <p className="text-xs text-red-400">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
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

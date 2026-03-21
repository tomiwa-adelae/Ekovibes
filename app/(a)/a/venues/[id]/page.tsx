"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  IconLoader2,
  IconBuilding,
  IconCheck,
  IconX,
  IconBan,
  IconPencil,
  IconMapPin,
  IconMail,
  IconPhone,
  IconWorld,
  IconBrandInstagram,
  IconUsers,
  IconCalendar,
  IconCurrencyNaira,
  IconClock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  getAdminVenueById,
  approveVenue,
  rejectVenue,
  suspendVenue,
  updatePlatformFee,
  formatNaira,
  VENUE_CATEGORY_LABELS,
  SPACE_TYPE_LABELS,
  DAYS_OF_WEEK,
  type AdminVenueDetail,
  type VenueStatus,
} from "@/lib/reservations-api";
import { formatDate, formatPhoneNumber } from "@/lib/utils";

const STATUS_BADGE: Record<VenueStatus, string> = {
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-blue-500/10 text-blue-400",
  REJECTED: "bg-red-500/10 text-red-400",
  LIVE: "bg-green-500/10 text-green-500",
  SUSPENDED: "bg-muted text-muted-foreground",
};

const STATUS_LABELS: Record<VenueStatus, string> = {
  PENDING_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  LIVE: "Live",
  SUSPENDED: "Suspended",
};

const RESERVATION_STATUS_BADGE: Record<string, string> = {
  PENDING_PAYMENT: "bg-muted text-muted-foreground",
  PENDING_CONFIRMATION: "bg-yellow-500/10 text-yellow-500",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  COMPLETED: "bg-green-500/10 text-green-500",
  CANCELLED: "bg-red-500/10 text-red-400",
  NO_SHOW: "bg-orange-500/10 text-orange-400",
  REJECTED: "bg-red-500/10 text-red-400",
};

const DAY_SHORT: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default function AdminVenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<AdminVenueDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [feeOpen, setFeeOpen] = useState(false);
  const [feeValue, setFeeValue] = useState("");
  const [savingFee, setSavingFee] = useState(false);

  const [actioning, setActioning] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getAdminVenueById(id)
      .then(setVenue)
      .catch(() => toast.error("Failed to load venue."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async () => {
    if (!venue) return;
    setActioning(true);
    try {
      await approveVenue(venue.id);
      toast.success("Venue approved and set live.");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed.");
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Reason required.");
      return;
    }
    setRejecting(true);
    try {
      await rejectVenue(id, rejectReason);
      toast.success("Venue rejected.");
      setRejectOpen(false);
      setRejectReason("");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed.");
    } finally {
      setRejecting(false);
    }
  };

  const handleSuspend = async () => {
    if (
      !confirm(
        "Suspend this venue? Guests will no longer be able to make reservations.",
      )
    )
      return;
    setActioning(true);
    try {
      await suspendVenue(id);
      toast.success("Venue suspended.");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed.");
    } finally {
      setActioning(false);
    }
  };

  const handleSaveFee = async () => {
    const pct = Number(feeValue);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Enter a % between 0–100.");
      return;
    }
    setSavingFee(true);
    try {
      await updatePlatformFee(id, pct);
      toast.success("Platform fee updated.");
      setFeeOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed.");
    } finally {
      setSavingFee(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <IconLoader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-muted-foreground text-sm">Venue not found.</p>
      </div>
    );
  }

  const { stats, recentReservations } = venue;

  return (
    <div className="space-y-6">
      <PageHeader
        back
        title={venue.name}
        description={`${venue.city}${venue.state ? `, ${venue.state}` : ""} · ${VENUE_CATEGORY_LABELS[venue.category]}`}
      />

      {/* Status + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge className={`${STATUS_BADGE[venue.status]} text-xs`}>
          {STATUS_LABELS[venue.status]}
        </Badge>
        <div className="flex flex-wrap gap-2 ml-auto">
          {(venue.status === "PENDING_REVIEW" ||
            venue.status === "REJECTED" ||
            venue.status === "SUSPENDED") && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleApprove}
              disabled={actioning}
            >
              <IconCheck size={13} className="mr-1 text-green-500" />
              {venue.status === "PENDING_REVIEW" ? "Approve" : "Re-approve"}
            </Button>
          )}
          {venue.status === "PENDING_REVIEW" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setRejectReason("");
                setRejectOpen(true);
              }}
              disabled={actioning}
            >
              <IconX size={13} className="mr-1 text-red-400" /> Reject
            </Button>
          )}
          {(venue.status === "LIVE" || venue.status === "APPROVED") && (
            <Button
              size="sm"
              variant="outline"
              className="text-muted-foreground"
              onClick={handleSuspend}
              disabled={actioning}
            >
              <IconBan /> Suspend
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFeeValue(String(venue.platformFeePercent));
              setFeeOpen(true);
            }}
          >
            <IconPencil /> Fee: {venue.platformFeePercent}%
          </Button>
        </div>
      </div>

      {venue.status === "REJECTED" && venue.rejectionReason && (
        <div className="text-xs text-red-400 border border-red-500/20 rounded-lg px-3 py-2 bg-red-500/5">
          Rejection reason: {venue.rejectionReason}
        </div>
      )}

      {/* Cover image */}
      {venue.coverImage && (
        <div className="rounded-xl overflow-hidden aspect-video w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={venue.coverImage}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard
          label="Total Reservations"
          value={String(stats.totalReservations)}
          sub={`${stats.byStatus["CONFIRMED"] ?? 0} confirmed · ${stats.byStatus["COMPLETED"] ?? 0} completed`}
        />
        <StatCard
          label="Deposits Collected"
          value={formatNaira(stats.totalDeposits)}
          sub="Total from all bookings"
        />
        <StatCard
          label="Platform Fee"
          value={formatNaira(stats.totalPlatformFee)}
          sub={`${venue.platformFeePercent}% per booking`}
        />
        <StatCard
          label="Venue Payout"
          value={formatNaira(stats.totalVenuePayout)}
          sub="Net to venue owner"
        />
      </div>

      {/* Status breakdown */}
      {stats.totalReservations > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div
              key={status}
              className={`text-xs px-2.5 py-1 rounded-full border ${RESERVATION_STATUS_BADGE[status] ?? "bg-muted text-muted-foreground"}`}
            >
              {status.replace(/_/g, " ")} · {count}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap w-full h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reservations">
            Reservations{" "}
            {stats.totalReservations > 0 && `(${stats.totalReservations})`}
          </TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="pt-4 space-y-6">
          {/* Owner */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Owner</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {venue.owner && (
                <>
                  <InfoRow
                    label="Business Name"
                    value={venue.owner.businessName}
                  />
                  {venue.owner.user && (
                    <>
                      <InfoRow
                        label="Contact"
                        value={`${venue.owner.user.firstName} ${venue.owner.user.lastName}`}
                      />
                      <InfoRow label="Email" value={venue.owner.user.email} />
                    </>
                  )}
                  {venue.owner.businessEmail && (
                    <InfoRow
                      label="Business Email"
                      value={venue.owner.businessEmail}
                    />
                  )}
                  {venue.owner.businessPhone && (
                    <InfoRow
                      label="Business Phone"
                      value={formatPhoneNumber(venue.owner.businessPhone)}
                    />
                  )}
                  <InfoRow
                    label="Verified"
                    value={venue.owner.isVerified ? "Yes" : "No"}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Venue info */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Venue Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow
                label="Category"
                value={VENUE_CATEGORY_LABELS[venue.category]}
              />
              <InfoRow
                label="Booking Mode"
                value={
                  venue.bookingMode === "INSTANT"
                    ? "Instant Book"
                    : "Request to Book"
                }
              />
              <InfoRow label="Address" value={venue.address} />
              <InfoRow label="City" value={venue.city} />
              {venue.state && <InfoRow label="State" value={venue.state} />}
              {venue.description && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm mt-0.5 leading-relaxed">
                    {venue.description}
                  </p>
                </div>
              )}
              <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
                {venue.phone && (
                  <a
                    href={`tel:${venue.phone}`}
                    className="flex items-center text-muted-foreground hover:text-foreground gap-1 text-xs"
                  >
                    <IconPhone size={12} /> {formatPhoneNumber(venue.phone)}
                  </a>
                )}
                {venue.email && (
                  <a
                    href={`mailto:${venue.email}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <IconMail size={12} /> {venue.email}
                  </a>
                )}
                {venue.instagram && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconBrandInstagram size={12} /> {venue.instagram}
                  </span>
                )}
                {venue.website && (
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <IconWorld size={12} /> {venue.website}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Policy */}
          {venue.policy && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Policy</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <InfoRow
                  label="Deposit Type"
                  value={
                    venue.policy.depositType === "NONE"
                      ? "No deposit"
                      : venue.policy.depositType === "FLAT"
                        ? `Flat — ${formatNaira(venue.policy.depositAmount ?? 0)}`
                        : `${venue.policy.depositPercent ?? 0}% of min spend`
                  }
                />
                {venue.policy.fullRefundHoursThreshold && (
                  <InfoRow
                    label="Full Refund Window"
                    value={`≥ ${venue.policy.fullRefundHoursThreshold}h before`}
                  />
                )}
                {venue.policy.partialRefundHoursThreshold && (
                  <InfoRow
                    label="Partial Refund"
                    value={`${venue.policy.partialRefundPercent ?? 0}% if ≥ ${venue.policy.partialRefundHoursThreshold}h before`}
                  />
                )}
                <InfoRow
                  label="Modifications Allowed"
                  value={`Up to ${venue.policy.modificationAllowedHoursBefore}h before`}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Reservations ── */}
        <TabsContent value="reservations" className="pt-4">
          {recentReservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border rounded-xl border-dashed gap-2">
              <IconCalendar size={32} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No reservations yet.
              </p>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden divide-y">
              {recentReservations.map((r) => (
                <div
                  key={r.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-medium">
                        {r.reference}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${RESERVATION_STATUS_BADGE[r.status] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {r.user.firstName} {r.user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.user.email}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <IconCalendar size={11} />
                        {new Date(r.date).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        @ {r.timeSlot}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconUsers size={11} /> {r.partySize} guests
                      </span>
                      {r.session && (
                        <span className="flex items-center gap-1">
                          <IconClock size={11} /> {r.session.name}
                        </span>
                      )}
                      {r.spaces.length > 0 && (
                        <span>
                          {r.spaces.map((s) => s.space.name).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                    {r.depositAmount > 0 && (
                      <p className="text-sm font-semibold">
                        {formatNaira(r.depositAmount)}
                      </p>
                    )}
                    {r.platformFee > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Fee: {formatNaira(r.platformFee)}
                      </p>
                    )}
                    {r.venuePayout > 0 && (
                      <p className="text-xs text-green-500">
                        Payout: {formatNaira(r.venuePayout)}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(r.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Configuration ── */}
        <TabsContent value="config" className="pt-4 space-y-6">
          {/* Spaces */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Spaces ({venue.spaces?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {!venue.spaces?.length ? (
                <p className="text-sm text-muted-foreground">
                  No spaces defined.
                </p>
              ) : (
                <div className="divide-y">
                  {venue.spaces.map((s) => (
                    <div key={s.id} className="py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium">{s.name}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {SPACE_TYPE_LABELS[s.type]}
                          </Badge>
                          {!s.isActive && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-muted-foreground"
                            >
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Capacity: {s.capacity}
                          {s.minSpend
                            ? ` · Min spend: ${formatNaira(s.minSpend)}`
                            : ""}
                          {s.description ? ` · ${s.description}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Operating Hours</CardTitle>
            </CardHeader>
            <CardContent>
              {!venue.operatingHours?.length ? (
                <p className="text-sm text-muted-foreground">Not set.</p>
              ) : (
                <div className="divide-y">
                  {DAYS_OF_WEEK.map((day) => {
                    const h = venue.operatingHours!.find(
                      (o) => o.dayOfWeek === day,
                    );
                    return (
                      <div
                        key={day}
                        className="flex items-center gap-4 py-2 text-sm"
                      >
                        <span className="w-10 text-muted-foreground">
                          {DAY_SHORT[day]}
                        </span>
                        {!h || h.isClosed ? (
                          <span className="text-muted-foreground">Closed</span>
                        ) : (
                          <span>
                            {h.openTime} – {h.closeTime}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Sessions ({venue.sessions?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {!venue.sessions?.length ? (
                <p className="text-sm text-muted-foreground">
                  No sessions defined.
                </p>
              ) : (
                <div className="divide-y">
                  {venue.sessions.map((s) => (
                    <div key={s.id} className="py-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{s.name}</p>
                        {!s.isActive && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground"
                          >
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {s.startTime} – {s.endTime} · {s.slotDurationMinutes}min
                        slots
                      </p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {DAYS_OF_WEEK.map((d) => (
                          <span
                            key={d}
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              s.daysOfWeek.includes(d)
                                ? "bg-primary text-background border-foreground"
                                : "border-border text-muted-foreground opacity-40"
                            }`}
                          >
                            {DAY_SHORT[d]}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Venue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{venue.name}</p>
              <p className="text-xs text-muted-foreground">
                {venue.city} · {VENUE_CATEGORY_LABELS[venue.category]}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Reason <span className="text-red-400">*</span>
              </label>
              <Textarea
                placeholder="e.g. Venue does not meet our quality standards…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting || !rejectReason.trim()}
            >
              {rejecting && (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              )}
              Reject Venue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Platform fee dialog */}
      <Dialog open={feeOpen} onOpenChange={setFeeOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Platform Fee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{venue.name}</p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Fee %</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={feeValue}
                  onChange={(e) => setFeeValue(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ekovibe takes this % from each deposit collected.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFee} disabled={savingFee}>
              {savingFee && (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              )}{" "}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

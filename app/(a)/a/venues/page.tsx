"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  IconBuilding,
  IconLoader2,
  IconMapPin,
  IconCheck,
  IconX,
  IconBan,
  IconPencil,
  IconExternalLink,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import {
  getAdminVenues,
  approveVenue,
  rejectVenue,
  suspendVenue,
  updatePlatformFee,
  VENUE_CATEGORY_LABELS,
  type Venue,
  type VenueStatus,
} from "@/lib/reservations-api";

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

const STATUS_FILTERS: { label: string; value: VenueStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING_REVIEW" },
  { label: "Live", value: "LIVE" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
];

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<VenueStatus | "ALL">(
    "PENDING_REVIEW",
  );

  const [rejectTarget, setRejectTarget] = useState<Venue | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [feeTarget, setFeeTarget] = useState<Venue | null>(null);
  const [feeValue, setFeeValue] = useState("");
  const [savingFee, setSavingFee] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getAdminVenues({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      limit: 50,
    })
      .then((res) => setVenues(res.data))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (venue: Venue) => {
    try {
      await approveVenue(venue.id);
      toast.success(`${venue.name} approved.`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to approve.");
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      toast.error("Reason required.");
      return;
    }
    setRejecting(true);
    try {
      await rejectVenue(rejectTarget.id, rejectReason);
      toast.success("Venue rejected.");
      setRejectTarget(null);
      setRejectReason("");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed.");
    } finally {
      setRejecting(false);
    }
  };

  const handleSuspend = async (venue: Venue) => {
    if (!confirm(`Suspend "${venue.name}"?`)) return;
    try {
      await suspendVenue(venue.id);
      toast.success("Venue suspended.");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed.");
    }
  };

  const handleSaveFee = async () => {
    if (!feeTarget || !feeValue) return;
    const pct = Number(feeValue);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Enter a valid % between 0–100.");
      return;
    }
    setSavingFee(true);
    try {
      await updatePlatformFee(feeTarget.id, pct);
      toast.success("Platform fee updated.");
      setFeeTarget(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed.");
    } finally {
      setSavingFee(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        back
        title="Venues"
        description="Review and manage The Black Book venue listings."
      />

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={statusFilter === f.value ? "default" : "outline"}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3 border rounded-xl">
          <IconBuilding size={36} className="text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">No venues found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="border rounded-xl overflow-hidden bg-card"
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
                  <IconBuilding
                    size={32}
                    className="text-muted-foreground/30"
                  />
                </div>
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{venue.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IconMapPin size={11} /> {venue.city}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge
                      className={`text-[10px] ${STATUS_BADGE[venue.status]}`}
                    >
                      {STATUS_LABELS[venue.status]}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {VENUE_CATEGORY_LABELS[venue.category]}
                    </Badge>
                  </div>
                </div>

                {venue.owner && (
                  <p className="text-xs text-muted-foreground">
                    Owner: {venue.owner.businessName}
                    {venue.owner.user && ` (${venue.owner.user.email})`}
                  </p>
                )}

                {venue.status === "REJECTED" && venue.rejectionReason && (
                  <p className="text-xs text-red-400 border border-red-500/20 rounded px-2 py-1 bg-red-500/5">
                    Reason: {venue.rejectionReason}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Platform fee:{" "}
                    <strong className="text-foreground">
                      {venue.platformFeePercent}%
                    </strong>
                  </span>
                  <button
                    onClick={() => {
                      setFeeTarget(venue);
                      setFeeValue(String(venue.platformFeePercent));
                    }}
                    className="text-foreground hover:underline flex items-center gap-0.5"
                  >
                    <IconPencil size={11} /> Edit
                  </button>
                </div>

                {/* View link */}
                <Link
                  href={`/a/venues/${venue.id}`}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IconExternalLink size={12} /> View details
                </Link>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap pt-1">
                  {venue.status === "PENDING_REVIEW" && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1"
                        variant="outline"
                        onClick={() => handleApprove(venue)}
                      >
                        <IconCheck size={13} className="mr-1 text-green-500" />{" "}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        variant="outline"
                        onClick={() => {
                          setRejectTarget(venue);
                          setRejectReason("");
                        }}
                      >
                        <IconX size={13} className="mr-1 text-red-400" /> Reject
                      </Button>
                    </>
                  )}
                  {venue.status === "APPROVED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(venue)}
                    >
                      Set Live
                    </Button>
                  )}
                  {(venue.status === "LIVE" || venue.status === "APPROVED") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-muted-foreground"
                      onClick={() => handleSuspend(venue)}
                    >
                      <IconBan size={13} className="mr-1" /> Suspend
                    </Button>
                  )}
                  {(venue.status === "SUSPENDED" ||
                    venue.status === "REJECTED") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(venue)}
                    >
                      <IconCheck size={13} className="mr-1" /> Re-approve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => !o && setRejectTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Venue</DialogTitle>
          </DialogHeader>
          {rejectTarget && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium">{rejectTarget.name}</p>
                <p className="text-xs text-muted-foreground">
                  {rejectTarget.city} ·{" "}
                  {VENUE_CATEGORY_LABELS[rejectTarget.category]}
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
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
      <Dialog open={!!feeTarget} onOpenChange={(o) => !o && setFeeTarget(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Platform Fee</DialogTitle>
          </DialogHeader>
          {feeTarget && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">{feeTarget.name}</p>
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
                  Ekovibe takes this % from each deposit.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeeTarget(null)}>
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

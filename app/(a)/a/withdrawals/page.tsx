"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  IconLoader2,
  IconBuildingBank,
  IconCheck,
  IconX,
  IconRefresh,
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
import { formatNaira } from "@/lib/events-api";
import { formatDate } from "@/lib/utils";
import {
  getAdminWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  type WithdrawalRequest,
  type WithdrawalStatus,
} from "@/lib/wallet-api";
import {
  getAdminVenueOwnerWithdrawals,
  approveVenueOwnerWithdrawal,
  rejectVenueOwnerWithdrawal,
  type AdminVenueOwnerWithdrawal,
} from "@/lib/reservations-api";

const STATUS_STYLES: Record<WithdrawalStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-blue-500/10 text-blue-500",
  REJECTED: "bg-red-500/10 text-red-500",
  TRANSFERRED: "bg-green-500/10 text-green-500",
};

const FILTERS: { label: string; value: WithdrawalStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Transferred", value: "TRANSFERRED" },
  { label: "Rejected", value: "REJECTED" },
];

type Tab = "vendors" | "venues";

// Shared action row types
type AnyRequest =
  | (WithdrawalRequest & { _type: "vendor" })
  | (AdminVenueOwnerWithdrawal & { _type: "venue" });

export default function AdminWithdrawalsPage() {
  const [tab, setTab] = useState<Tab>("vendors");
  const [filter, setFilter] = useState<WithdrawalStatus | "ALL">("PENDING");

  // Vendor requests
  const [vendorRequests, setVendorRequests] = useState<WithdrawalRequest[]>([]);
  const [vendorLoading, setVendorLoading] = useState(true);

  // Venue owner requests
  const [venueRequests, setVenueRequests] = useState<AdminVenueOwnerWithdrawal[]>([]);
  const [venueLoading, setVenueLoading] = useState(true);

  // Action dialog
  const [selected, setSelected] = useState<AnyRequest | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadVendors = useCallback(async () => {
    setVendorLoading(true);
    try {
      const res = await getAdminWithdrawals({
        status: filter === "ALL" ? undefined : filter,
        limit: 50,
      });
      setVendorRequests(res.data);
    } catch {
      toast.error("Failed to load vendor withdrawals");
    } finally {
      setVendorLoading(false);
    }
  }, [filter]);

  const loadVenues = useCallback(async () => {
    setVenueLoading(true);
    try {
      const res = await getAdminVenueOwnerWithdrawals({
        status: filter === "ALL" ? undefined : filter,
        limit: 50,
      });
      setVenueRequests(res.data);
    } catch {
      toast.error("Failed to load venue owner withdrawals");
    } finally {
      setVenueLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadVendors();
    loadVenues();
  }, [loadVendors, loadVenues]);

  const refresh = () => {
    loadVendors();
    loadVenues();
  };

  const openAction = (req: AnyRequest, type: "approve" | "reject") => {
    setSelected(req);
    setAction(type);
    setNote("");
  };

  const handleAction = async () => {
    if (!selected || !action) return;
    setActionLoading(true);
    try {
      if (selected._type === "vendor") {
        if (action === "approve") {
          await approveWithdrawal(selected.id, note || undefined);
          toast.success("Transfer initiated via Paystack");
        } else {
          await rejectWithdrawal(selected.id, note || undefined);
          toast.success("Rejected — balance refunded to vendor");
        }
      } else {
        if (action === "approve") {
          await approveVenueOwnerWithdrawal(selected.id, note || undefined);
          toast.success("Transfer initiated via Paystack");
        } else {
          await rejectVenueOwnerWithdrawal(selected.id, note || undefined);
          toast.success("Rejected — balance refunded to venue owner");
        }
      }
      setSelected(null);
      setAction(null);
      loadVendors();
      loadVenues();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const loading = tab === "vendors" ? vendorLoading : venueLoading;

  function RequestRow({ req }: { req: AnyRequest }) {
    const name =
      req._type === "vendor"
        ? req.vendor?.vendorProfile?.brandName ??
          `${req.vendor?.firstName} ${req.vendor?.lastName}`
        : req.wallet.owner.businessName;
    const sub =
      req._type === "venue"
        ? req.wallet.owner.user.email
        : req.vendor?.email ?? "";

    return (
      <div
        className={`flex items-center justify-between p-4 bg-card ${
          req.status === "PENDING" ? "bg-yellow-500/5" : ""
        }`}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="hidden sm:flex size-10 rounded-full bg-muted items-center justify-center shrink-0">
            <IconBuildingBank size={18} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {sub && `${sub} · `}
              {req.accountName} · {req.accountNumber}
            </p>
            {req.note && (
              <p className="text-xs text-muted-foreground mt-0.5 italic">
                Note: {req.note}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 ml-4 shrink-0">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold">{formatNaira(req.amount)}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(req.createdAt)}
            </p>
          </div>
          <Badge
            className={`text-[10px] uppercase tracking-widest ${STATUS_STYLES[req.status]}`}
          >
            {req.status}
          </Badge>
          {req.status === "PENDING" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => openAction(req, "approve")}
              >
                <IconCheck size={14} className="mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => openAction(req, "reject")}
              >
                <IconX size={14} className="mr-1" /> Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const vendorRows = vendorRequests.map(
    (r) => ({ ...r, _type: "vendor" as const }),
  );
  const venueRows = venueRequests.map(
    (r) => ({ ...r, _type: "venue" as const }),
  );
  const rows: AnyRequest[] = tab === "vendors" ? vendorRows : venueRows;

  const dialogName =
    selected?._type === "vendor"
      ? selected.vendor?.vendorProfile?.brandName ??
        `${selected.vendor?.firstName} ${selected.vendor?.lastName}`
      : selected?._type === "venue"
        ? selected.wallet.owner.businessName
        : "";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          back
          title="Withdrawal Requests"
          description="Review and process payout requests."
        />
        <Button variant="outline" size="sm" onClick={refresh}>
          <IconRefresh size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      {/* Source tabs */}
      <div className="flex gap-2 border-b pb-3">
        <Button
          size="sm"
          variant={tab === "vendors" ? "default" : "ghost"}
          onClick={() => setTab("vendors")}
        >
          Vendors
          {vendorRequests.filter((r) => r.status === "PENDING").length > 0 && (
            <Badge className="ml-1.5 bg-yellow-500 text-white text-[10px] px-1.5">
              {vendorRequests.filter((r) => r.status === "PENDING").length}
            </Badge>
          )}
        </Button>
        <Button
          size="sm"
          variant={tab === "venues" ? "default" : "ghost"}
          onClick={() => setTab("venues")}
        >
          Venue Owners
          {venueRequests.filter((r) => r.status === "PENDING").length > 0 && (
            <Badge className="ml-1.5 bg-yellow-500 text-white text-[10px] px-1.5">
              {venueRequests.filter((r) => r.status === "PENDING").length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
          <IconBuildingBank size={32} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No withdrawal requests found.
          </p>
        </div>
      ) : (
        <div className="divide-y border rounded-lg overflow-hidden">
          {rows.map((req) => (
            <RequestRow key={req.id} req={req} />
          ))}
        </div>
      )}

      {/* Confirm action dialog */}
      <Dialog
        open={!!selected}
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
              {action === "approve" ? "Approve & Transfer" : "Reject Withdrawal"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {selected._type === "vendor" ? "Vendor" : "Venue Owner"}
                  </span>
                  <span className="font-medium">{dialogName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold">{formatNaira(selected.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account</span>
                  <span>
                    {selected.accountName} · {selected.accountNumber}
                  </span>
                </div>
              </div>
              {action === "approve" && (
                <p className="text-xs bg-yellow-500/10 text-yellow-600 rounded-lg px-3 py-2">
                  This will immediately initiate a Paystack bank transfer. Make
                  sure your Paystack balance is sufficient.
                </p>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Note{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Textarea
                  placeholder={
                    action === "reject"
                      ? "Reason for rejection (visible to recipient)..."
                      : "Internal note..."
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
              variant={action === "reject" ? "destructive" : "default"}
              disabled={actionLoading}
              onClick={handleAction}
            >
              {actionLoading ? (
                <IconLoader2 size={14} className="animate-spin mr-1" />
              ) : action === "approve" ? (
                <IconCheck size={14} className="mr-1" />
              ) : (
                <IconX size={14} className="mr-1" />
              )}
              {action === "approve" ? "Confirm Transfer" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

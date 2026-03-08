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

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WithdrawalStatus | "ALL">("PENDING");

  // Action dialog state
  const [selected, setSelected] = useState<WithdrawalRequest | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminWithdrawals({
        status: filter === "ALL" ? undefined : filter,
        limit: 50,
      });
      setRequests(res.data);
    } catch {
      toast.error("Failed to load withdrawal requests");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const openAction = (req: WithdrawalRequest, type: "approve" | "reject") => {
    setSelected(req);
    setAction(type);
    setNote("");
  };

  const handleAction = async () => {
    if (!selected || !action) return;
    setActionLoading(true);
    try {
      if (action === "approve") {
        await approveWithdrawal(selected.id, note || undefined);
        toast.success("Transfer initiated via Paystack");
      } else {
        await rejectWithdrawal(selected.id, note || undefined);
        toast.success("Withdrawal rejected — balance refunded to vendor");
      }
      setSelected(null);
      setAction(null);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          back
          title="Withdrawal Requests"
          description="Review and process vendor payout requests."
        />
        <Button variant="outline" size="sm" onClick={load}>
          <IconRefresh size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      {/* Filter tabs */}
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
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
          <IconBuildingBank size={32} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No withdrawal requests found.
          </p>
        </div>
      ) : (
        <div className="divide-y border rounded-lg overflow-hidden">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`flex items-center justify-between p-4 bg-card ${
                req.status === "PENDING" ? "bg-yellow-500/5" : ""
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="hidden sm:flex size-10 rounded-full bg-muted items-center justify-center shrink-0">
                  <IconBuildingBank
                    size={18}
                    className="text-muted-foreground"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {req.vendor?.vendorProfile?.brandName ??
                      `${req.vendor?.firstName} ${req.vendor?.lastName}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {req.accountName} · {req.accountNumber} · {req.bankCode}
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
              {action === "approve"
                ? "Approve & Transfer"
                : "Reject Withdrawal"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor</span>
                  <span className="font-medium">
                    {selected.vendor?.vendorProfile?.brandName ??
                      `${selected.vendor?.firstName} ${selected.vendor?.lastName}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold">
                    {formatNaira(selected.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account</span>
                  <span>
                    {selected.accountName} · {selected.accountNumber}
                  </span>
                </div>
              </div>
              {action === "approve" && (
                <p className="text-xs text-muted-foreground bg-yellow-500/10 text-yellow-600 rounded-lg px-3 py-2">
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
                      ? "Reason for rejection (visible to vendor)..."
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

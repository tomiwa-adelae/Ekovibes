"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  IconLoader2,
  IconCheck,
  IconX,
  IconRefresh,
  IconUser,
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
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { formatDate } from "@/lib/utils";
import { fetchData, postData } from "@/lib/api";

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "REVIEWED";
type MembershipTier = "GOLD" | "BLACK";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  occupation: string;
  city: string;
  tier: MembershipTier;
  referral: string | null;
  message: string | null;
  status: ApplicationStatus;
  paidAt: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-blue-500/10 text-blue-500",
  REJECTED: "bg-red-500/10 text-red-500",
  REVIEWED: "bg-green-500/10 text-green-500",
};

const TIER_COLORS: Record<MembershipTier, string> = {
  GOLD: "text-yellow-500",
  BLACK: "text-foreground",
};

const FILTERS: { label: string; value: ApplicationStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Paid", value: "REVIEWED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function AdminMembershipPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationStatus | "ALL">("PENDING");
  const [selected, setSelected] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = filter !== "ALL" ? `?status=${filter}` : "";
      const res = await fetchData<{ data: Application[] }>(
        `/membership/a/applications${qs}`,
      );
      setApplications(res.data);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await postData(`/membership/a/applications/${selected.id}/approve`, {});
      toast.success("Approved! Payment link sent to applicant.");
      setSelected(null);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await postData(`/membership/a/applications/${selected.id}/reject`, {});
      toast.success("Application rejected");
      setSelected(null);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          back
          title="Membership Applications"
          description="Review Gold and Black tier membership requests."
        />
        <Button variant="outline" size="sm" onClick={load}>
          <IconRefresh size={14} className="mr-1" /> Refresh
        </Button>
      </div>

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
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
          <IconUser size={32} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No applications found.
          </p>
        </div>
      ) : (
        <div className="divide-y border rounded-lg overflow-hidden">
          {applications.map((app) => (
            <div
              key={app.id}
              className={`flex items-center justify-between p-4 bg-card cursor-pointer hover:bg-muted/30 transition-colors ${
                app.status === "PENDING" ? "bg-yellow-500/5" : ""
              }`}
              onClick={() => setSelected(app)}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0 hidden sm:flex">
                  <IconUser size={16} className="text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{app.fullName}</p>
                    <span
                      className={`text-xs font-bold uppercase tracking-widest ${TIER_COLORS[app.tier]}`}
                    >
                      {app.tier}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {app.email} · {app.city}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4 shrink-0">
                <p className="text-xs text-muted-foreground hidden md:block">
                  {formatDate(app.createdAt)}
                </p>
                <Badge
                  className={`text-[10px] uppercase tracking-widest ${STATUS_STYLES[app.status]}`}
                >
                  {app.status === "REVIEWED" ? "PAID" : app.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail / Action Dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2 text-sm">
              <div className="rounded-lg border p-4 space-y-2">
                {[
                  ["Name", selected.fullName],
                  ["Email", selected.email],
                  ["Phone", selected.phone],
                  ["Occupation", selected.occupation],
                  ["City", selected.city],
                  ["Tier", selected.tier],
                  ["How they heard", selected.referral ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">
                      {label}
                    </span>
                    <span
                      className={`font-medium text-right ${label === "Tier" ? TIER_COLORS[selected.tier] : ""}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              {selected.message && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground mb-1">Message</p>
                  <p className="text-sm">{selected.message}</p>
                </div>
              )}
              {selected.paidAt && (
                <p className="text-xs text-green-500">
                  Paid on {formatDate(selected.paidAt)}
                </p>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
            {selected?.status === "PENDING" && (
              <>
                <Button
                  variant="destructive"
                  disabled={actionLoading}
                  onClick={handleReject}
                >
                  <IconX size={14} className="mr-1" /> Reject
                </Button>
                <Button
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                >
                  {actionLoading ? (
                    <IconLoader2 size={14} className="animate-spin mr-1" />
                  ) : (
                    <IconCheck size={14} className="mr-1" />
                  )}
                  Approve & Send Payment Link
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

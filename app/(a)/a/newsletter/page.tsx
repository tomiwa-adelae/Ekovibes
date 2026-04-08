"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  IconLoader2,
  IconRefresh,
  IconMail,
  IconTrash,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { formatDate } from "@/lib/utils";
import { fetchData, deleteData } from "@/lib/api";
import { env } from "@/lib/env";

type Filter = "all" | "confirmed" | "pending" | "unsubscribed";

interface Subscriber {
  id: string;
  email: string;
  confirmed: boolean;
  subscribedAt: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
}

interface Stats {
  totalConfirmed: number;
  totalPending: number;
  totalUnsubscribed: number;
}

interface ApiResponse {
  data: Subscriber[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
    stats: Stats;
  };
}

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Pending", value: "pending" },
  { label: "Unsubscribed", value: "unsubscribed" },
];

function statusBadge(sub: Subscriber) {
  if (sub.unsubscribedAt)
    return (
      <Badge className="text-[10px] uppercase tracking-widest bg-muted text-muted-foreground">
        Unsubscribed
      </Badge>
    );
  if (sub.confirmed)
    return (
      <Badge className="text-[10px] uppercase tracking-widest bg-green-500/10 text-green-500">
        Confirmed
      </Badge>
    );
  return (
    <Badge className="text-[10px] uppercase tracking-widest bg-yellow-500/10 text-yellow-500">
      Pending
    </Badge>
  );
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("confirmed");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchData<ApiResponse>(
        `/newsletter/a/subscribers?filter=${filter}&limit=100`,
      );
      setSubscribers(res.data);
      setStats(res.meta.stats);
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from the list?`)) return;
    setDeletingId(id);
    try {
      await deleteData(`/newsletter/a/subscribers/${id}`);
      toast.success("Subscriber removed.");
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error("Failed to remove subscriber.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    window.open(
      `${env.NEXT_PUBLIC_BACKEND_URL}/newsletter/a/export`,
      "_blank",
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          back
          title="The Vibe List"
          description="Newsletter subscribers — confirmed, pending, and unsubscribed."
        />
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <IconDownload size={14} className="mr-1" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={load}>
            <IconRefresh size={14} className="mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-4 bg-card">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Confirmed
            </p>
            <p className="text-2xl font-bold text-green-500">
              {stats.totalConfirmed}
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-card">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Pending
            </p>
            <p className="text-2xl font-bold text-yellow-500">
              {stats.totalPending}
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-card">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Unsubscribed
            </p>
            <p className="text-2xl font-bold text-muted-foreground">
              {stats.totalUnsubscribed}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
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

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
          <IconMail size={32} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No subscribers found.</p>
        </div>
      ) : (
        <div className="divide-y border rounded-lg overflow-hidden">
          {subscribers.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-4 bg-card hover:bg-muted/30 transition-colors gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <IconMail size={14} className="text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{sub.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Joined {formatDate(sub.subscribedAt)}
                    {sub.confirmedAt && (
                      <> · Confirmed {formatDate(sub.confirmedAt)}</>
                    )}
                    {sub.unsubscribedAt && (
                      <> · Unsubscribed {formatDate(sub.unsubscribedAt)}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {statusBadge(sub)}
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  disabled={deletingId === sub.id}
                  onClick={() => handleDelete(sub.id, sub.email)}
                >
                  {deletingId === sub.id ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <IconTrash size={14} />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IconCalendar, IconLoader2, IconWallet } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVendorStats, getVendorEvents } from "@/lib/vendor-api";
import { getVendorWallet } from "@/lib/wallet-api";
import {
  formatNaira,
  type AdminEventWithStats,
  type EventStatus,
} from "@/lib/events-api";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/store/useAuth";
import { PageHeader } from "@/components/PageHeader";

const STATUS_STYLES: Record<EventStatus, string> = {
  LIVE: "bg-green-500/10 text-green-500",
  SOLD_OUT: "bg-red-500/10 text-red-500",
  DRAFT: "bg-muted text-muted-foreground",
  CANCELLED: "bg-orange-500/10 text-orange-500",
  ENDED: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  REJECTED: "bg-red-500/10 text-red-400",
};

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [recentEvents, setRecentEvents] = useState<AdminEventWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getVendorStats(),
      getVendorEvents({ limit: 5 }),
      getVendorWallet().catch(() => null),
    ])
      .then(([s, e, w]) => {
        setStats(s);
        setRecentEvents(e.data);
        if (w) setWalletBalance(w.balance);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <IconLoader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.firstName}`}
        description="Here's how your events are performing."
      />

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 2xl:grid-cols-4 gap-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalEvents ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Live Events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">
              {stats?.liveEvents ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tickets Sold</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalTicketsSold ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatNaira(stats?.totalRevenue ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Wallet Balance ── */}
      <Link href="/vendor/wallet" className="block">
        <div className="rounded-xl border bg-card p-5 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <IconWallet size={18} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wallet Balance</p>
              <p className="text-xl font-bold mt-0.5">
                {formatNaira(walletBalance)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">View wallet →</p>
        </div>
      </Link>

      {/* ── Recent Events ── */}
      <Card className="gap-1">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Recent Events</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/vendor/events">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <IconCalendar size={32} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No events yet</p>
              <Button size="sm" asChild>
                <Link href="/vendor/events/new">Create your first event</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recentEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/vendor/events/${event.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(event.date)} · {event.venueName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Sold</p>
                      <p className="text-sm font-semibold">
                        {event.totalSold}/{event.totalCapacity}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-sm font-semibold">
                        {formatNaira(event.totalRevenue ?? 0)}
                      </p>
                    </div>
                    <Badge
                      className={`text-[10px] uppercase tracking-widest ${STATUS_STYLES[event.status]}`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

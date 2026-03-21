"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconBuilding,
  IconCalendar,
  IconClock,
  IconLoader2,
  IconPlus,
  IconArrowRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import {
  getMyOwnerProfile,
  getMyVenues,
  getVenueOwnerReservations,
  getVenueOwnerWallet,
  formatNaira,
  type VenueOwnerProfile,
  type VenueOwnerWallet,
  type Venue,
  type Reservation,
  VENUE_CATEGORY_LABELS,
} from "@/lib/reservations-api";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_BADGE: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-blue-500/10 text-blue-400",
  REJECTED: "bg-red-500/10 text-red-400",
  LIVE: "bg-green-500/10 text-green-500",
  SUSPENDED: "bg-muted text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  LIVE: "Live",
  SUSPENDED: "Suspended",
};

const RES_STATUS_BADGE: Record<string, string> = {
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

export default function VenueDashboardPage() {
  const [profile, setProfile] = useState<VenueOwnerProfile | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [recent, setRecent] = useState<Reservation[]>([]);
  const [wallet, setWallet] = useState<VenueOwnerWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyOwnerProfile(),
      getMyVenues(),
      getVenueOwnerReservations({ limit: 5 }),
      getVenueOwnerWallet().catch(() => null),
    ])
      .then(([p, v, r, w]) => {
        setProfile(p);
        setVenues(v);
        setRecent(r.data);
        setWallet(w);
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

  const pendingApproval = recent.filter(
    (r) => r.status === "PENDING_APPROVAL",
  ).length;

  return (
    <main className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <PageHeader
          title={`Welcome back${profile ? `, ${profile.businessName}` : ""}`}
          description="Manage your venues and reservations from The Black Book."
        />
        <Button asChild>
          <Link href="/venue-dashboard/venues/new">
            <IconPlus /> Add Venue
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground uppercase">Venues</p>
            <p className="text-2xl font-bold">{venues.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground uppercase">
              Awaiting Action
            </p>
            <p className="text-2xl font-bold text-yellow-500">
              {pendingApproval}
            </p>
          </CardContent>
        </Card>
        <Link href="/venue-dashboard/wallet" className="col-span-2 sm:col-span-1">
          <Card className="hover:border-foreground/20 transition-colors h-full">
            <CardContent>
              <p className="text-xs text-muted-foreground uppercase">
                Wallet Balance
              </p>
              <p className="text-2xl font-bold">
                {wallet ? formatNaira(wallet.balance) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tap to withdraw →
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Venues */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            My Venues
          </p>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link href="/venue-dashboard/venues">
              View all <IconArrowRight size={12} className="ml-1" />
            </Link>
          </Button>
        </div>

        {venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border rounded-xl border-dashed">
            <IconBuilding size={32} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No venues yet.</p>
            <Button asChild size="sm">
              <Link href="/venue-dashboard/venues/new">
                <IconPlus size={14} className="mr-1" /> Apply to list a venue
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {venues.slice(0, 4).map((venue) => (
              <Link
                key={venue.id}
                href={`/venue-dashboard/venues/${venue.slug}`}
                className="border rounded-xl p-4 space-y-2 hover:border-foreground/20 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{venue.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {venue.city}
                    </p>
                  </div>
                  <Badge
                    className={`text-[10px] shrink-0 ${STATUS_BADGE[venue.status]}`}
                  >
                    {STATUS_LABELS[venue.status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {VENUE_CATEGORY_LABELS[venue.category]}
                  </Badge>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Manage →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent reservations */}
      {recent.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Recent Reservations
            </p>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/venue-dashboard/reservations">
                View all <IconArrowRight size={12} className="ml-1" />
              </Link>
            </Button>
          </div>
          <div className="border rounded-xl divide-y">
            {recent.map((res) => (
              <div
                key={res.id}
                className="p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium truncate">
                    {res.user
                      ? `${res.user.firstName} ${res.user.lastName}`
                      : res.reference}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IconBuilding size={11} /> {res.venue?.name ?? "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconCalendar size={11} />
                      {new Date(res.date).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconClock size={11} /> {res.timeSlot}
                    </span>
                  </div>
                </div>
                <Badge
                  className={`text-[10px] shrink-0 ${RES_STATUS_BADGE[res.status]}`}
                >
                  {res.status.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  IconBuilding,
  IconLoader2,
  IconMapPin,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import {
  getMyVenues,
  VENUE_CATEGORY_LABELS,
  type Venue,
} from "@/lib/reservations-api";

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

export default function MyVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getMyVenues()
      .then(setVenues)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1">
        <PageHeader
          back
          title="My Venues"
          description="Venues you've listed on The Black Book."
        />
        <Button className="w-full md:w-auto" asChild>
          <Link href="/venue-dashboard/venues/new">
            <IconPlus /> Add Venue
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border rounded-xl border-dashed">
          <IconBuilding size={36} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            You haven&apos;t listed any venues yet.
          </p>
          <Button asChild size="sm">
            <Link href="/venue-dashboard/venues/new">
              <IconPlus size={14} className="mr-1" /> Apply to list a venue
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <Link
              key={venue.id}
              href={`/venue-dashboard/venues/${venue.slug}`}
              className="group border rounded-xl overflow-hidden bg-card hover:border-foreground/20 transition-colors"
            >
              {venue.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={venue.coverImage}
                  alt={venue.name}
                  className="w-full aspect-video object-cover group-hover:brightness-90 transition-all"
                />
              ) : (
                <div className="w-full aspect-video bg-muted flex items-center justify-center">
                  <IconBuilding
                    size={32}
                    className="text-muted-foreground/30"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{venue.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <IconMapPin size={11} />
                      {venue.city}
                    </div>
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
                  {venue.status === "REJECTED" && venue.rejectionReason && (
                    <p className="text-[10px] text-red-400 truncate max-w-32">
                      {venue.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

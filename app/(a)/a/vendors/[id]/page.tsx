"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconLoader2,
  IconBuilding,
  IconCalendar,
  IconWallet,
  IconTicket,
  IconChevronLeft,
  IconMail,
  IconPhone,
  IconBrandInstagram,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira, type EventStatus } from "@/lib/events-api";
import { formatDate } from "@/lib/utils";
import {
  getAdminVendorById,
  type VendorDetail,
  type WithdrawalStatus,
} from "@/lib/wallet-api";
import { PageHeader } from "@/components/PageHeader";

const EVENT_STATUS_STYLES: Record<EventStatus, string> = {
  LIVE: "bg-green-500/10 text-green-500",
  SOLD_OUT: "bg-red-500/10 text-red-500",
  DRAFT: "bg-muted text-muted-foreground",
  CANCELLED: "bg-orange-500/10 text-orange-500",
  ENDED: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  REJECTED: "bg-red-500/10 text-red-400",
};

const WITHDRAWAL_STATUS_STYLES: Record<WithdrawalStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-blue-500/10 text-blue-400",
  TRANSFERRED: "bg-green-500/10 text-green-500",
  REJECTED: "bg-red-500/10 text-red-400",
};

export default function AdminVendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getAdminVendorById(id)
      .then(setVendor)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <IconLoader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/a/vendors">
            <IconChevronLeft size={14} className="mr-1" /> Back to Vendors
          </Link>
        </Button>
        <p className="text-muted-foreground text-sm">Vendor not found.</p>
      </div>
    );
  }

  const displayName =
    vendor.vendorProfile?.brandName ?? `${vendor.firstName} ${vendor.lastName}`;

  return (
    <div className="space-y-6">
      {/* Back */}
      <PageHeader back />

      {/* Profile header */}
      <div className="flex items-center gap-4">
        {vendor.vendorProfile?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.vendorProfile.logoUrl}
            alt={displayName}
            className="size-16 rounded-full object-cover shrink-0 border"
          />
        ) : (
          <div className="size-16 rounded-full bg-muted flex items-center justify-center shrink-0 border">
            <IconBuilding size={24} className="text-muted-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-sm text-muted-foreground">
            {vendor.firstName} {vendor.lastName} · Joined{" "}
            {formatDate(vendor.createdAt)}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <IconMail size={11} /> {vendor.email}
            </span>
            {vendor.phoneNumber && (
              <span className="flex items-center gap-1">
                <IconPhone size={11} /> {vendor.phoneNumber}
              </span>
            )}
            {vendor.vendorProfile?.instagram && (
              <span className="flex items-center gap-1">
                <IconBrandInstagram size={11} />{" "}
                {vendor.vendorProfile.instagram}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <IconCalendar size={12} /> Total Events
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{vendor.totalEvents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <IconTicket size={12} /> Tickets Sold
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{vendor.totalTicketsSold}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNaira(vendor.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <IconWallet size={12} /> Wallet Balance
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {formatNaira(vendor.walletBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Events */}
      <Card className="gap-1">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {vendor.events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <IconCalendar size={28} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No events yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {vendor.events.map((event) => (
                <Link
                  key={event.id}
                  href={`/a/events/${event.id}`}
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
                      <p className="text-sm font-semibold">{event.totalSold}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-sm font-semibold">
                        {formatNaira(event.totalRevenue)}
                      </p>
                    </div>
                    <Badge
                      className={`text-[10px] uppercase tracking-widest ${EVENT_STATUS_STYLES[event.status as EventStatus] ?? "bg-muted text-muted-foreground"}`}
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

      {/* Withdrawal history */}
      <Card className="gap-1">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {vendor.withdrawalRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <IconWallet size={28} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No withdrawal requests.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {vendor.withdrawalRequests.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {formatNaira(w.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {w.accountName} · {w.accountNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(w.createdAt)}
                      {w.note && ` · "${w.note}"`}
                    </p>
                  </div>
                  <Badge
                    className={`text-[10px] uppercase tracking-widest ${WITHDRAWAL_STATUS_STYLES[w.status]}`}
                  >
                    {w.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  IconEdit,
  IconQrcode,
  IconLoader2,
  IconAlertCircle,
  IconCalendar,
  IconMapPin,
  IconTicket,
  IconCurrencyNaira,
  IconArrowLeft,
  IconPencil,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  getAdminEventById,
  formatNaira,
  type AdminEventWithStats,
  type EventStatus,
} from "@/lib/events-api";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { DEFAULT_IMAGE } from "@/constants";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatMoneyInput } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NairaIcon } from "@/components/NairaIcon";

const STATUS_STYLES: Record<EventStatus, string> = {
  LIVE: "bg-green-500/10 text-green-500",
  SOLD_OUT: "bg-red-500/10 text-red-500",
  DRAFT: "bg-muted text-muted-foreground",
  CANCELLED: "bg-orange-500/10 text-orange-500",
  ENDED: "bg-muted text-muted-foreground",
};

const AdminEventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<AdminEventWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAdminEventById(id)
      .then(setEvent)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 gap-3 text-muted-foreground">
        <IconLoader2 size={20} className="animate-spin" />
        <span className="text-xs uppercase tracking-widest">Loading…</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-muted-foreground">
        <IconAlertCircle size={32} stroke={1} />
        <p className="text-xs uppercase tracking-widest">Event not found</p>
        <Link href="/a/events">
          <Button
            variant="outline"
            className="rounded-none border-border text-[10px] uppercase tracking-widest"
          >
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const soldPct =
    event.totalCapacity > 0
      ? Math.round((event.totalSold / event.totalCapacity) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center justify-start md:justify-between">
        <PageHeader
          title={
            <>
              {event.title}
              <Badge variant="secondary">
                {event.status.replace("_", " ")}
              </Badge>
            </>
          }
          back
          description={
            <>
              {event.category.replace("_", " ")} • {event.venueName}
            </>
          }
        />
        <div className="flex w-full lg:w-auto gap-3">
          <Button className="flex-1" asChild variant="outline">
            <Link href={`/a/events/${id}/scan`}>
              <IconQrcode size={16} /> Scanner
            </Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href={`/a/events/${id}/edit`}>
              <IconPencil size={16} /> Edit Event
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 2xl:grid-cols-4 gap-2">
        {[
          {
            label: "Total Revenue",
            value: formatNaira(event.totalRevenue),
            icon: (
              <IconCurrencyNaira size={18} className="text-muted-foreground" />
            ),
          },
          {
            label: "Tickets Sold",
            value: `${event.totalSold} / ${event.totalCapacity}`,
            icon: <IconTicket size={18} className="text-muted-foreground" />,
          },
          {
            label: "Sell-Through",
            value: `${soldPct}%`,
            icon: null,
          },
          {
            label: "Date",
            value: formatDate(event.date),
            icon: <IconCalendar size={18} className="text-muted-foreground" />,
          },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 pt-6">
              {" "}
              {/* Added padding for Shadcn cards */}
              <div className="flex justify-between items-start mb-3">
                <CardDescription className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  {s.label}
                </CardDescription>
                {/* Render the icon directly since it is already JSX */}
                {s.icon}
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">
                {s.value}
              </CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Event Info */}
      <div>
        {/* Details */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="p-0">
            <div className="aspect-video overflow-hidden border border-border">
              <Image
                src={event.coverImage || DEFAULT_IMAGE}
                width={1000}
                height={1000}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {[
              { label: "Doors Open", value: event.doorsOpen },
              {
                label: "Venue",
                value: `${event.venueName}${event.venueAddress ? ` — ${event.venueAddress}` : ""}`,
              },
              { label: "City", value: event.city || "—" },
              { label: "Dress Code", value: event.dressCode || "—" },
              {
                label: "Access",
                value: event.isMemberOnly ? "Members Only" : "Public",
              },
            ].map((d) => (
              <div
                key={d.label}
                className="flex justify-between border-b border-border py-3"
              >
                <span className="text-xs text-muted-foreground">{d.label}</span>
                <span className="text-xs text-foreground/80 text-right max-w-[60%]">
                  {d.value}
                </span>
              </div>
            ))}
            {event.description && (
              <p className="text-sm text-foreground/50 leading-relaxed pt-2">
                {event.description}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ticket Tiers */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Ticket Tiers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.ticketTiers.map((tier) => {
            const pct =
              tier.quantity > 0
                ? Math.round((tier.sold / tier.quantity) * 100)
                : 0;
            return (
              <div
                key={tier.id}
                className="flex items-center gap-6 border-b last:border-0 border-border pb-4"
              >
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <p className="text-xs font-bold uppercase">{tier.name}</p>
                    <p className="text-xs text-foreground/60">
                      {formatNaira(tier.price)}
                    </p>
                  </div>
                  <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                    <span>
                      {tier.sold} sold / {tier.quantity} capacity
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <Progress className="h-1" value={pct} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">
                    {formatNaira(tier.sold * tier.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {(event as any).orders?.length > 0 && (
        <Card className="gap-2">
          <CardHeader className="border-b">
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(event as any).orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {order.user.firstName} {order.user.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {order.user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.items[0]?.ticketTier?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <NairaIcon />
                      {formatMoneyInput(order.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminEventDetailPage;

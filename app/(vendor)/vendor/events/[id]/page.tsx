"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  IconAlertCircle,
  IconCalendar,
  IconCurrencyNaira,
  IconLoader2,
  IconPencil,
  IconQrcode,
  IconTicket,
  IconClockHour4,
  IconX,
  IconRefresh,
  IconCheck,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import {
  getVendorEventById,
  updateVendorEventStatus,
  resubmitVendorEvent,
  getVendorEventAttendees,
  type AttendeesResponse,
} from "@/lib/vendor-api";
import {
  formatNaira,
  type AdminEventWithStats,
  type EventStatus,
} from "@/lib/events-api";
import { PageHeader } from "@/components/PageHeader";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DEFAULT_IMAGE } from "@/constants";

const STATUS_STYLES: Record<EventStatus, string> = {
  LIVE: "bg-green-500/10 text-green-500",
  SOLD_OUT: "bg-red-500/10 text-red-500",
  DRAFT: "bg-muted text-muted-foreground",
  CANCELLED: "bg-orange-500/10 text-orange-500",
  ENDED: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  REJECTED: "bg-red-500/10 text-red-400",
};

const ALLOWED_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  DRAFT: ["CANCELLED"],
  LIVE: ["ENDED", "CANCELLED"],
  SOLD_OUT: ["ENDED", "CANCELLED"],
  CANCELLED: [],
  ENDED: [],
  PENDING_REVIEW: [],
  REJECTED: [],
};

export default function VendorEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<AdminEventWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [resubmitLoading, setResubmitLoading] = useState(false);
  const [attendees, setAttendees] = useState<AttendeesResponse | null>(null);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getVendorEventById(id)
      .then(setEvent)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const loadAttendees = () => {
    if (!id) return;
    setAttendeesLoading(true);
    getVendorEventAttendees(id)
      .then(setAttendees)
      .catch(() => toast.error("Failed to load attendees"))
      .finally(() => setAttendeesLoading(false));
  };

  const handleResubmit = async () => {
    if (!event) return;
    setResubmitLoading(true);
    try {
      const updated = await resubmitVendorEvent(event.id);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              status: updated.status as EventStatus,
              rejectionReason: undefined,
            }
          : prev,
      );
      toast.success("Event resubmitted for review!");
    } catch {
      toast.error("Failed to resubmit event");
    } finally {
      setResubmitLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: EventStatus) => {
    if (!event) return;
    setStatusLoading(true);
    try {
      const updated = await updateVendorEventStatus(event.id, newStatus);
      setEvent((prev) => (prev ? { ...prev, status: updated.status } : prev));
      toast.success(`Event status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

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
        <p className="text-sm">Event not found</p>
        <Button variant="outline" asChild>
          <Link href="/vendor/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const soldPct =
    event.totalCapacity > 0
      ? Math.round((event.totalSold / event.totalCapacity) * 100)
      : 0;

  const nextStatuses = ALLOWED_TRANSITIONS[event.status];

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center justify-start md:justify-between">
        <PageHeader
          title={
            <>
              {event.title}
              <Badge
                className={`ml-2 text-[10px] uppercase tracking-widest ${STATUS_STYLES[event.status]}`}
              >
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
        <div className="flex w-full lg:w-auto gap-3 flex-wrap">
          {nextStatuses.length > 0 && (
            <Select
              onValueChange={(v) => handleStatusChange(v as EventStatus)}
              disabled={statusLoading}
            >
              <SelectTrigger className="w-36 text-xs">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                {nextStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {event.status === "LIVE" && (
            <Button variant="outline" asChild>
              <Link href={`/vendor/events/${id}/scan`}>
                <IconQrcode size={16} /> Scanner
              </Link>
            </Button>
          )}
          {event.status !== "PENDING_REVIEW" && (
            <Button
              asChild
              variant={event.status === "REJECTED" ? "outline" : "default"}
            >
              <Link href={`/vendor/events/${id}/edit`}>
                <IconPencil size={16} /> Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Pending review banner */}
      {event.status === "PENDING_REVIEW" && (
        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardContent className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-yellow-500/15 shrink-0 mt-0.5">
              <IconClockHour4 size={18} className="text-yellow-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-yellow-500">
                Under Review
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your event has been submitted and is awaiting approval from our
                team. Once approved, it will go live automatically. This usually
                takes 24–48 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected banner */}
      {event.status === "REJECTED" && (
        <Card className="border-red-500/40 bg-red-500/5">
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-red-500/15 shrink-0 mt-0.5">
                <IconX size={18} className="text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-red-400">
                  Event Rejected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your event was not approved. Please read the feedback below,
                  make the required changes, and resubmit for review.
                </p>
              </div>
            </div>
            {event.rejectionReason && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-[10px] uppercase tracking-widest text-red-400 mb-1">
                  Reason from Admin
                </p>
                <p className="text-sm text-foreground/80">
                  {event.rejectionReason}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button asChild className="flex-1">
                <Link href={`/vendor/events/${id}/edit`}>
                  <IconPencil size={16} className="mr-1" /> Edit & Fix Issues
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleResubmit}
                disabled={resubmitLoading}
                className="flex-1"
              >
                <IconRefresh size={16} className="mr-1" />
                {resubmitLoading ? "Resubmitting…" : "Resubmit As-Is"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
          { label: "Sell-Through", value: `${soldPct}%`, icon: null },
          {
            label: "Date",
            value: formatDate(event.date),
            icon: <IconCalendar size={18} className="text-muted-foreground" />,
          },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 pt-6">
              <div className="flex justify-between items-start mb-3">
                <CardDescription className="text-[10px] uppercase tracking-widest font-medium">
                  {s.label}
                </CardDescription>
                {s.icon}
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">
                {s.value}
              </CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>

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

      {/* Attendee List */}
      <Card className="gap-1">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <IconUsers size={18} />
              Guest List
              {attendees && (
                <span className="text-sm font-normal text-muted-foreground">
                  — {attendees.checkedIn}/{attendees.total} checked in
                </span>
              )}
            </CardTitle>
            {!attendees && (
              <Button
                size="sm"
                variant="outline"
                onClick={loadAttendees}
                disabled={attendeesLoading}
              >
                {attendeesLoading ? (
                  <IconLoader2 size={14} className="animate-spin mr-1" />
                ) : null}
                Load Guest List
              </Button>
            )}
            {attendees && (
              <Button
                size="sm"
                variant="ghost"
                onClick={loadAttendees}
                disabled={attendeesLoading}
              >
                {attendeesLoading ? (
                  <IconLoader2 size={14} className="animate-spin" />
                ) : (
                  <IconRefresh size={14} />
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        {attendees && (
          <CardContent className="p-0">
            {attendees.tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No tickets sold yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Guest</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Check-In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.tickets.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{t.holder}</span>
                          <span className="text-xs text-muted-foreground">{t.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs uppercase tracking-wide">{t.tier}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">{t.code}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {t.isUsed ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-500">
                              <IconCheck size={12} /> Checked In
                            </span>
                            {t.usedAt && (
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(t.usedAt).toLocaleTimeString("en-NG", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase text-muted-foreground tracking-widest">
                            Not Yet
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        )}
      </Card>

      {(event as any).orders?.length > 0 && (
        <Card className="gap-1">
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
}

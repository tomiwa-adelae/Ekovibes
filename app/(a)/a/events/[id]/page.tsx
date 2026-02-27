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
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  getAdminEventById,
  formatNaira,
  type AdminEventWithStats,
  type EventStatus,
} from "@/lib/events-api";

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
          <Button variant="outline" className="rounded-none border-border text-[10px] uppercase tracking-widest">
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/a/events" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-widest mb-4 transition-colors">
            <IconArrowLeft size={12} /> All Events
          </Link>
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-2xl font-bold uppercase tracking-tighter">
              {event.title}
            </h1>
            <span className={`text-[9px] uppercase tracking-widest px-2 py-1 font-bold ${STATUS_STYLES[event.status]}`}>
              {event.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {event.category.replace("_", " ")} • {event.venueName}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/a/events/${id}/scan`}>
            <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground rounded-none px-5 py-5 text-[10px] uppercase tracking-widest">
              <IconQrcode size={16} className="mr-2" /> Scanner
            </Button>
          </Link>
          <Link href={`/a/events/${id}/edit`}>
            <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-5 py-5 text-[10px] uppercase tracking-widest font-bold">
              <IconEdit size={16} className="mr-2" /> Edit Event
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatNaira(event.totalRevenue),
            icon: <IconCurrencyNaira size={18} />,
          },
          {
            label: "Tickets Sold",
            value: `${event.totalSold} / ${event.totalCapacity}`,
            icon: <IconTicket size={18} />,
          },
          {
            label: "Sell-Through",
            value: `${soldPct}%`,
            icon: null,
          },
          {
            label: "Date",
            value: new Date(event.date).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            icon: <IconCalendar size={18} />,
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-card border border-border p-6"
          >
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
              {s.icon && <span className="text-white/20">{s.icon}</span>}
            </div>
            <p className="text-xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Event Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cover Image */}
        {event.coverImage && (
          <div className="aspect-video overflow-hidden border border-border">
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Details */}
        <div className={`bg-card border border-border p-6 space-y-4 ${event.coverImage ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
            Event Details
          </p>
          {[
            { label: "Doors Open", value: event.doorsOpen },
            { label: "Venue", value: `${event.venueName}${event.venueAddress ? ` — ${event.venueAddress}` : ""}` },
            { label: "City", value: event.city || "—" },
            { label: "Dress Code", value: event.dressCode || "—" },
            { label: "Access", value: event.isMemberOnly ? "Members Only" : "Public" },
          ].map((d) => (
            <div key={d.label} className="flex justify-between border-b border-border pb-3">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{d.label}</span>
              <span className="text-xs text-foreground/80 text-right max-w-[60%]">{d.value}</span>
            </div>
          ))}
          {event.description && (
            <p className="text-sm text-foreground/50 leading-relaxed pt-2">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {/* Ticket Tiers */}
      <div className="bg-card border border-border p-8">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-6">
          Ticket Tiers
        </h3>
        <div className="space-y-4">
          {event.ticketTiers.map((tier) => {
            const pct = tier.quantity > 0 ? Math.round((tier.sold / tier.quantity) * 100) : 0;
            return (
              <div key={tier.id} className="flex items-center gap-6 border-b border-border pb-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <p className="text-xs font-bold uppercase">{tier.name}</p>
                    <p className="text-xs text-foreground/60">{formatNaira(tier.price)}</p>
                  </div>
                  <div className="flex justify-between text-[9px] uppercase mb-1 text-muted-foreground">
                    <span>{tier.sold} sold / {tier.quantity} capacity</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-px bg-muted w-full overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">{formatNaira(tier.sold * tier.price)}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">revenue</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      {(event as any).orders?.length > 0 && (
        <div className="bg-card border border-border p-8">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-6">
            Recent Orders
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  {["Buyer", "Tier", "Amount", "Date"].map((h) => (
                    <th key={h} className="pb-4 text-[10px] uppercase tracking-widest text-muted-foreground font-medium pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(event as any).orders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="py-3 pr-6">
                      <p className="text-xs font-bold">{order.user.firstName} {order.user.lastName}</p>
                      <p className="text-[9px] text-muted-foreground">{order.user.email}</p>
                    </td>
                    <td className="py-3 pr-6 text-xs text-foreground/60">
                      {order.items[0]?.ticketTier?.name ?? "—"}
                    </td>
                    <td className="py-3 pr-6 text-xs font-bold">
                      {formatNaira(order.total)}
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventDetailPage;

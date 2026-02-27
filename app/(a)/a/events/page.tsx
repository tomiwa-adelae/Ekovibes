"use client";
import React, { useEffect, useState } from "react";
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconLoader2,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import {
  getAdminEvents,
  deleteEvent,
  updateEventStatus,
  formatNaira,
  type AdminEventWithStats,
  type EventStatus,
} from "@/lib/events-api";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_STYLES: Record<EventStatus, string> = {
  LIVE: "bg-green-500/10 text-green-500",
  SOLD_OUT: "bg-red-500/10 text-red-500",
  DRAFT: "bg-muted text-muted-foreground",
  CANCELLED: "bg-orange-500/10 text-orange-500",
  ENDED: "bg-muted text-muted-foreground",
};

const AdminEventsPage = () => {
  const [events, setEvents] = useState<AdminEventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async (q = "") => {
    setLoading(true);
    try {
      const res = await getAdminEvents({ search: q || undefined, limit: 50 });
      setEvents(res.data);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (event: AdminEventWithStats) => {
    if (
      !confirm(
        `Delete "${event.title}"? ${event.totalSold > 0 ? "This event has sold tickets — it will be cancelled instead." : ""}`,
      )
    )
      return;
    setDeletingId(event.id);
    try {
      await deleteEvent(event.id);
      toast.success("Event removed");
      load(search);
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleLive = async (event: AdminEventWithStats) => {
    const newStatus: EventStatus = event.status === "LIVE" ? "DRAFT" : "LIVE";
    setTogglingId(event.id);
    try {
      await updateEventStatus(event.id, newStatus);
      toast.success(
        `Event ${newStatus === "LIVE" ? "published" : "unpublished"}`,
      );
      load(search);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <PageHeader
          title="Event Registry"
          back
          description={"Manage Experience Inventory"}
        />
        <Button asChild className="w-full md:w-auto">
          <Link href="/a/events/new">
            <IconPlus /> Create New
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Field>
        <InputGroup>
          <InputGroupInput id="inline-start-input" placeholder="Search..." />
          <InputGroupAddon align="inline-start">
            <IconSearch className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </Field>

      {/* Table */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
              <IconLoader2 size={20} className="animate-spin" />
              <span className="text-xs uppercase tracking-widest">
                Loading events…
              </span>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
              <IconAlertCircle size={32} stroke={1} />
              <p className="text-xs">No events found</p>
              <Link href="/a/events/new">
                <Button variant="outline">Create Your First Event</Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                    Event Identity
                  </th>
                  <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                    Date
                  </th>
                  <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                    Sales Performance
                  </th>
                  <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                    Status
                  </th>
                  <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((event) => {
                  const pct =
                    event.totalCapacity > 0
                      ? Math.round(
                          (event.totalSold / event.totalCapacity) * 100,
                        )
                      : 0;
                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-muted/50 transition-colors group"
                    >
                      <td className="p-6">
                        <p className="text-xs font-bold uppercase mb-1">
                          {event.title}
                        </p>
                        <p className="text-[9px] text-muted-foreground tracking-widest">
                          {event.category.replace("_", " ")} •{" "}
                          {event.isMemberOnly ? "Members Only" : "Public"}
                        </p>
                      </td>
                      <td className="p-6">
                        <p className="text-xs text-foreground/80">
                          {new Date(event.date).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[9px] text-white/40 mt-1">
                          {event.venueName}
                        </p>
                      </td>
                      <td className="p-6">
                        <div className="w-full max-w-[140px]">
                          <div className="flex justify-between text-[9px] uppercase mb-1">
                            <span className="text-foreground/60">
                              {event.totalSold} / {event.totalCapacity}
                            </span>
                            <span className="font-bold">{pct}%</span>
                          </div>
                          <div className="h-1 bg-muted w-full overflow-hidden">
                            <div
                              className="h-full bg-foreground transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-[10px] font-bold mt-2 text-foreground/80">
                            {formatNaira(event.totalRevenue)}
                          </p>
                        </div>
                      </td>
                      <td className="p-6">
                        <span
                          className={`text-[9px] uppercase tracking-widest px-2 py-1 font-bold ${STATUS_STYLES[event.status]}`}
                        >
                          {event.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                          {(event.status === "DRAFT" ||
                            event.status === "LIVE") && (
                            <button
                              onClick={() => handleToggleLive(event)}
                              disabled={togglingId === event.id}
                              className="p-2 hover:bg-muted text-foreground text-[9px] uppercase tracking-widest border border-border disabled:opacity-40"
                            >
                              {togglingId === event.id ? (
                                <IconLoader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : event.status === "LIVE" ? (
                                "Unpublish"
                              ) : (
                                "Go Live"
                              )}
                            </button>
                          )}
                          <Link href={`/a/events/${event.id}`}>
                            <button className="p-2 hover:bg-muted text-foreground">
                              <IconEye size={16} />
                            </button>
                          </Link>
                          <Link href={`/a/events/${event.id}/edit`}>
                            <button className="p-2 hover:bg-muted text-foreground">
                              <IconEdit size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(event)}
                            disabled={deletingId === event.id}
                            className="p-2 hover:bg-red-500/20 text-red-500 disabled:opacity-40"
                          >
                            {deletingId === event.id ? (
                              <IconLoader2 size={16} className="animate-spin" />
                            ) : (
                              <IconTrash size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEventsPage;

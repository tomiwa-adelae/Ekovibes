"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconLoader2,
  IconAlertCircle,
  IconDotsVertical,
  IconBan,
  IconCheck,
  IconClockHour4,
} from "@tabler/icons-react";
import { toast } from "sonner";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// API & Utilities
import {
  getAdminEvents,
  deleteEvent,
  updateEventStatus,
  formatNaira,
  type AdminEventWithStats,
  type EventStatus,
} from "@/lib/events-api";
import { PageHeader } from "@/components/PageHeader";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn, formatDate } from "@/lib/utils";
import { Loader } from "@/components/Loader";

const STATUS_STYLES: Record<EventStatus, string> = {
  LIVE: "bg-green-500/10 text-green-500",
  SOLD_OUT: "bg-red-500/10 text-red-500",
  DRAFT: "bg-muted text-muted-foreground",
  CANCELLED: "bg-orange-500/10 text-orange-500",
  ENDED: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  REJECTED: "bg-red-500/10 text-red-400",
};

const AdminEventsPage = () => {
  const [events, setEvents] = useState<AdminEventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "">("");
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async (
    q = "",
    status: EventStatus | "" = "",
    currentTab: "active" | "archived" = "active",
  ) => {
    setLoading(true);
    try {
      const res = await getAdminEvents({
        search: q || undefined,
        status: currentTab === "archived" ? "CANCELLED" : status || undefined,
        limit: 50,
      });
      const data =
        currentTab === "active"
          ? res.data.filter((e) => e.status !== "CANCELLED")
          : res.data;
      setEvents(data);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("", statusFilter, tab);
  }, [statusFilter, tab]);

  useEffect(() => {
    const t = setTimeout(() => load(search, statusFilter, tab), 400);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Event Registry"
          back
          description="Manage Experience Inventory"
        />
        <Button asChild>
          <Link href="/a/events/new">
            <IconPlus /> Create New
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 border-b pb-2">
        <Button
          size="sm"
          variant={tab === "active" ? "default" : "ghost"}
          onClick={() => {
            setTab("active");
            setStatusFilter("");
          }}
        >
          Active
        </Button>
        <Button
          size="sm"
          variant={tab === "archived" ? "default" : "ghost"}
          onClick={() => setTab("archived")}
          className={tab !== "archived" ? "text-muted-foreground" : ""}
        >
          Deleted
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Field className="flex-1">
          <InputGroup>
            <InputGroupInput
              id="inline-start-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon align="inline-start">
              <IconSearch className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </Field>
        {tab === "active" && (
          <div className="flex gap-2 flex-wrap">
            {(
              ["", "PENDING_REVIEW", "LIVE", "DRAFT", "REJECTED"] as (
                | EventStatus
                | ""
              )[]
            ).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={statusFilter === s ? "default" : "outline"}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "capitalize",
                  s === "PENDING_REVIEW" && statusFilter !== "PENDING_REVIEW"
                    ? "border-yellow-500/40 text-yellow-500"
                    : "",
                )}
              >
                {s === "" ? (
                  "All"
                ) : s === "PENDING_REVIEW" ? (
                  <>
                    <IconClockHour4 size={14} className="mr-1" />
                    Review Queue
                  </>
                ) : (
                  s.replace("_", " ")
                )}
              </Button>
            ))}
          </div>
        )}
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <IconLoader2 size={32} className="animate-spin opacity-20" />
              <span className="text-sm uppercase font-medium">
                Loading events…
              </span>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="bg-muted rounded-full p-4">
                <IconAlertCircle size={32} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">
                  {tab === "archived"
                    ? "No archived events"
                    : "No events found"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {tab === "archived"
                    ? "Cancelled events will appear here."
                    : "Try adjusting your search or create a new event."}
                </p>
              </div>
              {tab === "active" && (
                <Button variant="outline" asChild>
                  <Link href="/a/events/new">Create Your First Event</Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Event Identity</TableHead>
                  <TableHead>Date & Venue</TableHead>
                  <TableHead>Sales Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const pct =
                    event.totalCapacity > 0
                      ? Math.round(
                          (event.totalSold / event.totalCapacity) * 100,
                        )
                      : 0;

                  return (
                    <TableRow
                      key={event.id}
                      className={`group ${event.status === "PENDING_REVIEW" ? "bg-yellow-500/5 hover:bg-yellow-500/8" : ""}`}
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-xs uppercase">
                            {event.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                            {event.category.replace("_", " ")} •{" "}
                            {event.isMemberOnly ? "Members Only" : "Public"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">
                            {formatDate(event.date)}
                          </span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1">
                            {event.venueName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full max-w-[160px] space-y-1.5">
                          <div className="flex justify-between text-[10px] font-medium">
                            <span>
                              {event.totalSold} / {event.totalCapacity}
                            </span>
                            <span>{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-1" />
                          <p className="text-[10px] font-bold">
                            {formatNaira(event.totalRevenue)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0 ${STATUS_STYLES[event.status]}`}
                        >
                          {event.status === "PENDING_REVIEW" && (
                            <IconClockHour4 size={10} className="mr-1 inline" />
                          )}
                          {event.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <IconDotsVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/a/events/${event.id}`}
                                className="cursor-pointer"
                              >
                                <IconEye /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/a/events/${event.id}/edit`}
                                className="cursor-pointer"
                              >
                                <IconEdit /> Edit Event
                              </Link>
                            </DropdownMenuItem>

                            {(event.status === "DRAFT" ||
                              event.status === "LIVE") && (
                              <DropdownMenuItem
                                onClick={() => handleToggleLive(event)}
                                disabled={togglingId === event.id}
                              >
                                {togglingId === event.id ? (
                                  <Loader />
                                ) : event.status === "LIVE" ? (
                                  <>
                                    <IconBan /> Unpublish Event
                                  </>
                                ) : (
                                  <>
                                    <IconCheck /> Go Live
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => handleDelete(event)}
                              disabled={deletingId === event.id}
                            >
                              <IconTrash />
                              {deletingId === event.id
                                ? "Deleting..."
                                : "Delete Event"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEventsPage;

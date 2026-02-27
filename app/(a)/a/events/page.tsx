// "use client";
// import React, { useEffect, useState } from "react";
// import {
//   IconPlus,
//   IconSearch,
//   IconEye,
//   IconEdit,
//   IconTrash,
//   IconLoader2,
//   IconAlertCircle,
// } from "@tabler/icons-react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { toast } from "sonner";
// import {
//   getAdminEvents,
//   deleteEvent,
//   updateEventStatus,
//   formatNaira,
//   type AdminEventWithStats,
//   type EventStatus,
// } from "@/lib/events-api";
// import { PageHeader } from "@/components/PageHeader";
// import { Input } from "@/components/ui/input";
// import { Field, FieldLabel } from "@/components/ui/field";
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupInput,
// } from "@/components/ui/input-group";
// import { Card, CardContent } from "@/components/ui/card";

// const STATUS_STYLES: Record<EventStatus, string> = {
//   LIVE: "bg-green-500/10 text-green-500",
//   SOLD_OUT: "bg-red-500/10 text-red-500",
//   DRAFT: "bg-muted text-muted-foreground",
//   CANCELLED: "bg-orange-500/10 text-orange-500",
//   ENDED: "bg-muted text-muted-foreground",
// };

// const AdminEventsPage = () => {
//   const [events, setEvents] = useState<AdminEventWithStats[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const [togglingId, setTogglingId] = useState<string | null>(null);

//   const load = async (q = "") => {
//     setLoading(true);
//     try {
//       const res = await getAdminEvents({ search: q || undefined, limit: 50 });
//       setEvents(res.data);
//     } catch {
//       toast.error("Failed to load events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   // Debounced search
//   useEffect(() => {
//     const t = setTimeout(() => load(search), 400);
//     return () => clearTimeout(t);
//   }, [search]);

//   const handleDelete = async (event: AdminEventWithStats) => {
//     if (
//       !confirm(
//         `Delete "${event.title}"? ${event.totalSold > 0 ? "This event has sold tickets — it will be cancelled instead." : ""}`,
//       )
//     )
//       return;
//     setDeletingId(event.id);
//     try {
//       await deleteEvent(event.id);
//       toast.success("Event removed");
//       load(search);
//     } catch {
//       toast.error("Failed to delete event");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const handleToggleLive = async (event: AdminEventWithStats) => {
//     const newStatus: EventStatus = event.status === "LIVE" ? "DRAFT" : "LIVE";
//     setTogglingId(event.id);
//     try {
//       await updateEventStatus(event.id, newStatus);
//       toast.success(
//         `Event ${newStatus === "LIVE" ? "published" : "unpublished"}`,
//       );
//       load(search);
//     } catch {
//       toast.error("Failed to update status");
//     } finally {
//       setTogglingId(null);
//     }
//   };

//   return (
//     <div className="space-y-8">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
//         <PageHeader
//           title="Event Registry"
//           back
//           description={"Manage Experience Inventory"}
//         />
//         <Button asChild className="w-full md:w-auto">
//           <Link href="/a/events/new">
//             <IconPlus /> Create New
//           </Link>
//         </Button>
//       </div>

//       {/* Search */}
//       <Field>
//         <InputGroup>
//           <InputGroupInput id="inline-start-input" placeholder="Search..." />
//           <InputGroupAddon align="inline-start">
//             <IconSearch className="text-muted-foreground" />
//           </InputGroupAddon>
//         </InputGroup>
//       </Field>

//       {/* Table */}
//       <Card>
//         <CardContent>
//           {loading ? (
//             <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
//               <IconLoader2 size={20} className="animate-spin" />
//               <span className="text-xs uppercase tracking-widest">
//                 Loading events…
//               </span>
//             </div>
//           ) : events.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
//               <IconAlertCircle size={32} stroke={1} />
//               <p className="text-xs">No events found</p>
//               <Link href="/a/events/new">
//                 <Button variant="outline">Create Your First Event</Button>
//               </Link>
//             </div>
//           ) : (
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="border-b border-border">
//                   <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
//                     Event Identity
//                   </th>
//                   <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
//                     Date
//                   </th>
//                   <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
//                     Sales Performance
//                   </th>
//                   <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
//                     Status
//                   </th>
//                   <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium text-right">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-border">
//                 {events.map((event) => {
//                   const pct =
//                     event.totalCapacity > 0
//                       ? Math.round(
//                           (event.totalSold / event.totalCapacity) * 100,
//                         )
//                       : 0;
//                   return (
//                     <tr
//                       key={event.id}
//                       className="hover:bg-muted/50 transition-colors group"
//                     >
//                       <td className="p-6">
//                         <p className="text-xs font-bold uppercase mb-1">
//                           {event.title}
//                         </p>
//                         <p className="text-[9px] text-muted-foreground tracking-widest">
//                           {event.category.replace("_", " ")} •{" "}
//                           {event.isMemberOnly ? "Members Only" : "Public"}
//                         </p>
//                       </td>
//                       <td className="p-6">
//                         <p className="text-xs text-foreground/80">
//                           {new Date(event.date).toLocaleDateString("en-NG", {
//                             day: "numeric",
//                             month: "short",
//                             year: "numeric",
//                           })}
//                         </p>
//                         <p className="text-[9px] text-white/40 mt-1">
//                           {event.venueName}
//                         </p>
//                       </td>
//                       <td className="p-6">
//                         <div className="w-full max-w-[140px]">
//                           <div className="flex justify-between text-[9px] uppercase mb-1">
//                             <span className="text-foreground/60">
//                               {event.totalSold} / {event.totalCapacity}
//                             </span>
//                             <span className="font-bold">{pct}%</span>
//                           </div>
//                           <div className="h-1 bg-muted w-full overflow-hidden">
//                             <div
//                               className="h-full bg-foreground transition-all duration-700"
//                               style={{ width: `${pct}%` }}
//                             />
//                           </div>
//                           <p className="text-[10px] font-bold mt-2 text-foreground/80">
//                             {formatNaira(event.totalRevenue)}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="p-6">
//                         <span
//                           className={`text-[9px] uppercase tracking-widest px-2 py-1 font-bold ${STATUS_STYLES[event.status]}`}
//                         >
//                           {event.status.replace("_", " ")}
//                         </span>
//                       </td>
//                       <td className="p-6 text-right">
//                         <div className="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
//                           {(event.status === "DRAFT" ||
//                             event.status === "LIVE") && (
//                             <button
//                               onClick={() => handleToggleLive(event)}
//                               disabled={togglingId === event.id}
//                               className="p-2 hover:bg-muted text-foreground text-[9px] uppercase tracking-widest border border-border disabled:opacity-40"
//                             >
//                               {togglingId === event.id ? (
//                                 <IconLoader2
//                                   size={14}
//                                   className="animate-spin"
//                                 />
//                               ) : event.status === "LIVE" ? (
//                                 "Unpublish"
//                               ) : (
//                                 "Go Live"
//                               )}
//                             </button>
//                           )}
//                           <Link href={`/a/events/${event.id}`}>
//                             <button className="p-2 hover:bg-muted text-foreground">
//                               <IconEye size={16} />
//                             </button>
//                           </Link>
//                           <Link href={`/a/events/${event.id}/edit`}>
//                             <button className="p-2 hover:bg-muted text-foreground">
//                               <IconEdit size={16} />
//                             </button>
//                           </Link>
//                           <button
//                             onClick={() => handleDelete(event)}
//                             disabled={deletingId === event.id}
//                             className="p-2 hover:bg-red-500/20 text-red-500 disabled:opacity-40"
//                           >
//                             {deletingId === event.id ? (
//                               <IconLoader2 size={16} className="animate-spin" />
//                             ) : (
//                               <IconTrash size={16} />
//                             )}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default AdminEventsPage;

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
import { formatDate } from "@/lib/utils";
import { Loader } from "@/components/Loader";

const STATUS_VARIANTS: Record<
  EventStatus,
  "default" | "secondary" | "destructive" | "outline" | "success"
> = {
  LIVE: "success",
  SOLD_OUT: "destructive",
  DRAFT: "secondary",
  CANCELLED: "outline",
  ENDED: "outline",
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

      <Field>
        <InputGroup>
          <InputGroupInput id="inline-start-input" placeholder="Search..." />
          <InputGroupAddon align="inline-start">
            <IconSearch className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </Field>

      <Card className="p-0">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <IconLoader2 size={32} className="animate-spin opacity-20" />
              <span className="text-xs uppercase tracking-widest font-medium">
                Loading events…
              </span>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="bg-muted rounded-full p-4">
                <IconAlertCircle size={32} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No events found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or create a new event.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/a/events/new">Create Your First Event</Link>
              </Button>
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
                    <TableRow key={event.id} className="group">
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
                          // variant={STATUS_VARIANTS[event.status]}
                          className="text-[9px] font-bold uppercase tracking-widest px-2 py-0"
                        >
                          {event.status.replace("_", " ")}
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

"use client";
import { useEffect, useState } from "react";
import {
  IconUsers,
  IconTicket,
  IconCalendarStats,
  IconCurrencyNaira,
  IconDotsVertical,
  IconPlus,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  getAdminStats,
  getAdminEvents,
  formatNaira,
  type AdminStats,
} from "@/lib/events-api";
import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const DashboardPage = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getAdminEvents({ limit: 5 })])
      .then(([s, e]) => {
        setStats(s);
        setRecentEvents(e.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Revenue",
      value: stats ? formatNaira(stats.totalRevenue) : "—",
      icon: <IconCurrencyNaira size={20} />,
    },
    {
      label: "Total Orders",
      value: stats ? String(stats.totalOrders) : "—",
      icon: <IconCalendarStats size={20} />,
    },
    {
      label: "Tickets Sold",
      value: stats ? stats.totalTicketsSold.toLocaleString() : "—",
      icon: <IconTicket size={20} />,
    },
    {
      label: "Live Events",
      value: stats ? String(stats.liveEvents) : "—",
      icon: <IconUsers size={20} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={"Manage your platform, events, tickets and more"}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-2">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardContent>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-muted rounded-md text-muted-foreground">
                  {stat.icon}
                </div>
                {loading && (
                  <IconLoader2
                    size={14}
                    className="animate-spin text-muted-foreground"
                  />
                )}
              </div>
              <div>
                <CardDescription className="text-muted-foreground mb-1">
                  {stat.label}
                </CardDescription>
                <h4 className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </h4>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Events */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <IconLoader2 size={20} className="animate-spin" />
                </div>
              ) : recentEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">
                    No events yet
                  </p>
                  <Link href="/a/events/new">
                    <Button variant="outline">Create First Event</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-0">
                  {recentEvents.map((event) => (
                    <Link href={`/a/events/${event.id}`} key={event.id}>
                      <div className="flex items-center justify-between py-4 border-b border-border last:border-0 hover:bg-muted px-2 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted overflow-hidden shrink-0">
                            {event.coverImage && (
                              <img
                                src={event.coverImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase">
                              {event.title}
                            </p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                              {new Date(event.date).toLocaleDateString(
                                "en-NG",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-[9px] uppercase tracking-widest px-2 py-1 font-bold ${
                              event.status === "LIVE"
                                ? "bg-green-500/10 text-green-500"
                                : event.status === "SOLD_OUT"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {event.status.replace("_", " ")}
                          </span>
                          <IconDotsVertical
                            size={16}
                            className="text-muted-foreground"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {[
                  {
                    label: "Create Event",
                    href: "/a/events/new",
                    desc: "Add a new experience",
                  },
                  {
                    label: "View All Events",
                    href: "/a/events",
                    desc: "Manage your inventory",
                  },
                ].map((action) => (
                  <Button
                    variant={"outline"}
                    className="w-full"
                    key={action.href}
                    asChild
                  >
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </div>

              <Separator className="my-4" />

              {stats && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                    Summary
                  </p>
                  <div className="space-y-3 text-xs">
                    {[
                      { label: "Total Events", value: stats.totalEvents },
                      {
                        label: "Live Now",
                        value: stats.liveEvents,
                        highlight: true,
                      },
                      {
                        label: "Tickets Sold",
                        value: stats.totalTicketsSold.toLocaleString(),
                      },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span
                          className={`font-bold ${s.highlight ? "text-green-500" : ""}`}
                        >
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

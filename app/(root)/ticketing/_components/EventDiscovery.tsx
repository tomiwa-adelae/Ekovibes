"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconFilter,
  IconTicket,
  IconLoader2,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  getPublicEvents,
  type Event,
  type EventCategory,
} from "@/lib/events-api";
import Image from "next/image";
import { DEFAULT_IMAGE } from "@/constants";

type TimelineKey = "tonight" | "weekend" | "next_week";

const TIMELINE_FILTERS: { label: string; key: TimelineKey }[] = [
  { label: "Tonight", key: "tonight" },
  { label: "This Weekend", key: "weekend" },
  { label: "Next Week", key: "next_week" },
];

const VIBE_FILTERS: { label: string; value: EventCategory }[] = [
  { label: "Concert / Music", value: "CONCERT" },
  { label: "Nightlife", value: "NIGHTLIFE" },
  { label: "Private Dining", value: "PRIVATE_DINING" },
  { label: "Art Exhibition", value: "ART_EXHIBITION" },
  { label: "Festival", value: "FESTIVAL" },
  { label: "Wellness", value: "WELLNESS" },
];

function getTimelineDates(key: TimelineKey): {
  dateFrom: string;
  dateTo: string;
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (key === "tonight") {
    const end = new Date(todayStart);
    end.setHours(23, 59, 59, 999);
    return { dateFrom: todayStart.toISOString(), dateTo: end.toISOString() };
  }

  if (key === "weekend") {
    const day = now.getDay(); // 0=Sun, 6=Sat
    const daysToFri = day <= 5 ? 5 - day : 6;
    const fri = new Date(todayStart);
    fri.setDate(todayStart.getDate() + daysToFri);
    const sun = new Date(fri);
    sun.setDate(fri.getDate() + 2);
    sun.setHours(23, 59, 59, 999);
    return { dateFrom: fri.toISOString(), dateTo: sun.toISOString() };
  }

  // next_week: Mon–Sun of next week
  const day = now.getDay();
  const daysToMon = day === 0 ? 1 : 8 - day;
  const mon = new Date(todayStart);
  mon.setDate(todayStart.getDate() + daysToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { dateFrom: mon.toISOString(), dateTo: sun.toISOString() };
}

export const EventDiscovery = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState<EventCategory | null>(
    null,
  );
  const [activeTimeline, setActiveTimeline] = useState<TimelineKey | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchEvents = useCallback(
    async (pageNum: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const timelineDates = activeTimeline
        ? getTimelineDates(activeTimeline)
        : {};

      try {
        const res = await getPublicEvents({
          search: search || undefined,
          category: activeCategory ?? undefined,
          sortBy: sortOrder === "asc" ? "date_asc" : "date_desc",
          ...timelineDates,
          page: pageNum,
          limit: 8,
        });
        setEvents((prev) => (append ? [...prev, ...res.data] : res.data));
        setTotal(res.meta.total);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, activeTimeline, sortOrder, search],
  );

  useEffect(() => {
    setPage(1);
    fetchEvents(1);
  }, [fetchEvents]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchEvents(next, true);
  };

  const handleCategoryToggle = (cat: EventCategory) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  };

  const handleTimelineToggle = (key: TimelineKey) => {
    setActiveTimeline((prev) => (prev === key ? null : key));
  };

  const clearAll = () => {
    setActiveCategory(null);
    setActiveTimeline(null);
    setSearchInput("");
    setSearch("");
  };

  const hasMore = events.length < total;
  const hasActiveFilters = !!(activeCategory || activeTimeline || search);

  return (
    <section className="py-20 bg-background min-h-screen">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filter */}
          <aside className="lg:w-64 shrink-0 space-y-10">
            <div className="sticky top-28">
              <h4 className="text-xs uppercase text-muted-foreground mb-8 flex items-center gap-2">
                <IconFilter size={14} /> Filter By
              </h4>

              <div className="mb-8">
                <p className="text-xs font-bold uppercase mb-4">Timeline</p>
                <div className="space-y-3">
                  {TIMELINE_FILTERS.map((t) => (
                    <label
                      key={t.key}
                      className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-xs uppercase"
                    >
                      <Checkbox
                        checked={activeTimeline === t.key}
                        onCheckedChange={() => handleTimelineToggle(t.key)}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest mb-4">
                  The Vibe
                </p>
                <div className="space-y-3">
                  {VIBE_FILTERS.map((v) => (
                    <label
                      key={v.value}
                      className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground cursor-pointer text-xs uppercase tracking-tighter"
                    >
                      <Checkbox
                        checked={activeCategory === v.value}
                        onCheckedChange={() => handleCategoryToggle(v.value)}
                      />
                      {v.label}
                    </label>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="link"
                  onClick={clearAll}
                  className="text-[10px] uppercase tracking-widest text-muted-foreground p-0 hover:text-foreground"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Main Feed */}
          <div className="grow">
            {/* Search + Sort row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-8">
              <div className="relative w-full sm:max-w-xs">
                <IconSearch
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                />
                <Input
                  type="text"
                  placeholder="Search experiences…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8 pr-8 placeholder:text-muted-foreground/50"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <IconX size={12} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <p className="text-xs text-muted-foreground uppercase hidden sm:block">
                  {loading ? "Loading…" : `${total} Events`}
                </p>
                <Select
                  value={sortOrder}
                  onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc" className="text-xs uppercase">
                      Soonest First
                    </SelectItem>
                    <SelectItem value="desc" className="text-xs uppercase">
                      Latest First
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24 text-muted-foreground/50">
                <IconLoader2 size={24} className="animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-sm text-muted-foreground/50">
                  No experiences match your filters
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAll}
                    className="mt-4 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {events.map((event) => (
                    <Link
                      href={`/${event.slug}`}
                      key={event.id}
                      className="group cursor-pointer block"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-md mb-4 border border-border">
                        <Image
                          width={1000}
                          height={1000}
                          src={event.coverImage || DEFAULT_IMAGE}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-black/80 text-white rounded-md backdrop-blur-md px-3 py-1 text-[9px] font-medium uppercase border border-white/10">
                            {new Date(event.date)
                              .toLocaleDateString("en-NG", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })
                              .toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground uppercase">
                            {event.category.replace(/_/g, " ")} •{" "}
                            {event.city ?? event.venueName}
                          </p>
                          <IconTicket
                            size={14}
                            className="text-muted-foreground/50 group-hover:text-foreground transition-colors"
                          />
                        </div>
                        <h5 className="text-lg font-bold line-clamp-2 uppercase group-hover:underline decoration-white/20 underline-offset-4">
                          {event.title}
                        </h5>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-20 text-center">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="outline"
                      className="rounded-none px-12 py-6 border-border text-muted-foreground hover:text-background hover:bg-foreground uppercase text-[10px] tracking-[0.3em] font-bold transition-all disabled:opacity-40"
                    >
                      {loadingMore ? (
                        <IconLoader2 size={16} className="animate-spin mr-2" />
                      ) : null}
                      Load More Experiences
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

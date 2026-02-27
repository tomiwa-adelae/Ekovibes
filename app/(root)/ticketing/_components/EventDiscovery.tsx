"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  IconFilter,
  IconChevronDown,
  IconTicket,
  IconLoader2,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  getPublicEvents,
  type Event,
  type EventCategory,
} from "@/lib/events-api";

const TIMELINE_FILTERS = [
  "Tonight",
  "This Weekend",
  "Next Week",
  "All Dates",
] as const;
const VIBE_FILTERS: { label: string; value: EventCategory }[] = [
  { label: "Concert / Music", value: "CONCERT" },
  { label: "Nightlife", value: "NIGHTLIFE" },
  { label: "Private Dining", value: "PRIVATE_DINING" },
  { label: "Art Exhibition", value: "ART_EXHIBITION" },
  { label: "Festival", value: "FESTIVAL" },
  { label: "Wellness", value: "WELLNESS" },
];

export const EventDiscovery = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState<EventCategory | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchEvents = useCallback(
    async (pageNum: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await getPublicEvents({
          category: activeCategory ?? undefined,
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
    [activeCategory],
  );

  useEffect(() => {
    setPage(1);
    fetchEvents(1);
  }, [fetchEvents]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchEvents(next, true);
  };

  const handleCategoryToggle = (cat: EventCategory) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  };

  const hasMore = events.length < total;

  return (
    <section className="py-20 bg-background min-h-screen">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filter */}
          <aside className="lg:w-64 shrink-0 space-y-10">
            <div className="sticky top-28">
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-8 flex items-center gap-2">
                <IconFilter size={14} /> Filter By
              </h4>

              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest mb-4">
                  Timeline
                </p>
                <div className="space-y-2">
                  {TIMELINE_FILTERS.map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-xs uppercase tracking-tighter"
                    >
                      <input
                        type="checkbox"
                        className="accent-white bg-transparent border-white/20"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest mb-4">
                  The Vibe
                </p>
                <div className="space-y-2">
                  {VIBE_FILTERS.map((v) => (
                    <label
                      key={v.value}
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground cursor-pointer text-xs uppercase tracking-tighter"
                    >
                      <input
                        type="checkbox"
                        className="accent-white"
                        checked={activeCategory === v.value}
                        onChange={() => handleCategoryToggle(v.value)}
                      />
                      {v.label}
                    </label>
                  ))}
                </div>
              </div>

              {activeCategory && (
                <Button
                  variant="link"
                  onClick={() => setActiveCategory(null)}
                  className="text-[10px] uppercase tracking-widest text-muted-foreground p-0 hover:text-foreground"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Main Feed */}
          <div className="grow">
            <div className="flex justify-between items-center mb-8">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                {loading
                  ? "Loading…"
                  : `Showing ${events.length} of ${total} Events`}
              </p>
              <button
                onClick={() =>
                  setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
                }
                className="flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer hover:text-foreground/60 transition-colors"
              >
                Sort:{" "}
                <span className="text-foreground font-bold">
                  {sortOrder === "asc" ? "Soonest First" : "Latest First"}
                </span>
                <IconChevronDown
                  size={14}
                  className={sortOrder === "desc" ? "rotate-180" : ""}
                />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24 text-muted-foreground/50">
                <IconLoader2 size={24} className="animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
                  No experiences match your filters
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-6">
                  {[...events]
                    .sort((a, b) =>
                      sortOrder === "asc"
                        ? new Date(a.date).getTime() -
                          new Date(b.date).getTime()
                        : new Date(b.date).getTime() -
                          new Date(a.date).getTime(),
                    )
                    .map((event) => (
                      <Link
                        href={`/${event.slug}`}
                        key={event.id}
                        className="group cursor-pointer block"
                      >
                        <div className="relative aspect-square overflow-hidden mb-4 border border-border">
                          {event.coverImage ? (
                            <img
                              src={event.coverImage}
                              alt={event.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-card" />
                          )}
                          <div className="absolute bottom-4 left-4">
                            <div className="bg-black/80 backdrop-blur-md px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-white/10">
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
                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                              {event.category.replace(/_/g, " ")} •{" "}
                              {event.city ?? event.venueName}
                            </p>
                            <IconTicket
                              size={14}
                              className="text-muted-foreground/50 group-hover:text-foreground transition-colors"
                            />
                          </div>
                          <h5 className="text-lg font-bold uppercase tracking-tight group-hover:underline decoration-white/20 underline-offset-4">
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

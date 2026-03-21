"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  IconBuilding,
  IconLoader2,
  IconMapPin,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getVenues,
  VENUE_CATEGORIES,
  VENUE_CATEGORY_LABELS,
  type Venue,
  type VenueCategory,
} from "@/lib/reservations-api";

const MODE_LABEL: Record<string, string> = {
  INSTANT: "Instant Book",
  REQUEST: "Request to Book",
};

export default function ReservationsPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<VenueCategory | "">("");
  const [city, setCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 18;

  const load = useCallback(() => {
    setLoading(true);
    getVenues({
      category: category || undefined,
      city: city || undefined,
      page,
      limit: LIMIT,
    })
      .then((res) => {
        setVenues(res.data);
        setTotal(res.meta.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, city, page]);

  useEffect(() => {
    setPage(1);
  }, [category, city]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCity(cityInput.trim());
  };

  const clearFilters = () => {
    setCategory("");
    setCity("");
    setCityInput("");
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b bg-muted/30">
        <div className="container py-12">
          <p className="text-xs uppercase text-muted-foreground mb-2">
            The Black Book
          </p>
          <h1 className="text-4xl font-bold uppercase mb-2">
            Reserve Your Table
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            Exclusive access to Lagos' finest restaurants, clubs, lounges and
            dining experiences — curated for Ekovibe members.
          </p>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Search + filters */}
        <div className="space-y-4">
          {/* City search */}
          <form onSubmit={handleCitySearch} className="flex gap-2">
            <div className="relative flex-1">
              <IconSearch
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-8"
                placeholder="Search by city…"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
            {city && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCity("");
                  setCityInput("");
                }}
              >
                <IconX size={14} />
              </Button>
            )}
          </form>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategory("")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                !category
                  ? "bg-primary text-background border-foreground"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              All
            </button>
            {VENUE_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c === category ? "" : c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  category === c
                    ? "bg-foreground text-background border-foreground"
                    : "border-border hover:border-foreground/40"
                }`}
              >
                {VENUE_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>

          {/* Active filter indicator */}
          {(category || city) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Showing {total} result{total !== 1 ? "s" : ""}
              </span>
              <button
                onClick={clearFilters}
                className="text-foreground hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-56">
            <IconLoader2
              className="animate-spin text-muted-foreground"
              size={28}
            />
          </div>
        ) : venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-3 border rounded-xl">
            <IconBuilding size={40} className="text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">
              No venues available matching your filters.
            </p>
            {(category || city) && (
              <Button size="sm" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <Link
                key={venue.id}
                href={`/reservations/${venue.slug}`}
                className="group border rounded-xl overflow-hidden bg-card hover:border-foreground/20 transition-colors"
              >
                {venue.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={venue.coverImage}
                    alt={venue.name}
                    className="w-full aspect-video object-cover group-hover:brightness-90 transition-all"
                  />
                ) : (
                  <div className="w-full aspect-video bg-muted flex items-center justify-center">
                    <IconBuilding
                      size={32}
                      className="text-muted-foreground/30"
                    />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm leading-tight">
                      {venue.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider shrink-0"
                    >
                      {VENUE_CATEGORY_LABELS[venue.category]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconMapPin size={11} />
                    {venue.city}
                  </div>
                  {venue.bookingMode && (
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {MODE_LABEL[venue.bookingMode]}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

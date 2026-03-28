"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { IconLoader2, IconSearch, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPublishedPosts,
  getFeaturedPost,
  POST_CATEGORIES,
  type PostSummary,
  type PostCategory,
} from "@/lib/media-api";
import { formatDate } from "@/lib/utils";
import { DEFAULT_IMAGE } from "@/constants";
import { PageHeader } from "@/components/PageHeader";

function VibeReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTag = searchParams.get("tag") ?? "";

  const [featured, setFeatured] = useState<PostSummary | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PostCategory | "">("");
  const [tag, setTag] = useState(initialTag);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  // Load featured post once
  useEffect(() => {
    getFeaturedPost().then(setFeatured).catch(() => null);
  }, []);

  const load = useCallback(
    async (currentPage = 1, reset = false) => {
      setLoading(true);
      try {
        const res = await getPublishedPosts({
          page: currentPage,
          limit: LIMIT,
          search: search || undefined,
          category: category || undefined,
          tag: tag || undefined,
        });
        setPosts((prev) => (reset ? res.data : [...prev, ...res.data]));
        setTotal(res.total);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [search, category, tag],
  );

  useEffect(() => {
    setPage(1);
    const t = setTimeout(() => load(1, true), 300);
    return () => clearTimeout(t);
  }, [search, category, tag, load]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, false);
  };

  const clearTag = () => {
    setTag("");
    router.replace("/media");
  };

  const hasMore = posts.length < total;
  const isFiltered = !!search || !!category || !!tag;

  return (
    <main className="container py-12 space-y-10">
      {/* Header */}
      <PageHeader
        back
        title="Vibe Report"
        description={"News, lifestyle, and culture from the Ekovibe world."}
      />

      {/* Featured hero — only shown when no active filter */}
      {!isFiltered && featured && (
        <Link
          href={`/media/${featured.slug}`}
          className="group relative flex flex-col sm:flex-row rounded-xl border overflow-hidden hover:border-primary/50 transition-colors"
        >
          <div className="sm:w-1/2 aspect-video sm:aspect-auto overflow-hidden bg-muted shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.coverImage || DEFAULT_IMAGE}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest">
                Featured
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {featured.category.toLowerCase()}
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug group-hover:text-primary transition-colors">
              {featured.title}
            </h2>
            {featured.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {featured.excerpt}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              By {featured.author.firstName} {featured.author.lastName}
              {featured.publishedAt && ` · ${formatDate(featured.publishedAt)}`}
            </p>
          </div>
        </Link>
      )}

      {/* Active tag filter banner */}
      {tag && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtering by tag:</span>
          <Badge variant="secondary" className="gap-1">
            #{tag}
            <button onClick={clearTag} className="ml-1 opacity-60 hover:opacity-100">
              <IconX size={11} />
            </button>
          </Badge>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search articles…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={category === "" ? "default" : "outline"}
            onClick={() => setCategory("")}
          >
            All
          </Button>
          {POST_CATEGORIES.map((c) => (
            <Button
              key={c.value}
              size="sm"
              variant={category === c.value ? "default" : "outline"}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading && posts.length === 0 ? (
        <div className="flex items-center justify-center py-32">
          <IconLoader2 size={32} className="animate-spin opacity-20" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-32 text-muted-foreground">
          No articles found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/media/${post.slug}`}
                className="group flex flex-col rounded-xl border overflow-hidden hover:border-primary/50 transition-colors"
              >
                {/* Cover */}
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage || DEFAULT_IMAGE}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {post.category.toLowerCase()}
                    </Badge>
                    {post.publishedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                  </div>

                  <h2 className="font-semibold hover:underline text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground">
                      By {post.author.firstName} {post.author.lastName}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((t) => (
                          <button
                            key={t}
                            onClick={(e) => {
                              e.preventDefault();
                              setTag(t);
                              router.replace(`/media?tag=${encodeURIComponent(t)}`);
                            }}
                          >
                            <Badge
                              variant="secondary"
                              className="text-[10px] hover:bg-secondary/80 transition-colors"
                            >
                              #{t}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading ? (
                  <IconLoader2 size={16} className="animate-spin mr-2" />
                ) : null}
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function VibeReportPage() {
  return (
    <Suspense>
      <VibeReportContent />
    </Suspense>
  );
}

export default function Page() {
  return <Suspense><VibeReportPage /></Suspense>;
}

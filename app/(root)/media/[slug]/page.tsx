import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { IconArrowLeft, IconCalendar, IconClock } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RenderDescription } from "@/components/text-editor/RenderDescription";
import {
  getPublishedPostBySlug,
  getPublishedPosts,
  type Post,
  type PostSummary,
} from "@/lib/media-api";
import { formatDate } from "@/lib/utils";
import { DEFAULT_IMAGE } from "@/constants";
import { ShareButtons } from "./_components/ShareButtons";
import { PageHeader } from "@/components/PageHeader";

// ── Reading time ─────────────────────────────────────────────────────────────

function extractTextFromTipTap(json: string): string {
  try {
    const doc = JSON.parse(json);
    const parts: string[] = [];
    function walk(node: any) {
      if (node.type === "text" && node.text) parts.push(node.text);
      if (node.content) node.content.forEach(walk);
    }
    walk(doc);
    return parts.join(" ");
  } catch {
    return json;
  }
}

function readingTime(body: string): number {
  const text = extractTextFromTipTap(body);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPublishedPostBySlug(slug);
    const description =
      post.excerpt ?? `Read ${post.title} on Ekovibe Vibe Report.`;
    const image = post.coverImage ?? DEFAULT_IMAGE;
    return {
      title: `${post.title} | Vibe Report`,
      description,
      openGraph: {
        title: post.title,
        description,
        images: [{ url: image }],
        type: "article",
        publishedTime: post.publishedAt ?? undefined,
        authors: [`${post.author.firstName} ${post.author.lastName}`],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: [image],
      },
    };
  } catch {
    return { title: "Article | Vibe Report" };
  }
}

// ── Related articles ──────────────────────────────────────────────────────────

async function getRelatedPosts(post: Post): Promise<PostSummary[]> {
  try {
    const res = await getPublishedPosts({
      category: post.category,
      exclude: post.slug,
      limit: 3,
    });
    return res.data;
  } catch {
    return [];
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post: Post;
  try {
    post = await getPublishedPostBySlug(slug);
  } catch {
    notFound();
  }

  const [related] = await Promise.all([getRelatedPosts(post!)]);
  const minutes = readingTime(post!.body);

  return (
    <main className="py-12">
      <div className="container max-w-3xl">
        <PageHeader back title={post!.title} />
        {/* Cover */}
        {post!.coverImage && (
          <div className="w-full aspect-video rounded-xl overflow-hidden mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post!.coverImage}
              alt={post!.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="outline" className="capitalize">
            {post!.category.toLowerCase()}
          </Badge>
          {post!.publishedAt && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <IconCalendar size={13} />
              {formatDate(post!.publishedAt)}
            </span>
          )}
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <IconClock size={13} />
            {minutes} min read
          </span>
          <span className="text-sm text-muted-foreground">
            By {post!.author.firstName} {post!.author.lastName}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {post!.title}
        </h1>

        {/* Excerpt */}
        {post!.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary pl-4">
            {post!.excerpt}
          </p>
        )}

        {/* Tags */}
        {post!.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post!.tags.map((tag) => (
              <Link key={tag} href={`/media?tag=${encodeURIComponent(tag)}`}>
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Body */}
        <RenderDescription json={post!.body} className="text-base" />

        {/* Share + footer */}
        <div className="mt-12 pt-8 border-t space-y-6">
          <ShareButtons title={post!.title} />

          <Button asChild variant="outline">
            <Link href="/media">
              <IconArrowLeft size={15} className="mr-1" /> More articles
            </Link>
          </Button>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-16 pt-8 border-t">
            <h2 className="text-lg font-semibold mb-5">
              More from Vibe Report
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/media/${r.slug}`}
                  className="group flex flex-col rounded-xl border overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.coverImage || DEFAULT_IMAGE}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {r.category.toLowerCase()}
                    </Badge>
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    {r.publishedAt && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(r.publishedAt)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

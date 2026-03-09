"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IconLoader2, IconArrowLeft, IconCalendar } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RenderDescription } from "@/components/text-editor/RenderDescription";
import { getPublishedPostBySlug, type Post } from "@/lib/media-api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getPublishedPostBySlug(slug)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <IconLoader2 size={32} className="animate-spin opacity-20" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Article not found</h1>
        <p className="text-muted-foreground">
          This article may have been removed or the link is incorrect.
        </p>
        <Button asChild variant="outline">
          <Link href="/media">
            <IconArrowLeft size={15} className="mr-1" /> Back to Vibe Report
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="py-12">
      <div className="container">
        <PageHeader back title={post.title} />

        {/* Cover */}
        {post.coverImage && (
          <div className="w-full aspect-video rounded-xl overflow-hidden mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="outline" className="capitalize">
            {post.category.toLowerCase()}
          </Badge>
          {post.publishedAt && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <IconCalendar size={13} />
              {formatDate(post.publishedAt)}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            By {post.author.firstName} {post.author.lastName}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Body — rendered via TipTap HTML generator */}
        <RenderDescription json={post.body} className="text-base" />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t">
          <Button asChild variant="outline">
            <Link href="/media">
              <IconArrowLeft size={15} className="mr-1" /> More articles
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

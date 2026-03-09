"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconLoader2,
  IconDotsVertical,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PageHeader } from "@/components/PageHeader";
import { cn, formatDate } from "@/lib/utils";
import {
  getAdminPosts,
  deletePost,
  publishPost,
  unpublishPost,
  type Post,
  type PostStatus,
} from "@/lib/media-api";

const STATUS_STYLES: Record<PostStatus, string> = {
  PUBLISHED: "bg-green-500/10 text-green-500",
  DRAFT: "bg-muted text-muted-foreground",
};

export default function AdminMediaPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "">("");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminPosts({
        search: search || undefined,
        status: statusFilter || undefined,
        limit: 50,
      });
      setPosts(res.data);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handlePublish = async (post: Post) => {
    setActionId(post.id);
    try {
      const updated = await (post.status === "PUBLISHED"
        ? unpublishPost(post.id)
        : publishPost(post.id));
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(
        post.status === "PUBLISHED" ? "Post unpublished" : "Post published",
      );
    } catch {
      toast.error("Action failed");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setActionId(id);
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setActionId(null);
    }
  };

  const STATUS_BUTTONS: { label: string; value: PostStatus | "" }[] = [
    { label: "All", value: "" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Drafts", value: "DRAFT" },
  ];

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-2 md:flex-row flex-col md:items-center">
        <PageHeader
          back
          title="CMS / Media"
          description="Manage Vibe Report articles and blog posts"
        />
        <Button className="w-full md:w-auto" asChild>
          <Link href="/a/media/new">
            <IconPlus size={16} />
            New Post
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="border-b space-y-4">
          <CardTitle>All Posts</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <IconSearch
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search posts…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {STATUS_BUTTONS.map((btn) => (
                <Button
                  key={btn.value}
                  size="sm"
                  variant={statusFilter === btn.value ? "default" : "outline"}
                  onClick={() => setStatusFilter(btn.value)}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <IconLoader2 size={28} className="animate-spin opacity-20" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No posts found.{" "}
              <Link href="/a/media/new" className="underline">
                Create your first post
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      <Link
                        href={`/a/media/${post.id}`}
                        className="hover:underline"
                      >
                        {post.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {post.category.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          STATUS_STYLES[post.status],
                        )}
                      >
                        {post.status === "PUBLISHED" ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {post.author.firstName} {post.author.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={actionId === post.id}
                          >
                            {actionId === post.id ? (
                              <IconLoader2 size={14} className="animate-spin" />
                            ) : (
                              <IconDotsVertical size={14} />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/a/media/${post.id}`}>
                              <IconEdit size={14} className="mr-2" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePublish(post)}>
                            {post.status === "PUBLISHED" ? (
                              <>
                                <IconEyeOff size={14} className="mr-2" />{" "}
                                Unpublish
                              </>
                            ) : (
                              <>
                                <IconEye size={14} className="mr-2" /> Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(post.id)}
                          >
                            <IconTrash size={14} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

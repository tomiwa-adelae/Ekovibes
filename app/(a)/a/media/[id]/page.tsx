"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/PageHeader";
import { Loader } from "@/components/Loader";
import { RichTextEditor } from "@/components/text-editor/Editor";
import { RenderDescription } from "@/components/text-editor/RenderDescription";
import {
  getAdminPostById,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
  uploadPostCover,
  POST_CATEGORIES,
  type Post,
  type PostCategory,
} from "@/lib/media-api";
import { cn, formatDate } from "@/lib/utils";

// ── Zod schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().optional(),
  body: z.string().min(10, "Content is required"),
  category: z.enum(["NEWS", "BLOG", "LIFESTYLE", "MUSIC", "EVENTS", "OTHER"]),
  tags: z.string().optional(),
  coverImage: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

// ── Cover image component ─────────────────────────────────────────────────────

function CoverImageField({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PNG, JPG, or WEBP files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadPostCover(file);
      onChange(url);
    } catch {
      toast.error("Cover image upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="relative group rounded-lg overflow-hidden border aspect-video w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <IconLoader2 size={14} className="animate-spin" />
            ) : (
              "Replace"
            )}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="h-8 w-8"
            onClick={() => onChange(null)}
          >
            <IconX size={14} />
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    );
  }

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg aspect-video w-full flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20 bg-muted/20 hover:border-primary/40 hover:bg-muted/40",
        )}
      >
        {uploading ? (
          <>
            <IconLoader2
              size={28}
              className="animate-spin text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <IconPhoto size={32} className="text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Upload cover image</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP · Max 10 MB
              </p>
            </div>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      excerpt: "",
      body: "",
      category: "OTHER",
      tags: "",
      coverImage: null,
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    getAdminPostById(id)
      .then((p) => {
        setPost(p);
        form.reset({
          title: p.title,
          excerpt: p.excerpt ?? "",
          body: p.body,
          category: p.category,
          tags: p.tags.join(", "),
          coverImage: p.coverImage ?? null,
        });
      })
      .catch(() => toast.error("Failed to load post"))
      .finally(() => setFetching(false));
  }, [id, form]);

  const handleSave = async (values: FormValues) => {
    setSaving(true);
    try {
      const updated = await updatePost(id, {
        title: values.title,
        body: values.body,
        excerpt: values.excerpt || undefined,
        coverImage: values.coverImage ?? null,
        category: values.category as PostCategory,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      });
      setPost(updated);
      toast.success("Post updated");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!post) return;
    setPublishing(true);
    try {
      // Save current form state first
      const values = form.getValues();
      await updatePost(id, {
        title: values.title,
        body: values.body,
        excerpt: values.excerpt || undefined,
        coverImage: values.coverImage ?? null,
        category: values.category as PostCategory,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      });
      const updated = await (post.status === "PUBLISHED"
        ? unpublishPost(id)
        : publishPost(id));
      setPost(updated);
      toast.success(
        post.status === "PUBLISHED" ? "Post unpublished" : "Post published!",
      );
    } catch {
      toast.error("Action failed");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(id);
      toast.success("Post deleted");
      router.push("/a/media");
    } catch {
      toast.error("Failed to delete post");
      setDeleting(false);
    }
  };

  const parsedTags = watchedValues.tags
    ? watchedValues.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <IconLoader2 size={32} className="animate-spin opacity-20" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <Form {...form}>
        <form className="space-y-6">
          <div className="flex items-start justify-between gap-2 md:flex-row flex-col md:items-center">
            <PageHeader
              back
              title={post.title}
              description={
                <span className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={
                      post.status === "PUBLISHED"
                        ? "border-green-500 text-green-500"
                        : ""
                    }
                  >
                    {post.status === "PUBLISHED" ? "Published" : "Draft"}
                  </Badge>
                  {post.publishedAt && (
                    <span className="text-muted-foreground text-xs">
                      · Published {formatDate(post.publishedAt)}
                    </span>
                  )}
                  <span className="text-muted-foreground text-xs">
                    · Slug: <span className="font-mono">{post.slug}</span>
                  </span>
                </span>
              }
            />
            <div className="flex w-full md:w-auto gap-2">
              <Button
                className="flex-1"
                type="button"
                variant="outline"
                onClick={() => setPreviewOpen(true)}
              >
                <IconEye size={15} className="mr-1.5" /> Preview
              </Button>
              <Button
                className="flex-1"
                type="button"
                variant="outline"
                onClick={handlePublishToggle}
                disabled={publishing}
              >
                {publishing ? (
                  <Loader
                    text={
                      post.status === "PUBLISHED"
                        ? "Unpublishing…"
                        : "Publishing…"
                    }
                  />
                ) : post.status === "PUBLISHED" ? (
                  <>
                    <IconEyeOff size={15} className="mr-1.5" /> Unpublish
                  </>
                ) : (
                  <>
                    <IconEye size={15} className="mr-1.5" /> Publish
                  </>
                )}
              </Button>
              <Button
                className="flex-1"
                type="button"
                onClick={form.handleSubmit(handleSave)}
                disabled={saving || publishing}
              >
                {saving ? <Loader text="Saving…" /> : "Save Changes"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <IconLoader2 size={15} className="animate-spin" />
                    ) : (
                      <IconTrash size={15} />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{post.title}". This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* ── Main content ── */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Article title…"
                            className="text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="A short summary shown in listings…"
                            rows={2}
                          />
                        </FormControl>
                        <FormDescription>
                          Shown on the listing page and in social previews.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body *</FormLabel>
                        <FormControl>
                          <RichTextEditor field={field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-3">
              {/* Cover */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Cover Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <Controller
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <CoverImageField
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {POST_CATEGORIES.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="music, lagos, nightlife"
                          />
                        </FormControl>
                        <FormDescription>Comma-separated</FormDescription>
                        {parsedTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {parsedTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>
                      Slug:{" "}
                      <span className="font-mono text-foreground">
                        {post.slug}
                      </span>
                    </div>
                    <div>
                      Author: {post.author.firstName} {post.author.lastName}
                    </div>
                    <div>Created: {formatDate(post.createdAt)}</div>
                    {post.publishedAt && (
                      <div>Published: {formatDate(post.publishedAt)}</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {post.status === "DRAFT" ? (
                  <Button
                    type="button"
                    onClick={handlePublishToggle}
                    disabled={publishing}
                    className="w-full"
                  >
                    {publishing ? (
                      <Loader text="Publishing…" />
                    ) : (
                      <>
                        <IconEye size={15} className="mr-1.5" /> Publish Now
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePublishToggle}
                    disabled={publishing}
                    className="w-full"
                  >
                    {publishing ? (
                      <Loader text="Unpublishing…" />
                    ) : (
                      <>
                        <IconEyeOff size={15} className="mr-1.5" /> Unpublish
                      </>
                    )}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={form.handleSubmit(handleSave)}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? <Loader text="Saving…" /> : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>

      {/* ── Preview Dialog ── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconEye size={16} /> Article Preview
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {watchedValues.coverImage && (
              <div className="w-full aspect-video rounded-lg overflow-hidden mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={watchedValues.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className="capitalize text-xs">
                {(watchedValues.category ?? "OTHER").toLowerCase()}
              </Badge>
              <Badge
                variant="outline"
                className={
                  post.status === "PUBLISHED"
                    ? "border-green-500 text-green-500 text-xs"
                    : "text-xs"
                }
              >
                {post.status === "PUBLISHED" ? "Published" : "Draft"}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold mb-3 leading-tight">
              {watchedValues.title || (
                <span className="text-muted-foreground italic">Untitled</span>
              )}
            </h1>

            {watchedValues.excerpt && (
              <p className="text-base text-muted-foreground border-l-4 border-primary pl-4 mb-5 italic">
                {watchedValues.excerpt}
              </p>
            )}

            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {parsedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator className="mb-5" />

            {watchedValues.body ? (
              <RenderDescription json={watchedValues.body} />
            ) : (
              <p className="text-muted-foreground italic text-sm">
                No content yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

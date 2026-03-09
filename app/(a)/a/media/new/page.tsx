"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { IconPhoto, IconX, IconEye, IconLoader2 } from "@tabler/icons-react";
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
import { PageHeader } from "@/components/PageHeader";
import { Loader } from "@/components/Loader";
import { RichTextEditor } from "@/components/text-editor/Editor";
import { RenderDescription } from "@/components/text-editor/RenderDescription";
import {
  createPost,
  publishPost,
  uploadPostCover,
  POST_CATEGORIES,
  type PostCategory,
} from "@/lib/media-api";
import { cn } from "@/lib/utils";

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

// ── Cover image drag-drop component ──────────────────────────────────────────

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

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
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

  const handleSaveDraft = async (values: FormValues) => {
    setSaving(true);
    try {
      const post = await createPost({
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
      toast.success("Post saved as draft");
      router.push(`/a/media/${post.id}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (values: FormValues) => {
    setPublishing(true);
    try {
      const post = await createPost({
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
      await publishPost(post.id);
      toast.success("Post published!");
      router.push(`/a/media`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to publish post");
    } finally {
      setPublishing(false);
    }
  };

  const parsedTags = watchedValues.tags
    ? watchedValues.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <>
      <Form {...form}>
        <form className="space-y-6">
          <div className="flex items-start justify-between gap-2 md:flex-row flex-col md:items-center">
            <PageHeader
              back
              title="New Post"
              description="Create a new Vibe Report article"
            />
            <div className="flex w-full md:w-auto gap-2">
              <Button
                className="flex-1"
                type="button"
                variant="outline"
                onClick={() => setPreviewOpen(true)}
                disabled={!watchedValues.title}
              >
                <IconEye size={15} className="mr-1.5" /> Preview
              </Button>
              <Button
                className="flex-1"
                type="button"
                variant="outline"
                onClick={form.handleSubmit(handleSaveDraft)}
                disabled={saving || publishing}
              >
                {saving ? <Loader text="Saving…" /> : "Save Draft"}
              </Button>
              <Button
                className="flex-1"
                type="button"
                onClick={form.handleSubmit(handlePublish)}
                disabled={saving || publishing}
              >
                {publishing ? <Loader text="Publishing…" /> : "Publish"}
              </Button>
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
                            placeholder="e.g. Lagos' Best Afrobeats Events This December"
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
                            placeholder="A short summary displayed in listings and previews…"
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
              {/* Cover image */}
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
                            placeholder="music, lagos, afrobeats"
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
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={form.handleSubmit(handlePublish)}
                  disabled={saving || publishing}
                  className="w-full"
                >
                  {publishing ? <Loader text="Publishing…" /> : "Publish Now"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={form.handleSubmit(handleSaveDraft)}
                  disabled={saving || publishing}
                  className="w-full"
                >
                  {saving ? <Loader text="Saving…" /> : "Save as Draft"}
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
              <IconEye size={16} />
              Article Preview
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {/* Cover */}
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

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className="capitalize text-xs">
                {(watchedValues.category ?? "OTHER").toLowerCase()}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-3 leading-tight">
              {watchedValues.title || (
                <span className="text-muted-foreground italic">
                  No title yet…
                </span>
              )}
            </h1>

            {/* Excerpt */}
            {watchedValues.excerpt && (
              <p className="text-base text-muted-foreground border-l-4 border-primary pl-4 mb-5 italic">
                {watchedValues.excerpt}
              </p>
            )}

            {/* Tags */}
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

            {/* Body */}
            {watchedValues.body ? (
              <RenderDescription json={watchedValues.body} />
            ) : (
              <p className="text-muted-foreground italic text-sm">
                Start writing in the body to see a preview here.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

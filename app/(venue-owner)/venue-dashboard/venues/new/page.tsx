"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconPhoto, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  applyVenue,
  uploadVenueCover,
  VENUE_CATEGORIES,
  VENUE_CATEGORY_LABELS,
  type VenueCategory,
  type BookingMode,
} from "@/lib/reservations-api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as RPNInput from "react-phone-number-input";
import {
  PhoneInput,
  CountrySelect,
  FlagComponent,
} from "@/components/PhoneNumberInput";

const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  category: z.enum(VENUE_CATEGORIES as [VenueCategory, ...VenueCategory[]], {
    error: "Please select a category",
  }),
  bookingMode: z.enum(["REQUEST", "INSTANT"] as const),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(""), z.email("Invalid email address")]).optional(),
  instagram: z.string().optional(),
  website: z.union([z.literal(""), z.url("Must be a valid URL")]).optional(),
});

type VenueFormValues = z.infer<typeof venueSchema>;

export default function ApplyVenuePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PNG, JPG, JPEG, or WEBP files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setCoverFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveCover = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setCoverFile(null);
    setPreviewUrl("");
  };

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: "",
      category: undefined,
      bookingMode: "REQUEST",
      address: "",
      city: "",
      state: "",
      description: "",
      phone: "",
      email: "",
      instagram: "",
      website: "",
    },
  });

  const handleSubmit = async (values: VenueFormValues) => {
    setSubmitting(true);
    try {
      let coverImageUrl: string | undefined;
      if (coverFile) {
        toast.loading("Uploading cover image…", { id: "cover-upload" });
        try {
          coverImageUrl = await uploadVenueCover(coverFile);
          toast.dismiss("cover-upload");
        } catch {
          toast.dismiss("cover-upload");
          toast.error("Cover image upload failed. Try again.");
          setSubmitting(false);
          return;
        }
      }
      const venue = await applyVenue({
        name: values.name,
        category: values.category,
        bookingMode: values.bookingMode,
        address: values.address,
        city: values.city,
        state: values.state || undefined,
        description: values.description || undefined,
        coverImage: coverImageUrl,
        phone: values.phone || undefined,
        email: values.email || undefined,
        instagram: values.instagram || undefined,
        website: values.website || undefined,
      });
      toast.success("Venue submitted for review!");
      router.push(`/venue-dashboard/venues/${venue.slug}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to submit venue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        back
        title="List a Venue"
        description="Submit your venue for review. Our team will approve it before it goes live."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Venue Name <span className="text-red-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Marble Lagos"
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category <span className="text-red-400">*</span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VENUE_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {VENUE_CATEGORY_LABELS[c]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The category of the venue
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Booking mode */}
                <FormField
                  control={form.control}
                  name="bookingMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Mode</FormLabel>
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
                          <SelectItem value="REQUEST">
                            Request to Book (you approve)
                          </SelectItem>
                          <SelectItem value="INSTANT">Instant Book</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Instant Book lets guests reserve without your manual
                        approval.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <div className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Address <span className="text-red-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="12 Adeola Odeku, Victoria Island"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* City */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        City <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Lagos" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* State */}
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        State{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Lagos State" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <div className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Description{" "}
                          <span className="text-muted-foreground font-normal">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Tell guests what makes your venue special…"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Cover image */}
                <div className="sm:col-span-2 space-y-1.5">
                  <p className="text-sm font-medium">
                    Cover Image{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </p>
                  {previewUrl ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFile(file);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/20 bg-muted/30"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <IconPhoto size={40} className="text-muted-foreground" />
                        <p className="text-sm font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG or WEBP · Max 10 MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFile(e.target.files[0])
                    }
                  />
                </div>

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <RPNInput.default
                          className="flex rounded-md shadow-xs"
                          international
                          flagComponent={FlagComponent}
                          countrySelectComponent={CountrySelect}
                          inputComponent={PhoneInput}
                          placeholder="+2348012345679"
                          value={field.value}
                          onChange={(value) => field.onChange(value ?? "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="hello@yourvenue.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Instagram */}
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Instagram{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="@handle" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Website */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Website{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-6 flex gap-3">
                <Button variant="outline" asChild>
                  <Link href="/venue-dashboard/venues">Cancel</Link>
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <IconLoader2 size={14} className="animate-spin mr-1" />
                  )}
                  Submit for Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      <p className="text-xs text-muted-foreground">
        Once submitted, our team will review your listing within 1–3 business
        days. You&apos;ll be notified by email when it&apos;s approved.
      </p>
    </main>
  );
}

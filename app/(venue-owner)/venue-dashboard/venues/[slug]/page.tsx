"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconLoader2,
  IconPlus,
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
  IconCalendarOff,
  IconPhoto,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as RPNInput from "react-phone-number-input";
import {
  PhoneInput,
  CountrySelect,
  FlagComponent,
} from "@/components/PhoneNumberInput";
import { PageHeader } from "@/components/PageHeader";
import {
  getMyVenueBySlug,
  updateMyVenue,
  uploadVenueCover,
  updateVenueImages,
  addSpace,
  updateSpace,
  removeSpace,
  setOperatingHours,
  addSession,
  updateSession,
  removeSession,
  blockDate,
  unblockDate,
  setPolicy,
  VENUE_CATEGORY_LABELS,
  VENUE_CATEGORIES,
  SPACE_TYPE_LABELS,
  DAYS_OF_WEEK,
  formatNaira,
  type Venue,
  type VenueSpace,
  type VenueSession,
  type VenueBlockedDate,
  type VenueCategory,
  type BookingMode,
  type SpaceType,
  type DayOfWeek,
  type DepositType,
} from "@/lib/reservations-api";
import { formatPhoneNumber } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const STATUS_BADGE: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-blue-500/10 text-blue-400",
  REJECTED: "bg-red-500/10 text-red-400",
  LIVE: "bg-green-500/10 text-green-500",
  SUSPENDED: "bg-muted text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  LIVE: "Live",
  SUSPENDED: "Suspended",
};

const SPACE_TYPES: SpaceType[] = [
  "TABLE",
  "SECTION",
  "PRIVATE_ROOM",
  "BAR_SEATING",
  "OUTDOOR",
];

const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

// ─── Info Tab ─────────────────────────────────────────────────────────────────

const infoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.enum(VENUE_CATEGORIES as [VenueCategory, ...VenueCategory[]]),
  bookingMode: z.enum(["REQUEST", "INSTANT"] as const),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(""), z.email("Invalid email")]).optional(),
  instagram: z.string().optional(),
  website: z.union([z.literal(""), z.url("Invalid URL")]).optional(),
});

type InfoValues = z.infer<typeof infoSchema>;

function InfoTab({
  venue,
  onSaved,
}: {
  venue: Venue;
  onSaved: (newSlug: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cover image upload state
  const [isDragging, setIsDragging] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(venue.coverImage ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InfoValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: venue.name,
      description: venue.description ?? "",
      category: venue.category,
      bookingMode: venue.bookingMode,
      address: venue.address,
      city: venue.city,
      state: venue.state ?? "",
      phone: venue.phone ?? "",
      email: venue.email ?? "",
      instagram: venue.instagram ?? "",
      website: venue.website ?? "",
    },
  });

  const handleFile = (file: File) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PNG, JPG or WEBP supported.");
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

  const handleCancel = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setCoverFile(null);
    setPreviewUrl(venue.coverImage ?? "");
    form.reset();
    setEditing(false);
  };

  const handleSave = async (values: InfoValues) => {
    setSaving(true);
    try {
      let coverImageUrl: string | undefined;
      if (coverFile) {
        toast.loading("Uploading cover image…", { id: "cover-upload" });
        try {
          coverImageUrl = await uploadVenueCover(coverFile);
          toast.dismiss("cover-upload");
        } catch {
          toast.dismiss("cover-upload");
          toast.error("Cover image upload failed.");
          setSaving(false);
          return;
        }
      } else {
        coverImageUrl = previewUrl || undefined;
      }

      const updated = await updateMyVenue(venue.slug, {
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
      toast.success("Venue updated.");
      setCoverFile(null);
      setEditing(false);
      onSaved(updated.slug);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <IconPencil /> Edit
          </Button>
        </div>
        {venue.coverImage && (
          <div className="rounded-xl overflow-hidden aspect-video w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={venue.coverImage}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <InfoRow label="Name" value={venue.name} />
          <InfoRow
            label="Category"
            value={VENUE_CATEGORY_LABELS[venue.category]}
          />
          <InfoRow
            label="Booking Mode"
            value={
              venue.bookingMode === "INSTANT"
                ? "Instant Book"
                : "Request to Book"
            }
          />
          <InfoRow label="City" value={venue.city} />
          <InfoRow label="Address" value={venue.address} span />
          {venue.description && (
            <InfoRow label="Description" value={venue.description} span />
          )}
          {venue.phone && (
            <InfoRow label="Phone" value={formatPhoneNumber(venue.phone)} />
          )}
          {venue.email && <InfoRow label="Email" value={venue.email} />}
          {venue.instagram && (
            <InfoRow label="Instagram" value={venue.instagram} />
          )}
          {venue.website && <InfoRow label="Website" value={venue.website} />}
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bookingMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking Mode</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="REQUEST">Request to Book</SelectItem>
                    <SelectItem value="INSTANT">Instant Book</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Cover image — drag and drop */}
          <div className="sm:col-span-2 space-y-1.5">
            <p className="text-sm font-medium">Cover Image</p>
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

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
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

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="@handle" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://…" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <IconLoader2 size={13} className="animate-spin mr-1" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}

function InfoRow({
  label,
  value,
  span,
}: {
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

// ─── Spaces Tab ───────────────────────────────────────────────────────────────

function SpacesTab({
  slug,
  spaces,
  onChanged,
}: {
  slug: string;
  spaces: VenueSpace[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VenueSpace | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "TABLE" as SpaceType,
    capacity: "",
    minSpend: "",
    description: "",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      type: "TABLE",
      capacity: "",
      minSpend: "",
      description: "",
    });
    setOpen(true);
  };

  const openEdit = (s: VenueSpace) => {
    setEditing(s);
    setForm({
      name: s.name,
      type: s.type,
      capacity: String(s.capacity),
      minSpend: s.minSpend ? String(s.minSpend / 100) : "",
      description: s.description ?? "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.capacity) {
      toast.error("Name and capacity required.");
      return;
    }
    setSaving(true);
    try {
      const dto = {
        name: form.name,
        type: form.type,
        capacity: Number(form.capacity),
        minSpend: form.minSpend
          ? Math.round(Number(form.minSpend) * 100)
          : undefined,
        description: form.description || undefined,
      };
      if (editing) {
        await updateSpace(slug, editing.id, dto);
        toast.success("Space updated.");
      } else {
        await addSpace(slug, dto);
        toast.success("Space added.");
      }
      setOpen(false);
      onChanged();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (s: VenueSpace) => {
    try {
      await updateSpace(slug, s.id, { isActive: !s.isActive });
      onChanged();
    } catch {
      toast.error("Failed to update space.");
    }
  };

  const handleRemove = async (s: VenueSpace) => {
    if (!confirm(`Remove "${s.name}"?`)) return;
    try {
      await removeSpace(slug, s.id);
      toast.success("Space removed.");
      onChanged();
    } catch {
      toast.error("Failed to remove space.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <IconPlus size={13} className="mr-1" /> Add Space
        </Button>
      </div>

      {spaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border rounded-xl border-dashed">
          <p className="text-sm text-muted-foreground">
            No spaces defined yet.
          </p>
          <Button size="sm" onClick={openCreate}>
            <IconPlus size={13} className="mr-1" /> Add Space
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {spaces.map((s) => (
            <div
              key={s.id}
              className={`border rounded-xl p-4 flex items-center gap-4 ${!s.isActive ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{s.name}</p>
                  <Badge variant="outline" className="text-[10px]">
                    {SPACE_TYPE_LABELS[s.type]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Capacity: {s.capacity}
                  {s.minSpend ? ` · Min spend: ${formatNaira(s.minSpend)}` : ""}
                  {s.description ? ` · ${s.description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={s.isActive}
                  onCheckedChange={() => handleToggle(s)}
                />
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                  <IconPencil size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-400"
                  onClick={() => handleRemove(s)}
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Space" : "Add Space"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="mb-2.5">Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Table 12, VIP Room"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="mb-2.5">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, type: v as SpaceType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPACE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {SPACE_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="mb-2.5">Capacity</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, capacity: e.target.value }))
                  }
                  placeholder="e.g. 4"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="mb-2.5">
                  Min Spend (₦){" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    optional
                  </span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.minSpend}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, minSpend: e.target.value }))
                  }
                  placeholder="e.g. 50000"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="mb-2.5">
                  Description{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    optional
                  </span>
                </Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Short note about this space"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              )}
              {editing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Hours Tab ────────────────────────────────────────────────────────────────

function HoursTab({
  slug,
  venue,
  onChanged,
}: {
  slug: string;
  venue: Venue;
  onChanged: () => void;
}) {
  const existing = venue.operatingHours ?? [];

  const defaultHours = () =>
    DAYS_OF_WEEK.map((day) => {
      const found = existing.find((h) => h.dayOfWeek === day);
      return {
        dayOfWeek: day,
        isClosed: found?.isClosed ?? false,
        openTime: found?.openTime ?? "12:00",
        closeTime: found?.closeTime ?? "23:00",
      };
    });

  const [hours, setHours] = useState(defaultHours);
  const [saving, setSaving] = useState(false);

  const update = (i: number, patch: Partial<(typeof hours)[0]>) =>
    setHours((prev) =>
      prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)),
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await setOperatingHours(slug, hours);
      toast.success("Operating hours saved.");
      onChanged();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save hours.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-xl divide-y overflow-hidden">
        {hours.map((h, i) => (
          <div key={h.dayOfWeek} className="flex items-center gap-4 p-3">
            <span className="text-sm font-medium w-10 shrink-0">
              {DAY_SHORT[h.dayOfWeek]}
            </span>
            <Switch
              checked={!h.isClosed}
              onCheckedChange={(v) => update(i, { isClosed: !v })}
            />
            {h.isClosed ? (
              <span className="text-sm text-muted-foreground">Closed</span>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Input
                  type="time"
                  value={h.openTime}
                  onChange={(e) => update(i, { openTime: e.target.value })}
                  className="w-28 text-xs h-8"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="time"
                  value={h.closeTime}
                  onChange={(e) => update(i, { closeTime: e.target.value })}
                  className="w-28 text-xs h-8"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving && <IconLoader2 size={13} className="animate-spin mr-1" />}
        Save Hours
      </Button>
    </div>
  );
}

// ─── Sessions Tab ─────────────────────────────────────────────────────────────

function SessionsTab({
  slug,
  sessions,
  onChanged,
}: {
  slug: string;
  sessions: VenueSession[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VenueSession | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startTime: "18:00",
    endTime: "23:00",
    slotDurationMinutes: "60",
    daysOfWeek: [] as DayOfWeek[],
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      startTime: "18:00",
      endTime: "23:00",
      slotDurationMinutes: "60",
      daysOfWeek: [],
    });
    setOpen(true);
  };

  const openEdit = (s: VenueSession) => {
    setEditing(s);
    setForm({
      name: s.name,
      startTime: s.startTime,
      endTime: s.endTime,
      slotDurationMinutes: String(s.slotDurationMinutes),
      daysOfWeek: s.daysOfWeek,
    });
    setOpen(true);
  };

  const toggleDay = (d: DayOfWeek) =>
    setForm((p) => ({
      ...p,
      daysOfWeek: p.daysOfWeek.includes(d)
        ? p.daysOfWeek.filter((x) => x !== d)
        : [...p.daysOfWeek, d],
    }));

  const handleSave = async () => {
    if (!form.name || form.daysOfWeek.length === 0) {
      toast.error("Name and at least one day required.");
      return;
    }
    setSaving(true);
    try {
      const dto = {
        name: form.name,
        startTime: form.startTime,
        endTime: form.endTime,
        slotDurationMinutes: Number(form.slotDurationMinutes),
        daysOfWeek: form.daysOfWeek,
      };
      if (editing) {
        await updateSession(slug, editing.id, dto);
        toast.success("Session updated.");
      } else {
        await addSession(slug, dto);
        toast.success("Session added.");
      }
      setOpen(false);
      onChanged();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (s: VenueSession) => {
    if (!confirm(`Remove session "${s.name}"?`)) return;
    try {
      await removeSession(slug, s.id);
      toast.success("Session removed.");
      onChanged();
    } catch {
      toast.error("Failed to remove session.");
    }
  };

  const handleToggle = async (s: VenueSession) => {
    try {
      await updateSession(slug, s.id, { isActive: !s.isActive });
      onChanged();
    } catch {
      toast.error("Failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <IconPlus size={13} className="mr-1" /> Add Session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border rounded-xl border-dashed">
          <p className="text-sm text-muted-foreground">
            No booking sessions set up yet.
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Sessions define when guests can book (e.g. Dinner, Late Night). Time
            slots are generated automatically.
          </p>
          <Button size="sm" onClick={openCreate}>
            <IconPlus size={13} className="mr-1" /> Add Session
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`border rounded-xl p-4 flex items-start gap-4 ${!s.isActive ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.startTime} – {s.endTime} · {s.slotDurationMinutes}min slots
                </p>
                <div className="flex gap-1 flex-wrap">
                  {DAYS_OF_WEEK.map((d) => (
                    <span
                      key={d}
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${s.daysOfWeek.includes(d) ? "bg-primary text-background border-foreground" : "border-border text-muted-foreground"}`}
                    >
                      {DAY_SHORT[d]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={s.isActive}
                  onCheckedChange={() => handleToggle(s)}
                />
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                  <IconPencil size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-400"
                  onClick={() => handleRemove(s)}
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Session" : "Add Session"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto">
            <div className="space-y-1.5">
              <Label className="mb-2.5">Session Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Dinner, Late Night"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="mb-2.5">Start</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="mb-2.5">End</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="mb-2.5">Slot (min)</Label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={form.slotDurationMinutes}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      slotDurationMinutes: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="mb-2.5">Days</Label>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS_OF_WEEK.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${form.daysOfWeek.includes(d) ? "bg-primary text-background border-foreground" : "border-border hover:border-foreground/40"}`}
                  >
                    {DAY_SHORT[d]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              )}
              {editing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Blocked Dates Tab ────────────────────────────────────────────────────────

function BlockedDatesTab({
  slug,
  blockedDates,
  onChanged,
}: {
  slug: string;
  blockedDates: VenueBlockedDate[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: "", reason: "" });

  const handleAdd = async () => {
    if (!form.date) {
      toast.error("Date is required.");
      return;
    }
    setSaving(true);
    try {
      await blockDate(slug, {
        date: form.date,
        reason: form.reason || undefined,
      });
      toast.success("Date blocked.");
      setOpen(false);
      setForm({ date: "", reason: "" });
      onChanged();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockDate(slug, id);
      toast.success("Date unblocked.");
      onChanged();
    } catch {
      toast.error("Failed.");
    }
  };

  const sorted = [...blockedDates].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <IconCalendarOff size={13} className="mr-1" /> Block Date
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12 border rounded-xl border-dashed">
          No blocked dates.
        </p>
      ) : (
        <div className="border rounded-xl divide-y overflow-hidden">
          {sorted.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {new Date(b.date).toLocaleDateString("en-NG", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {b.reason && (
                  <p className="text-xs text-muted-foreground">{b.reason}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400"
                onClick={() => handleUnblock(b.id)}
              >
                <IconX size={13} className="mr-1" /> Unblock
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Block a Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto">
            <div className="space-y-1.5">
              <Label className="mb-2.5">Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="mb-2.5">
                Reason{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  optional
                </span>
              </Label>
              <Input
                value={form.reason}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reason: e.target.value }))
                }
                placeholder="e.g. Private event"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving && (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              )}{" "}
              Block Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

function GalleryTab({
  slug,
  venue,
  onChanged,
}: {
  slug: string;
  venue: Venue;
  onChanged: () => void;
}) {
  const [images, setImages] = useState<string[]>(venue.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const validFiles = Array.from(files).filter((f) => {
      if (!allowed.includes(f.type)) {
        toast.error(`${f.name}: unsupported format`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name}: file too large (max 10 MB)`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(validFiles.map((f) => uploadVenueCover(f)));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const remove = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateVenueImages(slug, images);
      toast.success("Gallery saved.");
      onChanged();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save gallery.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add photos showcasing your venue. These appear on your public listing.
      </p>

      {/* Upload area */}
      <div
        className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-foreground/30 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <IconLoader2 className="animate-spin text-muted-foreground" />
        ) : (
          <>
            <IconPhoto size={24} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click or drag images to upload
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP · Max 10 MB each
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border bg-muted">
              <img
                src={url}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => remove(idx)}
                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IconX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button onClick={handleSave} disabled={saving || uploading}>
        {saving && <IconLoader2 size={14} className="animate-spin mr-1" />}
        Save Gallery
      </Button>
    </div>
  );
}

// ─── Policy Tab ───────────────────────────────────────────────────────────────

function PolicyTab({
  slug,
  venue,
  onChanged,
}: {
  slug: string;
  venue: Venue;
  onChanged: () => void;
}) {
  const p = venue.policy;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    depositType: (p?.depositType ?? "NONE") as DepositType,
    depositAmount: p?.depositAmount ? String(p.depositAmount / 100) : "",
    depositPercent: p?.depositPercent ? String(p.depositPercent) : "",
    fullRefundHours: p?.fullRefundHoursThreshold
      ? String(p.fullRefundHoursThreshold)
      : "24",
    partialRefundHours: p?.partialRefundHoursThreshold
      ? String(p.partialRefundHoursThreshold)
      : "",
    partialRefundPercent: p?.partialRefundPercent
      ? String(p.partialRefundPercent)
      : "50",
    modificationHours: p?.modificationAllowedHoursBefore
      ? String(p.modificationAllowedHoursBefore)
      : "24",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await setPolicy(slug, {
        depositType: form.depositType,
        depositAmount:
          form.depositType === "FLAT" && form.depositAmount
            ? Math.round(Number(form.depositAmount) * 100)
            : undefined,
        depositPercent:
          form.depositType === "PERCENTAGE_OF_MIN_SPEND" && form.depositPercent
            ? Number(form.depositPercent)
            : undefined,
        fullRefundHoursThreshold: form.fullRefundHours
          ? Number(form.fullRefundHours)
          : undefined,
        partialRefundHoursThreshold: form.partialRefundHours
          ? Number(form.partialRefundHours)
          : undefined,
        partialRefundPercent:
          form.partialRefundHours && form.partialRefundPercent
            ? Number(form.partialRefundPercent)
            : undefined,
        modificationAllowedHoursBefore: Number(form.modificationHours),
      });
      toast.success("Policy saved.");
      onChanged();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save policy.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Deposit */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Deposit</p>
        <div className="space-y-1.5">
          <Label className="mb-2.5">Deposit Type</Label>
          <Select
            value={form.depositType}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, depositType: v as DepositType }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">No deposit required</SelectItem>
              <SelectItem value="FLAT">Flat fee (₦)</SelectItem>
              <SelectItem value="PERCENTAGE_OF_MIN_SPEND">
                % of minimum spend
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {form.depositType === "FLAT" && (
          <div className="space-y-1.5">
            <Label className="mb-2.5">Deposit Amount (₦)</Label>
            <Input
              type="number"
              min={0}
              value={form.depositAmount}
              onChange={(e) =>
                setForm((p) => ({ ...p, depositAmount: e.target.value }))
              }
              placeholder="e.g. 10000"
            />
          </div>
        )}
        {form.depositType === "PERCENTAGE_OF_MIN_SPEND" && (
          <div className="space-y-1.5">
            <Label className="mb-2.5">Deposit % of min spend</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={form.depositPercent}
              onChange={(e) =>
                setForm((p) => ({ ...p, depositPercent: e.target.value }))
              }
              placeholder="e.g. 30"
            />
          </div>
        )}
      </div>

      {/* Refund */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Cancellation & Refunds</p>
        <div className="space-y-1.5">
          <Label className="mb-2.5">
            Full refund if cancelled at least _ hours before
          </Label>
          <Input
            type="number"
            min={0}
            value={form.fullRefundHours}
            onChange={(e) =>
              setForm((p) => ({ ...p, fullRefundHours: e.target.value }))
            }
            placeholder="e.g. 24"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="mb-2.5">
              Partial refund threshold (hrs){" "}
              <span className="text-muted-foreground text-xs">optional</span>
            </Label>
            <Input
              type="number"
              min={0}
              value={form.partialRefundHours}
              onChange={(e) =>
                setForm((p) => ({ ...p, partialRefundHours: e.target.value }))
              }
              placeholder="e.g. 6"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="mb-2.5">Partial refund %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.partialRefundPercent}
              onChange={(e) =>
                setForm((p) => ({ ...p, partialRefundPercent: e.target.value }))
              }
              placeholder="e.g. 50"
            />
          </div>
        </div>
      </div>

      {/* Modification */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Modifications</p>
        <div className="space-y-1.5">
          <Label className="mb-2.5">
            Allow modifications up to _ hours before
          </Label>
          <Input
            type="number"
            min={0}
            value={form.modificationHours}
            onChange={(e) =>
              setForm((p) => ({ ...p, modificationHours: e.target.value }))
            }
            placeholder="e.g. 24"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving && <IconLoader2 size={13} className="animate-spin mr-1" />} Save
        Policy
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManageVenuePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    (overrideSlug?: string) => {
      getMyVenueBySlug(overrideSlug ?? slug)
        .then(setVenue)
        .catch(() => toast.error("Failed to load venue."))
        .finally(() => setLoading(false));
    },
    [slug],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <IconLoader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-muted-foreground text-sm">Venue not found.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/venue-dashboard/venues">Back to venues</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <PageHeader
            back
            title={
              <>
                {venue.name}{" "}
                <Badge className={`${STATUS_BADGE[venue.status]}`}>
                  {STATUS_LABELS[venue.status]}
                </Badge>
              </>
            }
            description={`${venue.city} · ${VENUE_CATEGORY_LABELS[venue.category]}`}
          />
        </div>
        {venue.status === "REJECTED" && venue.rejectionReason && (
          <div className="mt-2 text-xs text-red-400 border border-red-500/20 rounded-lg px-3 py-2 bg-red-500/5">
            Rejection reason: {venue.rejectionReason}
          </div>
        )}
        {venue.status === "PENDING_REVIEW" && (
          <div className="mt-2 text-xs text-yellow-500 border border-yellow-500/20 rounded-md px-3 py-2 bg-yellow-500/5">
            Your venue is under review. You can still set up spaces, hours, and
            sessions while you wait.
          </div>
        )}
      </div>

      <Tabs defaultValue="info">
        <TabsList className="flex-wrap w-full h-auto">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="spaces">Spaces</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Dates</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="policy">Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="pt-4">
          <InfoTab
            venue={venue}
            onSaved={(newSlug) => {
              if (newSlug !== slug) {
                router.replace(`/venue-dashboard/venues/${newSlug}`);
              } else {
                load();
              }
            }}
          />
        </TabsContent>
        <TabsContent value="spaces" className="pt-4">
          <SpacesTab slug={slug} spaces={venue.spaces ?? []} onChanged={load} />
        </TabsContent>
        <TabsContent value="hours" className="pt-4">
          <HoursTab slug={slug} venue={venue} onChanged={load} />
        </TabsContent>
        <TabsContent value="sessions" className="pt-4">
          <SessionsTab
            slug={slug}
            sessions={venue.sessions ?? []}
            onChanged={load}
          />
        </TabsContent>
        <TabsContent value="blocked" className="pt-4">
          <BlockedDatesTab
            slug={slug}
            blockedDates={venue.blockedDates ?? []}
            onChanged={load}
          />
        </TabsContent>
        <TabsContent value="gallery" className="pt-4">
          <GalleryTab slug={slug} venue={venue} onChanged={load} />
        </TabsContent>
        <TabsContent value="policy" className="pt-4">
          <PolicyTab slug={slug} venue={venue} onChanged={load} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

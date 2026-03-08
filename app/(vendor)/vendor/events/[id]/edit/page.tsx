"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimeInput } from "@/components/TimeInput";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconPlus,
  IconTrash,
  IconLoader2,
  IconAlertCircle,
  IconPhoto,
  IconX,
  IconMessageReport,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getVendorEventById,
  updateVendorEvent,
  uploadVendorEventCover,
} from "@/lib/vendor-api";
import {
  toKobo,
  CATEGORY_LABELS,
  type EventCategory,
  type AdminEventWithStats,
} from "@/lib/events-api";
import { PageHeader } from "@/components/PageHeader";
import { DateSelector } from "@/components/DateSelector";
import { Loader } from "@/components/Loader";

interface TierForm {
  id?: string;
  name: string;
  description: string;
  priceNaira: string;
  quantity: string;
}

interface FormState {
  title: string;
  description: string;
  category: EventCategory;
  coverImage: string;
  date: string;
  doorsOpen: string;
  venueName: string;
  venueAddress: string;
  city: string;
  dressCode: string;
  isMemberOnly: boolean;
  tiers: TierForm[];
  status: string;
  rejectionReason?: string;
}

const STEP_LABELS = ["Identity & Vibe", "Logistics", "Access Tiers", "Review"];

export default function VendorEditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    getVendorEventById(id)
      .then((event: AdminEventWithStats) => {
        setForm({
          title: event.title,
          description: event.description ?? "",
          category: event.category,
          coverImage: event.coverImage ?? "",
          date: new Date(event.date).toISOString().split("T")[0],
          doorsOpen: event.doorsOpen,
          venueName: event.venueName,
          venueAddress: event.venueAddress ?? "",
          city: event.city ?? "",
          dressCode: event.dressCode ?? "",
          isMemberOnly: event.isMemberOnly,
          status: event.status,
          rejectionReason: event.rejectionReason,
          tiers: event.ticketTiers.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description ?? "",
            priceNaira: String(t.price / 100),
            quantity: String(t.quantity),
          })),
        });
      })
      .catch(() => setFetchError(true))
      .finally(() => setFetching(false));
  }, [id]);

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-64 gap-3 text-muted-foreground">
        <IconLoader2 size={20} className="animate-spin" />
        <span className="text-xs uppercase tracking-widest">Loading…</span>
      </div>
    );
  }

  if (fetchError || !form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-muted-foreground">
        <IconAlertCircle size={32} stroke={1} />
        <p className="text-sm">Event not found</p>
      </div>
    );
  }

  const set = (field: keyof FormState, value: any) =>
    setForm((f) => (f ? { ...f, [field]: value } : f));

  const setTier = (i: number, field: keyof TierForm, value: string) =>
    setForm((f) => {
      if (!f) return f;
      const tiers = [...f.tiers];
      tiers[i] = { ...tiers[i], [field]: value };
      return { ...f, tiers };
    });

  const addTier = () =>
    setForm((f) =>
      f
        ? {
            ...f,
            tiers: [
              ...f.tiers,
              { name: "", description: "", priceNaira: "", quantity: "" },
            ],
          }
        : f,
    );

  const removeTier = (i: number) =>
    setForm((f) =>
      f ? { ...f, tiers: f.tiers.filter((_, idx) => idx !== i) } : f,
    );

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
    set("coverImage", "");
  };

  const handleSave = async () => {
    if (!form) return;
    setLoading(true);
    try {
      let coverImageUrl = form.coverImage || undefined;
      if (coverFile) {
        toast.loading("Uploading cover image…", { id: "cover-upload" });
        try {
          coverImageUrl = await uploadVendorEventCover(coverFile);
          toast.dismiss("cover-upload");
        } catch {
          toast.dismiss("cover-upload");
          toast.error("Cover image upload failed. Try again.");
          setLoading(false);
          return;
        }
      }

      await updateVendorEvent(id, {
        title: form.title,
        description: form.description || undefined,
        category: form.category,
        coverImage: coverImageUrl,
        date: new Date(form.date).toISOString(),
        doorsOpen: form.doorsOpen,
        venueName: form.venueName,
        venueAddress: form.venueAddress || undefined,
        city: form.city || undefined,
        dressCode: form.dressCode || undefined,
        isMemberOnly: form.isMemberOnly,
        ticketTiers: form.tiers.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description || undefined,
          price: toKobo(Number(t.priceNaira)),
          quantity: Number(t.quantity),
        })),
      });
      toast.success("Event updated");
      router.push(`/vendor/events/${id}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const imageSource = previewUrl || form.coverImage;

  return (
    <main>
      <PageHeader back title="Edit Event" description={STEP_LABELS[step - 1]} />

      {/* Rejection reason banner — shown when vendor is fixing a rejected event */}
      {form.status === "REJECTED" && (
        <div className="rounded-lg border mb-4 border-red-500/30 bg-red-500/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <IconMessageReport size={16} className="text-red-400 shrink-0" />
            <p className="text-xs font-semibold uppercase text-red-400">
              Action Required
            </p>
          </div>
          {form.rejectionReason && (
            <p className="text-sm text-foreground/80">{form.rejectionReason}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Fix the issues above and save — your event will be automatically
            resubmitted for review.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <Label>Experience Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Wizkid Live at Landmark"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Describe the experience..."
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v as EventCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              {!imageSource ? (
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
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 bg-muted/30"}`}
                  onClick={() => fileInputRef.current?.click()}
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
              ) : (
                <div className="relative group rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSource}
                    alt="Cover preview"
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveCover}
                    >
                      <IconX size={16} className="mr-1" /> Remove
                    </Button>
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
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <DateSelector
                  dateValue={form.date}
                  onChange={(v) => set("date", v)}
                />
              </div>
              <div className="space-y-2">
                <Label>Doors Open *</Label>
                <TimeInput
                  value={form.doorsOpen}
                  onChange={(v) => set("doorsOpen", v)}
                />
              </div>
              {(
                [
                  {
                    label: "Venue Name *",
                    key: "venueName",
                    placeholder: "e.g. Eko Hotel Grand Ballroom",
                  },
                  {
                    label: "Venue Address",
                    key: "venueAddress",
                    placeholder: "Full address",
                  },
                  { label: "City", key: "city", placeholder: "Lagos" },
                  {
                    label: "Dress Code",
                    key: "dressCode",
                    placeholder: "e.g. Black Tie / All White",
                  },
                ] as const
              ).map(({ label, key, placeholder }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    value={form[key]}
                    placeholder={placeholder}
                    onChange={(e) => set(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
              <Label>Ticket Tiers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTier}
              >
                <IconPlus /> Add Tier
              </Button>
            </div>
            <div className="space-y-4">
              {form.tiers.map((tier, i) => (
                <Card key={i} className="relative">
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tier Name</Label>
                      <Input
                        value={tier.name}
                        placeholder="e.g. VIP Lounge"
                        onChange={(e) => setTier(i, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (₦)</Label>
                      <Input
                        type="number"
                        value={tier.priceNaira}
                        placeholder="50000"
                        min="0"
                        onChange={(e) =>
                          setTier(i, "priceNaira", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={tier.quantity}
                        placeholder="100"
                        min="1"
                        onChange={(e) => setTier(i, "quantity", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={tier.description}
                        placeholder="Optional"
                        onChange={(e) =>
                          setTier(i, "description", e.target.value)
                        }
                      />
                    </div>
                    {form.tiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTier(i)}
                        className="absolute top-4 right-4 text-red-500/60 hover:text-red-500 transition-colors"
                      >
                        <IconTrash size={14} />
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Review Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  {[
                    { label: "Title", value: form.title },
                    {
                      label: "Category",
                      value: CATEGORY_LABELS[form.category],
                    },
                    {
                      label: "Date",
                      value: form.date
                        ? new Date(form.date).toLocaleDateString("en-NG", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "—",
                    },
                    { label: "Venue", value: form.venueName },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.label}
                      </p>
                      <p className="font-bold uppercase text-sm">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {imageSource && (
                    <div className="mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSource}
                        alt="Cover"
                        className="w-full aspect-video object-cover rounded-md"
                      />
                    </div>
                  )}
                  <p className="text-xs font-medium uppercase mb-4">
                    Ticket Tiers
                  </p>
                  {form.tiers.map((t, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm border-b last:border-0 pb-2"
                    >
                      <span className="text-muted-foreground">{t.name}</span>
                      <span>
                        ₦{Number(t.priceNaira || 0).toLocaleString()} ×{" "}
                        {t.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="member-only"
                  checked={form.isMemberOnly}
                  onCheckedChange={(v) => set("isMemberOnly", Boolean(v))}
                />
                <Label htmlFor="member-only" className="cursor-pointer">
                  Member-Only Access
                </Label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
        >
          Back
        </Button>
        {step < 4 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)}>
            Next Phase
          </Button>
        ) : (
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? (
              <Loader
                text={
                  form.status === "REJECTED" ? "Resubmitting…" : "Saving..."
                }
              />
            ) : form.status === "REJECTED" ? (
              "Save & Resubmit for Review"
            ) : (
              "Save Changes"
            )}
          </Button>
        )}
      </div>
    </main>
  );
}

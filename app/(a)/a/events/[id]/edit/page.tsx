"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
  IconPlus,
  IconTrash,
  IconLoader2,
  IconAlertCircle,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getAdminEventById,
  updateEvent,
  uploadEventCover,
  toKobo,
  CATEGORY_LABELS,
  type EventCategory,
  type AdminEventWithStats,
} from "@/lib/events-api";

interface TierForm {
  name: string;
  description: string;
  priceNaira: string;
  quantity: string;
}

interface FormData {
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
}

const STEP_LABELS = ["Identity & Vibe", "Logistics", "Access Tiers", "Review"];

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(false);
  const [form, setForm] = useState<FormData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // File pending upload
  const [coverFile, setCoverFile] = useState<File | null>(null);
  // Blob URL for local preview
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    getAdminEventById(id)
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
          tiers: event.ticketTiers.map((t) => ({
            name: t.name,
            description: t.description ?? "",
            priceNaira: String(t.price / 100),
            quantity: String(t.quantity),
          })),
        });
      })
      .catch(() => setError(true))
      .finally(() => setFetching(false));
  }, [id]);

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-64 gap-3 text-white/40">
        <IconLoader2 size={20} className="animate-spin" />
        <span className="text-xs uppercase tracking-widest">Loading…</span>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-white/20">
        <IconAlertCircle size={32} stroke={1} />
        <p className="text-xs uppercase tracking-widest">Event not found</p>
      </div>
    );
  }

  const set = (field: keyof FormData, value: any) =>
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

  const canProceed = () => {
    if (!form) return false;
    if (step === 1) return form.title.trim().length >= 3;
    if (step === 2) return !!(form.date && form.doorsOpen && form.venueName);
    if (step === 3)
      return (
        form.tiers.length > 0 &&
        form.tiers.every(
          (t) =>
            t.name &&
            t.priceNaira &&
            !isNaN(Number(t.priceNaira)) &&
            t.quantity &&
            !isNaN(Number(t.quantity)) &&
            Number(t.quantity) > 0,
        )
      );
    return true;
  };

  const handleSave = async () => {
    if (!form) return;
    setLoading(true);
    try {
      // Upload new cover image if one was selected
      let coverImageUrl = form.coverImage || undefined;
      if (coverFile) {
        toast.loading("Uploading cover image…", { id: "cover-upload" });
        try {
          coverImageUrl = await uploadEventCover(coverFile);
          toast.dismiss("cover-upload");
        } catch {
          toast.dismiss("cover-upload");
          toast.error("Cover image upload failed. Try again.");
          setLoading(false);
          return;
        }
      }

      await updateEvent(id, {
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
          name: t.name,
          description: t.description || undefined,
          price: toKobo(Number(t.priceNaira)),
          quantity: Number(t.quantity),
        })),
      });
      toast.success("Event updated");
      router.push(`/a/events/${id}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  // The image to show in preview: blob URL (new file) > saved Cloudflare URL
  const imageSource = previewUrl || form.coverImage;

  return (
    <main className="bg-neutral-950 min-h-screen text-white">
      <div className="mb-12">
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">
          Edit <span className="text-white/40 italic">Experience</span>
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-6">
          {STEP_LABELS[step - 1]}
        </p>
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => s < step && setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  step >= s
                    ? "bg-white text-black border-white"
                    : "border-white/10 text-white/20"
                } ${s < step ? "cursor-pointer" : "cursor-default"}`}
              >
                {step > s ? <IconCheck size={14} /> : s}
              </button>
              {s < 4 && (
                <div
                  className={`w-12 h-px ${step > s ? "bg-white" : "bg-white/10"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-neutral-900 border border-white/5 p-8 md:p-12 mb-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">
                Experience Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full bg-black border border-white/10 p-4 text-sm focus:border-white/40 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                className="w-full bg-black border border-white/10 p-4 text-sm focus:border-white/40 outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value as EventCategory)}
                className="w-full bg-black border border-white/10 p-4 text-sm outline-none uppercase tracking-widest text-white/60"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover Image — file upload with drag-and-drop */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">
                Cover Image
              </label>
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
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-white/60 bg-white/5"
                      : "border-white/10 bg-black/30"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <IconPhoto size={36} className="text-white/30" />
                    <p className="text-sm text-white/60">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-white/30">
                      PNG, JPG or WEBP · Max 10 MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSource}
                    alt="Cover preview"
                    className="w-full aspect-video object-cover border border-white/10"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] uppercase tracking-widest border border-white/30 px-4 py-2 hover:bg-white/10 transition-colors"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="text-[10px] uppercase tracking-widest border border-red-500/40 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <IconX size={12} className="inline mr-1" />
                      Remove
                    </button>
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
              {coverFile && (
                <p className="text-[10px] text-white/30">
                  {coverFile.name} ·{" "}
                  {(coverFile.size / 1024 / 1024).toFixed(2)} MB · will upload on save
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Date *", key: "date", type: "date" },
                {
                  label: "Doors Open *",
                  key: "doorsOpen",
                  type: "text",
                  placeholder: "19:00 WAT",
                },
                {
                  label: "Venue Name *",
                  key: "venueName",
                  type: "text",
                  placeholder: "Eko Hotel",
                },
                {
                  label: "Venue Address",
                  key: "venueAddress",
                  type: "text",
                  placeholder: "Full address",
                },
                {
                  label: "City",
                  key: "city",
                  type: "text",
                  placeholder: "Lagos",
                },
                {
                  label: "Dress Code",
                  key: "dressCode",
                  type: "text",
                  placeholder: "Black Tie",
                },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    placeholder={placeholder}
                    onChange={(e) => set(key as keyof FormData, e.target.value)}
                    className="w-full bg-black border border-white/10 p-4 text-sm text-white/80 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold">
                Ticket Tiers *
              </h4>
              <Button
                variant="outline"
                onClick={addTier}
                className="text-[9px] uppercase tracking-widest border-white/10 py-0 h-8 rounded-none"
              >
                <IconPlus size={12} className="mr-1" /> Add Tier
              </Button>
            </div>
            <div className="space-y-4">
              {form.tiers.map((tier, i) => (
                <div
                  key={i}
                  className="bg-black p-6 border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 relative"
                >
                  {[
                    { label: "Tier Name", key: "name", placeholder: "VIP Lounge" },
                    {
                      label: "Price (₦)",
                      key: "priceNaira",
                      placeholder: "50000",
                      type: "number",
                    },
                    {
                      label: "Quantity",
                      key: "quantity",
                      placeholder: "100",
                      type: "number",
                    },
                    {
                      label: "Description",
                      key: "description",
                      placeholder: "Optional",
                    },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key} className="space-y-1">
                      <p className="text-[9px] text-white/40 uppercase">
                        {label}
                      </p>
                      <input
                        type={type ?? "text"}
                        value={(tier as any)[key]}
                        placeholder={placeholder}
                        onChange={(e) =>
                          setTier(i, key as keyof TierForm, e.target.value)
                        }
                        className="bg-transparent border-b border-white/10 w-full text-xs py-1 focus:border-white transition-all outline-none"
                      />
                    </div>
                  ))}
                  {form.tiers.length > 1 && (
                    <button
                      onClick={() => removeTier(i)}
                      className="absolute top-4 right-4 text-red-500/60 hover:text-red-500"
                    >
                      <IconTrash size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
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
                ].map((d) => (
                  <div key={d.label}>
                    <p className="text-[9px] text-white/30 uppercase mb-1">
                      {d.label}
                    </p>
                    <p className="font-bold uppercase">{d.value}</p>
                  </div>
                ))}
              </div>
              <div>
                {imageSource && (
                  <div className="mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSource}
                      alt="Cover"
                      className="w-full aspect-video object-cover border border-white/10"
                    />
                  </div>
                )}
                <p className="text-[9px] text-white/30 uppercase mb-3">
                  Ticket Tiers
                </p>
                {form.tiers.map((t, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-xs border-b border-white/5 pb-2 mb-2"
                  >
                    <span className="text-white/80">{t.name}</span>
                    <span className="text-white/40">
                      ₦{Number(t.priceNaira || 0).toLocaleString()} ×{" "}
                      {t.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <input
                type="checkbox"
                className="accent-white"
                checked={form.isMemberOnly}
                onChange={(e) => set("isMemberOnly", e.target.checked)}
                id="member-only"
              />
              <label
                htmlFor="member-only"
                className="text-[10px] uppercase tracking-widest text-white/60 cursor-pointer"
              >
                Member-Only Access
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="bg-transparent border border-white/10 text-white hover:bg-white/5 rounded-none px-8 py-6 uppercase tracking-widest text-[10px] disabled:opacity-0"
        >
          <IconChevronLeft size={16} className="mr-2" /> Back
        </Button>
        {step < 4 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="bg-white text-black hover:bg-neutral-200 rounded-none px-8 py-6 uppercase tracking-widest text-[10px] disabled:opacity-40"
          >
            Next <IconChevronRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-white text-black hover:bg-neutral-200 rounded-none px-12 py-6 uppercase tracking-widest text-[10px] font-bold"
          >
            {loading && <IconLoader2 size={16} className="animate-spin mr-2" />}
            Save Changes
          </Button>
        )}
      </div>
    </main>
  );
};

export default EditEventPage;

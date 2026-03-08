"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { IconPhoto, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { createVendorEvent, uploadVendorEventCover } from "@/lib/vendor-api";
import { toKobo, CATEGORY_LABELS, type EventCategory } from "@/lib/events-api";
import { PageHeader } from "@/components/PageHeader";
import { DateSelector } from "@/components/DateSelector";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/Loader";

const step1Schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  coverImage: z.string().optional(),
});

const step2Schema = z.object({
  date: z.string().min(1, "Date is required"),
  doorsOpen: z.string().min(1, "Doors open time is required"),
  venueName: z.string().min(1, "Venue name is required"),
  venueAddress: z.string().optional(),
  city: z.string().optional(),
  dressCode: z.string().optional(),
});

const tierSchema = z.object({
  name: z.string().min(1, "Tier name is required"),
  description: z.string().optional(),
  priceNaira: z
    .string()
    .min(1, "Price is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0,
      "Must be a valid price",
    ),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      "Must be greater than 0",
    ),
});

const step3Schema = z.object({
  tiers: z.array(tierSchema).min(1, "At least one tier is required"),
});

const step4Schema = z.object({ isMemberOnly: z.boolean() });

const fullSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
});

type FormData = z.infer<typeof fullSchema>;

const STEP_LABELS = ["Identity & Vibe", "Logistics", "Access Tiers", "Review"];
const INITIAL_TIERS = [
  { name: "Standard Access", description: "", priceNaira: "", quantity: "" },
  { name: "VIP Lounge", description: "", priceNaira: "", quantity: "" },
];

export default function VendorCreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      category: "CONCERT",
      coverImage: "",
      date: "",
      doorsOpen: "",
      venueName: "",
      venueAddress: "",
      city: "Lagos",
      dressCode: "",
      isMemberOnly: false,
      tiers: INITIAL_TIERS,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tiers",
  });

  const handleNext = async () => {
    const stepFieldSets: (keyof FormData)[][] = [
      ["title", "description", "category", "coverImage"],
      ["date", "doorsOpen", "venueName", "venueAddress", "city", "dressCode"],
      ["tiers"],
      ["isMemberOnly"],
    ];
    const valid = await form.trigger(stepFieldSets[step - 1]);
    if (valid) setStep((s) => s + 1);
  };

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
    form.setValue("coverImage", "");
  };

  const handleSubmit = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    const values = form.getValues();
    setLoading(true);
    try {
      let coverImageUrl: string | undefined = values.coverImage || undefined;
      if (coverFile) {
        toast.loading("Uploading cover image…", { id: "cover-upload" });
        try {
          coverImageUrl = await uploadVendorEventCover(coverFile);
          toast.dismiss("cover-upload");
        } catch (error: any) {
          console.log(error);
          toast.dismiss("cover-upload");
          toast.error("Cover image upload failed. Try again.");
          setLoading(false);
          return;
        }
      }

      await createVendorEvent({
        title: values.title,
        description: values.description || undefined,
        category: values.category as EventCategory,
        coverImage: coverImageUrl,
        date: new Date(values.date).toISOString(),
        doorsOpen: values.doorsOpen,
        venueName: values.venueName,
        venueAddress: values.venueAddress || undefined,
        city: values.city || undefined,
        dressCode: values.dressCode || undefined,
        isMemberOnly: values.isMemberOnly,
        ticketTiers: values.tiers.map((t) => ({
          name: t.name,
          description: t.description || undefined,
          price: toKobo(Number(t.priceNaira)),
          quantity: Number(t.quantity),
        })),
      });

      toast.success(
        "Event submitted for review! We'll notify you once it's approved.",
      );
      router.push("/vendor/events");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const imageSource = previewUrl || form.watch("coverImage");

  return (
    <main>
      <PageHeader
        back
        title="Create Event"
        description={STEP_LABELS[step - 1]}
      />

      <Form {...form}>
        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Title *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Wizkid Live at Landmark"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Describe the experience..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/20 bg-muted/30"
                    }`}
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
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
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
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <DateSelector field={field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doorsOpen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doors Open *</FormLabel>
                      <FormControl>
                        <TimeInput
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="venueName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Eko Hotel Grand Ballroom"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="venueAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Full address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Lagos" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dressCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dress Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Black Tie / All White"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  onClick={() =>
                    append({
                      name: "",
                      description: "",
                      priceNaira: "",
                      quantity: "",
                    })
                  }
                >
                  <IconPlus /> Add Tier
                </Button>
              </div>
              <div className="space-y-4">
                {fields.map((fieldItem, i) => (
                  <Card key={fieldItem.id} className="relative">
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`tiers.${i}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tier Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. VIP Lounge" />
                            </FormControl>
                            <FormMessage className="text-[9px] text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`tiers.${i}.priceNaira`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₦)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="50000"
                                min="0"
                              />
                            </FormControl>
                            <FormMessage className="text-[9px] text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`tiers.${i}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="100"
                                min="1"
                              />
                            </FormControl>
                            <FormMessage className="text-[9px] text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`tiers.${i}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" />
                            </FormControl>
                            <FormMessage className="text-[9px] text-red-400" />
                          </FormItem>
                        )}
                      />
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(i)}
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
                      { label: "Title", value: form.getValues("title") },
                      {
                        label: "Category",
                        value:
                          CATEGORY_LABELS[
                            form.getValues("category") as EventCategory
                          ],
                      },
                      {
                        label: "Date",
                        value: form.getValues("date")
                          ? new Date(form.getValues("date")).toLocaleDateString(
                              "en-NG",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "—",
                      },
                      { label: "Venue", value: form.getValues("venueName") },
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
                    {form.getValues("tiers").map((t, i) => (
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
                <FormField
                  control={form.control}
                  name="isMemberOnly"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">
                        Member-Only Access
                      </FormLabel>
                    </FormItem>
                  )}
                />
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
            <Button type="button" onClick={handleNext}>
              Next Phase
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader text="Submitting…" /> : "Submit for Review"}
            </Button>
          )}
        </div>
      </Form>
    </main>
  );
}

"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconMusic,
  IconGlassFull,
  IconPalette,
  IconSparkles,
  IconUsers,
  IconBuildingStore,
  IconCheck,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { postData } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import { Loader } from "@/components/Loader";

const VIBE_OPTIONS = [
  { id: "nightlife", label: "Nightlife", icon: <IconGlassFull size={20} /> },
  { id: "concerts", label: "Live Music", icon: <IconMusic size={20} /> },
  { id: "art", label: "Fine Art", icon: <IconPalette size={20} /> },
  { id: "culinary", label: "Fine Dining", icon: <IconSparkles size={20} /> },
] as const;

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp Priority" },
  { id: "email", label: "Email Digest" },
  { id: "sms", label: "SMS Flash Alerts" },
] as const;

type ChannelId = (typeof CHANNELS)[number]["id"];

const channelSchema = z.object({
  whatsapp: z.boolean(),
  email: z.boolean(),
  sms: z.boolean(),
});

const vendorSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  brandBio: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
});

type ChannelValues = z.infer<typeof channelSchema>;
type VendorValues = z.infer<typeof vendorSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [pending, startTransition] = useTransition();

  // Step logic:
  // USER path:   0 (choose type) → 1 (vibes) → 2 (channels) → 3 (done)
  // VENDOR path: 0 (choose type) → 1 (brand info) → 2 (event vibes) → 3 (done)
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<"user" | "vendor" | null>(null);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [vibeError, setVibeError] = useState(false);

  const channelForm = useForm<ChannelValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: { whatsapp: true, email: true, sms: false },
  });

  const vendorForm = useForm<VendorValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { brandName: "", brandBio: "", website: "", instagram: "" },
  });

  const toggleVibe = (id: string) => {
    setVibeError(false);
    setSelectedVibes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const handleTypeSelect = (type: "user" | "vendor") => {
    setAccountType(type);
    setStep(1);
  };

  const handleNext = async () => {
    if (accountType === "vendor" && step === 1) {
      const valid = await vendorForm.trigger();
      if (!valid) return;
    }
    if (accountType === "user" && step === 1) {
      if (selectedVibes.length === 0) {
        setVibeError(true);
        toast.error("Select at least one vibe to continue");
        return;
      }
    }
    if (accountType === "vendor" && step === 2) {
      if (selectedVibes.length === 0) {
        setVibeError(true);
        toast.error("Select at least one category to continue");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleFinish = () => {
    startTransition(async () => {
      try {
        const payload =
          accountType === "vendor"
            ? {
                accountType: "vendor" as const,
                interests: selectedVibes,
                ...vendorForm.getValues(),
              }
            : {
                accountType: "user" as const,
                interests: selectedVibes,
              };

        const updatedUser = await postData<any>("/auth/onboarding", payload);
        setUser(updatedUser);

        if (accountType === "vendor") {
          router.push("/vendor/dashboard");
        } else {
          router.push("/dashboard");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-card">
      <CardContent>
        {/* ── STEP 0: CHOOSE ACCOUNT TYPE ── */}
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="flex flex-col text-center items-center pt-4">
              <Link
                href="/"
                className="flex items-center hover:text-primary text-slate-900 mb-1.5"
              >
                <Logo type="green" size="h-10" />
              </Link>
              <CardDescription>How will you be using Ekovibe?</CardDescription>
            </CardHeader>
            <div className="mt-6 grid grid-cols-1 gap-3 mb-4">
              <Card
                onClick={() => handleTypeSelect("user")}
                className="cursor-pointer border-border hover:border-foreground/40 transition-all"
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <IconUsers size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">I&apos;m an Attendee</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Discover events, buy tickets, and access exclusive experiences
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                onClick={() => handleTypeSelect("vendor")}
                className="cursor-pointer border-border hover:border-primary/60 hover:bg-primary/5 transition-all"
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <IconBuildingStore size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">I&apos;m an Event Organizer</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Create events, manage tickets, and track your revenue
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── USER PATH: STEP 1 — SELECT VIBES ── */}
        {accountType === "user" && step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="flex flex-col text-center items-center pt-4">
              <Link
                href="/"
                className="flex items-center hover:text-primary text-slate-900 mb-1.5"
              >
                <Logo type="green" size="h-10" />
              </Link>
              <CardDescription>
                Select the experiences you want prioritized in your feed.
              </CardDescription>
            </CardHeader>
            <div className="mt-8 grid grid-cols-2 gap-2 mb-4">
              {VIBE_OPTIONS.map((vibe) => {
                const selected = selectedVibes.includes(vibe.id);
                return (
                  <Card
                    key={vibe.id}
                    onClick={() => toggleVibe(vibe.id)}
                    className={cn(
                      "cursor-pointer transition-all",
                      selected
                        ? "border-primary"
                        : vibeError
                          ? "border-destructive/50"
                          : "border-border hover:border-foreground/30",
                    )}
                  >
                    <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className={selected ? "text-foreground" : "text-muted-foreground/50"}>
                        {vibe.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {vibe.label}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {vibeError && (
              <p className="text-[9px] text-red-400 uppercase tracking-widest text-center mb-4">
                Select at least one vibe
              </p>
            )}
          </div>
        )}

        {/* ── USER PATH: STEP 2 — NOTIFICATION CHANNELS ── */}
        {accountType === "user" && step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="flex flex-col mb-8 text-center items-center pt-4">
              <Link
                href="/"
                className="flex items-center hover:text-primary text-slate-900 mb-1.5"
              >
                <Logo type="green" size="h-10" />
              </Link>
              <CardDescription>
                How should we notify you of secret drops and table openings?
              </CardDescription>
            </CardHeader>
            <Form {...channelForm}>
              <div className="space-y-3 mb-6">
                {CHANNELS.map(({ id, label }) => (
                  <FormField
                    key={id}
                    control={channelForm.control}
                    name={id as ChannelId}
                    render={({ field }) => (
                      <FormItem>
                        <Label
                          htmlFor={id}
                          className="flex items-center justify-between p-4 bg-card border rounded-md border-border hover:border-foreground/30 transition-colors cursor-pointer"
                        >
                          <div className="space-y-1">
                            <span className="text-sm font-semibold">{label}</span>
                            <p className="text-xs text-muted-foreground">
                              Priority {id} notifications
                            </p>
                          </div>
                          <FormControl>
                            <Checkbox
                              id={id}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </Label>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </Form>
          </div>
        )}

        {/* ── VENDOR PATH: STEP 1 — BRAND INFO ── */}
        {accountType === "vendor" && step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="flex flex-col text-center items-center pt-4">
              <Link
                href="/"
                className="flex items-center hover:text-primary text-slate-900 mb-1.5"
              >
                <Logo type="green" size="h-10" />
              </Link>
              <CardDescription>
                Tell us about your brand or organization.
              </CardDescription>
            </CardHeader>
            <Form {...vendorForm}>
              <div className="mt-4 space-y-4 mb-4">
                <FormField
                  control={vendorForm.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand / Organization Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Lagos Nights Co." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={vendorForm.control}
                  name="brandBio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="What kind of events do you organize?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={vendorForm.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="@yourbrand" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vendorForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="yourbrand.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Form>
          </div>
        )}

        {/* ── VENDOR PATH: STEP 2 — EVENT CATEGORIES ── */}
        {accountType === "vendor" && step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="flex flex-col text-center items-center pt-4">
              <Link
                href="/"
                className="flex items-center hover:text-primary text-slate-900 mb-1.5"
              >
                <Logo type="green" size="h-10" />
              </Link>
              <CardDescription>
                What types of events do you typically organize?
              </CardDescription>
            </CardHeader>
            <div className="mt-8 grid grid-cols-2 gap-2 mb-4">
              {VIBE_OPTIONS.map((vibe) => {
                const selected = selectedVibes.includes(vibe.id);
                return (
                  <Card
                    key={vibe.id}
                    onClick={() => toggleVibe(vibe.id)}
                    className={cn(
                      "cursor-pointer transition-all",
                      selected
                        ? "border-primary"
                        : vibeError
                          ? "border-destructive/50"
                          : "border-border hover:border-foreground/30",
                    )}
                  >
                    <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className={selected ? "text-foreground" : "text-muted-foreground/50"}>
                        {vibe.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {vibe.label}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {vibeError && (
              <p className="text-[9px] text-red-400 uppercase tracking-widest text-center mb-4">
                Select at least one category
              </p>
            )}
          </div>
        )}

        {/* ── STEP 3: SUCCESS ── */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
            <CardHeader className="flex flex-col mb-4 text-center items-center pt-4">
              <Link
                href="/"
                className="flex items-center hover:text-primary text-slate-900 mb-1.5"
              >
                <Logo type="green" size="h-10" />
              </Link>
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto my-4">
                <IconCheck size={28} className="text-primary" />
              </div>
              <CardDescription>
                {accountType === "vendor"
                  ? "Your organizer profile is live. Head to your dashboard to create your first event."
                  : "Your Ekovibe identity is now live. We've curated your first Vibe Report based on your interests."}
              </CardDescription>
            </CardHeader>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex flex-col gap-4">
          {step > 0 && step < 3 && (
            <Button type="button" onClick={handleNext} className="w-full">
              Continue
            </Button>
          )}
          {step === 3 && (
            <Button
              type="button"
              onClick={handleFinish}
              disabled={pending}
              className="w-full"
            >
              {pending ? (
                <Loader text="Setting up..." />
              ) : accountType === "vendor" ? (
                "Go to My Dashboard"
              ) : (
                "Enter the Ecosystem"
              )}
            </Button>
          )}
          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(0)}
              className="text-xs text-muted-foreground hover:underline"
            >
              Back
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

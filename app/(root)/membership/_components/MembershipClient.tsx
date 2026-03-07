"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  IconCrown,
  IconInfinity,
  IconCheck,
  IconLoader2,
  IconMail,
  IconArrowRight,
} from "@tabler/icons-react";
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
import Link from "next/link";
import { useAuth } from "@/store/useAuth";
import {
  submitMembershipApplication,
  type MembershipTier,
} from "@/lib/events-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Zod Schema ────────────────────────────────────────────────────────────────

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
  occupation: z.string().min(2, "Please enter your occupation"),
  city: z.string().min(2, "Please enter your city"),
  referral: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIERS: Record<
  MembershipTier,
  { label: string; price: string; perks: string[]; icon: React.ReactNode }
> = {
  GOLD: {
    label: "Gold",
    price: "₦500k / year",
    icon: <IconCrown className="text-yellow-500" size={22} />,
    perks: [
      "Priority Table Reservations",
      "Early Access to 'The Vault' Drops",
      "10% Discount on Vibe-Wear",
      "Member-Only Event Invitations",
      "Standard Airport Fast-Track (2× / year)",
    ],
  },
  BLACK: {
    label: "Black",
    price: "Custom",
    icon: <IconInfinity className="text-foreground" size={22} />,
    perks: [
      "24/7 Dedicated Lifestyle Manager",
      "Guaranteed Table Access (Even if Sold Out)",
      "Unlimited Airport Protocol & Fast-Track",
      "Private Jet & Yacht Charter Logistics",
      "Bespoke Personal Shopping & Styling",
    ],
  },
};

const REFERRAL_OPTIONS = [
  "Social Media (Instagram / X)",
  "A friend or contact",
  "At an Ekovibe event",
  "Google / web search",
  "Other",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function MembershipPageInner() {
  const params = useSearchParams();
  const { user } = useAuth();
  const [tier, setTier] = useState<MembershipTier>("GOLD");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = params.get("tier")?.toUpperCase();
    if (t === "GOLD" || t === "BLACK") setTier(t);
  }, [params]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}`.trim() : "",
      email: user?.email ?? "",
      phone: "",
      occupation: "",
      city: "",
      referral: "",
      message: "",
    },
  });

  // Re-populate if user loads after initial render (e.g. auth resolves async)
  useEffect(() => {
    if (user) {
      if (!form.getValues("fullName"))
        form.setValue("fullName", `${user.firstName} ${user.lastName}`.trim());
      if (!form.getValues("email")) form.setValue("email", user.email);
    }
  }, [user]);

  const { isSubmitting } = form.formState;
  const selected = TIERS[tier];

  const onSubmit = async (values: FormValues) => {
    try {
      await submitMembershipApplication({ ...values, tier });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
    }
  };

  // ── Success state ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center py-24">
        <div className="max-w-lg text-center space-y-6 px-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <IconMail size={28} className="text-green-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter">
            Application Received
          </h2>
          <p className="text-muted-foreground font-light leading-relaxed">
            Thank you for applying for{" "}
            <span className="font-semibold text-foreground">
              {selected.label} Membership
            </span>
            . Our team personally reviews every application and will reach out
            to you within{" "}
            <span className="font-semibold text-foreground">
              3–5 business days
            </span>
            .
          </p>
          <p className="text-sm text-muted-foreground">
            A confirmation has been sent to your email.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">
                  Go to Dashboard <IconArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/register">
                  Create an Account{" "}
                  <IconArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/ticketing">Browse Experiences</Link>
            </Button>
          </div>
          {!user && (
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-foreground">
                Log in
              </Link>
            </p>
          )}
        </div>
      </main>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <main className="py-20">
      <div className="container">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs uppercase text-muted-foreground mb-4">
            Elevate Your Access
          </p>
          <h1 className="text-4xl md:text-6xl font-bold uppercase mb-4">
            Apply for Membership
          </h1>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            Fill in your details below and select your desired tier. Our team
            will review your application and be in touch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT: Tier selector + perks */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tier Toggle */}
            <div className="grid grid-cols-2 gap-2">
              {(["GOLD", "BLACK"] as MembershipTier[]).map((t) => {
                const cfg = TIERS[t];
                const isActive = tier === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`flex flex-col items-center gap-2 p-5 border rounded-lg transition-all text-center ${
                      isActive
                        ? "border-foreground bg-muted"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    {cfg.icon}
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {cfg.price}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Perks */}
            <div className="border border-border rounded-lg p-6 space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                {selected.label} Member Benefits
              </p>
              <ul className="space-y-3">
                {selected.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-3 text-xs text-foreground/80 leading-relaxed"
                  >
                    <IconCheck
                      size={13}
                      className="text-muted-foreground shrink-0 mt-0.5"
                    />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-3">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Tunde Adeleke" {...field} />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="tunde@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+234 800 000 0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation / Industry</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Entrepreneur, Finance"
                            {...field}
                          />
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
                          <Input placeholder="e.g. Lagos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you hear about us?</FormLabel>
                        <FormControl>
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
                              {Object.entries(REFERRAL_OPTIONS).map(
                                ([k, v]) => (
                                  <SelectItem key={k} value={k}>
                                    {v}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tell us about yourself{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="What draws you to Ekovibe? What are you looking to experience as a member?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : (
                    `Apply for ${selected.label} Membership`
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By submitting, you agree to be contacted by the Ekovibe team.
                  We do not share your details with third parties.
                </p>

                {!user && (
                  <p className="text-center text-xs text-muted-foreground border-t border-border pt-4">
                    Want to track your application and access events?{" "}
                    <Link
                      href="/register"
                      className="text-foreground font-semibold hover:underline"
                    >
                      Create a free account
                    </Link>{" "}
                    after submitting.
                  </p>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MembershipClient() {
  return (
    <Suspense>
      <MembershipPageInner />
    </Suspense>
  );
}

"use client";
import { useState } from "react";
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
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconMusic,
  IconGlassFull,
  IconPalette,
  IconCheck,
  IconChevronRight,
  IconSparkles,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { Field, FieldContent } from "@/components/ui/field";
import { Label } from "@/components/ui/label";

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

type ChannelValues = z.infer<typeof channelSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [vibeError, setVibeError] = useState(false);

  const channelForm = useForm<ChannelValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: { whatsapp: true, email: true, sms: false },
  });

  const toggleVibe = (id: string) => {
    setVibeError(false);
    setSelectedVibes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (selectedVibes.length === 0) {
        setVibeError(true);
        toast.error("Select at least one vibe to continue");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-card">
      <CardContent>
        {step === 1 && (
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
                    className={`cursor-pointer transition-all ${
                      selected
                        ? "border-primary"
                        : vibeError
                          ? "border-primary"
                          : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
                      <div
                        className={
                          selected
                            ? "text-foreground"
                            : "text-muted-foreground/50"
                        }
                      >
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
              <p className="text-[9px] text-red-400 uppercase tracking-widest text-center mb-8">
                Select at least one vibe
              </p>
            )}
          </div>
        )}

        {/* STEP 2: CONCIERGE CHANNELS */}
        {step === 2 && (
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
                        {/* Using 'asChild' on FormLabel or simply using a <label> 
                   tag allows the entire box to focus the checkbox 
                */}
                        <Label
                          htmlFor={id}
                          className="flex items-center justify-between p-4 bg-card border rounded-md border-border hover:border-foreground/30 transition-colors cursor-pointer"
                        >
                          <FieldContent className="space-y-1">
                            <span className="text-sm font-semibold">
                              {label}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              Priority {id} notifications
                            </p>
                          </FieldContent>

                          <FormControl>
                            <Checkbox
                              id={id} // CRITICAL: This must match the 'htmlFor' above
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              // className="border-border data-[state=checked]:bg-foreground data-[state=checked]:text-background rounded-none w-5 h-5"
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

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
            <CardHeader className="flex flex-col mb-8 text-center items-center pt-4">
              <Link
                href="/"
                className="flex items-center hover:text-primary text-slate-900 mb-1.5"
              >
                <Logo type="green" size="h-10" />
              </Link>
              <CardDescription>
                Your Ekovibe identity is now live. We&apos;ve curated your first
                &ldquo;Vibe Report&rdquo; based on your interests.
              </CardDescription>
            </CardHeader>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col gap-4">
          {step < 3 ? (
            <Button type="button" onClick={handleNext} className="w-full">
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={handleFinish} className="w-full">
              Enter the Ecosystem
            </Button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-xs text-muted-foreground hover:underline"
            >
              Skip for now
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

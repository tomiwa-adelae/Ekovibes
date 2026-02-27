"use client";
import { Suspense, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  IconEye,
  IconEyeOff,
  IconCheck,
  IconX,
  IconLoader2,
} from "@tabler/icons-react";
import { postData } from "@/lib/api";
import { Loader } from "@/components/Loader";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/\d/, "Must include a number")
      .regex(/[^A-Za-z0-9]/, "Must include a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const REQUIREMENTS = [
  { label: "8+ Characters", test: (p: string) => p.length >= 8 },
  { label: "One Number", test: (p: string) => /\d/.test(p) },
  { label: "Special Character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const inputCls =
  "bg-card border-border rounded-none h-14 text-foreground focus-visible:border-foreground/40 focus-visible:ring-0 placeholder:text-muted-foreground/30 pr-12";
const labelCls = "text-[9px] uppercase tracking-[0.2em] text-muted-foreground";
const errorCls = "text-[9px] text-red-400 uppercase tracking-widest";

function NewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const otp = searchParams.get("otp") ?? "";

  const [pending, startTransition] = useTransition();

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const { watch } = form;
  const password = watch("newPassword");
  const strength = REQUIREMENTS.filter((r) => r.test(password)).length;

  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      if (!email || !otp) {
        toast.error("Session expired. Please restart the password reset flow.");
        router.push("/forgot-password");
        return;
      }
      try {
        await postData("/auth/set-new-password", {
          email,
          otp,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        });
        toast.success("Password updated! Please sign in.");
        router.push("/login");
      } catch (e: any) {
        toast.error(e?.response?.data?.message ?? "Failed to update password");
      }
    });
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <div className="w-full max-w-sm relative z-10">
        <div className="mb-10 text-left">
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground mb-2">
            New <span className="text-foreground/40 italic">Identity</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-relaxed">
            Create a secure password to re-enter the ecosystem.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="••••••••"
                        className={inputCls}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((p) => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                      >
                        {showNew ? (
                          <IconEyeOff size={18} />
                        ) : (
                          <IconEye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  {/* Strength meter */}
                  <div className="flex gap-1 h-px mt-2">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`grow transition-all duration-500 ${
                          strength >= step
                            ? strength === 3
                              ? "bg-foreground"
                              : "bg-foreground/40"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <FormMessage className={errorCls} />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Confirm Identity</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        className={inputCls}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((p) => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                      >
                        {showConfirm ? (
                          <IconEyeOff size={18} />
                        ) : (
                          <IconEye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className={errorCls} />
                </FormItem>
              )}
            />

            {/* Requirements checklist */}
            <div className="grid grid-cols-2 gap-y-2 py-2">
              {REQUIREMENTS.map((req) => {
                const met = req.test(password);
                return (
                  <div key={req.label} className="flex items-center gap-2">
                    {met ? (
                      <IconCheck
                        size={12}
                        className="text-foreground shrink-0"
                      />
                    ) : (
                      <IconX
                        size={12}
                        className="text-muted-foreground shrink-0"
                      />
                    )}
                    <span
                      className={`text-[9px] uppercase tracking-widest ${met ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <Button
              type="submit"
              disabled={pending || strength < 3}
              className="w-full bg-foreground text-background hover:bg-foreground/90 py-7 rounded-none font-bold uppercase tracking-[0.3em] text-[10px] disabled:opacity-40"
            >
              {pending ? <Loader text="Updating..." /> : "Update Password"}
            </Button>
          </form>
        </Form>

        <div className="mt-12 text-center">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
            Secured by Ekovibe
          </p>
        </div>
      </div>
    </main>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense>
      <NewPasswordContent />
    </Suspense>
  );
}

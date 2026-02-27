"use client";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { IconShieldLock, IconLoader2, IconRefresh } from "@tabler/icons-react";
import { postData } from "@/lib/api";

const schema = z.object({
  otp: z.string().length(6, "Enter all 6 digits"),
});

type FormValues = z.infer<typeof schema>;

function VerifyCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [timer, setTimer] = useState(59);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { otp: "" },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormValues) => {
    try {
      await postData("/auth/verify-code", { otp: data.otp, email });
      toast.success("Code verified!");
      router.push(
        `/new-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(data.otp)}`,
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Invalid or expired code");
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;
    setResending(true);
    try {
      await postData("/auth/forgot-password", { email });
      toast.success("New code sent!");
      setTimer(59);
      form.reset();
    } catch {
      toast.error("Failed to resend. Try again.");
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "your email";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {/* Icon & Title */}
        <div className="mb-10">
          <div className="w-16 h-16 bg-muted border border-border rounded-full flex items-center justify-center mx-auto mb-6">
            <IconShieldLock size={30} className="text-foreground" stroke={1.5} />
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground mb-3">
            Verify <span className="text-foreground/40 italic">Identity</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-relaxed">
            We sent a 6-digit access code to <br />
            <span className="text-foreground">{maskedEmail}</span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      containerClassName="justify-center gap-2"
                      {...field}
                    >
                      <InputOTPGroup className="gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="w-12 h-16 text-2xl rounded-none border-border bg-card text-foreground data-[active=true]:border-foreground data-[active=true]:ring-0 first:rounded-none last:rounded-none"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage className="text-[9px] text-red-400 uppercase tracking-widest" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-foreground text-background hover:bg-foreground/90 py-7 rounded-none font-bold uppercase tracking-[0.3em] text-[10px]"
            >
              {isSubmitting ? (
                <IconLoader2 className="animate-spin mr-2" size={18} />
              ) : null}
              Verify & Continue
            </Button>
          </form>
        </Form>

        {/* Resend */}
        <div className="space-y-4 mt-8">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
            Didn&apos;t receive the code?
          </p>
          {timer > 0 ? (
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Resend in 00:{timer < 10 ? `0${timer}` : timer}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-[10px] text-foreground uppercase tracking-widest font-bold underline underline-offset-4 flex items-center gap-2 mx-auto disabled:opacity-40"
            >
              {resending ? (
                <IconLoader2 size={14} className="animate-spin" />
              ) : (
                <IconRefresh size={14} />
              )}
              Resend Code
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense>
      <VerifyCodeContent />
    </Suspense>
  );
}

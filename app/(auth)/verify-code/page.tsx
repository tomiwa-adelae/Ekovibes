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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Loader } from "@/components/Loader";

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
    <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-card">
      <CardHeader className="flex flex-col items-center pt-4">
        <Link
          href="/"
          className="flex items-center hover:text-primary text-slate-900 mb-1.5"
        >
          <Logo type="green" size="h-10" />
        </Link>
        <CardTitle>Verify Identity</CardTitle>
        <CardDescription>
          We sent a 6-digit access code to{" "}
          <span className="text-foreground">{maskedEmail}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="w-full text-center">
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
                      containerClassName="justify-center"
                      {...field}
                    >
                      <InputOTPGroup className="gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot className="size-14" key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader text="Verifying" /> : "Verify & Continue"}
            </Button>
          </form>
        </Form>

        {/* Resend */}
        <div className="space-y-4 mt-8">
          <p className="text-xs text-muted-foreground">
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
              {resending ? <Loader text="" /> : <IconRefresh size={14} />}
              Resend Code
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense>
      <VerifyCodeContent />
    </Suspense>
  );
}

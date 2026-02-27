"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { IconArrowLeft, IconMail, IconLoader2 } from "@tabler/icons-react";
import { postData } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

const inputCls =
  "bg-card border-border rounded-none h-14 text-foreground focus-visible:border-foreground/40 focus-visible:ring-0 placeholder:text-muted-foreground/30 pl-12";
const labelCls = "text-[9px] uppercase tracking-[0.2em] text-muted-foreground";
const errorCls = "text-[9px] text-red-400 uppercase tracking-widest";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormValues) => {
    try {
      await postData("/auth/forgot-password", { email: data.email });
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch {
      // Show success state regardless to prevent email enumeration
      setSubmittedEmail(data.email);
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center relative px-6">

      <div className="w-full max-w-sm relative z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground mb-12 transition-colors group"
        >
          <IconArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Sign In
        </Link>

        {!submitted ? (
          <div className="space-y-8">
            <div className="text-left">
              <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground mb-2">
                Recover <span className="text-foreground/40 italic">Access</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-relaxed">
                Enter the email associated with your Ekovibe identity. We will
                send a secure recovery code.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelCls}>Verified Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IconMail
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                            size={18}
                          />
                          <Input
                            type="email"
                            placeholder="identity@ekovibes.ng"
                            className={inputCls}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className={errorCls} />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 py-7 rounded-none font-bold uppercase tracking-[0.3em] text-[10px] flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <IconLoader2 className="animate-spin" size={18} />
                  ) : (
                    "Send Recovery Code"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          /* Success state */
          <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center mb-8">
              <IconMail className="text-foreground" size={24} stroke={1.5} />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">
              Check Your <span className="text-foreground/40 italic">Inbox</span>
            </h2>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground leading-relaxed mb-8">
              If an account exists for{" "}
              <span className="text-foreground">{submittedEmail}</span>, you will
              receive a 6-digit recovery code shortly.
            </p>
            <Button
              onClick={() =>
                router.push(
                  `/verify-code?email=${encodeURIComponent(submittedEmail)}`,
                )
              }
              className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none py-6 uppercase text-[10px] tracking-widest font-bold transition-all mb-4"
            >
              Enter Recovery Code
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-border text-foreground hover:bg-foreground hover:text-background rounded-none py-6 uppercase text-[10px] tracking-widest transition-all"
            >
              <Link href="/login">Return to Login</Link>
            </Button>
          </div>
        )}

        <div className="mt-20 pt-8 border-t border-border text-center">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
            Facing issues?{" "}
            <Link href="/support" className="text-foreground hover:underline">
              Contact Lifestyle Manager
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

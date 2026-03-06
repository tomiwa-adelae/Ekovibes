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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import { Loader } from "@/components/Loader";

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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await postData("/auth/forgot-password", {
        email: data.email,
      });
      console.log(res);
      router.push(`/verify-code?email=${data.email}`);
      toast.success("Recovery code sent!");
    } catch (error: any) {
      // Show success state regardless to prevent email enumeration
      console.log(error);
      toast.success("Password reset OTP sent to your email");
    }
  };

  return (
    <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-card">
      <CardHeader className="flex flex-col items-center pt-4">
        <Link
          href="/"
          className="flex items-center hover:text-primary text-slate-900 mb-1.5"
        >
          <Logo type="green" size="h-10" />
        </Link>
        <CardTitle>Recover Access</CardTitle>
        <CardDescription>
          Enter the email associated with your Ekovibe identity. We will send a
          secure recovery code.
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verified Email</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          placeholder="example@gmail.com"
                        />
                        <InputGroupAddon>
                          <IconMail />
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <Loader text={"Sending..."} />
                ) : (
                  "Send Recovery Code"
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Facing issues?{" "}
            <Link href="/support" className="text-foreground hover:underline">
              Contact Lifestyle Manager
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

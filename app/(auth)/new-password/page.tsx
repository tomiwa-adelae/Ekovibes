"use client";
import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
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
  IconEyeClosed,
} from "@tabler/icons-react";
import { postData } from "@/lib/api";
import { Loader } from "@/components/Loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const password = form.watch("newPassword");
  const confirmPassword = form.watch("confirmPassword");

  // 🧩 When password or confirmPassword changes, recheck the match
  useEffect(() => {
    if (confirmPassword !== "" || password !== "") {
      form.trigger("confirmPassword");
    }
  }, [password, confirmPassword, form]);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const [isConfirmVisible, setConfirmIsVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  const toggleConfirmVisibility = () =>
    setConfirmIsVisible((prevState) => !prevState);

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
      {
        regex: /[!@#$%^&*(),.?":{}|<>]/,
        text: "At least 1 special character",
      },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(password);

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score === 3) return "Medium password";
    return "Strong password";
  };

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
    <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-card">
      <CardHeader className="flex flex-col text-center items-center pt-4">
        <Link
          href="/"
          className="flex items-center hover:text-primary text-slate-900 mb-1.5"
        >
          <Logo type="green" size="h-10" />
        </Link>
        <CardTitle>New Identity</CardTitle>
        <CardDescription>
          Create a secure password to re-enter the ecosystem.
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="password"
                        className="pe-9"
                        placeholder="Password"
                        type={isVisible ? "text" : "password"}
                        {...field}
                      />
                      <Button
                        className="absolute top-[50%] translate-y-[-50%] end-1 text-muted-foreground/80"
                        variant={"ghost"}
                        size="icon"
                        type="button"
                        onClick={toggleVisibility}
                        aria-label={
                          isVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={isVisible}
                        aria-controls="password"
                      >
                        {isVisible ? (
                          <IconEyeClosed
                            className="size-4"
                            aria-hidden="true"
                          />
                        ) : (
                          <IconEye className="size-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div
                    className={cn(
                      password.length !== 0 ? "block mt-2 space-y-3" : "hidden",
                    )}
                  >
                    <Progress
                      value={(strengthScore / 5) * 100}
                      className={cn("h-1")}
                    />
                    {/* Password strength description */}
                    <p className="text-foreground mb-2 text-sm font-medium">
                      {getStrengthText(strengthScore)}. Must contain:
                    </p>

                    {/* Password requirements list */}
                    <ul
                      className="space-y-1.5"
                      aria-label="Password requirements"
                    >
                      {strength.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          {req.met ? (
                            <IconCheck
                              size={16}
                              className="text-emerald-500"
                              aria-hidden="true"
                            />
                          ) : (
                            <IconX
                              size={16}
                              className="text-muted-foreground/80"
                              aria-hidden="true"
                            />
                          )}
                          <span
                            className={`text-xs ${
                              req.met
                                ? "text-emerald-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {req.text}
                            <span className="sr-only">
                              {req.met
                                ? " - Requirement met"
                                : " - Requirement not met"}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={isConfirmVisible ? "text" : "password"}
                        placeholder="Confirm new password"
                        {...field}
                      />
                      <Button
                        className="absolute top-[50%] translate-y-[-50%] end-1 text-muted-foreground/80"
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={toggleConfirmVisibility}
                        aria-label={
                          isConfirmVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={isConfirmVisible}
                        aria-controls="confirmPassword"
                      >
                        {isConfirmVisible ? (
                          <IconEyeClosed
                            className="size-4"
                            aria-hidden="true"
                          />
                        ) : (
                          <IconEye className="size-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {pending ? <Loader text="Updating..." /> : "Update Password"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">Secured by Ekovibe</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense>
      <NewPasswordContent />
    </Suspense>
  );
}

"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import * as RPNInput from "react-phone-number-input";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  IconBrandGoogle,
  IconBrandApple,
  IconEye,
  IconEyeClosed,
  IconUser,
  IconCrown,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  CountrySelect,
  FlagComponent,
  PhoneInput,
} from "@/components/PhoneNumberInput";
import { postData } from "@/lib/api";
import { useAuth, type User } from "@/store/useAuth";
import { Loader } from "@/components/Loader";
import {
  LoginSchema,
  LoginSchemaType,
  RegisterSchema,
  RegisterSchemaType,
} from "@/lib/zodSchema";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the authenticated user right after login or register */
  onSuccess: (user: User) => void;
  defaultTab?: "login" | "register";
}

// ─── Login form ────────────────────────────────────────────────────────────────

function LoginForm({
  onSuccess,
  onSwitchToRegister,
}: {
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
}) {
  const { setUser } = useAuth();
  const [pending, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(false);

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginSchemaType) => {
    startTransition(async () => {
      try {
        const res = await postData<{ user: User; message: string }>(
          "/auth/login",
          data,
        );
        setUser(res.user);
        toast.success(res.message || "Welcome back!");
        onSuccess(res.user);
      } catch (e: any) {
        toast.error(e?.response?.data?.message ?? "Invalid credentials");
      }
    });
  };

  return (
    <div className="px-6 pb-6 pt-4 space-y-6">
      {/* Social buttons */}
      <div className="space-y-2.5">
        <Button type="button" variant="outline" className="w-full">
          <IconBrandApple size={18} fill="currentColor" />
          Continue with Apple
        </Button>
        <Button type="button" variant="outline" className="w-full">
          <IconBrandGoogle size={18} />
          Continue with Google
        </Button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px grow bg-border" />
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
          or email
        </span>
        <div className="h-px grow bg-border" />
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="identity@ekovibes.ng"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="modal-password"
                      placeholder="••••••••"
                      type={isVisible ? "text" : "password"}
                      {...field}
                    />
                    <Button
                      className="absolute top-1/2 -translate-y-1/2 end-1 text-muted-foreground/80"
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setIsVisible((v) => !v)}
                      aria-label={isVisible ? "Hide password" : "Show password"}
                    >
                      {isVisible ? (
                        <IconEyeClosed className="size-4" />
                      ) : (
                        <IconEye className="size-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={pending} type="submit" className="w-full">
            {pending ? <Loader text="Signing in..." /> : "Sign In"}
          </Button>

          <Link
            href="/forgot-password"
            className="block text-sm text-muted-foreground hover:underline hover:text-primary"
          >
            Forgot password?
          </Link>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-foreground font-semibold hover:underline"
        >
          Join now
        </button>
      </p>
    </div>
  );
}

// ─── Register form ─────────────────────────────────────────────────────────────

function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}) {
  const { setUser } = useAuth();
  const [pending, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      tier: "standard",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  useEffect(() => {
    if (confirmPassword !== "" || password !== "") {
      form.trigger("confirmPassword");
    }
  }, [password, confirmPassword, form]);

  const checkStrength = (pass: string) =>
    [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
      { regex: /[!@#$%^&*(),.?":{}|<>]/, text: "At least 1 special character" },
    ].map((req) => ({ met: req.regex.test(pass), text: req.text }));

  const strength = checkStrength(password);
  const strengthScore = useMemo(
    () => strength.filter((r) => r.met).length,
    [strength],
  );

  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score === 3) return "Medium password";
    return "Strong password";
  };

  const onSubmit = (data: RegisterSchemaType) => {
    startTransition(async () => {
      try {
        const res = await postData<{ user: User; message: string }>(
          "/auth/register",
          data,
        );
        setUser(res.user);
        toast.success("Welcome to Ekovibe!");
        onSuccess(res.user);
      } catch (e: any) {
        toast.error(e?.response?.data?.message ?? "Registration failed");
      }
    });
  };

  return (
    <div className="px-6 pb-6 pt-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Tier selector */}
          <FormField
            control={form.control}
            name="tier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose your tier of access</FormLabel>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <Card
                    onClick={() => field.onChange("standard")}
                    className={cn(
                      "border cursor-pointer transition-all",
                      field.value === "standard"
                        ? "border-foreground bg-muted"
                        : "border-border opacity-60 hover:opacity-100",
                    )}
                  >
                    <CardContent className="p-4">
                      <IconUser size={20} className="mb-2" />
                      <CardTitle>Guest</CardTitle>
                      <CardDescription>Basic Access</CardDescription>
                    </CardContent>
                  </Card>
                  <Card
                    onClick={() => field.onChange("gold")}
                    className={cn(
                      "border cursor-pointer transition-all",
                      field.value === "gold"
                        ? "border-foreground bg-muted"
                        : "border-border opacity-60 hover:opacity-100",
                    )}
                  >
                    <CardContent className="p-4">
                      <IconCrown size={20} className="mb-2 text-yellow-500" />
                      <CardTitle>Gold</CardTitle>
                      <CardDescription>Priority Member</CardDescription>
                      <p className="text-[9px] uppercase tracking-widest text-yellow-500/80 mt-1">
                        Requires approval
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <RPNInput.default
                    className="flex rounded-md shadow-xs"
                    international
                    flagComponent={FlagComponent}
                    countrySelectComponent={CountrySelect}
                    inputComponent={PhoneInput}
                    placeholder="+2348012345679"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="modal-reg-password"
                      className="pe-9"
                      placeholder="Password"
                      type={isVisible ? "text" : "password"}
                      {...field}
                    />
                    <Button
                      className="absolute top-1/2 -translate-y-1/2 end-1 text-muted-foreground/80"
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setIsVisible((v) => !v)}
                    >
                      {isVisible ? (
                        <IconEyeClosed className="size-4" />
                      ) : (
                        <IconEye className="size-4" />
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
                  <Progress value={(strengthScore / 5) * 100} className="h-1" />
                  <p className="text-foreground text-sm font-medium">
                    {getStrengthText(strengthScore)}. Must contain:
                  </p>
                  <ul className="space-y-1.5" aria-label="Password requirements">
                    {strength.map((req, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {req.met ? (
                          <IconCheck size={16} className="text-emerald-500" />
                        ) : (
                          <IconX size={16} className="text-muted-foreground/80" />
                        )}
                        <span
                          className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
                        >
                          {req.text}
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
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={isConfirmVisible ? "text" : "password"}
                      placeholder="Confirm password"
                      {...field}
                    />
                    <Button
                      className="absolute top-1/2 -translate-y-1/2 end-1 text-muted-foreground/80"
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setIsConfirmVisible((v) => !v)}
                    >
                      {isConfirmVisible ? (
                        <IconEyeClosed className="size-4" />
                      ) : (
                        <IconEye className="size-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 py-1 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-primary font-bold hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="text-primary font-bold hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button disabled={pending} type="submit" className="w-full">
            {pending ? <Loader text="Creating account..." /> : "Create Account"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-xs text-muted-foreground mt-5">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-foreground font-semibold hover:underline"
        >
          Log In
        </button>
      </p>
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

export function AuthModal({
  open,
  onClose,
  onSuccess,
  defaultTab = "login",
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  // Reset to default tab each time the modal opens
  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold text-center mb-4">
            Sign in to continue
          </DialogTitle>
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "login" | "register")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1">
                Create Account
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-y-auto flex-1">
          {tab === "login" ? (
            <LoginForm
              onSuccess={onSuccess}
              onSwitchToRegister={() => setTab("register")}
            />
          ) : (
            <RegisterForm
              onSuccess={onSuccess}
              onSwitchToLogin={() => setTab("login")}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

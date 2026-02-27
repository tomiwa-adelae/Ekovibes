"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import * as RPNInput from "react-phone-number-input";
import {
  CountrySelect,
  FlagComponent,
  PhoneInput,
} from "@/components/PhoneNumberInput";
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
import {
  IconArrowRight,
  IconUser,
  IconCrown,
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconX,
  IconCheck,
  IconEyeClosed,
} from "@tabler/icons-react";
import { postData } from "@/lib/api";
import { useAuth, type User } from "@/store/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Loader } from "@/components/Loader";
import { RegisterSchema, RegisterSchemaType } from "@/lib/zodSchema";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [pending, startTransition] = useTransition();

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

  // 🧠 Watch for password changes
  const password = form.watch("password");
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

  const onSubmit = async (data: RegisterSchemaType) => {
    startTransition(async () => {
      try {
        const res = await postData<{ user: User; message: string }>(
          "/auth/register",
          data,
        );
        setUser(res.user);
        toast.success("Welcome to Ekovibes!");
        router.push("/onboarding");
      } catch (e: any) {
        toast.error(e?.response?.data?.message ?? "Registration failed");
      }
    });
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
        <CardDescription>Create an account with Ekovibe</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 mb-10"
          >
            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose your tier of access</FormLabel>

                  <div className="mt-2.5 grid grid-cols-2 gap-2 mb-6">
                    {/* STANDARD */}
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

                    {/* GOLD */}
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
                      </CardContent>
                    </Card>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
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
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
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
                        className="text-primary font-bold hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
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
              {pending ? <Loader text="Creating..." /> : "Create Account"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-xs text-muted-foreground">
          <Link href="/login">
            Already have an identity?{" "}
            <span className="text-foreground hover:underline">Log In</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

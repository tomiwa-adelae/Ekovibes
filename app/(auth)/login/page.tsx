"use client";
import { useState, useTransition } from "react";
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
import {
  IconBrandGoogle,
  IconBrandApple,
  IconArrowRight,
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconEyeClosed,
} from "@tabler/icons-react";
import { postData } from "@/lib/api";
import { useAuth, type User } from "@/store/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Loader } from "@/components/Loader";
import { LoginSchema, LoginSchemaType } from "@/lib/zodSchema";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [pending, startTransition] = useTransition();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: LoginSchemaType) => {
    startTransition(async () => {
      try {
        const res = await postData<{ user: User; message: string }>(
          "/auth/login",
          data,
        );
        setUser(res.user);
        toast.success(res.message || "Welcome back!");
        router.push(res.user.isAdmin ? "/a/dashboard" : "/dashboard");
      } catch (e: any) {
        toast.error(e?.response?.data?.message ?? "Invalid credentials");
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
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-3 mb-8">
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
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px grow bg-border" />
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
            or email
          </span>
          <div className="h-px grow bg-border" />
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mb-6"
          >
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
                        id="password"
                        placeholder="••••••••"
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
                </FormItem>
              )}
            />

            <Button disabled={pending} type="submit" className="w-full">
              {pending ? <Loader text="Signing in..." /> : "Sign in"}
            </Button>
          </form>
        </Form>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm">
          <p className="mb-2">Don't have an account yet?</p>
          <Link href="/register" className="hover:underline">
            Join now
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

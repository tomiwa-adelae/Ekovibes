"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  IconUser,
  IconLock,
  IconBell,
  IconLoader2,
  IconCheck,
  IconEyeOff,
  IconEye,
  IconX,
  IconCamera,
} from "@tabler/icons-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/store/useAuth";
import { updateProfile, changePassword } from "@/lib/user-api";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { DEFAULT_PROFILE_IMAGE } from "@/constants";
import api from "@/lib/api";
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload";
import { Loader } from "@/components/Loader";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  image: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, setUser } = useAuth();

  const [profilePic, setProfilePic] = useState<string>(user?.image || "");
  const [showModal, setShowModal] = useState(false);

  const [photoPending, startPhotoTransition] = useTransition();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      gender: user?.gender ?? "",
      dob: user?.dob ?? "",
      city: user?.city ?? "",
      state: user?.state ?? "",
      country: user?.country ?? "",
      address: user?.address ?? "",
      image: user?.image || "",
    },
  });

  // Sync if user loads after mount
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
        gender: user.gender ?? "",
        dob: user.dob ?? "",
        city: user.city ?? "",
        state: user.state ?? "",
        country: user.country ?? "",
        address: user.address ?? "",
        image: user.image || "",
      });
    }
  }, [user?.id]);

  const handleUpload = (croppedImage: string) => {
    setProfilePic(croppedImage);

    if (!user) {
      toast.error("User not found");
      return;
    }

    startPhotoTransition(async () => {
      // Convert base64 → File
      const byteString = atob(croppedImage.split(",")[1]);
      const mimeString = croppedImage.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++)
        ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], "profile-picture.jpg", {
        type: mimeString,
      });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await api.post(`/upload/profile/${user?.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const imageUrl = res.data.imageUrl;

        toast.success(res.data.message);

        // update preview
        setProfilePic(imageUrl);

        // ✅ update auth store (SAFE)
        setUser({
          ...user,
          image: imageUrl,
        });
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Upload failed");
      }
    });
  };

  const onSubmit = async (values: ProfileValues) => {
    try {
      const updated = await updateProfile(values);
      setUser(updated);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile");
    }
  };

  console.log(user);

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your name, email, and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfilePictureUpload
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onUpload={(cropped) => {
                setShowModal(false);
                handleUpload(cropped);
              }}
              currentImage={user?.image}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl className="flex items-center justify-center mb-6">
                    <div className="relative flex items-center justify-center w-full">
                      <Image
                        src={profilePic || field.value || DEFAULT_PROFILE_IMAGE}
                        alt="User profile picture"
                        width={1000}
                        height={1000}
                        className="rounded-full object-cover size-[250px]"
                      />
                      <Button
                        size="sm"
                        type="button"
                        variant={"secondary"}
                        className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] px-4 absolute bottom-[-15px] left-[50%] translate-x-[-50%] "
                        onClick={() => setShowModal(true)}
                        disabled={photoPending || isSubmitting}
                      >
                        {photoPending ? (
                          <Loader text="" />
                        ) : (
                          <>
                            <IconCamera /> Edit
                          </>
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
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
                      <Input placeholder="+234 800 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="prefer_not_to_say">
                          Prefer not to say
                        </option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Your city, state, and country.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Lagos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Lagos State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Nigeria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <IconLoader2 size={16} className="animate-spin mr-2" />
            ) : (
              <IconCheck size={16} className="mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const { user } = useAuth();

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("newPassword");
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isConfirmVisible, setConfirmIsVisible] = useState<boolean>(false);
  const [isCurrentVisible, setCurrentIsVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  const toggleCurrentVisibility = () =>
    setCurrentIsVisible((prevState) => !prevState);

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

  const onSubmit = async (values: PasswordValues) => {
    try {
      await changePassword(values);
      toast.success("Password changed successfully");
      form.reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to change password");
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Use a strong password you don't use anywhere else.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <div className="relative">
                      <Input
                        placeholder="Current password"
                        {...field}
                        type={isCurrentVisible ? "text" : "password"}
                      />
                      <Button
                        className="absolute top-[50%] translate-y-[-50%] end-1 text-muted-foreground/80"
                        variant={"ghost"}
                        size="icon"
                        type="button"
                        onClick={toggleCurrentVisibility}
                        aria-label={
                          isCurrentVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={isCurrentVisible}
                        aria-controls="password"
                      >
                        {isCurrentVisible ? (
                          <IconEyeOff className="size-4" aria-hidden="true" />
                        ) : (
                          <IconEye className="size-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
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
                            <IconEyeOff className="size-4" aria-hidden="true" />
                          ) : (
                            <IconEye className="size-4" aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <div
                      className={cn(
                        password.length !== 0
                          ? "block mt-2 space-y-3"
                          : "hidden",
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
                          placeholder="Enter your password"
                          {...field}
                        />
                        <Button
                          className="absolute top-[50%] translate-y-[-50%] end-1 text-muted-foreground/80"
                          variant={"ghost"}
                          size="icon"
                          type="button"
                          onClick={toggleConfirmVisibility}
                          // FIX: Use isConfirmVisible for accessibility label
                          aria-label={
                            isConfirmVisible ? "Hide password" : "Show password"
                          }
                          aria-pressed={isConfirmVisible}
                          aria-controls="password"
                        >
                          {isConfirmVisible ? ( // FIX: Use isConfirmVisible for icon
                            <IconEyeOff className="size-4" aria-hidden="true" />
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
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <IconLoader2 size={16} className="animate-spin mr-2" />
                  )}
                  Update Password
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Read-only account identifiers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Username</span>
            <span className="font-medium">@{user?.username}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Membership Tier</span>
            <span className="font-semibold uppercase text-xs tracking-widest">
              {user?.userTier ?? "Standard"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Sign-in Method</span>
            <span className="font-medium capitalize">
              {user?.role ? "Password" : "Social"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailEvents: true,
    emailOffers: true,
    emailDigest: false,
    smsAlerts: false,
    whatsapp: true,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const rows: {
    key: keyof typeof prefs;
    label: string;
    description: string;
  }[] = [
    {
      key: "emailEvents",
      label: "Event Confirmations",
      description: "Booking confirmations and ticket receipts via email.",
    },
    {
      key: "emailOffers",
      label: "Exclusive Offers",
      description: "Early access drops, flash ticket sales, and member perks.",
    },
    {
      key: "emailDigest",
      label: "Weekly Vibe Report",
      description: "A curated digest of upcoming events and city highlights.",
    },
    {
      key: "smsAlerts",
      label: "SMS Flash Alerts",
      description: "Last-minute table openings and urgent event updates.",
    },
    {
      key: "whatsapp",
      label: "WhatsApp Priority",
      description: "Direct messages from your concierge and the Ekovibe team.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how and when Ekovibe contacts you.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{row.label}</Label>
              <p className="text-xs text-muted-foreground">{row.description}</p>
            </div>
            <Switch
              checked={prefs[row.key]}
              onCheckedChange={() => toggle(row.key)}
            />
          </div>
        ))}
        <div className="pt-4 flex justify-end">
          <Button
            onClick={() => toast.success("Notification preferences saved")}
          >
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <main>
      <PageHeader
        back
        title="Settings"
        description="Manage your profile, security, and notification preferences."
      />

      <Tabs defaultValue="profile" className="space-y-2">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <IconUser size={15} />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <IconLock size={15} />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <IconBell size={15} />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}

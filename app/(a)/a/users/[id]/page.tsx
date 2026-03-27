"use client";

import React, { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import {
  IconLoader2,
  IconAlertCircle,
  IconCalendar,
  IconTicket,
  IconBuildingStore,
  IconShoppingBag,
  IconCurrencyNaira,
  IconCheck,
  IconX,
  IconStar,
  IconBriefcase,
  IconQrcode,
  IconEye,
  IconBuilding,
  IconWallet,
  IconPlus,
  IconDotsVertical,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Separator } from "@/components/ui/separator";
import { cn, formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";

import {
  getAdminUserById,
  adminCreateVenueOwnerProfile,
  formatNaira,
  type AdminUserDetail,
} from "@/lib/users-api";
import { Loader } from "@/components/Loader";

// ── Constants ────────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  USER: "bg-blue-500/10 text-blue-400",
  VENDOR: "bg-purple-500/10 text-purple-400",
  VENUE_OWNER: "bg-orange-500/10 text-orange-400",
  ADMIN: "bg-green-500/10 text-green-400",
  SUPER_ADMIN: "bg-red-500/10 text-red-400",
};

const ROLE_LABEL: Record<string, string> = {
  USER: "User",
  VENDOR: "Vendor",
  VENUE_OWNER: "Venue Owner",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

const RESERVATION_STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-green-500/10 text-green-500",
  PENDING_PAYMENT: "bg-yellow-500/10 text-yellow-500",
  PENDING_APPROVAL: "bg-yellow-500/10 text-yellow-400",
  CANCELLED_BY_GUEST: "bg-red-500/10 text-red-400",
  CANCELLED_BY_VENUE: "bg-red-500/10 text-red-400",
  COMPLETED: "bg-muted text-muted-foreground",
  REJECTED: "bg-red-500/10 text-red-400",
  NO_SHOW: "bg-orange-500/10 text-orange-400",
};

const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500",
  PAID: "bg-green-500/10 text-green-500",
  FAILED: "bg-red-500/10 text-red-400",
  REFUNDED: "bg-blue-500/10 text-blue-400",
};

const EVENT_STATUS_STYLES: Record<string, string> = {
  LIVE: "bg-green-500/10 text-green-500",
  SOLD_OUT: "bg-red-500/10 text-red-500",
  DRAFT: "bg-muted text-muted-foreground",
  CANCELLED: "bg-orange-500/10 text-orange-500",
  ENDED: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  REJECTED: "bg-red-500/10 text-red-400",
};

const VENUE_STATUS_STYLES: Record<string, string> = {
  LIVE: "bg-green-500/10 text-green-500",
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-green-500/10 text-green-400",
  REJECTED: "bg-red-500/10 text-red-400",
  SUSPENDED: "bg-orange-500/10 text-orange-400",
};

type Tab = "overview" | "orders" | "tickets" | "reservations" | "shop" | "events" | "venues";

// ── Small reusable components ─────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <div className={cn("mt-0.5", color ?? "text-muted-foreground")}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">{label}</p>
          <p className="text-xl font-bold mt-2.5">{value}</p>
          {sub && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value?: string | null | boolean;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
      </span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="bg-muted rounded-full p-3">
        <IconAlertCircle size={24} className="text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ── Create Venue Owner Profile Dialog ────────────────────────────────────────

function CreateVenueOwnerDialog({
  userId,
  open,
  onClose,
  onCreated,
}: {
  userId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) {
      toast.error("Business name is required");
      return;
    }
    setSaving(true);
    try {
      await adminCreateVenueOwnerProfile(userId, {
        businessName: form.businessName,
        businessEmail: form.businessEmail || undefined,
        businessPhone: form.businessPhone || undefined,
      });
      toast.success("Venue owner profile created — user role updated to Venue Owner");
      onCreated();
      onClose();
    } catch {
      toast.error("Failed to create venue owner profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Venue Owner Profile</DialogTitle>
          <DialogDescription>
            This will create a venue owner profile and change this user's role
            to Venue Owner.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Field>
            <label className="text-xs uppercase text-muted-foreground">
              Business Name *
            </label>
            <Input
              value={form.businessName}
              onChange={(e) =>
                setForm((f) => ({ ...f, businessName: e.target.value }))
              }
              placeholder="e.g. Skybar Lagos"
              required
            />
          </Field>
          <Field>
            <label className="text-xs uppercase text-muted-foreground">
              Business Email
            </label>
            <Input
              type="email"
              value={form.businessEmail}
              onChange={(e) =>
                setForm((f) => ({ ...f, businessEmail: e.target.value }))
              }
              placeholder="business@example.com"
            />
          </Field>
          <Field>
            <label className="text-xs uppercase text-muted-foreground">
              Business Phone
            </label>
            <Input
              value={form.businessPhone}
              onChange={(e) =>
                setForm((f) => ({ ...f, businessPhone: e.target.value }))
              }
              placeholder="+234..."
            />
          </Field>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader /> : <IconPlus size={15} />}
              Create Profile
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [showCreateVenueOwner, setShowCreateVenueOwner] = useState(false);

  const reload = () => {
    setLoading(true);
    getAdminUserById(id)
      .then(setUser)
      .catch(() => toast.error("Failed to load user"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
        <IconLoader2 size={36} className="animate-spin opacity-20" />
        <span className="text-xs uppercase font-medium">Loading user…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="bg-muted rounded-full p-4">
          <IconAlertCircle size={32} className="text-muted-foreground" />
        </div>
        <p className="font-medium">User not found</p>
        <Button variant="outline" asChild>
          <Link href="/a/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  const isVendor = user.role === "VENDOR";
  const isVenueOwner = user.role === "VENUE_OWNER" || !!user.venueOwnerProfile;

  const TABS: { key: Tab; label: string; count?: number; show?: boolean }[] = (
    [
      { key: "overview" as Tab, label: "Overview", show: true },
      { key: "orders" as Tab, label: "Ticket Orders", count: user.totalTicketOrders, show: true },
      { key: "tickets" as Tab, label: "Tickets", count: user.totalTickets, show: true },
      { key: "reservations" as Tab, label: "Reservations", count: user.totalReservations, show: true },
      { key: "shop" as Tab, label: "Shop Orders", count: user.totalEcomOrders, show: true },
      { key: "events" as Tab, label: "Events Listed", count: user.events?.length, show: isVendor },
      { key: "venues" as Tab, label: "Venues", count: user.venueOwnerProfile?.venues?.length, show: isVenueOwner || !user.venueOwnerProfile },
    ] as { key: Tab; label: string; count?: number; show?: boolean }[]
  ).filter((t) => t.show);

  return (
    <div className="space-y-4">
      {/* Dialogs */}
      <CreateVenueOwnerDialog
        userId={user.id}
        open={showCreateVenueOwner}
        onClose={() => setShowCreateVenueOwner(false)}
        onCreated={reload}
      />

      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <PageHeader
          title={`${user.firstName} ${user.lastName}`}
          back
          fallbackHref="/a/users"
          description={`@${user.username} · ${user.email}`}
          badges={[
            ROLE_LABEL[user.role] ?? user.role,
            ...(user.userTier && user.userTier !== "standard"
              ? [user.userTier.toUpperCase()]
              : []),
            ...(user.admin
              ? [`${user.admin.position.replace(/_/g, " ")}`]
              : []),
          ]}
        />
        {/* Actions */}
        {!user.venueOwnerProfile && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCreateVenueOwner(true)}
            className="shrink-0"
          >
            <IconBuilding size={14} />
            Set as Venue Owner
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard
          icon={IconCurrencyNaira}
          label="Total Spend"
          value={user.totalSpend > 0 ? formatNaira(user.totalSpend) : "₦0"}
          sub="Tickets + Reservations"
          color="text-green-400"
        />
        <StatCard
          icon={IconTicket}
          label="Tickets"
          value={user.totalTickets}
          sub={`${user.totalTicketOrders} order${user.totalTicketOrders !== 1 ? "s" : ""}`}
          color="text-blue-400"
        />
        <StatCard
          icon={IconCalendar}
          label="Reservations"
          value={user.totalReservations}
          color="text-purple-400"
        />
        {isVendor ? (
          <StatCard
            icon={IconWallet}
            label="Vendor Revenue"
            value={formatNaira(user.vendorTotalRevenue ?? 0)}
            sub={
              user.walletBalance != null
                ? `Wallet: ${formatNaira(user.walletBalance)}`
                : undefined
            }
            color="text-orange-400"
          />
        ) : (
          <StatCard
            icon={IconShoppingBag}
            label="Shop Orders"
            value={user.totalEcomOrders}
            color="text-orange-400"
          />
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b pb-2 overflow-x-auto">
        {TABS.map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={tab === t.key ? "default" : "ghost"}
            onClick={() => setTab(t.key)}
            className={cn("shrink-0", tab !== t.key && "text-muted-foreground")}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-px text-[10px] font-bold",
                  tab === t.key
                    ? "bg-white/20"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {t.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Profile card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full bg-muted shrink-0 overflow-hidden flex items-center justify-center text-xl font-bold uppercase text-muted-foreground">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      `${user.firstName[0]}${user.lastName[0]}`
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-base">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <Badge
                        className={cn(
                          "text-[9px] font-bold uppercase px-2 py-0",
                          ROLE_STYLES[user.role] ??
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {ROLE_LABEL[user.role] ?? user.role}
                      </Badge>
                      {user.emailVerified && (
                        <Badge className="text-[9px] font-bold uppercase px-2 py-0 bg-green-500/10 text-green-500">
                          <IconCheck size={9} className="mr-0.5" /> Verified
                        </Badge>
                      )}
                      {!user.onboardingCompleted && (
                        <Badge className="text-[9px] font-bold uppercase px-2 py-0 bg-yellow-500/10 text-yellow-500">
                          Onboarding Incomplete
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ProfileField label="Email" value={user.email} />
                  <ProfileField label="Phone" value={user.phoneNumber} />
                  <ProfileField label="Gender" value={user.gender} />
                  <ProfileField label="Date of Birth" value={user.dob} />
                  <ProfileField label="City" value={user.city} />
                  <ProfileField label="State" value={user.state} />
                  <ProfileField label="Country" value={user.country} />
                  <ProfileField label="Address" value={user.address} />
                  <ProfileField label="User Tier" value={user.userTier} />
                  <ProfileField
                    label="Joined"
                    value={formatDate(user.createdAt)}
                  />
                </div>

                {user.interests && user.interests.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground mb-2">
                        Interests
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {user.interests.map((i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {i}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Admin record */}
            {user.admin && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-1.5 text-sm">
                    <IconStar size={13} /> Admin Record
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  <ProfileField
                    label="Position"
                    value={user.admin.position.replace(/_/g, " ")}
                  />
                </CardContent>
              </Card>
            )}

            {/* Vendor profile */}
            {user.vendorProfile && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-1.5 text-sm">
                    <IconBriefcase size={13} /> Vendor Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <ProfileField
                    label="Brand Name"
                    value={user.vendorProfile.brandName}
                  />
                  <ProfileField
                    label="Brand Bio"
                    value={user.vendorProfile.brandBio}
                  />
                  <ProfileField
                    label="Website"
                    value={user.vendorProfile.website}
                  />
                  <ProfileField
                    label="Instagram"
                    value={user.vendorProfile.instagram}
                  />
                  {user.walletBalance != null && (
                    <div className="pt-1 border-t mt-2">
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Wallet Balance
                      </p>
                      <p className="text-base font-bold text-green-400">
                        {formatNaira(user.walletBalance)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Venue owner profile */}
            {user.venueOwnerProfile && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-1.5 text-sm">
                    <IconBuildingStore size={13} /> Venue Owner
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <ProfileField
                    label="Business"
                    value={user.venueOwnerProfile.businessName}
                  />
                  <ProfileField
                    label="Email"
                    value={user.venueOwnerProfile.businessEmail}
                  />
                  <ProfileField
                    label="Phone"
                    value={user.venueOwnerProfile.businessPhone}
                  />
                  <div className="flex items-center justify-between text-xs pt-1 border-t mt-1">
                    <span className="text-muted-foreground">Paystack Verified</span>
                    {user.venueOwnerProfile.isVerified ? (
                      <span className="flex items-center gap-1 text-green-500 font-medium">
                        <IconCheck size={12} /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 font-medium">
                        <IconX size={12} /> No
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {user.venueOwnerProfile.venues?.length ?? 0} venue
                    {(user.venueOwnerProfile.venues?.length ?? 0) !== 1 ? "s" : ""}
                    {" "}linked
                  </p>
                </CardContent>
              </Card>
            )}

            {/* No venue owner profile — prompt to create */}
            {!user.venueOwnerProfile && (
              <Card className="border-dashed">
                <CardContent className="py-5 flex flex-col items-center gap-2 text-center">
                  <IconBuilding size={24} className="text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">
                    No venue owner profile
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCreateVenueOwner(true)}
                  >
                    <IconPlus size={13} />
                    Create Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Account flags */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm">Account Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                {[
                  { label: "Email Verified", value: user.emailVerified },
                  { label: "Onboarding Complete", value: user.onboardingCompleted },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">{f.label}</span>
                    {f.value ? (
                      <span className="flex items-center gap-1 text-green-500 font-medium">
                        <IconCheck size={12} /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 font-medium">
                        <IconX size={12} /> No
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── TICKET ORDERS TAB ────────────────────────────────────── */}
      {tab === "orders" && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Ticket Orders</CardTitle>
            <CardDescription>
              {user.totalTicketOrders} order
              {user.totalTicketOrders !== 1 ? "s" : ""} placed
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {user.orders.length === 0 ? (
              <EmptyState message="No ticket orders placed yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Event</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold uppercase tracking-tight">
                            {order.event.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(order.event.date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {order.reference}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {order.items.map((item) => (
                            <span
                              key={item.id}
                              className="text-[10px] text-muted-foreground"
                            >
                              {item.quantity}× {item.ticketTier.name}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold">
                          {formatNaira(order.total)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase px-2 py-0",
                            ORDER_STATUS_STYLES[order.status] ??
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── TICKETS TAB ──────────────────────────────────────────── */}
      {tab === "tickets" && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Tickets</CardTitle>
            <CardDescription>
              {user.totalTickets} ticket{user.totalTickets !== 1 ? "s" : ""}{" "}
              across {user.totalTicketOrders} order
              {user.totalTicketOrders !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {user.tickets.length === 0 ? (
              <EmptyState message="No tickets purchased yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Event</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>QR Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold uppercase tracking-tight">
                            {ticket.orderItem.order.event.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(ticket.orderItem.order.event.date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">
                          {ticket.orderItem.ticketTier.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                          <IconQrcode size={12} />
                          {ticket.code.slice(0, 12)}…
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase px-2 py-0",
                            ticket.isUsed
                              ? "bg-muted text-muted-foreground"
                              : "bg-green-500/10 text-green-500",
                          )}
                        >
                          {ticket.isUsed ? "Used" : "Valid"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── RESERVATIONS TAB ─────────────────────────────────────── */}
      {tab === "reservations" && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Reservations</CardTitle>
            <CardDescription>
              {user.totalReservations} reservation
              {user.totalReservations !== 1 ? "s" : ""} made
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {user.reservations.length === 0 ? (
              <EmptyState message="No reservations made yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Venue</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Deposit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booked</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.reservations.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold uppercase tracking-tight">
                            {r.venue.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {r.venue.city}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs">
                            {formatDate(r.date)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {r.timeSlot}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{r.partySize}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium">
                          {r.payment?.amount
                            ? formatNaira(r.payment.amount)
                            : r.depositAmount > 0
                              ? formatNaira(r.depositAmount)
                              : "Free"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase px-2 py-0",
                            RESERVATION_STATUS_STYLES[r.status] ??
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          {r.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(r.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          asChild
                        >
                          <Link href={`/a/venues/${r.venue.id}`}>
                            <IconEye size={13} />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── SHOP ORDERS TAB ──────────────────────────────────────── */}
      {tab === "shop" && (
        <div className="space-y-4">
          {user.ecomOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState message="No shop orders yet." />
              </CardContent>
            </Card>
          ) : (
            user.ecomOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-sm font-bold mt-0.5">
                        {formatNaira(order.totalAmount + order.deliveryFee)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          incl. {formatNaira(order.deliveryFee)} delivery
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      <Badge
                        className={cn(
                          "text-[9px] font-bold uppercase px-2 py-0",
                          order.status === "DELIVERED"
                            ? "bg-green-500/10 text-green-500"
                            : order.status === "CANCELLED"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-500",
                        )}
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-[9px] font-bold uppercase px-2 py-0",
                          order.paymentStatus === "PAID"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Ship to: {order.recipientName} · {order.city}, {order.state}
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Product</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-xs font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.variantName}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium">
                            {formatNaira(item.price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── VENDOR EVENTS TAB ────────────────────────────────────── */}
      {tab === "events" && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Events Listed</CardTitle>
                <CardDescription>
                  {user.events?.length ?? 0} event
                  {(user.events?.length ?? 0) !== 1 ? "s" : ""} created ·{" "}
                  {formatNaira(user.vendorTotalRevenue ?? 0)} total revenue
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!user.events?.length ? (
              <EmptyState message="No events listed yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.events.map((evt) => {
                    const pct =
                      evt.totalCapacity > 0
                        ? Math.round((evt.totalSold / evt.totalCapacity) * 100)
                        : 0;
                    return (
                      <TableRow key={evt.id}>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold uppercase tracking-tight">
                              {evt.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {evt.category.replace(/_/g, " ")}
                              {evt.isMemberOnly ? " · Members Only" : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{formatDate(evt.date)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="w-[120px] space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span>
                                {evt.totalSold}/{evt.totalCapacity}
                              </span>
                              <span>{pct}%</span>
                            </div>
                            <Progress value={pct} className="h-1" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold">
                            {formatNaira(evt.totalRevenue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-[9px] font-bold uppercase px-2 py-0",
                              EVENT_STATUS_STYLES[evt.status] ??
                                "bg-muted text-muted-foreground",
                            )}
                          >
                            {evt.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            asChild
                          >
                            <Link href={`/a/events/${evt.id}`}>
                              <IconEye size={13} />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── VENUES TAB ───────────────────────────────────────────── */}
      {tab === "venues" && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Venues</CardTitle>
                <CardDescription>
                  {user.venueOwnerProfile
                    ? `${user.venueOwnerProfile.venues?.length ?? 0} venue${(user.venueOwnerProfile.venues?.length ?? 0) !== 1 ? "s" : ""} linked to ${user.venueOwnerProfile.businessName}`
                    : "This user has no venue owner profile yet."}
                </CardDescription>
              </div>
              {!user.venueOwnerProfile && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateVenueOwner(true)}
                >
                  <IconPlus size={13} />
                  Create Venue Owner Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!user.venueOwnerProfile || !user.venueOwnerProfile.venues?.length ? (
              <EmptyState
                message={
                  user.venueOwnerProfile
                    ? "No venues linked to this owner yet. Venues can be assigned from the Venues admin page."
                    : "Create a venue owner profile first, then venues can be assigned here."
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Venue</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reservations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.venueOwnerProfile.venues.map((venue) => (
                    <TableRow key={venue.id}>
                      <TableCell>
                        <span className="text-xs font-semibold uppercase tracking-tight">
                          {venue.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {venue.city}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {venue.category.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium">
                          {venue._count.reservations}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase px-2 py-0",
                            VENUE_STATUS_STYLES[venue.status] ??
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          {venue.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(venue.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          asChild
                        >
                          <Link href={`/a/venues/${venue.id}`}>
                            <IconEye size={13} />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

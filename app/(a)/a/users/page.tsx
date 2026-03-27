"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconLoader2,
  IconAlertCircle,
  IconDownload,
  IconEye,
  IconUsers,
  IconTicket,
  IconCalendar,
  IconShoppingBag,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { PageHeader } from "@/components/PageHeader";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn, formatDate } from "@/lib/utils";
import { Loader } from "@/components/Loader";

import {
  getAdminUsers,
  formatNaira,
  type AdminUserListItem,
} from "@/lib/users-api";

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

const ROLES = ["", "USER", "VENDOR", "VENUE_OWNER", "ADMIN"];

function exportToCSV(users: AdminUserListItem[]) {
  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Username",
    "Phone",
    "Role",
    "Tier",
    "City",
    "State",
    "Country",
    "Onboarded",
    "Ticket Orders",
    "Tickets",
    "Reservations",
    "Shop Orders",
    "Total Spend (₦)",
    "Joined",
  ];

  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = users.map((u) =>
    [
      u.id,
      u.firstName,
      u.lastName,
      u.email,
      u.username,
      u.phoneNumber ?? "",
      ROLE_LABEL[u.role] ?? u.role,
      u.userTier ?? "",
      u.city ?? "",
      u.state ?? "",
      u.country ?? "",
      u.onboardingCompleted ? "Yes" : "No",
      u.totalTicketOrders,
      u.totalTickets,
      u.totalReservations,
      u.totalEcomOrders,
      (u.totalSpend / 100).toFixed(2),
      new Date(u.createdAt).toLocaleDateString("en-GB"),
    ]
      .map(escape)
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ekovibe-users-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const load = useCallback(async (q: string, role: string, p: number) => {
    setLoading(true);
    try {
      const res = await getAdminUsers({
        search: q || undefined,
        role: role || undefined,
        page: p,
        limit: 30,
      });
      setUsers(res.data);
      setMeta({ total: res.meta.total, totalPages: res.meta.totalPages });
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(search, roleFilter, page);
  }, [roleFilter, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load(search, roleFilter, 1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all users (no pagination) for export
      const res = await getAdminUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        limit: 10000,
        page: 1,
      });
      exportToCSV(res.data);
      toast.success(`Exported ${res.data.length} users`);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="User Directory"
          back
          description={`${meta.total.toLocaleString()} registered ${meta.total === 1 ? "user" : "users"} on the platform`}
        />
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting || loading}
        >
          {exporting ? (
            <Loader text="Exporting" />
          ) : (
            <>
              <IconDownload />
              Export CSV
            </>
          )}
        </Button>
      </div>

      {/* Summary stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Users",
            value: meta.total,
            icon: IconUsers,
            color: "text-blue-400",
          },
        ].map((s) => (
          <Card key={s.label} className="py-3">
            <CardContent className="flex items-center gap-3 px-4">
              <s.icon size={20} className={s.color} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Field className="flex-1 max-w-md">
          <InputGroup>
            <InputGroupInput
              id="user-search"
              placeholder="Search name, email, username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon align="inline-start">
              <IconSearch className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <div className="flex gap-2 flex-wrap items-center">
          <IconFilter size={15} className="text-muted-foreground" />
          {ROLES.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={roleFilter === r ? "default" : "outline"}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              className="capitalize text-xs"
            >
              {r === "" ? "All Roles" : (ROLE_LABEL[r] ?? r)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="p-0">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <IconLoader2 size={32} className="animate-spin opacity-20" />
              <span className="text-xs uppercase font-medium">
                Loading users…
              </span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="bg-muted rounded-full p-4">
                <IconAlertCircle size={32} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No users found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="hidden lg:table-cell text-center">
                    <div className="flex items-center justify-center gap-1">
                      <IconTicket size={13} /> Tickets
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell text-center">
                    <div className="flex items-center justify-center gap-1">
                      <IconCalendar size={13} /> Reservations
                    </div>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell text-center">
                    <div className="flex items-center justify-center gap-1">
                      <IconShoppingBag size={13} /> Orders
                    </div>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Total Spend
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-muted shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold uppercase text-muted-foreground">
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
                          <p className="font-semibold text-xs uppercase tracking-tight leading-tight">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase px-2 py-0 w-fit",
                            ROLE_STYLES[user.role] ??
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          {ROLE_LABEL[user.role] ?? user.role}
                        </Badge>
                        {user.userTier && user.userTier !== "standard" && (
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase px-2 py-0 w-fit border-yellow-500/40 text-yellow-500"
                          >
                            {user.userTier}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {[user.city, user.state, user.country]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-center">
                      <span className="text-xs font-medium">
                        {user.totalTickets}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-center">
                      <span className="text-xs font-medium">
                        {user.totalReservations}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-center">
                      <span className="text-xs font-medium">
                        {user.totalEcomOrders}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-xs font-bold">
                        {user.totalSpend > 0
                          ? formatNaira(user.totalSpend)
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/a/users/${user.id}`}>
                          <IconEye size={15} />
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

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {meta.totalPages} · {meta.total.toLocaleString()}{" "}
            users
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <IconChevronLeft size={14} />
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= meta.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <IconChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

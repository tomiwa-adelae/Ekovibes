"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  IconLoader2,
  IconSearch,
  IconBuilding,
  IconTicket,
  IconWallet,
  IconChevronRight,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { formatNaira } from "@/lib/events-api";
import { formatDate } from "@/lib/utils";
import { getAdminVendors, type VendorListItem } from "@/lib/wallet-api";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminVendors({
        search: debouncedSearch || undefined,
        limit: 50,
      });
      setVendors(res.data);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        back
        title="Vendors"
        description="All registered vendor accounts and their performance."
      />

      <div className="relative">
        <IconSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search vendors..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
          <IconBuilding size={32} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {search ? "No vendors match your search." : "No vendors yet."}
          </p>
        </div>
      ) : (
        <div className="divide-y border rounded-lg overflow-hidden">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/a/vendors/${vendor.id}`}
              className="flex items-center justify-between p-4 bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {vendor.vendorProfile?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vendor.vendorProfile.logoUrl}
                    alt={vendor.vendorProfile.brandName}
                    className="size-10 rounded-full object-cover shrink-0 hidden sm:block"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0 hidden sm:block">
                    <IconBuilding size={16} className="text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm">
                    {vendor.vendorProfile?.brandName ??
                      `${vendor.firstName} ${vendor.lastName}`}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {vendor.email} · Joined {formatDate(vendor.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 ml-4 shrink-0">
                <div className="text-right hidden md:block">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <IconTicket size={12} /> Events
                  </p>
                  <p className="text-sm font-semibold">{vendor.totalEvents}</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-sm font-semibold">
                    {formatNaira(vendor.totalRevenue)}
                  </p>
                </div>
                <div className="text-right hidden lg:block">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <IconWallet size={12} /> Wallet
                  </p>
                  <p className="text-sm font-semibold text-green-500">
                    {formatNaira(vendor.walletBalance)}
                  </p>
                </div>
                <IconChevronRight
                  size={16}
                  className="text-muted-foreground ml-2 shrink-0"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

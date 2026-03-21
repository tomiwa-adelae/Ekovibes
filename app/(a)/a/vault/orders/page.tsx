"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IconLoader2, IconSearch, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  getAdminOrders,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type EcomOrder,
  type EcomOrderStatus,
} from "@/lib/vault-api";
import { formatNaira } from "@/lib/events-api";
import { formatDate } from "@/lib/utils";

const STATUSES: { value: EcomOrderStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminVaultOrdersPage() {
  const [orders, setOrders] = useState<EcomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EcomOrderStatus | "">("");
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders({ limit: 50, search: search || undefined, status: status || undefined });
      setOrders(res.data);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader back title="Vault Orders" description={`${total} order${total !== 1 ? "s" : ""}`} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or email…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Button key={s.value} size="sm" variant={status === s.value ? "default" : "outline"} onClick={() => setStatus(s.value)}>
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">No orders found.</div>
      ) : (
        <div className="divide-y border rounded-xl overflow-hidden">
          {orders.map((order) => (
            <div key={order.id} className="p-4 bg-card flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`text-[10px] uppercase ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <Badge variant={order.paymentMethod === "PAY_ON_DELIVERY" ? "outline" : "secondary"} className="text-[10px]">
                    {order.paymentMethod === "PAY_ON_DELIVERY" ? "POD" : "Online"}
                  </Badge>
                </div>
                <p className="text-sm font-semibold">
                  {order.recipientName}
                  <span className="text-muted-foreground font-normal ml-2 text-xs">{order.user.email}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatNaira(order.totalAmount + order.deliveryFee)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {order.state} · {formatDate(order.createdAt)}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0">
                <Link href={`/a/vault/orders/${order.id}`}>
                  View <IconArrowRight size={14} className="ml-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

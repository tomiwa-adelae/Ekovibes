"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconLoader2,
  IconShoppingBag,
  IconArrowRight,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import {
  getUserOrders,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type EcomOrder,
} from "@/lib/vault-api";
import { formatNaira } from "@/lib/events-api";
import { formatDate } from "@/lib/utils";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<EcomOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserOrders()
      .then(setOrders)
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        back
        title="My Orders"
        description="Track your Vault orders."
      />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4 text-muted-foreground">
          <IconShoppingBag size={40} className="opacity-20" />
          <p>No orders yet.</p>
          <Button asChild variant="outline">
            <Link href="/vault">Browse The Vault</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y border rounded-xl overflow-hidden">
          {orders.map((order) => {
            const total = order.totalAmount + order.deliveryFee;
            return (
              <div
                key={order.id}
                className="p-4 bg-card flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={`text-[10px] uppercase tracking-widest ${ORDER_STATUS_COLORS[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {order.paymentMethod === "PAY_ON_DELIVERY"
                        ? "Pay on delivery"
                        : "Paid online"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{formatNaira(total)}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""} ·{" "}
                    {formatDate(order.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {order.items.map((i) => i.productName).join(", ")}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="shrink-0">
                  <Link href={`/orders/${order.id}`}>
                    Details <IconArrowRight size={14} className="ml-1" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

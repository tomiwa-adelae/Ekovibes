"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  IconLoader2,
  IconPackage,
  IconMapPin,
  IconTruck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  getAdminOrderById,
  updateOrderStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type EcomOrder,
  type EcomOrderStatus,
} from "@/lib/vault-api";
import { formatNaira } from "@/lib/events-api";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import { DEFAULT_IMAGE } from "@/constants";

const STATUSES: EcomOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<EcomOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<EcomOrderStatus>("PENDING");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminOrderById(id)
      .then((o) => {
        setOrder(o);
        setNewStatus(o.status);
        setTrackingNumber(o.trackingNumber ?? "");
        setNote(o.note ?? "");
      })
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updated = await updateOrderStatus(id, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
        note: note || undefined,
      });
      setOrder(updated);
      toast.success("Order updated");
    } catch {
      toast.error("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-40">
        <IconLoader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  if (!order) return null;

  const total = order.totalAmount + order.deliveryFee;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          back
          title={`Order · ${order.recipientName}`}
          description={`Placed ${formatDate(order.createdAt)} · ${order.user.email}`}
        />
        <Badge className={`text-xs ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <IconPackage size={15} /> Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="size-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.images[0] || DEFAULT_IMAGE}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.variantName} × {item.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNaira(item.price)} each
                    </p>
                  </div>
                  <p className="text-sm font-bold shrink-0">
                    {formatNaira(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatNaira(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery ({order.state})</span>
                  <span>{formatNaira(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Total</span>
                  <span>{formatNaira(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery */}
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <IconMapPin size={15} /> Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">{order.recipientName}</p>
              <a
                href={`tel:${order.phone}`}
                className="text-muted-foreground block hover:underline hover:text-primary"
              >
                {formatPhoneNumber(order.phone)}
              </a>
              <p className="text-muted-foreground">{order.addressLine}</p>
              <p className="text-muted-foreground">
                {order.city}, {order.state}
              </p>
              {order.note && (
                <p className="text-muted-foreground mt-2 border-l-2 pl-2">
                  {order.note}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — actions */}
        <div className="space-y-4">
          {/* Payment info */}
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <IconTruck size={15} /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>
                  {order.paymentMethod === "PAY_ON_DELIVERY"
                    ? "Pay on delivery"
                    : "Online (Paystack)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment status</span>
                <Badge
                  className={
                    order.paymentStatus === "PAID"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Update status */}
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm">Update Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as EcomOrderStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {ORDER_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tracking Number</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Internal Note</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note for customer…"
                  rows={2}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleUpdate}
                disabled={saving}
              >
                {saving ? (
                  <IconLoader2 size={14} className="animate-spin mr-1" />
                ) : null}
                Save Update
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

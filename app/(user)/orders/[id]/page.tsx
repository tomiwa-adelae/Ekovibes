"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconLoader2,
  IconCheck,
  IconPackage,
  IconTruck,
  IconMapPin,
  IconCreditCard,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import {
  getUserOrderById,
  retryPaystackOrder,
  verifyPaystackOrder,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type EcomOrder,
} from "@/lib/vault-api";
import { useAuth } from "@/store/useAuth";
import { formatNaira } from "@/lib/events-api";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import { DEFAULT_IMAGE } from "@/constants";

declare const PaystackPop: any;

const STATUS_STEPS = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

function UserOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const isSuccess = searchParams.get("success") === "1";

  const [order, setOrder] = useState<EcomOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // Inject Paystack script
  useEffect(() => {
    const existing = document.getElementById("paystack-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "paystack-script";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    getUserOrderById(id)
      .then(setOrder)
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRetryPayment = () => {
    if (!user || paying) return;
    setPaying(true);
    retryPaystackOrder(id)
      .then((result) => {
        const handler = PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
          email: user.email,
          amount: result.total,
          ref: result.reference,
          access_code: result.accessCode,
          callback: (response: { reference: string }) => {
            verifyPaystackOrder(response.reference)
              .then((updated) => {
                setOrder(updated);
                router.replace(`/orders/${id}?success=1`);
              })
              .catch(() => {
                toast.error("Payment verified but order failed. Contact support.");
                setPaying(false);
              });
          },
          onClose: () => {
            toast.error("Payment cancelled");
            setPaying(false);
          },
        });
        handler.openIframe();
      })
      .catch((e: any) => {
        toast.error(e?.message ?? "Failed to initiate payment");
        setPaying(false);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <IconLoader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) return null;

  const total = order.totalAmount + order.deliveryFee;
  const currentStep = STATUS_STEPS.indexOf(order.status as any);

  return (
    <div className="space-y-4">
      <PageHeader
        back
        title="Order Details"
        description={`Placed ${formatDate(order.createdAt)}`}
      />

      {isSuccess && (
        <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4">
          <div className="size-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <IconCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              {order.paymentMethod === "PAY_ON_DELIVERY"
                ? "Order placed!"
                : "Payment confirmed!"}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.paymentMethod === "PAY_ON_DELIVERY"
                ? "Pay when your order arrives at your door."
                : "Your order is being processed."}
            </p>
          </div>
        </div>
      )}

      {/* Status tracker */}
      {!["PENDING", "CANCELLED"].includes(order.status) && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center border-2 transition-colors ${done ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}`}
                      >
                        {done ? (
                          <IconCheck size={14} />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {i + 1}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] text-center ${active ? "font-semibold" : "text-muted-foreground"}`}
                      >
                        {ORDER_STATUS_LABELS[step]}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mb-5 transition-colors ${i < currentStep ? "bg-primary" : "bg-muted"}`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {order.trackingNumber && (
              <p className="text-xs text-muted-foreground mt-3">
                Tracking:{" "}
                <span className="font-mono font-medium text-foreground">
                  {order.trackingNumber}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Items */}
        <Card className="sm:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <IconPackage size={15} /> Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="size-12 shrink-0 rounded-lg overflow-hidden bg-muted">
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
                </div>
                <p className="text-sm font-medium shrink-0">
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
                <span>Delivery</span>
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
          <CardHeader className="border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <IconMapPin size={15} /> Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="font-medium">{order.recipientName}</p>
            <a
              href={`tel:${order.phone}`}
              className="block text-muted-foreground hover:underline hover:text-primary"
            >
              {formatPhoneNumber(order.phone)}
            </a>
            <p className="text-muted-foreground">{order.addressLine}</p>
            <p className="text-muted-foreground">
              {order.city}, {order.state}
            </p>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <IconTruck size={15} /> Payment & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Method</span>
              <span>
                {order.paymentMethod === "PAY_ON_DELIVERY"
                  ? "Pay on delivery"
                  : "Online"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment</span>
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
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge className={ORDER_STATUS_COLORS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
            {order.note && (
              <p className="text-xs text-muted-foreground border-l-2 pl-2 mt-2">
                {order.note}
              </p>
            )}
            {order.paymentMethod === "PAYSTACK" &&
              order.paymentStatus !== "PAID" && (
                <Button
                  className="w-full mt-2"
                  onClick={handleRetryPayment}
                  disabled={paying}
                >
                  {paying ? (
                    <IconLoader2 size={15} className="animate-spin mr-2" />
                  ) : (
                    <IconCreditCard size={15} className="mr-2" />
                  )}
                  Complete Payment
                </Button>
              )}
          </CardContent>
        </Card>
      </div>

      <Button asChild variant="outline">
        <Link href="/orders">← All Orders</Link>
      </Button>
    </div>
  );
}

export default function Page() {
  return <Suspense><UserOrderDetailPage /></Suspense>;
}

"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconLoader2,
  IconMinus,
  IconPlus,
  IconTrash,
  IconShoppingBag,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth";
import { formatNaira } from "@/lib/events-api";
import { DEFAULT_IMAGE } from "@/constants";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CartPage() {
  const { cart, loading, fetchCart, updateItem, removeItem } = useCart();
  const { user, _hasHydrated } = useAuth();

  useEffect(() => {
    if (_hasHydrated && user) {
      fetchCart();
    }
  }, [_hasHydrated, user, fetchCart]);

  if (!_hasHydrated || loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <IconLoader2 size={32} className="animate-spin opacity-20" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-32 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        <p className="text-muted-foreground">
          Please log in to view your cart.
        </p>
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => {
    const price = item.variant.price ?? item.variant.product.price;
    return sum + price * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <main className="container py-12 space-y-6">
        <PageHeader back title="Your Cart" description="" />
        <div className="flex flex-col items-center py-32 gap-4 text-muted-foreground">
          <IconShoppingBag size={48} className="opacity-20" />
          <p className="text-lg">Your cart is empty</p>
          <Button asChild variant="outline">
            <Link href="/vault">
              <IconArrowLeft size={15} className="mr-1" /> Browse The Vault
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-12">
      <PageHeader
        back
        title="Your Cart"
        description={`${items.length} item${items.length !== 1 ? "s" : ""}`}
      />

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.variant.price ?? item.variant.product.price;
            return (
              <div
                key={item.id}
                className="flex gap-4 p-4 border rounded-xl bg-card"
              >
                <div className="size-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.variant.product.images[0] || DEFAULT_IMAGE}
                    alt={item.variant.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    href={`/vault/${item.variant.product.slug}`}
                    className="text-sm font-semibold hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.variant.product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {item.variant.name}
                  </p>
                  <p className="text-sm font-bold">{formatNaira(price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                  <p className="text-sm font-bold">
                    {formatNaira(price * item.quantity)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={async () => {
                        if (item.quantity <= 1) return;
                        try {
                          await updateItem(item.id, item.quantity - 1);
                        } catch {
                          toast.error("Failed to update");
                        }
                      }}
                      disabled={item.quantity <= 1}
                    >
                      <IconMinus size={12} />
                    </Button>
                    <span className="w-6 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={async () => {
                        try {
                          await updateItem(item.id, item.quantity + 1);
                        } catch {
                          toast.error("Failed to update");
                        }
                      }}
                    >
                      <IconPlus size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={async () => {
                        try {
                          await removeItem(item.id);
                        } catch {
                          toast.error("Failed to remove");
                        }
                      }}
                    >
                      <IconTrash size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardHeader className="border-b">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2 text-sm">
                {items.map((item) => {
                  const price =
                    item.variant.price ?? item.variant.product.price;
                  return (
                    <div key={item.id} className="flex justify-between gap-2">
                      <span className="text-muted-foreground line-clamp-1">
                        {item.variant.product.name} × {item.quantity}
                      </span>
                      <span className="shrink-0">
                        {formatNaira(price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Delivery fee calculated at checkout based on your state.
              </p>
              <Button asChild className="w-full">
                <Link href="/vault/checkout">Proceed to Checkout</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/vault">
                  <IconArrowLeft /> Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

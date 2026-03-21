"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconLoader2,
  IconCreditCard,
  IconTruck,
  IconCheck,
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as RPNInput from "react-phone-number-input";
import {
  PhoneInput,
  CountrySelect,
  FlagComponent,
} from "@/components/PhoneNumberInput";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth";
import { formatNaira } from "@/lib/events-api";
import { DEFAULT_IMAGE } from "@/constants";
import {
  getDeliveryZones,
  initiatePaystackOrder,
  verifyPaystackOrder,
  placePayOnDeliveryOrder,
  NIGERIAN_STATES,
  type DeliveryZone,
} from "@/lib/vault-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";

declare const PaystackPop: any;

const checkoutSchema = z.object({
  recipientName: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Valid phone number required"),
  addressLine: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "Please select a state"),
  note: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuth();
  const { cart, fetchCart, clear } = useCart();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<
    "PAYSTACK" | "PAY_ON_DELIVERY"
  >("PAYSTACK");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      recipientName: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      note: "",
    },
  });

  const selectedState = form.watch("state");

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
    if (_hasHydrated && user) {
      fetchCart();
      getDeliveryZones()
        .then(setZones)
        .catch(() => {});
      form.reset({
        recipientName: `${user.firstName} ${user.lastName}`,
        phone: (user as any).phoneNumber ?? "",
        city: (user as any).city ?? "",
        state: (user as any).state ?? "",
        addressLine: "",
        note: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, user, fetchCart]);

  if (!_hasHydrated) return null;

  if (!user) {
    return (
      <div className="container py-32 text-center space-y-4">
        <p className="text-muted-foreground">Please log in to checkout.</p>
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    );
  }

  const items = cart?.items ?? [];
  if (items.length === 0) {
    router.replace("/vault/cart");
    return null;
  }

  const subtotal = items.reduce((s, item) => {
    return (
      s + (item.variant.price ?? item.variant.product.price) * item.quantity
    );
  }, 0);

  const deliveryZone = zones.find((z) => z.state === selectedState);
  const deliveryFee = deliveryZone?.fee ?? null;
  const grandTotal = deliveryFee !== null ? subtotal + deliveryFee : null;

  const onSubmit = async (values: CheckoutValues) => {
    if (deliveryFee === null) {
      toast.error("Delivery to this state is not available yet.");
      return;
    }

    setSubmitting(true);

    const payload = {
      paymentMethod,
      recipientName: values.recipientName.trim(),
      phone: values.phone.trim(),
      addressLine: values.addressLine.trim(),
      city: values.city.trim(),
      state: values.state,
      note: values.note?.trim() || undefined,
    };

    if (paymentMethod === "PAY_ON_DELIVERY") {
      try {
        const order = await placePayOnDeliveryOrder(payload);
        await clear();
        router.push(`/orders/${order.id}?success=1`);
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to place order");
        setSubmitting(false);
      }
      return;
    }

    // Paystack
    try {
      const result = await initiatePaystackOrder(payload);
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
        email: user.email,
        amount: result.total,
        ref: result.reference,
        access_code: result.accessCode,
        callback: (response: { reference: string }) => {
          verifyPaystackOrder(response.reference)
            .then(() => clear())
            .then(() => {
              router.push(`/orders/${result.orderId}?success=1`);
            })
            .catch(() => {
              toast.error(
                "Payment verified but order failed. Contact support.",
              );
              setSubmitting(false);
            });
        },
        onClose: () => {
          toast.error("Payment cancelled");
          setSubmitting(false);
        },
      });
      handler.openIframe();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to initiate payment");
      setSubmitting(false);
    }
  };

  return (
    <main className="container py-12">
      <PageHeader back title="Checkout" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <IconTruck size={16} /> Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <RPNInput.default
                          className="flex rounded-md shadow-xs"
                          international
                          defaultCountry="NG"
                          flagComponent={FlagComponent}
                          countrySelectComponent={CountrySelect}
                          inputComponent={PhoneInput}
                          placeholder="+2348012345679"
                          value={field.value}
                          onChange={(value) => field.onChange(value ?? "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressLine"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="House/flat number, street name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>City / LGA</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Lekki, Victoria Island"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>State</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NIGERIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedState && deliveryFee !== null && (
                        <p className="text-xs text-muted-foreground">
                          Delivery fee:{" "}
                          <span className="font-medium text-foreground">
                            {formatNaira(deliveryFee)}
                          </span>
                        </p>
                      )}
                      {selectedState && deliveryFee === null && (
                        <p className="text-xs text-destructive">
                          Delivery to this state is not yet available.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Order Note (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special instructions…"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconCreditCard size={16} /> Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) =>
                    setPaymentMethod(v as "PAYSTACK" | "PAY_ON_DELIVERY")
                  }
                >
                  <label
                    className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${paymentMethod === "PAYSTACK" ? "border-primary bg-primary/5" : "hover:border-muted-foreground/40"}`}
                  >
                    <RadioGroupItem value="PAYSTACK" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Pay Online</p>
                      <p className="text-xs text-muted-foreground">
                        Card, bank transfer, USSD via Paystack
                      </p>
                    </div>
                    <IconCreditCard
                      size={18}
                      className="text-muted-foreground"
                    />
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${paymentMethod === "PAY_ON_DELIVERY" ? "border-primary bg-primary/5" : "hover:border-muted-foreground/40"}`}
                  >
                    <RadioGroupItem value="PAY_ON_DELIVERY" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Pay on Delivery</p>
                      <p className="text-xs text-muted-foreground">
                        Cash or transfer when your order arrives
                      </p>
                    </div>
                    <IconTruck size={18} className="text-muted-foreground" />
                  </label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader className="border-b">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => {
                    const price =
                      item.variant.price ?? item.variant.product.price;
                    return (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="size-12 shrink-0 rounded-lg overflow-hidden bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              item.variant.product.images[0] || DEFAULT_IMAGE
                            }
                            alt={item.variant.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-1">
                            {item.variant.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.variant.name} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-xs font-medium shrink-0">
                          {formatNaira(price * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>
                      {deliveryFee !== null ? formatNaira(deliveryFee) : "—"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>
                    {grandTotal !== null ? formatNaira(grandTotal) : "—"}
                  </span>
                </div>
                {paymentMethod === "PAY_ON_DELIVERY" && (
                  <Badge
                    variant="outline"
                    className="text-xs w-full justify-center py-1.5"
                  >
                    Pay when your order arrives
                  </Badge>
                )}
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <IconLoader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <IconCheck />
                  )}
                  {paymentMethod === "PAY_ON_DELIVERY"
                    ? "Place Order"
                    : "Pay Now"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </main>
  );
}

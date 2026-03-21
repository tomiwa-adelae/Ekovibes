"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconLoader2,
  IconCheck,
  IconBuilding,
  IconBuildingBank,
  IconSearch,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  onboardVenueOwner,
  listBanks,
  verifyBankAccount,
  type Bank,
} from "@/lib/reservations-api";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as RPNInput from "react-phone-number-input";
import {
  PhoneInput,
  CountrySelect,
  FlagComponent,
} from "@/components/PhoneNumberInput";

const STEPS = [
  { title: "Business Info", icon: IconBuilding },
  { title: "Bank Details", icon: IconBuildingBank },
];

const step0Schema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessEmail: z.string().email("Invalid email address").or(z.literal("")),
  businessPhone: z.string().optional(),
});

const step1Schema = z.object({
  bankCode: z.string().min(1, "Please select a bank"),
  accountNumber: z
    .string()
    .length(10, "Account number must be exactly 10 digits")
    .regex(/^\d+$/, "Digits only"),
});

type Step0Values = z.infer<typeof step0Schema>;
type Step1Values = z.infer<typeof step1Schema>;

export default function VenueOwnerOnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [step0Data, setStep0Data] = useState<Step0Values | null>(null);

  // Bank list state
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState("");

  // Account verification state
  const [verifying, setVerifying] = useState(false);
  const [verifiedAccountName, setVerifiedAccountName] = useState("");

  const form0 = useForm<Step0Values>({
    resolver: zodResolver(step0Schema),
    defaultValues: { businessName: "", businessEmail: "", businessPhone: "" },
  });

  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { bankCode: "", accountNumber: "" },
  });

  const { watch: watch1, setValue: setValue1 } = form1;
  const bankCode = watch1("bankCode");
  const accountNumber = watch1("accountNumber");

  // Load banks when entering step 1
  useEffect(() => {
    if (step !== 1 || banks.length > 0) return;
    setBanksLoading(true);
    listBanks()
      .then(setBanks)
      .catch(() => toast.error("Could not load bank list"))
      .finally(() => setBanksLoading(false));
  }, [step, banks.length]);

  // Clear verification whenever bank or account number changes
  useEffect(() => {
    setVerifiedAccountName("");
  }, [bankCode, accountNumber]);

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()),
  );

  const canVerify =
    bankCode && accountNumber.length === 10 && !verifying && !verifiedAccountName;

  const handleVerify = async () => {
    if (!canVerify) return;
    setVerifying(true);
    try {
      const res = await verifyBankAccount(accountNumber, bankCode);
      setVerifiedAccountName(res.account_name);
      toast.success("Account verified");
    } catch {
      toast.error("Could not verify account. Check the number and bank.");
    } finally {
      setVerifying(false);
    }
  };

  const handleStep0Submit = (values: Step0Values) => {
    setStep0Data(values);
    setStep(1);
  };

  const handleStep1Submit = async (values: Step1Values) => {
    if (!step0Data || !verifiedAccountName) return;
    setSubmitting(true);
    try {
      await onboardVenueOwner({
        businessName: step0Data.businessName,
        businessEmail: step0Data.businessEmail || undefined,
        businessPhone: step0Data.businessPhone || undefined,
        bankCode: values.bankCode,
        accountNumber: values.accountNumber,
        accountName: verifiedAccountName,
      });
      toast.success("Account set up! Welcome to The Black Book.");
      router.replace("/venue-dashboard");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ?? "Setup failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBankName = banks.find((b) => b.code === bankCode)?.name;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs uppercase text-muted-foreground">
            The Black Book · Partner Setup
          </p>
          <h1 className="text-3xl font-semibold uppercase">List Your Venue</h1>
          <p className="text-sm text-muted-foreground">
            Set up your venue owner account to start accepting reservations.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center max-w-md mx-auto gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  i === step
                    ? "text-foreground"
                    : i < step
                      ? "text-green-500"
                      : "text-muted-foreground"
                }`}
              >
                <div
                  className={`size-6 rounded-full flex items-center justify-center text-xs border transition-colors ${
                    i < step
                      ? "bg-green-500 border-green-500 text-white"
                      : i === step
                        ? "bg-foreground border-foreground text-background"
                        : "border-border"
                  }`}
                >
                  {i < step ? <IconCheck size={12} /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px ${i < step ? "bg-green-500" : "bg-border"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 0 — Business Info */}
        {step === 0 && (
          <Form {...form0}>
            <form onSubmit={form0.handleSubmit(handleStep0Submit)}>
              <Card>
                <CardContent className="space-y-4">
                  <FormField
                    control={form0.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Business Name <span className="text-red-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Marble Lagos Ltd."
                            autoFocus
                          />
                        </FormControl>
                        <FormDescription>
                          The name your venue operates under.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form0.control}
                    name="businessEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Business Email{" "}
                          <span className="text-muted-foreground font-normal">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="reservations@yourvenue.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form0.control}
                    name="businessPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Business Phone{" "}
                          <span className="text-muted-foreground font-normal">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <RPNInput.default
                            className="flex rounded-md shadow-xs"
                            international
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
                </CardContent>
              </Card>

              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1">
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Step 1 — Bank Details */}
        {step === 1 && (
          <Form {...form1}>
            <form onSubmit={form1.handleSubmit(handleStep1Submit)}>
              <Card>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Deposits collected on your behalf will be paid out to this
                    account.
                  </p>

                  {/* Bank selector with search */}
                  <FormField
                    control={form1.control}
                    name="bankCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Bank <span className="text-red-400">*</span>
                        </FormLabel>
                        <div className="border border-border rounded-md overflow-hidden">
                          <div className="flex items-center gap-2 px-3 border-b border-border">
                            <IconSearch size={14} className="text-muted-foreground shrink-0" />
                            <input
                              type="text"
                              placeholder="Search banks…"
                              value={bankSearch}
                              onChange={(e) => setBankSearch(e.target.value)}
                              className="w-full py-2 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                            />
                          </div>
                          <div className="max-h-44 overflow-y-auto">
                            {banksLoading ? (
                              <div className="flex items-center justify-center py-6 text-muted-foreground text-sm gap-2">
                                <IconLoader2 size={14} className="animate-spin" />
                                Loading banks…
                              </div>
                            ) : filteredBanks.length === 0 ? (
                              <p className="py-4 text-center text-sm text-muted-foreground">
                                No banks found
                              </p>
                            ) : (
                              filteredBanks.map((b) => (
                                <button
                                  key={b.code}
                                  type="button"
                                  onClick={() => {
                                    field.onChange(b.code);
                                    setBankSearch("");
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-muted ${
                                    field.value === b.code
                                      ? "bg-muted font-medium"
                                      : ""
                                  }`}
                                >
                                  {b.name}
                                  {field.value === b.code && (
                                    <IconCheck
                                      size={12}
                                      className="inline ml-2 text-green-500"
                                    />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                        {selectedBankName && (
                          <p className="text-xs text-muted-foreground">
                            Selected: <span className="font-medium text-foreground">{selectedBankName}</span>
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Account number + verify */}
                  <FormField
                    control={form1.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Account Number{" "}
                          <span className="text-red-400">*</span>
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="10-digit account number"
                              maxLength={10}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className="shrink-0"
                            disabled={!canVerify && !verifying}
                            onClick={handleVerify}
                          >
                            {verifying ? (
                              <IconLoader2 size={14} className="animate-spin" />
                            ) : (
                              "Verify"
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Verified account name badge */}
                  {verifiedAccountName && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-500">
                      <IconCheck size={16} />
                      <span className="font-medium">{verifiedAccountName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(0)}
                  disabled={submitting}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!verifiedAccountName || submitting}
                >
                  {submitting && (
                    <IconLoader2 size={14} className="animate-spin mr-1" />
                  )}
                  Complete Setup
                </Button>
              </div>
            </form>
          </Form>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Your venue will be reviewed by our team before going live.
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  IconWallet,
  IconArrowDown,
  IconLoader2,
  IconCheck,
  IconX,
  IconBuildingBank,
  IconSearch,
  IconCoin,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getVenueOwnerWallet,
  getVenueOwnerWithdrawals,
  requestVenueOwnerWithdrawal,
  listBanks,
  verifyBankAccount,
  formatNaira,
  type VenueOwnerWallet,
  type VenueOwnerWithdrawal,
  type WithdrawalStatus,
  type Bank,
} from "@/lib/reservations-api";

const STATUS_STYLES: Record<WithdrawalStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-blue-500/10 text-blue-400",
  REJECTED: "bg-red-500/10 text-red-400",
  TRANSFERRED: "bg-green-500/10 text-green-500",
};

const STATUS_LABELS: Record<WithdrawalStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  TRANSFERRED: "Transferred",
};

const MIN_WITHDRAWAL = 100_000; // ₦1,000 in kobo

export default function VenueOwnerWalletPage() {
  const [wallet, setWallet] = useState<VenueOwnerWallet | null>(null);
  const [history, setHistory] = useState<VenueOwnerWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Withdrawal form
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getVenueOwnerWallet(), getVenueOwnerWithdrawals()])
      .then(([w, h]) => {
        setWallet(w);
        setHistory(h);
      })
      .catch(() => toast.error("Failed to load wallet"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openWithdraw = async () => {
    setShowWithdraw(true);
    if (banks.length === 0) {
      setBanksLoading(true);
      try {
        const list = await listBanks();
        setBanks(list);
      } catch {
        toast.error("Failed to load banks");
      } finally {
        setBanksLoading(false);
      }
    }
  };

  const resetForm = () => {
    setSelectedBank("");
    setAccountNumber("");
    setVerifiedName("");
    setBankSearch("");
    setAmount("");
  };

  const handleVerify = async () => {
    if (!selectedBank || accountNumber.length !== 10) return;
    setVerifying(true);
    setVerifiedName("");
    try {
      const res = await verifyBankAccount(accountNumber, selectedBank);
      setVerifiedName(res.account_name);
    } catch {
      toast.error("Could not verify account. Check the number and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!verifiedName || !selectedBank || !accountNumber || !amount) return;
    const kobo = Math.round(Number(amount) * 100);
    if (isNaN(kobo) || kobo < MIN_WITHDRAWAL) {
      toast.error("Minimum withdrawal is ₦1,000");
      return;
    }
    if (wallet && kobo > wallet.balance) {
      toast.error("Amount exceeds available balance");
      return;
    }
    setSubmitting(true);
    try {
      await requestVenueOwnerWithdrawal({
        amount: kobo,
        bankCode: selectedBank,
        accountNumber,
        accountName: verifiedName,
      });
      toast.success("Withdrawal request submitted. We'll process it shortly.");
      setShowWithdraw(false);
      resetForm();
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()),
  );

  const hasPending = history.some((h) => h.status === "PENDING");

  return (
    <main className="space-y-6">
      <PageHeader
        back
        title="Wallet"
        description="Your earnings from reservations and withdrawal history."
      />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : wallet ? (
        <>
          {/* Balance cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase font-medium flex items-center gap-1.5">
                  <IconWallet size={13} /> Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatNaira(wallet.balance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready to withdraw
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase font-medium flex items-center gap-1.5">
                  <IconCoin size={13} /> Total Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatNaira(wallet.totalEarned)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lifetime payout
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Withdraw button */}
          <Button
            onClick={openWithdraw}
            disabled={wallet.balance < MIN_WITHDRAWAL || hasPending}
            className="w-full sm:w-auto"
          >
            <IconArrowDown size={14} className="mr-1" /> Withdraw Funds
          </Button>
          {hasPending && (
            <p className="text-xs text-muted-foreground -mt-4">
              You have a pending withdrawal request. Wait for it to be processed
              before requesting another.
            </p>
          )}
          {wallet.balance < MIN_WITHDRAWAL && !hasPending && (
            <p className="text-xs text-muted-foreground -mt-4">
              Minimum withdrawal is ₦1,000.
            </p>
          )}

          {/* Withdrawal history */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Withdrawal History
            </p>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border rounded-xl">
                <IconBuildingBank
                  size={32}
                  className="text-muted-foreground/30"
                />
                <p className="text-sm text-muted-foreground">
                  No withdrawals yet.
                </p>
              </div>
            ) : (
              <div className="border rounded-xl divide-y overflow-hidden">
                {history.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium">
                        {formatNaira(w.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {w.accountName} · {w.accountNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(w.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {w.note && (
                        <p className="text-xs text-muted-foreground border-l-2 pl-2 mt-1">
                          {w.note}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={`text-[10px] shrink-0 ${STATUS_STYLES[w.status]}`}
                    >
                      {STATUS_LABELS[w.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Withdraw dialog */}
      <Dialog
        open={showWithdraw}
        onOpenChange={(o) => {
          if (!o) {
            setShowWithdraw(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto">
            {/* Available */}
            <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available</span>
              <span className="font-bold text-sm">
                {wallet ? formatNaira(wallet.balance) : "—"}
              </span>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amount (₦)</label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                min={1000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Minimum ₦1,000</p>
            </div>

            <Separator />

            {/* Bank picker */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Bank</label>
              {banksLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <IconLoader2 size={13} className="animate-spin" /> Loading
                  banks…
                </div>
              ) : (
                <Select
                  value={selectedBank}
                  onValueChange={(v) => {
                    setSelectedBank(v);
                    setVerifiedName("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 pb-1">
                      <div className="flex items-center gap-2 border rounded-md px-2">
                        <IconSearch
                          size={13}
                          className="text-muted-foreground shrink-0"
                        />
                        <input
                          className="flex-1 text-sm py-1.5 bg-transparent outline-none"
                          placeholder="Search bank…"
                          value={bankSearch}
                          onChange={(e) => setBankSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    {filteredBanks.map((b) => (
                      <SelectItem key={b.code} value={b.code}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Account number */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Account Number</label>
              <div className="flex gap-2">
                <Input
                  placeholder="10-digit number"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value.replace(/\D/g, ""));
                    setVerifiedName("");
                  }}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleVerify}
                  disabled={
                    verifying || !selectedBank || accountNumber.length !== 10
                  }
                >
                  {verifying ? (
                    <IconLoader2 size={13} className="animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>

            {/* Verified name */}
            {verifiedName && (
              <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 rounded-lg px-3 py-2">
                <IconCheck size={14} />
                <span className="font-medium">{verifiedName}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowWithdraw(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !verifiedName ||
                !amount ||
                Number(amount) * 100 < MIN_WITHDRAWAL
              }
            >
              {submitting && (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              )}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

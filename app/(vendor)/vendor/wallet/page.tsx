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
  IconRefresh,
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
import { formatNaira } from "@/lib/events-api";
import { formatDate } from "@/lib/utils";
import {
  getVendorWallet,
  getVendorWithdrawalHistory,
  listBanks,
  verifyBankAccount,
  requestWithdrawal,
  type VendorWallet,
  type WithdrawalRequest,
  type Bank,
  type WithdrawalStatus,
} from "@/lib/wallet-api";

const STATUS_STYLES: Record<WithdrawalStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-blue-500/10 text-blue-500",
  REJECTED: "bg-red-500/10 text-red-500",
  TRANSFERRED: "bg-green-500/10 text-green-500",
};

export default function VendorWalletPage() {
  const [wallet, setWallet] = useState<VendorWallet | null>(null);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Withdrawal form state
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, h] = await Promise.all([
        getVendorWallet(),
        getVendorWithdrawalHistory(),
      ]);
      setWallet(w);
      setHistory(h);
    } catch {
      toast.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openWithdraw = async () => {
    setShowWithdraw(true);
    setBankSearch("");
    setSelectedBank(null);
    setAccountNumber("");
    setAccountName("");
    setAmount("");
    if (banks.length === 0) {
      setBanksLoading(true);
      try {
        const b = await listBanks();
        setBanks(b);
      } catch {
        toast.error("Failed to load banks");
      } finally {
        setBanksLoading(false);
      }
    }
  };

  const handleVerifyAccount = async () => {
    if (!selectedBank || accountNumber.length !== 10) return;
    setVerifying(true);
    setAccountName("");
    try {
      const res = await verifyBankAccount(accountNumber, selectedBank.code);
      setAccountName(res.account_name);
      toast.success("Account verified");
    } catch {
      toast.error("Could not verify account. Check the number and bank.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitWithdrawal = async () => {
    if (!selectedBank || !accountNumber || !accountName || !amount) return;
    const amountKobo = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountKobo) || amountKobo < 100000) {
      toast.error("Minimum withdrawal is ₦1,000");
      return;
    }
    if (wallet && amountKobo > wallet.balance) {
      toast.error("Amount exceeds your wallet balance");
      return;
    }

    setSubmitting(true);
    try {
      await requestWithdrawal({
        amount: amountKobo,
        bankCode: selectedBank.code,
        accountNumber,
        accountName,
      });
      toast.success("Withdrawal request submitted! We'll process it shortly.");
      setShowWithdraw(false);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()),
  );

  const hasPending = history.some((r) => r.status === "PENDING");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <IconLoader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          back
          title="Wallet"
          description="Your earnings and withdrawal history."
        />
        <Button
          onClick={openWithdraw}
          disabled={!wallet || wallet.balance === 0 || hasPending}
        >
          <IconArrowDown size={16} className="mr-1" /> Withdraw
        </Button>
      </div>

      {/* Balance card */}
      <div className="rounded-xl border bg-card p-6 flex items-center gap-5">
        <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <IconWallet size={22} className="text-green-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-3xl font-bold mt-0.5">
            {formatNaira(wallet?.balance ?? 0)}
          </p>
          {hasPending && (
            <p className="text-xs text-yellow-500 mt-1">
              A withdrawal request is pending processing.
            </p>
          )}
        </div>
      </div>

      {/* Withdrawal history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Withdrawal History</h3>
          <Button variant="ghost" size="sm" onClick={load}>
            <IconRefresh size={14} className="mr-1" /> Refresh
          </Button>
        </div>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <IconBuildingBank size={32} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No withdrawal requests yet.
            </p>
          </div>
        ) : (
          <div className="divide-y border rounded-lg overflow-hidden">
            {history.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex size-10 rounded-full bg-muted items-center justify-center shrink-0">
                    <IconBuildingBank
                      size={18}
                      className="text-muted-foreground"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {formatNaira(req.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {req.accountName} · {req.accountNumber}
                    </p>
                    {req.note && req.status === "REJECTED" && (
                      <p className="text-xs text-red-400 mt-1">
                        Reason: {req.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {formatDate(req.createdAt)}
                  </p>
                  <Badge
                    className={`text-[10px] uppercase tracking-widest ${STATUS_STYLES[req.status]}`}
                  >
                    {req.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amount (₦)</label>
              <Input
                type="number"
                placeholder="e.g. 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1000}
                step={100}
              />
              <p className="text-xs text-muted-foreground">
                Available: {formatNaira(wallet?.balance ?? 0)} · Min ₦1,000
              </p>
            </div>

            {/* Bank selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Bank</label>
              {banksLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconLoader2 size={14} className="animate-spin" /> Loading
                  banks...
                </div>
              ) : (
                <>
                  <div className="relative">
                    <IconSearch
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      className="pl-8"
                      placeholder="Search bank..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                    />
                  </div>
                  <Select
                    value={selectedBank?.code ?? ""}
                    onValueChange={(code) => {
                      const b = banks.find((b) => b.code === code) ?? null;
                      setSelectedBank(b);
                      setAccountName("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {filteredBanks.map((b) => (
                        <SelectItem key={b.code} value={b.code}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Account number */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Account Number</label>
              <div className="flex gap-2">
                <Input
                  placeholder="10-digit account number"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    setAccountName("");
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    !selectedBank || accountNumber.length !== 10 || verifying
                  }
                  onClick={handleVerifyAccount}
                  className="shrink-0"
                >
                  {verifying ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>

            {/* Verified account name */}
            {accountName && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-500">
                <IconCheck size={16} />
                <span className="font-medium">{accountName}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdraw(false)}>
              Cancel
            </Button>
            <Button
              disabled={!accountName || !amount || !selectedBank || submitting}
              onClick={handleSubmitWithdrawal}
            >
              {submitting ? (
                <IconLoader2 size={14} className="animate-spin mr-1" />
              ) : (
                <IconArrowDown />
              )}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

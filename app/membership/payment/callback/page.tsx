"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { IconLoader2, IconCheck, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { publicFetch } from "@/lib/api";

function MembershipCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [tier, setTier] = useState<string>("");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) {
      setStatus("error");
      return;
    }

    publicFetch<{ success: boolean; tier: string }>(
      `/membership/payment/verify/${reference}`,
    )
      .then((res) => {
        setTier(res.tier);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <IconLoader2 size={32} className="animate-spin text-white mx-auto" />
          <p className="text-sm text-zinc-400 uppercase tracking-widest">
            Verifying payment…
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <IconX size={28} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
              Payment Not Verified
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              We couldn't confirm your payment. If you were charged, please contact
              support with your payment reference.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="border-zinc-800 text-zinc-300"
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const tierLabel = tier === "GOLD" ? "Gold" : "Black";
  const tierColor = tier === "GOLD" ? "#C9A84C" : "#ffffff";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div
          className="size-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: `${tierColor}15` }}
        >
          <IconCheck size={28} style={{ color: tierColor }} />
        </div>
        <div>
          <p
            className="text-xs uppercase tracking-widest font-bold mb-2"
            style={{ color: tierColor }}
          >
            {tierLabel} Member
          </p>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">
            Welcome to<br />
            <span style={{ color: tierColor }}>the inner circle</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-4">
            Your Ekovibe {tierLabel} membership is now active. Log in to access
            exclusive experiences and member-only content.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-wider"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/ticketing")}
            className="border-zinc-800 text-zinc-300"
          >
            Explore Events
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MembershipPaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <IconLoader2 size={32} className="animate-spin text-white" />
        </div>
      }
    >
      <MembershipCallbackInner />
    </Suspense>
  );
}

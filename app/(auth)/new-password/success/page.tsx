"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IconShieldCheck,
  IconArrowRight,
  IconDeviceMobileCheck,
} from "@tabler/icons-react";

const page = () => {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">

      <div className="w-full max-w-sm text-center relative z-10 animate-in fade-in zoom-in duration-700">
        {/* 1. The Success Visual */}
        <div className="relative inline-block mb-10">
          <div className="w-20 h-20 bg-foreground rounded-full flex items-center justify-center">
            <IconShieldCheck size={40} className="text-background" stroke={1.5} />
          </div>
          {/* Decorative Ring */}
          <div className="absolute inset-0 border border-border rounded-full scale-150 animate-pulse" />
        </div>

        {/* 2. Messaging */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground mb-4">
            Identity <span className="text-foreground/40 italic">Restored</span>
          </h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
            Your security credentials have been updated. Your Ekovibe account is
            now active and secure.
          </p>
        </div>

        {/* 3. The Big Action */}
        <div className="space-y-4">
          <Button
            asChild
            className="w-full bg-foreground text-background hover:bg-foreground/90 py-8 rounded-none font-bold uppercase tracking-[0.3em] text-[10px]"
          >
            <Link href="/login">
              Return to Ecosystem <IconArrowRight className="ml-2" size={14} />
            </Link>
          </Button>

          {/* Security Tip */}
          <div className="pt-8 flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-muted-foreground">
            <IconDeviceMobileCheck size={14} />
            <span>Session Secured via Ekovibe Protocol</span>
          </div>
        </div>

        {/* 4. Support Footer */}
        <div className="mt-16 text-center">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
            Didn't perform this action? <br />
            <Link
              href="/support"
              className="text-foreground hover:underline mt-1 inline-block"
            >
              Secure your account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default page;

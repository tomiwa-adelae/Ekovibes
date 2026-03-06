"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IconShieldCheck,
  IconArrowRight,
  IconDeviceMobileCheck,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/Logo";

const page = () => {
  return (
    <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-card">
      <CardHeader className="flex flex-col text-center items-center pt-4">
        <Link
          href="/"
          className="flex items-center hover:text-primary text-slate-900 mb-1.5"
        >
          <Logo type="green" size="h-10" />
        </Link>
        <CardTitle>Identity Restored</CardTitle>
        <CardDescription>
          Your security credentials have been updated. Your Ekovibe account is
          now active and secure.
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        {/* 3. The Big Action */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">Return to Ecosystem</Link>
          </Button>

          {/* Security Tip */}
          <div className="pt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <IconDeviceMobileCheck size={14} />
            <span>Session Secured via Ekovibe Protocol</span>
          </div>
        </div>

        {/* 4. Support Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Didn't perform this action? <br />
            <Link
              href="/support"
              className="text-foreground hover:underline mt-1 inline-block"
            >
              Secure your account
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default page;

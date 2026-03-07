"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <div className="pt-20">
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <div className="w-full max-w-xl py-10">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

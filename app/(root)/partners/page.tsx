"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconCheck,
  IconArrowRight,
  IconBuildingStore,
  IconCreditCard,
  IconCalendarCheck,
  IconStar,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/useAuth";
import { VENUE_CATEGORY_LABELS } from "@/lib/reservations-api";

const FEATURED_CATEGORIES = [
  "RESTAURANT",
  "BAR",
  "NIGHTCLUB",
  "LOUNGE",
  "ROOFTOP_BAR",
  "PRIVATE_DINING",
  "SPA",
  "PRIVATE_MEMBERS_CLUB",
  "BEACH_CLUB",
  "JAZZ_CLUB",
  "COCKTAIL_BAR",
  "WINE_BAR",
  "YACHT",
  "POP_UP",
] as const;

const BENEFITS = [
  {
    icon: IconCreditCard,
    title: "Zero Upfront Cost",
    body: "No listing fee, no subscription. Ekovibe takes a small platform percentage only on successful deposits — we earn when you earn.",
  },
  {
    icon: IconCalendarCheck,
    title: "You Control Every Booking",
    body: "Choose Request to Book (you approve each reservation) or Instant Book. You decide the rules — we handle the rest.",
  },
  {
    icon: IconUsers,
    title: "The Right Audience",
    body: "Ekovibe members are Lagos' most social and discerning crowd. These are guests who spend, tip well, and come back.",
  },
  {
    icon: IconBuildingStore,
    title: "Flexible Space Configuration",
    body: "Define tables, private rooms, sections, bar seating, outdoor areas — each with its own capacity and minimum spend.",
  },
  {
    icon: IconShieldCheck,
    title: "Deposit Protection",
    body: "Set flat fee or percentage-of-minimum-spend deposits. Define your own cancellation and refund policy. Handled automatically.",
  },
  {
    icon: IconStar,
    title: "Waitlist Management",
    body: "When you're fully booked, guests join a waitlist. On cancellation, the next person is notified automatically.",
  },
];

const STANDARDS = [
  "A distinct identity — great food, atmosphere, service, or all three",
  "Professional staff and a consistent guest experience",
  "A legitimate business operating in Nigeria",
  "Ability to honour reservations reliably",
  "A valid Nigerian bank account for deposit payouts",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Apply",
    body: "Submit your venue details — name, category, location, photos. Our team reviews every application within 1–3 business days.",
  },
  {
    step: "02",
    title: "Set Up",
    body: "Configure spaces, operating hours, sessions, deposit policy, and cancellation rules — all in your dashboard.",
  },
  {
    step: "03",
    title: "Go Live",
    body: "Start accepting reservations. Deposits are split via Paystack and paid directly to your bank account.",
  },
];

export default function PartnersPage() {
  const { user, _hasHydrated } = useAuth();
  const router = useRouter();
  const isLoggedIn = _hasHydrated && !!user;

  const handleCTA = () => {
    if (isLoggedIn) {
      router.push(user?.role === "VENUE_OWNER" ? "/venue-dashboard" : "/venue-dashboard/onboard");
    } else {
      router.push("/register?intent=venue_owner");
    }
  };

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* ── Hero (always dark — image backdrop) ──────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-end md:items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/dining.jpg"
            alt="Dining venue"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark overlay stays in both themes — image needs contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container pb-20 pt-32 md:py-0">
          <div className="max-w-2xl">
            <p className="text-xs uppercase text-white/50 mb-5">
              The Black Book · Partner Programme
            </p>
            <h1 className="text-4xl md:text-7xl font-bold uppercase text-white mb-3">
              Your Venue.
              <br className="hidden lg:block" />
              <span className="text-white/40">Their New</span>
              <br className="hidden lg:block" />
              Favorite Table.
            </h1>
            <p className="text-white/60 text-base md:text-lg max-w-lg mb-6 leading-relaxed font-light">
              Join Lagos' most curated dining and nightlife platform. Reach
              Ekovibe's network of discerning members — people who know exactly
              where they want to be, and spend accordingly.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button onClick={handleCTA}>
                {isLoggedIn ? "Open Dashboard" : "Apply Now"}
              </Button>
              {!isLoggedIn && (
                <Button
                  variant="ghost"
                  asChild
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </div>
            {!isLoggedIn && (
              <p className="text-xs text-white/30 mt-4">
                An Ekovibe account is required to list your venue.{" "}
                <Link
                  href="/register?intent=venue_owner"
                  className="text-white/60 hover:text-white underline"
                >
                  Create one free.
                </Link>
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ── Category ticker (always dark — brand strip) ───────────────────── */}
      <section className="border-y border-foreground/10 bg-foreground py-4 overflow-hidden">
        <div className="flex gap-6 whitespace-nowrap">
          <div className="flex gap-6 shrink-0">
            {FEATURED_CATEGORIES.map((c) => (
              <span
                key={c}
                className="text-sm uppercase text-background/50 shrink-0"
              >
                {VENUE_CATEGORY_LABELS[c]}
                <span className="ml-6 text-background/20">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-background border-b border-border">
        <div className="container py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Image stack */}
            <div className="relative h-[480px] hidden lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/club.jpg"
                alt="Club venue"
                className="absolute top-0 left-0 w-2/3 h-72 object-cover rounded-xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/concierge.jpg"
                alt="Luxury concierge"
                className="absolute bottom-0 right-0 w-2/3 h-72 object-cover rounded-xl border-4 border-background"
              />
              {/* Floating stat card */}
              <div className="absolute bottom-24 left-4 bg-background/90 backdrop-blur border border-border rounded-xl p-4 z-10 shadow-lg">
                <p className="text-3xl font-black text-foreground">21+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                  Venue categories
                </p>
              </div>
            </div>

            {/* Steps */}
            <div>
              <p className="text-xs uppercase text-muted-foreground mb-3">
                How it works
              </p>
              <h2 className="text-4xl md:text-5xl font-bold uppercase text-foreground mb-8">
                Three Steps to Live
              </h2>
              <div className="space-y-6">
                {HOW_IT_WORKS.map((item) => (
                  <div key={item.step} className="flex gap-6 items-start">
                    <div className="shrink-0 w-12 h-12 rounded-full border border-border flex items-center justify-center">
                      <span className="text-xs font-black text-muted-foreground tabular-nums">
                        {item.step}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base uppercase mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Button onClick={handleCTA}>
                  {isLoggedIn ? "Go to Dashboard" : "Start Your Application"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────────── */}
      <section className="bg-muted/30 dark:bg-[#0a0a0a] border-b border-border py-16 md:py-24">
        <div className="container">
          <div className="max-w-xl mb-10">
            <p className="text-xs uppercase text-muted-foreground mb-3">
              What you get
            </p>
            <h2 className="text-4xl md:text-5xl font-bold uppercase text-foreground">
              Built for Serious Venues
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="group border border-border bg-background dark:bg-white/[0.02] hover:bg-muted dark:hover:bg-white/5 hover:border-foreground/20 dark:hover:border-white/15 rounded-xl p-6 transition-all duration-300"
                >
                  <div className="size-10 rounded-lg bg-muted dark:bg-white/5 flex items-center justify-center mb-5">
                    <Icon
                      size={20}
                      className="text-muted-foreground group-hover:text-foreground transition-colors"
                    />
                  </div>
                  <h3 className="font-bold text-foreground text-sm uppercase mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {b.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Venue showcase images ─────────────────────────────────────────── */}
      <section className="overflow-hidden">
        <div className="grid grid-cols-3 h-56 md:h-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/dining.jpg"
            alt="Dining"
            className="w-full h-full object-cover brightness-75 hover:brightness-100 transition-all duration-500"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/club.jpg"
            alt="Club"
            className="w-full h-full object-cover brightness-50 hover:brightness-90 transition-all duration-500"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/concierge.jpg"
            alt="Concierge"
            className="w-full h-full object-cover brightness-75 hover:brightness-100 transition-all duration-500"
          />
        </div>
      </section>

      {/* ── Standards ────────────────────────────────────────────────────── */}
      <section className="bg-muted/30 dark:bg-[#0a0a0a] border-b border-border py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs uppercase text-muted-foreground mb-3">
                Our standards
              </p>
              <h2 className="text-4xl md:text-5xl font-black uppercase text-foreground mb-4">
                The Black Book Is Curated
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                We review every application manually. We're looking for quality
                experiences that align with the Ekovibe ethos — not just any
                listing.
              </p>
            </div>
            <ul className="space-y-4 pt-2">
              {STANDARDS.map((item) => (
                <li key={item} className="flex items-start gap-3 group">
                  <div className="size-5 rounded-full border border-border flex items-center justify-center shrink-0 mt-0.5 group-hover:border-green-500/50 transition-colors">
                    <IconCheck
                      size={10}
                      className="text-muted-foreground group-hover:text-green-500 transition-colors"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="bg-background border-b border-border py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="border border-border rounded-2xl p-8 md:p-12 relative overflow-hidden bg-muted/20 dark:bg-white/[0.02]">
            {/* Subtle glow */}
            <div className="absolute -top-24 -right-24 size-64 bg-foreground/3 rounded-full blur-3xl pointer-events-none" />
            <p className="text-xs uppercase text-muted-foreground mb-3 relative">
              Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-bold uppercase text-foreground mb-4 relative">
              We Only Earn When You Do
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 relative max-w-xl">
              No monthly fees. No listing fees. No hidden charges. Ekovibe takes
              a small platform fee — deducted automatically at the point of each
              deposit. The remainder goes directly to your bank account via
              Paystack. Your fee rate is agreed transparently when your venue is
              approved.
            </p>
            <div className="flex flex-wrap gap-8 relative">
              {[
                { label: "Listing Fee", value: "₦0" },
                { label: "Monthly Fee", value: "₦0" },
                { label: "Platform Cut", value: "% on approval" },
              ].map((item) => (
                <div key={item.label} className="border-l-2 border-border pl-4">
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {item.value}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA (always dark — image backdrop) ──────────────────────── */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/events.jpg"
            alt="Event"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        </div>
        <div className="relative z-10 container py-24 text-center">
          <p className="text-xs uppercase text-white/40 mb-4">Ready?</p>
          <h2 className="text-4xl md:text-6xl font-bold uppercase text-white mb-6 leading-none">
            Join The
            <br />
            Black Book
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-10 leading-relaxed">
            Applications are reviewed by our team. Once approved, you can
            configure your venue and go live within minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={handleCTA}>
              {isLoggedIn ? "Open Venue Dashboard" : "Apply Now"}
              <IconArrowRight size={15} className="ml-1" />
            </Button>
            {!isLoggedIn && (
              <Button
                variant="ghost"
                asChild
                className="border border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
          {!isLoggedIn && (
            <p className="text-xs text-white/25 mt-5">
              New to Ekovibe?{" "}
              <Link
                href="/register?intent=venue_owner"
                className="text-white/50 underline hover:text-white"
              >
                Create your account →
              </Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "./Logo";
import { PHONE_NUMBER, WHATSAPP_LINK } from "@/constants";
import { env } from "@/lib/env";

async function subscribeToNewsletter(email: string) {
  const res = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/newsletter/subscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? "Subscription failed. Please try again.");
  }
  return data;
}

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await subscribeToNewsletter(email.trim());
      setSubmitted(true);
      setEmail("");
      toast.success("Check your inbox to confirm your subscription.");
    } catch (e: any) {
      toast.error(e?.message ?? "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-muted text-foreground pt-24 pb-12 border-t border-border">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href={"/"} className="flex items-center">
              <Logo type="green" />
            </Link>
            <p className="text-muted-foreground text-sm font-light leading-relaxed">
              The premier Life-OS for the modern socialite. Curating
              destinations and defining vibes since 2024.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] uppercase  text-muted-foreground mb-6">
              Ecosystem
            </h4>
            <ul className="space-y-4 text-xs uppercase  font-medium">
              <li>
                <Link
                  href="/reservations"
                  className="hover:text-muted-foreground transition-colors"
                >
                  The Black Book
                </Link>
              </li>
              <li>
                {/* <Link
                  href="/shop"
                  className="hover:text-muted-foreground transition-colors"
                > */}
                The Vault
                {/* </Link> */}
              </li>
              <li>
                {/* <Link
                  href="/concierge"
                  className="hover:text-muted-foreground transition-colors"
                > */}
                White Glove
                {/* </Link> */}
              </li>
              <li>
                <Link
                  href="/ticketing"
                  className="hover:text-muted-foreground transition-colors"
                >
                  Experiences
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="hover:text-muted-foreground transition-colors"
                >
                  List Your Venue
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Support */}
          <div>
            <h4 className="text-[10px] uppercase  text-muted-foreground mb-6">
              Inquiries
            </h4>
            <ul className="space-y-4 text-xs ">
              <li className="text-muted-foreground">
                Partnerships:{" "}
                <a
                  href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL_ADDRESS}`}
                  className="text-foreground hover:text-white hover:underline"
                >
                  {env.NEXT_PUBLIC_SUPPORT_EMAIL_ADDRESS}
                </a>
              </li>
              <li className="text-muted-foreground">
                Concierge:{" "}
                <a
                  href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL_ADDRESS}`}
                  className="text-foreground hover:text-white hover:underline"
                >
                  {env.NEXT_PUBLIC_SUPPORT_EMAIL_ADDRESS}
                </a>
              </li>
              <li className="text-muted-foreground">
                WhatsApp:{" "}
                <a
                  href={WHATSAPP_LINK}
                  className="text-foreground hover:text-white hover:underline"
                >
                  {PHONE_NUMBER}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] uppercase text-muted-foreground mb-6">
              The Vibe List
            </h4>
            {submitted ? (
              <p className="text-[10px] text-primary uppercase tracking-widest">
                Check your inbox to confirm.
              </p>
            ) : (
              <>
                <p className="text-[10px] text-white/40 mb-4 uppercase">
                  Join the inner circle for weekly drops.
                </p>
                <div className="flex border-b border-border pb-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                    placeholder="EMAIL ADDRESS"
                    disabled={loading}
                    className="bg-transparent border-none outline-none text-xs w-full placeholder:text-muted-foreground/40 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={loading || !email.trim()}
                    className="text-[10px] font-bold uppercase hover:text-muted-foreground transition-colors disabled:opacity-40 shrink-0"
                  >
                    {loading ? "..." : "Join"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-border gap-6">
          <p className="text-[10px] text-muted-foreground  uppercase">
            &copy; {new Date().getFullYear()} Ekovibe Lifestyle Group. All
            Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm, text-muted-foreground uppercase">
            <Link
              href="/terms"
              className="hover:text-white transition-colors text-xs"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors text-xs"
            >
              Privacy
            </Link>
            <Link
              href="/refund-policy"
              className="hover:text-white transition-colors text-xs"
            >
              Refunds
            </Link>
            <Link
              href="/faq"
              className="hover:text-white transition-colors text-xs"
            >
              FAQs
            </Link>
            <a
              href="https://www.instagram.com/ekovibe.ng/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors text-xs"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

import { PHONE_NUMBER } from "@/constants";
import Link from "next/link";

export const metadata = {
  title: "Refund & Cancellation Policy — Ekovibe",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border py-20">
        <div className="container">
          <p className="text-sm uppercase text-muted-foreground mb-2">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold uppercase mb-6">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: <span className="text-foreground">March 5, 2026</span>
          </p>
          <p className="text-sm text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            At Ekovibe, we balance the exclusivity of our partners with the
            flexibility our clients deserve. Please read this policy carefully
            before making any purchase or booking.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16">
        <div className="container space-y-16">
          {/* A: Event Ticketing */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground shrink-0">
                Section A
              </p>
              <div className="h-px flex-1 bg-border" />
            </div>
            <h2 className="text-xl font-bold uppercase">Event Ticketing</h2>
            <div className="bg-red-500/5 border rounded-md border-red-500/20 px-6 py-5 space-y-2">
              <p className="text-sm font-bold uppercase text-red-400">
                Strict No-Refund Policy
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All ticket sales on Ekovibe are final. Once a ticket has been
                purchased for any event, festival, concert, or club night, no
                refunds will be issued regardless of the reason — including but
                not limited to personal schedule changes, illness, or inability
                to attend.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Exceptions
              </h3>
              <ul className="space-y-3">
                {[
                  "Refunds will only be issued if the event is officially cancelled by the organiser and not rescheduled to a future date.",
                  "In the case of a qualifying cancellation, Ekovibe will facilitate a refund of the ticket face value (service fees are non-refundable) within 7–14 business days to the original payment method.",
                  "If an event is postponed (not cancelled), tickets remain valid for the rescheduled date. Users who cannot attend the new date may request a credit to their Ekovibe wallet, subject to organiser approval.",
                  "Ekovibe is not responsible for partial or full refunds arising from events curtailed by factors beyond the organiser's control (e.g. weather, government restrictions, power outages).",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground leading-relaxed flex gap-3"
                  >
                    <span className="text-foreground/30 shrink-0 mt-0.5">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Ticket Transfers
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                While refunds are not available, you may transfer your ticket to
                a friend via the Ekovibe app up to{" "}
                <span className="text-foreground font-medium">
                  12 hours before the event starts
                </span>
                . Fan-to-Fan resale (at face value only) is coming soon.
              </p>
            </div>
          </div>

          {/* B: Concierge & Reservations */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <p className="text-xs uppercase text-muted-foreground shrink-0">
                Section B
              </p>
              <div className="h-px flex-1 bg-border" />
            </div>
            <h2 className="text-xl font-bold uppercase">
              Concierge, Reservations &amp; Other Services
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For table reservations, luxury transport, curated concierge
              experiences, and other bespoke services booked through Ekovibe,
              the following cancellation windows apply:
            </p>

            {/* Cancellation table */}
            <div className="space-y-3">
              {[
                {
                  window: "48+ hours before service",
                  label: "Full Refund",
                  color: "text-green-400 border-green-500/20 bg-green-500/5",
                  desc: "100% refund of the service amount, minus any processing fees charged by our payment gateway.",
                },
                {
                  window: "24 – 48 hours before service",
                  label: "50% Refund",
                  color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
                  desc: "50% of the service value will be refunded. The remaining 50% is retained as a late-cancellation fee.",
                },
                {
                  window: "Less than 24 hours / No-Show",
                  label: "No Refund",
                  color: "text-red-400 border-red-500/20 bg-red-500/5",
                  desc: "Cancellations made less than 24 hours before the service, or failure to show up without prior notice, are entirely non-refundable.",
                },
              ].map((row) => (
                <div
                  key={row.window}
                  className={`border rounded-lg p-5 space-y-2 ${row.color}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      {row.window}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-widest shrink-0">
                      {row.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {row.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                How to Cancel
              </h3>
              <ul className="space-y-2">
                {[
                  "Log in to your Ekovibe account and navigate to your active bookings.",
                  "Select the booking you wish to cancel and tap 'Cancel Booking'.",
                  "Eligible refunds will be processed to your original payment method within 5–10 business days.",
                  `For urgent cancellations, contact our Live Concierge at the9ineagency@gmail.com or via WhatsApp at ${PHONE_NUMBER}.`,
                ].map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground leading-relaxed flex gap-3"
                  >
                    <span className="text-foreground/30 shrink-0 mt-0.5">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* C: Membership */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground shrink-0">
                Section C
              </p>
              <div className="h-px flex-1 bg-border" />
            </div>
            <h2 className="text-xl font-bold uppercase">Membership Fees</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ekovibe Gold and Black membership fees are non-refundable once
              activated. If your membership application is rejected after
              payment, a full refund will be processed within 5 business days.
              Membership renewals follow the same policy — please cancel before
              your renewal date to avoid being charged for the next cycle.
            </p>
          </div>

          <div className="border-t border-border pt-10 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Dispute a charge?
            </p>
            <p className="text-sm text-muted-foreground">
              Email{" "}
              <a
                href="mailto:the9ineagency@gmail.com"
                className="text-foreground underline underline-offset-4"
              >
                the9ineagency@gmail.com
              </a>{" "}
              with your order reference and we will respond within 24 hours.
            </p>
            <div className="flex gap-6 pt-4 text-xs uppercase text-muted-foreground">
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/faq"
                className="hover:text-foreground transition-colors"
              >
                FAQs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

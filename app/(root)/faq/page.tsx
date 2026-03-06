import { PHONE_NUMBER } from "@/constants";
import Link from "next/link";

export const metadata = {
  title: "FAQs — Ekovibe",
};

type FAQ = { q: string; a: string };

const categories: { label: string; faqs: FAQ[] }[] = [
  {
    label: "Accounts & Membership",
    faqs: [
      {
        q: "How do I join Ekovibe Gold or Black?",
        a: "Ekovibe Gold and Black are our invite-only tiers. High-frequency users are automatically considered, but you can also apply directly via the 'Membership' section of our platform or during account registration. Applications are reviewed by our team within 3–5 business days.",
      },
      {
        q: "What's the difference between Gold and Black membership?",
        a: "Gold membership unlocks priority access to exclusive events, early-bird ticketing, and curated Vibe recommendations. Black membership is our pinnacle tier — it includes everything in Gold plus dedicated concierge support, complimentary table reservations at select partner venues, and invitations to Black-only private experiences.",
      },
      {
        q: "Can I use Ekovibe without a membership tier?",
        a: "Yes. Standard accounts have full access to public event ticketing and discovery features. Membership unlocks additional benefits, priority access, and exclusive experiences not available to Standard users.",
      },
      {
        q: "How do I delete my account?",
        a: "You can delete your account at any time from Account Settings → Security. All personal data will be permanently removed within 30 days, except where retention is required by Nigerian financial regulations.",
      },
    ],
  },
  {
    label: "Event Tickets",
    faqs: [
      {
        q: "Can I transfer my ticket to a friend?",
        a: "Yes. You can transfer tickets directly within the Ekovibe app up to 12 hours before the event starts. Go to My Tickets, select the ticket, and tap 'Transfer'. Fan-to-Fan exchange (at face value only) is coming soon.",
      },
      {
        q: "Can I cancel a ticket if I can't make the event?",
        a: "Per our No-Refund Policy, tickets cannot be refunded for personal reasons. However, you can transfer the ticket to a friend via the app. If the event is officially cancelled by the organiser, Ekovibe will facilitate a full refund of the face value (excluding service fees) within 7–14 business days.",
      },
      {
        q: "Where do I find my QR ticket after purchase?",
        a: "Your QR code is delivered instantly via email after payment is confirmed. You can also access all your tickets anytime in the 'My Tickets' section of your Ekovibe dashboard.",
      },
      {
        q: "What should I do if my QR code isn't scanning at the door?",
        a: `Show your ticket code to the door staff for manual verification — each ticket has a short readable code (e.g. LAPD-X7K3MN) printed below the QR. If issues persist, contact our Live Concierge immediately via WhatsApp at ${PHONE_NUMBER}.`,
      },
      {
        q: "Can I buy tickets for multiple people in one transaction?",
        a: "Yes. On any event page, you can select different quantities across multiple ticket tiers in a single order. All tickets will be issued to your account and can be transferred individually to your guests.",
      },
      {
        q: "Why was my ticket purchase declined?",
        a: "This is usually due to insufficient funds, a card restriction, or a bank 3DS authentication issue. Try an alternative payment method or contact your bank. If the issue persists, reach out to the9ineagency@gmail.com.",
      },
    ],
  },
  {
    label: "Reservations & Concierge",
    faqs: [
      {
        q: "What happens if the club denies me entry after I've booked a table?",
        a: "Ekovibe ensures your name and booking are on the venue's guest list. However, venues reserve the right to enforce dress codes and conduct standards. If you are denied entry for reasons unrelated to your conduct (e.g. overbooking by the venue), contact our Live Concierge immediately — we will arrange a priority relocation to an alternative venue or process a full refund.",
      },
      {
        q: "What happens if my table isn't ready when I arrive?",
        a: "Our Live Concierge monitors all Ekovibe Black bookings in real time. If your reserved table isn't ready within 15 minutes of your confirmed slot, we offer a complimentary round of drinks from the venue or a credit towards your next booking.",
      },
      {
        q: "How do I request a concierge service?",
        a: "Concierge requests can be made from your dashboard via the 'Request Concierge' feature, or by contacting us directly at the9ineagency@gmail.com or WhatsApp. Services include private transport, yacht charters, personal shopping assistance, protocol support, and more.",
      },
      {
        q: "How far in advance should I book concierge services?",
        a: "For standard services (private car, restaurant reservations), 24–48 hours' notice is usually sufficient. For complex requests (yacht charters, private jet coordination, large-scale event production), we recommend a minimum of 5–7 business days.",
      },
    ],
  },
  {
    label: "Payments & Security",
    faqs: [
      {
        q: "Is my payment information secure?",
        a: "Absolutely. Ekovibe does not store your credit or debit card details. All payments are processed through Paystack, our PCI-DSS compliant payment partner. Your card data is encrypted end-to-end and never touches our servers.",
      },
      {
        q: "What payment methods does Ekovibe accept?",
        a: "We accept all major debit and credit cards (Verve, Mastercard, Visa), bank transfers, and USSD payments via Paystack. Additional payment options may be available depending on your bank.",
      },
      {
        q: "I was charged but didn't receive my ticket. What do I do?",
        a: "First, check your email spam folder for the booking confirmation. If you still can't find it, go to My Tickets in your dashboard — your ticket should appear there within a few minutes of payment. If the issue persists after 30 minutes, contact the9ineagency@gmail.com with your payment reference and we will resolve it immediately.",
      },
    ],
  },
  {
    label: "Platform & Availability",
    faqs: [
      {
        q: "Is Ekovibe available outside of Lagos?",
        a: "Currently, Ekovibe dominates the Lagos scene. We are actively onboarding partners in Abuja and Ibadan, with an Accra, Ghana rollout scheduled for Q3 2026. Sign up to The Vibe List in our footer to be the first to know when we go live in your city.",
      },
      {
        q: "Is there an Ekovibe mobile app?",
        a: "A native mobile app for iOS and Android is in active development. For now, our platform is fully optimised for mobile browsers — you can add it to your home screen for an app-like experience.",
      },
      {
        q: "How do I report a problem with the platform?",
        a: "For technical issues, contact the9ineagency@gmail.com with a description of the problem and, if possible, a screenshot. We aim to respond to all technical reports within 4 hours during business hours (Mon–Fri, 9am–6pm WAT).",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border py-20">
        <div className="container">
          <p className="text-sm uppercase text-muted-foreground mb-2">
            Support
          </p>
          <h1 className="text-4xl md:text-5xl font-bold uppercase mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Can't find what you're looking for? Email us at{" "}
            <a
              href="mailto:the9ineagency@gmail.com"
              className="text-foreground underline underline-offset-4"
            >
              the9ineagency@gmail.com
            </a>{" "}
            and we'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* FAQ categories */}
      <section className="py-16">
        <div className="container space-y-16">
          {categories.map((cat) => (
            <div key={cat.label} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold uppercase text-muted-foreground shrink-0">
                  {cat.label}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-0 divide-y divide-border border border-border rounded-lg overflow-hidden">
                {cat.faqs.map((faq) => (
                  <div key={faq.q} className="p-6 space-y-3">
                    <p className="text-sm font-semibold">{faq.q}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-border pt-10 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Still need help?
            </p>
            <p className="text-sm text-muted-foreground">
              Reach our team at{" "}
              <a
                href="mailto:the9ineagency@gmail.com"
                className="text-foreground underline underline-offset-4"
              >
                the9ineagency@gmail.com
              </a>{" "}
              or WhatsApp{" "}
              <a
                href={`https://wa.me/${PHONE_NUMBER}`}
                className="text-foreground underline underline-offset-4"
              >
                {PHONE_NUMBER}
              </a>
            </p>
            <div className="flex gap-6 pt-4 text-xs uppercase tracking-widest text-muted-foreground">
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
                href="/refund-policy"
                className="hover:text-foreground transition-colors"
              >
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

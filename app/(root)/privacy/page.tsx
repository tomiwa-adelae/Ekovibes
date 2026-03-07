import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Ekovibe collects, uses, and protects your personal data in compliance with the Nigeria Data Protection Act (NDPA) 2023.",
  alternates: { canonical: "https://www.ekovibe.com.ng/privacy" },
};

const sections = [
  {
    title: "1. Our Commitment",
    content: `Ekovibe is committed to protecting your "Digital Vibe." We take your privacy seriously and comply fully with the Nigeria Data Protection Act (NDPA) 2023, and where applicable, the General Data Protection Regulation (GDPR). This Privacy Policy explains what personal data we collect, how we use it, who we share it with, and what rights you have over your information.`,
  },
  {
    title: "2. Data We Collect",
    content: "We collect the following categories of personal data:",
    items: [
      "Identity Data: First name, last name, username, date of birth.",
      "Contact Data: Email address, phone number, billing/delivery address.",
      "Transaction Data: Details of purchases, payment references, and booking history.",
      "Technical Data: IP address, browser type, device information, and cookies collected during your use of our platform.",
      "Profile Data: Your preferences, saved events, tier status (Standard, Gold, Black), and communication preferences.",
      "Location Data: City and state, used to surface relevant events and experiences near you.",
      "Verification Data: For Ekovibe Gold and Black members, additional identity verification may be requested.",
    ],
  },
  {
    title: "3. How We Use Your Data",
    content: "Your data is used strictly for the following purposes:",
    items: [
      "To create and manage your Ekovibe account.",
      "To process your ticket purchases, reservations, and concierge requests.",
      "To verify your identity at partner venues (name and booking reference only).",
      "To process payments via our secure third-party payment gateway (Paystack).",
      "To send booking confirmations, QR tickets, and transactional communications.",
      "To send curated 'Vibe' recommendations, upcoming events, and member-exclusive offers (only with your consent).",
      "To detect and prevent fraud, unauthorised ticket transfers, and platform abuse.",
      "To comply with legal obligations under Nigerian law.",
    ],
  },
  {
    title: "4. Data Sharing",
    items: [
      "Venues & Partners: We share only your name and booking reference with the specific partner venue relevant to your reservation or event. We never share your full profile or financial information with venues.",
      "Payment Processors: Transaction data is shared with Paystack for payment processing. Ekovibe does not store your card details.",
      "Legal Authorities: We may disclose your data to Nigerian law enforcement or regulatory bodies if required by a valid legal order.",
      "We never sell, rent, or exchange your personal data with third-party advertisers or data brokers.",
    ],
  },
  {
    title: "5. Data Security",
    items: [
      "All data at rest is protected using AES-256 encryption.",
      "All data in transit between your device and our servers is protected via TLS/SSL protocols.",
      "Payment processing is handled by PCI-DSS compliant infrastructure via Paystack.",
      "Access to personal data within Ekovibe is restricted to authorised personnel on a need-to-know basis.",
      "We conduct periodic security audits and vulnerability assessments of our platform.",
    ],
  },
  {
    title: "6. Cookies",
    content: `Ekovibe uses cookies and similar tracking technologies to improve your experience on our platform. These include:`,
    items: [
      "Strictly Necessary Cookies: Required for authentication, session management, and security. These cannot be disabled.",
      "Preference Cookies: Remember your settings and preferences (e.g., currency, city).",
      "Analytics Cookies: Help us understand how our platform is used so we can improve it. These are anonymised.",
      "You can manage cookie preferences in your browser settings. Disabling non-essential cookies will not affect your core Ekovibe experience.",
    ],
  },
  {
    title: "7. Data Retention",
    content: `We retain your personal data for as long as your account is active or as required to provide services to you. Transaction records are retained for a minimum of 7 years to comply with Nigerian financial regulations. Upon account deletion, all personal profile data is removed within 30 days, except where retention is required by law.`,
  },
  {
    title: "8. Your Rights Under the NDPA 2023",
    content: "As a data subject, you have the following rights:",
    items: [
      "Right of Access: Request a copy of all personal data Ekovibe holds about you.",
      "Right to Rectification: Request correction of any inaccurate or outdated data.",
      "Right to Erasure: Request permanent deletion of your account and associated personal data, subject to legal retention requirements.",
      "Right to Portability: Request your data in a structured, machine-readable format.",
      "Right to Object: Object to processing of your data for marketing purposes at any time.",
      "Right to Withdraw Consent: Where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.",
      "To exercise any of these rights, contact us at the9ineagency@gmail.com.",
    ],
  },
  {
    title: "9. Children's Privacy",
    content: `Ekovibe is not intended for children under the age of 16. We do not knowingly collect personal data from anyone under 16. If you believe a minor has registered on our platform, contact us immediately at the9ineagency@gmail.com and we will delete the account promptly.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Material updates will be communicated via email or in-app notification. The date at the top of this page reflects when the policy was last revised.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border py-20">
        <div className="container max-w-4xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold uppercase mb-6">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: <span className="text-foreground">March 5, 2026</span>
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16">
        <div className="container max-w-4xl space-y-12">
          {sections.map((s) => (
            <div key={s.title} className="space-y-4">
              <h2 className="text-base font-bold uppercase tracking-wide">
                {s.title}
              </h2>
              {s.content && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.content}
                </p>
              )}
              {s.items && (
                <ul className="space-y-2">
                  {s.items.map((item, i) => (
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
              )}
            </div>
          ))}

          <div className="border-t border-border pt-10 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Data Protection Enquiries
            </p>
            <p className="text-sm text-muted-foreground">
              Email us at{" "}
              <a
                href="mailto:the9ineagency@gmail.com"
                className="text-foreground underline underline-offset-4"
              >
                the9ineagency@gmail.com
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
                href="/refund-policy"
                className="hover:text-foreground transition-colors"
              >
                Refund Policy
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

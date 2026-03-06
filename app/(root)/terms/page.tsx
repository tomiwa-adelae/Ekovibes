import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — Ekovibe",
};

const sections = [
  {
    title: "1. Introduction",
    content: `Welcome to Ekovibe. By accessing or using our platform — whether for event ticketing, luxury concierge services, table reservations, or lifestyle shopping — you agree to be legally bound by these Terms & Conditions ("Terms"). These Terms govern the relationship between you ("User") and Ekovibes Lifestyle Group ("Ekovibe", "we", "our"). If you do not agree to these Terms, please discontinue use of our platform immediately.`,
  },
  {
    title: "2. Eligibility",
    items: [
      "You must be at least 16 years old to create an account and use our services.",
      "By registering, you confirm that all information provided is accurate, current, and complete.",
      "Certain premium services (Gold/Black Membership) are subject to additional eligibility requirements and approval.",
      "Ekovibe reserves the right to refuse service to any individual at its discretion.",
    ],
  },
  {
    title: "3. Account Responsibility",
    items: [
      "You are solely responsible for maintaining the confidentiality of your login credentials.",
      "Any activity conducted under your account — whether or not authorised by you — is your legal responsibility.",
      "You must notify us immediately at the9ineagency@gmail.com if you suspect any unauthorised access to your account.",
      "You may not share, sell, or transfer your account to another person.",
      "Ekovibe will never request your password via email, SMS, or any communication channel.",
    ],
  },
  {
    title: "4. Platform Services",
    content: `Ekovibe operates as a curated lifestyle platform connecting members with premium venues, experiences, and service providers across Nigeria and beyond. Our services include but are not limited to:`,
    items: [
      "Event Ticketing: Purchase of digital access passes for concerts, private dinners, festivals, and curated nightlife events.",
      "The Black Book: Reservation management for exclusive restaurants, clubs, and private venues.",
      "White Glove Concierge: Facilitation of bespoke luxury services including private transport, yacht charters, and protocol assistance.",
      "The Vault: A curated e-commerce channel for luxury lifestyle products.",
      "Ekovibe Gold & Black Membership: Tiered membership programs with exclusive access, benefits, and priority service.",
    ],
  },
  {
    title: "5. Third-Party Venues & Service Providers",
    content: `Ekovibe acts as an intermediary between you and our registered partner venues and service providers. While we vet and curate all partners on our platform, the final service delivery remains the sole responsibility of the relevant venue or provider. Ekovibe is not liable for:`,
    items: [
      "Any degradation in service quality delivered by a third-party partner.",
      "Changes to a venue's operating hours, capacity, or house rules.",
      "Entry denial due to dress code violations or conduct issues as determined by the venue.",
      "Force majeure events (e.g. power outages, government-imposed curfews, flooding).",
    ],
  },
  {
    title: "6. Ticket Usage & Prohibited Conduct",
    items: [
      "All tickets purchased on Ekovibe are for personal use only.",
      "Resale of tickets at unauthorised premiums (ticket scalping) is strictly prohibited and will result in immediate account suspension.",
      "Tickets are non-transferable except via official Ekovibe transfer features within the app.",
      "Fraudulent transactions, chargebacks without legitimate cause, and the use of stolen payment instruments are prohibited and will be reported to relevant law enforcement agencies.",
      "Users must not attempt to reverse-engineer, scrape, or otherwise compromise the Ekovibe platform's security or data infrastructure.",
    ],
  },
  {
    title: "7. Intellectual Property",
    content: `All content on the Ekovibe platform — including but not limited to logos, text, graphics, UI designs, and event descriptions — is the exclusive property of Ekovibes Lifestyle Group and is protected under Nigerian copyright law and international IP treaties. Reproduction, modification, or distribution of any platform content without prior written consent is strictly prohibited.`,
  },
  {
    title: "8. Limitation of Liability",
    content: `To the maximum extent permitted by applicable law, Ekovibe shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the platform, including but not limited to loss of data, loss of revenue, or personal injury sustained at a third-party venue. Our aggregate liability to you for any claim shall not exceed the amount you paid to Ekovibe in the 90 days preceding the claim.`,
  },
  {
    title: "9. Account Termination",
    items: [
      "Ekovibe reserves the right to suspend or permanently terminate any account that violates these Terms without prior notice.",
      "Grounds for termination include but are not limited to: payment fraud, ticket scalping, harassment of venue staff or Ekovibe support agents, and repeated violations of community conduct standards.",
      "Upon termination, any outstanding credits or membership benefits are forfeited.",
      "You may delete your own account at any time via the Account Settings page.",
    ],
  },
  {
    title: "10. Governing Law & Dispute Resolution",
    content: `These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute arising from your use of Ekovibe that cannot be resolved through our internal resolution process shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.`,
  },
  {
    title: "11. Changes to These Terms",
    content: `Ekovibe reserves the right to update these Terms at any time. Material changes will be communicated via email or in-app notification at least 7 days before taking effect. Your continued use of the platform after the effective date constitutes acceptance of the revised Terms.`,
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border py-20">
        <div className="container">
          <p className="text-sm uppercase text-muted-foreground mb-2">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold uppercase mb-6">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: <span className="text-foreground">March 5, 2026</span>
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16">
        <div className="container space-y-12">
          {sections.map((s) => (
            <div key={s.title} className="space-y-4">
              <h2 className="text-base font-bold uppercase">{s.title}</h2>
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
              Questions?
            </p>
            <p className="text-sm text-muted-foreground">
              Contact us at{" "}
              <a
                href="mailto:the9ineagency@gmail.com"
                className="text-foreground underline underline-offset-4"
              >
                the9ineagency@gmail.com
              </a>
            </p>
            <div className="flex gap-6 pt-4 text-xs uppercase tracking-widest text-muted-foreground">
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

import type { Metadata } from "next";
import MembershipClient from "./_components/MembershipClient";

export const metadata: Metadata = {
  title: "Membership — Gold & Black",
  description:
    "Apply for Ekovibe Gold or Black membership. Unlock priority reservations, member-only events, airport fast-track, personal lifestyle management, and more.",
  openGraph: {
    title: "Ekovibe Membership — Gold & Black",
    description:
      "Apply for Gold or Black membership. Unlock exclusive event access, luxury perks, and a dedicated lifestyle concierge.",
    url: "https://www.ekovibe.com.ng/membership",
  },
  alternates: { canonical: "https://www.ekovibe.com.ng/membership" },
};

export default function MembershipPage() {
  return <MembershipClient />;
}

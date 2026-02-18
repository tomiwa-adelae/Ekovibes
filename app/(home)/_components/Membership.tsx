"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { IconCheck, IconCrown, IconInfinity } from "@tabler/icons-react";

const tiers = [
  {
    name: "Gold Member",
    price: "₦500k",
    period: "/year",
    icon: <IconCrown className="text-yellow-500" />,
    description:
      "For the consistent socialite who values priority access and style.",
    features: [
      "Priority Table Reservations",
      "Early Access to 'The Vault' Drops",
      "10% Discount on Vibe-Wear",
      "Member-Only Event Invitations",
      "Standard Airport Fast-Track (2x/year)",
    ],
    buttonText: "Apply for Gold",
    highlight: false,
  },
  {
    name: "Black Member",
    price: "Custom",
    period: "",
    icon: <IconInfinity className="text-white" />,
    description:
      "The ultimate Life-OS. Absolute access, zero friction, total privacy.",
    features: [
      "24/7 Dedicated Lifestyle Manager",
      "Guaranteed Table Access (Even if Sold Out)",
      "Unlimited Airport Protocol & Fast-Track",
      "Private Jet & Yacht Charter Logistics",
      "Bespoke Personal Shopping & Styling",
    ],
    buttonText: "Inquire for Black",
    highlight: true,
  },
];

export const Membership = () => {
  return (
    <section className="py-16 md:py-24 bg-black text-white relative">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-sm uppercase tracking-[0.5em] text-white/40 mb-4">
            Elevate Your Access
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-6">
            The Membership
          </h3>
          <p className="text-white/60 font-light tracking-wide">
            Ekovibes is more than a platform; it is a key to the city. Select
            the tier that matches your pace of life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative p-6 md:p-8 lg:p-12 border ${
                tier.highlight
                  ? "border-primary bg-white/5"
                  : "border-white/10 bg-transparent"
              } flex flex-col rounded-lg justify-between transition-all hover:border-primary`}
            >
              <div>
                <div className="mb-2">{tier.icon}</div>
                <h4 className="text-3xl font-bold uppercase tracking-tighter mb-2">
                  {tier.name}
                </h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl font-light">{tier.price}</span>
                  <span className="text-xs text-white/40 uppercase tracking-widest">
                    {tier.period}
                  </span>
                </div>
                <p className="text-sm text-white/50 mb-8 font-light italic leading-relaxed">
                  "{tier.description}"
                </p>

                <ul className="space-y-4 mb-12">
                  {tier.features.map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className="flex items-center gap-3 text-xs uppercase tracking-widest"
                    >
                      <IconCheck size={14} className="text-white/40" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button className={`w-full `}>{tier.buttonText}</Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

"use client";
import React from "react";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";

const categories = [
  {
    title: "The Black Book",
    description:
      "Exclusive tables at the city's premier dining and nightlife spots.",
    image: "/assets/images/dining.jpg", // High-end restaurant interior
    link: "/reservations",
    gridSpan: "md:col-span-2",
  },
  {
    title: "The Vault",
    description: "Limited edition Vibe-Wear and luxury curated goods.",
    image: "/assets/images/shop.jpg", // Close up of Adire fabric or a model
    link: "/shop",
    gridSpan: "md:col-span-1",
  },
  {
    title: "Experiences",
    description:
      "Access to the most sought-after festivals and private events.",
    image: "/assets/images/events.jpg", // Concert or gallery crowd
    link: "/ticketing",
    gridSpan: "md:col-span-1",
  },
  {
    title: "White Glove",
    description: "Bespoke travel, protocol, and lifestyle management.",
    image: "/assets/images/concierge.jpg", // Private jet or luxury car detail
    link: "/concierge",
    gridSpan: "md:col-span-2",
  },
];

export const VibeCategories = () => {
  return (
    <section className="py-16 md:py-24 bg-black text-white">
      <div className="container">
        <div className="max-w-xl">
          <h2 className="text-sm uppercase tracking-[0.3em] text-white/50 mb-4">
            Our Ecosystem
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase">
            Curating every aspect <br /> of your{" "}
            <span className="text-white/40 italic">lifestyle</span>
          </h3>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat, index) => (
            <Link
              href={cat.link}
              key={index}
              className={`group relative rounded-md w-full overflow-hidden aspect-[4/5] md:aspect-auto ${cat.gridSpan} h-[400px] bg-neutral-900`}
            >
              {/* Background Image */}
              <Image
                src={cat.image}
                alt={cat.title}
                width={1000}
                height={1000}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
              />

              {/* Content */}
              <div className="absolute inset-0 py-8 px-4 md:px-6 lg:px-8 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-2xl font-bold uppercase tracking-tight mb-2">
                      {cat.title}
                    </h4>
                    <p className="text-sm text-white/60 max-w-[250px] leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="bg-white text-black p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <IconArrowUpRight size={20} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

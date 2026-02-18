"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { IconPlayerPlay } from "@tabler/icons-react";
import Image from "next/image";

const articles = [
  {
    title: "The Art of the After-Party: Lagos Edition",
    category: "Culture",
    image: "/assets/images/media-1.jpg",
    size: "large",
  },
  {
    title: "Inside the Vault: Crafting the Silk Adire",
    category: "Style",
    image: "/assets/images/media-2.jpg",
    size: "small",
  },
  {
    title: "Top 5 Hidden Terraces in Ikoyi",
    category: "Destinations",
    image: "/assets/images/media-3.jpg",
    size: "small",
  },
];

export const VibeReport = () => {
  return (
    <section className="py-16 md:py-24 bg-neutral-900 text-white">
      <div className="container">
        <div>
          <h2 className="text-sm uppercase tracking-[0.4em] text-white/40 mb-4 font-medium">
            The Media Wing
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">
            The Vibe Report
          </h3>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          {articles.map((item, index) => (
            <div
              key={index}
              className={`relative group rounded-lg overflow-hidden cursor-pointer ${
                item.size === "large"
                  ? "md:col-span-8 aspect-square md:aspect-video"
                  : "md:col-span-4 aspect-square"
              }`}
            >
              <Image
                width={1000}
                height={1000}
                src={item.image}
                alt={item.title}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70"
              />

              {/* Play Button Overlay for Video content */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full border border-white/50 backdrop-blur-md flex items-center justify-center">
                  <IconPlayerPlay size={24} fill="white" />
                </div>
              </div>

              <div className="absolute inset-0 py-8 px-4 md:px-6 lg:px-8 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 mb-2">
                  {item.category}
                </span>
                <h4
                  className={`font-bold uppercase tracking-tight leading-none ${
                    item.size === "large"
                      ? "text-2xl md:text-3xl lg:text-4xl"
                      : "text-xl"
                  }`}
                >
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

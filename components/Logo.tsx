import { cn } from "@/lib/utils";
import { Playfair_Display } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const Logo = ({
  type = "white",
  size = "h-12 md:h-16",
}: {
  type?: "white" | "green";
  size?: string;
}) => {
  return (
    <Link href="/" className={cn("flex items-center space-x-2")}>
      <Image
        src={
          type === "green"
            ? "/assets/images/logo-green.png"
            : "/assets/images/logo.png"
        }
        alt="EKOVIBES"
        width={1000}
        height={1000}
        className={cn(size, "w-auto object-contain")}
        priority
      />
    </Link>
  );
};

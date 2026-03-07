import type { Metadata } from "next";
import React from "react";
import UserLayoutClient from "./_components/UserLayoutClient";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}

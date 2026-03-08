import React from "react";
import VendorLayoutClient from "./_components/VendorLayoutClient";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VendorLayoutClient>{children}</VendorLayoutClient>;
}

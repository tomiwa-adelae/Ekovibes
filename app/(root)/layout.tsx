import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import React from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      <Header />
      <div className="pt-20">{children}</div>
      <Footer />
    </div>
  );
};

export default layout;

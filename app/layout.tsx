import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import Head from "next/head";

const outfits = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const siteUrl = "https://www.ekovibe.com.ng";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ekovibe — Lagos' Premier Event & Experience Platform",
    template: "%s | Ekovibe",
  },
  description:
    "Discover and book tickets to Lagos' most exclusive events — concerts, private dining, art exhibitions, nightlife, and luxury experiences. Ekovibe is where the culture lives.",
  keywords: [
    "Lagos events",
    "Nigeria events",
    "concert tickets Nigeria",
    "Lagos nightlife",
    "event ticketing Lagos",
    "exclusive events Lagos",
    "art exhibitions Lagos",
    "private dining Lagos",
    "luxury experiences Nigeria",
    "Ekovibe",
    "buy event tickets online",
  ],
  authors: [{ name: "Ekovibe", url: siteUrl }],
  creator: "Ekovibe",
  publisher: "Ekovibe",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "Ekovibe",
    title: "Ekovibe — Lagos' Premier Event & Experience Platform",
    description:
      "Discover and book tickets to Lagos' most exclusive concerts, private dining, art exhibitions, and luxury experiences. Where the culture lives.",
    images: [
      {
        url: "/assets/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ekovibe — Lagos' Premier Event & Experience Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ekovibe — Lagos' Premier Event & Experience Platform",
    description:
      "Discover and book tickets to Lagos' most exclusive concerts, private dining, art exhibitions, and luxury experiences. Where the culture lives",
    images: ["/assets/images/og-image.png"],
    creator: "@ekovibe",
  },
  icons: {
    icon: "/assets/images/favicon.ico",
    shortcut: "/assets/images/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <meta property="og:image" content="/assets/images/og-image.png" />
        <meta property="og:image" content="/assets/images/og-image.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no"
        />
        <meta
          data-n-head="ssr"
          data-hid="viewport"
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1"
        />
      </Head>
      <body className={`${outfits.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}

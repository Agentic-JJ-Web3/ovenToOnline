import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "From Oven to Online",
  description:
    "An 85-page workbook for pastry sellers who bake well and want to sell more. Pricing, content, and the scripts to ask for the order — built for Cameroon and Nigeria.",
  openGraph: {
    title: "From Oven to Online",
    description:
      "You bake well. So why is nobody buying? The workbook that fixes it.",
    url: SITE_URL,
    siteName: "From Oven to Online",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "From Oven to Online",
    description: "You bake well. So why is nobody buying?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

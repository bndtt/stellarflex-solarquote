import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Inter font — clean, modern, great readability (used for both headings and body)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Default metadata for the entire site — individual pages can override these
export const metadata: Metadata = {
  title: {
    default: "StellarFlex SolarQuote — Solar Made Simple for Ontario Homes & Businesses",
    template: "%s | StellarFlex SolarQuote",
  },
  description:
    "Get an instant, AI-powered solar quote for your Ontario home or business. Transparent pricing, premium equipment, $0 upfront options. 500+ installations, 4.9★ rating.",
  keywords: [
    "solar panels Ontario",
    "home solar quote Ontario",
    "commercial solar Ontario",
    "solar installation cost Ontario",
    "Ontario solar incentives 2026",
    "net metering Ontario",
    "best solar company Ontario",
  ],
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "StellarFlex SolarQuote",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

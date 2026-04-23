import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeadPro — CRM for Sales Teams",
  description:
    "LeadPro is a mobile-first CRM application designed for sales employees to manage leads, deals, contacts, and follow-ups on the go.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

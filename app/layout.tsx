import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { ChatWidget } from "@/components/chat-widget";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Duplicate manrope definition removed

export const metadata: Metadata = {
  title: "Pinglly | Cyber Edition",
  description: "Futuristic B2B Sales Infrastructure",
  icons: {
    icon: '/assets/favicon.png',
    shortcut: '/assets/favicon.png',
    apple: '/assets/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <Providers>
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}

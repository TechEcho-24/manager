
import { Manrope, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { ChatWidget } from "@/components/chat-widget";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#ff6b35",
};

export const metadata: Metadata = {
  title: "Pinglly | Cyber Edition",
  description: "Futuristic B2B Sales Infrastructure",
  icons: {
    icon: "/assets/favicon.png",
    shortcut: "/assets/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pinglly",
  },
};
import { InstallPWABanner } from "@/components/install-pwa-banner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${manrope.variable}  h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className={`${manrope.variable} ${inter.variable} min-h-full font-sans`}
      >
        <Providers>
          {children}
          <ChatWidget />
          <InstallPWABanner />
        </Providers>
      </body>
    </html>
  );
}

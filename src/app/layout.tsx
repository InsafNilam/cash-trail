import type { Metadata } from "next";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RootProvider from "@/components/providers/RootProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CashTrail",
  description: "Track your income and expenses effortlessly with Cash Trail",
  icons: {
    icon: [
      { url: "/images/favicon.ico", type: "image/x-icon" },
      { url: "/images/favicon-32x32.png", type: "image/png" },
      { url: "/images/favicon-16x16.png", type: "image/png" },
      { url: "/images/apple-touch-icon.png", type: "image/png" },
      { url: "/images/android-chrome-192x192.png", type: "image/png" },
      { url: "/images/android-chrome-512x512.png", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
    shortcut: "/images/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Toaster richColors position="bottom-right" />
          <RootProvider>
            {children}
          </RootProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

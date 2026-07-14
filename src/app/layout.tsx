import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import AppShell from "@/components/layout/AppShell";
import { ToastContainer } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shortify AI — Autonomous Video Editor",
  description: "Create premium short-form videos automatically using AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-zinc-950 text-zinc-100`} suppressHydrationWarning>
        <QueryProvider>
          <AppShell>
            {children}
          </AppShell>
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}

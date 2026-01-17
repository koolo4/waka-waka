import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { LiveNotificationCenter } from "@/components/live-notification-center";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WAKA-WAKA ANIME - Киберпанк Аниме Платформа",
  description: "Погрузитесь в неоновый мир аниме будущего с киберпанк дизайном",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <Providers>
          <Header />
          <ClientBody>{children}</ClientBody>
          <LiveNotificationCenter maxNotifications={5} />
        </Providers>
      </body>
    </html>
  );
}

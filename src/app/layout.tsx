import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';

import {
  ClerkProvider
} from '@clerk/nextjs'

const outfit = Outfit({
  subsets: ["latin"],
});

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AirQ",
  description: "Aplikasi Klasifikasi Kualitas Air",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AirQ",
  },
  icons: {
    icon: "/images/water.png",
    apple: "/images/water.png",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/images/water.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/water.png" />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ClerkProvider>
          <LanguageProvider>
            <ThemeProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </ThemeProvider>
          </LanguageProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

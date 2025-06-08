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

// ✅ App Router metadata
export const metadata = {
  title: "AirQ",
  description: "Aplikasi Klasifikasi Kualitas Air",
  manifest: "/manifest.json",
  themeColor: "#0070f3",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AirQ",
  },
  icons: {
    icon: "/images/water.jpg",
    apple: "/images/water.jpg",
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
        {/* Optional: anything not supported by metadata */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/images/favicon.ico" />
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

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

// metadata
export const metadata = {
    title: "AirQ",
    description: "Aplikasi Klasifikasi Kualitas Air",
    icons: {
        icon: "water.jpg"
    },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <LanguageProvider>
        <ThemeProvider>
          <SidebarProvider>
            <html lang="en">
              <body className={`__className_ad50fd dark:bg-gray-900 vsc-initialized dark:bg-gray-900`}>
                    {children}
              </body>
            </html>
          </SidebarProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ClerkProvider>
  );
}

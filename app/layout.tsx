import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "./utils/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DynaPuff:wght@400..700&family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&display=swap');
      </style>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <div className="mx-4">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

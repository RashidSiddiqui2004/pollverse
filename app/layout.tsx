import type { Metadata } from "next";
import { Providers } from "./providers";
import Sidebar from "@/components/Sidebar";
import TrendingSidebar from "@/components/TrendingSidebar";
import BottomNav from "@/components/BottomNav";

import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "./utils/constants";

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
      suppressHydrationWarning
    >
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DynaPuff:wght@400..700&family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&display=swap');
      </style>

      <body className="min-h-full bg-background text-foreground font-sans">
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-7xl justify-center px-0 sm:px-4 md:px-8">
            <div className="hidden md:block md:w-[275px] shrink-0">
              <Sidebar />
            </div>

            <main className="flex-1 min-w-0 max-w-2xl border-x border-border min-h-screen pb-20 md:pb-8 bg-background">
              <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md md:hidden">
                <span className="text-xl font-bold tracking-tight">Pollverse</span>
              </div>

              <div className="px-4 py-4 md:px-6">
                {children}
              </div>
            </main>

            <div className="hidden xl:block xl:w-[350px] shrink-0">
              <TrendingSidebar />
            </div>
          </div>

          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

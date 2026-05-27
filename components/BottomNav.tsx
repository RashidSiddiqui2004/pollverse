"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, TrendingUp, Users, PlusCircle, User, LogIn } from "lucide-react";

export default function BottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Trending", href: "/trendingPolls", icon: TrendingUp },
    { label: "Create", href: "/createPoll", icon: PlusCircle, requireAuth: true },
    { label: "Groups", href: "/groups", icon: Users },
    { 
      label: session ? "Profile" : "Sign In", 
      href: session ? "/profile" : "/api/auth/signin", 
      icon: session ? User : LogIn 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/95 pb-safe backdrop-blur-md md:hidden text-foreground">
      {items.map((item) => {
        if (item.requireAuth && !session) return null;

        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors hover:bg-muted ${
              isActive ? "text-foreground font-bold" : "text-muted-foreground"
            }`}
          >
            <Icon className={`h-6 w-6 ${isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/app/providers";
import { 
  Home, 
  TrendingUp, 
  Users, 
  Bookmark, 
  User, 
  PlusCircle, 
  FolderPlus, 
  Sun, 
  Moon, 
  LogOut, 
  LogIn 
} from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Trending", href: "/trendingPolls", icon: TrendingUp },
    { label: "Groups", href: "/groups", icon: Users },
  ];

  const authNavItems = [
    { label: "Joined Groups", href: "/groups/following", icon: Bookmark },
    { label: "Create Poll", href: "/createPoll", icon: PlusCircle },
    { label: "Create Group", href: "/createGroup", icon: FolderPlus },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const allItems = session ? [...navItems, ...authNavItems] : navItems;

  return (
    <aside className="sticky top-0 flex h-screen w-[275px] flex-col justify-between border-r border-border bg-background px-4 py-6 text-foreground">
      <div className="flex flex-col gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-3 text-2xl font-bold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background font-black">
            P
          </div>
          <span>Pollverse</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {allItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 text-lg font-medium transition-colors hover:bg-muted ${
                  isActive ? "font-bold text-foreground bg-secondary/50" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Theme Toggle & Profile Switcher */}
      <div className="flex flex-col gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-lg font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-6 w-6 stroke-[1.8px] text-yellow-500" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-6 w-6 stroke-[1.8px] text-indigo-500" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Profile Switcher */}
        {session ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Avatar"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                  {session.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="flex flex-col overflow-hidden text-left">
                <span className="truncate text-sm font-semibold leading-none text-foreground">
                  {session.user?.name}
                </span>
                <span className="truncate text-xs text-muted-foreground mt-1">
                  {session.user?.email}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5 stroke-[1.8px]" />
            </button>
          </div>
        ) : (
          <Link
            href="/api/auth/signin"
            className="flex items-center gap-4 rounded-xl bg-foreground px-4 py-3 text-lg font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99] justify-center"
          >
            <LogIn className="h-6 w-6 stroke-[2px]" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
}

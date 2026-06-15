"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Shield, Swords, Trophy, Medal, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Shield },
  { href: "/teams", label: "My Teams", icon: Swords },
  { href: "/leagues", label: "Leagues", icon: Trophy },
  { href: "/tournaments", label: "Tournaments", icon: Medal },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-stone-900 border-b border-stone-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-amber-400 text-lg tracking-tight">
            <Shield className="w-5 h-5" />
            BB Tracker
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname.startsWith(href)
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-stone-300 hover:text-white hover:bg-stone-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-stone-400 text-sm">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>

          <button className="md:hidden text-stone-300" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-stone-700 bg-stone-900 px-4 py-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${
                pathname.startsWith(href)
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-stone-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-2 text-sm text-stone-400 w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out ({session?.user?.name})
          </button>
        </div>
      )}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { clsx } from "clsx";
import { WalletButton } from "@/components/WalletButton";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/universities", label: "Universities" },
  { href: "/reviews", label: "Peer Reviews" },
  { href: "/grants", label: "Grants" },
  { href: "/analytics", label: "Analytics" },
  { href: "/activity", label: "Activity" },
  { href: "/profile", label: "Profile" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-xl">
      <div className="rh-container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-xl tracking-tight">
            Research<span className="text-ember-500">Hub</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-lg px-2.5 py-1.5 text-sm transition",
                  pathname === link.href
                    ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-950"
                    : "text-[var(--muted)] hover:text-[var(--fg)]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle theme"
            className="rh-btn-secondary !px-2.5"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </button>
          <div className="hidden sm:block">
            <WalletButton />
          </div>
          <button
            type="button"
            className="rh-btn-secondary !px-2.5 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-[var(--border)] lg:hidden">
          <nav className="rh-container flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm",
                  pathname === link.href
                    ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-950"
                    : "text-[var(--muted)]",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 sm:hidden">
              <WalletButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

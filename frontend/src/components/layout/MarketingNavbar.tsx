import React from "react";
import Link from "next/link";

export type NavLink = { label: string; href: string };
export type MarketingNavbarProps = {
  links: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
};

export function MarketingNavbar({ links, ctaLabel, ctaHref }: MarketingNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-white">
          Castfash
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-textMuted hover:text-white transition">
              {link.label}
            </Link>
          ))}
        </nav>
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-surface shadow-md hover:-translate-y-0.5 transition"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </header>
  );
}

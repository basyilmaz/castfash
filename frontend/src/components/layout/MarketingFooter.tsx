import React from "react";
import type { NavLink } from "./MarketingNavbar";

export type FooterColumn = { title: string; links: NavLink[] };
export type MarketingFooterProps = {
  columns: FooterColumn[];
  showNewsletter?: boolean;
};

export function MarketingFooter({ columns, showNewsletter = true }: MarketingFooterProps) {
  return (
    <footer className="bg-surface pt-12 pb-8 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2 space-y-3">
          <div className="text-lg font-semibold text-white">Castfash</div>
          <p className="text-sm text-textMuted">
            AI destekli moda katalogları ve görsel üretimi için modern stüdyo deneyimi.
          </p>
          {showNewsletter && (
            <form className="mt-3 flex gap-2">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="w-full rounded-lg bg-card border border-border px-3 py-2 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-surface hover:-translate-y-0.5 transition"
              >
                Abone ol
              </button>
            </form>
          )}
        </div>
        {columns.map((col) => (
          <div key={col.title} className="space-y-3">
            <h4 className="text-sm font-semibold text-white">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <a className="text-sm text-textMuted hover:text-white transition" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-6xl px-6 pt-6 text-xs text-textSecondary">
        © {new Date().getFullYear()} Castfash. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}

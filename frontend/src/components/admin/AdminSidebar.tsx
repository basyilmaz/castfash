"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", key: "sidebar.dashboard" },
  { href: "/products", key: "sidebar.products" },
  { href: "/scenes", key: "sidebar.scenes" },
  { href: "/model-profiles", key: "sidebar.models" },
  { href: "/analytics", key: "sidebar.analytics" }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl relative z-10">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 flex items-center justify-center text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/30">
          CF
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">castfash</p>
          <p className="text-[11px] text-slate-400">AI fashion visuals</p>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-xl text-sm transition",
                active
                  ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              )}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 pb-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">castfash admin</p>
          <p className="text-slate-400">Manage AI visuals and presets.</p>
        </div>
      </div>
    </aside>
  );
}

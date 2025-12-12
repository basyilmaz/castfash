"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";
import { authStorage } from "../lib/storage";
import { Organization } from "../types";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/model-profiles", label: "Model Profiles" },
  { href: "/scenes", label: "Scenes" },
  { href: "/billing", label: "Billing" },
];

export function AppShell({
  children,
  organization: orgProp,
}: PropsWithChildren<{ organization?: Organization | null }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    setOrganization(orgProp ?? authStorage.organization());
  }, [orgProp]);

  const logout = () => {
    authStorage.clear();
    router.push("/login");
  };

  return (
    <div className="min-h-screen px-6 py-6 sm:px-10 sm:py-8">
      <div className="glass-panel rounded-2xl border border-white/10 p-4 sm:p-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">CastFash Studio</p>
          <h1 className="text-2xl sm:text-3xl font-semibold">AI Fashion Visuals</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="accent-chip px-4 py-2 rounded-full text-sm text-white">
            {organization ? `${organization.remainingCredits} credits` : "No org"}
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-100 hover:border-white/40 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 mb-6">
        {links.map((link) => {
          const isActive = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                isActive ? "bg-white text-slate-900" : "border border-white/15 text-slate-100 hover:border-white/40"
              }`}
              href={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="glass-panel rounded-2xl p-4 sm:p-6 text-slate-100">{children}</div>
    </div>
  );
}

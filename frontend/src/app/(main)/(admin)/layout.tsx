"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getCurrentOrganization } from "@/lib/api/auth";
import { I18nProvider } from "@/lib/i18n";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { WelcomeModal, OnboardingTour } from "@/components/onboarding";

type AdminLink = {
  label: string;
  href: string;
  icon: string;
  onboardingId?: string;
};

const adminLinks: AdminLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Ürünler", href: "/products", icon: "📦", onboardingId: "products" },
  { label: "Model Profilleri", href: "/model-profiles", icon: "👤", onboardingId: "models" },
  { label: "Sahneler", href: "/scenes", icon: "🎨", onboardingId: "scenes" },
  { label: "Üretimler", href: "/generations", icon: "✨", onboardingId: "generations" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<{
    id: number;
    name: string;
    remainingCredits: number;
  } | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        if (typeof window === "undefined") return;
        const token = window.localStorage.getItem("castfash_access_token");
        if (!token) {
          router.replace("/auth/login");
          return;
        }
        const res = await getCurrentOrganization();
        setOrganization(res.organization);
        setRole(res.role);
      } catch {
        window.localStorage.removeItem("castfash_access_token");
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("castfash_access_token");
    }
    router.replace("/auth/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-textMuted">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-4xl">✨</div>
          <span>CastFash yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <I18nProvider>
      <OnboardingProvider>
        <div className="flex min-h-screen bg-page text-white">
          <aside className="hidden w-64 border-r border-border bg-surface flex flex-col md:flex">
            {/* Logo */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <span className="text-lg font-bold tracking-tight">CastFash</span>
              </div>
              <p className="text-xs text-textMuted mt-1">AI Görsel Üretim Stüdyosu</p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-1 px-3 py-4 text-sm">
              {adminLinks.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    data-onboarding={link.onboardingId}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${active
                      ? "bg-primary/15 text-white border-l-2 border-primary"
                      : "text-textMuted hover:bg-surfaceAlt/60 hover:text-white border-l-2 border-transparent"
                      }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
                    {active && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-primary"></span>
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Credits & Logout */}
            <div className="px-3 pb-4 space-y-3">
              {organization && (
                <div className="rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 p-4">
                  <p className="text-xs text-textMuted mb-1">Kalan Kredi</p>
                  <p className="text-2xl font-bold text-white">{organization.remainingCredits}</p>
                  <a
                    href="/pricing"
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    Kredi Satın Al →
                  </a>
                </div>
              )}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-textMuted hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition"
              >
                <span>🚪</span>
                Çıkış Yap
              </button>
            </div>
          </aside>

          <div className="flex flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
              <div className="flex items-center gap-4">
                {organization && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                      {organization.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{organization.name}</p>
                      <p className="text-xs text-textMuted">{role === "owner" ? "Sahip" : role === "admin" ? "Yönetici" : "Üye"}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/generations/new"
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition"
                >
                  <span>✨</span>
                  Yeni Üretim
                </Link>
              </div>
            </header>

            <main className="flex-1 bg-page px-6 py-6 overflow-auto">{children}</main>
          </div>
        </div>

        {/* Onboarding Components */}
        <WelcomeModal />
        <OnboardingTour />
      </OnboardingProvider>
    </I18nProvider>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { I18nProvider } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type AdminLink = { label: string; href: string; icon?: string };

const systemLinks: AdminLink[] = [
    { label: "Dashboard", href: "/system-admin", icon: "📊" },
    { label: "Kullanıcılar", href: "/system-admin/users", icon: "👥" },
    { label: "Organizasyonlar", href: "/system-admin/organizations", icon: "🏢" },
    { label: "Ürünler", href: "/system-admin/products", icon: "👔" },
    { label: "Modeller", href: "/system-admin/models", icon: "🧑‍🎤" },
    { label: "Üretimler", href: "/system-admin/generations", icon: "🎨" },
    { label: "Kuyruk İzleme", href: "/system-admin/queue", icon: "📋" },
    { label: "Sistem Logları", href: "/system-admin/logs", icon: "📑" },
    { label: "Audit Logs", href: "/system-admin/audit-logs", icon: "📜" },
    { label: "Prompt Ayarları", href: "/system-admin/prompts", icon: "📝" },
    { label: "Servis Ayarları", href: "/system-admin/services", icon: "⚙️" },
    { label: "Raporlar", href: "/system-admin/reports", icon: "📈" },
];

export default function SystemAdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const token = window.localStorage.getItem("castfash_access_token");
                if (!token) {
                    router.replace("/auth/login");
                    return;
                }
                setLoading(false);
            } catch {
                router.replace("/auth/login");
            }
        }
        checkAuth();
    }, [router]);

    const logout = () => {
        window.localStorage.removeItem("castfash_access_token");
        router.replace("/auth/login");
    };

    if (loading) return <div className="p-8 text-center text-textMuted">Yükleniyor...</div>;

    return (
        <I18nProvider>
            <div className="flex min-h-screen bg-page text-white">
                <aside className="hidden w-64 border-r border-red-900/30 bg-[#0f0505] flex flex-col md:flex overflow-y-auto">
                    <div className="px-6 py-6 text-xl font-bold border-b border-red-900/30 text-red-500">
                        Sistem Admin
                    </div>
                    <nav className="flex flex-1 flex-col gap-1 px-3 py-6 text-sm text-textMuted">
                        {systemLinks.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-4 py-3 transition border-l-2",
                                        active
                                            ? "bg-red-500/10 text-red-400 border-red-500"
                                            : "border-transparent hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <span className="text-lg">{link.icon}</span>
                                    {link.label}
                                </a>
                            );
                        })}
                    </nav>
                    <div className="px-4 pb-6">
                        <button
                            onClick={logout}
                            className="w-full rounded-lg border border-red-900/30 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition"
                        >
                            Çıkış
                        </button>
                    </div>
                </aside>

                <div className="flex flex-1 flex-col">
                    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
                        <div className="text-sm font-medium text-red-400">
                            Süper Admin Modu
                        </div>
                    </header>
                    <main className="flex-1 bg-page px-6 py-8 overflow-y-auto">{children}</main>
                </div>
            </div>
        </I18nProvider>
    );
}

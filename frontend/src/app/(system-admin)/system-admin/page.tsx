"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";

interface SystemStats {
    totalUsers: number;
    totalOrganizations: number;
    totalGenerations: number;
    totalCredits: number;
    totalProducts: number;
    totalModels: number;
}

interface AuditLog {
    id: number;
    action: string;
    userId: number | null;
    targetType: string | null;
    targetId: number | null;
    createdAt: string;
}

interface RecentActivity {
    logs: AuditLog[];
    total: number;
}

export default function SystemAdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            const [statsData, activityData] = await Promise.all([
                apiFetch<SystemStats>("/system-admin/stats"),
                apiFetch<RecentActivity>("/system-admin/audit-logs?take=10"),
            ]);
            setStats(statsData);
            setRecentActivity(activityData.logs);
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="text-textMuted text-center py-8">Yükleniyor...</div>;
    }

    const getActionBadge = (action: string) => {
        if (action.includes("DELETED")) return <AppBadge variant="danger">{action}</AppBadge>;
        if (action.includes("CREATED")) return <AppBadge variant="success">{action}</AppBadge>;
        if (action.includes("UPDATED") || action.includes("ADJUSTED")) return <AppBadge variant="warning">{action}</AppBadge>;
        return <AppBadge variant="info">{action}</AppBadge>;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Sistem Özeti</h1>
                    <p className="text-textMuted">Tüm sistem metrikleri ve son aktiviteler</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-textMuted">Versiyon</div>
                    <div className="text-lg font-mono text-primary">v1.0.0</div>
                    <div className="text-xs text-textMuted mt-1">Build: {new Date().toLocaleDateString('tr-TR')}</div>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AppCard
                    className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30 cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => router.push("/system-admin/users")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-textMuted text-sm mb-1">Toplam Kullanıcı</div>
                            <div className="text-4xl font-bold text-blue-400">{stats?.totalUsers || 0}</div>
                            <div className="text-xs text-textMuted mt-2">Tüm kullanıcıları görüntüle →</div>
                        </div>
                        <div className="text-5xl">👥</div>
                    </div>
                </AppCard>

                <AppCard
                    className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30 cursor-pointer hover:border-purple-400 transition-colors"
                    onClick={() => router.push("/system-admin/organizations")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-textMuted text-sm mb-1">Toplam Organizasyon</div>
                            <div className="text-4xl font-bold text-purple-400">{stats?.totalOrganizations || 0}</div>
                            <div className="text-xs text-textMuted mt-2">Organizasyonları yönet →</div>
                        </div>
                        <div className="text-5xl">🏢</div>
                    </div>
                </AppCard>

                <AppCard
                    className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30 cursor-pointer hover:border-green-400 transition-colors"
                    onClick={() => router.push("/system-admin/generations")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-textMuted text-sm mb-1">Toplam Üretim</div>
                            <div className="text-4xl font-bold text-green-400">{stats?.totalGenerations || 0}</div>
                            <div className="text-xs text-textMuted mt-2">Üretimleri izle →</div>
                        </div>
                        <div className="text-5xl">🎨</div>
                    </div>
                </AppCard>

                <AppCard className="p-6 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-textMuted text-sm mb-1">Toplam Kredi</div>
                            <div className="text-4xl font-bold text-yellow-400">{stats?.totalCredits || 0}</div>
                            <div className="text-xs text-textMuted mt-2">Sistemdeki toplam kredi</div>
                        </div>
                        <div className="text-5xl">💎</div>
                    </div>
                </AppCard>

                <AppCard
                    className="p-6 bg-gradient-to-br from-pink-900/20 to-pink-800/10 border-pink-500/30 cursor-pointer hover:border-pink-400 transition-colors"
                    onClick={() => router.push("/system-admin/products")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-textMuted text-sm mb-1">Toplam Ürün</div>
                            <div className="text-4xl font-bold text-pink-400">{stats?.totalProducts || 0}</div>
                            <div className="text-xs text-textMuted mt-2">Ürünleri görüntüle →</div>
                        </div>
                        <div className="text-5xl">👔</div>
                    </div>
                </AppCard>

                <AppCard
                    className="p-6 bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-colors"
                    onClick={() => router.push("/system-admin/models")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-textMuted text-sm mb-1">Toplam Model</div>
                            <div className="text-4xl font-bold text-cyan-400">{stats?.totalModels || 0}</div>
                            <div className="text-xs text-textMuted mt-2">Modelleri görüntüle →</div>
                        </div>
                        <div className="text-5xl">🧑‍🎤</div>
                    </div>
                </AppCard>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <AppCard className="p-6">
                    <h2 className="text-xl font-bold mb-4">Hızlı İşlemler</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <AppButton
                            variant="outline"
                            className="justify-start"
                            onClick={() => router.push("/system-admin/users")}
                        >
                            <span className="mr-2">👥</span>
                            Kullanıcılar
                        </AppButton>
                        <AppButton
                            variant="outline"
                            className="justify-start"
                            onClick={() => router.push("/system-admin/organizations")}
                        >
                            <span className="mr-2">🏢</span>
                            Organizasyonlar
                        </AppButton>
                        <AppButton
                            variant="outline"
                            className="justify-start"
                            onClick={() => router.push("/system-admin/reports")}
                        >
                            <span className="mr-2">📊</span>
                            Raporlar
                        </AppButton>
                        <AppButton
                            variant="outline"
                            className="justify-start"
                            onClick={() => router.push("/system-admin/audit-logs")}
                        >
                            <span className="mr-2">📋</span>
                            Audit Logs
                        </AppButton>
                        <AppButton
                            variant="outline"
                            className="justify-start"
                            onClick={() => router.push("/system-admin/prompts")}
                        >
                            <span className="mr-2">📝</span>
                            Prompt Ayarları
                        </AppButton>
                        <AppButton
                            variant="outline"
                            className="justify-start"
                            onClick={() => router.push("/system-admin/services")}
                        >
                            <span className="mr-2">⚙️</span>
                            Servis Ayarları
                        </AppButton>
                    </div>
                </AppCard>

                {/* System Status */}
                <AppCard className="p-6">
                    <h2 className="text-xl font-bold mb-4">Sistem Durumu</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-textMuted">Backend API</span>
                            <span className="text-green-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Aktif
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-textMuted">Database</span>
                            <span className="text-green-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Bağlı
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-textMuted">AI Servisleri</span>
                            <span className="text-green-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Hazır
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-textMuted">Audit Logging</span>
                            <span className="text-green-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Aktif
                            </span>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Recent Activity */}
            <AppCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Son Aktiviteler</h2>
                    <AppButton
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/system-admin/audit-logs")}
                    >
                        Tümünü Gör →
                    </AppButton>
                </div>
                {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                        {recentActivity.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                                onClick={() => router.push("/system-admin/audit-logs")}
                            >
                                <div className="flex items-center gap-3">
                                    {getActionBadge(log.action)}
                                    <div>
                                        {log.targetType && log.targetId && (
                                            <div className="text-sm font-medium">
                                                {log.targetType} #{log.targetId}
                                            </div>
                                        )}
                                        <div className="text-xs text-textMuted">
                                            {new Date(log.createdAt).toLocaleString("tr-TR")}
                                        </div>
                                    </div>
                                </div>
                                {log.userId && (
                                    <div className="text-xs text-textMuted">
                                        User #{log.userId}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-textMuted">
                        Henüz aktivite kaydı yok
                    </div>
                )}
            </AppCard>
        </div>
    );
}

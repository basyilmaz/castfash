"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";

interface AdvancedReportData {
    dailyGenerations: Array<{
        date: Date;
        total: number;
        successful: number;
        failed: number;
    }>;
    dailyCredits: Array<{
        date: Date;
        spent: number;
        purchased: number;
    }>;
    topOrgsByGenerations: Array<{
        id: number;
        name: string;
        generationCount: number;
    }>;
    topOrgsByCredits: Array<{
        organizationId: number;
        name: string;
        totalSpent: number;
    }>;
    userGrowth: Array<{
        date: Date;
        count: number;
    }>;
    orgGrowth: Array<{
        date: Date;
        count: number;
    }>;
}

export default function AdvancedReportsPage() {
    const [data, setData] = useState<AdvancedReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        loadReports();
    }, [days]);

    async function loadReports() {
        try {
            setLoading(true);
            const res = await apiFetch<AdvancedReportData>(`/system-admin/reports/advanced?days=${days}`);
            setData(res);
        } catch (err) {
            console.error("Failed to load advanced reports", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="text-textMuted text-center py-8">Yükleniyor...</div>;
    }

    if (!data) {
        return <div className="text-textMuted text-center py-8">Veri yüklenemedi</div>;
    }

    // Calculate max values for scaling
    const maxGeneration = Math.max(...data.dailyGenerations.map(d => d.total), 1);
    const maxCredit = Math.max(
        ...data.dailyCredits.map(d => Math.max(d.spent, d.purchased)),
        1
    );
    const maxUserGrowth = Math.max(...data.userGrowth.map(d => d.count), 1);
    const maxOrgGrowth = Math.max(...data.orgGrowth.map(d => d.count), 1);

    // Calculate totals
    const totalGenerations = data.dailyGenerations.reduce((sum, d) => sum + d.total, 0);
    const totalSuccessful = data.dailyGenerations.reduce((sum, d) => sum + d.successful, 0);
    const totalFailed = data.dailyGenerations.reduce((sum, d) => sum + d.failed, 0);
    const totalCreditsSpent = data.dailyCredits.reduce((sum, d) => sum + d.spent, 0);
    const totalCreditsPurchased = data.dailyCredits.reduce((sum, d) => sum + d.purchased, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Gelişmiş Raporlar</h1>
                    <p className="text-textMuted">Detaylı analiz ve trendler</p>
                </div>
                <div className="flex gap-2">
                    <AppButton
                        variant={days === 7 ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setDays(7)}
                    >
                        7 Gün
                    </AppButton>
                    <AppButton
                        variant={days === 30 ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setDays(30)}
                    >
                        30 Gün
                    </AppButton>
                    <AppButton
                        variant={days === 90 ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setDays(90)}
                    >
                        90 Gün
                    </AppButton>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AppCard className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
                    <div className="text-textMuted text-sm mb-1">Toplam Üretim</div>
                    <div className="text-3xl font-bold text-blue-400">{totalGenerations}</div>
                    <div className="text-xs text-textMuted mt-1">Son {days} gün</div>
                </AppCard>

                <AppCard className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30">
                    <div className="text-textMuted text-sm mb-1">Başarılı</div>
                    <div className="text-3xl font-bold text-green-400">{totalSuccessful}</div>
                    <div className="text-xs text-textMuted mt-1">
                        {totalGenerations > 0 ? ((totalSuccessful / totalGenerations) * 100).toFixed(1) : 0}% başarı
                    </div>
                </AppCard>

                <AppCard className="p-6 bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/30">
                    <div className="text-textMuted text-sm mb-1">Başarısız</div>
                    <div className="text-3xl font-bold text-red-400">{totalFailed}</div>
                    <div className="text-xs text-textMuted mt-1">
                        {totalGenerations > 0 ? ((totalFailed / totalGenerations) * 100).toFixed(1) : 0}% hata
                    </div>
                </AppCard>

                <AppCard className="p-6 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/30">
                    <div className="text-textMuted text-sm mb-1">Harcanan Kredi</div>
                    <div className="text-3xl font-bold text-yellow-400">{totalCreditsSpent}</div>
                    <div className="text-xs text-textMuted mt-1">Son {days} gün</div>
                </AppCard>
            </div>

            {/* Daily Generation Trend */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Günlük Üretim Trendi</h2>
                <div className="space-y-2">
                    {data.dailyGenerations.map((day, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="text-xs text-textMuted w-20">
                                {new Date(day.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
                            </div>
                            <div className="flex-1 flex gap-1">
                                <div
                                    className="bg-green-500 h-6 rounded-l transition-all"
                                    style={{ width: `${(day.successful / maxGeneration) * 100}%` }}
                                    title={`Başarılı: ${day.successful}`}
                                />
                                <div
                                    className="bg-red-500 h-6 rounded-r transition-all"
                                    style={{ width: `${(day.failed / maxGeneration) * 100}%` }}
                                    title={`Başarısız: ${day.failed}`}
                                />
                            </div>
                            <div className="text-sm font-semibold w-12 text-right">{day.total}</div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-textMuted">Başarılı</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-textMuted">Başarısız</span>
                    </div>
                </div>
            </AppCard>

            {/* Daily Credit Usage */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Günlük Kredi Kullanımı</h2>
                <div className="space-y-2">
                    {data.dailyCredits.map((day, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="text-xs text-textMuted w-20">
                                {new Date(day.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
                            </div>
                            <div className="flex-1 flex gap-1">
                                <div
                                    className="bg-yellow-500 h-6 rounded-l transition-all"
                                    style={{ width: `${(day.spent / maxCredit) * 100}%` }}
                                    title={`Harcanan: ${day.spent}`}
                                />
                                <div
                                    className="bg-blue-500 h-6 rounded-r transition-all"
                                    style={{ width: `${(day.purchased / maxCredit) * 100}%` }}
                                    title={`Satın Alınan: ${day.purchased}`}
                                />
                            </div>
                            <div className="text-sm font-semibold w-16 text-right">
                                {day.spent + day.purchased}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span className="text-textMuted">Harcanan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-textMuted">Satın Alınan</span>
                    </div>
                </div>
            </AppCard>

            {/* Top Organizations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Generations */}
                <AppCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">En Aktif Organizasyonlar</h2>
                    <div className="space-y-3">
                        {data.topOrgsByGenerations.slice(0, 10).map((org, idx) => (
                            <div key={org.id} className="flex items-center gap-3">
                                <div className="text-2xl font-bold text-primary w-8">
                                    #{idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{org.name}</div>
                                    <div className="text-xs text-textMuted">
                                        {org.generationCount} üretim
                                    </div>
                                </div>
                                <div className="text-lg font-bold text-accent">
                                    {org.generationCount}
                                </div>
                            </div>
                        ))}
                    </div>
                </AppCard>

                {/* By Credits */}
                <AppCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">En Çok Kredi Harcayan</h2>
                    <div className="space-y-3">
                        {data.topOrgsByCredits.slice(0, 10).map((org, idx) => (
                            <div key={org.organizationId} className="flex items-center gap-3">
                                <div className="text-2xl font-bold text-primary w-8">
                                    #{idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{org.name}</div>
                                    <div className="text-xs text-textMuted">
                                        {org.totalSpent} kredi
                                    </div>
                                </div>
                                <div className="text-lg font-bold text-yellow-400">
                                    {org.totalSpent}
                                </div>
                            </div>
                        ))}
                    </div>
                </AppCard>
            </div>

            {/* Growth Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Growth */}
                <AppCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Kullanıcı Büyümesi</h2>
                    <div className="space-y-2">
                        {data.userGrowth.map((day, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="text-xs text-textMuted w-20">
                                    {new Date(day.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
                                </div>
                                <div className="flex-1">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-6 rounded transition-all"
                                        style={{ width: `${(day.count / maxUserGrowth) * 100}%` }}
                                    />
                                </div>
                                <div className="text-sm font-semibold w-12 text-right">
                                    +{day.count}
                                </div>
                            </div>
                        ))}
                    </div>
                </AppCard>

                {/* Organization Growth */}
                <AppCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Organizasyon Büyümesi</h2>
                    <div className="space-y-2">
                        {data.orgGrowth.map((day, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="text-xs text-textMuted w-20">
                                    {new Date(day.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
                                </div>
                                <div className="flex-1">
                                    <div
                                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-6 rounded transition-all"
                                        style={{ width: `${(day.count / maxOrgGrowth) * 100}%` }}
                                    />
                                </div>
                                <div className="text-sm font-semibold w-12 text-right">
                                    +{day.count}
                                </div>
                            </div>
                        ))}
                    </div>
                </AppCard>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppSelect } from "@/components/ui/AppSelect";
import { apiFetch } from "@/lib/api";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// Types
interface DailyStats {
    date: string;
    generations: number;
    credits: number;
    successRate: number;
}

interface CategoryStats {
    name: string;
    count: number;
    percentage: number;
}

interface AnalyticsData {
    overview: {
        totalGenerations: number;
        totalCreditsUsed: number;
        successRate: number;
        averageProcessingTime: number;
        generationsChange: number;
        creditsChange: number;
    };
    dailyStats: DailyStats[];
    categoryBreakdown: CategoryStats[];
    peakHours: { hour: number; count: number }[];
    providerUsage: { provider: string; count: number; successRate: number }[];
}

// Chart colors
const COLORS = {
    primary: "#8B5CF6",
    secondary: "#06B6D4",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    chart: ["#8B5CF6", "#06B6D4", "#22C55E", "#F59E0B", "#EF4444", "#EC4899"],
};

// Mock data for development
const generateMockData = (days: number): AnalyticsData => {
    const dailyStats: DailyStats[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dailyStats.push({
            date: date.toISOString().split("T")[0],
            generations: Math.floor(Math.random() * 50) + 10,
            credits: Math.floor(Math.random() * 200) + 50,
            successRate: 85 + Math.random() * 15,
        });
    }

    const totalGenerations = dailyStats.reduce((sum, d) => sum + d.generations, 0);
    const totalCredits = dailyStats.reduce((sum, d) => sum + d.credits, 0);

    return {
        overview: {
            totalGenerations,
            totalCreditsUsed: totalCredits,
            successRate: 94.5,
            averageProcessingTime: 12.3,
            generationsChange: 12.5,
            creditsChange: -5.2,
        },
        dailyStats,
        categoryBreakdown: [
            { name: "Bikini", count: 45, percentage: 45 },
            { name: "Elbise", count: 25, percentage: 25 },
            { name: "Aksesuar", count: 15, percentage: 15 },
            { name: "Diğer", count: 15, percentage: 15 },
        ],
        peakHours: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            count: Math.floor(Math.random() * 30) + 5,
        })),
        providerUsage: [
            { provider: "Primary", count: 120, successRate: 98 },
            { provider: "Secondary", count: 45, successRate: 92 },
            { provider: "Backup", count: 15, successRate: 85 },
        ],
    };
};

// Stat Card Component
function StatCard({
    title,
    value,
    change,
    icon,
    color = "primary",
}: {
    title: string;
    value: string | number;
    change?: number;
    icon: string;
    color?: "primary" | "secondary" | "success" | "warning" | "danger";
}) {
    const colorClasses = {
        primary: "from-purple-900/30 to-purple-800/10 border-purple-500/30",
        secondary: "from-cyan-900/30 to-cyan-800/10 border-cyan-500/30",
        success: "from-green-900/30 to-green-800/10 border-green-500/30",
        warning: "from-yellow-900/30 to-yellow-800/10 border-yellow-500/30",
        danger: "from-red-900/30 to-red-800/10 border-red-500/30",
    };

    const textColorClasses = {
        primary: "text-purple-400",
        secondary: "text-cyan-400",
        success: "text-green-400",
        warning: "text-yellow-400",
        danger: "text-red-400",
    };

    return (
        <AppCard
            className={`p-4 md:p-6 bg-gradient-to-br ${colorClasses[color]} transition-transform hover:scale-[1.02]`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl md:text-3xl">{icon}</span>
                {change !== undefined && (
                    <span
                        className={`text-xs md:text-sm font-medium px-2 py-1 rounded-full ${change >= 0
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                            }`}
                    >
                        {change >= 0 ? "+" : ""}
                        {change.toFixed(1)}%
                    </span>
                )}
            </div>
            <div className="text-textMuted text-sm mb-1">{title}</div>
            <div className={`text-2xl md:text-3xl font-bold ${textColorClasses[color]}`}>
                {value}
            </div>
        </AppCard>
    );
}

// Custom Tooltip for charts
function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string;
}) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
                <p className="text-white font-medium mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState("30");
    const [exporting, setExporting] = useState(false);

    const loadAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            // Try to fetch from API, fall back to mock data
            try {
                const response = await apiFetch<AnalyticsData>(
                    `/stats/analytics?days=${dateRange}`
                );
                setData(response);
            } catch {
                // Use mock data if API is not available
                setData(generateMockData(parseInt(dateRange)));
            }
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    // Format date for chart labels
    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    };

    // Export to CSV
    const exportToCSV = useCallback(async () => {
        if (!data) return;

        setExporting(true);
        try {
            // Build CSV content
            const headers = ["Tarih", "Üretim Sayısı", "Harcanan Kredi", "Başarı Oranı (%)"];
            const rows = data.dailyStats.map((d) => [
                d.date,
                d.generations.toString(),
                d.credits.toString(),
                d.successRate.toFixed(1),
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map((row) => row.join(",")),
            ].join("\n");

            // Download file
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `analytics_${dateRange}_days_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    }, [data, dateRange]);

    // Formatted chart data
    const chartData = useMemo(() => {
        if (!data) return [];
        return data.dailyStats.map((d) => ({
            ...d,
            dateLabel: formatDate(d.date),
        }));
    }, [data]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-32 bg-surface rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 bg-surface rounded-xl" />
                    ))}
                </div>
                <div className="h-80 bg-surface rounded-xl" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-textMuted">Veriler yüklenemedi</p>
                <AppButton onClick={loadAnalytics} className="mt-4">
                    Tekrar Dene
                </AppButton>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <SectionHeader
                    title="📊 Analitik Dashboard"
                    subtitle="Kullanım istatistikleri ve trendler"
                />
                <div className="flex items-center gap-3">
                    <AppSelect
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-40"
                    >
                        <option value="7">Son 7 Gün</option>
                        <option value="30">Son 30 Gün</option>
                        <option value="90">Son 90 Gün</option>
                    </AppSelect>
                    <AppButton
                        onClick={exportToCSV}
                        disabled={exporting}
                        variant="secondary"
                        className="min-w-[120px]"
                    >
                        {exporting ? "⏳ Dışa Aktarılıyor..." : "📥 CSV İndir"}
                    </AppButton>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Toplam Üretim"
                    value={data.overview.totalGenerations.toLocaleString()}
                    change={data.overview.generationsChange}
                    icon="🎨"
                    color="primary"
                />
                <StatCard
                    title="Harcanan Kredi"
                    value={data.overview.totalCreditsUsed.toLocaleString()}
                    change={data.overview.creditsChange}
                    icon="💳"
                    color="warning"
                />
                <StatCard
                    title="Başarı Oranı"
                    value={`${data.overview.successRate.toFixed(1)}%`}
                    icon="✅"
                    color="success"
                />
                <StatCard
                    title="Ort. İşlem Süresi"
                    value={`${data.overview.averageProcessingTime.toFixed(1)}s`}
                    icon="⏱️"
                    color="secondary"
                />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Generation Trend */}
                <AppCard className="p-4 md:p-6">
                    <h3 className="text-lg font-semibold mb-4">📈 Üretim Trendi</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient
                                        id="colorGenerations"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={COLORS.primary}
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={COLORS.primary}
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="dateLabel"
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="generations"
                                    name="Üretim"
                                    stroke={COLORS.primary}
                                    fillOpacity={1}
                                    fill="url(#colorGenerations)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </AppCard>

                {/* Credit Usage */}
                <AppCard className="p-4 md:p-6">
                    <h3 className="text-lg font-semibold mb-4">💳 Kredi Kullanımı</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="dateLabel"
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="credits"
                                    name="Kredi"
                                    fill={COLORS.warning}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </AppCard>
            </div>

            {/* Secondary Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Breakdown */}
                <AppCard className="p-4 md:p-6">
                    <h3 className="text-lg font-semibold mb-4">🏷️ Kategori Dağılımı</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryBreakdown as any}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="name"
                                    label={(props: any) =>
                                        `${props.name} ${props.percentage?.toFixed(0) || 0}%`
                                    }
                                    labelLine={false}
                                >
                                    {data.categoryBreakdown.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS.chart[index % COLORS.chart.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </AppCard>

                {/* Peak Hours */}
                <AppCard className="p-4 md:p-6">
                    <h3 className="text-lg font-semibold mb-4">⏰ Yoğun Saatler</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.peakHours}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="hour"
                                    stroke="#888"
                                    fontSize={10}
                                    tickLine={false}
                                    tickFormatter={(h) => `${h}:00`}
                                />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-surface border border-border rounded-lg p-2 shadow-xl">
                                                    <p className="text-white text-sm">
                                                        {payload[0].payload.hour}:00 -{" "}
                                                        {payload[0].value} üretim
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill={COLORS.secondary}
                                    radius={[2, 2, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </AppCard>

                {/* Success Rate Trend */}
                <AppCard className="p-4 md:p-6">
                    <h3 className="text-lg font-semibold mb-4">✅ Başarı Oranı Trendi</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="dateLabel"
                                    stroke="#888"
                                    fontSize={10}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                    domain={[80, 100]}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-surface border border-border rounded-lg p-2 shadow-xl">
                                                    <p className="text-white text-sm">{label}</p>
                                                    <p className="text-green-400 text-sm">
                                                        Başarı: {Number(payload[0].value).toFixed(1)}%
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="successRate"
                                    stroke={COLORS.success}
                                    strokeWidth={2}
                                    dot={{ fill: COLORS.success, strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </AppCard>
            </div>

            {/* Provider Usage Table */}
            <AppCard className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-4">🔧 Sağlayıcı Kullanımı</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 text-textMuted font-medium">
                                    Sağlayıcı
                                </th>
                                <th className="text-center py-3 px-4 text-textMuted font-medium">
                                    Kullanım
                                </th>
                                <th className="text-center py-3 px-4 text-textMuted font-medium">
                                    Başarı Oranı
                                </th>
                                <th className="text-center py-3 px-4 text-textMuted font-medium">
                                    Durum
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.providerUsage.map((provider) => (
                                <tr
                                    key={provider.provider}
                                    className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                                >
                                    <td className="py-3 px-4 font-medium">{provider.provider}</td>
                                    <td className="py-3 px-4 text-center">{provider.count}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm ${provider.successRate >= 95
                                                ? "bg-green-500/20 text-green-400"
                                                : provider.successRate >= 85
                                                    ? "bg-yellow-500/20 text-yellow-400"
                                                    : "bg-red-500/20 text-red-400"
                                                }`}
                                        >
                                            {provider.successRate}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${provider.successRate >= 90
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                                }`}
                                        >
                                            <span
                                                className={`w-2 h-2 rounded-full ${provider.successRate >= 90
                                                    ? "bg-green-400"
                                                    : "bg-yellow-400"
                                                    }`}
                                            />
                                            {provider.successRate >= 90 ? "Sağlıklı" : "Dikkat"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AppCard>

            {/* Quick Actions */}
            <AppCard className="p-4 md:p-6 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border-primary/30">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">📋 Detaylı Rapor</h3>
                        <p className="text-textMuted text-sm">
                            Daha fazla metrik ve analiz için detaylı rapor oluşturun
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <AppButton variant="secondary" onClick={exportToCSV}>
                            📊 Excel Raporu
                        </AppButton>
                        <AppButton onClick={() => window.print()}>🖨️ Yazdır</AppButton>
                    </div>
                </div>
            </AppCard>
        </div>
    );
}

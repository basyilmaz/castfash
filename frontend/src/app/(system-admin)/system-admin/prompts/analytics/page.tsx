"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppCard } from "@/components/ui/AppCard";
import { apiFetch } from "@/lib/api/http";

interface TemplateStats {
    id: number;
    name: string;
    type: string;
    usageCount: number;
    avgSuccessRate: number;
    lastUsed: string | null;
}

interface AnalyticsData {
    totalTemplates: number;
    activeTemplates: number;
    totalUsage: number;
    avgSuccessRate: number;
    topTemplates: TemplateStats[];
    usageByType: { type: string; count: number }[];
    recentActivity: { date: string; count: number }[];
}

export default function PromptAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    async function loadAnalytics() {
        try {
            setLoading(true);

            // Mock data for now - replace with actual API call when ready
            const mockData: AnalyticsData = {
                totalTemplates: 24,
                activeTemplates: 18,
                totalUsage: 1547,
                avgSuccessRate: 94.5,
                topTemplates: [
                    { id: 1, name: 'Fashion Photography Master', type: 'MASTER', usageCount: 342, avgSuccessRate: 96.2, lastUsed: '2025-12-13T10:30:00Z' },
                    { id: 2, name: 'Studio Lighting Setup', type: 'LIGHTING', usageCount: 287, avgSuccessRate: 94.8, lastUsed: '2025-12-13T09:45:00Z' },
                    { id: 3, name: 'Professional Model Pose', type: 'POSE', usageCount: 245, avgSuccessRate: 93.5, lastUsed: '2025-12-13T11:00:00Z' },
                    { id: 4, name: 'E-commerce Background', type: 'SCENE', usageCount: 198, avgSuccessRate: 95.1, lastUsed: '2025-12-12T16:20:00Z' },
                    { id: 5, name: 'High Fashion Style', type: 'STYLE', usageCount: 156, avgSuccessRate: 92.8, lastUsed: '2025-12-13T08:15:00Z' },
                ],
                usageByType: [
                    { type: 'MASTER', count: 450 },
                    { type: 'SCENE', count: 320 },
                    { type: 'LIGHTING', count: 287 },
                    { type: 'POSE', count: 245 },
                    { type: 'STYLE', count: 156 },
                    { type: 'NEGATIVE', count: 89 },
                ],
                recentActivity: [
                    { date: '2025-12-07', count: 45 },
                    { date: '2025-12-08', count: 62 },
                    { date: '2025-12-09', count: 58 },
                    { date: '2025-12-10', count: 71 },
                    { date: '2025-12-11', count: 83 },
                    { date: '2025-12-12', count: 76 },
                    { date: '2025-12-13', count: 39 },
                ],
            };

            setData(mockData);
        } catch (err) {
            console.error(err);
            toast.error("Analytics verileri yüklenemedi");
        } finally {
            setLoading(false);
        }
    }

    function getTypeColor(type: string) {
        const colors: Record<string, string> = {
            'MASTER': 'bg-purple-500',
            'SCENE': 'bg-blue-500',
            'POSE': 'bg-green-500',
            'LIGHTING': 'bg-yellow-500',
            'STYLE': 'bg-pink-500',
            'NEGATIVE': 'bg-red-500',
        };
        return colors[type] || 'bg-gray-500';
    }

    function getTypeLabel(type: string) {
        const labels: Record<string, string> = {
            'MASTER': 'Master Prompt',
            'SCENE': 'Sahne',
            'POSE': 'Poz',
            'LIGHTING': 'Işıklandırma',
            'STYLE': 'Stil',
            'NEGATIVE': 'Negatif',
        };
        return labels[type] || type;
    }

    function formatNumber(num: number) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleString('tr-TR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-16">
                <p className="text-textMuted">Veri yüklenemedi</p>
            </div>
        );
    }

    const maxUsage = Math.max(...data.usageByType.map(u => u.count));
    const maxActivity = Math.max(...data.recentActivity.map(a => a.count));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">📊 Prompt Analytics</h1>
                    <p className="text-textMuted mt-1">Prompt şablonlarının kullanım istatistikleri</p>
                </div>
                <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${timeRange === range
                                    ? 'bg-primary text-white'
                                    : 'bg-surface text-textMuted hover:text-white'
                                }`}
                        >
                            {range === '7d' ? '7 Gün' : range === '30d' ? '30 Gün' : '90 Gün'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AppCard className="p-4">
                    <div className="text-3xl font-bold text-primary">{data.totalTemplates}</div>
                    <div className="text-sm text-textMuted">Toplam Şablon</div>
                </AppCard>
                <AppCard className="p-4">
                    <div className="text-3xl font-bold text-green-400">{data.activeTemplates}</div>
                    <div className="text-sm text-textMuted">Aktif Şablon</div>
                </AppCard>
                <AppCard className="p-4">
                    <div className="text-3xl font-bold text-blue-400">{formatNumber(data.totalUsage)}</div>
                    <div className="text-sm text-textMuted">Toplam Kullanım</div>
                </AppCard>
                <AppCard className="p-4">
                    <div className="text-3xl font-bold text-yellow-400">{data.avgSuccessRate}%</div>
                    <div className="text-sm text-textMuted">Ortalama Başarı</div>
                </AppCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage by Type */}
                <AppCard className="p-4">
                    <h3 className="font-semibold mb-4">📈 Tip Bazında Kullanım</h3>
                    <div className="space-y-3">
                        {data.usageByType.map(item => (
                            <div key={item.type} className="flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full ${getTypeColor(item.type)}`}></span>
                                <span className="text-sm w-24">{getTypeLabel(item.type)}</span>
                                <div className="flex-1 bg-surface rounded-full h-4 overflow-hidden">
                                    <div
                                        className={`h-full ${getTypeColor(item.type)} transition-all duration-500`}
                                        style={{ width: `${(item.count / maxUsage) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium w-12 text-right">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </AppCard>

                {/* Recent Activity Chart */}
                <AppCard className="p-4">
                    <h3 className="font-semibold mb-4">📅 Son {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} Günlük Aktivite</h3>
                    <div className="flex items-end justify-between h-32 gap-1">
                        {data.recentActivity.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className="w-full bg-primary/80 rounded-t transition-all duration-500 hover:bg-primary"
                                    style={{ height: `${(day.count / maxActivity) * 100}%` }}
                                    title={`${day.date}: ${day.count} kullanım`}
                                ></div>
                                <span className="text-[10px] text-textMuted">
                                    {new Date(day.date).getDate()}
                                </span>
                            </div>
                        ))}
                    </div>
                </AppCard>
            </div>

            {/* Top Templates */}
            <AppCard className="p-4">
                <h3 className="font-semibold mb-4">🏆 En Çok Kullanılan Şablonlar</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-textMuted border-b border-border">
                                <th className="pb-3">Şablon</th>
                                <th className="pb-3">Tip</th>
                                <th className="pb-3 text-right">Kullanım</th>
                                <th className="pb-3 text-right">Başarı %</th>
                                <th className="pb-3 text-right">Son Kullanım</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topTemplates.map((template, i) => (
                                <tr key={template.id} className="border-b border-border/50 hover:bg-surface/50">
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-textMuted">#{i + 1}</span>
                                            <span className="font-medium">{template.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs text-white ${getTypeColor(template.type)}`}>
                                            {getTypeLabel(template.type)}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right font-medium">{template.usageCount}</td>
                                    <td className="py-3 text-right">
                                        <span className={template.avgSuccessRate >= 95 ? 'text-green-400' : template.avgSuccessRate >= 90 ? 'text-yellow-400' : 'text-red-400'}>
                                            {template.avgSuccessRate}%
                                        </span>
                                    </td>
                                    <td className="py-3 text-right text-sm text-textMuted">
                                        {template.lastUsed ? formatDate(template.lastUsed) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AppCard>
        </div>
    );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import { toast } from "sonner";

interface QueueStats {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    concurrency: number;
    activeJobs: number;
}

interface ProviderHealth {
    id: number;
    provider: string;
    priority: number;
    isActive: boolean;
    successCount: number;
    errorCount: number;
    avgResponseMs: number | null;
    lastError: string | null;
    lastErrorAt: string | null;
    maxRetries: number;
    timeoutMs: number;
    totalCalls: number;
    successRate: number;
    isHealthy: boolean;
    status: 'healthy' | 'degraded' | 'disabled';
}

export default function QueueDashboardPage() {
    const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
    const [providerHealth, setProviderHealth] = useState<ProviderHealth[]>([]);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const [statsData, healthData] = await Promise.all([
                apiFetch<QueueStats>("/system-admin/queue/stats"),
                apiFetch<ProviderHealth[]>("/system-admin/providers/health"),
            ]);
            setQueueStats(statsData);
            setProviderHealth(healthData);
        } catch (err: any) {
            console.error("Failed to load queue data", err);
            if (!queueStats) {
                toast.error("Veriler yüklenemedi");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            loadData();
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, loadData]);

    async function handleClearQueue() {
        try {
            setClearing(true);
            const result = await apiFetch<{ cleared: number; message: string }>(
                "/system-admin/queue/clear",
                { method: "POST" }
            );
            toast.success(result.message);
            loadData();
        } catch (err) {
            toast.error("Queue temizlenemedi");
        } finally {
            setClearing(false);
        }
    }

    async function handleResetProviderStats(providerId: number, providerName: string) {
        try {
            await apiFetch(`/system-admin/providers/${providerId}/reset-stats`, {
                method: "POST",
            });
            toast.success(`${providerName} istatistikleri sıfırlandı`);
            loadData();
        } catch (err) {
            toast.error("İstatistikler sıfırlanamadı");
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy':
                return <AppBadge variant="success">Sağlıklı</AppBadge>;
            case 'degraded':
                return <AppBadge variant="warning">Sorunlu</AppBadge>;
            case 'disabled':
                return <AppBadge variant="secondary">Devre Dışı</AppBadge>;
            default:
                return <AppBadge variant="info">{status}</AppBadge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-textMuted">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Kuyruk ve Sağlık İzleme</h1>
                    <p className="text-textMuted">
                        Generation queue durumu ve AI provider sağlık metrikleri
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-textMuted cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="w-4 h-4 rounded border-border bg-surface text-primary"
                        />
                        Otomatik Yenile (5s)
                    </label>
                    <AppButton variant="outline" onClick={loadData}>
                        🔄 Yenile
                    </AppButton>
                </div>
            </div>

            {/* Queue Stats */}
            <div>
                <h2 className="text-xl font-semibold mb-4">📋 Kuyruk Durumu</h2>
                {queueStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        <AppCard className="p-4 text-center">
                            <div className="text-3xl font-bold text-white">
                                {queueStats.total}
                            </div>
                            <div className="text-sm text-textMuted">Toplam</div>
                        </AppCard>
                        <AppCard className="p-4 text-center border-yellow-500/30">
                            <div className="text-3xl font-bold text-yellow-400">
                                {queueStats.pending}
                            </div>
                            <div className="text-sm text-textMuted">Bekleyen</div>
                        </AppCard>
                        <AppCard className="p-4 text-center border-blue-500/30">
                            <div className="text-3xl font-bold text-blue-400">
                                {queueStats.processing}
                            </div>
                            <div className="text-sm text-textMuted">İşleniyor</div>
                        </AppCard>
                        <AppCard className="p-4 text-center border-green-500/30">
                            <div className="text-3xl font-bold text-green-400">
                                {queueStats.completed}
                            </div>
                            <div className="text-sm text-textMuted">Tamamlandı</div>
                        </AppCard>
                        <AppCard className="p-4 text-center border-red-500/30">
                            <div className="text-3xl font-bold text-red-400">
                                {queueStats.failed}
                            </div>
                            <div className="text-sm text-textMuted">Başarısız</div>
                        </AppCard>
                        <AppCard className="p-4 text-center border-purple-500/30">
                            <div className="text-3xl font-bold text-purple-400">
                                {queueStats.activeJobs}/{queueStats.concurrency}
                            </div>
                            <div className="text-sm text-textMuted">Aktif/Kapasite</div>
                        </AppCard>
                        <AppCard className="p-4 text-center">
                            <AppButton
                                variant="outline"
                                size="sm"
                                onClick={handleClearQueue}
                                loading={clearing}
                                className="w-full"
                            >
                                🧹 Temizle
                            </AppButton>
                            <div className="text-xs text-textMuted mt-2">Eski job'ları sil</div>
                        </AppCard>
                    </div>
                ) : (
                    <AppCard className="p-6 text-center text-textMuted">
                        Queue verileri alınamadı
                    </AppCard>
                )}
            </div>

            {/* Provider Health */}
            <div>
                <h2 className="text-xl font-semibold mb-4">🔌 AI Provider Sağlığı</h2>
                <div className="space-y-4">
                    {providerHealth.length === 0 ? (
                        <AppCard className="p-6 text-center text-textMuted">
                            Provider verisi bulunamadı
                        </AppCard>
                    ) : (
                        providerHealth.map((provider) => (
                            <AppCard
                                key={provider.id}
                                className={`p-6 ${provider.status === 'healthy'
                                        ? 'border-green-500/30'
                                        : provider.status === 'degraded'
                                            ? 'border-red-500/30'
                                            : 'border-border'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-white">
                                                {provider.provider}
                                            </span>
                                            {getStatusBadge(provider.status)}
                                        </div>
                                        <AppBadge variant="secondary">
                                            Öncelik: {provider.priority}
                                        </AppBadge>
                                    </div>
                                    <AppButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleResetProviderStats(provider.id, provider.provider)}
                                    >
                                        🔄 Sıfırla
                                    </AppButton>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div>
                                        <div className="text-sm text-textMuted">Toplam Çağrı</div>
                                        <div className="text-xl font-semibold">{provider.totalCalls}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-textMuted">Başarı Oranı</div>
                                        <div className={`text-xl font-semibold ${provider.successRate >= 80 ? 'text-green-400' :
                                                provider.successRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            {provider.successRate.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-textMuted">Başarılı / Hatalı</div>
                                        <div className="text-xl font-semibold">
                                            <span className="text-green-400">{provider.successCount}</span>
                                            {' / '}
                                            <span className="text-red-400">{provider.errorCount}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-textMuted">Ort. Yanıt Süresi</div>
                                        <div className="text-xl font-semibold">
                                            {provider.avgResponseMs
                                                ? `${(provider.avgResponseMs / 1000).toFixed(1)}s`
                                                : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-textMuted">Ayarlar</div>
                                        <div className="text-sm">
                                            <span className="text-textSecondary">Retry: </span>
                                            <span className="text-white">{provider.maxRetries}</span>
                                            <span className="text-textSecondary"> / Timeout: </span>
                                            <span className="text-white">{provider.timeoutMs / 1000}s</span>
                                        </div>
                                    </div>
                                </div>

                                {provider.lastError && (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <div className="text-sm text-red-400 font-medium mb-1">
                                            Son Hata ({provider.lastErrorAt ? new Date(provider.lastErrorAt).toLocaleString('tr-TR') : '-'}):
                                        </div>
                                        <div className="text-xs text-red-300/80 font-mono">
                                            {provider.lastError}
                                        </div>
                                    </div>
                                )}

                                {/* Progress bar for success rate */}
                                <div className="mt-4">
                                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${provider.successRate >= 80
                                                    ? 'bg-green-500'
                                                    : provider.successRate >= 50
                                                        ? 'bg-yellow-500'
                                                        : 'bg-red-500'
                                                }`}
                                            style={{ width: `${Math.min(provider.successRate, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </AppCard>
                        ))
                    )}
                </div>
            </div>

            {/* Info Card */}
            <AppCard className="p-6 bg-blue-500/5 border-blue-500/30">
                <h3 className="font-semibold text-white mb-3">ℹ️ Bilgi</h3>
                <div className="text-sm text-textSecondary space-y-2">
                    <p>
                        <strong>Kuyruk:</strong> Generation istekleri buradan işlenir.
                        Eşzamanlı işleme kapasitesi {queueStats?.concurrency || 3} job'dır.
                    </p>
                    <p>
                        <strong>Provider Fallback:</strong> Eğer birinci öncelikli provider başarısız olursa,
                        sistem otomatik olarak sonraki provider'ı dener.
                    </p>
                    <p>
                        <strong>Sağlık Durumu:</strong> %50'nin altında başarı oranına sahip provider'lar "Sorunlu" olarak
                        işaretlenir ve geçici olarak atlanabilir.
                    </p>
                </div>
            </AppCard>
        </div>
    );
}

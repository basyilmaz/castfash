"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import { toast } from "sonner";

interface Provider {
    id: number;
    provider: string;
    apiKey: string;
    baseUrl: string | null;
    modelId: string | null;
    isActive: boolean;
    settings: any;
    priority: number;
    maxRetries: number;
    timeoutMs: number;
    lastError: string | null;
    lastErrorAt: string | null;
    errorCount: number;
    successCount: number;
    avgResponseMs: number | null;
}

interface ProviderStatus {
    isActive: boolean;
    provider: string;
    lastUpdated: string;
    recentActivity: number;
    hasApiKey: boolean;
    hasBaseUrl: boolean;
    hasModelId: boolean;
}

interface TestResult {
    success: boolean;
    responseTime: number;
    provider: string;
    message?: string;
    error?: string;
}

export default function ServicesPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [testingId, setTestingId] = useState<number | null>(null);
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [showTestModal, setShowTestModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const [saving, setSaving] = useState(false);
    const [newProvider, setNewProvider] = useState({
        type: "KIE",
        apiKey: "",
        baseUrl: "",
        modelId: "",
        priority: 1,
        isActive: true,
    });

    useEffect(() => {
        loadProviders();
    }, []);

    async function loadProviders() {
        try {
            setLoading(true);
            const data = await apiFetch<Provider[]>("/system-admin/providers");
            setProviders(data || []);
        } catch (err) {
            console.error("Failed to load providers", err);
            toast.error("Provider'lar yüklenemedi");
        } finally {
            setLoading(false);
        }
    }

    async function handleTestProvider(id: number) {
        try {
            setTestingId(id);
            const result = await apiFetch<TestResult>(`/system-admin/providers/${id}/test`, {
                method: "POST",
            });
            setTestResult(result);
            setShowTestModal(true);

            if (result.success) {
                toast.success("Provider testi başarılı!");
            } else {
                toast.error("Provider testi başarısız!");
            }
        } catch (err: any) {
            toast.error(err?.message || "Test başarısız!");
            setTestResult({
                success: false,
                responseTime: 0,
                provider: "",
                error: err?.message || "Test başarısız"
            });
            setShowTestModal(true);
        } finally {
            setTestingId(null);
        }
    }

    async function handleToggleProvider(id: number, isActive: boolean) {
        try {
            await apiFetch(`/system-admin/providers/${id}`, {
                method: "PUT",
                body: JSON.stringify({ isActive }),
            });
            toast.success(`Provider ${isActive ? "aktif" : "pasif"} edildi!`);
            loadProviders();
        } catch (err) {
            toast.error("Provider durumu değiştirilemedi!");
        }
    }

    async function handleAddProvider() {
        try {
            setSaving(true);
            await apiFetch("/system-admin/providers", {
                method: "POST",
                body: JSON.stringify(newProvider),
            });
            toast.success("Provider başarıyla eklendi!");
            setShowAddModal(false);
            setNewProvider({
                type: "KIE",
                apiKey: "",
                baseUrl: "",
                modelId: "",
                priority: 1,
                isActive: true,
            });
            loadProviders();
        } catch (err: any) {
            toast.error(err?.message || "Provider eklenemedi!");
        } finally {
            setSaving(false);
        }
    }

    function handleEditProvider(provider: Provider) {
        setEditingProvider(provider);
        setShowEditModal(true);
    }

    async function handleUpdateProvider() {
        if (!editingProvider) return;

        const updateData = {
            apiKey: editingProvider.apiKey,
            baseUrl: editingProvider.baseUrl,
            modelId: editingProvider.modelId,
            priority: editingProvider.priority,
            isActive: editingProvider.isActive,
        };

        try {
            setSaving(true);
            await apiFetch(`/system-admin/providers/${editingProvider.id}`, {
                method: "PUT",
                body: JSON.stringify(updateData),
            });
            toast.success("Provider başarıyla güncellendi!");
            setShowEditModal(false);
            setEditingProvider(null);
            loadProviders();
        } catch (err: any) {
            console.error("Update error:", err);
            toast.error(err?.message || "Provider güncellenemedi!");
        } finally {
            setSaving(false);
        }
    }

    const getProviderBadge = (type: string) => {
        const colors: Record<string, any> = {
            KIE: "primary",
            REPLICATE: "success",
            FAL: "warning",
        };
        return <AppBadge variant={colors[type] || "info"}>{type}</AppBadge>;
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
            <div>
                <h1 className="text-3xl font-bold mb-2">AI Provider Yönetimi</h1>
                <p className="text-textMuted">
                    AI servislerini test edin ve yönetin
                </p>
            </div>

            {/* Providers List */}
            <AppCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-1">AI Provider'lar</h2>
                        <p className="text-sm text-textMuted">
                            Aktif provider'ları görüntüleyin ve test edin
                        </p>
                    </div>
                    <AppButton onClick={() => setShowAddModal(true)}>
                        ➕ Provider Ekle
                    </AppButton>
                </div>

                <div className="space-y-4">
                    {providers.map((provider) => (
                        <AppCard key={provider.id} className="p-6 bg-surface border border-border">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        {getProviderBadge(provider.provider)}
                                        <h3 className="text-lg font-semibold">{provider.provider} Provider</h3>

                                        {/* Priority Badge with Emoji */}
                                        {(() => {
                                            const priority = provider.priority || 1;
                                            const badges = {
                                                1: { emoji: '🥇', text: 'Primary', color: 'bg-primary/20 text-primary' },
                                                2: { emoji: '🥈', text: 'Secondary', color: 'bg-blue-500/20 text-blue-400' },
                                                3: { emoji: '🥉', text: 'Tertiary', color: 'bg-gray-500/20 text-gray-400' }
                                            };
                                            const badge = badges[priority as keyof typeof badges] || badges[1];
                                            return (
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                                                    {badge.emoji} {badge.text}
                                                </span>
                                            );
                                        })()}

                                        {provider.isActive ? (
                                            <span className="flex items-center gap-1 text-xs text-green-400">
                                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                Pasif
                                            </span>
                                        )}
                                    </div>

                                    {/* Health Metrics */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                                        <div>
                                            <p className="text-textMuted mb-1">Success Rate</p>
                                            <p className="text-sm font-medium text-green-400">
                                                {(() => {
                                                    const success = provider.successCount || 0;
                                                    const errors = provider.errorCount || 0;
                                                    const total = success + errors;
                                                    return total > 0
                                                        ? ((success / total) * 100).toFixed(1) + '%'
                                                        : '0%';
                                                })()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-textMuted mb-1">Avg Response</p>
                                            <p className="text-sm font-medium">
                                                {provider.avgResponseMs ? `${provider.avgResponseMs}ms` : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-textMuted mb-1">Error Count</p>
                                            <p className={`text-sm font-medium ${(provider.errorCount || 0) > 5 ? 'text-red-400' : 'text-white'}`}>
                                                {provider.errorCount || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-textMuted mb-1">Total Calls</p>
                                            <p className="text-sm font-medium">
                                                {(provider.successCount || 0) + (provider.errorCount || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-textMuted mb-1">Timeout</p>
                                            <p className="text-sm font-medium">
                                                {((provider.timeoutMs || 30000) / 1000).toFixed(0)}s
                                            </p>
                                        </div>
                                    </div>

                                    {/* Last Error */}
                                    {provider.lastError && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-3">
                                            <p className="text-xs text-red-400">
                                                <span className="font-bold">Son Hata:</span> {provider.lastError}
                                            </p>
                                            {provider.lastErrorAt && (
                                                <p className="text-xs text-textMuted mt-1">
                                                    {new Date(provider.lastErrorAt).toLocaleString('tr-TR')}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Config Details */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-textMuted mb-1">API Key</p>
                                            <p className="font-mono text-xs">
                                                {provider.apiKey ? `****${provider.apiKey.slice(-4)}` : "Yok"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-textMuted mb-1">Base URL</p>
                                            <p className="font-mono text-xs truncate">
                                                {provider.baseUrl || "Varsayılan"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-textMuted mb-1">Model ID</p>
                                            <p className="font-mono text-xs truncate">
                                                {provider.modelId || "Varsayılan"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    <AppButton
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleTestProvider(provider.id)}
                                        loading={testingId === provider.id}
                                        disabled={!provider.isActive}
                                    >
                                        {testingId === provider.id ? "Test Ediliyor..." : "🧪 Test Et"}
                                    </AppButton>

                                    <AppButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditProvider(provider)}
                                    >
                                        ✏️ Düzenle
                                    </AppButton>

                                    <AppButton
                                        variant={provider.isActive ? "ghost" : "ghost"}
                                        size="sm"
                                        onClick={() => handleToggleProvider(provider.id, !provider.isActive)}
                                        className={provider.isActive ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}
                                    >
                                        {provider.isActive ? "Pasif Et" : "Aktif Et"}
                                    </AppButton>

                                    <AppButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                            if (confirm(`${provider.provider} provider'ını silmek istediğinizden emin misiniz?`)) {
                                                try {
                                                    await apiFetch(`/system-admin/providers/${provider.id}`, {
                                                        method: "DELETE"
                                                    });
                                                    toast.success("Provider silindi!");
                                                    loadProviders();
                                                } catch (err: any) {
                                                    toast.error(err?.message || "Provider silinemedi!");
                                                }
                                            }
                                        }}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        🗑️ Sil
                                    </AppButton>
                                </div>
                            </div>
                        </AppCard>
                    ))}

                    {providers.length === 0 && (
                        <div className="text-center py-12 text-textMuted">
                            <p>Henüz provider eklenmemiş</p>
                        </div>
                    )}
                </div>
            </AppCard >

            {/* Test Result Modal */}
            {
                showTestModal && testResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-white">
                                    {testResult.success ? "✅ Test Başarılı" : "❌ Test Başarısız"}
                                </h3>
                                <button onClick={() => setShowTestModal(false)} className="text-textMuted hover:text-white">✕</button>
                            </div>

                            <div className="space-y-3">
                                <div className="p-4 bg-surfaceAlt rounded-lg">
                                    <p className="text-xs text-textMuted mb-1">Provider</p>
                                    <p className="text-sm font-medium">{testResult.provider}</p>
                                </div>

                                <div className="p-4 bg-surfaceAlt rounded-lg">
                                    <p className="text-xs text-textMuted mb-1">Response Time</p>
                                    <p className="text-sm font-medium">{testResult.responseTime}ms</p>
                                </div>

                                {testResult.message && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <p className="text-sm text-green-400">{testResult.message}</p>
                                    </div>
                                )}

                                {testResult.error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                        <p className="text-sm text-red-400">{testResult.error}</p>
                                    </div>
                                )}
                            </div>

                            <AppButton onClick={() => setShowTestModal(false)} fullWidth>
                                Kapat
                            </AppButton>
                        </div>
                    </div>
                )
            }

            {/* Add Provider Modal */}
            {
                showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-white">
                                    ➕ Yeni Provider Ekle
                                </h3>
                                <button onClick={() => setShowAddModal(false)} className="text-textMuted hover:text-white">✕</button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Provider Tipi</label>
                                    <select
                                        value={newProvider.type}
                                        onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value })}
                                        className="w-full bg-surfaceAlt border border-border rounded-lg p-3 text-white"
                                    >
                                        <option value="KIE">KIE</option>
                                        <option value="REPLICATE">Replicate</option>
                                        <option value="FAL">FAL</option>
                                    </select>
                                </div>

                                <AppInput
                                    label="API Key"
                                    value={newProvider.apiKey}
                                    onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                                    placeholder="sk-..."
                                    required
                                />

                                <AppInput
                                    label="Base URL (Opsiyonel)"
                                    value={newProvider.baseUrl}
                                    onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                                    placeholder="https://api.example.com"
                                />

                                <AppInput
                                    label="Model ID (Opsiyonel)"
                                    value={newProvider.modelId}
                                    onChange={(e) => setNewProvider({ ...newProvider, modelId: e.target.value })}
                                    placeholder="google/nano-banana-pro"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Öncelik (Priority)
                                    </label>
                                    <select
                                        value={newProvider.priority}
                                        onChange={(e) => setNewProvider({ ...newProvider, priority: parseInt(e.target.value) })}
                                        className="w-full bg-surfaceAlt border border-border rounded-lg p-3 text-white"
                                    >
                                        <option value="1">🥇 Primary (1) - İlk tercih</option>
                                        <option value="2">🥈 Secondary (2) - Yedek</option>
                                        <option value="3">🥉 Tertiary (3) - Son çare</option>
                                    </select>
                                    <p className="text-xs text-textMuted mt-1">
                                        Düşük numara = Yüksek öncelik. Primary provider önce denenir.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={newProvider.isActive}
                                        onChange={(e) => setNewProvider({ ...newProvider, isActive: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-white">
                                        Hemen aktif et
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <AppButton variant="secondary" onClick={() => setShowAddModal(false)}>
                                    İptal
                                </AppButton>
                                <AppButton onClick={handleAddProvider} loading={saving} disabled={!newProvider.apiKey}>
                                    {saving ? "Ekleniyor..." : "Provider Ekle"}
                                </AppButton>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Provider Modal */}
            {
                showEditModal && editingProvider && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-white">
                                    ✏️ Provider Düzenle
                                </h3>
                                <button onClick={() => setShowEditModal(false)} className="text-textMuted hover:text-white">✕</button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Provider Tipi</label>
                                    <input
                                        value={editingProvider.provider}
                                        disabled
                                        className="w-full bg-surfaceAlt/50 border border-border rounded-lg p-3 text-textMuted cursor-not-allowed"
                                    />
                                    <p className="text-xs text-textMuted mt-1">Provider tipi değiştirilemez</p>
                                </div>

                                <AppInput
                                    label="API Key"
                                    value={editingProvider.apiKey || ""}
                                    onChange={(e) => setEditingProvider({ ...editingProvider, apiKey: e.target.value })}
                                    placeholder="sk-..."
                                />

                                <AppInput
                                    label="Base URL (Opsiyonel)"
                                    value={editingProvider.baseUrl || ""}
                                    onChange={(e) => setEditingProvider({ ...editingProvider, baseUrl: e.target.value })}
                                    placeholder="https://api.example.com"
                                />

                                <AppInput
                                    label="Model ID (Opsiyonel)"
                                    value={editingProvider.modelId || ""}
                                    onChange={(e) => setEditingProvider({ ...editingProvider, modelId: e.target.value })}
                                    placeholder="google/nano-banana-pro"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Öncelik (Priority)
                                    </label>
                                    <select
                                        value={editingProvider.priority}
                                        onChange={(e) => setEditingProvider({ ...editingProvider, priority: parseInt(e.target.value) })}
                                        className="w-full bg-surfaceAlt border border-border rounded-lg p-3 text-white"
                                    >
                                        <option value="1">🥇 Primary (1) - İlk tercih</option>
                                        <option value="2">🥈 Secondary (2) - Yedek</option>
                                        <option value="3">🥉 Tertiary (3) - Son çare</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="editIsActive"
                                        checked={editingProvider.isActive}
                                        onChange={(e) => setEditingProvider({ ...editingProvider, isActive: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="editIsActive" className="text-sm text-white">
                                        Aktif
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <AppButton variant="secondary" onClick={() => setShowEditModal(false)}>
                                    İptal
                                </AppButton>
                                <AppButton onClick={handleUpdateProvider} loading={saving}>
                                    {saving ? "Güncelleniyor..." : "Güncelle"}
                                </AppButton>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

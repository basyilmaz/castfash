"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { toast } from "sonner";

interface Generation {
    id: number;
    status: string;
    quality: string;
    creditsConsumed: number;
    createdAt: string;
    completedAt: string | null;
    organization: {
        id: number;
        name: string;
    };
    product: {
        id: number;
        name: string;
    };
    modelProfile: {
        id: number;
        name: string;
    };
    scenePreset: {
        id: number;
        name: string;
    } | null;
    _count: {
        generatedImages: number;
    };
}

export default function GenerationsPage() {
    const router = useRouter();
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterQuality, setFilterQuality] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<string>("desc");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);

    useEffect(() => {
        loadGenerations();
    }, [search, filterStatus, filterQuality, sortBy, sortOrder, page]);

    async function loadGenerations() {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                search,
                skip: String((page - 1) * pageSize),
                take: String(pageSize),
            });

            if (filterStatus !== "all") {
                params.append("status", filterStatus);
            }

            const data = await apiFetch<{ generations: Generation[]; total: number }>(
                `/system-admin/generations?${params.toString()}`
            );

            // Safety check
            if (!data || !data.generations) {
                setGenerations([]);
                setTotal(0);
                return;
            }

            let filteredGenerations = [...data.generations];

            // Client-side filtering for quality
            if (filterQuality !== "all") {
                filteredGenerations = filteredGenerations.filter(g => g.quality === filterQuality);
            }

            // Client-side sorting
            filteredGenerations.sort((a, b) => {
                let aVal: any, bVal: any;

                switch (sortBy) {
                    case "product":
                        aVal = (a.product?.name || "").toLowerCase();
                        bVal = (b.product?.name || "").toLowerCase();
                        break;
                    case "model":
                        aVal = (a.modelProfile?.name || "").toLowerCase();
                        bVal = (b.modelProfile?.name || "").toLowerCase();
                        break;
                    case "credits":
                        aVal = a.creditsConsumed || 0;
                        bVal = b.creditsConsumed || 0;
                        break;
                    case "images":
                        aVal = a._count?.generatedImages || 0;
                        bVal = b._count?.generatedImages || 0;
                        break;
                    case "createdAt":
                    default:
                        aVal = new Date(a.createdAt || 0).getTime();
                        bVal = new Date(b.createdAt || 0).getTime();
                        break;
                }

                if (sortOrder === "asc") {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });

            setGenerations(filteredGenerations);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Failed to load generations", err);
            toast.error("Üretimler yüklenemedi");
            setGenerations([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }

    function exportGenerations() {
        const csv = [
            ["ID", "Ürün", "Model", "Durum", "Kalite", "Kredi", "Görsel Sayısı", "Tarih"].join(","),
            ...generations.map(g => [
                g.id,
                `"${g.product.name}"`,
                `"${g.modelProfile.name}"`,
                g.status,
                g.quality,
                g.creditsConsumed,
                g._count.generatedImages,
                new Date(g.createdAt).toLocaleString("tr-TR"),
            ].join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `uretimler-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success("Üretimler dışa aktarıldı!");
    }

    const totalPages = Math.ceil(total / pageSize);

    const getStatusBadge = (status: string) => {
        if (status === "DONE") return <AppBadge variant="success">Tamamlandı</AppBadge>;
        if (status === "ERROR") return <AppBadge variant="danger">Hata</AppBadge>;
        if (status === "PROCESSING") return <AppBadge variant="warning">İşleniyor</AppBadge>;
        if (status === "PENDING") return <AppBadge variant="info">Bekliyor</AppBadge>;
        return <AppBadge variant="default">{status}</AppBadge>;
    };

    const getQualityBadge = (quality: string) => {
        if (quality === "HIGH") return <AppBadge variant="success">Yüksek</AppBadge>;
        if (quality === "STANDARD") return <AppBadge variant="info">Standart</AppBadge>;
        if (quality === "FAST") return <AppBadge variant="warning">Hızlı</AppBadge>;
        return <AppBadge variant="default">{quality}</AppBadge>;
    };

    // Calculate stats
    const stats = {
        total: generations.length,
        done: generations.filter(g => g.status === "DONE").length,
        processing: generations.filter(g => g.status === "PROCESSING").length,
        error: generations.filter(g => g.status === "ERROR").length,
        totalCredits: generations.reduce((sum, g) => sum + (g.creditsConsumed || 0), 0),
        totalImages: generations.reduce((sum, g) => sum + (g._count?.generatedImages || 0), 0),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Üretim Yönetimi</h1>
                    <p className="text-textMuted">Toplam {total} üretim</p>
                </div>
                <div className="flex gap-3">
                    <AppButton variant="outline" onClick={exportGenerations}>
                        📥 Dışa Aktar
                    </AppButton>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <AppCard className="p-4">
                    <div className="text-xs text-textMuted mb-1">Toplam</div>
                    <div className="text-2xl font-bold text-primary">{stats.total}</div>
                </AppCard>
                <AppCard className="p-4">
                    <div className="text-xs text-textMuted mb-1">Tamamlandı</div>
                    <div className="text-2xl font-bold text-green-400">{stats.done}</div>
                </AppCard>
                <AppCard className="p-4">
                    <div className="text-xs text-textMuted mb-1">İşleniyor</div>
                    <div className="text-2xl font-bold text-yellow-400">{stats.processing}</div>
                </AppCard>
                <AppCard className="p-4">
                    <div className="text-xs text-textMuted mb-1">Hata</div>
                    <div className="text-2xl font-bold text-red-400">{stats.error}</div>
                </AppCard>
                <AppCard className="p-4">
                    <div className="text-xs text-textMuted mb-1">Kredi</div>
                    <div className="text-2xl font-bold text-accent">{stats.totalCredits}</div>
                </AppCard>
                <AppCard className="p-4">
                    <div className="text-xs text-textMuted mb-1">Görsel</div>
                    <div className="text-2xl font-bold text-secondary">{stats.totalImages}</div>
                </AppCard>
            </div>

            {/* Filters & Search */}
            <AppCard className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <AppInput
                            label="Üretim Ara"
                            placeholder="Ürün veya model adı ile ara..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Durum
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                        >
                            <option value="all">Tümü</option>
                            <option value="DONE">Tamamlandı</option>
                            <option value="PROCESSING">İşleniyor</option>
                            <option value="PENDING">Bekliyor</option>
                            <option value="ERROR">Hata</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Kalite
                        </label>
                        <select
                            value={filterQuality}
                            onChange={(e) => {
                                setFilterQuality(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                        >
                            <option value="all">Tümü</option>
                            <option value="HIGH">Yüksek</option>
                            <option value="STANDARD">Standart</option>
                            <option value="FAST">Hızlı</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Sırala
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary text-sm"
                            >
                                <option value="createdAt">Tarih</option>
                                <option value="product">Ürün</option>
                                <option value="model">Model</option>
                                <option value="credits">Kredi</option>
                                <option value="images">Görsel Sayısı</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                className="px-3 py-2 bg-surface border border-border rounded-lg hover:border-primary transition-colors"
                            >
                                {sortOrder === "asc" ? "↑" : "↓"}
                            </button>
                        </div>
                    </div>
                </div>
            </AppCard>

            {/* Generations List */}
            {loading ? (
                <div className="text-textMuted text-center py-8">Yükleniyor...</div>
            ) : (
                <>
                    <div className="space-y-4">
                        {generations.map((gen) => (
                            <AppCard
                                key={gen.id}
                                className="p-6 cursor-pointer hover:border-primary transition-colors"
                                onClick={() => router.push(`/system-admin/generations/${gen.id}`)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">#{gen.id}</h3>
                                            {getStatusBadge(gen.status)}
                                            {getQualityBadge(gen.quality)}
                                        </div>
                                        <div className="text-sm text-textMuted mb-3">
                                            {gen.organization.name} • {new Date(gen.createdAt).toLocaleString('tr-TR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-xs text-textMuted mb-1">Ürün</div>
                                        <div className="font-medium">{gen.product.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-textMuted mb-1">Model</div>
                                        <div className="font-medium">{gen.modelProfile.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-textMuted mb-1">Harcanan Kredi</div>
                                        <div className="font-medium text-accent">{gen.creditsConsumed}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-textMuted mb-1">Üretilen Görsel</div>
                                        <div className="font-medium text-primary">{gen._count.generatedImages}</div>
                                    </div>
                                </div>
                            </AppCard>
                        ))}
                    </div>


                    {/* Empty State */}
                    {generations.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🎨</div>
                            <div className="text-xl font-semibold mb-2">Üretim bulunamadı</div>
                            <div className="text-textMuted mb-6 max-w-md mx-auto">
                                {search ? "Arama kriterlerinize uygun üretim yok" : "Henüz üretim yapılmamış"}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <AppButton
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                ← Önceki
                            </AppButton>
                            <div className="text-sm text-textMuted">
                                Sayfa {page} / {totalPages}
                            </div>
                            <AppButton
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Sonraki →
                            </AppButton>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

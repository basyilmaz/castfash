"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { toast } from "sonner";
import Image from "next/image";

interface Model {
    id: number;
    name: string;
    gender: string;
    ethnicity: string;
    ageRange: string;
    bodyType: string;
    hairColor: string;
    eyeColor: string;
    height: number;
    referenceImages: string[];
    createdAt: string;
    organization: {
        id: number;
        name: string;
    };
    _count: {
        generationRequests: number;
    };
}

export default function ModelsPage() {
    const router = useRouter();
    const [models, setModels] = useState<Model[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [filterOrg, setFilterOrg] = useState<string>("all");
    const [filterGender, setFilterGender] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<string>("desc");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);

    // Organizations for filter
    const [organizations, setOrganizations] = useState<Array<{ id: number; name: string }>>([]);

    useEffect(() => {
        loadOrganizations();
    }, []);

    useEffect(() => {
        loadModels();
    }, [search, filterOrg, filterGender, sortBy, sortOrder, page]);

    async function loadOrganizations() {
        try {
            const data = await apiFetch<{ organizations: Array<{ id: number; name: string }> }>(
                "/system-admin/organizations?take=1000"
            );
            setOrganizations(data.organizations || []);
        } catch (err) {
            console.error("Failed to load organizations", err);
        }
    }

    async function loadModels() {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                search,
                skip: String((page - 1) * pageSize),
                take: String(pageSize),
            });

            const data = await apiFetch<{ models: Model[]; total: number }>(
                `/system-admin/models?${params.toString()}`
            );

            // Safety check
            if (!data || !data.models) {
                setModels([]);
                setTotal(0);
                return;
            }

            let filteredModels = [...data.models];

            // Client-side filtering
            if (filterOrg !== "all") {
                filteredModels = filteredModels.filter(m =>
                    m.organization && m.organization.id === parseInt(filterOrg)
                );
            }

            if (filterGender !== "all") {
                filteredModels = filteredModels.filter(m => m.gender === filterGender);
            }

            // Client-side sorting
            filteredModels.sort((a, b) => {
                let aVal: any, bVal: any;

                switch (sortBy) {
                    case "name":
                        aVal = (a.name || "").toLowerCase();
                        bVal = (b.name || "").toLowerCase();
                        break;
                    case "organization":
                        aVal = (a.organization?.name || "").toLowerCase();
                        bVal = (b.organization?.name || "").toLowerCase();
                        break;
                    case "generations":
                        aVal = a._count?.generationRequests || 0;
                        bVal = b._count?.generationRequests || 0;
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

            setModels(filteredModels);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Failed to load models", err);
            toast.error("Modeller yüklenemedi");
            setModels([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }

    function exportModels() {
        const csv = [
            ["ID", "Model Adı", "Cinsiyet", "Etnik Köken", "Yaş Aralığı", "Organizasyon", "Üretim Sayısı", "Kayıt Tarihi"].join(","),
            ...models.map(m => [
                m.id,
                `"${m.name}"`,
                m.gender,
                m.ethnicity,
                m.ageRange,
                `"${m.organization.name}"`,
                m._count.generationRequests,
                new Date(m.createdAt).toLocaleDateString("tr-TR"),
            ].join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `modeller-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success("Modeller dışa aktarıldı!");
    }

    const totalPages = Math.ceil(total / pageSize);

    const getGenderBadge = (gender: string) => {
        if (gender === "MALE") return <AppBadge variant="info">Erkek</AppBadge>;
        if (gender === "FEMALE") return <AppBadge variant="success">Kadın</AppBadge>;
        return <AppBadge variant="default">{gender}</AppBadge>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Model Yönetimi</h1>
                    <p className="text-textMuted">Toplam {total} model</p>
                </div>
                <div className="flex gap-3">
                    <AppButton variant="outline" onClick={exportModels}>
                        📥 Dışa Aktar
                    </AppButton>
                </div>
            </div>

            {/* Filters & Search */}
            <AppCard className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <AppInput
                            label="Model Ara"
                            placeholder="Model adı ile ara..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Organizasyon
                        </label>
                        <select
                            value={filterOrg}
                            onChange={(e) => {
                                setFilterOrg(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                        >
                            <option value="all">Tümü</option>
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Cinsiyet
                        </label>
                        <select
                            value={filterGender}
                            onChange={(e) => {
                                setFilterGender(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                        >
                            <option value="all">Tümü</option>
                            <option value="MALE">Erkek</option>
                            <option value="FEMALE">Kadın</option>
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
                                <option value="name">İsim</option>
                                <option value="organization">Organizasyon</option>
                                <option value="generations">Üretim Sayısı</option>
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

            {/* Model Grid */}
            {loading ? (
                <div className="text-textMuted text-center py-8">Yükleniyor...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {models.map((model) => (
                            <AppCard
                                key={model.id}
                                className="overflow-hidden cursor-pointer hover:border-primary transition-colors group"
                                onClick={() => router.push(`/system-admin/models/${model.id}`)}
                            >
                                {/* Model Image */}
                                <div className="relative h-64 bg-surface">
                                    {model.referenceImages && model.referenceImages.length > 0 ? (
                                        <Image
                                            src={model.referenceImages[0]}
                                            alt={model.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-6xl">
                                            🧑‍🎤
                                        </div>
                                    )}
                                </div>

                                {/* Model Info */}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold truncate flex-1">{model.name}</h3>
                                        {getGenderBadge(model.gender)}
                                    </div>
                                    <div className="text-sm text-textMuted mb-3">
                                        {model.organization.name}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                        <div>
                                            <span className="text-textMuted">Yaş:</span> {model.ageRange}
                                        </div>
                                        <div>
                                            <span className="text-textMuted">Boy:</span> {model.height}cm
                                        </div>
                                        <div>
                                            <span className="text-textMuted">Saç:</span> {model.hairColor}
                                        </div>
                                        <div>
                                            <span className="text-textMuted">Göz:</span> {model.eyeColor}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <div className="text-xs text-textMuted">
                                            {new Date(model.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                        <AppBadge variant="info">
                                            {model._count.generationRequests} üretim
                                        </AppBadge>
                                    </div>
                                </div>
                            </AppCard>
                        ))}
                    </div>


                    {/* Empty State */}
                    {models.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🧑‍🎤</div>
                            <div className="text-xl font-semibold mb-2">Model bulunamadı</div>
                            <div className="text-textMuted mb-6 max-w-md mx-auto">
                                {search ? "Arama kriterlerinize uygun model yok" : "Henüz model eklenmemiş"}
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

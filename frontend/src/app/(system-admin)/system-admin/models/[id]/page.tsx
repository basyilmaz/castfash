"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import Image from "next/image";

interface ModelDetail {
    id: number;
    name: string;
    gender: string;
    ethnicity: string | null;
    age: number | null;
    height: number | null;
    weight: number | null;
    hairColor: string | null;
    eyeColor: string | null;
    bodyType: string | null;
    skinTone: string | null;
    createdAt: string;
    organization: {
        id: number;
        name: string;
    };
    generationRequests: Array<{
        id: number;
        status: string;
        createdAt: string;
        product: {
            id: number;
            name: string;
        };
        generatedImages: Array<{
            id: number;
            imageUrl: string;
        }>;
    }>;
    _count: {
        generationRequests: number;
    };
}

export default function ModelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const modelId = params.id as string;

    const [model, setModel] = useState<ModelDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadModelDetail();
    }, [modelId]);

    async function loadModelDetail() {
        try {
            setLoading(true);
            const data = await apiFetch<ModelDetail>(`/system-admin/models/${modelId}`);
            setModel(data);
        } catch (err) {
            console.error("Failed to load model detail", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-textMuted">Yükleniyor...</div>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-textMuted">Model bulunamadı</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{model.name}</h1>
                    <p className="text-textMuted">
                        Oluşturulma: {new Date(model.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                </div>
                <AppButton
                    variant="outline"
                    onClick={() => router.push("/system-admin/models")}
                >
                    ← Geri
                </AppButton>
            </div>

            {/* Stats Card */}
            <AppCard className="p-6">
                <div className="text-sm text-textMuted mb-1">Toplam Üretim</div>
                <div className="text-3xl font-bold text-primary">
                    {model._count.generationRequests}
                </div>
            </AppCard>

            {/* Model Info */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Model Bilgileri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <div className="text-sm text-textMuted">Model Adı</div>
                        <div className="text-lg font-medium">{model.name}</div>
                    </div>
                    <div>
                        <div className="text-sm text-textMuted">Cinsiyet</div>
                        <div className="text-lg font-medium">
                            <AppBadge variant={model.gender === "MALE" ? "info" : "success"}>
                                {model.gender === "MALE" ? "Erkek" : model.gender === "FEMALE" ? "Kadın" : "Diğer"}
                            </AppBadge>
                        </div>
                    </div>
                    {model.ethnicity && (
                        <div>
                            <div className="text-sm text-textMuted">Etnik Köken</div>
                            <div className="text-lg font-medium">{model.ethnicity}</div>
                        </div>
                    )}
                    {model.age && (
                        <div>
                            <div className="text-sm text-textMuted">Yaş</div>
                            <div className="text-lg font-medium">{model.age}</div>
                        </div>
                    )}
                    {model.height && (
                        <div>
                            <div className="text-sm text-textMuted">Boy (cm)</div>
                            <div className="text-lg font-medium">{model.height}</div>
                        </div>
                    )}
                    {model.weight && (
                        <div>
                            <div className="text-sm text-textMuted">Kilo (kg)</div>
                            <div className="text-lg font-medium">{model.weight}</div>
                        </div>
                    )}
                    {model.hairColor && (
                        <div>
                            <div className="text-sm text-textMuted">Saç Rengi</div>
                            <div className="text-lg font-medium">{model.hairColor}</div>
                        </div>
                    )}
                    {model.eyeColor && (
                        <div>
                            <div className="text-sm text-textMuted">Göz Rengi</div>
                            <div className="text-lg font-medium">{model.eyeColor}</div>
                        </div>
                    )}
                    {model.bodyType && (
                        <div>
                            <div className="text-sm text-textMuted">Vücut Tipi</div>
                            <div className="text-lg font-medium">{model.bodyType}</div>
                        </div>
                    )}
                    {model.skinTone && (
                        <div>
                            <div className="text-sm text-textMuted">Cilt Tonu</div>
                            <div className="text-lg font-medium">{model.skinTone}</div>
                        </div>
                    )}
                    <div>
                        <div className="text-sm text-textMuted">Organizasyon</div>
                        <div
                            className="text-lg font-medium text-primary cursor-pointer hover:underline"
                            onClick={() => router.push(`/system-admin/organizations/${model.organization.id}`)}
                        >
                            {model.organization.name}
                        </div>
                    </div>
                </div>
            </AppCard>

            {/* Generation Requests */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Son Üretimler ({model.generationRequests.length > 0 ? `${model.generationRequests.length} / ${model._count.generationRequests}` : "0"})
                </h2>
                {model.generationRequests.length > 0 ? (
                    <div className="space-y-4">
                        {model.generationRequests.map((gen) => (
                            <div
                                key={gen.id}
                                className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                                onClick={() => router.push(`/system-admin/generations/${gen.id}`)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="font-semibold mb-1">
                                            {gen.product.name}
                                        </div>
                                        <div className="text-sm text-textMuted">
                                            {new Date(gen.createdAt).toLocaleDateString("tr-TR")} {new Date(gen.createdAt).toLocaleTimeString("tr-TR")}
                                        </div>
                                    </div>
                                    <AppBadge
                                        variant={
                                            gen.status === "COMPLETED" ? "success" :
                                                gen.status === "FAILED" ? "danger" :
                                                    gen.status === "PROCESSING" ? "warning" : "info"
                                        }
                                    >
                                        {gen.status}
                                    </AppBadge>
                                </div>
                                {gen.generatedImages.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto">
                                        {gen.generatedImages.slice(0, 4).map((img) => (
                                            <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                                                <Image
                                                    src={img.imageUrl}
                                                    alt="Generated"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                        {gen.generatedImages.length > 4 && (
                                            <div className="w-20 h-20 rounded-lg bg-surface flex items-center justify-center text-textMuted text-sm">
                                                +{gen.generatedImages.length - 4}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-textMuted">
                        Bu model için henüz üretim yapılmamış
                    </div>
                )}
            </AppCard>
        </div>
    );
}

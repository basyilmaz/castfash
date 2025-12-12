"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import Image from "next/image";

interface GenerationDetail {
    id: number;
    status: string;
    prompt: string | null;
    negativePrompt: string | null;
    quality: string;
    numImages: number;
    creditsUsed: number;
    createdAt: string;
    completedAt: string | null;
    organization: {
        id: number;
        name: string;
    };
    product: {
        id: number;
        name: string;
        imageUrl: string | null;
    };
    modelProfile: {
        id: number;
        name: string;
    } | null;
    scenePreset: {
        id: number;
        name: string;
        description: string | null;
    } | null;
    generatedImages: Array<{
        id: number;
        imageUrl: string;
        indexNumber: number;
    }>;
}

export default function GenerationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const genId = params.id as string;

    const [generation, setGeneration] = useState<GenerationDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGenerationDetail();
    }, [genId]);

    async function loadGenerationDetail() {
        try {
            setLoading(true);
            const data = await apiFetch<GenerationDetail>(`/system-admin/generations/${genId}`);
            setGeneration(data);
        } catch (err) {
            console.error("Failed to load generation detail", err);
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

    if (!generation) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-textMuted">Üretim bulunamadı</div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <AppBadge variant="success">Tamamlandı</AppBadge>;
            case "FAILED":
                return <AppBadge variant="danger">Başarısız</AppBadge>;
            case "PROCESSING":
                return <AppBadge variant="warning">İşleniyor</AppBadge>;
            case "PENDING":
                return <AppBadge variant="info">Bekliyor</AppBadge>;
            default:
                return <AppBadge>{status}</AppBadge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">Üretim #{generation.id}</h1>
                        {getStatusBadge(generation.status)}
                    </div>
                    <p className="text-textMuted">
                        Oluşturulma: {new Date(generation.createdAt).toLocaleDateString("tr-TR")} {new Date(generation.createdAt).toLocaleTimeString("tr-TR")}
                    </p>
                </div>
                <AppButton
                    variant="outline"
                    onClick={() => router.push("/system-admin/generations")}
                >
                    ← Geri
                </AppButton>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Kullanılan Kredi</div>
                    <div className="text-3xl font-bold text-accent">
                        {generation.creditsUsed}
                    </div>
                </AppCard>
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Görsel Sayısı</div>
                    <div className="text-3xl font-bold text-primary">
                        {generation.numImages}
                    </div>
                </AppCard>
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Kalite</div>
                    <div className="text-2xl font-bold text-secondary">
                        {generation.quality}
                    </div>
                </AppCard>
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Üretilen</div>
                    <div className="text-2xl font-bold text-primary">
                        {generation.generatedImages.length}
                    </div>
                </AppCard>
            </div>

            {/* Generation Info */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Üretim Bilgileri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm text-textMuted">Organizasyon</div>
                        <div
                            className="text-lg font-medium text-primary cursor-pointer hover:underline"
                            onClick={() => router.push(`/system-admin/organizations/${generation.organization.id}`)}
                        >
                            {generation.organization.name}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-textMuted">Ürün</div>
                        <div
                            className="text-lg font-medium text-primary cursor-pointer hover:underline"
                            onClick={() => router.push(`/system-admin/products/${generation.product.id}`)}
                        >
                            {generation.product.name}
                        </div>
                    </div>
                    {generation.modelProfile && (
                        <div>
                            <div className="text-sm text-textMuted">Model</div>
                            <div
                                className="text-lg font-medium text-primary cursor-pointer hover:underline"
                                onClick={() => router.push(`/system-admin/models/${generation.modelProfile!.id}`)}
                            >
                                {generation.modelProfile.name}
                            </div>
                        </div>
                    )}
                    {generation.scenePreset && (
                        <div>
                            <div className="text-sm text-textMuted">Sahne</div>
                            <div className="text-lg font-medium">{generation.scenePreset.name}</div>
                        </div>
                    )}
                    {generation.completedAt && (
                        <div>
                            <div className="text-sm text-textMuted">Tamamlanma</div>
                            <div className="text-lg font-medium">
                                {new Date(generation.completedAt).toLocaleDateString("tr-TR")} {new Date(generation.completedAt).toLocaleTimeString("tr-TR")}
                            </div>
                        </div>
                    )}
                </div>
            </AppCard>

            {/* Prompts */}
            {(generation.prompt || generation.negativePrompt) && (
                <AppCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Prompt Bilgileri</h2>
                    <div className="space-y-4">
                        {generation.prompt && (
                            <div>
                                <div className="text-sm text-textMuted mb-2">Prompt</div>
                                <div className="bg-surface p-4 rounded-lg text-sm border border-border">
                                    {generation.prompt}
                                </div>
                            </div>
                        )}
                        {generation.negativePrompt && (
                            <div>
                                <div className="text-sm text-textMuted mb-2">Negative Prompt</div>
                                <div className="bg-surface p-4 rounded-lg text-sm border border-border">
                                    {generation.negativePrompt}
                                </div>
                            </div>
                        )}
                    </div>
                </AppCard>
            )}

            {/* Product Image */}
            {generation.product.imageUrl && (
                <AppCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Ürün Görseli</h2>
                    <div className="relative aspect-square max-w-md rounded-lg overflow-hidden bg-surface">
                        <Image
                            src={generation.product.imageUrl}
                            alt={generation.product.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                </AppCard>
            )}

            {/* Generated Images */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Üretilen Görseller ({generation.generatedImages.length})
                </h2>
                {generation.generatedImages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {generation.generatedImages.map((img) => (
                            <div key={img.id} className="space-y-2">
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-surface border border-border">
                                    <Image
                                        src={img.imageUrl}
                                        alt={`Generated ${img.indexNumber}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="text-sm text-textMuted text-center">
                                    Görsel #{img.indexNumber + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-textMuted">
                        {generation.status === "COMPLETED"
                            ? "Görsel üretilmedi"
                            : generation.status === "PROCESSING"
                                ? "Görseller işleniyor..."
                                : "Henüz görsel yok"}
                    </div>
                )}
            </AppCard>
        </div>
    );
}

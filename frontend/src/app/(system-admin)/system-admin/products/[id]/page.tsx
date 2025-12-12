"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import Image from "next/image";

interface ProductDetail {
    id: number;
    name: string;
    description: string | null;
    sku: string | null;
    imageUrl: string | null;
    createdAt: string;
    organization: {
        id: number;
        name: string;
    };
    category: {
        id: number;
        name: string;
    } | null;
    generationRequests: Array<{
        id: number;
        status: string;
        createdAt: string;
        generatedImages: Array<{
            id: number;
            imageUrl: string;
        }>;
    }>;
    _count: {
        generationRequests: number;
        generatedImages: number;
    };
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProductDetail();
    }, [productId]);

    async function loadProductDetail() {
        try {
            setLoading(true);
            const data = await apiFetch<ProductDetail>(`/system-admin/products/${productId}`);
            setProduct(data);
        } catch (err) {
            console.error("Failed to load product detail", err);
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

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-textMuted">Ürün bulunamadı</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                    <p className="text-textMuted">
                        Oluşturulma: {new Date(product.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                </div>
                <AppButton
                    variant="outline"
                    onClick={() => router.push("/system-admin/products")}
                >
                    ← Geri
                </AppButton>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Toplam Üretim</div>
                    <div className="text-3xl font-bold text-primary">
                        {product._count.generationRequests}
                    </div>
                </AppCard>
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Üretilen Görsel</div>
                    <div className="text-3xl font-bold text-accent">
                        {product._count.generatedImages}
                    </div>
                </AppCard>
            </div>

            {/* Product Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Image */}
                {product.imageUrl && (
                    <AppCard className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Ürün Görseli</h2>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-surface">
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </AppCard>
                )}

                {/* Product Details */}
                <AppCard className={`p-6 ${product.imageUrl ? "lg:col-span-2" : "lg:col-span-3"}`}>
                    <h2 className="text-xl font-semibold mb-4">Ürün Bilgileri</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm text-textMuted">Ürün Adı</div>
                            <div className="text-lg font-medium">{product.name}</div>
                        </div>
                        {product.sku && (
                            <div>
                                <div className="text-sm text-textMuted">SKU</div>
                                <div className="text-lg font-medium">{product.sku}</div>
                            </div>
                        )}
                        {product.description && (
                            <div>
                                <div className="text-sm text-textMuted">Açıklama</div>
                                <div className="text-base">{product.description}</div>
                            </div>
                        )}
                        {product.category && (
                            <div>
                                <div className="text-sm text-textMuted">Kategori</div>
                                <div className="text-lg font-medium">{product.category.name}</div>
                            </div>
                        )}
                        <div>
                            <div className="text-sm text-textMuted">Organizasyon</div>
                            <div
                                className="text-lg font-medium text-primary cursor-pointer hover:underline"
                                onClick={() => router.push(`/system-admin/organizations/${product.organization.id}`)}
                            >
                                {product.organization.name}
                            </div>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Generation Requests */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Son Üretimler ({product.generationRequests.length > 0 ? `${product.generationRequests.length} / ${product._count.generationRequests}` : "0"})
                </h2>
                {product.generationRequests.length > 0 ? (
                    <div className="space-y-4">
                        {product.generationRequests.map((gen) => (
                            <div
                                key={gen.id}
                                className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                                onClick={() => router.push(`/system-admin/generations/${gen.id}`)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="font-semibold mb-1">Üretim #{gen.id}</div>
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
                        Bu ürün için henüz üretim yapılmamış
                    </div>
                )}
            </AppCard>
        </div>
    );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGeneration } from "@/lib/api/generations";
import type { GenerationDetail } from "@/types";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type GenerationStatus = "processing" | "completed" | "failed" | "partial";

const getStatus = (data: GenerationDetail): GenerationStatus => {
  const hasFrontError = !!data.errors?.front;
  const hasBackError = !!data.errors?.back;
  const frontDone = (data.frontImages?.length ?? 0) > 0;
  const backDone = (data.backImages?.length ?? 0) > 0;
  const frontRequested = data.frontCount > 0;
  const backRequested = data.backCount > 0;

  if (hasFrontError || hasBackError) {
    if ((frontRequested && frontDone) || (backRequested && backDone)) {
      return "partial";
    }
    return "failed";
  }

  const allFrontDone = !frontRequested || frontDone;
  const allBackDone = !backRequested || backDone;

  if (allFrontDone && allBackDone) {
    return "completed";
  }

  return "processing";
};

const getStatusConfig = (status: GenerationStatus) => {
  const configs = {
    processing: {
      label: "İşleniyor",
      icon: "⏳",
      color: "text-blue-400",
      bg: "bg-blue-500/20",
      border: "border-blue-500/30",
      gradient: "from-blue-600 to-cyan-600",
    },
    completed: {
      label: "Tamamlandı",
      icon: "✅",
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
      border: "border-emerald-500/30",
      gradient: "from-emerald-600 to-green-600",
    },
    failed: {
      label: "Başarısız",
      icon: "❌",
      color: "text-red-400",
      bg: "bg-red-500/20",
      border: "border-red-500/30",
      gradient: "from-red-600 to-rose-600",
    },
    partial: {
      label: "Kısmi Başarı",
      icon: "⚠️",
      color: "text-amber-400",
      bg: "bg-amber-500/20",
      border: "border-amber-500/30",
      gradient: "from-amber-600 to-yellow-600",
    },
  };
  return configs[status];
};

export default function GenerationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [data, setData] = useState<GenerationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await getGeneration(id);
      setData(res);

      // Check if still processing
      const status = getStatus(res);
      if (status === "processing") {
        setPolling(true);
      } else {
        setPolling(false);
      }
    } catch (err: any) {
      setError(err?.message || "Üretim detayı alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadData();
  }, [id, loadData]);

  // Polling for processing status
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [polling, loadData]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
      toast.success("İndirme başladı!");
    } catch {
      toast.error("İndirme başarısız");
    }
  };

  const handleDownloadAll = () => {
    const allImages = [...(data?.frontImages || []), ...(data?.backImages || [])];
    allImages.forEach((img, index) => {
      setTimeout(() => {
        handleDownload(img.imageUrl, `generation-${id}-${index + 1}.png`);
      }, index * 500);
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-2xl bg-zinc-800 animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-zinc-800 animate-pulse" />
          <div className="h-64 rounded-2xl bg-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AppCard className="p-8 text-center">
        <div className="text-4xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-white mb-2">Hata</h3>
        <p className="text-sm text-red-400 mb-4">{error}</p>
        <AppButton onClick={() => router.push("/generations")}>
          ← Üretimlere Dön
        </AppButton>
      </AppCard>
    );
  }

  if (!data) {
    return (
      <AppCard className="p-8 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h3 className="text-lg font-semibold text-white mb-2">Kayıt Bulunamadı</h3>
        <AppButton onClick={() => router.push("/generations")}>
          ← Üretimlere Dön
        </AppButton>
      </AppCard>
    );
  }

  const status = getStatus(data);
  const statusConfig = getStatusConfig(status);
  const totalRequested = data.frontCount + data.backCount;
  const totalGenerated = (data.frontImages?.length ?? 0) + (data.backImages?.length ?? 0);
  const progressPercent = totalRequested > 0 ? (totalGenerated / totalRequested) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${statusConfig.gradient}`}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{statusConfig.icon}</span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Üretim #{data.id}</h1>
                  <p className={`text-sm ${statusConfig.color}`}>{statusConfig.label}</p>
                </div>
                {polling && (
                  <span className="ml-2 px-2 py-1 rounded-full bg-white/20 text-white text-xs animate-pulse">
                    🔄 Güncelleniyor...
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {totalGenerated > 0 && (
                <AppButton
                  onClick={handleDownloadAll}
                  className="bg-white text-black hover:bg-white/90"
                >
                  <span className="mr-2">⬇️</span>
                  Tümünü İndir ({totalGenerated})
                </AppButton>
              )}
              <AppButton
                variant="ghost"
                onClick={() => router.push("/generations")}
                className="border border-white/20 hover:bg-white/10"
              >
                ← Geri Dön
              </AppButton>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>İlerleme</span>
              <span className="font-mono">{totalGenerated}/{totalRequested} görsel</span>
            </div>
            <div className="h-3 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/90 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {(data.errors?.front || data.errors?.back) && (
        <AppCard className="p-4 border-red-500/30 bg-red-500/10">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Üretim Hatası</h3>
              {data.errors.front && (
                <p className="text-sm text-red-300">Ön görsel: {data.errors.front}</p>
              )}
              {data.errors.back && (
                <p className="text-sm text-red-300">Arka görsel: {data.errors.back}</p>
              )}
            </div>
          </div>
        </AppCard>
      )}

      {/* Source Materials */}
      <AppCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>📦</span> Kaynak Materyaller
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Product */}
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 uppercase font-semibold">Ürün</p>
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
              <div className="aspect-square relative">
                {data.product?.productImageUrl ? (
                  <img
                    src={data.product.productImageUrl}
                    alt="Ürün"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-zinc-600">
                    📦
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-white/10">
                <p className="font-medium text-white truncate">{data.product?.name}</p>
              </div>
            </div>
          </div>

          {/* Model */}
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 uppercase font-semibold">Model</p>
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
              <div className="aspect-square relative">
                {data.modelProfile?.faceReferenceUrl ? (
                  <img
                    src={data.modelProfile.faceReferenceUrl}
                    alt="Model"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-zinc-600">
                    👤
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-white/10">
                <p className="font-medium text-white truncate">{data.modelProfile?.name ?? "-"}</p>
              </div>
            </div>
          </div>

          {/* Scene */}
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 uppercase font-semibold">Sahne</p>
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
              <div className="aspect-square relative">
                {data.scene?.backgroundReferenceUrl ? (
                  <img
                    src={data.scene.backgroundReferenceUrl}
                    alt="Sahne"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-zinc-600">
                    🎬
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-white/10">
                <p className="font-medium text-white truncate">{data.scene?.name ?? "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      {/* Generated Images */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Front Images */}
        <AppCard className="p-6 border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              Ön Görseller
            </h2>
            <span className="text-sm text-zinc-500">{data.frontImages?.length ?? 0}/{data.frontCount}</span>
          </div>

          {!data.frontImages || data.frontImages.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              {data.frontCount > 0 ? (
                status === "processing" ? (
                  <div className="animate-pulse">
                    <span className="text-3xl">⏳</span>
                    <p className="mt-2 text-sm">Üretiliyor...</p>
                  </div>
                ) : (
                  <p className="text-sm">Görsel üretilemedi</p>
                )
              ) : (
                <p className="text-sm">Ön görsel istenmedi</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {data.frontImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-purple-500/50 transition-all"
                  onClick={() => setSelectedImage(img.imageUrl)}
                >
                  <img
                    src={img.imageUrl}
                    alt={`Ön ${img.indexNumber}`}
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(img.imageUrl, `generation-${id}-front-${img.indexNumber}.png`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition"
                    >
                      ⬇️ İndir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AppCard>

        {/* Back Images */}
        <AppCard className="p-6 border-pink-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500"></span>
              Arka Görseller
            </h2>
            <span className="text-sm text-zinc-500">{data.backImages?.length ?? 0}/{data.backCount}</span>
          </div>

          {!data.backImages || data.backImages.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              {data.backCount > 0 ? (
                status === "processing" ? (
                  <div className="animate-pulse">
                    <span className="text-3xl">⏳</span>
                    <p className="mt-2 text-sm">Üretiliyor...</p>
                  </div>
                ) : (
                  <p className="text-sm">Görsel üretilemedi</p>
                )
              ) : (
                <p className="text-sm">Arka görsel istenmedi</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {data.backImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-pink-500/50 transition-all"
                  onClick={() => setSelectedImage(img.imageUrl)}
                >
                  <img
                    src={img.imageUrl}
                    alt={`Arka ${img.indexNumber}`}
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(img.imageUrl, `generation-${id}-back-${img.indexNumber}.png`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition"
                    >
                      ⬇️ İndir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AppCard>
      </div>

      {/* Configuration Summary */}
      <AppCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>⚙️</span> Konfigürasyon
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-surface border border-white/10">
            <p className="text-xs text-zinc-500 mb-1">Ön Adet</p>
            <p className="text-lg font-bold text-white">{data.frontCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-white/10">
            <p className="text-xs text-zinc-500 mb-1">Arka Adet</p>
            <p className="text-lg font-bold text-white">{data.backCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-white/10">
            <p className="text-xs text-zinc-500 mb-1">Tarih</p>
            <p className="text-sm font-medium text-white">
              {data.createdAt ? new Date(data.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }) : "-"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-white/10">
            <p className="text-xs text-zinc-500 mb-1">ID</p>
            <p className="text-lg font-bold text-white font-mono">#{data.id}</p>
          </div>
        </div>
      </AppCard>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
            >
              ✕
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(selectedImage, `generation-${id}-preview.png`);
              }}
              className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition"
            >
              ⬇️ İndir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { listGenerations } from "@/lib/api/generations";
import type { GenerationListItem } from "@/types";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";

type GenerationStatus = "processing" | "completed" | "failed" | "partial";

const getStatus = (item: GenerationListItem): GenerationStatus => {
  const hasFrontError = item.hasFrontError;
  const hasBackError = item.hasBackError;
  const frontDone = item.frontImagesCount > 0;
  const backDone = item.backImagesCount > 0;
  const frontRequested = item.frontCount > 0;
  const backRequested = item.backCount > 0;

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
    },
    completed: {
      label: "Tamamlandı",
      icon: "✅",
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
      border: "border-emerald-500/30",
    },
    failed: {
      label: "Başarısız",
      icon: "❌",
      color: "text-red-400",
      bg: "bg-red-500/20",
      border: "border-red-500/30",
    },
    partial: {
      label: "Kısmi Başarı",
      icon: "⚠️",
      color: "text-amber-400",
      bg: "bg-amber-500/20",
      border: "border-amber-500/30",
    },
  };
  return configs[status];
};

export default function GenerationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<GenerationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await listGenerations();
        setItems(res.items || []);
      } catch (err: any) {
        setError(err?.message || "Üretim listesi alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const completed = items.filter(i => getStatus(i) === "completed").length;
    const processing = items.filter(i => getStatus(i) === "processing").length;
    const failed = items.filter(i => getStatus(i) === "failed" || getStatus(i) === "partial").length;
    const totalImages = items.reduce((sum, i) => sum + i.frontImagesCount + i.backImagesCount, 0);
    return { completed, processing, failed, totalImages, total: items.length };
  }, [items]);

  // Filtering
  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchSearch = !search ||
        item.productName?.toLowerCase().includes(search.toLowerCase()) ||
        String(item.id).includes(search);
      const status = getStatus(item);
      const matchStatus = !statusFilter || status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  if (error) return (
    <AppCard className="p-6 text-center">
      <div className="text-4xl mb-4">❌</div>
      <p className="text-red-400">{error}</p>
    </AppCard>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Üretimler"
        subtitle="AI görsel üretimlerinizi yönetin ve takip edin."
        actions={
          <AppButton
            onClick={() => router.push("/generations/new")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          >
            <span className="mr-2">✨</span>
            Yeni Üretim
          </AppButton>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AppCard className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">
              📊
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-purple-300">Toplam Üretim</p>
            </div>
          </div>
        </AppCard>
        <AppCard className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
              ✅
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
              <p className="text-xs text-emerald-300">Tamamlanan</p>
            </div>
          </div>
        </AppCard>
        <AppCard className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">
              ⏳
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.processing}</p>
              <p className="text-xs text-blue-300">İşleniyor</p>
            </div>
          </div>
        </AppCard>
        <AppCard className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl">
              🖼️
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalImages}</p>
              <p className="text-xs text-cyan-300">Toplam Görsel</p>
            </div>
          </div>
        </AppCard>
      </div>

      {/* Filters */}
      <AppCard className="p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <AppInput
              label="🔍 Ara"
              placeholder="Ürün adı veya ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <AppSelect
            label="📋 Durum"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tümü</option>
            <option value="completed">✅ Tamamlanan</option>
            <option value="processing">⏳ İşleniyor</option>
            <option value="failed">❌ Başarısız</option>
            <option value="partial">⚠️ Kısmi</option>
          </AppSelect>
          <div className="flex items-end">
            <AppButton
              variant="ghost"
              fullWidth
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
            >
              🔄 Temizle
            </AppButton>
          </div>
        </div>
      </AppCard>

      {/* Generations Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <AppCard key={i} className="h-48 animate-pulse bg-zinc-800/50">
              <div />
            </AppCard>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Üretim bulunamadı"
          description="Yeni bir üretim oluşturarak başlayın."
          actionLabel="Yeni Üretim"
          onAction={() => router.push("/generations/new")}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const status = getStatus(item);
            const statusConfig = getStatusConfig(status);
            const totalRequested = item.frontCount + item.backCount;
            const totalGenerated = item.frontImagesCount + item.backImagesCount;

            return (
              <div
                key={item.id}
                onClick={() => router.push(`/generations/${item.id}`)}
                className="group cursor-pointer rounded-xl overflow-hidden border border-white/10 bg-surface hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5"
              >
                {/* Status Header */}
                <div className={`px-4 py-3 ${statusConfig.bg} border-b ${statusConfig.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{statusConfig.icon}</span>
                    <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                  </div>
                  <span className="text-xs text-white/60 font-mono">#{item.id}</span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Product Name */}
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Ürün</p>
                    <p className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                      {item.productName ?? `Ürün #${item.productId}`}
                    </p>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>İlerleme</span>
                      <span className="text-white">{totalGenerated}/{totalRequested} görsel</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${status === "completed" ? "bg-gradient-to-r from-emerald-500 to-green-500" :
                          status === "failed" ? "bg-gradient-to-r from-red-500 to-rose-500" :
                            status === "partial" ? "bg-gradient-to-r from-amber-500 to-yellow-500" :
                              "bg-gradient-to-r from-blue-500 to-cyan-500"
                          }`}
                        style={{ width: `${totalRequested > 0 ? (totalGenerated / totalRequested) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span className="text-zinc-400">Ön: {item.frontImagesCount}/{item.frontCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                      <span className="text-zinc-400">Arka: {item.backImagesCount}/{item.backCount}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "-"}
                    </span>
                    <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Detayları Gör →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

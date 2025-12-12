"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppCard } from "@/components/ui/AppCard";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppInput } from "@/components/ui/AppInput";
import { useI18n } from "@/lib/i18n";
import { listScenes } from "@/lib/api/scenes";
import { seedScenePresets } from "@/lib/api/admin";
import { authStorage } from "@/lib/storage";
import { ScenePreset } from "@/types";
import { toast } from "sonner";

const categoryOptions = [
  "studio",
  "beach",
  "pool",
  "indoor",
  "outdoor",
  "urban",
  "minimal",
  "luxury",
];

export default function ScenesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [scenes, setScenes] = useState<ScenePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const token = useMemo(() => authStorage.token(), []);

  const fetchScenes = async (params?: { category?: string; q?: string }) => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listScenes(params);
      setScenes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenes();
  }, [token]);

  useEffect(() => {
    fetchScenes({
      category: categoryFilter || undefined,
      q: query || undefined,
    });
  }, [categoryFilter, query]);

  const filteredScenes = useMemo(() => {
    let result = scenes;
    if (categoryFilter) {
      result = result.filter((s) => s.category === categoryFilter);
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tags?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [scenes, categoryFilter, query]);

  const handleLoadPresets = async () => {
    if (!token) return;
    const toastId = toast.loading("Hazır sahneler yükleniyor...");
    try {
      const res = await seedScenePresets();
      toast.dismiss(toastId);
      toast.success(`${res.created ?? 0} hazır sahne eklendi!`);
      await fetchScenes();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(`Hata: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        title="Sahneler"
        subtitle="Ürün fotoğraflarınız için arka plan görsellerini yönetin"
        actions={
          <AppButton onClick={() => router.push("/scenes/new")}>
            + Yeni Sahne
          </AppButton>
        }
      />

      {/* Info Card */}
      <AppCard className="p-5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🎬</div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">Sahne Nedir?</h3>
            <p className="text-sm text-textMuted mb-3">
              Sahne, ürününüzün içinde görüneceği arka plan görselidir.
              Örneğin: Stüdyo fotoğrafı, plaj manzarası, minimalist beyaz arka plan gibi.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="bg-purple-500/20 text-purple-200 px-3 py-1.5 rounded-lg">
                📤 Kendi görselinizi yükleyin
              </div>
              <div className="bg-cyan-500/20 text-cyan-200 px-3 py-1.5 rounded-lg">
                🔗 URL ile ekleyin
              </div>
              <div className="bg-pink-500/20 text-pink-200 px-3 py-1.5 rounded-lg">
                ✨ Prompt ile tanımlayın
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      {/* Filters */}
      <AppCard className="p-4">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-textMuted font-medium">Kategori:</span>
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!categoryFilter
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                : "bg-surface text-textMuted hover:bg-surfaceAlt hover:text-white"
                }`}
            >
              Tümü ({scenes.length})
            </button>
            {categoryOptions.map((cat) => {
              const count = scenes.filter((s) => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${categoryFilter === cat
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                    : "bg-surface text-textMuted hover:bg-surfaceAlt hover:text-white"
                    }`}
                >
                  {cat} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <AppInput
              placeholder="🔍 Sahne adı veya etiket ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            {scenes.length === 0 && (
              <AppButton variant="secondary" onClick={handleLoadPresets}>
                📦 Örnek Sahneleri Yükle
              </AppButton>
            )}
          </div>
        </div>
      </AppCard>

      {/* Scenes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-xl h-80 animate-pulse"
            />
          ))}
        </div>
      ) : filteredScenes.length === 0 ? (
        <EmptyState
          title={query || categoryFilter ? "Sonuç bulunamadı" : "Henüz sahne yok"}
          description={
            query || categoryFilter
              ? "Farklı bir filtre veya arama terimi deneyin"
              : "İlk sahnenizi oluşturun veya örnek sahneleri yükleyin"
          }
          action={
            <div className="flex gap-3">
              <AppButton onClick={() => router.push("/scenes/new")}>
                🎬 Sahne Oluştur
              </AppButton>
              <AppButton variant="secondary" onClick={handleLoadPresets}>
                📦 Örnek Sahneleri Yükle
              </AppButton>
            </div>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-textMuted">
              {filteredScenes.length} sahne gösteriliyor
            </p>
            {(query || categoryFilter) && (
              <AppButton
                variant="ghost"
                onClick={() => {
                  setQuery("");
                  setCategoryFilter("");
                }}
              >
                ✕ Filtreleri Temizle
              </AppButton>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenes.map((scene) => (
              <AppCard
                key={scene.id}
                className="group overflow-hidden hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer"
                onClick={() => router.push(`/scenes/${scene.id}`)}
              >
                {/* Image */}
                <div className="aspect-video relative overflow-hidden bg-black">
                  {scene.backgroundReferenceUrl ? (
                    <img
                      src={scene.backgroundReferenceUrl}
                      alt={scene.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-cyan-900/20">
                      <div className="text-center">
                        <span className="text-6xl mb-2 block">🎬</span>
                        <p className="text-sm text-textMuted">Görsel yok</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {scene.category && (
                      <AppBadge className="capitalize backdrop-blur-sm bg-black/50">
                        {scene.category}
                      </AppBadge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-purple-400 transition-colors">
                      {scene.name}
                    </h3>
                    {scene.backgroundPrompt && (
                      <p className="text-xs text-textMuted line-clamp-2">
                        {scene.backgroundPrompt}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {scene.mood && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/30">
                        {scene.mood}
                      </span>
                    )}
                    {scene.lighting && (
                      <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/30">
                        {scene.lighting}
                      </span>
                    )}
                    {scene.suggestedAspectRatio && (
                      <span className="text-xs bg-surface text-textMuted px-2.5 py-1 rounded-full border border-border">
                        {scene.suggestedAspectRatio}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                    <AppButton
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/scenes/${scene.id}`);
                      }}
                      className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    >
                      Düzenle & Önizle →
                    </AppButton>
                  </div>
                </div>
              </AppCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

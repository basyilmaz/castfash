"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppCard } from "@/components/ui/AppCard";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { getScenePacks, installScenePack } from "@/lib/api/admin";
import { authStorage } from "@/lib/storage";
import { ScenePack, ScenePackDetail } from "@/types";
import { toast } from "sonner";

const categoryOptions = [
  { value: "studio", label: "🎬 Stüdyo", icon: "🎬" },
  { value: "beach", label: "🏖️ Plaj", icon: "🏖️" },
  { value: "pool", label: "🏊 Havuz", icon: "🏊" },
  { value: "indoor", label: "🏠 İç Mekan", icon: "🏠" },
  { value: "outdoor", label: "🌳 Dış Mekan", icon: "🌳" },
  { value: "urban", label: "🏙️ Şehir", icon: "🏙️" },
  { value: "minimal", label: "✨ Minimal", icon: "✨" },
  { value: "luxury", label: "💎 Lüks", icon: "💎" },
];

const getCategoryGradient = (category?: string | null) => {
  const gradients: Record<string, string> = {
    studio: "from-slate-600 via-slate-500 to-slate-700",
    beach: "from-amber-500 via-orange-400 to-yellow-500",
    pool: "from-cyan-500 via-blue-400 to-teal-500",
    indoor: "from-zinc-600 via-gray-500 to-zinc-700",
    outdoor: "from-emerald-500 via-green-400 to-teal-500",
    urban: "from-gray-700 via-zinc-600 to-slate-700",
    minimal: "from-gray-400 via-slate-300 to-gray-500",
    luxury: "from-amber-400 via-yellow-300 to-orange-400",
  };
  return gradients[category ?? ""] ?? "from-purple-600 via-indigo-500 to-blue-600";
};

const getCategoryIcon = (category?: string | null) => {
  const icons: Record<string, string> = {
    studio: "🎬",
    beach: "🏖️",
    pool: "🏊",
    indoor: "🏠",
    outdoor: "🌳",
    urban: "🏙️",
    minimal: "✨",
    luxury: "💎",
  };
  return icons[category ?? ""] ?? "📦";
};

export default function ScenePacksPage() {
  const router = useRouter();
  const token = useMemo(() => authStorage.token(), []);
  const [packs, setPacks] = useState<(ScenePack & { scenes?: { id: number }[] })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [installing, setInstalling] = useState<string | null>(null);

  useEffect(() => {
    const fetchPacks = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getScenePacks();
        setPacks(data);
      } finally {
        setLoading(false);
      }
    };
    fetchPacks();
  }, [token]);

  const filtered = packs.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q) ||
      (p.tags ?? "").toLowerCase().includes(q);
    const matchCat = !category || p.category === category;
    return matchSearch && matchCat;
  });

  const handleInstall = async (pack: ScenePack) => {
    if (!token) return;
    setInstalling(pack.id);
    try {
      const res = await installScenePack(pack.id);
      toast.success(`✅ ${pack.name} paketi kuruldu: ${res.imported ?? 0} sahne eklendi, ${res.skipped ?? 0} atlandı`);
    } catch (err: any) {
      toast.error(err?.message ?? "Paket kurulamadı");
    } finally {
      setInstalling(null);
    }
  };

  const renderTags = (tags?: string | null) => {
    if (!tags) return null;
    const items = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 4);
    if (!items.length) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {items.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-white/10 backdrop-blur-sm px-2 py-0.5 text-[10px] text-white/80 border border-white/20"
          >
            #{tag}
          </span>
        ))}
      </div>
    );
  };

  // Stats card
  const stats = {
    total: packs.length,
    premium: packs.filter(p => p.isPremium).length,
    free: packs.filter(p => !p.isPremium).length,
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Sahne Paketleri"
        subtitle="Hazır sahne paketlerini keşfedin ve organizasyonunuza yükleyin."
        actions={
          <AppButton onClick={() => router.push("/scene-packs/new")} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">
            <span className="mr-2">✨</span>
            Yeni Paket Oluştur
          </AppButton>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <AppCard className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">
              📦
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-purple-300">Toplam Paket</p>
            </div>
          </div>
        </AppCard>
        <AppCard className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
              💎
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.premium}</p>
              <p className="text-xs text-amber-300">Premium</p>
            </div>
          </div>
        </AppCard>
        <AppCard className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
              🎁
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.free}</p>
              <p className="text-xs text-emerald-300">Ücretsiz</p>
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
              placeholder="Paket adı, etiket veya açıklama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <AppSelect
            label="📁 Kategori"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Tüm Kategoriler</option>
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </AppSelect>
          <div className="flex items-end">
            <AppButton
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
            >
              🔄 Temizle
            </AppButton>
          </div>
        </div>
      </AppCard>

      {/* Pack Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <AppCard key={i} className="h-64 animate-pulse bg-zinc-800/50">
              <div />
            </AppCard>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Paket bulunamadı"
          description="Filtreleri temizleyin veya yeni bir paket ekleyin."
          actionLabel="Filtreleri temizle"
          onAction={() => {
            setSearch("");
            setCategory("");
          }}
        />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((pack) => (
            <div
              key={pack.id}
              className="group relative rounded-2xl overflow-hidden border border-white/10 bg-surface hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
            >
              {/* Gradient Header */}
              <div className={`relative h-32 bg-gradient-to-br ${getCategoryGradient(pack.category)} p-4`}>
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                {/* Category Icon */}
                <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg">
                  {getCategoryIcon(pack.category)}
                </div>

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                  {pack.isPremium && (
                    <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-black text-[10px] font-bold shadow-lg">
                      💎 PREMIUM
                    </span>
                  )}
                  {!pack.isPublic && (
                    <span className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white/80 text-[10px]">
                      🔒 Özel
                    </span>
                  )}
                </div>

                {/* Scene Count */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/30 backdrop-blur-sm">
                  <span className="text-white text-sm font-medium">
                    {(pack as ScenePackDetail).scenes?.length ?? "?"} sahne
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {pack.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">{pack.slug}</p>
                </div>

                {pack.description && (
                  <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                    {pack.description}
                  </p>
                )}

                {renderTags(pack.tags)}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/scene-packs/${pack.slug || pack.id}`} className="flex-1">
                    <AppButton variant="ghost" fullWidth className="border border-white/10 hover:border-white/20">
                      📋 Detaylar
                    </AppButton>
                  </Link>
                  <AppButton
                    variant="secondary"
                    className="flex-1 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 border-0"
                    disabled={installing === pack.id}
                    onClick={() => handleInstall(pack)}
                  >
                    {installing === pack.id ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">⬇️</span>
                        Yükle
                      </>
                    )}
                  </AppButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

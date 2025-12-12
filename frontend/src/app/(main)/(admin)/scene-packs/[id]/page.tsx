"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppCard } from "@/components/ui/AppCard";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppModal } from "@/components/ui/AppModal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import {
  getScenePack,
  installScenePack,
  updateScenePack,
  deleteScenePack
} from "@/lib/api/admin";
import { authStorage } from "@/lib/storage";
import { ScenePackDetail, ScenePreset } from "@/types";
import { toast } from "sonner";

const categoryOptions = [
  { value: "studio", label: "🎬 Stüdyo" },
  { value: "beach", label: "🏖️ Plaj" },
  { value: "pool", label: "🏊 Havuz" },
  { value: "indoor", label: "🏠 İç Mekan" },
  { value: "outdoor", label: "🌳 Dış Mekan" },
  { value: "urban", label: "🏙️ Şehir" },
  { value: "minimal", label: "✨ Minimal" },
  { value: "luxury", label: "💎 Lüks" },
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

export default function ScenePackDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const token = useMemo(() => authStorage.token(), []);
  const [pack, setPack] = useState<ScenePackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState<Partial<ScenePackDetail>>({});
  const [saving, setSaving] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchPack = async () => {
      if (!token || !params?.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await getScenePack(params.id);
        setPack(data);
        setForm({
          name: data.name,
          slug: data.slug,
          description: data.description ?? "",
          isPublic: data.isPublic,
          isPremium: data.isPremium,
          category: data.category ?? "",
          tags: data.tags ?? ""
        });
      } catch (err: any) {
        toast.error(err?.message ?? "Paket yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchPack();
  }, [token, params?.id]);

  const handleSave = async () => {
    if (!token || !pack) return;
    setSaving(true);
    try {
      const updated = await updateScenePack(pack.id, {
        name: form.name,
        slug: form.slug,
        description: form.description,
        isPublic: form.isPublic,
        isPremium: form.isPremium,
        category: form.category,
        tags: form.tags
      });
      setPack(updated);
      setActiveTab("overview");
      toast.success("✅ Paket başarıyla güncellendi!");
    } catch (err: any) {
      toast.error(err?.message ?? "Güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleInstall = async () => {
    if (!token || !pack) return;
    setInstalling(true);
    try {
      const res = await installScenePack(pack.id);
      toast.success(`✅ Paket kuruldu: ${res.imported ?? 0} sahne eklendi, ${res.skipped ?? 0} atlandı`);
    } catch (err: any) {
      toast.error(err?.message ?? "Paket kurulamadı");
    } finally {
      setInstalling(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !pack) return;
    try {
      await deleteScenePack(pack.id);
      toast.success("Paket silindi");
      router.push("/scene-packs");
    } catch (err: any) {
      toast.error(err?.message ?? "Silinemedi");
    }
  };

  const renderTags = (tags?: string | null) => {
    if (!tags) return null;
    const items = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!items.length) return null;
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300 border border-purple-500/30"
          >
            #{tag}
          </span>
        ))}
      </div>
    );
  };

  const renderSceneCard = (scene: ScenePreset) => (
    <div
      key={scene.id}
      className="group relative rounded-xl overflow-hidden border border-white/10 bg-surface hover:border-white/20 transition-all duration-200"
    >
      {/* Scene Preview */}
      {scene.backgroundReferenceUrl ? (
        <div className="h-32 bg-zinc-800 overflow-hidden">
          <img
            src={scene.backgroundReferenceUrl}
            alt={scene.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className={`h-32 bg-gradient-to-br ${getCategoryGradient(scene.category)} flex items-center justify-center`}>
          <span className="text-4xl opacity-50">🖼️</span>
        </div>
      )}

      {/* Scene Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-white text-sm">{scene.name}</h4>
          {scene.category && (
            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70">
              {scene.category}
            </span>
          )}
        </div>

        {scene.backgroundPrompt && (
          <p className="text-xs text-zinc-400 line-clamp-2">{scene.backgroundPrompt}</p>
        )}

        <div className="flex gap-1 flex-wrap">
          {scene.lighting && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              💡 {scene.lighting}
            </span>
          )}
          {scene.mood && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
              🎭 {scene.mood}
            </span>
          )}
          {scene.suggestedAspectRatio && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              📐 {scene.suggestedAspectRatio}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-2xl bg-zinc-800 animate-pulse" />
        <div className="h-64 rounded-2xl bg-zinc-800 animate-pulse" />
      </div>
    );
  }

  if (!pack) {
    return (
      <AppCard className="p-8 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h3 className="text-lg font-semibold text-white mb-2">Paket bulunamadı</h3>
        <p className="text-sm text-zinc-400 mb-4">Bu paket mevcut değil veya erişiminiz yok.</p>
        <AppButton onClick={() => router.push("/scene-packs")}>
          ← Paketlere Dön
        </AppButton>
      </AppCard>
    );
  }

  const tabs = [
    { id: "overview", label: "Genel Bakış", icon: "📋" },
    { id: "scenes", label: `Sahneler (${pack.scenes.length})`, icon: "🎬" },
    { id: "edit", label: "Düzenle", icon: "✏️" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${getCategoryGradient(pack.category)}`}>
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-5">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-black/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
                {getCategoryIcon(pack.category)}
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-white">{pack.name}</h1>
                  {pack.isPremium && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-black text-xs font-bold shadow-lg">
                      💎 PREMIUM
                    </span>
                  )}
                  {!pack.isPublic && (
                    <span className="px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/80 text-xs">
                      🔒 Özel
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm font-mono">{pack.slug}</p>
                {pack.description && (
                  <p className="text-white/90 max-w-xl">{pack.description}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-black/20 backdrop-blur-sm">
                <p className="text-3xl font-bold text-white">{pack.scenes.length}</p>
                <p className="text-xs text-white/70">Sahne</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {pack.tags && (
            <div className="mt-4">
              {renderTags(pack.tags)}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <AppButton
              onClick={handleInstall}
              disabled={installing}
              className="bg-white text-black hover:bg-white/90"
            >
              {installing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Yükleniyor...
                </>
              ) : (
                <>
                  <span className="mr-2">⬇️</span>
                  Organizasyona Yükle
                </>
              )}
            </AppButton>
            <AppButton
              variant="ghost"
              onClick={() => router.push("/scene-packs")}
              className="border border-white/20 hover:bg-white/10"
            >
              ← Geri Dön
            </AppButton>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <AppCard className="p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
          {/* Overview Tab */}
          <TabPanel value="overview" activeTab={activeTab}>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Info Card */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <span>📊</span> Paket Bilgileri
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-surface border border-white/10">
                    <p className="text-xs text-zinc-500 mb-1">Kategori</p>
                    <p className="font-medium text-white flex items-center gap-2">
                      <span>{getCategoryIcon(pack.category)}</span>
                      {pack.category || "Belirsiz"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-white/10">
                    <p className="text-xs text-zinc-500 mb-1">Durum</p>
                    <div className="flex gap-2">
                      <AppBadge variant={pack.isPublic ? "success" : "ghost"}>
                        {pack.isPublic ? "🌐 Public" : "🔒 Private"}
                      </AppBadge>
                      {pack.isPremium && (
                        <AppBadge variant="warning">💎 Premium</AppBadge>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-white/10">
                    <p className="text-xs text-zinc-500 mb-1">Sahne Sayısı</p>
                    <p className="text-2xl font-bold text-white">{pack.scenes.length}</p>
                  </div>
                </div>
              </div>

              {/* Preview Grid */}
              <div className="md:col-span-2">
                <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                  <span>🎬</span> Sahne Önizleme
                </h3>
                {pack.scenes.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">
                    Bu pakette henüz sahne yok.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {pack.scenes.slice(0, 4).map(renderSceneCard)}
                  </div>
                )}
                {pack.scenes.length > 4 && (
                  <button
                    onClick={() => setActiveTab("scenes")}
                    className="mt-4 w-full py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    + {pack.scenes.length - 4} sahne daha görüntüle
                  </button>
                )}
              </div>
            </div>
          </TabPanel>

          {/* Scenes Tab */}
          <TabPanel value="scenes" activeTab={activeTab}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  Bu Paketteki Tüm Sahneler ({pack.scenes.length})
                </h3>
                <Link href="/scenes" className="text-sm text-purple-400 hover:text-purple-300">
                  /scenes sayfasında görüntüle →
                </Link>
              </div>
              {pack.scenes.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <div className="text-4xl mb-4">📭</div>
                  <p>Bu pakette sahne bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pack.scenes.map(renderSceneCard)}
                </div>
              )}
            </div>
          </TabPanel>

          {/* Edit Tab */}
          <TabPanel value="edit" activeTab={activeTab}>
            <div className="max-w-2xl space-y-6">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <span>✏️</span> Paket Bilgilerini Düzenle
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <AppInput
                  label="Paket Adı"
                  value={form.name ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
                <AppInput
                  label="Slug"
                  value={form.slug ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                />
                <div className="md:col-span-2">
                  <AppInput
                    label="Açıklama"
                    value={form.description ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <AppSelect
                  label="Kategori"
                  value={form.category ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                >
                  <option value="">Seçiniz</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </AppSelect>
                <AppInput
                  label="Etiketler"
                  value={form.tags ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  hint="Virgülle ayırın"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.isPublic}
                    onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-purple-500 focus:ring-purple-500"
                  />
                  🌐 Public (Herkes görebilir)
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.isPremium}
                    onChange={(e) => setForm((p) => ({ ...p, isPremium: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                  />
                  💎 Premium
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <AppButton
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                >
                  {saving ? "Kaydediliyor..." : "💾 Kaydet"}
                </AppButton>
                <AppButton
                  variant="ghost"
                  onClick={() => {
                    setActiveTab("overview");
                    setForm({
                      name: pack.name,
                      slug: pack.slug,
                      description: pack.description ?? "",
                      isPublic: pack.isPublic,
                      isPremium: pack.isPremium,
                      category: pack.category ?? "",
                      tags: pack.tags ?? ""
                    });
                  }}
                >
                  İptal
                </AppButton>
                <div className="flex-1" />
                <AppButton
                  variant="ghost"
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  🗑️ Paketi Sil
                </AppButton>
              </div>
            </div>
          </TabPanel>
        </Tabs>
      </AppCard>

      {/* Delete Confirmation Modal */}
      <AppModal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="⚠️ Paketi Sil">
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            <span className="font-semibold text-white">{pack.name}</span> paketini silmek istediğinize emin misiniz?
          </p>
          <p className="text-xs text-zinc-500">
            Bu işlem geri alınamaz. Pakete ait sahneler silinmez, sadece paket bağlantısı kopar.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <AppButton variant="ghost" onClick={() => setConfirmDelete(false)}>
              Vazgeç
            </AppButton>
            <AppButton
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500"
            >
              🗑️ Evet, Sil
            </AppButton>
          </div>
        </div>
      </AppModal>
    </div>
  );
}

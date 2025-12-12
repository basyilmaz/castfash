"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getScene, updateScene, listScenes, generateSceneBackground } from "@/lib/api/scenes";
import type { ScenePreset } from "@/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppButton } from "@/components/ui/AppButton";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import { toast } from "sonner";

export default function SceneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [scene, setScene] = useState<ScenePreset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevId, setPrevId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [form, setForm] = useState({
    name: "",
    category: "",
    backgroundReferenceUrl: "",
    backgroundPrompt: "",
    lighting: "",
    mood: "",
    suggestedAspectRatio: "",
    qualityPreset: "",
  });
  const [bgFile, setBgFile] = useState<File | null>(null);

  // AI Generation State
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPromptText, setAiPromptText] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [data, allScenes] = await Promise.all([
          getScene(id),
          listScenes()
        ]);

        setScene(data);

        const currentIndex = allScenes.findIndex(s => s.id === Number(id));
        if (currentIndex !== -1) {
          setPrevId(currentIndex > 0 ? String(allScenes[currentIndex - 1].id) : null);
          setNextId(currentIndex < allScenes.length - 1 ? String(allScenes[currentIndex + 1].id) : null);
        }

        setForm({
          name: data.name,
          category: data.category || "",
          backgroundReferenceUrl: data.backgroundReferenceUrl || "",
          backgroundPrompt: data.backgroundPrompt || "",
          lighting: data.lighting || "",
          mood: data.mood || "",
          suggestedAspectRatio: data.suggestedAspectRatio || "",
          qualityPreset: data.qualityPreset || "",
        });
      } catch (err: any) {
        setError(err?.message || "Sahne yüklenemedi");
        toast.error("Sahne yüklenemedi");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateScene(id, {
        name: form.name,
        category: form.category || undefined,
        backgroundReferenceUrl: form.backgroundReferenceUrl || undefined,
        backgroundPrompt: form.backgroundPrompt || undefined,
        lighting: form.lighting || undefined,
        mood: form.mood || undefined,
        suggestedAspectRatio: form.suggestedAspectRatio || undefined,
        qualityPreset: form.qualityPreset || undefined,
      });
      toast.success("Sahne güncellendi!");

      const updatedScene = await getScene(id);
      setScene(updatedScene);
      setActiveTab('overview');
    } catch (err: any) {
      const msg = err?.message || "Güncelleme başarısız";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!scene) return;

    setGeneratingAi(true);
    try {
      const res = await generateSceneBackground(String(scene.id), aiPromptText);

      setScene({ ...scene, backgroundReferenceUrl: res.imageUrl });
      setForm(p => ({ ...p, backgroundReferenceUrl: res.imageUrl, backgroundPrompt: aiPromptText }));

      toast.success(`Arka plan başarıyla üretildi! (${res.tokensUsed} token kullanıldı)`);
      setShowAiPrompt(false);
      setAiPromptText("");
    } catch (err: any) {
      toast.error(err?.message || "Görsel üretilemedi");
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-textMuted">Yükleniyor...</div>
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-textMuted text-lg">Sahne bulunamadı.</div>
        <AppButton onClick={() => router.push("/scenes")}>
          Listeye Dön
        </AppButton>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: '📊' },
    { id: 'edit', label: 'Düzenle', icon: '✏️' },
    { id: 'ai', label: 'AI Üret', icon: '✨' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader
          eyebrow="Sahne Ön Ayarı"
          title={scene.name}
          description={`${scene.category || "Genel"} • ${scene.mood || "-"}`}
        />
        <div className="flex items-center gap-2">
          <button
            className="text-sm text-textSecondary hover:text-white transition-colors mr-4"
            onClick={() => router.push("/scenes")}
          >
            ← Listeye dön
          </button>
          <div className="flex items-center gap-1 border-l border-border pl-4">
            <AppButton
              variant="ghost"
              disabled={!prevId}
              onClick={() => prevId && router.push(`/scenes/${prevId}`)}
            >
              ← Önceki
            </AppButton>
            <AppButton
              variant="ghost"
              disabled={!nextId}
              onClick={() => nextId && router.push(`/scenes/${nextId}`)}
            >
              Sonraki →
            </AppButton>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <AppCard className="p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>

          {/* TAB 1: OVERVIEW */}
          <TabPanel value="overview" activeTab={activeTab}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Image */}
              <div className="lg:col-span-1">
                {scene.backgroundReferenceUrl ? (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Arka Plan Görseli</label>
                    <div className="aspect-video rounded-lg overflow-hidden bg-surface border border-border">
                      <img
                        src={scene.backgroundReferenceUrl}
                        alt="Background"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-textMuted">
                    <p className="text-sm">Henüz arka plan görseli yok</p>
                    <button
                      onClick={() => setActiveTab('ai')}
                      className="mt-4 text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      AI ile Üret →
                    </button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span>🎬</span> Sahne Özellikleri
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {scene.category && (
                      <div className="p-4 bg-surface rounded-lg border border-border">
                        <p className="text-xs text-textMuted mb-1">Kategori</p>
                        <p className="text-sm font-medium text-white">{scene.category}</p>
                      </div>
                    )}
                    {scene.mood && (
                      <div className="p-4 bg-surface rounded-lg border border-border">
                        <p className="text-xs text-textMuted mb-1">Mood</p>
                        <p className="text-sm font-medium text-white">{scene.mood}</p>
                      </div>
                    )}
                    {scene.lighting && (
                      <div className="p-4 bg-surface rounded-lg border border-border">
                        <p className="text-xs text-textMuted mb-1">Işıklandırma</p>
                        <p className="text-sm font-medium text-white">{scene.lighting}</p>
                      </div>
                    )}
                    {scene.suggestedAspectRatio && (
                      <div className="p-4 bg-surface rounded-lg border border-border">
                        <p className="text-xs text-textMuted mb-1">En/Boy Oranı</p>
                        <p className="text-sm font-medium text-white">{scene.suggestedAspectRatio}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <AppButton onClick={() => setActiveTab('edit')} fullWidth={false}>
                    ✏️ Düzenle
                  </AppButton>
                  <AppButton onClick={() => setActiveTab('ai')} variant="secondary" fullWidth={false}>
                    ✨ AI ile Üret
                  </AppButton>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* TAB 2: EDIT */}
          <TabPanel value="edit" activeTab={activeTab}>
            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Sahne Bilgileri</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <AppInput
                    label="Sahne Adı"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                  <AppSelect
                    label="Kategori"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="Studio">Stüdyo</option>
                    <option value="Outdoor">Dış Mekan</option>
                    <option value="Indoor">İç Mekan</option>
                    <option value="Street">Sokak</option>
                    <option value="Nature">Doğa</option>
                  </AppSelect>

                  <AppSelect
                    label="Mood"
                    value={form.mood}
                    onChange={(e) => setForm((p) => ({ ...p, mood: e.target.value }))}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Luxury">Lüks</option>
                    <option value="Casual">Casual</option>
                    <option value="Professional">Profesyonel</option>
                    <option value="Artistic">Sanatsal</option>
                  </AppSelect>

                  <AppSelect
                    label="Işıklandırma"
                    value={form.lighting}
                    onChange={(e) => setForm((p) => ({ ...p, lighting: e.target.value }))}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="Soft">Yumuşak</option>
                    <option value="Natural">Doğal</option>
                    <option value="Studio">Stüdyo</option>
                    <option value="Dramatic">Dramatik</option>
                    <option value="Bright">Parlak</option>
                  </AppSelect>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Teknik Detaylar</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <AppSelect
                    label="Önerilen En/Boy Oranı"
                    value={form.suggestedAspectRatio}
                    onChange={(e) => setForm((p) => ({ ...p, suggestedAspectRatio: e.target.value }))}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="1:1">1:1 (Kare)</option>
                    <option value="4:3">4:3</option>
                    <option value="16:9">16:9 (Geniş)</option>
                    <option value="9:16">9:16 (Dikey)</option>
                  </AppSelect>

                  <AppSelect
                    label="Kalite Ön Ayarı"
                    value={form.qualityPreset}
                    onChange={(e) => setForm((p) => ({ ...p, qualityPreset: e.target.value }))}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="Standard">Standart</option>
                    <option value="High">Yüksek</option>
                    <option value="Ultra">Ultra</option>
                  </AppSelect>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <AppButton type="submit" disabled={saving} fullWidth={false}>
                  {saving ? "Kaydediliyor..." : "💾 Değişiklikleri Kaydet"}
                </AppButton>
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveTab('overview')}
                  fullWidth={false}
                >
                  ❌ İptal
                </AppButton>
              </div>
            </form>
          </TabPanel>

          {/* TAB 3: AI GENERATE */}
          <TabPanel value="ai" activeTab={activeTab}>
            <div className="max-w-4xl space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Arka Plan Görseli Üret</h3>
                <p className="text-textMuted">Sahne özellikleriniz otomatik kullanılacak</p>
              </div>

              <button
                onClick={() => setShowAiPrompt(true)}
                className="w-full p-8 rounded-xl border-2 border-border bg-surface hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="text-6xl mb-4">🎬</div>
                <h4 className="text-lg font-bold text-white mb-2">Arka Plan Üret</h4>
                <p className="text-sm text-textMuted mb-4">AI ile profesyonel arka plan görseli</p>
                <div className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium inline-block">
                  ✨ 1 Token
                </div>
              </button>

              <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl">
                <p className="text-sm text-white">
                  💡 <span className="font-bold">İpucu:</span> AI, sahne özelliklerinizi (kategori, mood, ışıklandırma) otomatik kullanacak. Siz sadece ek detaylar ekleyebilirsiniz.
                </p>
              </div>
            </div>
          </TabPanel>

        </Tabs>
      </AppCard>

      {/* AI Prompt Modal */}
      {showAiPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-white">
                🎬 Arka Plan Üret
              </h3>
              <button onClick={() => setShowAiPrompt(false)} className="text-textMuted hover:text-white">✕</button>
            </div>

            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-xs text-white mb-2">
                <span className="font-bold">✅ Otomatik Kullanılacak Özellikler:</span>
              </p>
              <ul className="text-xs text-textMuted space-y-1">
                {scene.category && <li>• Kategori: {scene.category}</li>}
                {scene.mood && <li>• Mood: {scene.mood}</li>}
                {scene.lighting && <li>• Işıklandırma: {scene.lighting}</li>}
                {scene.suggestedAspectRatio && <li>• En/Boy: {scene.suggestedAspectRatio}</li>}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Ek Açıklama (Opsiyonel)
              </label>
              <textarea
                value={aiPromptText}
                onChange={(e) => setAiPromptText(e.target.value)}
                placeholder="Örn: Beyaz arka plan, minimalist, modern..."
                className="w-full h-32 bg-surfaceAlt border border-border rounded-lg p-3 text-sm text-white focus:border-purple-500 transition resize-none placeholder:text-textMuted"
                autoFocus
              />
              <div className="mt-2 space-y-2">
                <p className="text-xs text-textMuted">
                  💡 <span className="font-medium text-white">İpuçları:</span>
                </p>
                <ul className="text-xs text-textMuted space-y-1 ml-4">
                  <li>• <span className="text-white">Renk:</span> "beyaz arka plan", "gri ton", "pastel renkler"</li>
                  <li>• <span className="text-white">Stil:</span> "minimalist", "modern", "vintage"</li>
                  <li>• <span className="text-white">Detay:</span> "bulanık arka plan", "bokeh efekti"</li>
                  <li>• <span className="text-white">Kalite:</span> "yüksek çözünürlük", "profesyonel"</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                ℹ️ <span className="font-bold">Not:</span> Sahne özellikleri zaten eklenmiş. Sadece ek detaylar (renk, stil vb.) ekleyebilirsiniz.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <AppButton variant="ghost" onClick={() => setShowAiPrompt(false)} disabled={generatingAi}>
                İptal
              </AppButton>
              <AppButton
                onClick={handleAiGenerate}
                disabled={generatingAi}
                className="bg-purple-600 hover:bg-purple-500"
              >
                {generatingAi ? "⏳ Üretiliyor..." : "✨ Üret (1 Token)"}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getModelProfile, updateModelProfile, listModelProfiles } from "@/lib/api/modelProfiles";
import type { Gender, ModelProfile } from "@/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppButton } from "@/components/ui/AppButton";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import { toast } from "sonner";

export default function ModelProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [profile, setProfile] = useState<ModelProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevId, setPrevId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [form, setForm] = useState({
    name: "",
    gender: "FEMALE" as Gender,
    faceReferenceUrl: "",
    backReferenceUrl: "",
    bodyType: "",
    skinTone: "",
    hairColor: "",
    hairStyle: "",
    ageRange: "",
    frontPrompt: "",
    backPrompt: "",
    stylePrompt: "",
    modelType: "IMAGE_REFERENCE" as "IMAGE_REFERENCE" | "TEXT_ONLY" | "HYBRID",
  });
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  // AI Generation State
  const [showAiPrompt, setShowAiPrompt] = useState<'FACE' | 'BACK' | null>(null);
  const [aiPromptText, setAiPromptText] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  const { generateReferenceImage } = require("@/lib/api/modelProfiles");

  const handleAiGenerate = async () => {
    if (!showAiPrompt || !profile) return;

    setGeneratingAi(true);
    try {
      const res = await generateReferenceImage(profile.id, aiPromptText, showAiPrompt);

      if (showAiPrompt === 'FACE') {
        setProfile({ ...profile, faceReferenceUrl: res.imageUrl });
        setForm(p => ({ ...p, faceReferenceUrl: res.imageUrl }));
      } else {
        setProfile({ ...profile, backReferenceUrl: res.imageUrl });
        setForm(p => ({ ...p, backReferenceUrl: res.imageUrl }));
      }

      toast.success(`Görsel başarıyla üretildi! (${res.tokensUsed} token kullanıldı)`);
      setShowAiPrompt(null);
      setAiPromptText("");
    } catch (err: any) {
      toast.error(err?.message || "Görsel üretilemedi");
    } finally {
      setGeneratingAi(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [data, allProfiles] = await Promise.all([
          getModelProfile(id),
          listModelProfiles()
        ]);

        setProfile(data);

        const currentIndex = allProfiles.findIndex(p => p.id === Number(id));
        if (currentIndex !== -1) {
          setPrevId(currentIndex > 0 ? String(allProfiles[currentIndex - 1].id) : null);
          setNextId(currentIndex < allProfiles.length - 1 ? String(allProfiles[currentIndex + 1].id) : null);
        }

        setForm({
          name: data.name,
          gender: data.gender,
          faceReferenceUrl: data.faceReferenceUrl || "",
          backReferenceUrl: data.backReferenceUrl || "",
          bodyType: data.bodyType || "",
          skinTone: data.skinTone || "",
          hairColor: data.hairColor || "",
          hairStyle: data.hairStyle || "",
          ageRange: data.ageRange || "",
          frontPrompt: data.frontPrompt || "",
          backPrompt: data.backPrompt || "",
          stylePrompt: data.stylePrompt || "",
          modelType: (data.modelType as any) || "IMAGE_REFERENCE",
        });
      } catch (err: any) {
        setError(err?.message || "Model profili alınamadı.");
        toast.error("Model profili yüklenemedi");
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
      await updateModelProfile(id, {
        name: form.name,
        gender: form.gender,
        modelType: form.modelType,
        faceReferenceUrl: form.faceReferenceUrl || undefined,
        backReferenceUrl: form.backReferenceUrl || undefined,
        bodyType: form.bodyType || undefined,
        skinTone: form.skinTone || undefined,
        hairColor: form.hairColor || undefined,
        hairStyle: form.hairStyle || undefined,
        ageRange: form.ageRange || undefined,
        frontPrompt: form.frontPrompt || undefined,
        backPrompt: form.backPrompt || undefined,
        stylePrompt: form.stylePrompt || undefined,
        faceFile: faceFile || undefined,
        backFile: backFile || undefined,
      });
      toast.success("Model profili güncellendi!");

      // Reload to see changes
      const updatedProfile = await getModelProfile(id);
      setProfile(updatedProfile);
      setActiveTab('overview');
    } catch (err: any) {
      const msg = err?.message || "Güncelleme başarısız";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-textMuted">Yükleniyor...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-textMuted text-lg">Kayıt bulunamadı.</div>
        <AppButton onClick={() => router.push("/model-profiles")}>
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
          eyebrow="Model Profili"
          title={profile.name}
          description={`${profile.gender === 'FEMALE' ? '👩' : '👨'} ${profile.gender} ${profile.ageRange ? `• ${profile.ageRange} yaş` : ''}`}
        />
        <div className="flex items-center gap-2">
          <button
            className="text-sm text-textSecondary hover:text-white transition-colors mr-4"
            onClick={() => router.push("/model-profiles")}
          >
            ← Listeye dön
          </button>
          <div className="flex items-center gap-1 border-l border-border pl-4">
            <AppButton
              variant="ghost"
              disabled={!prevId}
              onClick={() => prevId && router.push(`/model-profiles/${prevId}`)}
            >
              ← Önceki
            </AppButton>
            <AppButton
              variant="ghost"
              disabled={!nextId}
              onClick={() => nextId && router.push(`/model-profiles/${nextId}`)}
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
              {/* Images */}
              <div className="lg:col-span-1 space-y-6">
                {/* Face */}
                {profile.faceReferenceUrl && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white">Ön / Yüz Referansı</label>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-black font-bold">ÖN</span>
                    </div>
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-surface border border-border">
                      <img
                        src={profile.faceReferenceUrl}
                        alt="Face Reference"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Back */}
                {profile.backReferenceUrl && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white">Arka Referansı</label>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accentBlue text-white font-bold">ARKA</span>
                    </div>
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-surface border border-border">
                      <img
                        src={profile.backReferenceUrl}
                        alt="Back Reference"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {!profile.faceReferenceUrl && !profile.backReferenceUrl && (
                  <div className="text-center py-12 text-textMuted">
                    <p className="text-sm">Henüz görsel yüklenmemiş</p>
                    <button
                      onClick={() => setActiveTab('edit')}
                      className="mt-4 text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Görsel Yükle →
                    </button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Physical Attributes */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span>📊</span> Fiziksel Özellikler
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.bodyType && (
                      <div className="p-4 bg-surface rounded-lg border border-border">
                        <p className="text-xs text-textMuted mb-1">Vücut Tipi</p>
                        <p className="text-sm font-medium text-white capitalize">{profile.bodyType}</p>
                      </div>
                    )}
                    {profile.skinTone && (
                      <div className="p-4 bg-surface rounded-lg border border-border">
                        <p className="text-xs text-textMuted mb-1">Ten Tonu</p>
                        <p className="text-sm font-medium text-white capitalize">{profile.skinTone}</p>
                      </div>
                    )}
                    {profile.hairColor && (
                      <div className="p-4 bg-surface rounded-lg border border-border">
                        <p className="text-xs text-textMuted mb-1">Saç Rengi</p>
                        <p className="text-sm font-medium text-white capitalize">{profile.hairColor}</p>
                      </div>
                    )}
                    {profile.hairStyle && (
                      <div className="p-4 bg-surface rounded-lg border border-border">
                        <p className="text-xs text-textMuted mb-1">Saç Stili</p>
                        <p className="text-sm font-medium text-white capitalize">{profile.hairStyle}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
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
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Temel Bilgiler</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <AppInput
                    label="Model Adı"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                  <AppSelect
                    label="Cinsiyet"
                    value={form.gender}
                    onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as Gender }))}
                  >
                    <option value="FEMALE">Kadın</option>
                    <option value="MALE">Erkek</option>
                  </AppSelect>
                  <AppSelect
                    label="Yaş Aralığı"
                    value={form.ageRange}
                    onChange={(e) => setForm((p) => ({ ...p, ageRange: e.target.value }))}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46+">46+</option>
                  </AppSelect>
                </div>
              </div>

              {/* Physical Attributes */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Fiziksel Özellikler</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <AppSelect
                    label="Vücut Tipi"
                    value={form.bodyType}
                    onChange={(e) => setForm((p) => ({ ...p, bodyType: e.target.value }))}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="slim">İnce</option>
                    <option value="normal">Normal</option>
                    <option value="athletic">Atletik</option>
                    <option value="curvy">Dolgun</option>
                  </AppSelect>

                  <AppSelect
                    label="Ten Tonu"
                    value={form.skinTone}
                    onChange={(e) => setForm((p) => ({ ...p, skinTone: e.target.value }))}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="fair">Açık</option>
                    <option value="medium">Orta</option>
                    <option value="tan">Esmer</option>
                    <option value="dark">Koyu</option>
                  </AppSelect>

                  <AppSelect
                    label="Saç Rengi"
                    value={form.hairColor}
                    onChange={(e) => setForm((p) => ({ ...p, hairColor: e.target.value }))}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="black">Siyah</option>
                    <option value="brown">Kahverengi</option>
                    <option value="blonde">Sarı</option>
                    <option value="red">Kızıl</option>
                    <option value="white">Beyaz</option>
                  </AppSelect>

                  <AppSelect
                    label="Saç Stili"
                    value={form.hairStyle}
                    onChange={(e) => setForm((p) => ({ ...p, hairStyle: e.target.value }))}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="short">Kısa</option>
                    <option value="medium">Orta</option>
                    <option value="long">Uzun</option>
                    <option value="wavy">Dalgalı</option>
                    <option value="straight">Düz</option>
                    <option value="curly">Kıvırcık</option>
                  </AppSelect>
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Görseller</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Ön / Yüz Referansı</label>
                    <label className="cursor-pointer block">
                      <div className="aspect-[3/4] rounded-lg bg-surface border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center">
                        {faceFile || form.faceReferenceUrl ? (
                          <img
                            src={faceFile ? URL.createObjectURL(faceFile) : form.faceReferenceUrl}
                            alt="Face"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <p className="text-sm text-textMuted">📁 Dosya Seç</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFaceFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Arka Referansı</label>
                    <label className="cursor-pointer block">
                      <div className="aspect-[3/4] rounded-lg bg-surface border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center">
                        {backFile || form.backReferenceUrl ? (
                          <img
                            src={backFile ? URL.createObjectURL(backFile) : form.backReferenceUrl}
                            alt="Back"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <p className="text-sm text-textMuted">📁 Dosya Seç</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <AppButton
                  type="submit"
                  disabled={saving}
                  fullWidth={false}
                >
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
                <h3 className="text-2xl font-bold text-white mb-2">Hangi görseli üretmek istiyorsunuz?</h3>
                <p className="text-textMuted">Fiziksel özellikleriniz otomatik kullanılacak</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Face */}
                <button
                  onClick={() => setShowAiPrompt('FACE')}
                  className="p-8 rounded-xl border-2 border-border bg-surface hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="text-6xl mb-4">📸</div>
                  <h4 className="text-lg font-bold text-white mb-2">Ön / Yüz Görseli</h4>
                  <p className="text-sm text-textMuted mb-4">Ön görünüm ve yüz referansı</p>
                  <div className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium inline-block">
                    ✨ 1 Token
                  </div>
                </button>

                {/* Back */}
                <button
                  onClick={() => setShowAiPrompt('BACK')}
                  className="p-8 rounded-xl border-2 border-border bg-surface hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="text-6xl mb-4">📸</div>
                  <h4 className="text-lg font-bold text-white mb-2">Arka Görseli</h4>
                  <p className="text-sm text-textMuted mb-4">Arka görünüm referansı</p>
                  <div className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium inline-block">
                    ✨ 1 Token
                  </div>
                </button>
              </div>

              <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl">
                <p className="text-sm text-white">
                  💡 <span className="font-bold">İpucu:</span> AI, model profilinizdeki tüm fiziksel özellikleri (vücut tipi, ten tonu, saç rengi, saç stili, yaş aralığı) otomatik olarak kullanacak. Siz sadece ek açıklama ekleyebilirsiniz.
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
                {showAiPrompt === 'FACE' ? '📸 Ön/Yüz' : '📸 Arka'} Referans Üret
              </h3>
              <button onClick={() => setShowAiPrompt(null)} className="text-textMuted hover:text-white">✕</button>
            </div>

            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-xs text-white mb-2">
                <span className="font-bold">✅ Otomatik Kullanılacak Özellikler:</span>
              </p>
              <ul className="text-xs text-textMuted space-y-1">
                {profile.gender && <li>• Cinsiyet: {profile.gender}</li>}
                {profile.ageRange && <li>• Yaş: {profile.ageRange}</li>}
                {profile.bodyType && <li>• Vücut: {profile.bodyType}</li>}
                {profile.skinTone && <li>• Ten: {profile.skinTone}</li>}
                {profile.hairColor && <li>• Saç Rengi: {profile.hairColor}</li>}
                {profile.hairStyle && <li>• Saç Stili: {profile.hairStyle}</li>}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Ek Açıklama (Opsiyonel)
              </label>
              <textarea
                value={aiPromptText}
                onChange={(e) => setAiPromptText(e.target.value)}
                placeholder="Örn: Gülen, profesyonel, beyaz arka plan..."
                className="w-full h-32 bg-surfaceAlt border border-border rounded-lg p-3 text-sm text-white focus:border-purple-500 transition resize-none placeholder:text-textMuted"
                autoFocus
              />
              <div className="mt-2 space-y-2">
                <p className="text-xs text-textMuted">
                  💡 <span className="font-medium text-white">İpuçları:</span>
                </p>
                <ul className="text-xs text-textMuted space-y-1 ml-4">
                  <li>• <span className="text-white">Poz:</span> "gülen", "ciddi", "profesyonel duruş"</li>
                  <li>• <span className="text-white">Arka Plan:</span> "beyaz arka plan", "stüdyo", "doğal ışık"</li>
                  <li>• <span className="text-white">Kıyafet:</span> "beyaz tişört", "klasik gömlek", "casual"</li>
                  <li>• <span className="text-white">Kalite:</span> "yüksek çözünürlük", "profesyonel fotoğraf"</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                ℹ️ <span className="font-bold">Not:</span> Fiziksel özellikleriniz zaten eklenmiş durumda. Sadece ek detaylar (poz, arka plan, kıyafet vb.) ekleyebilirsiniz.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <AppButton variant="ghost" onClick={() => setShowAiPrompt(null)} disabled={generatingAi}>
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

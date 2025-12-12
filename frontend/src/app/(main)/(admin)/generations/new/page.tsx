"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listProducts } from "@/lib/api/products";
import { listModelProfiles } from "@/lib/api/modelProfiles";
import { listScenes } from "@/lib/api/scenes";
import { createGeneration, previewGenerationPrompt } from "@/lib/api/generations";
import { getCurrentOrganization } from "@/lib/api/auth";
import type { Product, ModelProfile, ScenePreset } from "@/types";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { toast } from "sonner";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { HoverImage } from "@/components/ui/HoverImage";

const CAMERA_ANGLES = [
  { value: "eye_level", label: "Göz Hizası" },
  { value: "low_angle", label: "Aşağıdan" },
  { value: "high_angle", label: "Yukarıdan" },
  { value: "side_profile", label: "Yan Profil" },
];

const SHOT_TYPES = [
  { value: "full_body", label: "Tam Boy" },
  { value: "knee_shot", label: "Diz Üstü" },
  { value: "waist_up", label: "Bel Üstü" },
  { value: "close_up", label: "Yakın Çekim" },
];

const MODEL_POSES = [
  { value: "standing", label: "Ayakta" },
  { value: "walking", label: "Yürürken" },
  { value: "sitting", label: "Otururken" },
  { value: "leaning", label: "Yaslanmış" },
];

// Token pricing constants
const TOKEN_COSTS = {
  FAST: 3,
  STANDARD: 5,
  HIGH: 8,
};

type Step = 1 | 2 | 3;

export default function NewGenerationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get("productId") || "";

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [models, setModels] = useState<ModelProfile[]>([]);
  const [scenes, setScenes] = useState<ScenePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewData, setPreviewData] = useState<{ front?: string; back?: string } | null>(null);
  const [editablePrompts, setEditablePrompts] = useState<{ front: string; back: string }>({ front: "", back: "" });
  const [previewing, setPreviewing] = useState(false);

  // Credit tracking
  const [remainingCredits, setRemainingCredits] = useState<number>(0);

  // Wizard State
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form State
  const [form, setForm] = useState({
    productId: productIdParam,
    modelProfileId: "",
    scenePresetId: "",
    frontCount: 1,
    backCount: 0,
    aspectRatio: "9:16" as "9:16" | "16:9",
    resolution: "4K" as "1K" | "2K" | "4K",
    qualityMode: "STANDARD" as "FAST" | "STANDARD" | "HIGH",
    customPromptFront: "",
    customPromptBack: "",
    cameraAngle: "",
    shotType: "",
    modelPose: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const [prods, mods, scn, orgData] = await Promise.all([
          listProducts(),
          listModelProfiles(),
          listScenes(),
          getCurrentOrganization(),
        ]);
        setProducts(prods);
        setModels(mods);
        setScenes(scn);
        setRemainingCredits(orgData.organization.remainingCredits);
        if (productIdParam) {
          setForm((p) => ({ ...p, productId: productIdParam }));
        }
      } catch (err: any) {
        toast.error(err?.message || "Veriler alınamadı");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productIdParam]);

  // Helper for dynamic image preview
  const renderAssetPreview = (
    frontUrl: string | null | undefined,
    backUrl: string | null | undefined,
    alt: string,
    isRound: boolean = false
  ) => {
    const showFront = form.frontCount > 0;
    const showBack = form.backCount > 0;
    // If both are 0 (should not happen given logic, but safe fallback), show front
    const effectiveShowFront = showFront || (!showFront && !showBack);

    return (
      <div className="flex items-center gap-2">
        {effectiveShowFront && frontUrl && (
          <HoverImage
            src={frontUrl}
            alt={alt + " (Ön)"}
            className={cn("w-12 h-12 object-cover bg-black/20", isRound ? "rounded-full" : "rounded")}
          />
        )}
        {showBack && backUrl && (
          <HoverImage
            src={backUrl}
            alt={alt + " (Arka)"}
            className={cn("w-12 h-12 object-cover bg-black/20", isRound ? "rounded-full" : "rounded")}
          />
        )}
        {showBack && !backUrl && (
          <div className={cn("w-12 h-12 bg-surfaceAlt flex items-center justify-center text-[10px] text-center leading-tight text-textMuted border border-dashed border-border", isRound ? "rounded-full" : "rounded")}>
            Arka<br />Yok
          </div>
        )}
      </div>
    );
  };

  // Derived State
  const selectedProduct = products.find((p) => p.id === Number(form.productId));
  const selectedModel = models.find((m) => m.id === Number(form.modelProfileId));
  const selectedScene = scenes.find((s) => s.id === Number(form.scenePresetId));

  const totalImages = form.frontCount + form.backCount;
  const tokensPerImage = TOKEN_COSTS[form.qualityMode];
  const estimatedCredits = totalImages * tokensPerImage;
  const isInsufficientCredits = estimatedCredits > remainingCredits;

  const handleNext = () => {
    if (currentStep === 1) {
      if (!form.productId || !form.modelProfileId || !form.scenePresetId) {
        toast.error("Lütfen tüm seçimleri yapın");
        return;
      }
    }
    if (currentStep === 2) {
      if (totalImages === 0) {
        toast.error("En az 1 görsel seçmelisiniz");
        return;
      }
    }
    setCurrentStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    setCurrentStep((prev) => (prev - 1) as Step);
  };

  const handlePreview = async () => {
    if (!form.productId || !form.modelProfileId || !form.scenePresetId) return;

    setPreviewing(true);
    try {
      const res = await previewGenerationPrompt(form.productId, {
        modelProfileId: Number(form.modelProfileId),
        scenePresetId: Number(form.scenePresetId),
        frontCount: Number(form.frontCount),
        backCount: Number(form.backCount),
        aspectRatio: form.aspectRatio,
        resolution: form.resolution,
        qualityMode: form.qualityMode,
        customPromptFront: form.customPromptFront,
        customPromptBack: form.customPromptBack,
        cameraAngle: form.cameraAngle,
        shotType: form.shotType,
        modelPose: form.modelPose,
        overridePromptFront: editablePrompts.front || undefined,
        overridePromptBack: editablePrompts.back || undefined,
      });
      setPreviewData(res);
      setEditablePrompts({ front: res.front || "", back: res.back || "" });
    } catch (err) {
      toast.error("Önizleme alınamadı");
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await createGeneration(form.productId, {
        modelProfileId: Number(form.modelProfileId),
        scenePresetId: Number(form.scenePresetId),
        frontCount: Number(form.frontCount),
        backCount: Number(form.backCount),
        aspectRatio: form.aspectRatio,
        resolution: form.resolution,
        qualityMode: form.qualityMode,
        customPromptFront: form.customPromptFront,
        customPromptBack: form.customPromptBack,
        cameraAngle: form.cameraAngle,
        shotType: form.shotType,
        modelPose: form.modelPose,
        overridePromptFront: editablePrompts.front || undefined,
        overridePromptBack: editablePrompts.back || undefined,
      });

      toast.success(`${totalImages} görsel üretimi başlatıldı!`);
      router.push(`/generations/${res.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Üretim başlatılamadı");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-textMuted">Yükleniyor...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header & Steps */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Yeni Üretim Sihirbazı"
            subtitle={`Adım ${currentStep}/3: ${currentStep === 1 ? "Varlık Seçimi" :
              currentStep === 2 ? "Konfigürasyon" : "Onay"
              }`}
          />
          <AppButton variant="ghost" onClick={() => router.push("/generations")}>
            Çıkış
          </AppButton>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-surfaceAlt rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: ASSET SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Product Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-white flex items-center gap-2">
                <span className="bg-purple-500/20 text-purple-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Ürün Seçin
              </h3>
              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setForm(f => ({ ...f, productId: String(p.id) }))}
                    className={cn(
                      "cursor-pointer rounded-xl border p-3 transition-all hover:border-purple-500/50 flex gap-3 items-center",
                      form.productId === String(p.id)
                        ? "bg-purple-500/10 border-purple-500 ring-1 ring-purple-500"
                        : "bg-surface border-border"
                    )}
                  >
                    {renderAssetPreview(p.productImageUrl, p.productBackImageUrl, p.name)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate text-white">{p.name}</div>
                      <div className="text-xs text-textMuted truncate">{p.sku || "No SKU"}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View Selection (Only visible if a product is selected) */}
              {form.productId && (
                <div className="mt-4 p-4 bg-surfaceAlt/50 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-semibold text-textSecondary uppercase mb-3 block">Üretim Modu</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setForm(f => ({ ...f, frontCount: 1, backCount: 0 }))}
                      className={cn(
                        "p-2 rounded-lg text-sm font-medium transition-all border",
                        form.frontCount > 0 && form.backCount === 0
                          ? "bg-purple-500/20 border-purple-500 text-white"
                          : "bg-surface border-border text-textMuted hover:border-textSecondary"
                      )}
                    >
                      Sadece Ön
                    </button>
                    <button
                      onClick={() => setForm(f => ({ ...f, frontCount: 0, backCount: 1 }))}
                      className={cn(
                        "p-2 rounded-lg text-sm font-medium transition-all border",
                        form.frontCount === 0 && form.backCount > 0
                          ? "bg-pink-500/20 border-pink-500 text-white"
                          : "bg-surface border-border text-textMuted hover:border-textSecondary"
                      )}
                    >
                      Sadece Arka
                    </button>
                    <button
                      onClick={() => setForm(f => ({ ...f, frontCount: 1, backCount: 1 }))}
                      className={cn(
                        "p-2 rounded-lg text-sm font-medium transition-all border",
                        form.frontCount > 0 && form.backCount > 0
                          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500 text-white"
                          : "bg-surface border-border text-textMuted hover:border-textSecondary"
                      )}
                    >
                      Ön + Arka
                    </button>
                  </div>

                  {/* Warning if Back is selected but no back image */}
                  {(form.backCount > 0) && selectedProduct && !selectedProduct.productBackImageUrl && (
                    <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                      <span>⚠️</span> Ürünün arka görseli yok, AI tahmin edecek.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-white flex items-center gap-2">
                <span className="bg-cyan-500/20 text-cyan-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Model Seçin
              </h3>
              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {models.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setForm(f => ({ ...f, modelProfileId: String(m.id) }))}
                    className={cn(
                      "cursor-pointer rounded-xl border p-3 transition-all hover:border-cyan-500/50 flex gap-3 items-center",
                      form.modelProfileId === String(m.id)
                        ? "bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500"
                        : "bg-surface border-border"
                    )}
                  >
                    {m.faceReferenceUrl || m.backReferenceUrl ? (
                      renderAssetPreview(m.faceReferenceUrl, m.backReferenceUrl, m.name, true)
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-surfaceAlt flex items-center justify-center text-lg">👤</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate text-white">{m.name}</div>
                      <div className="text-xs text-textMuted">{m.gender} • {m.bodyType}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scene Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-white flex items-center gap-2">
                <span className="bg-pink-500/20 text-pink-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                Sahne Seçin
              </h3>
              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {scenes.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setForm(f => ({ ...f, scenePresetId: String(s.id) }))}
                    className={cn(
                      "cursor-pointer rounded-xl border p-3 transition-all hover:border-pink-500/50 flex gap-3 items-center",
                      form.scenePresetId === String(s.id)
                        ? "bg-pink-500/10 border-pink-500 ring-1 ring-pink-500"
                        : "bg-surface border-border"
                    )}
                  >
                    {s.backgroundReferenceUrl ? (
                      <HoverImage src={s.backgroundReferenceUrl} alt={s.name} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-surfaceAlt flex items-center justify-center text-lg">🎬</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate text-white">{s.name}</div>
                      <div className="text-xs text-textMuted capitalize">{s.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONFIGURATION */}
      {currentStep === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

          {/* View Selection */}
          <div className="grid md:grid-cols-2 gap-8">
            <AppCard className="p-6 space-y-4 border-purple-500/30">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-lg">📸 Ön Görsel</h3>
                <div className="flex items-center gap-3 bg-surface rounded-lg p-1">
                  <button
                    onClick={() => setForm(p => ({ ...p, frontCount: Math.max(0, p.frontCount - 1) }))}
                    className="w-8 h-8 rounded hover:bg-white/10 text-white font-bold"
                  >-</button>
                  <span className="w-8 text-center font-mono text-lg">{form.frontCount}</span>
                  <button
                    onClick={() => setForm(p => ({ ...p, frontCount: Math.min(4, p.frontCount + 1) }))}
                    className="w-8 h-8 rounded hover:bg-white/10 text-white font-bold"
                  >+</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-textSecondary font-semibold">Özel Prompt (Opsiyonel)</label>
                <textarea
                  className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-white h-24 focus:border-purple-500 transition resize-none"
                  placeholder="Örn: gülümseyerek, ellerini beline koyarak, kameraya bakarak..."
                  value={form.customPromptFront}
                  onChange={(e) => setForm(p => ({ ...p, customPromptFront: e.target.value }))}
                />
              </div>
            </AppCard>

            <AppCard className="p-6 space-y-4 border-pink-500/30">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-lg">📸 Arka Görsel</h3>
                <div className="flex items-center gap-3 bg-surface rounded-lg p-1">
                  <button
                    onClick={() => setForm(p => ({ ...p, backCount: Math.max(0, p.backCount - 1) }))}
                    className="w-8 h-8 rounded hover:bg-white/10 text-white font-bold"
                  >-</button>
                  <span className="w-8 text-center font-mono text-lg">{form.backCount}</span>
                  <button
                    onClick={() => setForm(p => ({ ...p, backCount: Math.min(4, p.backCount + 1) }))}
                    className="w-8 h-8 rounded hover:bg-white/10 text-white font-bold"
                  >+</button>
                </div>
              </div>

              {form.backCount > 0 && models.find(m => String(m.id) === form.modelProfileId) && !models.find(m => String(m.id) === form.modelProfileId)?.backReferenceUrl && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-xs flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <div>
                    Bu modelin arka görünüm referansı yok. AI sadece metin açıklaması kullanacak, bu da kaliteyi düşürebilir.
                    <a href={`/model-profiles/${form.modelProfileId}`} target="_blank" className="block mt-1 underline hover:text-white">
                      Referans eklemek için tıklayın
                    </a>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs uppercase text-textSecondary font-semibold">Özel Prompt (Opsiyonel)</label>
                <textarea
                  className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-white h-24 focus:border-pink-500 transition resize-none"
                  placeholder="Örn: arkası dönük, saçları toplu, detaylı sırt görünümü..."
                  value={form.customPromptBack}
                  onChange={(e) => setForm(p => ({ ...p, customPromptBack: e.target.value }))}
                />
              </div>
            </AppCard>
          </div>

          {/* Settings */}
          <AppCard className="p-6">
            <h3 className="font-semibold text-white mb-4">⚙️ Üretim Ayarları</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm text-textMuted">Kalite Modu</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['FAST', 'STANDARD', 'HIGH'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setForm(p => ({ ...p, qualityMode: mode }))}
                      className={cn(
                        "px-3 py-3 rounded-xl text-sm font-medium transition border text-left",
                        form.qualityMode === mode
                          ? "bg-purple-500/20 border-purple-500 text-white"
                          : "bg-surface border-border text-textMuted hover:border-textSecondary"
                      )}
                    >
                      <div className="font-bold mb-1">
                        {mode === 'FAST' && '⚡ Hızlı'}
                        {mode === 'STANDARD' && '🎯 Standart'}
                        {mode === 'HIGH' && '💎 Yüksek'}
                      </div>
                      <div className="text-xs opacity-70">{TOKEN_COSTS[mode]} Token / Resim</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-textMuted">En/Boy Oranı</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['9:16', '16:9'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setForm(p => ({ ...p, aspectRatio: ratio }))}
                      className={cn(
                        "px-3 py-3 rounded-xl text-sm font-medium transition border",
                        form.aspectRatio === ratio
                          ? "bg-cyan-500/20 border-cyan-500 text-white"
                          : "bg-surface border-border text-textMuted hover:border-textSecondary"
                      )}
                    >
                      {ratio === '9:16' ? '📱 Dikey (Story)' : '🖼️ Yatay (Landscape)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AppCard>

          {/* Camera & Pose Settings */}
          <AppCard className="p-6 border-cyan-500/30">
            <h3 className="font-semibold text-white mb-4">🎥 Kamera ve Poz</h3>
            <div className="grid md:grid-cols-3 gap-6">

              {/* Camera Angle */}
              <div className="space-y-3">
                <label className="text-sm text-textMuted">Kamera Açısı</label>
                <div className="grid grid-cols-1 gap-2">
                  {CAMERA_ANGLES.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(p => ({ ...p, cameraAngle: p.cameraAngle === opt.value ? "" : opt.value }))}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition border text-left",
                        form.cameraAngle === opt.value
                          ? "bg-cyan-500/20 border-cyan-500 text-white"
                          : "bg-surface border-border text-textMuted hover:border-textSecondary"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shot Type */}
              <div className="space-y-3">
                <label className="text-sm text-textMuted">Çekim Türü</label>
                <div className="grid grid-cols-1 gap-2">
                  {SHOT_TYPES.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(p => ({ ...p, shotType: p.shotType === opt.value ? "" : opt.value }))}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition border text-left",
                        form.shotType === opt.value
                          ? "bg-cyan-500/20 border-cyan-500 text-white"
                          : "bg-surface border-border text-textMuted hover:border-textSecondary"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Pose */}
              <div className="space-y-3">
                <label className="text-sm text-textMuted">Model Duruşu</label>
                <div className="grid grid-cols-1 gap-2">
                  {MODEL_POSES.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(p => ({ ...p, modelPose: p.modelPose === opt.value ? "" : opt.value }))}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition border text-left",
                        form.modelPose === opt.value
                          ? "bg-cyan-500/20 border-cyan-500 text-white"
                          : "bg-surface border-border text-textMuted hover:border-textSecondary"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </AppCard>

          {/* Prompt Preview */}
          <AppCard className="p-6 border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">📝 Prompt Önizleme</h3>
              <AppButton
                variant="secondary"
                onClick={handlePreview}
                disabled={previewing}
              >
                {previewing ? "Yükleniyor..." : "Yenile"}
              </AppButton>
            </div>

            {!previewData && !previewing && (
              <div className="text-sm text-textMuted text-center py-4">
                AI tarafından oluşturulacak prompt'u görmek için "Yenile" butonuna tıklayın.
              </div>
            )}

            {previewData && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                {form.frontCount > 0 && (
                  <div>
                    <div className="text-xs font-medium text-textMuted mb-1">Ön Prompt</div>
                    <textarea
                      value={editablePrompts.front}
                      onChange={(e) => setEditablePrompts(p => ({ ...p, front: e.target.value }))}
                      className="w-full bg-black/30 border border-border rounded-lg p-3 text-xs font-mono text-textSecondary h-24 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
                    />
                  </div>
                )}
                {form.backCount > 0 && (
                  <div>
                    <div className="text-xs font-medium text-textMuted mb-1">Arka Prompt</div>
                    <textarea
                      value={editablePrompts.back}
                      onChange={(e) => setEditablePrompts(p => ({ ...p, back: e.target.value }))}
                      className="w-full bg-black/30 border border-border rounded-lg p-3 text-xs font-mono text-textSecondary h-24 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
                    />
                  </div>
                )}
                <div className="text-xs text-yellow-500/80 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Burada yapacağınız değişiklikler üretimde kullanılacaktır.</span>
                </div>
              </div>
            )}
          </AppCard>
        </div>
      )}

      {/* STEP 3: REVIEW */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Selected Assets Summary */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-white">Seçilen Varlıklar</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden group flex bg-black/20">
                  {(form.frontCount > 0 || (form.frontCount === 0 && form.backCount === 0)) && selectedProduct?.productImageUrl && (
                    <div className={cn("h-full relative", form.backCount > 0 && selectedProduct.productBackImageUrl ? "w-1/2" : "w-full")}>
                      <HoverImage src={selectedProduct.productImageUrl} alt="Product Front" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {form.backCount > 0 && selectedProduct?.productBackImageUrl && (
                    <div className={cn("h-full relative", (form.frontCount > 0 || (form.frontCount === 0 && form.backCount === 0)) ? "w-1/2 border-l border-white/10" : "w-full")}>
                      <HoverImage src={selectedProduct.productBackImageUrl} alt="Product Back" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 pointer-events-none">
                    <span className="text-white text-sm font-medium">Ürün: {selectedProduct?.name}</span>
                  </div>
                </div>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden group flex bg-black/20">
                  {(form.frontCount > 0 || (form.frontCount === 0 && form.backCount === 0)) && selectedModel?.faceReferenceUrl && (
                    <div className={cn("h-full relative", form.backCount > 0 && selectedModel.backReferenceUrl ? "w-1/2" : "w-full")}>
                      <HoverImage src={selectedModel.faceReferenceUrl} alt="Model Front" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {form.backCount > 0 && selectedModel?.backReferenceUrl && (
                    <div className={cn("h-full relative", (form.frontCount > 0 || (form.frontCount === 0 && form.backCount === 0)) ? "w-1/2 border-l border-white/10" : "w-full")}>
                      <HoverImage src={selectedModel.backReferenceUrl} alt="Model Back" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 pointer-events-none">
                    <span className="text-white text-sm font-medium">Model: {selectedModel?.name}</span>
                  </div>
                </div>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                  {selectedScene?.backgroundReferenceUrl ? (
                    <HoverImage src={selectedScene.backgroundReferenceUrl} alt="Scene" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center text-4xl text-zinc-600">🎬</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 pointer-events-none">
                    <span className="text-white text-sm font-medium">Sahne: {selectedScene?.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-white mb-2">Konfigürasyon Özeti</h3>
                <div className="bg-surface rounded-xl p-4 space-y-2 text-sm text-textSecondary border border-border">
                  <div className="flex justify-between">
                    <span>Ön Görsel Sayısı:</span>
                    <span className="text-white">{form.frontCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Arka Görsel Sayısı:</span>
                    <span className="text-white">{form.backCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kalite Modu:</span>
                    <span className="text-white">{form.qualityMode} ({tokensPerImage} token/resim)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Çözünürlük:</span>
                    <span className="text-white">{form.resolution}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Summary */}
            <div>
              <AppCard className={cn(
                "p-6 sticky top-6",
                isInsufficientCredits
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-purple-500/50 bg-purple-500/5"
              )}>
                <h3 className="font-semibold text-white mb-6 text-lg">Maliyet Özeti</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-textMuted">Mevcut Bakiye</span>
                    <span className={cn(
                      "font-mono text-lg font-bold",
                      isInsufficientCredits ? "text-red-400" : "text-green-400"
                    )}>
                      {remainingCredits} Token
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-textMuted">Toplam Görsel</span>
                    <span className="text-white font-mono text-lg">{totalImages}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-textMuted">Birim Maliyet</span>
                    <span className="text-white font-mono">{tokensPerImage} Token</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Toplam Tutar</span>
                    <span className={cn(
                      "text-2xl font-bold",
                      isInsufficientCredits ? "text-red-400" : "text-purple-400"
                    )}>
                      {estimatedCredits} Token
                    </span>
                  </div>
                  {isInsufficientCredits && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-red-400">Eksik</span>
                      <span className="text-red-400 font-mono font-bold">
                        -{estimatedCredits - remainingCredits} Token
                      </span>
                    </div>
                  )}
                </div>

                {isInsufficientCredits && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <div>
                        <p className="font-medium">Yetersiz Kredi</p>
                        <p className="text-xs opacity-80 mt-1">
                          Bu üretim için {estimatedCredits - remainingCredits} token daha gerekiyor.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <AppButton
                  onClick={handleSubmit}
                  disabled={saving || isInsufficientCredits}
                  className={cn(
                    "w-full py-4 text-lg",
                    isInsufficientCredits
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  )}
                >
                  {saving ? "Başlatılıyor..." : isInsufficientCredits ? "❌ Yetersiz Kredi" : "🚀 Üretimi Başlat"}
                </AppButton>

                {isInsufficientCredits && (
                  <AppButton
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => router.push("/billing")}
                  >
                    💳 Kredi Satın Al
                  </AppButton>
                )}

                <p className="text-xs text-center text-textMuted mt-4">
                  {isInsufficientCredits
                    ? "Üretim başlatmak için yeterli krediniz yok."
                    : `"Üretimi Başlat" butonuna tıkladığınızda bakiyenizden ${estimatedCredits} token düşülecektir.`
                  }
                </p>
              </AppCard>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/80 backdrop-blur-lg border-t border-border z-10 md:pl-64">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <AppButton
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || saving}
            className={currentStep === 1 ? "invisible" : ""}
          >
            ← Geri
          </AppButton>

          {currentStep < 3 && (
            <AppButton onClick={handleNext} className="px-8">
              İleri →
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
}

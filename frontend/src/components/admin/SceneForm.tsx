"use client";

import { useEffect, useState } from "react";
import { AppCard } from "../ui/AppCard";
import { AppInput } from "../ui/AppInput";
import { AppSelect } from "../ui/AppSelect";
import { AppButton } from "../ui/AppButton";
import { AppBadge } from "../ui/AppBadge";
import { toast } from "sonner";
import { createScene, updateScene, getScene, UpsertSceneInput as ScenePayload } from "@/lib/api/scenes";
import { authStorage } from "@/lib/storage";
import { ScenePreset } from "@/types";

type Props = {
  sceneId?: number;
  onSuccess?: (scene: ScenePreset) => void;
};

export function SceneForm({ sceneId, onSuccess }: Props) {
  const [form, setForm] = useState<Partial<ScenePreset>>({
    name: "",
    backgroundReferenceUrl: "",
    backgroundPrompt: "",
    mood: "",
    lighting: "",
    suggestedAspectRatio: "",
    qualityPreset: "",
    category: "",
    tags: "",
    type: "PRESET"
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = authStorage.token();
    if (!token || !sceneId) return;
    getScene(sceneId.toString()).then((data) => {
      setForm({
        name: data.name,
        backgroundReferenceUrl: data.backgroundReferenceUrl ?? "",
        backgroundPrompt: data.backgroundPrompt ?? "",
        mood: data.mood ?? "",
        lighting: data.lighting ?? "",
        suggestedAspectRatio:
          (data as any).aspect ?? data.suggestedAspectRatio ?? "",
        qualityPreset: data.qualityPreset ?? "",
        category: data.category ?? "",
        tags: data.tags ?? "",
        type: data.type ?? "PRESET"
      });
    });
  }, [sceneId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = authStorage.token();
    if (!token) {
      setError("Oturum süresi doldu");
      return;
    }
    if (!form.name) {
      setError("Sahne adı gerekli");
      return;
    }
    if (!file && !form.backgroundReferenceUrl && !form.backgroundPrompt) {
      setError("Görsel dosyası, URL veya prompt gerekli");
      return;
    }
    setLoading(true);
    try {
      const payload: ScenePayload = {
        name: form.name!,
        type: (form as any).type ?? "PRESET",
        backgroundReferenceUrl: form.backgroundReferenceUrl || null,
        backgroundPrompt: form.backgroundPrompt || null,
        mood: form.mood || null,
        lighting: form.lighting || null,
        suggestedAspectRatio:
          (form as any).suggestedAspectRatio || (form as any).aspect || null,
        qualityPreset: form.qualityPreset || null,
        category: form.category || null,
        tags: form.tags || null,
        file: file || undefined
      };
      const saved = sceneId
        ? await updateScene(sceneId.toString(), payload)
        : await createScene(payload);
      onSuccess?.(saved);
      toast.success(`Sahne başarıyla ${sceneId ? "güncellendi" : "oluşturuldu"}!`);
    } catch (err: any) {
      const errorMessage = err.message ?? "Sahne kaydedilemedi";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AppCard className="p-8 space-y-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-textSecondary">Sahne Bilgileri</p>
            <p className="text-2xl text-white font-semibold">{sceneId ? "Sahne Düzenle" : "Yeni Sahne Oluştur"}</p>
          </div>
          <AppBadge>{sceneId ? "Düzenle" : "Yeni"}</AppBadge>
        </div>

        {/* Image Preview */}
        {(form.backgroundReferenceUrl || file) && (
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Mevcut Görsel</label>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-surface border border-border max-w-2xl">
              <img
                src={file ? URL.createObjectURL(file) : form.backgroundReferenceUrl!}
                alt="Scene Background"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Temel Bilgiler</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <AppInput
              label="Sahne Adı"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              placeholder="Örn: Stüdyo Beyaz Arka Plan"
            />

            <AppSelect
              label="Kategori"
              value={form.category ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            >
              <option value="">Seçiniz...</option>
              <option value="Studio">Stüdyo</option>
              <option value="Outdoor">Dış Mekan</option>
              <option value="Indoor">İç Mekan</option>
              <option value="Street">Sokak</option>
              <option value="Nature">Doğa</option>
              <option value="Beach">Plaj</option>
              <option value="Pool">Havuz</option>
              <option value="Urban">Şehir</option>
              <option value="Minimal">Minimal</option>
              <option value="Luxury">Lüks</option>
            </AppSelect>
          </div>
        </div>

        {/* Background Image */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Arka Plan Görseli</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Dosya Yükle</label>
              <div className="relative group cursor-pointer">
                <div className={`w-full h-32 rounded-lg border-2 border-dashed ${file ? 'border-primary bg-primary/10' : 'border-border bg-surface group-hover:border-primary'} flex flex-col items-center justify-center transition-all`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="text-center p-2">
                      <p className="text-primary text-sm font-medium truncate max-w-[200px]">📁 {file.name}</p>
                      <p className="text-textSecondary text-xs mt-1">Değiştirmek için tıklayın</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-white font-medium">📁 Dosya Seç</p>
                      <p className="text-xs text-textMuted mt-1">veya sürükleyip bırakın</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <AppInput
                label="Veya URL Girin"
                value={form.backgroundReferenceUrl ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, backgroundReferenceUrl: e.target.value }))}
                hint="Dosya yüklediyseniz boş bırakın"
                disabled={!!file}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* AI Prompt */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">AI Prompt (Opsiyonel)</h3>
          <AppInput
            label="Arka Plan Açıklaması"
            value={form.backgroundPrompt ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, backgroundPrompt: e.target.value }))}
            hint="Görsel yoksa gerekli. Örn: Beyaz minimalist stüdyo, yumuşak ışık"
            placeholder="Örn: Beyaz arka plan, minimalist, doğal ışık..."
          />
          <div className="mt-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-xs text-white">
              💡 <span className="font-bold">İpucu:</span> Görsel yüklemezseniz, AI bu açıklamayı kullanarak arka plan üretecek.
            </p>
          </div>
        </div>

        {/* Scene Properties */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Sahne Özellikleri</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <AppSelect
              label="Mood"
              value={form.mood ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, mood: e.target.value }))}
            >
              <option value="">Seçiniz...</option>
              <option value="Minimalist">Minimalist</option>
              <option value="Luxury">Lüks</option>
              <option value="Casual">Casual</option>
              <option value="Professional">Profesyonel</option>
              <option value="Artistic">Sanatsal</option>
              <option value="Vibrant">Canlı</option>
              <option value="Moody">Karamsar</option>
              <option value="Cinematic">Sinematik</option>
              <option value="Soft">Yumuşak</option>
            </AppSelect>

            <AppSelect
              label="Işıklandırma"
              value={form.lighting ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, lighting: e.target.value }))}
            >
              <option value="">Seçiniz...</option>
              <option value="Soft">Yumuşak</option>
              <option value="Natural">Doğal</option>
              <option value="Studio">Stüdyo</option>
              <option value="Dramatic">Dramatik</option>
              <option value="Bright">Parlak</option>
              <option value="Golden Hour">Altın Saat</option>
              <option value="Neon">Neon</option>
              <option value="Shadowed">Gölgeli</option>
            </AppSelect>
          </div>
        </div>

        {/* Technical Settings */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Teknik Ayarlar</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <AppSelect
              label="Önerilen En/Boy Oranı"
              value={(form as any).suggestedAspectRatio ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, suggestedAspectRatio: e.target.value } as any))
              }
            >
              <option value="">Seçiniz...</option>
              <option value="1:1">1:1 (Kare)</option>
              <option value="3:4">3:4</option>
              <option value="4:5">4:5</option>
              <option value="4:3">4:3</option>
              <option value="16:9">16:9 (Geniş)</option>
              <option value="9:16">9:16 (Dikey)</option>
            </AppSelect>

            <AppSelect
              label="Kalite Ön Ayarı"
              value={form.qualityPreset ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, qualityPreset: e.target.value }))}
            >
              <option value="">Seçiniz...</option>
              <option value="Standard">Standart</option>
              <option value="High">Yüksek</option>
              <option value="Ultra">Ultra</option>
            </AppSelect>
          </div>
        </div>

        {/* Tags */}
        <div>
          <AppInput
            label="Etiketler (Opsiyonel)"
            value={form.tags ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
            hint="Virgülle ayırın (örn: sunset, warm, minimal)"
            placeholder="Örn: minimal, beyaz, modern"
          />
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <AppButton type="submit" disabled={loading} fullWidth={false}>
          {loading ? "⏳ Kaydediliyor..." : sceneId ? "💾 Sahneyi Güncelle" : "✨ Sahne Oluştur"}
        </AppButton>
      </AppCard>
    </form>
  );
}

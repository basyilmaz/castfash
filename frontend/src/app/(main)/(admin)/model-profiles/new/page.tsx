"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createModelProfile, type UpsertModelProfileInput } from "@/lib/api/modelProfiles";
import type { Gender } from "@/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Select } from "@/components/ui/Select";
import { ModelTypeSelector, type ModelType } from "@/components/model/ModelTypeSelector";
import { WizardProgress } from "@/components/model/WizardProgress";
import { ImageUpload } from "@/components/model/ImageUpload";
import { FormStep } from "@/components/model/FormStep";
import { toast } from "sonner";

export default function NewModelProfilePage() {
  const router = useRouter();

  // State
  const [modelType, setModelType] = useState<ModelType | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
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
  });
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard steps based on model type
  const getSteps = () => {
    if (modelType === 'TEXT_ONLY') {
      return [
        { number: 1, label: 'Temel Bilgiler' },
        { number: 2, label: 'Fiziksel Özellikler' },
        { number: 3, label: 'Saç Özellikleri' },
        { number: 4, label: 'Stil Notları' },
      ];
    }
    if (modelType === 'HYBRID') {
      return [
        { number: 1, label: 'Temel Bilgiler' },
        { number: 2, label: 'Görsel Referanslar' },
        { number: 3, label: 'Ek Özellikler' },
        { number: 4, label: 'Stil Notları' },
      ];
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload: UpsertModelProfileInput = {
        name: form.name,
        gender: form.gender,
        modelType: modelType!,
        bodyType: form.bodyType || undefined,
        skinTone: form.skinTone || undefined,
        hairColor: form.hairColor || undefined,
        hairStyle: form.hairStyle || undefined,
        ageRange: form.ageRange || undefined,
        faceReferenceUrl: form.faceReferenceUrl || undefined,
        backReferenceUrl: form.backReferenceUrl || undefined,
        frontPrompt: form.frontPrompt || undefined,
        backPrompt: form.backPrompt || undefined,
        stylePrompt: form.stylePrompt || undefined,
        faceFile: faceFile || undefined,
        backFile: backFile || undefined,
      };

      await createModelProfile(payload);
      toast.success("Model profili başarıyla oluşturuldu!");
      router.push("/model-profiles");
    } catch (err: any) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to create profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (modelType === 'IMAGE_REFERENCE') {
      return form.name && form.gender && (faceFile || form.faceReferenceUrl);
    }
    if (modelType === 'TEXT_ONLY') {
      if (currentStep === 1) return form.name && form.gender;
      if (currentStep === 2) return form.bodyType && form.skinTone && form.ageRange;
      if (currentStep === 3) return form.hairColor && form.hairStyle;
      return true;
    }
    if (modelType === 'HYBRID') {
      if (currentStep === 1) return form.name && form.gender;
      if (currentStep === 2) return faceFile || form.faceReferenceUrl;
      return true;
    }
    return false;
  };

  // Reset when changing model type
  const handleModelTypeSelect = (type: ModelType) => {
    setModelType(type);
    setCurrentStep(1);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <SectionHeader eyebrow="AI Model" title="Yeni model profili" description="Sanal mankeninizi oluşturun." />
        <button
          className="text-sm text-gray-400 hover:text-white transition-colors"
          onClick={() => router.push("/model-profiles")}
        >
          Listeye dön
        </button>
      </div>

      {/* Step 1: Model Type Selection */}
      {!modelType && (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <ModelTypeSelector selected={modelType} onSelect={handleModelTypeSelect} />
        </div>
      )}

      {/* Step 2+: Form based on model type */}
      {modelType && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wizard Progress for TEXT_ONLY and HYBRID */}
          {(modelType === 'TEXT_ONLY' || modelType === 'HYBRID') && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              <WizardProgress steps={getSteps()} currentStep={currentStep} />
            </div>
          )}

          {/* Form Content */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl space-y-8">
            {/* IMAGE_REFERENCE Form */}
            {modelType === 'IMAGE_REFERENCE' && (
              <FormStep title="Görsel Referans ile Model Oluştur" description="Fotoğraflarınızı yükleyin, AI gerisini halleder">
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="block text-sm font-medium text-textMuted space-y-2">
                    İsim *
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Örn: Elif Model"
                    />
                  </label>

                  <Select
                    label="Cinsiyet"
                    required
                    value={form.gender}
                    onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as Gender }))}
                    options={[
                      { value: 'FEMALE', label: 'KADIN' },
                      { value: 'MALE', label: 'ERKEK' },
                    ]}
                  />
                </div>

                <div className="border-t border-border pt-6">
                  <ImageUpload
                    label="Yüz/Ön Referans"
                    badge="ÖN"
                    badgeColor="bg-primary"
                    file={faceFile}
                    url={form.faceReferenceUrl}
                    onFileChange={setFaceFile}
                    onUrlChange={(url) => setForm((p) => ({ ...p, faceReferenceUrl: url }))}
                    required
                  />
                </div>

                <div className="border-t border-border pt-6">
                  <ImageUpload
                    label="Arka Referans"
                    badge="ARKA"
                    badgeColor="bg-accentBlue"
                    file={backFile}
                    url={form.backReferenceUrl}
                    onFileChange={setBackFile}
                    onUrlChange={(url) => setForm((p) => ({ ...p, backReferenceUrl: url }))}
                  />
                </div>
              </FormStep>
            )}

            {/* TEXT_ONLY Wizard */}
            {modelType === 'TEXT_ONLY' && (
              <>
                {currentStep === 1 && (
                  <FormStep title="Temel Bilgiler" description="Model profilinizin temel özelliklerini girin">
                    <div className="grid gap-6 md:grid-cols-2">
                      <label className="block text-sm font-medium text-textMuted space-y-2">
                        İsim *
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Örn: Elif Model"
                        />
                      </label>

                      <Select
                        label="Cinsiyet"
                        required
                        value={form.gender}
                        onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as Gender }))}
                        options={[
                          { value: 'FEMALE', label: 'KADIN' },
                          { value: 'MALE', label: 'ERKEK' },
                        ]}
                      />
                    </div>
                  </FormStep>
                )}

                {currentStep === 2 && (
                  <FormStep title="Fiziksel Özellikler" description="Modelin fiziksel özelliklerini seçin">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Select
                        label="Vücut Tipi"
                        required
                        value={form.bodyType}
                        onChange={(e) => setForm((p) => ({ ...p, bodyType: e.target.value }))}
                        options={[
                          { value: 'slim', label: 'İnce' },
                          { value: 'normal', label: 'Normal' },
                          { value: 'athletic', label: 'Atletik' },
                          { value: 'curvy', label: 'Dolgun' },
                        ]}
                        placeholder="Seçiniz..."
                      />

                      <Select
                        label="Ten Tonu"
                        required
                        value={form.skinTone}
                        onChange={(e) => setForm((p) => ({ ...p, skinTone: e.target.value }))}
                        options={[
                          { value: 'fair', label: 'Açık' },
                          { value: 'medium', label: 'Orta' },
                          { value: 'tan', label: 'Esmer' },
                          { value: 'dark', label: 'Koyu' },
                        ]}
                        placeholder="Seçiniz..."
                      />

                      <Select
                        label="Yaş Aralığı"
                        required
                        value={form.ageRange}
                        onChange={(e) => setForm((p) => ({ ...p, ageRange: e.target.value }))}
                        options={[
                          { value: '18-25', label: '18-25' },
                          { value: '26-35', label: '26-35' },
                          { value: '36-45', label: '36-45' },
                          { value: '46+', label: '46+' },
                        ]}
                        placeholder="Seçiniz..."
                      />
                    </div>
                  </FormStep>
                )}

                {currentStep === 3 && (
                  <FormStep title="Saç Özellikleri" description="Modelin saç özelliklerini belirleyin">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Select
                        label="Saç Rengi"
                        required
                        value={form.hairColor}
                        onChange={(e) => setForm((p) => ({ ...p, hairColor: e.target.value }))}
                        options={[
                          { value: 'black', label: 'Siyah' },
                          { value: 'brown', label: 'Kahverengi' },
                          { value: 'blonde', label: 'Sarı' },
                          { value: 'red', label: 'Kızıl' },
                          { value: 'white', label: 'Beyaz' },
                        ]}
                        placeholder="Seçiniz..."
                      />

                      <Select
                        label="Saç Stili"
                        required
                        value={form.hairStyle}
                        onChange={(e) => setForm((p) => ({ ...p, hairStyle: e.target.value }))}
                        options={[
                          { value: 'short', label: 'Kısa' },
                          { value: 'medium', label: 'Orta' },
                          { value: 'long', label: 'Uzun' },
                          { value: 'wavy', label: 'Dalgalı' },
                          { value: 'straight', label: 'Düz' },
                          { value: 'curly', label: 'Kıvırcık' },
                        ]}
                        placeholder="Seçiniz..."
                      />
                    </div>
                  </FormStep>
                )}

                {currentStep === 4 && (
                  <FormStep title="Stil Notları" description="Modelin stil ve görünüm detaylarını ekleyin (opsiyonel)">
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-textMuted space-y-2">
                        Ön Prompt
                        <textarea
                          value={form.frontPrompt}
                          onChange={(e) => setForm((p) => ({ ...p, frontPrompt: e.target.value }))}
                          className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary transition-all h-24"
                          placeholder="Örn: Profesyonel, güler yüzlü, modern..."
                        />
                      </label>

                      <label className="block text-sm font-medium text-textMuted space-y-2">
                        Arka Prompt
                        <textarea
                          value={form.backPrompt}
                          onChange={(e) => setForm((p) => ({ ...p, backPrompt: e.target.value }))}
                          className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary transition-all h-24"
                          placeholder="Örn: Düz duruş, doğal poz..."
                        />
                      </label>

                      <label className="block text-sm font-medium text-textMuted space-y-2">
                        Stil Notu
                        <textarea
                          value={form.stylePrompt}
                          onChange={(e) => setForm((p) => ({ ...p, stylePrompt: e.target.value }))}
                          className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary transition-all h-24"
                          placeholder="Örn: Minimalist, şık, zarif..."
                        />
                      </label>
                    </div>
                  </FormStep>
                )}
              </>
            )}

            {/* HYBRID Wizard */}
            {modelType === 'HYBRID' && (
              <>
                {currentStep === 1 && (
                  <FormStep title="Temel Bilgiler" description="Model profilinizin temel özelliklerini girin">
                    <div className="grid gap-6 md:grid-cols-2">
                      <label className="block text-sm font-medium text-textMuted space-y-2">
                        İsim *
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Örn: Elif Model"
                        />
                      </label>

                      <Select
                        label="Cinsiyet"
                        required
                        value={form.gender}
                        onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as Gender }))}
                        options={[
                          { value: 'FEMALE', label: 'KADIN' },
                          { value: 'MALE', label: 'ERKEK' },
                        ]}
                      />
                    </div>
                  </FormStep>
                )}

                {currentStep === 2 && (
                  <FormStep title="Görsel Referanslar" description="Fotoğraflarınızı yükleyin">
                    <ImageUpload
                      label="Yüz/Ön Referans"
                      badge="ÖN"
                      badgeColor="bg-primary"
                      file={faceFile}
                      url={form.faceReferenceUrl}
                      onFileChange={setFaceFile}
                      onUrlChange={(url) => setForm((p) => ({ ...p, faceReferenceUrl: url }))}
                      required
                    />

                    <div className="border-t border-border pt-6">
                      <ImageUpload
                        label="Arka Referans"
                        badge="ARKA"
                        badgeColor="bg-accentBlue"
                        file={backFile}
                        url={form.backReferenceUrl}
                        onFileChange={setBackFile}
                        onUrlChange={(url) => setForm((p) => ({ ...p, backReferenceUrl: url }))}
                      />
                    </div>
                  </FormStep>
                )}

                {currentStep === 3 && (
                  <FormStep title="Ek Özellikler" description="Görseli geliştirmek için ek bilgiler (opsiyonel)">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Select
                        label="Vücut Tipi"
                        value={form.bodyType}
                        onChange={(e) => setForm((p) => ({ ...p, bodyType: e.target.value }))}
                        options={[
                          { value: 'slim', label: 'İnce' },
                          { value: 'normal', label: 'Normal' },
                          { value: 'athletic', label: 'Atletik' },
                          { value: 'curvy', label: 'Dolgun' },
                        ]}
                        placeholder="Seçiniz..."
                      />

                      <Select
                        label="Ten Tonu"
                        value={form.skinTone}
                        onChange={(e) => setForm((p) => ({ ...p, skinTone: e.target.value }))}
                        options={[
                          { value: 'fair', label: 'Açık' },
                          { value: 'medium', label: 'Orta' },
                          { value: 'tan', label: 'Esmer' },
                          { value: 'dark', label: 'Koyu' },
                        ]}
                        placeholder="Seçiniz..."
                      />

                      <Select
                        label="Yaş Aralığı"
                        value={form.ageRange}
                        onChange={(e) => setForm((p) => ({ ...p, ageRange: e.target.value }))}
                        options={[
                          { value: '18-25', label: '18-25' },
                          { value: '26-35', label: '26-35' },
                          { value: '36-45', label: '36-45' },
                          { value: '46+', label: '46+' },
                        ]}
                        placeholder="Seçiniz..."
                      />
                    </div>
                  </FormStep>
                )}

                {currentStep === 4 && (
                  <FormStep title="Stil Notları" description="Stil ve görünüm detayları (opsiyonel)">
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-textMuted space-y-2">
                        Stil Notu
                        <textarea
                          value={form.stylePrompt}
                          onChange={(e) => setForm((p) => ({ ...p, stylePrompt: e.target.value }))}
                          className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary transition-all h-24"
                          placeholder="Örn: Minimalist, şık, zarif..."
                        />
                      </label>
                    </div>
                  </FormStep>
                )}
              </>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex gap-3">
                {modelType && (
                  <button
                    type="button"
                    onClick={() => {
                      setModelType(null);
                      setCurrentStep(1);
                    }}
                    className="px-6 py-3 rounded-lg bg-surface border border-border text-white hover:border-primary transition-all"
                  >
                    ← Tip Değiştir
                  </button>
                )}

                {currentStep > 1 && (modelType === 'TEXT_ONLY' || modelType === 'HYBRID') && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((p) => p - 1)}
                    className="px-6 py-3 rounded-lg bg-surface border border-border text-white hover:border-primary transition-all"
                  >
                    ← Geri
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                {(modelType === 'TEXT_ONLY' || modelType === 'HYBRID') && currentStep < getSteps().length && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((p) => p + 1)}
                    disabled={!canProceed()}
                    className="px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    İleri →
                  </button>
                )}

                {(modelType === 'IMAGE_REFERENCE' ||
                  (modelType === 'TEXT_ONLY' && currentStep === 4) ||
                  (modelType === 'HYBRID' && currentStep === 4)) && (
                    <button
                      type="submit"
                      disabled={saving || !canProceed()}
                      className="px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-accentBlue text-white font-bold hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                    >
                      {saving ? "⏳ Oluşturuluyor..." : "✨ Profili Oluştur"}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

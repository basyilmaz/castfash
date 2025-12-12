"use client";

import { useEffect, useState } from "react";
import { AppCard } from "../ui/AppCard";
import { AppInput } from "../ui/AppInput";
import { AppSelect } from "../ui/AppSelect";
import { AppButton } from "../ui/AppButton";
import { AppBadge } from "../ui/AppBadge";
import { createModelProfile, updateModelProfile, getModelProfile } from "@/lib/api/modelProfiles";
import { authStorage } from "@/lib/storage";
import { ModelProfile } from "@/types";

type Props = {
  profileId?: number;
  onSuccess?: (profile: ModelProfile) => void;
};

const types: Array<ModelProfile["type"]> = ["IMAGE_REFERENCE", "TEXT_ONLY", "HYBRID"];
const skinTones = ["", "fair", "light", "medium", "olive", "tan", "brown", "dark"];
const hairColors = ["", "blonde", "brown", "black", "red", "auburn", "ginger", "grey", "white"];
const hairStyles = [
  "",
  "long straight",
  "long wavy",
  "long curly",
  "short straight",
  "short wavy",
  "short curly",
  "bob cut",
  "ponytail",
  "bun",
];
const bodyTypes = ["", "slim", "athletic", "curvy", "average", "plus-size"];
const ageRanges = ["", "18-25", "20s", "30s", "40s", "50s+"];

export function ModelProfileForm({ profileId, onSuccess }: Props) {
  const [form, setForm] = useState<Partial<ModelProfile>>({
    name: "",
    type: "IMAGE_REFERENCE",
    frontImageUrl: "",
    backImageUrl: "",
    frontPrompt: "",
    backPrompt: "",
    skinTone: "",
    hairColor: "",
    hairStyle: "",
    bodyType: "",
    ageRange: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const type = form.type ?? "IMAGE_REFERENCE";

  useEffect(() => {
    const token = authStorage.token();
    if (!token || !profileId) return;
    getModelProfile(profileId.toString()).then((data) => {
      setForm({
        ...data,
        skinTone: data.skinTone ?? "",
        hairColor: data.hairColor ?? "",
        hairStyle: data.hairStyle ?? "",
        bodyType: data.bodyType ?? "",
        ageRange: data.ageRange ?? "",
      });
    });
  }, [profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name) {
      setError("Name is required");
      return;
    }
    const token = authStorage.token();
    if (!token) {
      setError("Session expired");
      return;
    }

    // simple validation per type
    if (type === "IMAGE_REFERENCE" && !form.frontImageUrl) {
      setError("Front image is required for image reference profiles.");
      return;
    }
    if (type === "TEXT_ONLY" && !form.frontPrompt) {
      setError("Prompt is required for text-only profiles.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        type,
        frontImageUrl: form.frontImageUrl || null,
        backImageUrl: form.backImageUrl || null,
        frontPrompt: form.frontPrompt || null,
        backPrompt: form.backPrompt || null,
        skinTone: form.skinTone || null,
        hairColor: form.hairColor || null,
        hairStyle: form.hairStyle || null,
        bodyType: form.bodyType || null,
        ageRange: form.ageRange || null,
      };
      const saved = profileId
        ? await updateModelProfile(profileId.toString(), payload)
        : await createModelProfile(payload);
      onSuccess?.(saved);
    } catch (err: any) {
      setError(err.message ?? "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AppCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Model metadata</p>
            <p className="text-lg text-white font-semibold">{profileId ? "Edit model profile" : "Create model profile"}</p>
          </div>
          <AppBadge>{profileId ? "Edit" : "New"}</AppBadge>
        </div>

        <AppInput
          label="Name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
        <AppSelect
          label="Type"
          value={type}
          onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as any }))}
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </AppSelect>

        <div className="grid md:grid-cols-2 gap-3">
          <AppInput
            label="Front image URL"
            value={form.frontImageUrl ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, frontImageUrl: e.target.value }))}
            required={type === "IMAGE_REFERENCE"}
          />
          <AppInput
            label="Back image URL"
            value={form.backImageUrl ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, backImageUrl: e.target.value }))}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <AppInput
            label="Front prompt"
            value={form.frontPrompt ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, frontPrompt: e.target.value }))}
            required={type === "TEXT_ONLY"}
          />
          <AppInput
            label="Back prompt"
            value={form.backPrompt ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, backPrompt: e.target.value }))}
          />
        </div>

        <AppCard className="p-4 space-y-3 border-white/10 bg-white/5">
          <div>
            <p className="text-sm text-slate-200">Model Özelleştirme (opsiyonel)</p>
            <p className="text-xs text-slate-400">
              Görünüm özellikleri isteğe bağlıdır; doldurursanız model kimliğinin daha tutarlı olmasına yardımcı olur.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <AppSelect
              label="Yaş aralığı"
              value={form.ageRange ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, ageRange: e.target.value }))}
            >
              {ageRanges.map((a) => (
                <option key={a} value={a}>
                  {a || "Seçiniz (opsiyonel)"}
                </option>
              ))}
            </AppSelect>
            <AppSelect
              label="Ten rengi"
              value={form.skinTone ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, skinTone: e.target.value }))}
            >
              {skinTones.map((s) => (
                <option key={s} value={s}>
                  {s || "Seçiniz (opsiyonel)"}
                </option>
              ))}
            </AppSelect>
            <AppSelect
              label="Vücut tipi"
              value={form.bodyType ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, bodyType: e.target.value }))}
            >
              {bodyTypes.map((b) => (
                <option key={b} value={b}>
                  {b || "Seçiniz (opsiyonel)"}
                </option>
              ))}
            </AppSelect>
            <AppSelect
              label="Saç rengi"
              value={form.hairColor ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, hairColor: e.target.value }))}
            >
              {hairColors.map((h) => (
                <option key={h} value={h}>
                  {h || "Seçiniz (opsiyonel)"}
                </option>
              ))}
            </AppSelect>
            <AppSelect
              label="Saç stili"
              value={form.hairStyle ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, hairStyle: e.target.value }))}
            >
              {hairStyles.map((h) => (
                <option key={h} value={h}>
                  {h || "Seçiniz (opsiyonel)"}
                </option>
              ))}
            </AppSelect>
          </div>
          <div className="text-xs text-slate-400">
            Önizleme:{" "}
            {[form.ageRange, form.skinTone, form.bodyType, [form.hairStyle, form.hairColor].filter(Boolean).join(" ")]
              .filter(Boolean)
              .join(", ") || "—"}
          </div>
        </AppCard>

        <AppButton type="submit" disabled={loading}>
          {loading ? "Saving..." : profileId ? "Update profile" : "Create profile"}
        </AppButton>
        {error && <p className="text-xs text-rose-300">{error}</p>}
      </AppCard>
    </form>
  );
}

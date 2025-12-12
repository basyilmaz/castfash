"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppButton } from "@/components/ui/AppButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { createScenePack } from "@/lib/api/admin";
import { authStorage } from "@/lib/storage";

const categoryOptions = ["studio", "beach", "pool", "indoor", "outdoor", "urban", "minimal", "luxury"];

export default function NewScenePackPage() {
  const router = useRouter();
  const token = useMemo(() => authStorage.token(), []);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    category: "",
    tags: "",
    isPublic: true,
    isPremium: false
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    if (!form.name || !form.slug) {
      setError("Ad ve slug gereklidir.");
      return;
    }
    setLoading(true);
    try {
      const created = await createScenePack(form);
      router.push(`/scene-packs/${created.slug || created.id}`);
    } catch (err: any) {
      setError(err?.message ?? "Paket oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Yeni Sahne Paketi"
        subtitle="Paket bilgilerini doldurun."
        actions={
          <AppButton variant="ghost" onClick={() => router.push("/scene-packs")}>
            Geri
          </AppButton>
        }
      />

      <form onSubmit={handleSubmit}>
        <AppCard className="p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <AppInput
              label="Paket adı"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  name: e.target.value,
                  slug: p.slug || e.target.value.toLowerCase().replace(/\s+/g, "-")
                }))
              }
              required
            />
            <AppInput
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              required
            />
            <AppInput
              label="Açıklama"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <AppSelect
              label="Kategori"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            >
              <option value="">Seçiniz</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </AppSelect>
            <AppInput
              label="Etiketler"
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              hint="Virgülle ayırın"
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))}
                />
                Public
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={form.isPremium}
                  onChange={(e) => setForm((p) => ({ ...p, isPremium: e.target.checked }))}
                />
                Premium
              </label>
            </div>
          </div>
          {error && <p className="text-xs text-rose-300">{error}</p>}
          <AppButton type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </AppButton>
        </AppCard>
      </form>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, listCategories, type CreateProductInput } from "@/lib/api/products";
import type { ProductCategory } from "@/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Select } from "@/components/ui/Select";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [form, setForm] = useState({
    name: "",
    categoryId: 0,
    sku: "",
    productImageUrl: "",
    productBackImageUrl: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((err) => setError(err?.message || "Kategoriler yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.categoryId || form.categoryId === 0) {
      setError("Lütfen bir kategori seçin.");
      return;
    }

    if (!file && !form.productImageUrl) {
      setError("Lütfen bir ön görsel dosyası yükleyin veya URL girin.");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateProductInput = {
        name: form.name,
        categoryId: Number(form.categoryId),
        sku: form.sku || undefined,
        productImageUrl: form.productImageUrl || undefined,
        productBackImageUrl: form.productBackImageUrl || undefined,
        file: file || undefined,
        backFile: backFile || undefined,
      };

      await createProduct(payload);
      toast.success("Ürün başarıyla oluşturuldu!");
      router.push("/products");
    } catch (err: any) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to create product";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400 px-6 py-10">Yükleniyor...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader eyebrow="Katalog" title="Yeni ürün ekle" description="Ürün bilgilerini doldurun ve kaydedin." />
        <button className="text-sm text-gray-400 hover:text-white transition-colors" onClick={() => router.push("/products")}>
          Listeye dön
        </button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-8 shadow-xl space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block text-sm font-medium text-textMuted space-y-2">
            Ürün Adı
            <input
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryDark transition-all"
              placeholder="Örn: Yazlık Elbise"
            />
          </label>
          <Select
            label="Kategori"
            required
            value={form.categoryId}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: Number(e.target.value) }))}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Seçiniz..."
          />
          <label className="block text-sm font-medium text-textMuted space-y-2">
            SKU (Stok Kodu)
            <input
              value={form.sku}
              onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
              className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryDark transition-all"
              placeholder="Örn: ELB-001"
            />
          </label>

          <div className="hidden md:block"></div>

          {/* Ön Görsel */}
          <div className="col-span-2 space-y-4 border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-white">Ön Görsel</h3>

            <div className="grid gap-6 md:grid-cols-2 items-start">
              <label className="block text-sm font-medium text-textMuted space-y-2">
                Dosya Yükle
                <div className="relative group cursor-pointer">
                  <div className={`w-full h-32 rounded-lg border-2 border-dashed ${file ? 'border-primaryDark bg-primaryDark/10' : 'border-border bg-surface group-hover:border-textMuted'} flex flex-col items-center justify-center transition-all`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {file ? (
                      <div className="text-center p-2">
                        <p className="text-primaryDark text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-textSecondary text-xs">Değiştirmek için tıklayın</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mt-1 text-sm text-textSecondary">Dosya seçin</p>
                      </div>
                    )}
                  </div>
                </div>
              </label>

              <div className="flex flex-col justify-center h-full">
                <label className="block text-sm font-medium text-textMuted space-y-2">
                  Veya URL Girin
                  <input
                    value={form.productImageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, productImageUrl: e.target.value }))}
                    className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryDark transition-all"
                    placeholder="https://..."
                    disabled={!!file}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Arka Görsel */}
          <div className="col-span-2 space-y-4 border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-white">Arka Görsel (Opsiyonel)</h3>

            <div className="grid gap-6 md:grid-cols-2 items-start">
              <label className="block text-sm font-medium text-textMuted space-y-2">
                Dosya Yükle
                <div className="relative group cursor-pointer">
                  <div className={`w-full h-32 rounded-lg border-2 border-dashed ${backFile ? 'border-primaryDark bg-primaryDark/10' : 'border-border bg-surface group-hover:border-textMuted'} flex flex-col items-center justify-center transition-all`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {backFile ? (
                      <div className="text-center p-2">
                        <p className="text-primaryDark text-sm font-medium truncate max-w-[200px]">{backFile.name}</p>
                        <p className="text-textSecondary text-xs">Değiştirmek için tıklayın</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mt-1 text-sm text-textSecondary">Dosya seçin</p>
                      </div>
                    )}
                  </div>
                </div>
              </label>

              <div className="flex flex-col justify-center h-full">
                <label className="block text-sm font-medium text-textMuted space-y-2">
                  Veya URL Girin
                  <input
                    value={form.productBackImageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, productBackImageUrl: e.target.value }))}
                    className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryDark transition-all"
                    placeholder="https://..."
                    disabled={!!backFile}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </p>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto rounded-full bg-primaryDark px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-white hover:text-primaryDark transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Kaydediliyor..." : "Ürünü Oluştur"}
          </button>
        </div>
      </form>
    </div>
  );
}

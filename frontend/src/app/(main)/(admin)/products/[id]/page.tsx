"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct, updateProduct, listCategories, listProducts } from "@/lib/api/products";
import type { Product, ProductCategory } from "@/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppButton } from "@/components/ui/AppButton";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevId, setPrevId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    categoryId: 0,
    sku: "",
    productImageUrl: "",
    productBackImageUrl: "",
  });
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  // AI Generation State
  const [showAiPrompt, setShowAiPrompt] = useState<'FRONT' | 'BACK' | null>(null);
  const [aiPromptText, setAiPromptText] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Import dynamically to avoid circular dependency issues if any
  const { generateProductImage } = require("@/lib/api/products");

  const handleAiGenerate = async () => {
    if (!showAiPrompt || !product) return;

    setGeneratingAi(true);
    try {
      const res = await generateProductImage(product.id, aiPromptText, showAiPrompt);

      // Update local state with generated image
      if (showAiPrompt === 'FRONT') {
        setProduct({ ...product, productImageUrl: res.imageUrl });
        setForm(p => ({ ...p, productImageUrl: res.imageUrl }));
      } else {
        setProduct({ ...product, productBackImageUrl: res.imageUrl });
        setForm(p => ({ ...p, productBackImageUrl: res.imageUrl }));
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
        const [productData, cats, allProducts] = await Promise.all([
          getProduct(id),
          listCategories(),
          listProducts()
        ]);
        setProduct(productData);

        // Find prev/next
        const currentIndex = allProducts.findIndex(p => p.id === Number(id));
        if (currentIndex !== -1) {
          setPrevId(currentIndex > 0 ? String(allProducts[currentIndex - 1].id) : null);
          setNextId(currentIndex < allProducts.length - 1 ? String(allProducts[currentIndex + 1].id) : null);
        }
        setCategories(cats);
        setForm({
          name: productData.name,
          categoryId: productData.categoryId,
          sku: productData.sku || "",
          productImageUrl: productData.productImageUrl || "",
          productBackImageUrl: productData.productBackImageUrl || "",
        });
      } catch (err: any) {
        setError(err?.message || "Ürün yüklenemedi");
        toast.error("Ürün yüklenemedi");
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
      await updateProduct(id, {
        name: form.name,
        categoryId: form.categoryId,
        sku: form.sku || undefined,
        productImageUrl: form.productImageUrl || undefined,
        productBackImageUrl: form.productBackImageUrl || undefined,
        file: frontFile || undefined,
        backFile: backFile || undefined,
      });
      toast.success("Ürün güncellendi!");
      router.push("/products");
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

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-textMuted text-lg">Ürün bulunamadı.</div>
        <AppButton onClick={() => router.push("/products")}>
          Listeye Dön
        </AppButton>
      </div>
    );
  }

  const categoryName = categories.find(c => c.id === product.categoryId)?.name || "Bilinmiyor";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SectionHeader
          eyebrow="Ürün"
          title={product.name}
          description={`${categoryName} • SKU: ${product.sku || "-"}`}
        />
        <div className="flex items-center gap-3">
          <AppButton
            onClick={() => router.push(`/generations/new?productId=${id}`)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            ✨ Görsel Üret
          </AppButton>
          <button
            className="text-sm text-textSecondary hover:text-white transition-colors"
            onClick={() => router.push("/products")}
          >
            ← Listeye dön
          </button>
          <div className="flex items-center gap-1 border-l border-border pl-3">
            <AppButton
              variant="ghost"
              disabled={!prevId}
              onClick={() => prevId && router.push(`/products/${prevId}`)}
            >
              ← Önceki
            </AppButton>
            <AppButton
              variant="ghost"
              disabled={!nextId}
              onClick={() => nextId && router.push(`/products/${nextId}`)}
            >
              Sonraki →
            </AppButton>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Images */}
        <div className="lg:col-span-1 space-y-4">
          <AppCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ürün Görselleri</h3>

            {/* Front Image */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-sm text-textMuted">Ön Görsel</label>
                <button
                  type="button"
                  onClick={() => setShowAiPrompt('FRONT')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  ✨ AI ile Üret (1 Token)
                </button>
              </div>

              {(product.productImageUrl || frontFile) ? (
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-surface border border-border group">
                  <img
                    src={frontFile ? URL.createObjectURL(frontFile) : product.productImageUrl!}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition" title="Yükle">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      📁
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAiPrompt('FRONT')}
                      className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-full text-purple-300 transition"
                      title="AI ile Yeniden Üret"
                    >
                      ✨
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] rounded-lg bg-surface border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 p-4">
                  <span className="text-textSecondary text-sm">Görsel yok</span>
                  <div className="flex gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-surfaceAlt hover:bg-surface border border-border rounded text-xs text-textMuted transition">
                      📁 Yükle
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAiPrompt('FRONT')}
                      className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 transition"
                    >
                      ✨ AI Üret
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Back Image */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-textMuted">Arka Görsel</label>
                <button
                  type="button"
                  onClick={() => setShowAiPrompt('BACK')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  ✨ AI ile Üret (1 Token)
                </button>
              </div>

              {(product.productBackImageUrl || backFile) ? (
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-surface border border-border group">
                  <img
                    src={backFile ? URL.createObjectURL(backFile) : product.productBackImageUrl!}
                    alt={`${product.name} - Arka`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition" title="Yükle">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      📁
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAiPrompt('BACK')}
                      className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-full text-purple-300 transition"
                      title="AI ile Yeniden Üret"
                    >
                      ✨
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] rounded-lg bg-surface border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 p-4">
                  <span className="text-textSecondary text-sm">Görsel yok</span>
                  <div className="flex gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-surfaceAlt hover:bg-surface border border-border rounded text-xs text-textMuted transition">
                      📁 Yükle
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAiPrompt('BACK')}
                      className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 transition"
                    >
                      ✨ AI Üret
                    </button>
                  </div>
                </div>
              )}
            </div>
          </AppCard>

          {/* AI Prompt Modal */}
          {showAiPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-white">
                    {showAiPrompt === 'FRONT' ? 'Ön' : 'Arka'} Görsel Üret
                  </h3>
                  <button onClick={() => setShowAiPrompt(null)} className="text-textMuted hover:text-white">✕</button>
                </div>

                <p className="text-sm text-textSecondary">
                  Ürününüzü tarif edin. AI bunu profesyonel bir ürün fotoğrafına dönüştürecek.
                  <br />
                  <span className="text-purple-400 text-xs mt-1 block">Maliyet: 1 Token</span>
                </p>

                <textarea
                  value={aiPromptText}
                  onChange={(e) => setAiPromptText(e.target.value)}
                  placeholder={`Örn: ${product.name}, beyaz arka plan, stüdyo ışığı...`}
                  className="w-full h-32 bg-surfaceAlt border border-border rounded-lg p-3 text-sm text-white focus:border-purple-500 transition resize-none"
                  autoFocus
                />

                <div className="flex gap-3 justify-end">
                  <AppButton variant="ghost" onClick={() => setShowAiPrompt(null)} disabled={generatingAi}>
                    İptal
                  </AppButton>
                  <AppButton
                    onClick={handleAiGenerate}
                    disabled={!aiPromptText.trim() || generatingAi}
                    className="bg-purple-600 hover:bg-purple-500"
                  >
                    {generatingAi ? "Üretiliyor..." : "✨ Üret"}
                  </AppButton>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2">
          <AppCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Ürün Bilgileri</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <AppInput
                    label="Ürün Adı"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                  <AppSelect
                    label="Kategori"
                    value={form.categoryId}
                    onChange={(e) => setForm((p) => ({ ...p, categoryId: Number(e.target.value) }))}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </AppSelect>
                  <AppInput
                    label="SKU"
                    value={form.sku}
                    onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                    placeholder="Opsiyonel"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Görsel URL'leri</h3>
                <div className="grid gap-4">
                  <AppInput
                    label="Ön Görsel URL"
                    value={form.productImageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, productImageUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                  <AppInput
                    label="Arka Görsel URL"
                    value={form.productBackImageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, productBackImageUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <AppButton type="submit" disabled={saving} fullWidth={false}>
                  {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </AppButton>
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/products")}
                  fullWidth={false}
                >
                  İptal
                </AppButton>
              </div>
            </form>
          </AppCard>
        </div>
      </div>
    </div>
  );
}

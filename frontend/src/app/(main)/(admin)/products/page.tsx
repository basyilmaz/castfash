"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listProducts, listCategories } from "@/lib/api/products";
import type { Product, ProductCategory } from "@/types";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [cats, prods] = await Promise.all([listCategories(), listProducts()]);
        setCategories(cats);
        setProducts(prods);
      } catch (err: any) {
        setError(err?.message || "Ürünler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categoryName = (product: Product) => {
    if (product.category && "name" in product.category) return product.category.name;
    if (product.categoryId) {
      const c = categories.find((cat) => cat.id === product.categoryId);
      if (c) return c.name;
    }
    return "Bilinmiyor";
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader eyebrow="Katalog" title="Ürünler" description="Castfash ürün kütüphanenizi yönetin." />
        <button
          onClick={() => router.push("/products/new")}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-surface hover:-translate-y-0.5 transition"
        >
          Yeni ürün ekle
        </button>
      </div>

      {loading && <div className="text-textMuted text-sm">Ürünler yükleniyor...</div>}
      {error && <div className="text-sm text-red-400">{error}</div>}

      {!loading && !error && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-visible">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surfaceAlt/60 text-xs uppercase text-textSecondary tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Ad</th>
                  <th className="px-4 py-3 text-left">Kategori</th>
                  <th className="px-4 py-3 text-left">Oluşturma</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-primaryDark/10 hover:border-l-4 hover:border-l-primaryDark transition cursor-pointer group"
                    onClick={() => router.push(`/products/${p.id}`)}
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    <td className="px-4 py-3 text-white font-medium group-hover:text-primaryDark">
                      <div className="relative inline-block">
                        {p.name}
                        {/* Hover Preview - Enhanced */}
                        {(p.productImageUrl || p.productBackImageUrl) && (
                          <div
                            className="fixed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none transform group-hover:scale-100 scale-95"
                            style={{
                              zIndex: 9999,
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                          >
                            <div className="bg-card border-2 border-primary rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in duration-300">
                              <div className="flex gap-3">
                                {/* Front Image */}
                                {p.productImageUrl && (
                                  <div className="relative group/img">
                                    <div className="absolute -top-2 -left-2 bg-primary text-black text-xs px-2 py-0.5 rounded-full font-bold z-10">
                                      ÖN
                                    </div>
                                    <img
                                      src={p.productImageUrl}
                                      alt={`${p.name} - Ön`}
                                      className="w-48 h-64 object-cover rounded-lg transition-transform duration-300 group-hover/img:scale-105"
                                    />
                                  </div>
                                )}
                                {/* Back Image */}
                                {p.productBackImageUrl && (
                                  <div className="relative group/img">
                                    <div className="absolute -top-2 -left-2 bg-accentBlue text-black text-xs px-2 py-0.5 rounded-full font-bold z-10">
                                      ARKA
                                    </div>
                                    <img
                                      src={p.productBackImageUrl}
                                      alt={`${p.name} - Arka`}
                                      className="w-48 h-64 object-cover rounded-lg transition-transform duration-300 group-hover/img:scale-105"
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="mt-3 text-center">
                                <div className="text-sm font-semibold text-white">{p.name}</div>
                                <div className="text-xs text-textMuted mt-1">{categoryName(p)}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-textMuted">{categoryName(p)}</td>
                    <td className="px-4 py-3 text-textSecondary">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/generations/new?productId=${p.id}`);
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-purple-500/50"
                      >
                        ✨ Üret
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-textMuted" colSpan={4}>
                      Henüz ürün eklenmedi. İlk ürününüzü ekleyin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

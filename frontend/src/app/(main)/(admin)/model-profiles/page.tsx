"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { listModelProfiles } from "@/lib/api/modelProfiles";
import type { ModelProfile } from "@/types";

export default function ModelProfilesPage() {
  const router = useRouter();
  const [items, setItems] = useState<ModelProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listModelProfiles()
      .then(setItems)
      .catch((err) => setError(err?.message || "Model profilleri yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader
          eyebrow="Katalog"
          title="Model profilleri"
          description="Markanıza uygun modelleri yönetin ve üretimlerde kullanın."
        />
        <button
          onClick={() => router.push("/model-profiles/new")}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-surface hover:-translate-y-0.5 transition"
        >
          Yeni model profili
        </button>
      </div>

      {loading && <div className="text-textMuted text-sm">Yükleniyor...</div>}
      {error && <div className="text-sm text-red-400">{error}</div>}

      {!loading && !error && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-visible">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surfaceAlt/60 text-xs uppercase text-textSecondary tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Ad</th>
                  <th className="px-4 py-3 text-left">Cinsiyet</th>
                  <th className="px-4 py-3 text-left">Referanslar</th>
                  <th className="px-4 py-3 text-left">Oluşturma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-primaryDark/10 hover:border-l-4 hover:border-l-primaryDark transition cursor-pointer group"
                    onClick={() => router.push(`/model-profiles/${m.id}`)}
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    <td className="px-4 py-3 text-white font-medium group-hover:text-primaryDark">
                      <div className="relative inline-block">
                        {m.name}
                        {/* Hover Preview - Enhanced */}
                        {(m.faceReferenceUrl || m.backReferenceUrl) && (
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
                                {/* Face Reference */}
                                {m.faceReferenceUrl && (
                                  <div className="relative group/img">
                                    <div className="absolute -top-2 -left-2 bg-primary text-black text-xs px-2 py-0.5 rounded-full font-bold z-10">
                                      YÜZ
                                    </div>
                                    <img
                                      src={m.faceReferenceUrl}
                                      alt={`${m.name} - Yüz`}
                                      className="w-48 h-64 object-cover rounded-lg transition-transform duration-300 group-hover/img:scale-105"
                                    />
                                  </div>
                                )}
                                {/* Back Reference */}
                                {m.backReferenceUrl && (
                                  <div className="relative group/img">
                                    <div className="absolute -top-2 -left-2 bg-accentBlue text-black text-xs px-2 py-0.5 rounded-full font-bold z-10">
                                      ARKA
                                    </div>
                                    <img
                                      src={m.backReferenceUrl}
                                      alt={`${m.name} - Arka`}
                                      className="w-48 h-64 object-cover rounded-lg transition-transform duration-300 group-hover/img:scale-105"
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="mt-3 text-center">
                                <div className="text-sm font-semibold text-white">{m.name}</div>
                                <div className="text-xs text-textMuted mt-1">
                                  {m.gender === 'FEMALE' ? '👩 Kadın' : '👨 Erkek'} • {m.modelType || 'IMAGE_REFERENCE'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-textMuted">{m.gender}</td>
                    <td className="px-4 py-3 text-textSecondary">
                      {m.faceReferenceUrl ? "Ön" : "-"} / {m.backReferenceUrl ? "Arka" : "-"}
                    </td>
                    <td className="px-4 py-3 text-textSecondary">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-textMuted" colSpan={4}>
                      Henüz model profili eklenmemiş. İlk profilinizi ekleyin.
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

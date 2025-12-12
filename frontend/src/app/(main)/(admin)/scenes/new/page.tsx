"use client";

import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SceneForm } from "@/components/admin/SceneForm";

export default function NewScenePage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-6">
      <SectionHeader
        eyebrow="Yeni Sahne"
        title="Sahne Ön Ayarı Oluştur"
        description="Arka plan, ışıklandırma ve kalite ayarlarını tanımlayın"
      />

      <div className="flex justify-end mb-4">
        <button
          onClick={() => router.push("/scenes")}
          className="text-sm text-textSecondary hover:text-white transition-colors"
          type="button"
        >
          ← Listeye dön
        </button>
      </div>

      <SceneForm onSuccess={(scene) => router.push(`/scenes/${scene.id}`)} />
    </div>
  );
}

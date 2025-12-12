"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SceneForm } from "@/components/admin/SceneForm";

export default function EditScenePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sceneId = Number(params?.id);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Edit scene"
        subtitle="Update scene background, mood, and quality."
        actions={
          <button
            onClick={() => router.push("/scenes")}
            className="text-sm text-sky-200 underline"
            type="button"
          >
            Back to list
          </button>
        }
      />
      {!Number.isNaN(sceneId) && <SceneForm sceneId={sceneId} onSuccess={(scene) => router.push(`/scenes/${scene.id}`)} />}
    </div>
  );
}

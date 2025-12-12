"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ModelProfileForm } from "@/components/admin/ModelProfileForm";

export default function EditModelProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const profileId = Number(params?.id);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Edit model profile"
        subtitle="Update references or prompts."
        actions={
          <button onClick={() => router.push("/model-profiles")} className="text-sm text-sky-200 underline" type="button">
            Back to list
          </button>
        }
      />
      {!Number.isNaN(profileId) && (
        <ModelProfileForm profileId={profileId} onSuccess={(p) => router.push(`/model-profiles/${p.id}`)} />
      )}
    </div>
  );
}

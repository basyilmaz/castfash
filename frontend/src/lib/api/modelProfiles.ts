import { apiFetch } from "./http";
import type { ModelProfile, Gender } from "@/types";

export interface UpsertModelProfileInput {
  name: string;
  gender: Gender;
  bodyType?: string | null;
  skinTone?: string | null;
  faceReferenceUrl?: string | null;
  backReferenceUrl?: string | null;
  modelType?: "IMAGE_REFERENCE" | "TEXT_ONLY" | "HYBRID";
  hairColor?: string | null;
  hairStyle?: string | null;
  ageRange?: string | null;
  frontPrompt?: string | null;
  backPrompt?: string | null;
  stylePrompt?: string | null;
  faceFile?: File;
  backFile?: File;
}

export async function listModelProfiles(): Promise<ModelProfile[]> {
  return apiFetch<ModelProfile[]>("/model-profiles");
}

export async function getModelProfile(id: string): Promise<ModelProfile> {
  return apiFetch<ModelProfile>(`/model-profiles/${id}`);
}

export async function createModelProfile(data: UpsertModelProfileInput): Promise<ModelProfile> {
  if (data.faceFile || data.backFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'faceFile' && key !== 'backFile') {
        formData.append(key, String(value));
      }
    });
    if (data.faceFile) formData.append("faceFile", data.faceFile);
    if (data.backFile) formData.append("backFile", data.backFile);

    return apiFetch<ModelProfile>("/model-profiles", {
      method: "POST",
      body: formData,
    });
  }

  return apiFetch<ModelProfile>("/model-profiles", {
    method: "POST",
    body: data,
  });
}

export async function updateModelProfile(id: string, data: UpsertModelProfileInput): Promise<ModelProfile> {
  if (data.faceFile || data.backFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'faceFile' && key !== 'backFile') {
        formData.append(key, String(value));
      }
    });
    if (data.faceFile) formData.append("faceFile", data.faceFile);
    if (data.backFile) formData.append("backFile", data.backFile);

    return apiFetch<ModelProfile>(`/model-profiles/${id}`, {
      method: "PUT",
      body: formData,
    });
  }

  return apiFetch<ModelProfile>(`/model-profiles/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function generateReferenceImage(
  id: string,
  prompt: string,
  view: 'FACE' | 'BACK'
): Promise<{ imageUrl: string; tokensUsed: number }> {
  return apiFetch<{ imageUrl: string; tokensUsed: number }>(`/model-profiles/${id}/generate-reference`, {
    method: "POST",
    body: { prompt, view },
  });
}

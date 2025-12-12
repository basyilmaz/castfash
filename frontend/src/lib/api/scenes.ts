import { apiFetch } from "./http";
import type { ScenePreset, SceneType } from "@/types";

export interface UpsertSceneInput {
  name: string;
  type?: SceneType;
  backgroundReferenceUrl?: string | null;
  solidColorHex?: string | null;
  backgroundPrompt?: string | null;
  lighting?: string | null;
  mood?: string | null;
  suggestedAspectRatio?: string | null;
  qualityPreset?: string | null;
  category?: string | null;
  tags?: string | null;
  file?: File;
}

export async function listScenes(params?: { category?: string; q?: string }): Promise<ScenePreset[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.q) search.set("q", params.q);
  const qs = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<ScenePreset[]>(`/scenes${qs}`);
}

export async function getScene(id: string): Promise<ScenePreset> {
  return apiFetch<ScenePreset>(`/scenes/${id}`);
}

export async function createScene(data: UpsertSceneInput): Promise<ScenePreset> {
  const formData = new FormData();

  formData.append("name", data.name);
  if (data.type) formData.append("type", data.type);
  if (data.backgroundReferenceUrl) formData.append("backgroundReferenceUrl", data.backgroundReferenceUrl);
  if (data.solidColorHex) formData.append("solidColorHex", data.solidColorHex);
  if (data.backgroundPrompt) formData.append("backgroundPrompt", data.backgroundPrompt);
  if (data.lighting) formData.append("lighting", data.lighting);
  if (data.mood) formData.append("mood", data.mood);
  if (data.suggestedAspectRatio) formData.append("suggestedAspectRatio", data.suggestedAspectRatio);
  if (data.qualityPreset) formData.append("qualityPreset", data.qualityPreset);
  if (data.category) formData.append("category", data.category);
  if (data.tags) formData.append("tags", data.tags);
  if (data.file) formData.append("file", data.file);

  return apiFetch<ScenePreset>("/scenes", {
    method: "POST",
    body: formData,
  });
}

export async function updateScene(id: string, data: UpsertSceneInput): Promise<ScenePreset> {
  const formData = new FormData();

  formData.append("name", data.name);
  if (data.type) formData.append("type", data.type);
  if (data.backgroundReferenceUrl) formData.append("backgroundReferenceUrl", data.backgroundReferenceUrl);
  if (data.solidColorHex) formData.append("solidColorHex", data.solidColorHex);
  if (data.backgroundPrompt) formData.append("backgroundPrompt", data.backgroundPrompt);
  if (data.lighting) formData.append("lighting", data.lighting);
  if (data.mood) formData.append("mood", data.mood);
  if (data.suggestedAspectRatio) formData.append("suggestedAspectRatio", data.suggestedAspectRatio);
  if (data.qualityPreset) formData.append("qualityPreset", data.qualityPreset);
  if (data.category) formData.append("category", data.category);
  if (data.tags) formData.append("tags", data.tags);
  if (data.file) formData.append("file", data.file);

  return apiFetch<ScenePreset>(`/scenes/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export async function generateSceneBackground(
  id: string,
  prompt: string
): Promise<{ imageUrl: string; tokensUsed: number }> {
  return apiFetch<{ imageUrl: string; tokensUsed: number }>(`/scenes/${id}/generate-background`, {
    method: "POST",
    body: { prompt },
  });
}

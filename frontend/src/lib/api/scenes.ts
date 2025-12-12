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
  return apiFetch<ScenePreset>("/scenes", {
    method: "POST",
    body: data,
  });
}

export async function updateScene(id: string, data: UpsertSceneInput): Promise<ScenePreset> {
  return apiFetch<ScenePreset>(`/scenes/${id}`, {
    method: "PUT",
    body: data,
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

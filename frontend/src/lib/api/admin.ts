import { apiFetch } from "./http";
import { ScenePackDetail } from "@/types";

// System Config Types
interface SystemConfig {
  key: string;
  value: string | number | boolean | Record<string, unknown>;
  description?: string;
}

// Scene Pack Input Types
interface CreateScenePackInput {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  tags?: string;
  isPublic?: boolean;
  isPremium?: boolean;
}

interface UpdateScenePackInput {
  name?: string;
  slug?: string;
  description?: string | null;
  category?: string | null;
  tags?: string | null;
  isPublic?: boolean;
  isPremium?: boolean;
}

// Prompt Template Types
interface PromptTemplate {
  id: number;
  name: string;
  type: string;
  category: string | null;
  content: string;
  variables: Record<string, unknown>;
  isActive: boolean;
  priority: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface CreatePromptTemplateInput {
  name: string;
  type: string;
  category?: string;
  content: string;
  variables?: Record<string, unknown>;
  isActive?: boolean;
  priority?: number;
  tags?: string[];
}

interface UpdatePromptTemplateInput {
  name?: string;
  content?: string;
  isActive?: boolean;
  priority?: number;
}

// Prompt Preset Types
interface PromptPreset {
  id: number;
  name: string;
  description: string | null;
  scenePrompt: string | null;
  posePrompt: string | null;
  lightingPrompt: string | null;
  stylePrompt: string | null;
  negativePrompt: string | null;
  isActive: boolean;
  tags: string[];
  usageCount: number;
}

interface CreatePromptPresetInput {
  name: string;
  description?: string;
  scenePrompt?: string;
  posePrompt?: string;
  lightingPrompt?: string;
  stylePrompt?: string;
  negativePrompt?: string;
  isActive?: boolean;
  tags?: string[];
}

interface UpdatePromptPresetInput {
  name?: string;
  description?: string;
  scenePrompt?: string;
  posePrompt?: string;
  lightingPrompt?: string;
  stylePrompt?: string;
  negativePrompt?: string;
  isActive?: boolean;
  tags?: string[];
}

// System Config APIs
export async function getSystemConfig(key: string): Promise<SystemConfig> {
  return apiFetch<SystemConfig>(`/system-admin/config/${key}`);
}

export async function setSystemConfig(key: string, value: string | number | boolean | Record<string, unknown>, description?: string): Promise<SystemConfig> {
  return apiFetch<SystemConfig>("/system-admin/config", {
    method: "POST",
    body: { key, value, description },
  });
}

export async function getAllConfigs(): Promise<SystemConfig[]> {
  return apiFetch<SystemConfig[]>("/system-admin/config");
}

// Scene Preset APIs
export async function seedScenePresets(): Promise<{ created: number }> {
  return apiFetch<{ created: number }>("/scenes/seed-presets", { method: "POST" });
}

// Scene Pack APIs
export async function getScenePacks(): Promise<ScenePackDetail[]> {
  return apiFetch<ScenePackDetail[]>("/scene-packs");
}

export async function installScenePack(id: string): Promise<{ imported: number; skipped: number }> {
  return apiFetch<{ imported: number; skipped: number }>(`/scene-packs/${id}/install`, { method: "POST" });
}

export async function createScenePack(data: CreateScenePackInput): Promise<ScenePackDetail> {
  return apiFetch<ScenePackDetail>("/scene-packs", { method: "POST", body: data });
}

export async function getScenePack(id: string): Promise<ScenePackDetail> {
  return apiFetch<ScenePackDetail>(`/scene-packs/${id}`);
}

export async function updateScenePack(id: string, data: UpdateScenePackInput): Promise<ScenePackDetail> {
  return apiFetch<ScenePackDetail>(`/scene-packs/${id}`, { method: "PUT", body: data });
}

export async function deleteScenePack(id: string): Promise<void> {
  return apiFetch(`/scene-packs/${id}`, { method: "DELETE" });
}

// Prompt Template APIs
interface PromptTemplatesResponse {
  templates: PromptTemplate[];
}

export async function getPromptTemplates(filters?: { type?: string; category?: string; isActive?: boolean }): Promise<PromptTemplatesResponse> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  const query = params.toString();
  return apiFetch<PromptTemplatesResponse>(`/system-admin/prompts/templates${query ? `?${query}` : ''}`);
}

export async function getPromptTemplate(id: number): Promise<PromptTemplate> {
  return apiFetch<PromptTemplate>(`/system-admin/prompts/templates/${id}`);
}

export async function createPromptTemplate(data: CreatePromptTemplateInput): Promise<PromptTemplate> {
  return apiFetch<PromptTemplate>("/system-admin/prompts/templates", { method: "POST", body: data });
}

export async function updatePromptTemplate(id: number, data: UpdatePromptTemplateInput): Promise<PromptTemplate> {
  return apiFetch<PromptTemplate>(`/system-admin/prompts/templates/${id}`, { method: "PUT", body: data });
}

export async function deletePromptTemplate(id: number): Promise<void> {
  return apiFetch(`/system-admin/prompts/templates/${id}`, { method: "DELETE" });
}

// Prompt Preset APIs
interface PromptPresetsResponse {
  presets: PromptPreset[];
}

export async function getPromptPresets(filters?: { isActive?: boolean }): Promise<PromptPresetsResponse> {
  const params = new URLSearchParams();
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  const query = params.toString();
  return apiFetch<PromptPresetsResponse>(`/system-admin/prompts/presets${query ? `?${query}` : ''}`);
}

export async function getPromptPreset(id: number): Promise<PromptPreset> {
  return apiFetch<PromptPreset>(`/system-admin/prompts/presets/${id}`);
}

export async function createPromptPreset(data: CreatePromptPresetInput): Promise<PromptPreset> {
  return apiFetch<PromptPreset>("/system-admin/prompts/presets", { method: "POST", body: data });
}

export async function updatePromptPreset(id: number, data: UpdatePromptPresetInput): Promise<PromptPreset> {
  return apiFetch<PromptPreset>(`/system-admin/prompts/presets/${id}`, { method: "PUT", body: data });
}

export async function deletePromptPreset(id: number): Promise<void> {
  return apiFetch(`/system-admin/prompts/presets/${id}`, { method: "DELETE" });
}

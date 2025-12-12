import { apiFetch } from "./http";
import type { GenerationDetail, GenerationListItem, GeneratedImage } from "@/types";

export interface GenerationListResponse {
  items: GenerationListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface CreateGenerationRequestDto {
  modelProfileId: number;
  scenePresetId: number;
  frontCount: number;
  backCount: number;
  aspectRatio?: "9:16" | "16:9";
  resolution?: "1K" | "2K" | "4K";
  qualityMode?: "FAST" | "STANDARD" | "HIGH";
  customPromptFront?: string;
  customPromptBack?: string;
  cameraAngle?: string;
  shotType?: string;
  modelPose?: string;
  overridePromptFront?: string;
  overridePromptBack?: string;
}

export interface GenerationRunResult {
  id: number;
  productId: number;
  modelProfileId: number;
  scenePresetId: number;
  frontCount: number;
  backCount: number;
  generatedImages: GeneratedImage[];
  errors?: { front?: string; back?: string };
}

export async function listGenerations(): Promise<GenerationListResponse> {
  return apiFetch<GenerationListResponse>("/generations");
}

export async function getGeneration(id: string): Promise<GenerationDetail> {
  return apiFetch<GenerationDetail>(`/generations/${id}`);
}

export async function createGeneration(
  productId: string,
  body: CreateGenerationRequestDto,
): Promise<GenerationRunResult> {
  return apiFetch<GenerationRunResult>(`/products/${productId}/generate`, {
    method: "POST",
    body,
  });
}

export async function previewGenerationPrompt(
  productId: string,
  body: CreateGenerationRequestDto
): Promise<{ front?: string; back?: string }> {
  return apiFetch<{ front?: string; back?: string }>("/generations/preview-prompt", {
    method: "POST",
    body: { ...body, productId: Number(productId) },
  });
}

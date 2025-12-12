import { Product, ModelProfile, ScenePreset, Generation, GenerationDetail } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: object | FormData;
  token?: string | null;
};

interface AiProviderConfig {
  providerId: number;
  provider: string;
  isActive: boolean;
  priority: number;
}

interface OrganizationWithRole {
  organization: {
    id: number;
    name: string;
    remainingCredits: number;
    ownerId: number;
    createdAt: string;
    updatedAt: string;
  };
  role: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface GenerationsResponse {
  generations: Generation[];
  total: number;
  page: number;
  pageSize: number;
}

interface StatsSummary {
  productCount: number;
  generationCount: number;
  modelProfileCount: number;
  scenePresetCount: number;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const isFormData = options.body instanceof FormData;
  if (isFormData) {
    delete headers["Content-Type"];
  }

  // Prepare body - serialize objects to JSON string
  let requestBody: BodyInit | undefined;
  if (isFormData) {
    requestBody = options.body as FormData;
  } else if (options.body) {
    requestBody = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: requestBody,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API error");
  }

  return res.json() as Promise<T>;
}

export function getAiProviderConfig(token: string | null) {
  return apiFetch<AiProviderConfig[]>("/ai-providers/config", { token });
}

export function updateAiProviderConfig(token: string | null, data: Partial<AiProviderConfig>) {
  return apiFetch<AiProviderConfig>("/ai-providers/config", { method: "PUT", token, body: data });
}

export function getMyOrganizationWithRole(token: string | null) {
  return apiFetch<OrganizationWithRole>("/me/organization", { token });
}

export function getProductById(token: string, productId: number) {
  return apiFetch<Product>(`/products/${productId}`, { method: "GET", token });
}

export function getProducts(token: string) {
  return apiFetch<Product[]>("/products", { method: "GET", token });
}

export function getModelProfiles(token: string) {
  return apiFetch<ModelProfile[]>("/model-profiles", { method: "GET", token });
}

export function getScenes(token: string, params?: { category?: string; q?: string }) {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.q) search.set("q", params.q);
  const qs = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<ScenePreset[]>(`/scenes${qs}`, { method: "GET", token });
}

export function getCategories(token: string) {
  return apiFetch<Category[]>("/categories", { method: "GET", token });
}

export function generateProductImages(
  token: string,
  productId: number,
  body: {
    modelProfileId: number;
    scenePresetId: number;
    frontCount: number;
    backCount: number;
    aspectRatio?: "9:16" | "16:9";
    resolution?: "1K" | "2K" | "4K";
    qualityMode?: "FAST" | "STANDARD" | "HIGH";
  },
) {
  return apiFetch<Generation>(`/products/${productId}/generate`, {
    method: "POST",
    token,
    body: body,
  });
}

export function getGenerations(
  token: string,
  params: {
    productId?: number;
    modelProfileId?: number;
    scenePresetId?: number;
    hasError?: boolean;
    side?: "FRONT" | "BACK";
    page?: number;
    pageSize?: number;
  } = {},
) {
  const search = new URLSearchParams();
  if (params.productId) search.set("productId", String(params.productId));
  if (params.modelProfileId) search.set("modelProfileId", String(params.modelProfileId));
  if (params.scenePresetId) search.set("scenePresetId", String(params.scenePresetId));
  if (params.hasError) search.set("hasError", "true");
  if (params.side) search.set("side", params.side);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  const qs = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<GenerationsResponse>(`/generations${qs}`, { token });
}

export function getGenerationDetail(token: string, id: number) {
  return apiFetch<GenerationDetail>(`/generations/${id}`, { token });
}

export function createProduct(
  token: string,
  body: { name: string; categoryId: number; sku?: string; productImageUrl: string; productBackImageUrl?: string },
) {
  return apiFetch<Product>("/products", {
    method: "POST",
    token,
    body: body,
  });
}

export async function uploadFile(token: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Upload failed");
  }
  return res.json() as Promise<{ url: string }>;
}

export function getStatsSummary(token: string) {
  return apiFetch<StatsSummary>("/stats/summary", { token });
}

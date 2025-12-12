import { apiFetch } from "./http";
import type { Product, ProductCategory } from "@/types";

export interface CreateProductInput {
  name: string;
  categoryId: number;
  sku?: string | null;
  productImageUrl?: string;
  productBackImageUrl?: string | null;
  file?: File;
  backFile?: File;
}

export interface UpdateProductInput {
  name?: string;
  categoryId?: number;
  sku?: string | null;
  productImageUrl?: string | null;
  productBackImageUrl?: string | null;
  file?: File;
  backFile?: File;
}

export async function listCategories(): Promise<ProductCategory[]> {
  return apiFetch<ProductCategory[]>("/categories");
}

export async function listProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products");
}

export async function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  if (data.file || data.backFile) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("categoryId", data.categoryId.toString());
    if (data.sku) formData.append("sku", data.sku);
    if (data.productBackImageUrl) formData.append("productBackImageUrl", data.productBackImageUrl);
    if (data.file) formData.append("file", data.file);
    if (data.backFile) formData.append("backFile", data.backFile);

    return apiFetch<Product>("/products", {
      method: "POST",
      body: formData,
    });
  } else {
    if (!data.productImageUrl) {
      throw new Error("Product image URL or file is required");
    }
    return apiFetch<Product>("/products", {
      method: "POST",
      body: data,
    });
  }
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
  if (data.file || data.backFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'file' && key !== 'backFile') {
        formData.append(key, String(value));
      }
    });
    if (data.file) formData.append("file", data.file);
    if (data.backFile) formData.append("backFile", data.backFile);

    return apiFetch<Product>(`/products/${id}`, {
      method: "PATCH",
      body: formData,
    });
  }

  return apiFetch<Product>(`/products/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function generateProductImage(
  id: string,
  prompt: string,
  view: 'FRONT' | 'BACK'
): Promise<{ imageUrl: string; tokensUsed: number }> {
  return apiFetch<{ imageUrl: string; tokensUsed: number }>(`/products/${id}/generate-image`, {
    method: "POST",
    body: { prompt, view },
  });
}

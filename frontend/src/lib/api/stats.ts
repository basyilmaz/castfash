import { apiFetch } from "./http";

export interface StatsSummary {
  productsCount: number;
  generatedImagesCount: number;
}

export async function getSummaryStats(): Promise<StatsSummary> {
  return apiFetch<StatsSummary>("/stats/summary");
}

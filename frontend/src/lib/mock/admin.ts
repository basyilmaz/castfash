type Product = {
  id: number;
  name: string;
  category: string;
  productImageUrl: string;
  productBackImageUrl?: string | null;
  createdAt: string;
};

type Scene = {
  id: number;
  name: string;
  backgroundReferenceUrl: string;
  mood: string;
  lighting: string;
  aspect: string;
  qualityPreset: string;
  createdAt: string;
};

type ModelProfile = {
  id: number;
  name: string;
  type: "IMAGE_REFERENCE" | "TEXT_ONLY" | "HYBRID";
  frontImageUrl: string;
  backImageUrl: string;
  features: { age: string; skin: string; hair: string };
  createdAt: string;
};

type Generation = {
  id: string;
  productName: string;
  view: "front" | "back";
  imageUrl: string;
  createdAt: string;
};

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

const products: Product[] = [
  {
    id: 1,
    name: "Aqua Bloom Bikini",
    category: "Two-piece",
    productImageUrl:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=640&q=80",
    productBackImageUrl:
      "https://images.unsplash.com/photo-1542293779-7eec264c27ff?auto=format&fit=crop&w=640&q=80",
    createdAt: "2025-01-20T10:00:00Z"
  },
  {
    id: 2,
    name: "Coral Reef One-piece",
    category: "One-piece",
    productImageUrl:
      "https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=640&q=80",
    productBackImageUrl:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=640&q=80",
    createdAt: "2025-01-18T09:30:00Z"
  },
  {
    id: 3,
    name: "Midnight Tide Set",
    category: "Two-piece",
    productImageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&q=80",
    productBackImageUrl:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=640&q=80",
    createdAt: "2025-01-16T14:15:00Z"
  },
  {
    id: 4,
    name: "Luminous Lime",
    category: "Accessories",
    productImageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=640&q=80",
    productBackImageUrl: null,
    createdAt: "2025-01-14T12:00:00Z"
  }
];

const scenes: Scene[] = [
  {
    id: 1,
    name: "Studio Glow",
    backgroundReferenceUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    mood: "Soft glam",
    lighting: "Neon rim light",
    aspect: "4:5",
    qualityPreset: "high",
    createdAt: "2025-01-15T09:00:00Z"
  },
  {
    id: 2,
    name: "Sunset Cove",
    backgroundReferenceUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
    mood: "Golden hour",
    lighting: "Sunset warm",
    aspect: "3:4",
    qualityPreset: "ultra",
    createdAt: "2025-01-17T11:00:00Z"
  },
  {
    id: 3,
    name: "Palm Shade",
    backgroundReferenceUrl:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    mood: "Tropical calm",
    lighting: "Soft shadow",
    aspect: "1:1",
    qualityPreset: "standard",
    createdAt: "2025-01-12T13:45:00Z"
  }
];

const modelProfiles: ModelProfile[] = [
  {
    id: 1,
    name: "Aria Pose 02",
    type: "IMAGE_REFERENCE",
    frontImageUrl:
      "https://images.unsplash.com/photo-1542293787938-4d4f0b17b9b9?auto=format&fit=crop&w=640&q=80",
    backImageUrl:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=640&q=80",
    features: { age: "24", skin: "olive", hair: "dark brown" },
    createdAt: "2025-01-11T10:20:00Z"
  },
  {
    id: 2,
    name: "Nova Back",
    type: "HYBRID",
    frontImageUrl:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=640&q=80",
    backImageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=640&q=80",
    features: { age: "27", skin: "medium", hair: "chestnut" },
    createdAt: "2025-01-10T08:10:00Z"
  },
  {
    id: 3,
    name: "Luna Editorial",
    type: "TEXT_ONLY",
    frontImageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&q=80",
    backImageUrl:
      "https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=640&q=80",
    features: { age: "22", skin: "fair", hair: "blonde" },
    createdAt: "2025-01-09T07:50:00Z"
  }
];

const generations: Generation[] = [
  {
    id: "REQ-1452",
    productName: "Aqua Bloom Bikini",
    view: "front",
    imageUrl:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=640&q=80",
    createdAt: "2025-01-20T11:05:00Z"
  },
  {
    id: "REQ-1451",
    productName: "Neon Tide Set",
    view: "back",
    imageUrl:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=640&q=80",
    createdAt: "2025-01-20T10:45:00Z"
  },
  {
    id: "REQ-1449",
    productName: "Coral Reef One-piece",
    view: "front",
    imageUrl:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=640&q=80",
    createdAt: "2025-01-19T15:30:00Z"
  },
  {
    id: "REQ-1448",
    productName: "Midnight Tide Set",
    view: "back",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=640&q=80",
    createdAt: "2025-01-19T12:10:00Z"
  }
];

export async function fetchDashboardStats() {
  await delay();
  return {
    totalProducts: products.length,
    totalScenes: scenes.length,
    totalModelProfiles: modelProfiles.length,
    totalGenerations: generations.length + 138
  };
}

export async function fetchRecentProducts() {
  await delay();
  return products.slice(0, 3);
}

export async function fetchRecentGenerations() {
  await delay();
  return generations.slice(0, 4);
}

export async function fetchProducts() {
  await delay();
  return products;
}

export async function fetchProductById(id: number) {
  await delay();
  return products.find((p) => p.id === id) ?? null;
}

export async function fetchScenes() {
  await delay();
  return scenes;
}

export async function fetchSceneById(id: number) {
  await delay();
  return scenes.find((s) => s.id === id) ?? null;
}

export async function fetchModelProfiles() {
  await delay();
  return modelProfiles;
}

export async function fetchModelProfileById(id: number) {
  await delay();
  return modelProfiles.find((m) => m.id === id) ?? null;
}

export type { Product as MockProduct, Scene as MockScene, ModelProfile as MockModelProfile, Generation as MockGeneration };

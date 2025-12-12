export type Gender = "FEMALE" | "MALE";
export type SceneType = "PRESET" | "SOLID_COLOR";
export type GenerationStatus = "PENDING" | "DONE" | "ERROR";
export type ViewType = "FRONT" | "BACK";
export type AiProviderType = "KIE" | "REPLICATE" | "FAL";

export interface Organization {
  id: number;
  name: string;
  remainingCredits: number;
}

export type OrganizationRole = "OWNER" | "MEMBER";

export interface ProductCategory {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  organizationId?: number;
  name: string;
  sku?: string | null;
  categoryId: number;
  category?: { id: number; name: string } | null;
  productImageUrl: string;
  productBackImageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModelProfile {
  id: number;
  organizationId?: number;
  name: string;
  gender: Gender;
  type?: "IMAGE_REFERENCE" | "TEXT_ONLY" | "HYBRID";
  modelType?: "IMAGE_REFERENCE" | "TEXT_ONLY" | "HYBRID";
  bodyType?: string | null;
  skinTone?: string | null;
  hairColor?: string | null;
  hairStyle?: string | null;
  ageRange?: string | null;
  faceReferenceUrl?: string | null;
  backReferenceUrl?: string | null;
  frontImageUrl?: string | null;
  backImageUrl?: string | null;
  frontPrompt?: string | null;
  backPrompt?: string | null;
  stylePrompt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScenePreset {
  id: number;
  name: string;
  type: SceneType;
  backgroundReferenceUrl?: string | null;
  solidColorHex?: string | null;
  backgroundPrompt?: string | null;
  lighting?: string | null;
  mood?: string | null;
  suggestedAspectRatio?: string | null;
  qualityPreset?: string | null;
  category?: string | null;
  tags?: string | null;
  createdAt?: string;
  packId?: string | null;
}

export type ScenePack = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isPublic: boolean;
  isPremium: boolean;
  category?: string | null;
  tags?: string | null;
};

export type ScenePackDetail = ScenePack & {
  scenes: ScenePreset[];
};

export interface GeneratedImage {
  id: number;
  imageUrl: string;
  viewType: ViewType;
  indexNumber: number;
}

export interface GenerationRequest {
  id: number;
  productId: number;
  modelProfileId?: number | null;
  scenePresetId?: number | null;
  frontCount: number;
  backCount: number;
  status: GenerationStatus;
  creditsConsumed: number;
  createdAt: string;
  generatedImages?: GeneratedImage[];
  product?: { id: number; name: string };
  frontError?: string | null;
  backError?: string | null;
}

export type GenerationListItem = {
  id: number;
  createdAt: string;
  productId: number;
  productName?: string;
  productImageUrl?: string;
  modelProfileId?: number | null;
  modelName?: string | null;
  scenePresetId?: number | null;
  sceneName?: string | null;
  frontCount: number;
  backCount: number;
  frontImagesCount: number;
  backImagesCount: number;
  hasFrontError: boolean;
  hasBackError: boolean;
};

export type GenerationDetail = {
  id: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    productImageUrl: string;
    productBackImageUrl?: string | null;
  };
  modelProfile: {
    id: number;
    name: string;
    faceReferenceUrl?: string | null;
  } | null;
  scene: {
    id: number;
    name: string;
    backgroundReferenceUrl?: string | null;
  } | null;
  frontCount: number;
  backCount: number;
  frontImages: GeneratedImage[];
  backImages: GeneratedImage[];
  errors?: {
    front?: string;
    back?: string;
  };
};

// Alias for backward compatibility
export type Generation = GenerationRequest;

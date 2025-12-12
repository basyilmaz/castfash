import { Logger } from '@nestjs/common';
import { ModelProfile, Product, ScenePreset } from '@prisma/client';

export type SidePrompt = {
  fullPrompt: string;
  negativePrompt?: string;
};

export type BuildPromptResult = {
  front?: SidePrompt;
  back?: SidePrompt;
};

type ModelType = 'IMAGE_REFERENCE' | 'TEXT_ONLY' | 'HYBRID';

const logger = new Logger('PromptBuilder');
const PROMPT_SOFT_MAX_LENGTH = 1200;
const PROMPT_HARD_MAX_LENGTH = 1500;
const PROMPT_LOG_SNIPPET_LENGTH = 200;

// Default negative prompt to avoid common issues
const DEFAULT_NEGATIVE_PROMPT = 'ugly, disfigured, blurry, pixelated, low quality, different pattern, wrong colors, extra limbs, missing limbs, bad anatomy, text, watermark';

function buildModelDescriptor(
  model: ModelProfile | null,
  view: 'FRONT' | 'BACK',
) {
  if (!model) return '';

  const parts: string[] = [];

  // Identity preservation - CRITICAL for consistency
  parts.push('IMPORTANT: Use the exact same model from the reference image');
  parts.push(`${model.gender.toLowerCase()} fashion model`);

  // Physical characteristics
  if (model.ageRange) parts.push(`${model.ageRange} years old`);
  if (model.skinTone) parts.push(`${model.skinTone} skin tone`);
  if (model.bodyType) parts.push(`${model.bodyType} body type`);

  // Hair
  const hairDesc = [model.hairStyle, model.hairColor].filter(Boolean).join(' ');
  if (hairDesc) parts.push(`${hairDesc} hair`);

  // Consistency instructions
  parts.push('keep exact same face, body proportions, skin tone, and hair across all views');

  const ref = view === 'FRONT' ? model.faceReferenceUrl : model.backReferenceUrl;
  if (ref) {
    parts.push(`match exactly to reference image`);
  }

  return parts.join(', ');
}

function buildProductDescriptor(product: Product, view: 'FRONT' | 'BACK') {
  const parts: string[] = [];

  // Product name and type
  if (product.name) parts.push(`wearing ${product.name}`);
  if ((product as any).category) parts.push(`${(product as any).category} style`);

  // CRITICAL: Pattern and color consistency
  parts.push('CRITICAL: The garment pattern, colors, and design must be EXACTLY as shown in the product reference image');
  parts.push('do NOT change the pattern, do NOT redesign, do NOT alter colors');

  if (view === 'FRONT') {
    parts.push('showing front view of the garment as in the reference');
    if (product.productImageUrl) {
      parts.push(`match bikini/garment EXACTLY from product image - same colors, same pattern, same cut`);
    }
  } else {
    if ((product as any).productBackImageUrl) {
      parts.push('showing back view as in the product back reference');
    } else {
      parts.push('showing back view, maintaining exact same pattern and colors as the front');
    }
  }

  // Product description if available
  if ((product as any).description) {
    parts.push((product as any).description);
  }

  return parts.join('. ');
}

function buildSceneDescriptor(scene: ScenePreset | null, view: 'FRONT' | 'BACK'): string {
  if (!scene) return 'professional photo studio with clean white background';

  const parts: string[] = [];

  // Background consistency instruction
  if (scene.backgroundReferenceUrl) {
    parts.push('IMPORTANT: Use the EXACT SAME background/environment for all views');
    parts.push('match background exactly to the scene reference image');
  }

  // Scene category
  if (scene.category) {
    const categoryDescriptions: Record<string, string> = {
      'Studio': 'professional photo studio with clean backdrop',
      'Beach': 'sunny tropical beach with sand and sea',
      'Pool': 'modern swimming pool with clear blue water',
      'Outdoor': 'beautiful outdoor natural setting',
      'Indoor': 'stylish indoor environment',
      'Urban': 'modern urban city setting',
      'Minimal': 'minimal clean white background',
      'Luxury': 'luxurious high-end environment',
    };
    parts.push(categoryDescriptions[scene.category] || scene.category);
  }

  // Lighting
  if (scene.lighting) parts.push(`${scene.lighting} lighting`);

  // Mood
  if (scene.mood) parts.push(`${scene.mood} atmosphere`);

  // Custom background prompt
  if (scene.backgroundPrompt) parts.push(scene.backgroundPrompt);

  // Consistency reinforcement
  parts.push('maintain exact same environment, lighting, and atmosphere for all generated images');

  return parts.join(', ');
}

function buildPoseDescriptor(view: 'FRONT' | 'BACK', config?: {
  cameraAngle?: string;
  shotType?: string;
  modelPose?: string;
}): string {
  const parts: string[] = [];

  if (view === 'FRONT') {
    parts.push('front facing view');
    parts.push('model looking at camera');
    parts.push('confident standing pose');
  } else {
    parts.push('back view');
    parts.push('camera behind the model');
    parts.push('showing full back of the garment');
  }

  if (config?.modelPose) {
    const poses: Record<string, string> = {
      'standing': 'natural standing pose',
      'walking': 'walking pose with natural movement',
      'sitting': 'seated pose',
      'leaning': 'leaning pose',
    };
    parts.push(poses[config.modelPose] || config.modelPose);
  }

  if (config?.shotType) {
    const shots: Record<string, string> = {
      'full_body': 'full body shot',
      'knee_shot': 'three quarter body shot',
      'waist_up': 'waist up shot',
      'close_up': 'close up shot',
    };
    parts.push(shots[config.shotType] || 'full body shot');
  } else {
    parts.push('full body shot');
  }

  return parts.join(', ');
}

function trimPrompt(
  prompt: string,
  meta: {
    side: 'FRONT' | 'BACK';
    productId: string | number;
    modelProfileId: string | number;
    sceneId: string | number;
  },
): { prompt: string; trimmed: boolean; originalLength: number } {
  const originalLength = prompt.length;
  let trimmed = false;
  let finalPrompt = prompt;

  if (originalLength > PROMPT_HARD_MAX_LENGTH) {
    logger.warn(
      `Prompt too long (side=${meta.side}, product=${meta.productId}), trimming to ${PROMPT_HARD_MAX_LENGTH} chars.`,
    );
    finalPrompt = prompt.slice(0, PROMPT_HARD_MAX_LENGTH);
    trimmed = true;
    const lastPeriod = finalPrompt.lastIndexOf('.');
    if (lastPeriod > PROMPT_SOFT_MAX_LENGTH) {
      finalPrompt = finalPrompt.slice(0, lastPeriod + 1);
    }
  }

  return { prompt: finalPrompt, trimmed, originalLength };
}

export function buildPrompts(
  product: Product,
  model: ModelProfile | null,
  scene: ScenePreset | null,
  customPrompts?: { front?: string; back?: string },
  cameraConfig?: {
    cameraAngle?: string;
    shotType?: string;
    modelPose?: string;
  },
): BuildPromptResult {
  logger.debug(
    `Building prompts for product=${product.id}, model=${model?.id ?? 'none'}, scene=${scene?.id ?? 'none'}`,
  );

  const qualityTags = 'professional fashion photography, 4K, high resolution, sharp focus, studio quality, editorial fashion';

  // FRONT PROMPT
  const frontPromptParts = [
    'Fashion catalog photograph',
    buildModelDescriptor(model, 'FRONT'),
    buildProductDescriptor(product, 'FRONT'),
    buildSceneDescriptor(scene, 'FRONT'),
    buildPoseDescriptor('FRONT', cameraConfig),
    customPrompts?.front,
    qualityTags,
  ].filter(Boolean);

  const frontPromptRaw = frontPromptParts.join('. ');

  // BACK PROMPT
  const backPromptParts = [
    'Fashion catalog photograph',
    buildModelDescriptor(model, 'BACK'),
    buildProductDescriptor(product, 'BACK'),
    buildSceneDescriptor(scene, 'BACK'),
    buildPoseDescriptor('BACK', cameraConfig),
    customPrompts?.back,
    qualityTags,
  ].filter(Boolean);

  const backPromptRaw = backPromptParts.join('. ');

  const result: BuildPromptResult = {};

  if (frontPromptRaw) {
    const { prompt: trimmedFront, trimmed, originalLength } = trimPrompt(frontPromptRaw, {
      side: 'FRONT',
      productId: product.id,
      modelProfileId: model?.id ?? 'none',
      sceneId: scene?.id ?? 'none',
    });
    if (trimmed) {
      logger.debug(`Front prompt trimmed from ${originalLength} to ${trimmedFront.length} chars`);
    }
    const snippet = trimmedFront.slice(0, PROMPT_LOG_SNIPPET_LENGTH).replace(/\s+/g, ' ');
    logger.debug(`Front prompt (len=${trimmedFront.length}) snippet: "${snippet}..."`);
    result.front = {
      fullPrompt: trimmedFront,
      negativePrompt: DEFAULT_NEGATIVE_PROMPT,
    };
  }

  if (backPromptRaw) {
    const { prompt: trimmedBack, trimmed, originalLength } = trimPrompt(backPromptRaw, {
      side: 'BACK',
      productId: product.id,
      modelProfileId: model?.id ?? 'none',
      sceneId: scene?.id ?? 'none',
    });
    if (trimmed) {
      logger.debug(`Back prompt trimmed from ${originalLength} to ${trimmedBack.length} chars`);
    }
    const snippet = trimmedBack.slice(0, PROMPT_LOG_SNIPPET_LENGTH).replace(/\s+/g, ' ');
    logger.debug(`Back prompt (len=${trimmedBack.length}) snippet: "${snippet}..."`);
    result.back = {
      fullPrompt: trimmedBack,
      negativePrompt: DEFAULT_NEGATIVE_PROMPT,
    };
  }

  return result;
}

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

const logger = new Logger('PromptBuilder');

// Negative prompt for quality
const DEFAULT_NEGATIVE_PROMPT =
  'ugly, disfigured, blurry, low quality, wrong pattern, different colors, extra limbs, bad anatomy, text, watermark';

/**
 * Build a simple, clear prompt for fashion image generation.
 * The reference images are passed separately via image_urls.
 * This prompt should describe what we want, not repeat what's in the images.
 */
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

  const result: BuildPromptResult = {};

  // Build FRONT prompt
  const frontPrompt = buildSinglePrompt({
    view: 'FRONT',
    product,
    model,
    scene,
    customPrompt: customPrompts?.front,
    cameraConfig,
  });

  result.front = {
    fullPrompt: frontPrompt,
    negativePrompt: DEFAULT_NEGATIVE_PROMPT,
  };

  // Build BACK prompt
  const backPrompt = buildSinglePrompt({
    view: 'BACK',
    product,
    model,
    scene,
    customPrompt: customPrompts?.back,
    cameraConfig,
  });

  result.back = {
    fullPrompt: backPrompt,
    negativePrompt: DEFAULT_NEGATIVE_PROMPT,
  };

  logger.debug(
    `Front prompt (${frontPrompt.length} chars): ${frontPrompt.slice(0, 200)}...`,
  );
  logger.debug(
    `Back prompt (${backPrompt.length} chars): ${backPrompt.slice(0, 200)}...`,
  );

  return result;
}

function buildSinglePrompt(opts: {
  view: 'FRONT' | 'BACK';
  product: Product;
  model: ModelProfile | null;
  scene: ScenePreset | null;
  customPrompt?: string;
  cameraConfig?: {
    cameraAngle?: string;
    shotType?: string;
    modelPose?: string;
  };
}): string {
  const { view, product, model, scene, customPrompt, cameraConfig } = opts;

  const parts: string[] = [];

  // 1. Core instruction - use the reference images
  parts.push('Generate a professional fashion catalog photo');
  parts.push(
    'Use the model from the reference images exactly - same face, body, skin tone, hair',
  );
  parts.push(
    'Use the bikini/garment from the product reference image exactly - same pattern, colors, design',
  );

  if (scene?.backgroundReferenceUrl) {
    parts.push('Use the background from the scene reference image');
  } else if (scene?.category) {
    parts.push(`Background: ${scene.category} setting`);
  }

  // 2. View
  if (view === 'FRONT') {
    parts.push('Front view of the model facing the camera');
  } else {
    parts.push(
      'Back view of the model, camera behind, showing the back of the garment',
    );
  }

  // 3. Camera angle
  if (cameraConfig?.cameraAngle) {
    const angles: Record<string, string> = {
      eye_level: 'Eye level camera angle',
      low_angle: 'Low angle shot, camera looking up',
      high_angle: 'High angle shot, camera looking down',
      side_profile: 'Side profile view',
    };
    if (angles[cameraConfig.cameraAngle]) {
      parts.push(angles[cameraConfig.cameraAngle]);
    }
  }

  // 4. Shot type
  if (cameraConfig?.shotType) {
    const shots: Record<string, string> = {
      full_body: 'Full body shot',
      knee_shot: 'Three quarter shot from knees up',
      waist_up: 'Medium shot from waist up',
      close_up: 'Close up portrait',
    };
    if (shots[cameraConfig.shotType]) {
      parts.push(shots[cameraConfig.shotType]);
    }
  } else {
    parts.push('Full body shot');
  }

  // 5. Pose
  if (cameraConfig?.modelPose) {
    const poses: Record<string, string> = {
      standing: 'Natural standing pose',
      walking: 'Walking pose',
      sitting: 'Sitting pose',
      leaning: 'Leaning pose',
    };
    if (poses[cameraConfig.modelPose]) {
      parts.push(poses[cameraConfig.modelPose]);
    }
  }

  // 6. Lighting/mood from scene
  if (scene?.lighting) {
    parts.push(`${scene.lighting} lighting`);
  }
  if (scene?.mood) {
    parts.push(`${scene.mood} mood`);
  }

  // 7. Custom prompt from user
  if (customPrompt && customPrompt.trim()) {
    parts.push(customPrompt.trim());
  }

  // 8. Quality tags
  parts.push(
    'Professional fashion photography, 4K, sharp focus, studio quality',
  );

  return parts.join('. ') + '.';
}

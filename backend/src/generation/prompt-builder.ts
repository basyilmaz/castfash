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

const qualityTags = '4k, sharp focus, editorial fashion, studio lighting';
const logger = new Logger('PromptBuilder');
const PROMPT_SOFT_MAX_LENGTH = 1200;
const PROMPT_HARD_MAX_LENGTH = 1500;
const PROMPT_LOG_SNIPPET_LENGTH = 200;

const CAMERA_ANGLES: Record<string, string> = {
  eye_level: 'eye level shot',
  low_angle: 'low angle shot, looking up',
  high_angle: 'high angle shot, looking down',
  side_profile: 'side profile shot',
};

const SHOT_TYPES: Record<string, string> = {
  full_body: 'full body shot, wide angle',
  knee_shot: 'knee level shot, three quarter body',
  waist_up: 'waist up shot, medium shot',
  close_up: 'close up portrait',
};

const MODEL_POSES: Record<string, string> = {
  standing: 'standing pose, fashion stance',
  walking: 'walking pose, dynamic movement, clothes in motion',
  sitting: 'sitting pose, relaxed',
  leaning: 'leaning against wall pose',
};

function buildModelDescriptor(
  model: ModelProfile | null,
  view: 'FRONT' | 'BACK',
) {
  if (!model) return '';
  const base = `same ${model.gender.toLowerCase()} fashion model identity, keep face, hair, skin tone, body shape consistent`;
  const customization = buildModelCustomizationDescription(model);
  const type = (model as any).modelType as ModelType | undefined;
  const prompts = view === 'FRONT' ? model.frontPrompt : model.backPrompt;
  const ref =
    view === 'FRONT' ? model.faceReferenceUrl : model.backReferenceUrl;
  const descParts = [base, customization].filter(Boolean).join(', ');

  if (type === 'TEXT_ONLY') {
    return `${descParts}, ${prompts || ''}`;
  }

  if (ref) {
    return `${descParts}, match appearance to reference image (${ref}), ${
      customization || ''
    }`;
  }

  return `${descParts}, ${prompts || ''}`;
}

function buildProductDescriptor(product: Product, view: 'FRONT' | 'BACK') {
  if (view === 'FRONT') {
    return `wearing the exact bikini front from reference image (${product.productImageUrl}), match colors, pattern, stitching, logo perfectly, no redesign`;
  }
  if ((product as any).productBackImageUrl) {
    return `back view matches bikini back reference image (${(product as any).productBackImageUrl}), exact cut and pattern, no redesign`;
  }
  return `back view consistent with bikini front design, keep colors/pattern identical to front reference, no redesign`;
}

function buildSceneDescription(scene: ScenePreset | null): {
  description: string | null;
  details: string[];
} {
  if (!scene) return { description: null, details: [] };

  const parts: string[] = [];
  const details: string[] = [];

  if (scene.category) {
    switch (scene.category) {
      case 'studio':
        parts.push(
          'in a professional photo studio with soft, even lighting and a clean backdrop',
        );
        break;
      case 'beach':
        parts.push(
          'on a sunny beach with natural light and visible sand and sea in the background',
        );
        break;
      case 'pool':
        parts.push(
          'by a modern swimming pool with reflective water and outdoor light',
        );
        break;
      case 'indoor':
        parts.push('in a stylish indoor environment');
        break;
      case 'outdoor':
        parts.push('in an outdoor lifestyle setting');
        break;
      case 'urban':
        parts.push('in an urban city environment');
        break;
      case 'minimal':
        parts.push('with a minimal, clean background for e-commerce');
        break;
      case 'luxury':
        parts.push('in a luxurious, high-end environment');
        break;
      default:
        break;
    }
    details.push(`category=${scene.category}`);
  }

  if (scene.lighting) {
    parts.push(scene.lighting);
    details.push(`lighting=${scene.lighting}`);
  }

  if (scene.mood) {
    parts.push(`${scene.mood} mood`);
    details.push(`mood=${scene.mood}`);
  }

  if (scene.backgroundPrompt) {
    parts.push(scene.backgroundPrompt);
    details.push('backgroundPrompt=true');
  }

  if (scene.tags) {
    const tagString = scene.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .join(', ');
    if (tagString) {
      parts.push(tagString);
      details.push(`tags=${tagString}`);
    }
  }

  if (!parts.length) {
    return { description: null, details };
  }

  const description = parts.join(', ');
  return { description, details };
}

function buildPoseDescriptor(
  view: 'FRONT' | 'BACK',
  config?: { cameraAngle?: string; shotType?: string; modelPose?: string },
) {
  const parts: string[] = [];

  // Base View
  parts.push(
    view === 'FRONT'
      ? 'front view'
      : 'back view, camera behind model, show full back',
  );

  // Camera Angle
  if (config?.cameraAngle && CAMERA_ANGLES[config.cameraAngle]) {
    parts.push(CAMERA_ANGLES[config.cameraAngle]);
  } else if (view === 'FRONT') {
    parts.push('camera at chest/waist level');
  }

  // Shot Type
  if (config?.shotType && SHOT_TYPES[config.shotType]) {
    parts.push(SHOT_TYPES[config.shotType]);
  } else {
    parts.push('catalog framing');
  }

  // Model Pose
  if (config?.modelPose && MODEL_POSES[config.modelPose]) {
    parts.push(MODEL_POSES[config.modelPose]);
  } else {
    parts.push(
      view === 'FRONT'
        ? 'slight torso rotation, natural arms'
        : 'natural posture',
    );
  }

  return parts.join(', ');
}

function buildModelCustomizationDescription(
  model: ModelProfile,
): string | null {
  const parts: string[] = [];
  if (model.ageRange) parts.push(`${model.ageRange}-aged`);
  if (model.skinTone) parts.push(`${model.skinTone} skin`);
  if (model.bodyType) parts.push(`${model.bodyType} body`);
  if (model.hairColor || model.hairStyle) {
    const hairDesc = [model.hairStyle, model.hairColor]
      .filter(Boolean)
      .join(' ');
    if (hairDesc) parts.push(`${hairDesc} hair`);
  }
  if (!parts.length) return null;
  const desc = parts.join(', ');
  logger.debug(
    `Model customization applied for modelProfile=${model.id}: ${desc}`,
  );
  return desc;
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
      `Prompt too long (side=${meta.side}, product=${meta.productId}, model=${meta.modelProfileId}, scene=${meta.sceneId}, length=${originalLength}), trimming to ${PROMPT_HARD_MAX_LENGTH} chars.`,
    );
    finalPrompt = prompt.slice(0, PROMPT_HARD_MAX_LENGTH);
    trimmed = true;
    const lastSpace = finalPrompt.lastIndexOf(' ');
    if (lastSpace > 0 && lastSpace > PROMPT_SOFT_MAX_LENGTH) {
      finalPrompt = finalPrompt.slice(0, lastSpace);
    }
  } else if (originalLength > PROMPT_SOFT_MAX_LENGTH) {
    logger.debug(
      `Prompt exceeds soft max (side=${meta.side}, product=${meta.productId}, model=${meta.modelProfileId}, scene=${meta.sceneId}, length=${originalLength}). Consider reducing verbosity.`,
    );
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
    `Building prompts for product=${product.id}, model=${model?.id ?? 'none'}, scene=${scene?.id ?? 'none'} | product images front=${!!product.productImageUrl} back=${!!(product as any).productBackImageUrl} | model images front=${!!model?.faceReferenceUrl} back=${!!model?.backReferenceUrl} | modelType=${(model as any)?.modelType ?? 'n/a'} | scene backgroundRef=${!!scene?.backgroundReferenceUrl}`,
  );
  const { description: sceneDescription, details: sceneDetails } =
    buildSceneDescription(scene);
  if (sceneDescription) {
    logger.debug(
      `Scene description applied for scene=${scene?.id ?? 'none'}: ${sceneDescription}`,
    );
  }
  if (sceneDetails.length) {
    logger.debug(
      `Scene details for scene=${scene?.id ?? 'none'}: ${sceneDetails.join(' | ')}`,
    );
  }

  const hasSceneRef = !!scene?.backgroundReferenceUrl;
  const sceneRefText = hasSceneRef
    ? `match the provided background reference (${scene.backgroundReferenceUrl}), keep environment consistent`
    : null;

  const frontEnvironmentPart = hasSceneRef
    ? sceneDescription
      ? `${sceneRefText}, scene mood/lighting: ${sceneDescription}`
      : `${sceneRefText}`
    : sceneDescription || 'in a clean studio-like background';

  const backEnvironmentPart = frontEnvironmentPart;

  const frontPromptRaw = [
    buildModelDescriptor(model, 'FRONT'),
    buildProductDescriptor(product, 'FRONT'),
    frontEnvironmentPart,
    buildPoseDescriptor('FRONT', cameraConfig),
    customPrompts?.front,
    qualityTags,
  ]
    .filter(Boolean)
    .join('. ');

  const backPromptRaw = [
    buildModelDescriptor(model, 'BACK'),
    buildProductDescriptor(product, 'BACK'),
    backEnvironmentPart,
    buildPoseDescriptor('BACK', cameraConfig),
    customPrompts?.back,
    qualityTags,
  ]
    .filter(Boolean)
    .join('. ');

  const result: BuildPromptResult = {};

  if (frontPromptRaw) {
    const {
      prompt: trimmedFront,
      trimmed,
      originalLength,
    } = trimPrompt(frontPromptRaw, {
      side: 'FRONT',
      productId: product.id,
      modelProfileId: model?.id ?? 'none',
      sceneId: scene?.id ?? 'none',
    });
    if (trimmed) {
      logger.debug(
        `Front prompt trimmed from length=${originalLength} to length=${trimmedFront.length} (product=${product.id}, model=${model?.id ?? 'none'}, scene=${scene?.id ?? 'none'})`,
      );
    }
    const snippet = trimmedFront
      .slice(0, PROMPT_LOG_SNIPPET_LENGTH)
      .replace(/\s+/g, ' ');
    logger.debug(
      `Front prompt (len=${trimmedFront.length}) snippet: "${snippet}..." (product=${product.id}, model=${model?.id ?? 'none'}, scene=${scene?.id ?? 'none'})`,
    );
    result.front = { fullPrompt: trimmedFront };
  }

  if (backPromptRaw) {
    const {
      prompt: trimmedBack,
      trimmed,
      originalLength,
    } = trimPrompt(backPromptRaw, {
      side: 'BACK',
      productId: product.id,
      modelProfileId: model?.id ?? 'none',
      sceneId: scene?.id ?? 'none',
    });
    if (trimmed) {
      logger.debug(
        `Back prompt trimmed from length=${originalLength} to length=${trimmedBack.length} (product=${product.id}, model=${model?.id ?? 'none'}, scene=${scene?.id ?? 'none'})`,
      );
    }
    const snippet = trimmedBack
      .slice(0, PROMPT_LOG_SNIPPET_LENGTH)
      .replace(/\s+/g, ' ');
    logger.debug(
      `Back prompt (len=${trimmedBack.length}) snippet: "${snippet}..." (product=${product.id}, model=${model?.id ?? 'none'}, scene=${scene?.id ?? 'none'})`,
    );
    result.back = { fullPrompt: trimmedBack };
  }

  return result;
}

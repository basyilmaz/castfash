import { Logger } from '@nestjs/common';
import { ModelProfile, Product, ScenePreset, PromptTemplate } from '@prisma/client';

export type SidePrompt = {
  fullPrompt: string;
  negativePrompt?: string;
};

export type BuildPromptResult = {
  front?: SidePrompt;
  back?: SidePrompt;
};

export type PromptTemplates = {
  masterTemplates?: PromptTemplate[];
  negativeTemplates?: PromptTemplate[];
  preservationTemplates?: PromptTemplate[];
};

const logger = new Logger('PromptBuilder');

/**
 * Enhanced Negative Prompt for Nano Banana Pro
 * Based on best practices for reference image preservation
 */
const ENHANCED_NEGATIVE_PROMPT = [
  // Quality issues
  'blurry, low quality, low resolution, pixelated, jpeg artifacts, noise, grain, out of focus',
  // Anatomy issues
  'distorted, deformed, disfigured, ugly, bad anatomy, wrong proportions, extra limbs, missing limbs, floating limbs, disconnected limbs, extra fingers, missing fingers, mutated hands',
  // Reference preservation
  'altered product details, changed fabric texture, modified pattern, color shift, wrong color tone, distorted logo, changed brand elements, different material appearance',
  'lost stitching details, missing buttons, altered zipper, changed collar shape, modified sleeve length, different neckline',
  // Model consistency
  'changed facial features, altered face shape, different eye color, modified skin texture, inconsistent skin tone',
  // Photography issues
  'amateur, unprofessional, watermark, text, signature, logo, brand name, cropped, cut off, bad framing',
  'unflattering angles, harsh shadows, overexposed, underexposed, washed out colors, unnatural skin tones'
].join(', ');

/**
 * Build prompts optimized for Nano Banana Pro AI
 * 
 * Key principles applied:
 * 1. Natural language with full descriptive sentences
 * 2. Explicit reference image preservation instructions
 * 3. Detailed camera, lighting, and composition guidance
 * 4. Strong negative prompts to protect quality and fidelity
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
  templates?: PromptTemplates,
): BuildPromptResult {
  logger.debug(
    `Building prompts for product=${product.id}, model=${model?.id ?? 'none'}, scene=${scene?.id ?? 'none'}`,
  );

  const result: BuildPromptResult = {};

  // Build negative prompt from templates or use enhanced default
  const negativePrompt = buildNegativePrompt(templates?.negativeTemplates);

  // Build FRONT prompt
  const frontPrompt = buildSinglePrompt({
    view: 'FRONT',
    product,
    model,
    scene,
    customPrompt: customPrompts?.front,
    cameraConfig,
    templates,
  });

  result.front = {
    fullPrompt: frontPrompt,
    negativePrompt,
  };

  // Build BACK prompt
  const backPrompt = buildSinglePrompt({
    view: 'BACK',
    product,
    model,
    scene,
    customPrompt: customPrompts?.back,
    cameraConfig,
    templates,
  });

  result.back = {
    fullPrompt: backPrompt,
    negativePrompt,
  };

  logger.debug(
    `Front prompt (${frontPrompt.length} chars): ${frontPrompt.slice(0, 200)}...`,
  );
  logger.debug(
    `Back prompt (${backPrompt.length} chars): ${backPrompt.slice(0, 200)}...`,
  );

  return result;
}

function buildNegativePrompt(negativeTemplates?: PromptTemplate[]): string {
  if (negativeTemplates && negativeTemplates.length > 0) {
    return negativeTemplates.map(t => t.content).join(', ');
  }
  return ENHANCED_NEGATIVE_PROMPT;
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
  templates?: PromptTemplates;
}): string {
  const { view, product, model, scene, customPrompt, cameraConfig, templates } = opts;

  const parts: string[] = [];

  // 1. Master template instructions (if available)
  if (templates?.masterTemplates && templates.masterTemplates.length > 0) {
    templates.masterTemplates.forEach(t => {
      if (t.type !== 'NEGATIVE') {
        parts.push(t.content);
      }
    });
  }

  // 2. Core Reference Preservation Instructions (Nano Banana Pro optimized)
  parts.push('Create a high-quality professional fashion photograph');

  // Model preservation - critical for consistency
  if (model) {
    parts.push(
      `IMPORTANT: Preserve the exact facial features, skin tone, body proportions, and hair from the model reference image. ` +
      `Maintain consistent face shape, eye color, nose structure, lip shape, and overall facial identity. ` +
      `The model's appearance must be identical to the reference with no alterations`
    );
  } else {
    parts.push(
      'Feature a professional fashion model with natural proportions and photogenic appearance'
    );
  }

  // Product preservation - critical for accuracy
  parts.push(
    `CRITICAL: Preserve all product details exactly as shown in the reference image. ` +
    `Maintain the exact fabric texture, color accuracy, pattern alignment, stitching details, ` +
    `button placement, zipper visibility, logo positioning, and garment silhouette. ` +
    `The garment must appear identical to the reference with true-to-life colors`
  );

  // Product name
  if (product.name) {
    parts.push(`The product is: ${product.name}`);
  }

  // 3. View specification
  if (view === 'FRONT') {
    parts.push(
      'Front view of the model facing directly toward the camera, ' +
      'showcasing the front design of the garment clearly'
    );
  } else {
    parts.push(
      'Back view of the model with camera positioned behind, ' +
      'showing the back design and construction of the garment'
    );
  }

  // 4. Scene/Background
  if (scene) {
    if (scene.backgroundReferenceUrl) {
      parts.push(
        'Use the background from the scene reference image, ' +
        'blending the model naturally into the environment'
      );
    }
    if (scene.category) {
      parts.push(`Setting: ${scene.category} environment`);
    }
    if (scene.lighting) {
      parts.push(`Lighting: ${scene.lighting}`);
    }
    if (scene.mood) {
      parts.push(`Mood and atmosphere: ${scene.mood}`);
    }
  } else {
    parts.push('Clean, professional studio background with soft, even lighting');
  }

  // 5. Camera Configuration
  if (cameraConfig?.cameraAngle) {
    const angles: Record<string, string> = {
      eye_level: 'Shot at eye level camera angle for natural perspective',
      low_angle: 'Low angle shot with camera looking up, adding height and presence',
      high_angle: 'High angle shot with camera looking down for elegant overview',
      side_profile: 'Side profile view emphasizing silhouette and shape',
    };
    if (angles[cameraConfig.cameraAngle]) {
      parts.push(angles[cameraConfig.cameraAngle]);
    }
  } else {
    parts.push('Eye level camera angle for natural, balanced perspective');
  }

  // 6. Shot Type
  if (cameraConfig?.shotType) {
    const shots: Record<string, string> = {
      full_body: 'Full body shot capturing the entire outfit from head to toe',
      knee_shot: 'Three-quarter shot from knees up, balancing context and detail',
      waist_up: 'Medium shot from waist up, emphasizing upper body and face',
      close_up: 'Close-up portrait focusing on upper body and garment details',
    };
    if (shots[cameraConfig.shotType]) {
      parts.push(shots[cameraConfig.shotType]);
    }
  } else {
    parts.push('Full body shot capturing the complete outfit');
  }

  // 7. Model Pose
  if (cameraConfig?.modelPose) {
    const poses: Record<string, string> = {
      standing: 'Natural, confident standing pose with relaxed shoulders and good posture',
      walking: 'Dynamic walking pose capturing movement and energy',
      sitting: 'Elegant seated pose maintaining garment visibility',
      leaning: 'Casual leaning pose with relaxed, approachable body language',
    };
    if (poses[cameraConfig.modelPose]) {
      parts.push(poses[cameraConfig.modelPose]);
    }
  } else {
    parts.push('Natural standing pose with confident, relaxed posture');
  }

  // 8. Preservation templates (if available)
  if (templates?.preservationTemplates && templates.preservationTemplates.length > 0) {
    templates.preservationTemplates.forEach(t => {
      parts.push(t.content);
    });
  }

  // 9. Custom prompt from user
  if (customPrompt && customPrompt.trim()) {
    parts.push(`Additional requirements: ${customPrompt.trim()}`);
  }

  // 10. Quality specifications (Nano Banana Pro optimized)
  parts.push(
    'Technical specifications: Professional fashion photography, photorealistic quality, ' +
    '4K resolution, sharp focus on garment details, accurate fabric texture rendering, ' +
    'true-to-life color reproduction, proper proportions, magazine-quality output'
  );

  // Join with proper sentence structure for Nano Banana Pro
  return parts.join('. ') + '.';
}

/**
 * Helper function to apply variable substitution to prompts
 */
export function applyVariables(
  prompt: string,
  variables: Record<string, string>,
): string {
  let result = prompt;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}

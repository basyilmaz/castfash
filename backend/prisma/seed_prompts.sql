-- CastFash Master Prompt Seed Data

-- Master Prompt Templates
INSERT INTO prompt_templates (name, type, category, content, variables, "isActive", priority, tags, "createdAt", "updatedAt")
VALUES 
-- Master Base Prompt (en yüksek öncelik)
(
  'Master Base Prompt',
  'MASTER',
  'GENERAL',
  'professional fashion photography, high-end editorial look, clean sharp focus, studio quality, 8k resolution, hyper realistic, commercial product photography',
  '{}',
  true,
  1,
  ARRAY['master', 'base', 'quality'],
  NOW(),
  NOW()
),
-- Model Prompt Template
(
  'Model Consistency Prompt',
  'MASTER',
  'MODEL',
  'maintain exact model identity, same face features, same skin tone, same body proportions, consistent appearance throughout, professional fashion model posing',
  '{"model_gender": "female/male", "model_age": "young adult"}',
  true,
  2,
  ARRAY['model', 'consistency'],
  NOW(),
  NOW()
),
-- Product Prompt Template
(
  'Product Accuracy Prompt',
  'MASTER',
  'PRODUCT',
  'exact product appearance from reference image, maintain all product details, accurate colors, accurate patterns, accurate textures, no modifications to original design',
  '{"product_type": "bikini/dress/shirt", "product_color": "as reference"}',
  true,
  3,
  ARRAY['product', 'accuracy'],
  NOW(),
  NOW()
),
-- Scene Prompts
(
  'Studio Background',
  'SCENE',
  'BACKGROUND',
  'clean professional studio background, soft even lighting, neutral backdrop, product photography studio setting, fashion catalog style',
  '{}',
  true,
  5,
  ARRAY['background', 'studio', 'neutral'],
  NOW(),
  NOW()
),
(
  'Beach Scene',
  'SCENE',
  'BACKGROUND',
  'beautiful sunny beach location, natural daylight, soft sand, blue ocean in background, tropical paradise, vacation vibes, outdoor fashion photography',
  '{}',
  true,
  5,
  ARRAY['background', 'beach', 'outdoor'],
  NOW(),
  NOW()
),
(
  'Urban City Scene',
  'SCENE',
  'BACKGROUND',
  'modern city street, contemporary urban architecture, stylish metropolitan location, fashion district vibes',
  '{}',
  true,
  5,
  ARRAY['background', 'urban', 'city'],
  NOW(),
  NOW()
),
-- Lighting Prompts
(
  'Professional Studio Lighting',
  'LIGHTING',
  'GENERAL',
  'professional studio lighting, soft diffused light, no harsh shadows, flattering light on model, even illumination, fashion photography lighting setup',
  '{}',
  true,
  4,
  ARRAY['lighting', 'professional', 'studio'],
  NOW(),
  NOW()
),
(
  'Natural Daylight',
  'LIGHTING',
  'GENERAL',
  'natural daylight, golden hour warmth, soft sun rays, outdoor natural lighting, beautiful natural shadows',
  '{}',
  true,
  4,
  ARRAY['lighting', 'natural', 'outdoor'],
  NOW(),
  NOW()
),
-- Pose Prompts
(
  'Standing Fashion Pose',
  'POSE',
  'MODEL',
  'confident standing pose, slight body angle, one hip slightly forward, relaxed shoulders, professional model stance',
  '{}',
  true,
  6,
  ARRAY['pose', 'standing', 'fashion'],
  NOW(),
  NOW()
),
(
  'Walking Dynamic Pose',
  'POSE',
  'MODEL',
  'walking pose, dynamic movement, clothes in gentle motion, natural stride, confident walk',
  '{}',
  true,
  6,
  ARRAY['pose', 'walking', 'dynamic'],
  NOW(),
  NOW()
),
-- Style Prompts
(
  'High Fashion Editorial',
  'STYLE',
  'GENERAL',
  'high fashion editorial style, magazine quality, vogue inspired, luxury brand aesthetic, premium look',
  '{}',
  true,
  7,
  ARRAY['style', 'editorial', 'highfashion'],
  NOW(),
  NOW()
),
(
  'Commercial Catalog',
  'STYLE',
  'GENERAL',
  'commercial catalog style, clean product presentation, e-commerce ready, versatile background, professional catalog photography',
  '{}',
  true,
  7,
  ARRAY['style', 'catalog', 'commercial'],
  NOW(),
  NOW()
),
-- Quality Enhancement
(
  'Quality Enhancement',
  'MASTER',
  'QUALITY',
  '4k ultra detailed, sharp focus, professional color grading, high dynamic range, crisp details, magazine quality, award winning photography',
  '{}',
  true,
  10,
  ARRAY['quality', 'enhancement'],
  NOW(),
  NOW()
),
-- Negative Prompts
(
  'Master Negative Prompt',
  'NEGATIVE',
  'GENERAL',
  'low quality, blurry, out of focus, distorted, deformed, ugly, bad anatomy, bad proportions, extra limbs, missing limbs, disfigured, watermark, text, logo, signature, cropped, amateur, unprofessional, grainy, noisy, overexposed, underexposed, bad lighting',
  '{}',
  true,
  1,
  ARRAY['negative', 'master'],
  NOW(),
  NOW()
),
(
  'Product Protection Negative',
  'NEGATIVE',
  'PRODUCT',
  'wrong colors, wrong pattern, modified design, different product, incorrect details, changed appearance, redesigned, altered product, inaccurate product representation',
  '{}',
  true,
  2,
  ARRAY['negative', 'product'],
  NOW(),
  NOW()
),
(
  'Model Protection Negative',
  'NEGATIVE',
  'MODEL',
  'different person, changed face, wrong identity, inconsistent appearance, different skin tone, different body type, different age, wrong model',
  '{}',
  true,
  2,
  ARRAY['negative', 'model'],
  NOW(),
  NOW()
);

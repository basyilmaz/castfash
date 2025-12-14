import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SceneType, PromptType, PromptCategoryType } from '@prisma/client';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly prisma: PrismaService) { }

  async onModuleInit() {
    await this.ensureProductCategories();
    await this.ensureGlobalScenes();
    await this.ensureMasterPromptTemplates();
    await this.ensureDefaultPresets();
  }

  async ensureProductCategories() {
    const categories = ['bikini', 'dress', 'tshirt'];
    await Promise.all(
      categories.map((name) =>
        this.prisma.productCategory.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );
    this.logger.log('Default product categories ensured.');
  }

  private async ensureGlobalScenes() {
    const scenes = [
      {
        name: 'Beach',
        type: SceneType.PRESET,
        backgroundReferenceUrl: 'https://picsum.photos/seed/beach/1080/1920',
      },
      {
        name: 'White Studio',
        type: SceneType.PRESET,
        backgroundReferenceUrl: 'https://picsum.photos/seed/studio/1080/1920',
      },
      {
        name: 'Soft Pink',
        type: SceneType.SOLID_COLOR,
        solidColorHex: '#fce4ec',
      },
    ];

    for (const scene of scenes) {
      const exists = await this.prisma.scenePreset.findFirst({
        where: { name: scene.name, organizationId: null },
      });
      if (!exists) {
        await this.prisma.scenePreset.create({
          data: { ...scene, organizationId: null },
        });
      }
    }
    this.logger.log('Global scenes ensured.');
  }

  /**
   * Nano Banana Pro optimized prompt templates based on official best practices:
   * - Natural language with full sentences
   * - Subject + Description + Action + Setting + Style + Composition + Lighting
   * - Detailed camera settings and angles
   * - Negative prompts to exclude unwanted elements
   * 
   * Key principles:
   * 1. Be specific and descriptive
   * 2. Include lighting and camera details like a cinematographer
   * 3. Use structured approach with logical components
   * 4. Treat the AI like a human artist with conversational prompts
   */
  private async ensureMasterPromptTemplates() {
    const templates = [
      // MASTER Templates - Complete prompts for fashion photography
      {
        name: 'Fashion Editorial Master',
        type: PromptType.MASTER,
        category: PromptCategoryType.PRODUCT,
        content: 'Create a high-end fashion editorial photograph featuring a professional model wearing {product_type}. The model has {skin_tone} skin, {hair_description} hair, and is captured in a {pose_style} pose. The setting is {scene_description} with {lighting_type} lighting creating {lighting_mood}. Shot with a {camera_angle} angle, the image has {style_aesthetic} aesthetic with photorealistic quality, 4K resolution, sharp focus on the garment details. The composition emphasizes the product while maintaining natural model proportions.',
        variables: {
          product_type: 'a summer dress',
          skin_tone: 'warm',
          hair_description: 'flowing dark',
          pose_style: 'confident standing',
          scene_description: 'a minimalist white studio',
          lighting_type: 'soft diffused',
          lighting_mood: 'flattering even illumination',
          camera_angle: 'eye-level medium shot',
          style_aesthetic: 'clean commercial'
        },
        priority: 100,
        tags: ['master', 'fashion', 'editorial', 'nano-banana-pro'],
      },
      {
        name: 'E-commerce Product Photography Master',
        type: PromptType.MASTER,
        category: PromptCategoryType.PRODUCT,
        content: 'Generate a professional e-commerce product photograph of {product_type} displayed on a model. The model stands in a {pose_description} position against {background_setting}. Lighting is {lighting_setup} to eliminate harsh shadows and highlight fabric texture. The shot is framed as a {shot_type} with the product clearly visible and occupying the primary visual focus. Style: clean, commercial, online store ready. Technical: photorealistic, crisp details, true-to-life colors, no distortion.',
        variables: {
          product_type: 'casual t-shirt',
          pose_description: 'relaxed frontal',
          background_setting: 'a seamless white backdrop',
          lighting_setup: 'three-point studio lighting',
          shot_type: 'full body shot'
        },
        priority: 95,
        tags: ['master', 'ecommerce', 'product', 'nano-banana-pro'],
      },
      {
        name: 'Lifestyle Fashion Master',
        type: PromptType.MASTER,
        category: PromptCategoryType.PRODUCT,
        content: 'Capture an authentic lifestyle fashion photograph showing a model wearing {product_type} in a {environment_setting}. The scene conveys {mood_atmosphere} with the model engaged in {activity_action}. Natural {lighting_conditions} illuminates the scene, creating {shadow_quality}. The photograph is taken from a {viewing_angle} perspective with a {depth_of_field} depth of field. The overall aesthetic is {brand_style}, relatable and aspirational. High definition, magazine quality.',
        variables: {
          product_type: 'a casual sundress',
          environment_setting: 'a sunlit café terrace',
          mood_atmosphere: 'relaxed summer vibes',
          activity_action: 'a natural candid moment',
          lighting_conditions: 'golden hour sunlight',
          shadow_quality: 'soft warm shadows',
          viewing_angle: 'slightly candid wide',
          depth_of_field: 'shallow bokeh',
          brand_style: 'modern lifestyle brand'
        },
        priority: 90,
        tags: ['master', 'lifestyle', 'candid', 'nano-banana-pro'],
      },

      // SCENE Templates - Environment descriptions
      {
        name: 'Tropical Beach Paradise',
        type: PromptType.SCENE,
        category: PromptCategoryType.BACKGROUND,
        content: 'A stunning tropical beach setting during golden hour. Crystal clear turquoise water gently lapping at white sand shores. Swaying palm trees frame the composition. The sky displays warm orange and pink sunset hues. Distant horizon line creates depth. Natural beach environment with no artificial elements.',
        priority: 80,
        tags: ['scene', 'beach', 'tropical', 'outdoor', 'golden-hour'],
      },
      {
        name: 'Minimalist White Studio',
        type: PromptType.SCENE,
        category: PromptCategoryType.BACKGROUND,
        content: 'A clean, professional photography studio with seamless white cyclorama background. The infinite white backdrop creates a floating effect. No visible floor-wall transitions. Pure, distraction-free environment perfect for product focus. The setting is clinical, modern, and commercially versatile.',
        priority: 85,
        tags: ['scene', 'studio', 'white', 'minimalist', 'commercial'],
      },
      {
        name: 'Urban City Street',
        type: PromptType.SCENE,
        category: PromptCategoryType.BACKGROUND,
        content: 'A contemporary urban street environment with modern architecture. Clean concrete sidewalks and sleek glass buildings in the background. The setting has a cosmopolitan, fashion-forward atmosphere. Urban textures like metal railings and contemporary storefronts add visual interest. Daytime city ambiance with natural street lighting.',
        priority: 75,
        tags: ['scene', 'urban', 'street', 'city', 'contemporary'],
      },
      {
        name: 'Luxury Interior',
        type: PromptType.SCENE,
        category: PromptCategoryType.BACKGROUND,
        content: 'An upscale luxury interior setting with elegant furnishings. Soft neutral color palette with marble surfaces and designer furniture visible in the background. Large windows allowing natural light to flood the space. The environment exudes sophistication, wealth, and refined taste. Clean lines and premium materials throughout.',
        priority: 70,
        tags: ['scene', 'interior', 'luxury', 'elegant', 'indoor'],
      },

      // POSE Templates - Model positioning
      {
        name: 'Confident Standing Power Pose',
        type: PromptType.POSE,
        category: PromptCategoryType.MODEL,
        content: 'The model stands tall with excellent posture, one hand resting naturally on the hip. Feet shoulder-width apart creating a stable, confident stance. The body is angled slightly at three-quarters to the camera. Head tilted slightly up with a direct, engaging gaze toward the lens. Shoulders relaxed but pulled back. The pose conveys strength, confidence, and self-assurance.',
        priority: 80,
        tags: ['pose', 'standing', 'confident', 'power', 'frontal'],
      },
      {
        name: 'Dynamic Walking Motion',
        type: PromptType.POSE,
        category: PromptCategoryType.MODEL,
        content: 'The model captured mid-stride in a natural walking motion. One leg forward, creating dynamic movement energy. Arms swing naturally at the sides. Hair and clothing show subtle motion blur suggesting movement. The walk is runway-inspired but natural, not exaggerated. The expression is focused and purposeful.',
        priority: 75,
        tags: ['pose', 'walking', 'dynamic', 'motion', 'runway'],
      },
      {
        name: 'Relaxed Casual Stance',
        type: PromptType.POSE,
        category: PromptCategoryType.MODEL,
        content: 'A relaxed, approachable pose with natural weight distribution. One leg slightly bent, creating an S-curve silhouette. Hands may be loosely at sides or one hand in pocket. The posture is comfortable and unforced. A soft, genuine smile or pleasant neutral expression. The overall feeling is friendly, accessible, and authentic.',
        priority: 70,
        tags: ['pose', 'casual', 'relaxed', 'natural', 'approachable'],
      },
      {
        name: 'Seated Elegant',
        type: PromptType.POSE,
        category: PromptCategoryType.MODEL,
        content: 'The model is seated gracefully on a surface appropriate to the scene. Legs positioned elegantly, either crossed or angled to the side. Upper body remains upright with good posture. Hands rest naturally in lap or on the seating surface. The seated position is sophisticated and polished, maintaining garment visibility.',
        priority: 65,
        tags: ['pose', 'seated', 'elegant', 'sophisticated'],
      },

      // LIGHTING Templates - Illumination settings
      {
        name: 'Soft Diffused Studio Light',
        type: PromptType.LIGHTING,
        category: PromptCategoryType.QUALITY,
        content: 'Professional three-point lighting setup with large softboxes. Key light positioned 45 degrees to the subject creating gentle shadows. Fill light reduces contrast while maintaining dimension. Hair light adds separation from background. Even, flattering illumination with no harsh shadows. Color temperature: neutral daylight balanced.',
        priority: 80,
        tags: ['lighting', 'studio', 'soft', 'professional', 'three-point'],
      },
      {
        name: 'Golden Hour Natural',
        type: PromptType.LIGHTING,
        category: PromptCategoryType.QUALITY,
        content: 'Warm, natural golden hour sunlight during the magic hour before sunset. The light creates a soft, warm glow with elongated gentle shadows. Color temperature is warm orange-yellow. The lighting wraps around the subject beautifully, creating a romantic, dreamy atmosphere. Natural lens flare may be present. Skin tones appear warm and healthy.',
        priority: 75,
        tags: ['lighting', 'golden-hour', 'natural', 'warm', 'outdoor'],
      },
      {
        name: 'High Key Bright',
        type: PromptType.LIGHTING,
        category: PromptCategoryType.QUALITY,
        content: 'High key lighting creating a bright, airy feel. Multiple light sources eliminate shadows almost entirely. The overall exposure is slightly elevated for a fresh, optimistic mood. Background and foreground are both well-lit. Perfect for commercial, friendly, accessible imagery. Clean and contemporary aesthetic.',
        priority: 70,
        tags: ['lighting', 'high-key', 'bright', 'commercial', 'fresh'],
      },
      {
        name: 'Dramatic Side Light',
        type: PromptType.LIGHTING,
        category: PromptCategoryType.QUALITY,
        content: 'Dramatic side lighting creating strong contrast and deep shadows. Single key light positioned 90 degrees to the subject. Dark shadows on the opposite side add mystery and depth. The lighting sculpts facial features and fabric textures. The mood is more artistic and editorial. A low-fill or no-fill approach for maximum drama.',
        priority: 65,
        tags: ['lighting', 'dramatic', 'side', 'contrast', 'editorial'],
      },

      // STYLE Templates - Aesthetic direction
      {
        name: 'High Fashion Editorial',
        type: PromptType.STYLE,
        category: PromptCategoryType.GENERAL,
        content: 'High fashion editorial aesthetic reminiscent of Vogue and Elle magazines. Sophisticated, polished, and aspirational imagery. Strong visual impact with attention to composition and negative space. The photography style is artistic yet commercially viable. Models appear elegant, refined, and fashion-forward. Premium luxury brand sensibility.',
        priority: 80,
        tags: ['style', 'high-fashion', 'editorial', 'vogue', 'luxury'],
      },
      {
        name: 'Casual Lifestyle Authentic',
        type: PromptType.STYLE,
        category: PromptCategoryType.GENERAL,
        content: 'Authentic lifestyle photography style that feels natural and unposed. The aesthetic is warm, relatable, and approachable. Images appear candid even when styled. The vibe is modern millennial or Gen-Z friendly. Colors are natural but vibrant. The photography bridges aspiration with attainability.',
        priority: 75,
        tags: ['style', 'lifestyle', 'authentic', 'casual', 'relatable'],
      },
      {
        name: 'Clean Commercial',
        type: PromptType.STYLE,
        category: PromptCategoryType.GENERAL,
        content: 'Clean, crisp commercial photography optimized for e-commerce and advertising. The focus is entirely on the product with maximum clarity. Color accuracy is paramount for true-to-life representation. The style is professional, trustworthy, and purchase-driving. No artistic filters or heavy color grading. Pure product presentation.',
        priority: 85,
        tags: ['style', 'commercial', 'clean', 'ecommerce', 'product-focused'],
      },
      {
        name: 'Streetwear Urban',
        type: PromptType.STYLE,
        category: PromptCategoryType.GENERAL,
        content: 'Contemporary streetwear aesthetic with urban culture influence. The style is edgy, youthful, and trend-forward. Photography has an energetic, authentic street fashion feel. Bold, confident attitude in both pose and expression. The aesthetic appeals to fashion-conscious urban audiences. Contemporary cool factor is essential.',
        priority: 70,
        tags: ['style', 'streetwear', 'urban', 'edgy', 'contemporary'],
      },

      // NEGATIVE Prompt Templates - Elements to exclude
      {
        name: 'Standard Negative Prompt',
        type: PromptType.NEGATIVE,
        category: PromptCategoryType.QUALITY,
        content: 'blurry, low quality, low resolution, pixelated, jpeg artifacts, noise, grain, out of focus, distorted, deformed, disfigured, ugly, bad anatomy, wrong proportions, extra limbs, missing limbs, floating limbs, disconnected limbs, extra fingers, missing fingers, mutated hands, mutation, mutated, morbid, malformed, amateur, unprofessional, watermark, text, signature, logo, brand name, cropped, cut off, bad framing',
        priority: 100,
        tags: ['negative', 'standard', 'quality-control'],
      },
      {
        name: 'Fashion Photography Negative',
        type: PromptType.NEGATIVE,
        category: PromptCategoryType.QUALITY,
        content: 'unflattering angles, bad lighting, harsh shadows, overexposed, underexposed, washed out colors, unnatural skin tones, red eye, awkward pose, stiff pose, unnatural expression, forced smile, closed eyes, clothing wrinkles, wardrobe malfunction, visible tags, measurement error, size distortion, product not visible, background clutter, distracting elements, competing focal points',
        priority: 95,
        tags: ['negative', 'fashion', 'photography-specific'],
      },
      {
        name: 'Reference Image Preservation Negative',
        type: PromptType.NEGATIVE,
        category: PromptCategoryType.QUALITY,
        content: 'altered product details, changed fabric texture, modified pattern, color shift, wrong color tone, distorted logo, changed brand elements, different material appearance, lost stitching details, missing buttons, altered zipper, changed collar shape, modified sleeve length, different neckline, lost embroidery, simplified details, smoothed textures, missing print elements, changed garment silhouette, proportion changes from reference',
        priority: 100,
        tags: ['negative', 'reference', 'preservation', 'detail-protection'],
      },
      {
        name: 'Model Consistency Negative',
        type: PromptType.NEGATIVE,
        category: PromptCategoryType.MODEL,
        content: 'changed facial features, altered face shape, different eye color, modified skin texture, changed hair color, altered hair style, different body proportions, changed height, modified body type, inconsistent skin tone, age change, different ethnicity than reference, altered makeup, changed jewelry, missing accessories from reference',
        priority: 95,
        tags: ['negative', 'model', 'consistency', 'face-preservation'],
      },

      // REFERENCE IMAGE QUALITY PRESERVATION Templates
      {
        name: 'Product Detail Preservation',
        type: PromptType.MASTER,
        category: PromptCategoryType.PRODUCT,
        content: 'Preserve all original product details exactly as shown in the reference image. Maintain the exact fabric texture, color accuracy, pattern alignment, stitching details, button placement, zipper visibility, logo positioning, and garment silhouette. The product must appear identical to the reference with no simplification or alteration of design elements. True-to-life color reproduction matching the exact hue, saturation, and brightness of the original. Fabric drape and material properties must be accurately represented.',
        priority: 100,
        tags: ['reference', 'preservation', 'product-detail', 'accuracy'],
      },
      {
        name: 'Model Feature Preservation',
        type: PromptType.MASTER,
        category: PromptCategoryType.MODEL,
        content: 'Preserve the exact facial features, skin tone, and body proportions from the model reference image. Maintain consistent face shape, eye color, nose structure, lip shape, and overall facial identity. Keep the exact skin texture and complexion. Preserve hair color, style, length, and texture precisely. Body type, height proportions, and physical characteristics must remain unchanged. Any accessories, jewelry, or makeup from the reference should be accurately maintained.',
        priority: 100,
        tags: ['reference', 'preservation', 'model', 'facial-identity'],
      },
      {
        name: 'High Fidelity Reference Merge',
        type: PromptType.MASTER,
        category: PromptCategoryType.GENERAL,
        content: 'Combine the provided reference images with maximum fidelity preservation. The product reference image dictates all garment details: exact colors, patterns, textures, and design elements. The model reference image controls all human features: face, body, skin, and proportions. Merge these elements seamlessly while preserving 100% accuracy to both references. No creative interpretation or alteration of referenced elements. Only the pose, scene, and lighting should be modified according to the prompt.',
        priority: 100,
        tags: ['reference', 'merge', 'high-fidelity', 'dual-reference'],
      },
      {
        name: 'Texture and Material Accuracy',
        type: PromptType.STYLE,
        category: PromptCategoryType.QUALITY,
        content: 'Render all fabric textures with photographic accuracy: silk shows its characteristic sheen, cotton displays its soft matte finish, leather maintains its grain pattern, denim preserves its weave texture, lace retains its intricate pattern, velvet shows its directional pile, satin captures its smooth reflectivity, wool displays its fibrous texture, mesh shows its transparency pattern. Material properties like drape, stiffness, stretch, and weight must be visually accurate.',
        priority: 90,
        tags: ['texture', 'material', 'accuracy', 'fabric'],
      },
      {
        name: 'Color Fidelity',
        type: PromptType.STYLE,
        category: PromptCategoryType.QUALITY,
        content: 'Maintain exact color fidelity from reference images. Whites remain pure white without color cast. Blacks are deep and true. Reds, blues, greens, and all colors match the reference exactly. No color shifting, no over-saturation, no desaturation. Pattern colors maintain their exact relationship to each other. Metallic elements reflect accurately. Skin tones are natural and true to reference. The lighting enhances but never distorts original colors.',
        priority: 90,
        tags: ['color', 'fidelity', 'accuracy', 'reference'],
      },
    ];

    for (const template of templates) {
      const exists = await this.prisma.promptTemplate.findFirst({
        where: { name: template.name },
      });
      if (!exists) {
        await this.prisma.promptTemplate.create({
          data: {
            ...template,
            isActive: true,
          },
        });
      }
    }
    this.logger.log('Master prompt templates ensured (Nano Banana Pro optimized).');
  }

  private async ensureDefaultPresets() {
    const presets = [
      {
        name: 'Beach Summer Collection',
        description: 'Optimized for swimwear and summer clothing with tropical beach setting and golden hour lighting',
        scenePrompt: 'A stunning tropical beach setting during golden hour. Crystal clear turquoise water gently lapping at white sand shores. Swaying palm trees frame the composition. The sky displays warm orange and pink sunset hues.',
        posePrompt: 'A relaxed, approachable pose with natural weight distribution. One leg slightly bent, creating an S-curve silhouette. Hands loosely at sides. The posture is comfortable and unforced with a soft, genuine smile.',
        lightingPrompt: 'Warm, natural golden hour sunlight during the magic hour before sunset. The light creates a soft, warm glow with elongated gentle shadows. Color temperature is warm orange-yellow. Skin tones appear warm and healthy.',
        stylePrompt: 'Authentic lifestyle photography style that feels natural and unposed. The aesthetic is warm, relatable, and approachable. The vibe is modern and vacation-ready.',
        negativePrompt: 'blurry, low quality, distorted, deformed, bad anatomy, harsh shadows, overexposed, underexposed, unnatural skin tones, awkward pose, stiff pose, watermark, text',
        tags: ['beach', 'summer', 'swimwear', 'golden-hour', 'tropical'],
      },
      {
        name: 'Studio E-commerce Clean',
        description: 'Professional studio setup for clean e-commerce product photography',
        scenePrompt: 'A clean, professional photography studio with seamless white cyclorama background. The infinite white backdrop creates a floating effect. No visible floor-wall transitions. Pure, distraction-free environment.',
        posePrompt: 'The model stands tall with excellent posture, one hand resting naturally on the hip. Feet shoulder-width apart creating a stable, confident stance. The body is angled slightly at three-quarters to the camera with a direct, engaging gaze.',
        lightingPrompt: 'Professional three-point lighting setup with large softboxes. Key light positioned 45 degrees creating gentle shadows. Fill light reduces contrast while maintaining dimension. Even, flattering illumination with no harsh shadows.',
        stylePrompt: 'Clean, crisp commercial photography optimized for e-commerce. The focus is entirely on the product with maximum clarity. Color accuracy is paramount for true-to-life representation. Professional and purchase-driving.',
        negativePrompt: 'blurry, low quality, pixelated, distorted, wrong proportions, amateur, shadows, background clutter, visible tags, clothing wrinkles, product not visible, bad framing',
        tags: ['studio', 'ecommerce', 'clean', 'professional', 'commercial'],
      },
      {
        name: 'Urban Streetwear',
        description: 'Contemporary urban street style for streetwear and casual fashion',
        scenePrompt: 'A contemporary urban street environment with modern architecture. Clean concrete sidewalks and sleek glass buildings in the background. The setting has a cosmopolitan, fashion-forward atmosphere with urban textures.',
        posePrompt: 'The model captured mid-stride in a natural walking motion. One leg forward, creating dynamic movement energy. Arms swing naturally. The walk is runway-inspired but authentic. Expression is focused and confident.',
        lightingPrompt: 'Natural street lighting with dynamic shadows creating depth and dimension. Daylight illumination that feels authentic to the urban environment. Contrast levels are moderate to add visual interest.',
        stylePrompt: 'Contemporary streetwear aesthetic with urban culture influence. The style is edgy, youthful, and trend-forward. Photography has an energetic, authentic street fashion feel with bold, confident attitude.',
        negativePrompt: 'blurry, low quality, distorted, unflattering angles, stiff pose, forced expression, overprocessed, unnatural colors, background clutter, distracting elements',
        tags: ['urban', 'street', 'streetwear', 'city', 'contemporary', 'dynamic'],
      },
      {
        name: 'Luxury Editorial',
        description: 'High-end luxury fashion editorial style for premium products',
        scenePrompt: 'An upscale luxury interior setting with elegant furnishings. Soft neutral color palette with marble surfaces and designer furniture visible in the background. Large windows allowing natural light to flood the space. The environment exudes sophistication.',
        posePrompt: 'The model is seated gracefully on an elegant surface. Legs positioned elegantly, angled to the side. Upper body remains upright with excellent posture. Hands rest naturally. The seated position is sophisticated and polished.',
        lightingPrompt: 'Dramatic side lighting creating strong contrast and artistic shadows. Single key light positioned at an angle to sculpt features and fabric textures. The mood is more artistic and editorial with premium feel.',
        stylePrompt: 'High fashion editorial aesthetic reminiscent of Vogue and Elle magazines. Sophisticated, polished, and aspirational imagery. Strong visual impact with attention to composition. Premium luxury brand sensibility.',
        negativePrompt: 'blurry, low quality, casual feel, everyday look, amateur lighting, flat composition, ordinary setting, budget aesthetic, poor posture, unflattering angles',
        tags: ['luxury', 'editorial', 'high-fashion', 'elegant', 'sophisticated', 'premium'],
      },
    ];

    for (const preset of presets) {
      const exists = await this.prisma.promptPreset.findFirst({
        where: { name: preset.name },
      });
      if (!exists) {
        await this.prisma.promptPreset.create({
          data: {
            ...preset,
            isActive: true,
          },
        });
      }
    }
    this.logger.log('Default prompt presets ensured (Nano Banana Pro optimized).');
  }
}

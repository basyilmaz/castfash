export const SCENE_PACKS: Array<{
  name: string;
  slug: string;
  description?: string;
  isPublic?: boolean;
  isPremium?: boolean;
  category?: string;
  tags?: string;
  sceneNames: string[];
}> = [
  {
    name: 'Studio Essentials',
    slug: 'studio-essentials',
    description: 'Soft light studio presets for clean catalog and e-commerce shots.',
    isPublic: true,
    isPremium: false,
    category: 'studio',
    tags: 'studio, e-commerce, catalog',
    sceneNames: ['Studio Soft Light', 'Minimal Grey', 'Minimal White Wall'],
  },
  {
    name: 'Beach & Pool',
    slug: 'beach-pool',
    description: 'Outdoor swimwear presets for beach and poolside production.',
    isPublic: true,
    isPremium: false,
    category: 'beach',
    tags: 'beach, pool, swimwear, summer',
    sceneNames: ['Beach Golden Hour', 'Pool Daylight'],
  },
  {
    name: 'Luxury & Lifestyle',
    slug: 'luxury-lifestyle',
    description: 'Premium indoor & rooftop lifestyle locations.',
    isPublic: true,
    isPremium: false,
    category: 'luxury',
    tags: 'luxury, lifestyle, indoor, rooftop',
    sceneNames: ['Luxury Penthouse', 'Urban Rooftop', 'Lifestyle Living Room'],
  },
  {
    name: 'Natural & Home',
    slug: 'natural-home',
    description: 'Cozy bedroom, living room and garden presets for lifestyle shots.',
    isPublic: true,
    isPremium: false,
    category: 'indoor',
    tags: 'home, bedroom, garden, natural, lifestyle',
    sceneNames: ['Indoor Bedroom Natural Light', 'Lifestyle Living Room', 'Outdoor Garden'],
  },
];

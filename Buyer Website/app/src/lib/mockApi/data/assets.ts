import type { Asset } from '@/types';

const sellers = [
  { id: 's1', name: 'Maya Chen', username: 'mayadesigns', avatar: '/images/avatar-1.jpg', level: 'top' as const, rating: 4.9, reviewCount: 284 },
  { id: 's2', name: 'James Wilson', username: 'jwcreative', avatar: '/images/avatar-2.jpg', level: 'level2' as const, rating: 4.8, reviewCount: 156 },
  { id: 's3', name: 'Alex Rivera', username: 'aristudios', avatar: '/images/avatar-3.jpg', level: 'top' as const, rating: 4.9, reviewCount: 421 },
  { id: 's4', name: 'Zara Williams', username: 'zaraart', avatar: '/images/avatar-4.jpg', level: 'level1' as const, rating: 4.7, reviewCount: 89 },
];

export const mockAssets: Asset[] = [
  {
    id: '1', slug: 'neon-social-pack', title: 'Neon Social Media Template Pack',
    type: 'template', price: 0, isFree: true, previewUrl: '/images/asset-template-1.jpg',
    seller: sellers[0], tags: ['social media', 'instagram', 'neon'], downloadCount: 12500,
    rating: 4.8, reviewCount: 234, format: 'PSD', dimensions: '1080x1080', fileSize: '45 MB',
    license: 'free', description: 'Complete social media template pack with neon aesthetic. Includes 30+ post templates, story templates, and highlight covers.', createdAt: '2025-03-15', category: 'Social Media',
  },
  {
    id: '2', slug: 'cyber-city-night', title: 'Cyberpunk City Nightscape',
    type: 'image', price: 12, isFree: false, previewUrl: '/images/asset-image-1.jpg',
    seller: sellers[1], tags: ['city', 'cyberpunk', 'night'], downloadCount: 8900,
    rating: 4.9, reviewCount: 178, format: 'JPG', dimensions: '3840x2160', fileSize: '8.2 MB',
    license: 'standard', description: 'Stunning 4K cyberpunk cityscape at night with neon reflections. Perfect for backgrounds, prints, and digital art projects.', createdAt: '2025-02-20', category: 'Photography',
  },
  {
    id: '3', slug: 'ink-flow-abstract', title: 'Abstract Ink Flow Video',
    type: 'video', price: 29, isFree: false, previewUrl: '/images/asset-video-1.jpg',
    seller: sellers[2], tags: ['abstract', 'ink', 'liquid'], downloadCount: 5400,
    rating: 4.7, reviewCount: 112, format: 'MP4', dimensions: '1920x1080', fileSize: '124 MB',
    license: 'standard', description: 'Mesmerizing slow-motion ink dispersion in water. 10 seconds of looping 4K footage.', createdAt: '2025-04-01', category: 'Video',
  },
  {
    id: '4', slug: 'crystal-3d-shapes', title: 'Crystal 3D Geometric Collection',
    type: '3d', price: 45, isFree: false, previewUrl: '/images/asset-3d-1.jpg',
    seller: sellers[3], tags: ['3d', 'crystal', 'geometric'], downloadCount: 3200,
    rating: 4.8, reviewCount: 67, format: 'GLB', dimensions: 'Various', fileSize: '78 MB',
    license: 'extended', description: 'High-quality 3D crystal geometric shapes with PBR materials. Compatible with Blender, C4D, and Unity.', createdAt: '2025-01-10', category: '3D',
  },
  {
    id: '5', slug: 'gradient-wave-pack', title: 'Gradient Wave Backgrounds',
    type: 'template', price: 8, isFree: false, previewUrl: '/images/asset-abstract-1.jpg',
    seller: sellers[0], tags: ['background', 'gradient', 'abstract'], downloadCount: 15200,
    rating: 4.6, reviewCount: 301, format: 'AI', dimensions: 'Vector', fileSize: '12 MB',
    license: 'standard', description: 'Set of 20 abstract gradient wave backgrounds in editable vector format.', createdAt: '2025-03-22', category: 'Illustration',
  },
  {
    id: '6', slug: 'dark-dashboard-ui', title: 'Dark Dashboard UI Kit',
    type: 'template', price: 35, isFree: false, previewUrl: '/images/asset-ui-1.jpg',
    seller: sellers[1], tags: ['ui kit', 'dashboard', 'dark theme'], downloadCount: 9800,
    rating: 4.9, reviewCount: 245, format: 'Figma', dimensions: 'Multiple', fileSize: '32 MB',
    license: 'standard', description: 'Complete dark-themed dashboard UI kit with 200+ components, charts, and data visualization elements.', createdAt: '2025-02-28', category: 'UI/UX',
  },
  {
    id: '7', slug: 'cyberpunk-street-photo', title: 'Neon Street Photography',
    type: 'image', price: 15, isFree: false, previewUrl: '/images/asset-photo-1.jpg',
    seller: sellers[2], tags: ['street', 'neon', 'cyberpunk'], downloadCount: 6700,
    rating: 4.8, reviewCount: 134, format: 'JPG', dimensions: '4000x3000', fileSize: '11 MB',
    license: 'standard', description: 'Cyberpunk street photography with neon signs and rain-slicked streets. High resolution for print.', createdAt: '2025-03-05', category: 'Photography',
  },
  {
    id: '8', slug: 'neon-geo-frame', title: 'Neon Geometric Frame Set',
    type: 'template', price: 0, isFree: true, previewUrl: '/images/asset-geo-1.jpg',
    seller: sellers[3], tags: ['geometric', 'frame', 'neon'], downloadCount: 22100,
    rating: 4.5, reviewCount: 412, format: 'PNG', dimensions: '4000x4000', fileSize: '24 MB',
    license: 'free', description: 'Collection of neon geometric frames and borders with transparent backgrounds.', createdAt: '2025-04-10', category: 'Social Media',
  },
  {
    id: '9', slug: 'aeon-font-family', title: 'Aeon Sans Font Family',
    type: 'font', price: 49, isFree: false, previewUrl: '/images/asset-font-1.jpg',
    seller: sellers[0], tags: ['font', 'sans-serif', 'modern'], downloadCount: 4100,
    rating: 4.9, reviewCount: 89, format: 'OTF/TTF', dimensions: 'Variable', fileSize: '3.2 MB',
    license: 'extended', description: 'Modern geometric sans-serif font family with 9 weights and variable font support.', createdAt: '2025-01-25', category: 'Typography',
  },
  {
    id: '10', slug: 'motion-graphics-pack', title: 'Motion Graphics Starter Pack',
    type: 'motion', price: 59, isFree: false, previewUrl: '/images/collection-motion.jpg',
    seller: sellers[2], tags: ['motion', 'after effects', 'animation'], downloadCount: 2800,
    rating: 4.7, reviewCount: 56, format: 'AEP', dimensions: '1920x1080', fileSize: '156 MB',
    license: 'standard', description: '50+ motion graphics elements, transitions, and lower thirds for After Effects.', createdAt: '2025-03-18', category: 'Motion',
  },
  {
    id: '11', slug: 'glass-morphism-cards', title: 'Glassmorphism Card Templates',
    type: 'template', price: 18, isFree: false, previewUrl: '/images/asset-template-1.jpg',
    seller: sellers[1], tags: ['glassmorphism', 'cards', 'ui'], downloadCount: 8300,
    rating: 4.6, reviewCount: 167, format: 'PSD', dimensions: '1080x1920', fileSize: '28 MB',
    license: 'standard', description: 'Premium glassmorphism card templates for mobile apps and web design.', createdAt: '2025-02-14', category: 'UI/UX',
  },
  {
    id: '12', slug: 'purple-wave-abstract', title: 'Purple Wave Abstract Art',
    type: 'image', price: 0, isFree: true, previewUrl: '/images/asset-abstract-1.jpg',
    seller: sellers[3], tags: ['abstract', 'wave', 'purple'], downloadCount: 18500,
    rating: 4.4, reviewCount: 298, format: 'JPG', dimensions: '5000x3500', fileSize: '6.5 MB',
    license: 'free', description: 'Beautiful abstract purple wave art for backgrounds and digital projects.', createdAt: '2025-04-05', category: 'Illustration',
  },
];

export function getTrendingAssets(): Asset[] {
  return [...mockAssets].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 12);
}

export function getAssetBySlug(slug: string): Asset | undefined {
  return mockAssets.find((a) => a.slug === slug);
}

export function getRelatedAssets(id: string): Asset[] {
  return mockAssets.filter((a) => a.id !== id).slice(0, 4);
}

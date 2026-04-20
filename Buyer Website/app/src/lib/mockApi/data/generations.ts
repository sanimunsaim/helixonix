import type { Generation, AITool } from '@/types';

export const mockTools: AITool[] = [
  {
    id: 'text-to-image', name: 'Text to Image', description: 'Generate stunning images from text descriptions. Create anything from photorealistic scenes to abstract art.', creditCost: 10,
    icon: 'Sparkles', gradientColors: ['#00D4FF', '#8B2FFF'],
    parameters: [
      { name: 'style', type: 'select', label: 'Style Preset', options: ['Cinematic', 'Anime', 'Photorealistic', 'Abstract', 'Digital Art'], default: 'Cinematic' },
      { name: 'aspectRatio', type: 'select', label: 'Aspect Ratio', options: ['1:1', '16:9', '9:16', '4:3', '21:9'], default: '1:1' },
      { name: 'quality', type: 'select', label: 'Quality', options: ['Standard', 'HD', '4K'], default: 'HD' },
      { name: 'seed', type: 'number', label: 'Seed', description: 'Optional seed for reproducibility' },
    ],
  },
  {
    id: 'text-to-video', name: 'Text to Video', description: 'Transform text prompts into short cinematic video clips with smooth motion.', creditCost: 25,
    icon: 'Clapperboard', gradientColors: ['#E040FB', '#00D4FF'],
    parameters: [
      { name: 'duration', type: 'select', label: 'Duration', options: ['3s', '5s', '10s'], default: '5s' },
      { name: 'camera', type: 'select', label: 'Camera Motion', options: ['Static', 'Pan Left', 'Pan Right', 'Zoom In', 'Zoom Out', 'Orbit'], default: 'Static' },
      { name: 'fps', type: 'select', label: 'Frame Rate', options: ['24', '30', '60'], default: '30' },
    ],
  },
  {
    id: 'image-to-image', name: 'Image to Image', description: 'Transform existing images with AI. Apply styles, modify elements, or enhance quality.', creditCost: 15,
    icon: 'ImagePlus', gradientColors: ['#8B2FFF', '#E040FB'],
    parameters: [
      { name: 'strength', type: 'slider', label: 'Transformation Strength', min: 0, max: 100, default: 50 },
      { name: 'style', type: 'select', label: 'Target Style', options: ['Cinematic', 'Anime', 'Oil Painting', 'Sketch', '3D Render'], default: 'Cinematic' },
    ],
  },
  {
    id: 'image-to-video', name: 'Image to Video', description: 'Bring static images to life with AI-powered motion and animation.', creditCost: 20,
    icon: 'Film', gradientColors: ['#00D4FF', '#E040FB'],
    parameters: [
      { name: 'duration', type: 'select', label: 'Duration', options: ['3s', '5s', '10s'], default: '5s' },
      { name: 'motion', type: 'select', label: 'Motion Type', options: ['Slow Pan', 'Zoom', 'Parallax', 'Cinematic'], default: 'Slow Pan' },
    ],
  },
  {
    id: 'video-to-video', name: 'Video to Video', description: 'Restyle and transform videos with AI. Apply artistic styles or enhance quality.', creditCost: 35,
    icon: 'Video', gradientColors: ['#E040FB', '#8B2FFF'],
    parameters: [
      { name: 'style', type: 'select', label: 'Target Style', options: ['Anime', 'Cinematic', 'Watercolor', 'Cyberpunk', 'Vintage'], default: 'Cinematic' },
      { name: 'fps', type: 'select', label: 'Output FPS', options: ['24', '30', '60'], default: '30' },
    ],
  },
  {
    id: 'text-to-audio', name: 'Text to Audio', description: 'Generate music, sound effects, and voice from text descriptions.', creditCost: 12,
    icon: 'Music', gradientColors: ['#00D4FF', '#8B2FFF'],
    parameters: [
      { name: 'type', type: 'select', label: 'Audio Type', options: ['Music', 'Sound Effects', 'Voice'], default: 'Music' },
      { name: 'duration', type: 'select', label: 'Duration', options: ['5s', '15s', '30s', '60s'], default: '30s' },
      { name: 'mood', type: 'select', label: 'Mood', options: ['Epic', 'Calm', 'Energetic', 'Dark', 'Uplifting'], default: 'Epic' },
    ],
  },
  {
    id: 'audio-to-video', name: 'Audio to Video', description: 'Create synchronized visualizations and music videos from audio tracks.', creditCost: 30,
    icon: 'AudioLines', gradientColors: ['#8B2FFF', '#00D4FF'],
    parameters: [
      { name: 'style', type: 'select', label: 'Visual Style', options: ['Waveform', 'Particles', 'Abstract', 'Cinematic'], default: 'Particles' },
      { name: 'colorScheme', type: 'select', label: 'Color Scheme', options: ['Neon', 'Pastel', 'Monochrome', 'Vibrant'], default: 'Neon' },
    ],
  },
  {
    id: 'image-upscale', name: 'Image Upscale', description: 'Enhance image resolution up to 4x with AI-powered super-resolution.', creditCost: 8,
    icon: 'Maximize2', gradientColors: ['#E040FB', '#00D4FF'],
    parameters: [
      { name: 'scale', type: 'select', label: 'Upscale Factor', options: ['2x', '4x'], default: '2x' },
      { name: 'denoise', type: 'toggle', label: 'Denoise', default: true },
      { name: 'enhance', type: 'toggle', label: 'Detail Enhancement', default: true },
    ],
  },
];

export const mockGenerations: Generation[] = [
  {
    id: 'gen1', toolType: 'text-to-image', prompt: 'Futuristic cyberpunk cityscape with neon lights and flying cars',
    thumbnail: '/images/asset-image-1.jpg', outputUrl: '/images/asset-image-1.jpg',
    date: '2025-04-15', creditsUsed: 10, status: 'completed', parameters: { style: 'Cinematic', aspectRatio: '16:9' }, saved: true,
  },
  {
    id: 'gen2', toolType: 'text-to-image', prompt: 'Abstract flowing liquid mercury in dark void with cyan reflections',
    thumbnail: '/images/asset-abstract-1.jpg', outputUrl: '/images/asset-abstract-1.jpg',
    date: '2025-04-14', creditsUsed: 10, status: 'completed', parameters: { style: 'Abstract', aspectRatio: '1:1' }, saved: false,
  },
  {
    id: 'gen3', toolType: 'image-to-video', prompt: 'Animate the crystal 3D shapes with slow rotation',
    thumbnail: '/images/asset-3d-1.jpg', outputUrl: '/images/asset-3d-1.jpg',
    date: '2025-04-12', creditsUsed: 20, status: 'completed', parameters: { duration: '5s', motion: 'Slow Pan' }, saved: true,
  },
  {
    id: 'gen4', toolType: 'text-to-image', prompt: 'Neon geometric portal with glowing edges in dark space',
    thumbnail: '/images/asset-geo-1.jpg', outputUrl: '/images/asset-geo-1.jpg',
    date: '2025-04-10', creditsUsed: 10, status: 'completed', parameters: { style: 'Digital Art', aspectRatio: '1:1' }, saved: false,
  },
  {
    id: 'gen5', toolType: 'image-upscale', prompt: 'Upscale the cyberpunk street photo to 4K',
    thumbnail: '/images/asset-photo-1.jpg', outputUrl: '/images/asset-photo-1.jpg',
    date: '2025-04-08', creditsUsed: 8, status: 'completed', parameters: { scale: '4x' }, saved: true,
  },
];

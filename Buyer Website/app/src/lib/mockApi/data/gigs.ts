import type { Gig } from '@/types';
import { mockSellers } from './sellers';

const sellers = mockSellers;

export const mockGigs: Gig[] = [
  {
    id: 'g1', slug: 'brand-identity-package', title: 'Complete Brand Identity Package',
    seller: sellers[0], thumbnail: '/images/service-branding.jpg',
    gallery: ['/images/service-branding.jpg', '/images/collection-brand.jpg'],
    rating: 4.9, reviewCount: 156, startingPrice: 299, deliveryTime: '7 days',
    category: 'Branding', description: 'I will create a complete brand identity system including logo design, color palette, typography, brand guidelines, and collateral templates.',
    faq: [
      { q: 'What is included in the package?', a: 'Logo design, color palette, typography system, brand guidelines PDF, business card design, and social media templates.' },
      { q: 'How many revisions are included?', a: '3 rounds of revisions are included in all packages.' },
    ],
    packages: [
      { name: 'basic', price: 299, deliveryTime: '7 days', revisions: 2, features: ['Logo Design', 'Color Palette', '2 Revisions'], description: 'Essential brand starter kit' },
      { name: 'standard', price: 499, deliveryTime: '10 days', revisions: 3, features: ['Logo Design', 'Color Palette', 'Typography', 'Brand Guidelines', '3 Revisions'], description: 'Complete brand identity system' },
      { name: 'premium', price: 899, deliveryTime: '14 days', revisions: 5, features: ['Everything in Standard', 'Social Media Kit', 'Stationery Design', 'Brand Strategy', '5 Revisions'], description: 'Premium brand experience' },
    ],
    addOns: [
      { name: 'Extra Fast Delivery', price: 50, description: 'Deliver in 3 days instead of 7' },
      { name: 'Social Media Kit', price: 75, description: 'Templates for all major platforms' },
      { name: 'Source Files', price: 30, description: 'All working files included' },
    ],
  },
  {
    id: 'g2', slug: 'commercial-video-production', title: 'Professional Commercial Video Production',
    seller: sellers[1], thumbnail: '/images/service-video.jpg',
    gallery: ['/images/service-video.jpg', '/images/collection-cinematic.jpg'],
    rating: 4.8, reviewCount: 89, startingPrice: 199, deliveryTime: '5 days',
    category: 'Video Production', description: 'High-quality commercial video production for your brand. From concept to final delivery.',
    faq: [
      { q: 'What type of videos do you create?', a: 'Product demos, brand stories, social media ads, explainer videos, and more.' },
      { q: 'Do you provide voiceover?', a: 'Voiceover can be added as an extra service with professional talent.' },
    ],
    packages: [
      { name: 'basic', price: 199, deliveryTime: '5 days', revisions: 1, features: ['30-second video', 'Basic editing', 'Stock footage', '1 Revision'], description: 'Quick social media video' },
      { name: 'standard', price: 449, deliveryTime: '7 days', revisions: 2, features: ['60-second video', 'Advanced editing', 'Custom graphics', 'Music licensing', '2 Revisions'], description: 'Professional commercial' },
      { name: 'premium', price: 799, deliveryTime: '10 days', revisions: 3, features: ['2-minute video', 'Cinematic editing', 'Motion graphics', 'Licensed music', 'Color grading', '3 Revisions'], description: 'Cinematic production' },
    ],
    addOns: [
      { name: 'Voiceover', price: 100, description: 'Professional voiceover talent' },
      { name: '4K Delivery', price: 50, description: 'Ultra HD output' },
    ],
  },
  {
    id: 'g3', slug: 'ai-automation-workflow', title: 'AI-Powered Creative Automation',
    seller: sellers[3], thumbnail: '/images/service-ai.jpg',
    gallery: ['/images/service-ai.jpg'],
    rating: 4.7, reviewCount: 45, startingPrice: 149, deliveryTime: '3 days',
    category: 'AI Automation', description: 'Automate your creative workflow with custom AI pipelines for image generation, batch processing, and content creation.',
    faq: [
      { q: 'What AI tools do you use?', a: 'I work with Stable Diffusion, Midjourney, ComfyUI, and custom Python pipelines.' },
      { q: 'Can you integrate with my existing tools?', a: 'Yes, I can create API integrations with most creative tools and CMS platforms.' },
    ],
    packages: [
      { name: 'basic', price: 149, deliveryTime: '3 days', revisions: 1, features: ['Single AI pipeline', 'Basic automation', 'Documentation'], description: 'Single workflow automation' },
      { name: 'standard', price: 349, deliveryTime: '5 days', revisions: 2, features: ['3 AI pipelines', 'API integration', 'Custom prompts', 'Training session'], description: 'Multi-pipeline system' },
      { name: 'premium', price: 699, deliveryTime: '7 days', revisions: 3, features: ['Unlimited pipelines', 'Full integration', 'Ongoing support', 'Custom model training'], description: 'Enterprise automation' },
    ],
    addOns: [
      { name: 'Priority Support', price: 100, description: '30 days of priority support' },
      { name: 'Training Session', price: 75, description: '1-hour live training' },
    ],
  },
  {
    id: 'g4', slug: '3d-motion-graphics', title: '3D Motion Graphics & Animation',
    seller: sellers[2], thumbnail: '/images/service-motion.jpg',
    gallery: ['/images/service-motion.jpg', '/images/asset-3d-1.jpg'],
    rating: 4.9, reviewCount: 112, startingPrice: 249, deliveryTime: '5 days',
    category: 'Motion Graphics', description: 'Stunning 3D motion graphics and animation for brands, products, and entertainment.',
    faq: [
      { q: 'What software do you use?', a: 'Cinema 4D, Blender, After Effects, and Octane Render.' },
      { q: 'Can you work with my 3D models?', a: 'Yes, I can animate and render your existing 3D assets.' },
    ],
    packages: [
      { name: 'basic', price: 249, deliveryTime: '5 days', revisions: 2, features: ['15-second animation', '2 scenes', 'Basic materials'], description: 'Short motion graphic' },
      { name: 'standard', price: 499, deliveryTime: '8 days', revisions: 3, features: ['30-second animation', '4 scenes', 'Advanced materials', 'Sound design'], description: 'Full motion piece' },
      { name: 'premium', price: 999, deliveryTime: '12 days', revisions: 5, features: ['60-second animation', '8 scenes', 'Photorealistic rendering', 'Full sound design', 'Source files'], description: 'Cinematic animation' },
    ],
    addOns: [
      { name: '4K Render', price: 100, description: 'Ultra high-definition output' },
      { name: 'Rush Delivery', price: 150, description: '50% faster delivery' },
    ],
  },
  {
    id: 'g5', slug: 'storytelling-content', title: 'Brand Storytelling & Content Strategy',
    seller: sellers[0], thumbnail: '/images/collection-cinematic.jpg',
    gallery: ['/images/collection-cinematic.jpg'],
    rating: 4.8, reviewCount: 78, startingPrice: 399, deliveryTime: '10 days',
    category: 'Storytelling', description: 'Compelling brand narratives and content strategies that connect with your audience emotionally.',
    faq: [
      { q: 'What industries do you specialize in?', a: 'Tech, lifestyle, fashion, and sustainable brands.' },
      { q: 'Do you include visual direction?', a: 'Yes, all packages include visual mood boards and direction.' },
    ],
    packages: [
      { name: 'basic', price: 399, deliveryTime: '10 days', revisions: 2, features: ['Brand narrative', 'Content calendar', '1 month plan'], description: 'Story foundation' },
      { name: 'standard', price: 699, deliveryTime: '14 days', revisions: 3, features: ['Full brand story', '3-month strategy', 'Visual direction', 'Content templates'], description: 'Complete strategy' },
      { name: 'premium', price: 1299, deliveryTime: '21 days', revisions: 5, features: ['Everything in Standard', '6-month plan', 'Campaign concepts', 'Video scripts', 'Ongoing consultation'], description: 'Premium storytelling' },
    ],
    addOns: [
      { name: 'Video Script', price: 200, description: 'Professional video scripts' },
      { name: 'Competitive Analysis', price: 150, description: 'Market and competitor research' },
    ],
  },
  {
    id: 'g6', slug: 'product-photography', title: 'Premium Product Photography',
    seller: sellers[1], thumbnail: '/images/service-video.jpg',
    gallery: ['/images/service-video.jpg', '/images/asset-image-1.jpg'],
    rating: 4.7, reviewCount: 63, startingPrice: 99, deliveryTime: '3 days',
    category: 'Photography', description: 'High-end product photography for e-commerce, advertising, and catalogs.',
    faq: [
      { q: 'How many photos do I get?', a: 'Basic: 5 photos, Standard: 15 photos, Premium: 30 photos.' },
      { q: 'Do you offer photo editing?', a: 'Yes, all packages include professional retouching and color correction.' },
    ],
    packages: [
      { name: 'basic', price: 99, deliveryTime: '3 days', revisions: 1, features: ['5 product photos', 'White background', 'Basic retouching'], description: 'Essential product shots' },
      { name: 'standard', price: 249, deliveryTime: '5 days', revisions: 2, features: ['15 product photos', 'Lifestyle shots', 'Advanced retouching', 'Color grading'], description: 'Full product catalog' },
      { name: 'premium', price: 499, deliveryTime: '7 days', revisions: 3, features: ['30 product photos', 'Lifestyle + studio', 'Premium retouching', 'Social media crops'], description: 'Premium photography' },
    ],
    addOns: [
      { name: '360° View', price: 75, description: 'Interactive 360 product view' },
      { name: 'Extra Photos', price: 20, description: '5 additional photos' },
    ],
  },
];

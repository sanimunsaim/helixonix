import type { BlogPost } from '@/types';

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'b1', slug: 'ai-transforming-creative-work', title: 'How AI is Transforming Creative Work in 2025',
    excerpt: 'Explore the groundbreaking ways artificial intelligence is reshaping the creative industry, from generative design to automated workflows.',
    content: `Artificial intelligence has fundamentally changed how creatives approach their work. In 2025, we are seeing unprecedented integration of AI tools across the entire creative pipeline.

## The Rise of Generative Design

Generative AI has moved beyond novelty to become an essential tool in every creative professional's toolkit. From concept art to final production assets, AI is accelerating workflows while opening new creative possibilities.

## Workflow Automation

The biggest impact has been in workflow automation. Tasks that once took hours now take minutes:

- Background removal and masking
- Color grading and correction  
- Asset generation and variation
- Format conversion and optimization

## The Human-AI Partnership

The most successful creatives have learned to treat AI as a collaborative partner rather than a replacement. The key is using AI to handle repetitive tasks while focusing human creativity on strategy, storytelling, and emotional connection.

## Looking Forward

As we move deeper into 2025, expect to see even tighter integration between AI tools and traditional creative software. The boundary between AI-generated and human-created content will continue to blur.`,
    category: 'AI & Technology', tags: ['AI', 'Creative', 'Future', 'Design'],
    author: { name: 'Sarah Mitchell', avatar: '/images/avatar-1.jpg', bio: 'Tech journalist and creative industry analyst with 10+ years of experience.' },
    date: '2025-04-10', readTime: '6 min', featured: true,
    thumbnail: '/images/asset-image-1.jpg', coverImage: '/images/asset-image-1.jpg',
  },
  {
    id: 'b2', slug: 'motion-graphics-trends', title: 'Top 10 Motion Graphics Trends for 2025',
    excerpt: 'From kinetic typography to 3D integration, discover the motion design trends dominating screens this year.',
    content: `Motion graphics continue to evolve at a rapid pace. Here are the top trends defining the industry in 2025.

## Kinetic Typography 2.0

Typography is no longer static. The latest trend sees text becoming the primary visual element, with letters that morph, dance, and tell stories on their own.

## 3D-2D Hybrid Aesthetics

Designers are blending dimensional 3D elements with flat 2D design languages, creating unique visual styles that feel both modern and approachable.

## Generative Motion

AI-powered motion generation is allowing creators to produce complex animations from simple text descriptions, dramatically reducing production time.`,
    category: 'Motion Design', tags: ['Motion', 'Trends', 'Animation', '2025'],
    author: { name: 'Alex Rivera', avatar: '/images/avatar-3.jpg', bio: 'Motion designer and creative director specializing in brand animation.' },
    date: '2025-04-05', readTime: '5 min', featured: false,
    thumbnail: '/images/collection-motion.jpg', coverImage: '/images/collection-motion.jpg',
  },
  {
    id: 'b3', slug: 'brand-identity-systems', title: 'Building Scalable Brand Identity Systems',
    excerpt: 'Learn how to create flexible brand systems that grow with your business and maintain consistency across all touchpoints.',
    content: `A strong brand identity system is the foundation of every successful business. Here's how to build one that scales.

## Start With Strategy

Before any visual work begins, define your brand's core values, personality, and positioning. This strategic foundation will guide every design decision.

## Design for Flexibility

Modern brand systems need to work across dozens of touchpoints. Create modular components that can be assembled in countless combinations while maintaining visual consistency.

## Document Everything

A brand is only as strong as its guidelines. Create comprehensive documentation that covers usage rules, examples, and edge cases.`,
    category: 'Branding', tags: ['Branding', 'Identity', 'Design System', 'Strategy'],
    author: { name: 'Maya Chen', avatar: '/images/avatar-1.jpg', bio: 'Brand strategist and visual designer with a passion for cohesive identities.' },
    date: '2025-03-28', readTime: '8 min', featured: false,
    thumbnail: '/images/collection-brand.jpg', coverImage: '/images/collection-brand.jpg',
  },
  {
    id: 'b4', slug: 'color-grading-workflow', title: 'Professional Color Grading Workflow',
    excerpt: 'Master the art of color grading with this comprehensive guide to professional techniques and tools.',
    content: `Color grading is where good footage becomes cinematic. Learn the professional workflow used by top colorists.

## Understanding Color Science

Before touching any controls, understand how color works. Learn about color spaces, gamma curves, and how different displays interpret color data.

## The Grading Pipeline

1. Primary correction (exposure, contrast, balance)
2. Secondary corrections (selective adjustments)
3. Look development (creative grading)
4. Shot matching (consistency)
5. Output preparation (delivery specs)

## Tools of the Trade

While DaVinci Resolve remains the industry standard, tools like Baselight and Mistika offer powerful alternatives for high-end work.`,
    category: 'Video Production', tags: ['Color Grading', 'Video', 'Post-Production', 'Tutorial'],
    author: { name: 'James Wilson', avatar: '/images/avatar-2.jpg', bio: 'Professional colorist and cinematographer based in London.' },
    date: '2025-03-20', readTime: '7 min', featured: false,
    thumbnail: '/images/asset-video-1.jpg', coverImage: '/images/asset-video-1.jpg',
  },
  {
    id: 'b5', slug: '3d-workflow-optimization', title: 'Optimizing Your 3D Workflow for Speed',
    excerpt: 'Speed up your 3D production pipeline with these proven optimization techniques and tool recommendations.',
    content: `Time is money in 3D production. Here's how to optimize every stage of your workflow.

## Scene Optimization

Clean geometry, efficient materials, and smart instancing can reduce render times by 80% while maintaining visual quality.

## Render Engine Selection

Choose the right render engine for your project:
- **GPU rendering**: Best for fast iteration and real-time preview
- **CPU rendering**: Better for complex scenes and maximum quality
- **Hybrid**: The best of both worlds for most projects

## Asset Management

Organized asset libraries save hours of searching. Invest time in proper naming conventions and folder structures.`,
    category: '3D Design', tags: ['3D', 'Optimization', 'Workflow', 'Tutorial'],
    author: { name: 'Alex Rivera', avatar: '/images/avatar-3.jpg', bio: '3D artist and technical director with expertise in pipeline optimization.' },
    date: '2025-03-15', readTime: '6 min', featured: false,
    thumbnail: '/images/asset-3d-1.jpg', coverImage: '/images/asset-3d-1.jpg',
  },
  {
    id: 'b6', slug: 'creative-freelancing-tips', title: 'Building a Successful Creative Freelancing Career',
    excerpt: 'Practical advice from top freelancers on building a sustainable and profitable creative business.',
    content: `Freelancing in the creative industry can be incredibly rewarding. Here's how to build a career that lasts.

## Find Your Niche

Generalists struggle to command premium rates. Specialize in a specific area where you can become the go-to expert.

## Build Your Portfolio Strategically

Every piece in your portfolio should serve a purpose. Showcase the type of work you want to be hired for, not just what you've done.

## Pricing Psychology

Learn to price based on value, not time. Clients pay for outcomes, not hours worked.`,
    category: 'Business', tags: ['Freelancing', 'Business', 'Career', 'Tips'],
    author: { name: 'Zara Williams', avatar: '/images/avatar-4.jpg', bio: 'Creative entrepreneur and business coach helping freelancers thrive.' },
    date: '2025-03-08', readTime: '5 min', featured: false,
    thumbnail: '/images/service-branding.jpg', coverImage: '/images/service-branding.jpg',
  },
];

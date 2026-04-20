export interface Asset {
  id: string;
  slug: string;
  title: string;
  type: 'template' | 'image' | 'video' | 'audio' | '3d' | 'font' | 'motion';
  price: number;
  isFree: boolean;
  previewUrl: string;
  seller: Seller;
  tags: string[];
  downloadCount: number;
  rating: number;
  reviewCount: number;
  format: string;
  dimensions?: string;
  fileSize?: string;
  license: 'free' | 'standard' | 'extended';
  description: string;
  createdAt: string;
  category: string;
}

export interface Seller {
  id: string;
  name: string;
  username: string;
  avatar: string;
  level: 'top' | 'level2' | 'level1' | 'new';
  rating: number;
  reviewCount: number;
  location?: string;
  specialty?: string;
  bio?: string;
  responseRate?: number;
  deliveryRate?: number;
  totalSales?: number;
  languages?: string[];
  memberSince?: string;
  skills?: string[];
}

export interface Gig {
  id: string;
  slug: string;
  title: string;
  seller: Seller;
  thumbnail: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  startingPrice: number;
  deliveryTime: string;
  category: string;
  description: string;
  faq: { q: string; a: string }[];
  packages: GigPackage[];
  addOns: GigAddOn[];
}

export interface GigPackage {
  name: 'basic' | 'standard' | 'premium';
  price: number;
  deliveryTime: string;
  revisions: number;
  features: string[];
  description: string;
}

export interface GigAddOn {
  name: string;
  price: number;
  description: string;
}

export interface Order {
  id: string;
  gig: Gig;
  seller: Seller;
  status: 'active' | 'delivered' | 'completed' | 'disputed' | 'cancelled';
  amount: number;
  deadline: string;
  progress: number;
  package: GigPackage;
  addOns: GigAddOn[];
  messages: OrderMessage[];
  deliverables?: string[];
  createdAt: string;
}

export interface OrderMessage {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
  attachments?: string[];
}

export interface Generation {
  id: string;
  toolType: string;
  prompt: string;
  negativePrompt?: string;
  thumbnail: string;
  outputUrl: string;
  date: string;
  creditsUsed: number;
  status: 'completed' | 'failed' | 'processing';
  parameters: Record<string, unknown>;
  saved: boolean;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  creditCost: number;
  icon: string;
  gradientColors: [string, string];
  parameters: AIToolParameter[];
}

export interface AIToolParameter {
  name: string;
  type: 'select' | 'slider' | 'number' | 'text' | 'toggle';
  label: string;
  options?: string[];
  min?: number;
  max?: number;
  default?: string | number | boolean;
  description?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  items: Asset[];
  coverImages: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  rating: number;
  text: string;
  date: string;
  sellerResponse?: {
    text: string;
    date: string;
  };
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'buyer' | 'seller';
  plan: 'free' | 'pro' | 'team';
  credits: number;
  downloads: number;
  savedItems: number;
}

export interface Notification {
  id: string;
  type: 'order' | 'generation' | 'promotion' | 'system';
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  date: string;
  readTime: string;
  featured: boolean;
  thumbnail: string;
  coverImage: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  features: { text: string; included: boolean }[];
  highlighted?: boolean;
  cta: string;
}

// Dashboard KPI Data
export const dashboardKPIs = {
  revenue: { value: '$4,280.50', change: 12, changeLabel: 'vs last month' },
  activeOrders: { value: 8, change: 2, changeLabel: 'from last week' },
  pendingPayouts: { value: '$1,156.00', subtext: 'Available in 3 days' },
  profileViews: { value: '1,247', change: 8, changeLabel: 'vs last week' },
};

// Revenue chart data (30 days)
const generateRevenueData = () => {
  const data = [];
  const base = 100;
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.round(base + Math.random() * 200 + (29 - i) * 5),
    });
  }
  return data;
};

export const revenueChartData = generateRevenueData();

export const revenueChartData7d = revenueChartData.slice(-7);
export const revenueChartData90d = [
  ...revenueChartData,
  ...Array.from({ length: 60 }, (_, i) => ({
    date: `Day ${i + 30}`,
    revenue: Math.round(100 + Math.random() * 300),
  })),
];

// Order breakdown
export const orderBreakdown = [
  { name: 'Completed', value: 14, color: '#10B981' },
  { name: 'Active', value: 8, color: '#00D4FF' },
  { name: 'Cancelled', value: 2, color: '#EF4444' },
];

// Activity feed
export const activityFeed = [
  { id: 1, type: 'order', message: 'New order from Sarah M. \u2014 Logo Animation Gig', detail: '$120', time: '2 min ago', iconColor: '#00D4FF' },
  { id: 2, type: 'review', message: '5-star review received on Social Media Pack', detail: '\u2605\u2605\u2605\u2605\u2605', time: '1 hour ago', iconColor: '#F59E0B' },
  { id: 3, type: 'payout', message: 'Payout of $890.00 processed to PayPal', detail: '$890.00', time: '3 hours ago', iconColor: '#10B981' },
  { id: 4, type: 'asset', message: "Your asset 'Neon Poster Template' was approved", detail: 'Live', time: '5 hours ago', iconColor: '#8B2FFF' },
  { id: 5, type: 'order', message: 'Order #4829 marked as completed', detail: '$340', time: 'Yesterday', iconColor: '#00D4FF' },
  { id: 6, type: 'inquiry', message: 'New inquiry from BrandCo Agency', detail: 'View', time: 'Yesterday', iconColor: '#3B82F6' },
  { id: 7, type: 'asset', message: "Asset 'Glitch Overlay' received 50 downloads", detail: '+50', time: '2 days ago', iconColor: '#8B2FFF' },
  { id: 8, type: 'revision', message: 'Revision requested on Order #4812', detail: 'Urgent', time: '2 days ago', iconColor: '#EF4444' },
  { id: 9, type: 'gig', message: "Your gig 'Video Intro' was favorited 12 times", detail: '+12', time: '3 days ago', iconColor: '#E040FB' },
  { id: 10, type: 'system', message: 'Monthly analytics report is ready', detail: 'View', time: '3 days ago', iconColor: '#6B7280' },
];

// Top performers
export const topPerformers = [
  { id: 1, name: 'Neon Glitch Overlay Pack', type: 'Asset', sales: 47, revenue: '$1,410.00', rating: 4.9 },
  { id: 2, name: 'Logo Animation Gig', type: 'Gig', sales: 12, revenue: '$1,200.00', rating: 5.0 },
  { id: 3, name: 'Social Media Template Kit', type: 'Asset', sales: 89, revenue: '$2,670.00', rating: 4.8 },
  { id: 4, name: 'Video Intro Package', type: 'Gig', sales: 8, revenue: '$960.00', rating: 4.7 },
  { id: 5, name: '3D Icon Set - Tech', type: 'Asset', sales: 34, revenue: '$1,020.00', rating: 4.9 },
];

// Orders
export interface Order {
  id: string;
  buyer: { name: string; avatar: string; rating: number; memberSince: string; totalOrders: number };
  gig: string;
  package: 'Basic' | 'Standard' | 'Premium';
  amount: number;
  platformFee: number;
  earnings: number;
  status: 'active' | 'delivered' | 'completed' | 'disputed' | 'cancelled' | 'pending';
  deadline: string;
  createdAt: string;
  requirements?: { question: string; answer: string }[];
  timeline?: { step: string; completed: boolean; date?: string }[];
  messages?: { sender: 'buyer' | 'seller'; content: string; time: string }[];
}

export const orders: Order[] = [
  { id: '#4821', buyer: { name: 'Sarah Mitchell', avatar: '/assets/avatar-placeholder.jpg', rating: 4.9, memberSince: 'Jan 2023', totalOrders: 47 }, gig: 'Logo Animation - Professional', package: 'Standard', amount: 150, platformFee: 30, earnings: 120, status: 'active', deadline: '2025-04-22T18:00:00Z', createdAt: '2025-04-15', requirements: [{ question: 'What is your brand name?', answer: 'TechFlow Studios' }, { question: 'Preferred color scheme?', answer: 'Blue and orange' }], timeline: [{ step: 'Order Placed', completed: true, date: 'Apr 15, 2:30 PM' }, { step: 'Requirements Submitted', completed: true, date: 'Apr 15, 3:00 PM' }, { step: 'In Progress', completed: false }, { step: 'Delivered', completed: false }, { step: 'Completed', completed: false }], messages: [{ sender: 'buyer', content: 'Hi! Looking forward to working with you.', time: 'Apr 15, 2:35 PM' }, { sender: 'seller', content: 'Thanks Sarah! I\'ll get started right away.', time: 'Apr 15, 2:40 PM' }] },
  { id: '#4822', buyer: { name: 'BrandCo Agency', avatar: '/assets/avatar-placeholder.jpg', rating: 5.0, memberSince: 'Mar 2022', totalOrders: 128 }, gig: 'Social Media Pack - 30 Posts', package: 'Premium', amount: 450, platformFee: 90, earnings: 360, status: 'active', deadline: '2025-04-21T12:00:00Z', createdAt: '2025-04-14' },
  { id: '#4823', buyer: { name: 'Alex Johnson', avatar: '/assets/avatar-placeholder.jpg', rating: 4.7, memberSince: 'Jun 2024', totalOrders: 12 }, gig: 'Video Intro - Cinematic', package: 'Basic', amount: 75, platformFee: 15, earnings: 60, status: 'delivered', deadline: '2025-04-20T10:00:00Z', createdAt: '2025-04-13' },
  { id: '#4824', buyer: { name: 'Emma Davis', avatar: '/assets/avatar-placeholder.jpg', rating: 4.8, memberSince: 'Sep 2023', totalOrders: 23 }, gig: 'Motion Graphics - Explainer', package: 'Standard', amount: 200, platformFee: 40, earnings: 160, status: 'completed', deadline: '2025-04-18T15:00:00Z', createdAt: '2025-04-10' },
  { id: '#4825', buyer: { name: 'Creative Labs', avatar: '/assets/avatar-placeholder.jpg', rating: 4.6, memberSince: 'Nov 2022', totalOrders: 89 }, gig: 'Brand Identity Package', package: 'Premium', amount: 650, platformFee: 130, earnings: 520, status: 'disputed', deadline: '2025-04-19T20:00:00Z', createdAt: '2025-04-12' },
  { id: '#4826', buyer: { name: 'Mike Chen', avatar: '/assets/avatar-placeholder.jpg', rating: 4.9, memberSince: 'Jan 2024', totalOrders: 34 }, gig: '3D Product Render', package: 'Standard', amount: 280, platformFee: 56, earnings: 224, status: 'active', deadline: '2025-04-25T09:00:00Z', createdAt: '2025-04-16' },
  { id: '#4827', buyer: { name: 'Lisa Park', avatar: '/assets/avatar-placeholder.jpg', rating: 5.0, memberSince: 'Apr 2023', totalOrders: 56 }, gig: 'AI Art Collection', package: 'Basic', amount: 50, platformFee: 10, earnings: 40, status: 'completed', deadline: '2025-04-17T14:00:00Z', createdAt: '2025-04-09' },
  { id: '#4828', buyer: { name: 'StartupXYZ', avatar: '/assets/avatar-placeholder.jpg', rating: 4.5, memberSince: 'Aug 2024', totalOrders: 7 }, gig: 'Website Graphics Kit', package: 'Standard', amount: 180, platformFee: 36, earnings: 144, status: 'cancelled', deadline: '2025-04-16T11:00:00Z', createdAt: '2025-04-11' },
  { id: '#4829', buyer: { name: 'Rachel Green', avatar: '/assets/avatar-placeholder.jpg', rating: 4.8, memberSince: 'Feb 2023', totalOrders: 41 }, gig: 'Podcast Cover Art', package: 'Premium', amount: 120, platformFee: 24, earnings: 96, status: 'completed', deadline: '2025-04-18T16:00:00Z', createdAt: '2025-04-08' },
  { id: '#4830', buyer: { name: 'Digital First Co', avatar: '/assets/avatar-placeholder.jpg', rating: 4.7, memberSince: 'Jul 2022', totalOrders: 93 }, gig: 'Email Template Design', package: 'Basic', amount: 85, platformFee: 17, earnings: 68, status: 'active', deadline: '2025-04-23T13:00:00Z', createdAt: '2025-04-16' },
  { id: '#4831', buyer: { name: 'Tom Wilson', avatar: '/assets/avatar-placeholder.jpg', rating: 4.9, memberSince: 'May 2024', totalOrders: 19 }, gig: 'App Icon Set', package: 'Standard', amount: 160, platformFee: 32, earnings: 128, status: 'pending', deadline: '2025-04-24T10:00:00Z', createdAt: '2025-04-17' },
  { id: '#4832', buyer: { name: 'Nina Patel', avatar: '/assets/avatar-placeholder.jpg', rating: 5.0, memberSince: 'Oct 2023', totalOrders: 67 }, gig: 'Thumbnail Pack - Gaming', package: 'Premium', amount: 95, platformFee: 19, earnings: 76, status: 'active', deadline: '2025-04-22T08:00:00Z', createdAt: '2025-04-15' },
];

// Earnings
export const earningsSummary = {
  availableBalance: 3240.50,
  pendingClearance: 890.00,
  totalEarned: 28450.00,
  minPayout: 50,
};

export const earningsTransactions = Array.from({ length: 20 }, (_, i) => ({
  id: `E${4800 + i}`,
  date: new Date(Date.now() - i * 86400000 * 3).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  orderId: `#${4800 + i}`,
  item: ['Logo Animation', 'Social Media Pack', 'Video Intro', '3D Render', 'Template Design', 'Motion Graphics'][i % 6],
  gross: [150, 450, 75, 280, 120, 200][i % 6],
  fee: [30, 90, 15, 56, 24, 40][i % 6],
  net: [120, 360, 60, 224, 96, 160][i % 6],
  status: i < 5 ? 'Pending' : 'Cleared',
}));

export const payoutHistory = [
  { id: 'PO-001', date: 'Apr 10, 2025', amount: 890.00, method: 'PayPal', status: 'Paid', reference: 'PAY-2025-0410' },
  { id: 'PO-002', date: 'Mar 27, 2025', amount: 1200.00, method: 'Stripe', status: 'Paid', reference: 'STR-2025-0327' },
  { id: 'PO-003', date: 'Mar 13, 2025', amount: 650.00, method: 'PayPal', status: 'Paid', reference: 'PAY-2025-0313' },
  { id: 'PO-004', date: 'Feb 28, 2025', amount: 2100.00, method: 'Bank Transfer', status: 'Paid', reference: 'BNK-2025-0228' },
  { id: 'PO-005', date: 'Feb 14, 2025', amount: 450.00, method: 'Wise', status: 'Failed', reference: 'WSE-2025-0214' },
  { id: 'PO-006', date: 'Feb 01, 2025', amount: 1800.00, method: 'Stripe', status: 'Paid', reference: 'STR-2025-0201' },
];

// Revenue by source (for stacked bar)
export const revenueBySource = [
  { month: 'Jan', assets: 1200, services: 2800 },
  { month: 'Feb', assets: 1800, services: 3200 },
  { month: 'Mar', assets: 2200, services: 4100 },
  { month: 'Apr', assets: 1900, services: 3800 },
];

// Analytics
export const analyticsOverview = {
  views: '12,450',
  ctr: '3.2%',
  orders: 24,
  revenue: '$4,280',
  avgRating: 4.8,
  completionRate: '96%',
};

export const trafficSources = [
  { name: 'Direct', value: 35, color: '#00D4FF' },
  { name: 'Search', value: 28, color: '#8B2FFF' },
  { name: 'Referral', value: 22, color: '#E040FB' },
  { name: 'Social', value: 15, color: '#3B82F6' },
];

export const geoBreakdown = [
  { country: 'United States', views: 4200 },
  { country: 'United Kingdom', views: 1800 },
  { country: 'Germany', views: 1200 },
  { country: 'Canada', views: 950 },
  { country: 'Australia', views: 720 },
];

export const listingPerformance = [
  { id: 1, name: 'Neon Glitch Overlay Pack', type: 'Asset', thumbnail: '/assets/asset-placeholder.jpg', views: 2340, favorites: 89, orders: 47, revenue: '$1,410', rating: 4.9 },
  { id: 2, name: 'Logo Animation Gig', type: 'Gig', thumbnail: '/assets/gig-placeholder.jpg', views: 1890, favorites: 56, orders: 12, revenue: '$1,200', rating: 5.0 },
  { id: 3, name: 'Social Media Template Kit', type: 'Asset', thumbnail: '/assets/asset-placeholder.jpg', views: 4120, favorites: 156, orders: 89, revenue: '$2,670', rating: 4.8 },
  { id: 4, name: 'Video Intro Package', type: 'Gig', thumbnail: '/assets/gig-placeholder.jpg', views: 1560, favorites: 42, orders: 8, revenue: '$960', rating: 4.7 },
  { id: 5, name: '3D Icon Set - Tech', type: 'Asset', thumbnail: '/assets/asset-placeholder.jpg', views: 1980, favorites: 67, orders: 34, revenue: '$1,020', rating: 4.9 },
];

export const ratingDistribution = [
  { stars: 5, count: 89 },
  { stars: 4, count: 28 },
  { stars: 3, count: 7 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
];

// Assets
export interface Asset {
  id: string;
  title: string;
  type: string;
  category: string;
  status: 'published' | 'pending' | 'rejected' | 'draft';
  downloads: number;
  revenue: number;
  date: string;
  thumbnail: string;
  rejectionReason?: string;
}

export const assets: Asset[] = [
  { id: 'A1001', title: 'Neon Glitch Overlay Pack', type: 'Template', category: 'Video', status: 'published', downloads: 2340, revenue: 1410, date: '2025-04-10', thumbnail: '/assets/asset-placeholder.jpg' },
  { id: 'A1002', title: 'Social Media Template Kit', type: 'Template', category: 'Social', status: 'published', downloads: 4120, revenue: 2670, date: '2025-04-08', thumbnail: '/assets/asset-placeholder.jpg' },
  { id: 'A1003', title: '3D Icon Set - Technology', type: '3D', category: 'Icons', status: 'published', downloads: 1980, revenue: 1020, date: '2025-04-05', thumbnail: '/assets/asset-placeholder.jpg' },
  { id: 'A1004', title: 'Cinematic LUTs Pack', type: 'Template', category: 'Video', status: 'published', downloads: 1560, revenue: 780, date: '2025-04-01', thumbnail: '/assets/asset-placeholder.jpg' },
  { id: 'A1005', title: 'Motion Graphics Pack', type: 'Motion', category: 'Motion', status: 'pending', downloads: 0, revenue: 0, date: '2025-04-18', thumbnail: '/assets/asset-placeholder.jpg' },
  { id: 'A1006', title: 'AI-Generated Backgrounds', type: 'Image', category: 'Backgrounds', status: 'pending', downloads: 0, revenue: 0, date: '2025-04-17', thumbnail: '/assets/asset-placeholder.jpg' },
  { id: 'A1007', title: 'Sound Effects Library', type: 'Audio', category: 'Audio', status: 'pending', downloads: 0, revenue: 0, date: '2025-04-16', thumbnail: '/assets/asset-placeholder.jpg' },
  { id: 'A1008', title: 'Font Bundle - Futura', type: 'Font', category: 'Fonts', status: 'pending', downloads: 0, revenue: 0, date: '2025-04-15', thumbnail: '/assets/asset-placeholder.jpg' },
  { id: 'A1009', title: 'Abstract Shape Collection', type: 'Image', category: 'Graphics', status: 'rejected', downloads: 0, revenue: 0, date: '2025-04-12', thumbnail: '/assets/asset-placeholder.jpg', rejectionReason: 'Preview images do not clearly represent the asset content. Please add clearer preview thumbnails showing all included elements.' },
  { id: 'A1010', title: 'Retro VHS Effects', type: 'Template', category: 'Video', status: 'rejected', downloads: 0, revenue: 0, date: '2025-04-11', thumbnail: '/assets/asset-placeholder.jpg', rejectionReason: 'Missing required metadata: compatible software versions and resolution information.' },
  { id: 'A1011', title: 'Podcast Cover Templates', type: 'Template', category: 'Social', status: 'draft', downloads: 0, revenue: 0, date: '2025-04-14', thumbnail: '/assets/asset-placeholder.jpg' },
  { id: 'A1012', title: 'Business Card Mockups', type: 'Template', category: 'Print', status: 'draft', downloads: 0, revenue: 0, date: '2025-04-13', thumbnail: '/assets/asset-placeholder.jpg' },
];

// Gigs
export interface Gig {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'suspended';
  thumbnail: string;
  views: number;
  ordersThisMonth: number;
  rating: number;
  revenue: number;
  packages: { basic: number; standard: number; premium: number };
  conversionRate?: number;
}

export const gigs: Gig[] = [
  { id: 'G001', title: 'Logo Animation - Professional Motion Graphics', status: 'active', thumbnail: '/assets/gig-placeholder.jpg', views: 1890, ordersThisMonth: 12, rating: 5.0, revenue: 1200, packages: { basic: 25, standard: 75, premium: 150 }, conversionRate: 3.8 },
  { id: 'G002', title: 'Social Media Pack - 30 Custom Posts', status: 'active', thumbnail: '/assets/gig-placeholder.jpg', views: 2340, ordersThisMonth: 8, rating: 4.9, revenue: 3600, packages: { basic: 50, standard: 150, premium: 450 }, conversionRate: 2.9 },
  { id: 'G003', title: 'Video Intro - Cinematic Style', status: 'active', thumbnail: '/assets/gig-placeholder.jpg', views: 1560, ordersThisMonth: 6, rating: 4.7, revenue: 960, packages: { basic: 35, standard: 85, premium: 175 }, conversionRate: 4.1 },
  { id: 'G004', title: 'Brand Identity Package', status: 'active', thumbnail: '/assets/gig-placeholder.jpg', views: 1230, ordersThisMonth: 4, rating: 4.8, revenue: 2600, packages: { basic: 100, standard: 300, premium: 650 }, conversionRate: 2.4 },
  { id: 'G005', title: '3D Product Visualization', status: 'paused', thumbnail: '/assets/gig-placeholder.jpg', views: 890, ordersThisMonth: 0, rating: 4.9, revenue: 0, packages: { basic: 75, standard: 200, premium: 450 }, conversionRate: 0 },
  { id: 'G006', title: 'Motion Graphics - Explainer Videos', status: 'active', thumbnail: '/assets/gig-placeholder.jpg', views: 2100, ordersThisMonth: 10, rating: 4.8, revenue: 2000, packages: { basic: 50, standard: 150, premium: 350 }, conversionRate: 3.5 },
  { id: 'G007', title: 'AI Art Custom Generation', status: 'active', thumbnail: '/assets/gig-placeholder.jpg', views: 3400, ordersThisMonth: 15, rating: 4.6, revenue: 750, packages: { basic: 15, standard: 40, premium: 100 }, conversionRate: 5.2 },
  { id: 'G008', title: 'Website Graphics Kit', status: 'suspended', thumbnail: '/assets/gig-placeholder.jpg', views: 0, ordersThisMonth: 0, rating: 4.5, revenue: 0, packages: { basic: 45, standard: 120, premium: 280 }, conversionRate: 0 },
];

// Messages
export interface Conversation {
  id: string;
  buyer: { name: string; avatar: string; online: boolean };
  type: 'inquiry' | 'order';
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: { sender: 'buyer' | 'seller'; content: string; time: string; files?: string[] }[];
}

export const conversations: Conversation[] = [
  { id: 'C1', buyer: { name: 'Sarah Mitchell', avatar: '/assets/avatar-placeholder.jpg', online: true }, type: 'order', lastMessage: 'Can you add a slight glow effect to the logo?', timestamp: '2 min ago', unread: 2, messages: [{ sender: 'buyer', content: 'Hi! I love the initial concept.', time: 'Apr 18, 10:00 AM' }, { sender: 'seller', content: 'Thank you! I\'ll refine it further.', time: 'Apr 18, 10:15 AM' }, { sender: 'buyer', content: 'Can you add a slight glow effect to the logo?', time: 'Apr 20, 2:30 PM' }] },
  { id: 'C2', buyer: { name: 'BrandCo Agency', avatar: '/assets/avatar-placeholder.jpg', online: false }, type: 'inquiry', lastMessage: 'We need 50 posts for our Q2 campaign. Can you handle that?', timestamp: '1 hour ago', unread: 1, messages: [{ sender: 'buyer', content: 'We need 50 posts for our Q2 campaign. Can you handle that?', time: 'Apr 20, 1:00 PM' }] },
  { id: 'C3', buyer: { name: 'Alex Johnson', avatar: '/assets/avatar-placeholder.jpg', online: true }, type: 'order', lastMessage: 'The delivery looks great! Approved.', timestamp: '3 hours ago', unread: 0, messages: [{ sender: 'seller', content: 'Here is the final delivery. Let me know if you need changes!', time: 'Apr 19, 4:00 PM' }, { sender: 'buyer', content: 'The delivery looks great! Approved.', time: 'Apr 20, 11:00 AM' }] },
  { id: 'C4', buyer: { name: 'Creative Labs', avatar: '/assets/avatar-placeholder.jpg', online: false }, type: 'inquiry', lastMessage: 'What is your availability for a rush project?', timestamp: '5 hours ago', unread: 0, messages: [{ sender: 'buyer', content: 'What is your availability for a rush project?', time: 'Apr 19, 9:00 AM' }, { sender: 'seller', content: 'I can accommodate rush projects with a 50% surcharge.', time: 'Apr 19, 10:00 AM' }] },
  { id: 'C5', buyer: { name: 'Emma Davis', avatar: '/assets/avatar-placeholder.jpg', online: true }, type: 'order', lastMessage: 'Thanks for the quick turnaround!', timestamp: 'Yesterday', unread: 0, messages: [{ sender: 'buyer', content: 'Thanks for the quick turnaround!', time: 'Apr 19, 5:00 PM' }] },
];

// Reviews
export const reviews = [
  { id: 1, buyer: { name: 'Sarah M.', avatar: '/assets/avatar-placeholder.jpg' }, date: 'Apr 18, 2025', rating: 5, text: 'Absolutely stunning work! The attention to detail is incredible. Will definitely order again.', gig: 'Logo Animation', reply: null },
  { id: 2, buyer: { name: 'BrandCo', avatar: '/assets/avatar-placeholder.jpg' }, date: 'Apr 15, 2025', rating: 5, text: 'Professional quality, delivered on time. Our brand looks amazing now.', gig: 'Brand Identity', reply: 'Thank you! It was a pleasure working with your team.' },
  { id: 3, buyer: { name: 'Alex J.', avatar: '/assets/avatar-placeholder.jpg' }, date: 'Apr 12, 2025', rating: 4, text: 'Great work overall. A few minor revisions needed but very responsive.', gig: 'Video Intro', reply: null },
  { id: 4, buyer: { name: 'Mike C.', avatar: '/assets/avatar-placeholder.jpg' }, date: 'Apr 10, 2025', rating: 5, text: 'The 3D renders exceeded my expectations. Highly recommended!', gig: '3D Product Render', reply: null },
  { id: 5, buyer: { name: 'Lisa P.', avatar: '/assets/avatar-placeholder.jpg' }, date: 'Apr 08, 2025', rating: 2, text: 'Delivery was late by 2 days and the quality was not what I expected for the price.', gig: 'Social Media Pack', reply: null },
  { id: 6, buyer: { name: 'Tom W.', avatar: '/assets/avatar-placeholder.jpg' }, date: 'Apr 05, 2025', rating: 1, text: 'Communication was poor. Had to request multiple revisions.', gig: 'Motion Graphics', reply: null },
];

// Payout methods
export const payoutMethods = [
  { id: 'pm1', type: 'PayPal', detail: 'creator@helixonix.com', default: true, status: 'Connected' },
  { id: 'pm2', type: 'Stripe', detail: 'acct_1Oxxxxxxxxxxxx', default: false, status: 'Connected' },
  { id: 'pm3', type: 'Bank Transfer', detail: '**** **** **** 4521', default: false, status: 'Pending' },
];

// Notification settings
export const notificationSettings = [
  { event: 'New Order', email: true, inApp: true, push: true },
  { event: 'Order Delivered', email: true, inApp: true, push: false },
  { event: 'Message Received', email: false, inApp: true, push: true },
  { event: 'Payout Processed', email: true, inApp: true, push: true },
  { event: 'Review Posted', email: true, inApp: true, push: false },
  { event: 'Asset Approved', email: true, inApp: true, push: true },
  { event: 'Asset Rejected', email: true, inApp: true, push: true },
  { event: 'System Announcements', email: true, inApp: false, push: false },
];

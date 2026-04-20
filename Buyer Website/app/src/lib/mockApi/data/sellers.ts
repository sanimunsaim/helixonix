import type { Seller } from '@/types';

export const mockSellers: Seller[] = [
  {
    id: 's1', name: 'Maya Chen', username: 'mayadesigns', avatar: '/images/avatar-1.jpg',
    level: 'top', rating: 4.9, reviewCount: 284, location: 'San Francisco, CA',
    specialty: 'Brand Identity', bio: 'Award-winning brand designer with 8+ years of experience crafting visual identities for startups and Fortune 500 companies.',
    responseRate: 98, deliveryRate: 100, totalSales: 1842, languages: ['English', 'Mandarin'],
    memberSince: '2019', skills: ['Branding', 'Logo Design', 'UI/UX', 'Packaging'],
  },
  {
    id: 's2', name: 'James Wilson', username: 'jwcreative', avatar: '/images/avatar-2.jpg',
    level: 'level2', rating: 4.8, reviewCount: 156, location: 'London, UK',
    specialty: 'Video Production', bio: 'Cinematographer and motion designer specializing in commercial video production and brand storytelling.',
    responseRate: 95, deliveryRate: 97, totalSales: 623, languages: ['English'],
    memberSince: '2020', skills: ['Video Editing', 'Motion Graphics', 'Color Grading', 'Sound Design'],
  },
  {
    id: 's3', name: 'Alex Rivera', username: 'aristudios', avatar: '/images/avatar-3.jpg',
    level: 'top', rating: 4.9, reviewCount: 421, location: 'Miami, FL',
    specialty: '3D & Motion', bio: '3D artist and motion designer creating immersive visual experiences for brands and entertainment.',
    responseRate: 99, deliveryRate: 99, totalSales: 2105, languages: ['English', 'Spanish'],
    memberSince: '2018', skills: ['3D Modeling', 'Animation', 'VFX', 'Cinema 4D'],
  },
  {
    id: 's4', name: 'Zara Williams', username: 'zaraart', avatar: '/images/avatar-4.jpg',
    level: 'level1', rating: 4.7, reviewCount: 89, location: 'Berlin, DE',
    specialty: 'AI Automation', bio: 'Creative technologist bridging AI and design. Building automated creative workflows and generative art systems.',
    responseRate: 92, deliveryRate: 95, totalSales: 312, languages: ['English', 'German'],
    memberSince: '2021', skills: ['AI Art', 'Generative Design', 'Python', 'Creative Coding'],
  },
];

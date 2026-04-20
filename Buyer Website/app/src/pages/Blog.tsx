import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import { Link } from 'react-router-dom';
import { Clock, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const categories = ['All', 'AI & Technology', 'Motion Design', 'Branding', 'Video Production', '3D Design', 'Business'];

export default function Blog() {
  const { data: posts } = useQuery({ queryKey: ['blog'], queryFn: () => mockApi.blog.getAll() });
  const { data: featured } = useQuery({ queryKey: ['blog-featured'], queryFn: () => mockApi.blog.getFeatured() });
  const [activeCategory, setActiveCategory] = useState('All');
  const [email, setEmail] = useState('');
  const ref = useScrollReveal<HTMLElement>();

  const filtered = activeCategory === 'All' ? posts : posts?.filter((p) => p.category === activeCategory);
  const regularPosts = filtered?.filter((p) => p.id !== featured?.id) || [];

  return (
    <section ref={ref} className="section-reveal min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display font-black text-3xl md:text-5xl text-white mb-3">The HelixOnix Journal</h1>
          <p className="text-[#8892B0] max-w-lg mx-auto">Insights, tutorials, and creative inspiration</p>
        </div>

        {/* Featured Post */}
        {featured && (
          <Link to={`/blog/${featured.slug}`} className="block glass-surface rounded-card-lg overflow-hidden card-hover mb-12 group">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
                <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <span className="text-xs text-[#00D4FF] font-mono mb-2">{featured.category}</span>
                <h2 className="font-heading font-bold text-xl md:text-2xl text-white mb-3 group-hover:text-[#00D4FF] transition-colors">{featured.title}</h2>
                <p className="text-sm text-[#8892B0] line-clamp-3 mb-4">{featured.excerpt}</p>
                <div className="flex items-center gap-3">
                  <img src={featured.author.avatar} alt={featured.author.name} className="w-8 h-8 rounded-full" />
                  <span className="text-sm text-white">{featured.author.name}</span>
                  <span className="text-xs text-[#8892B0] flex items-center gap-1"><Clock size={12} /> {featured.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Posts Grid */}
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={cn('px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all', activeCategory === cat ? 'bg-[#00D4FF] text-[#050815]' : 'glass-surface text-[#8892B0]')}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {regularPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="glass-surface rounded-card overflow-hidden card-hover group block">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-[#00D4FF] font-mono">{post.category}</span>
                    <h3 className="font-heading font-semibold text-white mt-1 mb-2 group-hover:text-[#00D4FF] transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-[#8892B0] line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-xs text-[#8892B0]">
                      <span>{post.author.name}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Newsletter */}
            <div className="glass-surface rounded-card p-5">
              <h3 className="font-heading font-bold text-white mb-2">Newsletter</h3>
              <p className="text-xs text-[#8892B0] mb-4">Get creative tips and updates weekly</p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892B0]" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="w-full h-10 pl-9 pr-3 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-button text-sm text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none" />
                </div>
                <button className="h-10 px-4 bg-[#00D4FF] text-[#050815] rounded-button text-sm font-heading font-semibold">Join</button>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="glass-surface rounded-card p-5">
              <h3 className="font-heading font-bold text-white mb-3">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['AI', 'Motion', 'Branding', '3D', 'Tutorial', 'Video', 'Design'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-[#0D1233] text-[#8892B0] text-xs rounded-full hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 cursor-pointer transition-colors">{tag}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import { Clock, ArrowLeft } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useQuery({ queryKey: ['blog-post', slug], queryFn: () => mockApi.blog.getBySlug(slug || ''), enabled: !!slug });
  const { data: related } = useQuery({ queryKey: ['blog'], queryFn: () => mockApi.blog.getAll() });

  if (isLoading) return <div className="min-h-screen bg-[#050815] pt-24 text-center text-[#8892B0]">Loading...</div>;
  if (!post) return <div className="min-h-screen bg-[#050815] pt-24 text-center text-white">Post not found</div>;

  const relatedPosts = related?.filter((p) => p.id !== post.id).slice(0, 3) || [];

  // Parse content into sections for simple rendering
  const contentLines = post.content.split('\n').filter((line) => line.trim());

  return (
    <div className="min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-4xl mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-[#8892B0] hover:text-[#00D4FF] mb-6">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        {/* Header */}
        <div className="mb-8">
          <span className="text-xs text-[#00D4FF] font-mono">{post.category}</span>
          <h1 className="font-display font-black text-2xl md:text-4xl text-white mt-2 mb-4">{post.title}</h1>
          <div className="flex items-center gap-3">
            <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full" />
            <div>
              <p className="text-sm text-white">{post.author.name}</p>
              <p className="text-xs text-[#8892B0] flex items-center gap-2">
                <span>{post.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Cover */}
        <div className="aspect-[16/9] rounded-card-lg overflow-hidden mb-10">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <article className="prose prose-invert max-w-none mb-12">
          {contentLines.map((line, i) => {
            if (line.startsWith('## ')) {
              return <h2 key={i} className="font-heading font-bold text-xl text-white mt-8 mb-4">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('- ')) {
              return <li key={i} className="text-sm text-[#8892B0] ml-4 mb-1">{line.replace('- ', '')}</li>;
            }
            if (line.match(/^\d+\./)) {
              return <li key={i} className="text-sm text-[#8892B0] ml-4 mb-1">{line.replace(/^\d+\.\s*/, '')}</li>;
            }
            if (line.trim() === '') return null;
            return <p key={i} className="text-sm text-[#8892B0] leading-relaxed mb-4">{line}</p>;
          })}
        </article>

        {/* Author Bio */}
        <div className="glass-surface rounded-card p-6 mb-12">
          <div className="flex items-start gap-4">
            <img src={post.author.avatar} alt={post.author.name} className="w-14 h-14 rounded-full" />
            <div>
              <h3 className="font-heading font-semibold text-white mb-1">{post.author.name}</h3>
              <p className="text-sm text-[#8892B0]">{post.author.bio}</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedPosts.length > 0 && (
          <div>
            <h3 className="font-heading font-bold text-white mb-4">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} to={`/blog/${rp.slug}`} className="glass-surface rounded-card overflow-hidden card-hover group block">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={rp.thumbnail} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-heading font-semibold text-white group-hover:text-[#00D4FF] line-clamp-2">{rp.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

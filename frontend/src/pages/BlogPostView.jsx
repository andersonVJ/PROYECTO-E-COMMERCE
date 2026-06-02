import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Tag, ChevronLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function BlogPostView() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://127.0.0.1:8000/api/blogs/${slug}/`);
        setPost(res.data);
      } catch (err) {
        console.error('Failed to load blog post:', err);
        setError('El artículo solicitado no está disponible o no existe.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-urbangold-gold" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="text-2xl font-bold">{error || 'Artículo no encontrado'}</h2>
        <Link to="/blog" className="inline-block px-6 py-2.5 btn-gold rounded-full text-sm">
          Volver al Blog
        </Link>
      </div>
    );
  }

  const bannerImg = post.banner || "https://placehold.co/1200x600/0F0F0F/D4AF37?text=Urban+Gold+Blog";

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Back button */}
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-urbangold-gold transition-colors">
        <ChevronLeft size={16} /> Volver al Blog
      </Link>

      {/* Header Info */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1"><Calendar size={14} className="text-urbangold-gold" /> {new Date(post.created_at).toLocaleDateString('es-CO')}</span>
          <span className="flex items-center gap-1"><Tag size={14} className="text-urbangold-gold" /> {post.category}</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black tracking-wide leading-tight text-white">
          {post.title}
        </h1>
      </div>

      {/* Banner image */}
      <div className="w-full aspect-[21/9] bg-black/40 rounded-2xl overflow-hidden border border-white/5">
        <img 
          src={bannerImg.startsWith('http') ? bannerImg : `http://127.0.0.1:8000${bannerImg}`} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content body */}
      <div className="text-gray-300 font-light text-base leading-relaxed space-y-6 pt-4 border-t border-white/5 whitespace-pre-wrap">
        {post.content}
      </div>

      {/* Footer / CTA to Catalog */}
      <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="font-bold text-white tracking-wide text-lg">¿Listo para marcar la diferencia?</h4>
          <p className="text-xs text-gray-500 mt-0.5">Explora nuestra colección urbana de gorras premium hoy.</p>
        </div>
        <Link to="/catalog" className="px-8 py-3.5 btn-gold rounded-full font-bold text-sm flex items-center gap-2">
          Comprar Ahora <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  const blogCategories = [
    'Moda urbana',
    'Streetwear',
    'Tendencias de gorras',
    'Consejos de estilo',
    'Nuevos lanzamientos'
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;

        const res = await axios.get('http://127.0.0.1:8000/api/blogs/', { params });
        setPosts(res.data);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
        <h1 className="text-4xl font-black tracking-wide text-white">BLOG URBAN GOLD</h1>
        <p className="text-sm text-gray-500">Tendencias, lanzamientos exclusivos y guías de estilo para la cultura urbana</p>
        <div className="h-1 w-16 bg-urbangold-gold mx-auto" />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2.5 justify-center mb-10">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
            selectedCategory === '' 
              ? 'bg-urbangold-gold text-urbangold-bg border-urbangold-gold shadow-lg shadow-urbangold-gold/20' 
              : 'bg-urbangold-gray/60 border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Todos
        </button>
        {blogCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
              selectedCategory === cat 
                ? 'bg-urbangold-gold text-urbangold-bg border-urbangold-gold shadow-lg shadow-urbangold-gold/20' 
                : 'bg-urbangold-gray/60 border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts listing */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-urbangold-gold" />
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-400">
          No hay artículos publicados en esta categoría en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const bannerImg = post.banner || "https://placehold.co/800x600/0F0F0F/D4AF37?text=Urban+Gold+Blog";
            
            return (
              <div key={post.id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group">
                <Link to={`/blog/${post.slug}`} className="block relative aspect-[16/10] bg-black/40 overflow-hidden border-b border-white/5">
                  <img 
                    src={bannerImg.startsWith('http') ? bannerImg : `http://127.0.0.1:8000${bannerImg}`} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Calendar size={12} className="text-urbangold-gold" /> {new Date(post.created_at).toLocaleDateString('es-CO')}</span>
                      <span className="flex items-center gap-1"><Tag size={12} className="text-urbangold-gold" /> {post.category}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="block">
                      <h3 className="text-lg font-bold text-white tracking-wide hover:text-urbangold-gold transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-400 font-light line-clamp-3 leading-relaxed">
                      {post.content.replace(/<[^>]*>/g, '')}
                    </p>
                  </div>

                  <Link 
                    to={`/blog/${post.slug}`} 
                    className="inline-flex items-center gap-1 text-xs font-bold text-urbangold-gold hover:text-white transition-colors uppercase tracking-wider"
                  >
                    Leer Artículo <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

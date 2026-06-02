import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Truck, Clock, Star } from 'lucide-react';
import axios from 'axios';
import Cap3D from '../components/Cap3D';
import { useStore } from '../store/store';

export default function Home() {
  const { addToCart } = useStore();
  const [weeklyProduct, setWeeklyProduct] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [promotedProducts, setPromotedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Weekly recommendation
        const weeklyRes = await axios.get('http://127.0.0.1:8000/api/products/?weekly=true');
        if (weeklyRes.data && weeklyRes.data.length > 0) {
          setWeeklyProduct(weeklyRes.data[0]);
        }

        // Featured products
        const featuredRes = await axios.get('http://127.0.0.1:8000/api/products/?featured=true');
        setFeaturedProducts(featuredRes.data.slice(0, 4));

        // Promotions
        const promoRes = await axios.get('http://127.0.0.1:8000/api/products/?promo=true');
        setPromotedProducts(promoRes.data);
      } catch (err) {
        console.error('Failed to fetch home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="tech-grid min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F0F0F]/50 to-[#0F0F0F]" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-urbangold-gold/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-urbangold-gold/5 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Hero text */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-urbangold-gold/10 border border-urbangold-gold/30 text-xs font-bold tracking-widest text-urbangold-gold uppercase animate-pulse">
              <Sparkles size={14} /> EXCLUSIVIDAD URBANA
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
              EL ESTILO QUE MARCA LA <br />
              <span className="bg-gradient-to-r from-urbangold-gold to-[#f5d061] bg-clip-text text-transparent">
                DIFERENCIA
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
              Eleva tu presencia en las calles con nuestra colección de gorras de lujo urbano. Diseñadas para mentes vanguardistas.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link to="/catalog" className="w-full sm:w-auto px-8 py-4 btn-gold rounded-full text-center font-bold tracking-wide flex items-center justify-center gap-2">
                Explorar Catálogo <ArrowRight size={18} />
              </Link>
              <Link to="/catalog?featured=true" className="w-full sm:w-auto px-8 py-4 bg-urbangold-gray hover:bg-[#252525] border border-white/10 rounded-full text-center font-bold tracking-wide text-white transition-colors">
                Colección Premium
              </Link>
            </div>
          </div>

          {/* 3D Canvas Hero */}
          <div className="h-[400px] sm:h-[500px] w-full relative">
            <Cap3D />
          </div>
        </div>
      </section>

      {/* SHOPPING BENEFITS */}
      <section className="py-12 bg-black border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-urbangold-gray/30 border border-white/5">
            <div className="p-3 bg-urbangold-gold/10 text-urbangold-gold rounded-xl">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white tracking-wide">Envíos Nacionales</h4>
              <p className="text-xs text-gray-400 mt-0.5">Enviamos de forma segura a toda Colombia.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-urbangold-gray/30 border border-white/5">
            <div className="p-3 bg-urbangold-gold/10 text-urbangold-gold rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white tracking-wide">Calidad Premium</h4>
              <p className="text-xs text-gray-400 mt-0.5">Materiales seleccionados y acabados de lujo.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-urbangold-gray/30 border border-white/5">
            <div className="p-3 bg-urbangold-gold/10 text-urbangold-gold rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white tracking-wide">Atención Personalizada</h4>
              <p className="text-xs text-gray-400 mt-0.5">Soporte directo por WhatsApp 24/7.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RECOMMENDATION OF THE WEEK */}
      {weeklyProduct && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-wide text-urbangold-gold">RECOMENDADO DE LA SEMANA</h2>
            <div className="h-1 w-20 bg-urbangold-gold mx-auto mt-2" />
          </div>

          <div className="glass-card rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 sm:p-12 items-center">
            {/* Image display */}
            <div className="w-full h-[350px] bg-black/40 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
              <img 
                src={weeklyProduct.images?.[0]?.image ? `http://127.0.0.1:8000${weeklyProduct.images[0].image}` : "https://placehold.co/600x600/0F0F0F/D4AF37?text=Urban+Gold"}
                alt={weeklyProduct.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            {/* Details */}
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-urbangold-gold text-urbangold-bg font-extrabold text-xs rounded uppercase tracking-wider">
                Destacado
              </div>
              <h3 className="text-3xl font-black tracking-wide text-white">{weeklyProduct.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{weeklyProduct.description}</p>
              
              <div className="flex items-baseline gap-4">
                {weeklyProduct.discount_price ? (
                  <>
                    <span className="text-2xl font-bold text-urbangold-gold">${parseFloat(weeklyProduct.discount_price).toLocaleString('es-CO')} COP</span>
                    <span className="text-sm text-gray-500 line-through">${parseFloat(weeklyProduct.price).toLocaleString('es-CO')} COP</span>
                    <span className="text-xs font-semibold text-green-500">-{weeklyProduct.discount_percent}% OFF</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-urbangold-gold">${parseFloat(weeklyProduct.price).toLocaleString('es-CO')} COP</span>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => addToCart(weeklyProduct, 1)}
                  className="px-8 py-3.5 btn-gold rounded-full font-bold tracking-wide text-sm"
                >
                  Agregar al Carrito
                </button>
                <Link 
                  to={`/product/${weeklyProduct.slug}`} 
                  className="px-8 py-3.5 bg-urbangold-gray hover:bg-[#252525] border border-white/10 rounded-full font-bold text-white transition-colors text-sm"
                >
                  Ver Detalle
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES NAVIGATION */}
      <section className="py-16 bg-black/40 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-wide">CATEGORÍAS</h2>
            <div className="h-1 w-12 bg-urbangold-gold mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Snapback', slug: 'snapback', desc: 'Visera plana clásica' },
              { name: 'Trucker', slug: 'trucker', desc: 'Malla fresca retro' },
              { name: 'Baseball', slug: 'baseball', desc: 'Estilo curvo urbano' },
              { name: 'Premium', slug: 'premium', desc: 'Edición cuero y metal' },
            ].map((cat) => (
              <Link 
                key={cat.slug} 
                to={`/catalog?category=${cat.slug}`}
                className="group relative p-8 rounded-2xl glass-card text-center hover:border-urbangold-gold transition-all duration-300"
              >
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-urbangold-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-xl font-bold tracking-wide text-white group-hover:text-urbangold-gold transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-2">{cat.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-urbangold-gold opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                  Ver Colección <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS (BEST SELLERS) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-wide">COLECCIÓN PRINCIPAL</h2>
            <p className="text-sm text-gray-400 mt-1">Los favoritos de la comunidad streetwear</p>
          </div>
          <Link to="/catalog" className="text-sm font-bold text-urbangold-gold hover:text-white transition-colors flex items-center gap-1.5">
            Ver Todos Los Productos <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => {
            const price = product.discount_price || product.price;
            const mainImg = product.images?.[0]?.thumbnail || product.images?.[0]?.image || "https://placehold.co/400x400/0F0F0F/D4AF37?text=Urban+Gold";
            
            return (
              <div key={product.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group">
                <Link to={`/product/${product.slug}`} className="block relative aspect-square bg-black/40 overflow-hidden border-b border-white/5">
                  {product.discount_price && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white font-extrabold text-[10px] px-2 py-1 rounded tracking-wider uppercase z-10">
                      Promo
                    </span>
                  )}
                  <img 
                    src={mainImg.startsWith('http') ? mainImg : `http://127.0.0.1:8000${mainImg}`} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-urbangold-gold font-bold tracking-widest uppercase">
                      {product.category?.name}
                    </span>
                    <Link to={`/product/${product.slug}`} className="block">
                      <h3 className="text-base font-bold text-white tracking-wide hover:text-urbangold-gold transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      {product.discount_price ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 line-through">${parseFloat(product.price).toLocaleString('es-CO')}</span>
                          <span className="text-sm font-bold text-urbangold-gold">${parseFloat(product.discount_price).toLocaleString('es-CO')}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-urbangold-gold">${parseFloat(product.price).toLocaleString('es-CO')}</span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => addToCart(product, 1)}
                      className="px-4 py-2 bg-urbangold-gold text-urbangold-bg font-extrabold text-xs rounded-full hover:bg-white hover:text-black transition-all"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CUSTOMER TESTIMONIALS */}
      <section className="py-20 bg-black/40 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-wide">LO QUE DICE LA CALLE</h2>
            <p className="text-sm text-gray-400 mt-1">Comunidad Urban Gold</p>
            <div className="h-1 w-10 bg-urbangold-gold mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Mateo Restrepo', role: 'Coleccionista Streetwear', comment: 'El bordado 3D dorado es de otro planeta. La gorra snapback llegó al día siguiente aquí en Medellín. ¡Recomendadísimo!' },
              { name: 'Camila Giraldo', role: 'Diseñadora de Modas', comment: 'El modelo de cuero premium es un lujo total. Muy minimalista, futurista y los acabados metálicos combinan con todo.' },
              { name: 'Santiago Vélez', role: 'Skatelife Medellín', comment: 'Excelente flujo de compra. Adjunté mi comprobante Nequi desde el celular y en menos de una hora confirmaron mi envío.' },
            ].map((testi, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl space-y-4">
                <div className="flex gap-1 text-urbangold-gold">
                  {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill="#D4AF37" />)}
                </div>
                <p className="text-sm text-gray-300 italic leading-relaxed">
                  "{testi.comment}"
                </p>
                <div className="pt-2">
                  <h4 className="font-bold text-white tracking-wide text-sm">{testi.name}</h4>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">{testi.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

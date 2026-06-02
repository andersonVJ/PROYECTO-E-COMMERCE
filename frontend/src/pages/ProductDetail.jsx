import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, ShieldCheck, AlertCircle, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useStore } from '../store/store';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://127.0.0.1:8000/api/products/${slug}/`);
        setProduct(res.data);
        if (res.data.images && res.data.images.length > 0) {
          setActiveImage(res.data.images[0].image);
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
        setError('El producto solicitado no está disponible o no existe.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleZoom = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage.startsWith('http') ? activeImage : `http://127.0.0.1:8000${activeImage}`})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%' // double magnification
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-urbangold-gold" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <AlertCircle className="mx-auto text-red-500" size={48} />
        <h2 className="text-2xl font-bold">{error || 'Producto no encontrado'}</h2>
        <Link to="/catalog" className="inline-block px-6 py-2.5 btn-gold rounded-full text-sm">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const price = product.discount_price || product.price;
  const isOutOfStock = product.inventory?.stock_actual === 0;
  const isLowStock = product.inventory?.stock_actual > 0 && product.inventory?.stock_actual <= product.inventory?.stock_min;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back to Catalog */}
      <Link to="/catalog" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-urbangold-gold transition-colors mb-8">
        <ChevronLeft size={16} /> Volver al Catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* IMAGES GALLERY */}
        <div className="space-y-4">
          {/* Main Display Container */}
          <div 
            className="w-full aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/5 relative flex items-center justify-center cursor-crosshair group"
            onMouseMove={handleZoom}
            onMouseLeave={handleMouseLeave}
          >
            {activeImage ? (
              <img 
                src={activeImage.startsWith('http') ? activeImage : `http://127.0.0.1:8000${activeImage}`} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-150"
              />
            ) : (
              <img 
                src="https://placehold.co/600x600/0F0F0F/D4AF37?text=Urban+Gold" 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Custom Zoom Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none bg-no-repeat transition-all" 
              style={zoomStyle} 
            />
          </div>

          {/* Secondary Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-black/40 border flex-shrink-0 flex items-center justify-center transition-all ${
                    activeImage === img.image ? 'border-urbangold-gold shadow-lg shadow-urbangold-gold/15' : 'border-white/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img.thumbnail.startsWith('http') ? img.thumbnail : `http://127.0.0.1:8000${img.thumbnail}`} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS COLUMN */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-extrabold tracking-widest text-urbangold-gold uppercase">
              {product.category?.name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-wide leading-tight text-white">
              {product.name}
            </h1>
            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-4 py-4 border-y border-white/5">
            {product.discount_price ? (
              <>
                <span className="text-3xl font-black text-urbangold-gold">
                  ${parseFloat(product.discount_price).toLocaleString('es-CO')} COP
                </span>
                <span className="text-base text-gray-500 line-through">
                  ${parseFloat(product.price).toLocaleString('es-CO')} COP
                </span>
                <span className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold px-2 py-0.5 rounded">
                  -{product.discount_percent}% OFF
                </span>
              </>
            ) : (
              <span className="text-3xl font-black text-urbangold-gold">
                ${parseFloat(product.price).toLocaleString('es-CO')} COP
              </span>
            )}
          </div>

          {/* Availability alerts */}
          <div className="flex items-center gap-2 text-sm">
            {isOutOfStock ? (
              <span className="text-red-500 font-bold bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full uppercase text-xs">
                Agotado en stock
              </span>
            ) : isLowStock ? (
              <span className="text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase text-xs animate-pulse">
                ¡Pocas unidades! Solo quedan {product.inventory.stock_actual}
              </span>
            ) : (
              <span className="text-green-500 font-bold bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full uppercase text-xs">
                Disponible: {product.inventory?.stock_actual} en stock
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Descripción</h3>
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          {/* Buy Section */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-black/40 h-[52px]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 hover:bg-white/5 text-gray-400 hover:text-white transition-colors h-full"
                >
                  -
                </button>
                <span className="px-4 font-bold text-urbangold-gold text-base min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.inventory.stock_actual, quantity + 1))}
                  className="px-4 hover:bg-white/5 text-gray-400 hover:text-white transition-colors h-full"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 h-[52px] btn-gold rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 text-sm shadow-xl"
              >
                <ShoppingCart size={18} /> Agregar al Carrito
              </button>
            </div>
          )}

          {/* Trust points */}
          <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5 text-xs text-gray-400">
              <ShieldCheck size={16} className="text-urbangold-gold" />
              <span>Compra 100% Segura</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-400">
              <ShieldCheck size={16} className="text-urbangold-gold" />
              <span>Garantía Urban Gold</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

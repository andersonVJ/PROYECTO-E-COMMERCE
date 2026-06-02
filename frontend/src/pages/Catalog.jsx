import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { useStore } from '../store/store';

export default function Catalog() {
  const { addToCart } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [promo, setPromo] = useState(searchParams.get('promo') === 'true');
  const [bestSellers, setBestSellers] = useState(searchParams.get('best_sellers') === 'true');

  useEffect(() => {
    // Load categories
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/categories/');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (promo) params.promo = 'true';
      if (bestSellers) params.best_sellers = 'true';

      const res = await axios.get('http://127.0.0.1:8000/api/products/', { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (category) newParams.category = category;
    if (minPrice) newParams.min_price = minPrice;
    if (maxPrice) newParams.max_price = maxPrice;
    if (promo) newParams.promo = 'true';
    if (bestSellers) newParams.best_sellers = 'true';
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPromo(false);
    setBestSellers(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR FILTERS (DESKTOP) */}
        <aside className="w-full md:w-64 glass-card p-6 rounded-2xl h-fit space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h3 className="font-black tracking-wide text-urbangold-gold text-lg flex items-center gap-2">
              <SlidersHorizontal size={18} /> FILTROS
            </h3>
            <button 
              onClick={handleResetFilters} 
              className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} /> Limpiar
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-6">
            {/* Search Bar */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Buscar</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nombre o SKU..."
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                />
                <Search size={16} className="absolute left-3 top-3 text-gray-500" />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price limits */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rango de Precios</label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-urbangold-gold text-white"
                />
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-urbangold-gold text-white"
                />
              </div>
            </div>

            {/* Checkbox Switches */}
            <div className="space-y-3.5 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={promo}
                  onChange={(e) => setPromo(e.target.checked)}
                  className="rounded border-white/10 bg-black/40 text-urbangold-gold focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Promociones</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={bestSellers}
                  onChange={(e) => setBestSellers(e.target.checked)}
                  className="rounded border-white/10 bg-black/40 text-urbangold-gold focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Más Vendidos</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 btn-gold rounded-xl text-sm font-bold shadow-lg"
            >
              Aplicar Filtros
            </button>
          </form>
        </aside>

        {/* PRODUCTS LISTING */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-wide">
              {products.length} {products.length === 1 ? 'Producto encontrado' : 'Productos encontrados'}
            </h2>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-urbangold-gold" />
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center space-y-4">
              <p className="text-lg font-medium text-gray-400">No encontramos productos con esos filtros</p>
              <button 
                onClick={handleResetFilters} 
                className="px-6 py-2.5 bg-urbangold-gray hover:bg-[#252525] border border-white/10 rounded-full text-sm text-white font-bold"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const price = product.discount_price || product.price;
                const mainImg = product.images?.[0]?.thumbnail || product.images?.[0]?.image || "https://placehold.co/400x400/0F0F0F/D4AF37?text=Urban+Gold";
                const isOutOfStock = product.inventory?.stock_actual === 0;

                return (
                  <div key={product.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group">
                    <Link to={`/product/${product.slug}`} className="block relative aspect-square bg-black/40 overflow-hidden border-b border-white/5">
                      {product.discount_price && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded tracking-wider uppercase z-10">
                          {product.discount_percent}% OFF
                        </span>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                          <span className="px-4 py-2 border border-red-500 bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest rounded">
                            Agotado
                          </span>
                        </div>
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
                          disabled={isOutOfStock}
                          className="px-4 py-2 bg-urbangold-gold text-urbangold-bg font-extrabold text-xs rounded-full hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-urbangold-gold disabled:hover:text-urbangold-bg"
                        >
                          Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

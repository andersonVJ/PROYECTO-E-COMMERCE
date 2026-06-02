import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, LogOut, Menu, X, Trash2, Plus, Minus, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/store';

export default function Navbar() {
  const navigate = useNavigate();
  const { 
    cart, 
    cartOpen, 
    setCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    getCartCount, 
    user, 
    logout 
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleCheckoutClick = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 w-full bg-urbangold-bg/85 backdrop-blur-md border-b border-urbangold-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-urbangold-gold to-white bg-clip-text text-transparent">
              URBAN GOLD
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium tracking-wide text-gray-300 hover:text-urbangold-gold transition-colors">
              INICIO
            </Link>
            <Link to="/catalog" className="text-sm font-medium tracking-wide text-gray-300 hover:text-urbangold-gold transition-colors">
              CATÁLOGO
            </Link>
            <Link to="/blog" className="text-sm font-medium tracking-wide text-gray-300 hover:text-urbangold-gold transition-colors">
              BLOG
            </Link>
            {user?.is_staff && (
              <Link to="/admin" className="text-sm font-semibold tracking-wide text-urbangold-gold hover:text-white transition-colors bg-urbangold-gold/10 px-3 py-1.5 rounded border border-urbangold-gold/20">
                PANEL ADMIN
              </Link>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* User Dropdown/Link */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-1 text-gray-300 hover:text-urbangold-gold transition-colors">
                  <UserIcon size={18} />
                  <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">{user.first_name || 'Mi Perfil'}</span>
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }} 
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="p-1.5 text-gray-300 hover:text-urbangold-gold transition-colors" title="Iniciar sesión">
                <UserIcon size={20} />
              </Link>
            )}

            {/* Cart Trigger */}
            <button 
              onClick={() => setCartOpen(true)} 
              className="relative p-2 text-gray-300 hover:text-urbangold-gold transition-all"
            >
              <ShoppingBag size={22} />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-urbangold-gold text-urbangold-bg font-extrabold text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse border border-urbangold-bg">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-1.5 text-gray-300 hover:text-urbangold-gold transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 w-full z-30 bg-urbangold-bg/95 backdrop-blur-lg border-b border-urbangold-gold/10 p-6 flex flex-col gap-4">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-urbangold-gold py-2 border-b border-white/5">
            Inicio
          </Link>
          <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-urbangold-gold py-2 border-b border-white/5">
            Catálogo
          </Link>
          <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-urbangold-gold py-2 border-b border-white/5">
            Blog
          </Link>
          {user?.is_staff && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-urbangold-gold py-2">
              Panel Administrativo
            </Link>
          )}
        </div>
      )}

      {/* SIDEBAR CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-urbangold-bg border-l border-urbangold-gold/10 flex flex-col shadow-2xl">
              {/* Drawer Header */}
              <div className="px-6 py-6 border-b border-urbangold-gold/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-urbangold-gold" size={22} />
                  <h2 className="text-xl font-bold tracking-wide">CARRITO DE COMPRAS</h2>
                </div>
                <button 
                  onClick={() => setCartOpen(false)} 
                  className="p-1.5 text-gray-400 hover:text-urbangold-gold transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                    <ShoppingBag size={48} className="text-gray-600 stroke-[1.5]" />
                    <div>
                      <p className="text-lg font-medium text-gray-300">Tu carrito está vacío</p>
                      <p className="text-sm text-gray-500 mt-1">Explora nuestro catálogo e introduce el estilo Urban Gold.</p>
                    </div>
                    <Link 
                      to="/catalog" 
                      onClick={() => setCartOpen(false)} 
                      className="mt-4 px-6 py-2.5 btn-gold rounded-full text-sm"
                    >
                      Ver Catálogo
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => {
                    const price = item.product.discount_price || item.product.price;
                    const mainImage = item.product.images?.[0]?.thumbnail || item.product.images?.[0]?.image || '/placeholder.png';
                    
                    return (
                      <div key={item.product.id} className="flex gap-4 p-4 rounded-xl bg-urbangold-gray/60 border border-urbangold-gold/5 relative overflow-hidden group">
                        {/* Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/40 border border-white/5 flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={mainImage.startsWith('http') ? mainImage : `http://127.0.0.1:8000${mainImage}`} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-white tracking-wide line-clamp-1">{item.product.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">SKU: {item.product.sku}</p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-urbangold-gold/20 rounded-md overflow-hidden bg-black/20">
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 hover:bg-urbangold-gold/10 text-gray-400 hover:text-white transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-urbangold-gold">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 hover:bg-urbangold-gold/10 text-gray-400 hover:text-white transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <span className="text-xs font-semibold text-urbangold-gold block">
                                ${(parseFloat(price) * item.quantity).toLocaleString('es-CO')} COP
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="border-t border-urbangold-gold/10 px-6 py-6 bg-urbangold-gray/40 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Subtotal</span>
                    <span className="text-lg font-bold text-white">${getCartTotal().toLocaleString('es-CO')} COP</span>
                  </div>
                  
                  <div className="flex items-start gap-2 bg-urbangold-gold/5 p-3 rounded-lg border border-urbangold-gold/10">
                    <ShieldAlert size={16} className="text-urbangold-gold mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      El costo de envío es fijo ($12.000 COP) para Medellín (Pago Contra Entrega), o se acuerda por WhatsApp para otras ciudades.
                    </p>
                  </div>

                  <button 
                    onClick={handleCheckoutClick}
                    className="w-full py-3.5 btn-gold rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2"
                  >
                    Proceder al Pago
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

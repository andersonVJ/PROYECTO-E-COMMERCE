import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, CreditCard, HelpCircle, Upload, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useStore } from '../store/store';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart, user, config, loadConfig } = useStore();

  const [paymentMethod, setPaymentMethod] = useState('Contra Entrega');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [error, setError] = useState(null);

  // Address fields (state for editing shipping info for this specific order)
  const [shippingInfo, setShippingInfo] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    neighborhood: user?.neighborhood || '',
    city: user?.city || '',
  });

  useEffect(() => {
    loadConfig();
    if (!user) {
      navigate('/login?redirect=checkout');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    // Validations
    if (!shippingInfo.address || !shippingInfo.phone || !shippingInfo.city) {
      setError("Por favor completa los campos obligatorios de envío.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Update user shipping info in profile if changed
      await axios.patch('http://127.0.0.1:8000/api/auth/profile/', {
        first_name: shippingInfo.first_name,
        last_name: shippingInfo.last_name,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        neighborhood: shippingInfo.neighborhood,
        city: shippingInfo.city,
      });

      // 2. Submit order
      const cartItems = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));

      const orderRes = await axios.post('http://127.0.0.1:8000/api/checkout/', {
        cart: cartItems,
        payment_method: paymentMethod,
        notes: notes
      });

      const order = orderRes.data;

      // 3. Upload receipt if Nequi payment method selected
      if (paymentMethod === 'Nequi' && receiptFile) {
        const formData = new FormData();
        formData.append('payment_receipt', receiptFile);
        await axios.post(`http://127.0.0.1:8000/api/orders/${order.id}/receipt/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccessOrder(order);
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || "Ocurrió un error al procesar el pedido. Revisa el stock.");
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <CheckCircle size={64} className="text-urbangold-gold mx-auto animate-bounce" />
        <h1 className="text-3xl font-black tracking-wide text-white">PEDIDO REALIZADO CON ÉXITO</h1>
        <p className="text-gray-400">
          Tu número de orden es <span className="text-white font-bold">{successOrder.order_number}</span>. 
          Hemos reservado tu inventario y el administrador revisará la transacción a la brevedad.
        </p>

        <div className="bg-urbangold-gray/60 p-6 rounded-2xl border border-urbangold-gold/15 text-left space-y-3">
          <p className="text-sm"><span className="text-gray-400">Cliente:</span> {shippingInfo.first_name} {shippingInfo.last_name}</p>
          <p className="text-sm"><span className="text-gray-400">Envío a:</span> {shippingInfo.address}, {shippingInfo.neighborhood}, {shippingInfo.city}</p>
          <p className="text-sm"><span className="text-gray-400">Método de pago:</span> {successOrder.payment_method}</p>
          <p className="text-sm"><span className="text-gray-400">Total a pagar:</span> ${parseFloat(successOrder.total_amount).toLocaleString('es-CO')} COP</p>
        </div>

        <div className="pt-6 flex gap-4 justify-center">
          <Link to="/profile" className="px-8 py-3.5 btn-gold rounded-full text-sm font-bold">
            Mis Pedidos
          </Link>
          <Link to="/catalog" className="px-8 py-3.5 bg-urbangold-gray hover:bg-[#252525] border border-white/10 rounded-full text-sm text-white">
            Seguir Comprando
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shippingCost = paymentMethod === 'Contra Entrega' && shippingInfo.city.toLowerCase().includes('medellin') 
    ? config.shipping_cost_medellin 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black tracking-wide mb-8">COMPLETA TU COMPRA</h1>

      {cart.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4">
          <ShoppingBag size={48} className="mx-auto text-gray-600" />
          <p className="text-gray-400">No hay productos en tu carrito para proceder al pago.</p>
          <Link to="/catalog" className="inline-block px-6 py-2.5 btn-gold rounded-full text-sm">
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Form & Payment Details */}
          <div className="lg:col-span-8 space-y-8">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              
              {/* Shipping info */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold tracking-wide text-urbangold-gold border-b border-white/5 pb-2">
                  1. DATOS DE ENVÍO
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                    <input 
                      type="text" 
                      name="first_name"
                      required
                      value={shippingInfo.first_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Apellido</label>
                    <input 
                      type="text" 
                      name="last_name"
                      required
                      value={shippingInfo.last_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      placeholder="ejemplo@correo.com"
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Teléfono</label>
                    <input 
                      type="text" 
                      name="phone"
                      required
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Ej: 3001234567"
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ciudad</label>
                    <input 
                      type="text" 
                      name="city"
                      required
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      placeholder="Ej: Medellín o Bogotá"
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Barrio / Comuna</label>
                    <input 
                      type="text" 
                      name="neighborhood"
                      required
                      value={shippingInfo.neighborhood}
                      onChange={handleInputChange}
                      placeholder="Ej: El Poblado"
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dirección Completa</label>
                  <input 
                    type="text" 
                    name="address"
                    required
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    placeholder="Calle, Carrera, Apto, Unidad..."
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notas del pedido (Opcional)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instrucciones adicionales para la entrega..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                  />
                </div>
              </div>

              {/* Payment selection */}
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <h2 className="text-lg font-bold tracking-wide text-urbangold-gold border-b border-white/5 pb-2">
                  2. MÉTODO DE PAGO
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Medellín COD */}
                  <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between h-32 transition-all ${
                    paymentMethod === 'Contra Entrega' ? 'border-urbangold-gold bg-urbangold-gold/5' : 'border-white/10 bg-black/20 hover:border-white/30'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="Contra Entrega"
                      checked={paymentMethod === 'Contra Entrega'}
                      onChange={() => setPaymentMethod('Contra Entrega')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Contra Entrega</span>
                      <CreditCard size={18} className="text-urbangold-gold" />
                    </div>
                    <span className="text-[10px] text-gray-500 leading-tight">
                      Válido solo en Medellín y área metropolitana. Costo: $12.000 COP.
                    </span>
                  </label>

                  {/* Nequi */}
                  <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between h-32 transition-all ${
                    paymentMethod === 'Nequi' ? 'border-urbangold-gold bg-urbangold-gold/5' : 'border-white/10 bg-black/20 hover:border-white/30'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="Nequi"
                      checked={paymentMethod === 'Nequi'}
                      onChange={() => setPaymentMethod('Nequi')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Nequi</span>
                      <CreditCard size={18} className="text-urbangold-gold" />
                    </div>
                    <span className="text-[10px] text-gray-500 leading-tight">
                      Pago anticipado. Sube tu comprobante para acelerar la validación.
                    </span>
                  </label>

                  {/* WhatsApp shipping quote */}
                  <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between h-32 transition-all ${
                    paymentMethod === 'WhatsApp' ? 'border-urbangold-gold bg-urbangold-gold/5' : 'border-white/10 bg-black/20 hover:border-white/30'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="WhatsApp"
                      checked={paymentMethod === 'WhatsApp'}
                      onChange={() => setPaymentMethod('WhatsApp')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">WhatsApp Envío</span>
                      <HelpCircle size={18} className="text-urbangold-gold" />
                    </div>
                    <span className="text-[10px] text-gray-500 leading-tight">
                      Acordar valor de envío exacto con destino nacional por chat.
                    </span>
                  </label>
                </div>

                {/* Conditional Payment details */}
                {paymentMethod === 'Nequi' && (
                  <div className="p-5 bg-black/40 border border-urbangold-gold/15 rounded-xl space-y-4">
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Realiza la transferencia al número de Nequi configurado por Urban Gold: <span className="text-urbangold-gold font-bold">{config.nequi_number}</span> y adjunta el comprobante a continuación para proceder.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <label className="px-4 py-2.5 border border-dashed border-urbangold-gold/30 hover:border-urbangold-gold bg-black/20 hover:bg-urbangold-gold/5 text-xs text-urbangold-gold font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all">
                        <Upload size={14} /> Subir Comprobante
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                      </label>
                      
                      {receiptPreview && (
                        <div className="w-16 h-16 rounded border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                          <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod === 'WhatsApp' && (
                  <div className="p-4 bg-urbangold-gold/5 border border-urbangold-gold/10 rounded-xl flex items-start gap-2.5">
                    <HelpCircle size={18} className="text-urbangold-gold mt-0.5" />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      El valor exacto del envío será confirmado vía WhatsApp según la ciudad de destino. El administrador procesará tu pedido y te contactará.
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 btn-gold rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 text-sm shadow-xl disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Confirmar Pedido y Pago'} <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4 glass-card p-6 rounded-2xl space-y-6">
            <h2 className="text-lg font-bold tracking-wide border-b border-white/5 pb-2">
              RESUMEN DE COMPRA
            </h2>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {cart.map((item) => {
                const itemPrice = item.product.discount_price || item.product.price;
                const itemImg = item.product.images?.[0]?.thumbnail || item.product.images?.[0]?.image || '/placeholder.png';
                
                return (
                  <div key={item.product.id} className="flex gap-3 items-center justify-between text-sm">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-10 h-10 rounded bg-black/40 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img 
                          src={itemImg.startsWith('http') ? itemImg : `http://127.0.0.1:8000${itemImg}`} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-white block font-medium line-clamp-1">{item.product.name}</span>
                        <span className="text-xs text-gray-500">Cant: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-300">
                      ${(parseFloat(itemPrice) * item.quantity).toLocaleString('es-CO')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>${subtotal.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Envío</span>
                <span>{shippingCost > 0 ? `$${shippingCost.toLocaleString('es-CO')} COP` : 'Por liquidar'}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold border-t border-white/5 pt-3">
                <span className="text-white">Total</span>
                <span className="text-urbangold-gold text-lg">${(subtotal + shippingCost).toLocaleString('es-CO')} COP</span>
              </div>
            </div>

            <div className="bg-black/20 p-3.5 rounded-xl border border-white/5 flex gap-2">
              <ShieldCheck size={16} className="text-urbangold-gold mt-0.5" />
              <p className="text-[10px] text-gray-500 leading-normal">
                Tu transacción y reserva de stock está encriptada y protegida. Al comprar creas una reserva directa de inventario.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ClipboardList, Settings, CheckCircle2, Circle, AlertCircle, ShoppingBag, Send } from 'lucide-react';
import axios from 'axios';
import { useStore } from '../store/store';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useStore();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [personalInfo, setPersonalInfo] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    neighborhood: user?.neighborhood || '',
    city: user?.city || '',
  });

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=profile');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await axios.get('http://127.0.0.1:8000/api/orders/');
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await updateProfile(personalInfo);
      setSuccessMsg('Información actualizada correctamente.');
    } catch (err) {
      setErrorMsg('Error al actualizar la información.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Confirmado': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Empacado': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'Enviado': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      case 'Entregado': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Cancelado': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const statusWorkflow = ['Pendiente', 'Confirmado', 'Empacado', 'Enviado', 'Entregado'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDE BAR NAVIGATION */}
        <aside className="w-full md:w-64 space-y-3">
          <div className="glass-card p-6 rounded-2xl text-center space-y-3">
            <div className="w-16 h-16 bg-urbangold-gold/15 text-urbangold-gold rounded-full flex items-center justify-center text-xl font-bold mx-auto border border-urbangold-gold/20">
              {user?.first_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-white text-base truncate">{user?.first_name} {user?.last_name}</h3>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="glass-card p-2 rounded-2xl flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full px-4 py-3 rounded-xl text-left text-sm font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'orders' ? 'bg-urbangold-gold text-urbangold-bg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ClipboardList size={16} /> Mis Pedidos
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`w-full px-4 py-3 rounded-xl text-left text-sm font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'info' ? 'bg-urbangold-gold text-urbangold-bg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings size={16} /> Información Personal
            </button>
          </div>
        </aside>

        {/* CONTENT COMPONENT */}
        <main className="flex-1">
          
          {/* MY ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black tracking-wide">MIS PEDIDOS</h2>

              {loadingOrders ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-urbangold-gold" />
                </div>
              ) : orders.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center space-y-4">
                  <ShoppingBag size={48} className="mx-auto text-gray-600" />
                  <p className="text-gray-400">Aún no has realizado ningún pedido.</p>
                  <Link to="/catalog" className="inline-block px-6 py-2.5 btn-gold rounded-full text-sm">
                    Comenzar Compras
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
                      
                      {/* Order metadata Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div>
                          <span className="text-xs text-gray-500">Orden</span>
                          <h3 className="text-base font-bold text-white tracking-wide">{order.order_number}</h3>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Fecha</span>
                          <span className="text-sm font-medium text-gray-300">
                            {new Date(order.created_at).toLocaleDateString('es-CO')}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Total</span>
                          <span className="text-sm font-bold text-urbangold-gold">
                            ${parseFloat(order.total_amount).toLocaleString('es-CO')} COP
                          </span>
                        </div>
                        <div>
                          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Purchased products list */}
                      <div className="space-y-4">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded bg-black/40 border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <img 
                                  src={item.product_thumbnail || "https://placehold.co/100x100/0F0F0F/D4AF37?text=Gorra"} 
                                  alt={item.product_name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="font-semibold text-white">{item.product_name}</span>
                                <span className="text-xs text-gray-500 block">SKU: {item.product_sku} (Cant: {item.quantity})</span>
                              </div>
                            </div>
                            <span className="font-bold text-gray-300">
                              ${(parseFloat(item.price) * item.quantity).toLocaleString('es-CO')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* State Tracker Timeline */}
                      {order.status !== 'Cancelado' && (
                        <div className="pt-4 border-t border-white/5">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-4">
                            Estado del Envío
                          </span>
                          
                          <div className="relative flex justify-between items-center max-w-xl mx-auto">
                            {/* Connector Line */}
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-urbangold-lightgray z-0" />
                            
                            {/* Color highlight for current progress */}
                            <div 
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-urbangold-gold transition-all duration-500 z-0" 
                              style={{
                                width: `${
                                  (statusWorkflow.indexOf(order.status) / (statusWorkflow.length - 1)) * 100
                                }%`
                              }}
                            />

                            {statusWorkflow.map((step, idx) => {
                              const stepIdx = statusWorkflow.indexOf(order.status);
                              const isCompleted = idx <= stepIdx;
                              const isActive = idx === stepIdx;

                              return (
                                <div key={step} className="flex flex-col items-center relative z-10">
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-urbangold-gold bg-urbangold-bg rounded-full" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-600 bg-urbangold-bg rounded-full" />
                                  )}
                                  <span className={`text-[10px] font-bold tracking-wider mt-2 bg-urbangold-bg px-1 uppercase ${
                                    isActive ? 'text-urbangold-gold' : isCompleted ? 'text-white' : 'text-gray-500'
                                  }`}>
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tracking number and guide */}
                      {order.tracking_number && (
                        <div className="p-4 bg-urbangold-gold/5 border border-urbangold-gold/10 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-500">Número de guía / transportadora:</span>
                            <p className="font-bold text-white mt-0.5">{order.tracking_number}</p>
                          </div>
                          <span className="text-urbangold-gold font-bold">En tránsito</span>
                        </div>
                      )}

                      {/* Order Observations */}
                      {order.notes && (
                        <div className="text-xs text-gray-500 leading-normal bg-black/20 p-3 rounded-lg border border-white/5">
                          <span className="font-bold block text-gray-400">Observaciones del cliente:</span>
                          {order.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EDIT PERSONAL INFO TAB */}
          {activeTab === 'info' && (
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
              <h2 className="text-2xl font-black tracking-wide">INFORMACIÓN DE ENVÍO</h2>
              <div className="h-0.5 w-16 bg-urbangold-gold" />

              {successMsg && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-xl">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                    <input 
                      type="text" 
                      name="first_name"
                      required
                      value={personalInfo.first_name}
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
                      value={personalInfo.last_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Teléfono</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={personalInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ciudad</label>
                    <input 
                      type="text" 
                      name="city"
                      value={personalInfo.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dirección de Envío</label>
                    <input 
                      type="text" 
                      name="address"
                      value={personalInfo.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Barrio / Comuna</label>
                    <input 
                      type="text" 
                      name="neighborhood"
                      value={personalInfo.neighborhood}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={updatingProfile}
                  className="w-full py-3.5 btn-gold rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 text-sm shadow-xl disabled:opacity-50"
                >
                  <Send size={16} /> {updatingProfile ? 'Guardando...' : 'Actualizar Datos'}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

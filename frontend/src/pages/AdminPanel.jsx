import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Package, ShoppingCart, Users, Settings, Plus, Trash2, 
  Upload, Check, AlertTriangle, Eye, ShieldAlert, PhoneCall, ExternalLink 
} from 'lucide-react';
import axios from 'axios';
import { useStore } from '../store/store';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeConfig, setStoreConfig] = useState({
    nequi_number: '',
    whatsapp_number: '',
    shipping_cost_medellin: 0
  });

  const [loading, setLoading] = useState(true);

  // Modals / Form states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    slug: '',
    category_id: '',
    description: '',
    price: '',
    discount_price: '',
    is_active: true,
    is_featured: false,
    is_weekly_recommendation: false,
    stock_actual: 10,
    stock_min: 5
  });

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({
    status: '',
    tracking_number: '',
    notes: ''
  });

  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (!user || !user.is_staff) {
      navigate('/');
      return;
    }
    loadAdminData();
  }, [user, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Load metrics
      const metricsRes = await axios.get('http://127.0.0.1:8000/api/admin/dashboard/');
      setMetrics(metricsRes.data.metrics);
      setCharts(metricsRes.data.charts);

      // 2. Load products
      const productsRes = await axios.get('http://127.0.0.1:8000/api/products/');
      setProducts(productsRes.data);

      // 3. Load categories
      const categoriesRes = await axios.get('http://127.0.0.1:8000/api/categories/');
      setCategories(categoriesRes.data);

      // 4. Load orders
      const ordersRes = await axios.get('http://127.0.0.1:8000/api/orders/');
      setOrders(ordersRes.data);

      // 5. Load config
      const configRes = await axios.get('http://127.0.0.1:8000/api/config/');
      setStoreConfig(configRes.data);

      // 6. Calculate client spending manually for customers tab
      const clientMap = {};
      ordersRes.data.forEach(order => {
        const email = order.customer_email;
        if (!clientMap[email]) {
          clientMap[email] = {
            email,
            name: order.customer_name,
            phone: order.customer_phone,
            city: order.customer_city,
            orders_count: 0,
            total_spent: 0
          };
        }
        clientMap[email].orders_count += 1;
        if (order.status !== 'Cancelado') {
          clientMap[email].total_spent += parseFloat(order.total_amount);
        }
      });
      setCustomers(Object.values(clientMap));

    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...productForm };
      if (!data.discount_price) delete data.discount_price;

      if (editingProduct) {
        await axios.patch(`http://127.0.0.1:8000/api/products/${editingProduct.slug}/`, data);
      } else {
        // Create product (slug generated automatically or simple fallback)
        data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const prodRes = await axios.post('http://127.0.0.1:8000/api/products/', data);
        
        // Update stock
        await axios.patch(`http://127.0.0.1:8000/api/products/${prodRes.data.slug}/`, {
          inventory: {
            stock_actual: data.stock_actual,
            stock_min: data.stock_min
          }
        });
      }
      setProductModalOpen(false);
      setEditingProduct(null);
      loadAdminData();
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleProductDelete = async (slug) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/products/${slug}/`);
        loadAdminData();
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const handleImageUpload = async (e, productId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    try {
      await axios.post(`http://127.0.0.1:8000/api/products/${productId}/images/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      loadAdminData();
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageDelete = async (imageId) => {
    if (window.confirm("¿Eliminar esta imagen?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/images/${imageId}/`);
        loadAdminData();
      } catch (err) {
        console.error('Failed to delete image:', err);
      }
    }
  };

  const openOrderDetails = (order) => {
    setActiveOrder(order);
    setOrderForm({
      status: order.status,
      tracking_number: order.tracking_number || '',
      notes: order.notes || ''
    });
    setOrderModalOpen(true);
  };

  const handleOrderUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://127.0.0.1:8000/api/orders/${activeOrder.id}/`, orderForm);
      
      // WhatsApp message details
      const phoneClean = activeOrder.customer_phone?.replace(/[^0-9]/g, '');
      const textMessage = `Hola *${activeOrder.customer_name}*, te informamos que tu pedido *${activeOrder.order_number}* en *Urban Gold* ha cambiado al estado: *${orderForm.status}*${orderForm.tracking_number ? `. Tu número de guía es: *${orderForm.tracking_number}*` : ''}. ¡Muchas gracias por tu compra!`;
      
      // Open WhatsApp API window
      window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(textMessage)}`, '_blank');

      setOrderModalOpen(false);
      loadAdminData();
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  const handleOrderDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pedido permanentemente? Esta acción es irreversible y restaurará el inventario correspondiente.')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/orders/${activeOrder.id}/`);
        setOrderModalOpen(false);
        loadAdminData();
      } catch (err) {
        console.error('Failed to delete order:', err);
        alert('Error al eliminar el pedido.');
      }
    }
  };

  const handleConfigUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://127.0.0.1:8000/api/config/', storeConfig);
      alert('Configuración guardada.');
      loadAdminData();
    } catch (err) {
      console.error('Config update failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-urbangold-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-wide text-white">PANEL ADMINISTRATIVO</h1>
          <p className="text-xs text-gray-500 mt-1">Monitorea ventas, inventarios, pedidos y clientes</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'products' && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  sku: '',
                  slug: '',
                  category_id: categories[0]?.id || '',
                  description: '',
                  price: '',
                  discount_price: '',
                  is_active: true,
                  is_featured: false,
                  is_weekly_recommendation: false,
                  stock_actual: 10,
                  stock_min: 5
                });
                setProductModalOpen(true);
              }}
              className="px-4 py-2 bg-urbangold-gold hover:bg-white hover:text-black text-urbangold-bg font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <Plus size={14} /> Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-4">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
          { id: 'products', name: 'Productos', icon: Package },
          { id: 'orders', name: 'Pedidos', icon: ShoppingCart },
          { id: 'customers', name: 'Clientes', icon: Users },
          { id: 'config', name: 'Configuración', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-urbangold-gold text-urbangold-gold' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={14} /> {tab.name}
            </button>
          );
        })}
      </div>

      {/* --- DASHBOARD TAB --- */}
      {activeTab === 'dashboard' && metrics && (
        <div className="space-y-8">
          {/* KPI indicators boxes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Ventas del Mes</span>
              <p className="text-xl font-bold text-urbangold-gold">${metrics.sales_month.toLocaleString('es-CO')} COP</p>
            </div>
            <div className="glass-card p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pedidos Pendientes</span>
              <p className="text-xl font-bold text-white">{metrics.pending_orders} pedidos</p>
            </div>
            <div className="glass-card p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Productos Vendidos</span>
              <p className="text-xl font-bold text-white">{metrics.total_products_sold} unidades</p>
            </div>
            <div className="glass-card p-5 rounded-2xl space-y-1 relative overflow-hidden">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Inventario Bajo</span>
              <p className="text-xl font-bold text-red-500 flex items-center gap-1.5">
                {metrics.low_stock_count > 0 && <ShieldAlert size={18} className="animate-pulse" />} 
                {metrics.low_stock_count} alertas
              </p>
            </div>
          </div>

          {/* SVG Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Trends Chart */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tendencias de Ventas ($ COP)</h3>
              <div className="h-60 w-full flex items-end justify-between gap-2 pt-4">
                {charts?.sales_per_month.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      ${Math.round(item.total / 1000)}k
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-urbangold-gold/20 to-urbangold-gold border-t border-urbangold-gold rounded-t-sm transition-all duration-500"
                      style={{ height: `${Math.max(10, Math.min(90, (item.total / (metrics.sales_month || 1)) * 90))}%` }}
                    />
                    <span className="text-[9px] text-gray-500 font-bold truncate max-w-full">
                      {item.month.slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Sellers & Cities lists */}
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Destacados de Venta</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Best selling caps */}
                <div className="space-y-3">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Productos más vendidos</span>
                  <div className="space-y-2">
                    {charts?.best_sellers.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-300 font-medium truncate max-w-[120px]">{p.name}</span>
                        <span className="font-bold text-urbangold-gold">{p.sold} uds.</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* City orders */}
                <div className="space-y-3">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Ciudades líderes</span>
                  <div className="space-y-2">
                    {charts?.cities_orders.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-300 font-medium capitalize">{c.city}</span>
                        <span className="font-bold text-white">{c.orders} ord.</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PRODUCTS TAB --- */}
      {activeTab === 'products' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-black/60 text-gray-500 border-b border-white/5 uppercase font-bold tracking-wider text-[10px]">
                  <th className="p-4">SKU</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4 text-right">Precio</th>
                  <th className="p-4 text-right">Stock</th>
                  <th className="p-4">Imágenes</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map(prod => {
                  const hasLowStock = prod.inventory?.stock_actual <= prod.inventory?.stock_min;
                  return (
                    <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono font-semibold text-white">{prod.sku}</td>
                      <td className="p-4 font-bold">{prod.name}</td>
                      <td className="p-4 text-gray-400 capitalize">{prod.category?.name}</td>
                      <td className="p-4 text-right font-semibold text-urbangold-gold">
                        ${parseFloat(prod.price).toLocaleString('es-CO')}
                      </td>
                      <td className={`p-4 text-right font-bold ${hasLowStock ? 'text-red-500' : 'text-green-500'}`}>
                        {prod.inventory?.stock_actual}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1.5 items-center">
                          {prod.images?.slice(0, 3).map((img, index) => (
                            <div key={img.id} className="relative w-8 h-8 rounded border border-white/5 overflow-hidden group">
                              <img src={`http://127.0.0.1:8000${img.thumbnail}`} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => handleImageDelete(img.id)}
                                className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Eliminar imagen"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                          <label className="w-8 h-8 rounded border border-dashed border-urbangold-gold/40 hover:border-urbangold-gold flex items-center justify-center cursor-pointer transition-all bg-black/20">
                            <Upload size={12} className="text-urbangold-gold" />
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, prod.id)}
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setProductForm({
                                name: prod.name,
                                sku: prod.sku,
                                slug: prod.slug,
                                category_id: prod.category?.id || '',
                                description: prod.description,
                                price: prod.price,
                                discount_price: prod.discount_price || '',
                                is_active: prod.is_active,
                                is_featured: prod.is_featured,
                                is_weekly_recommendation: prod.is_weekly_recommendation,
                                stock_actual: prod.inventory?.stock_actual,
                                stock_min: prod.inventory?.stock_min
                              });
                              setProductModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 border border-white/10 hover:border-urbangold-gold rounded-lg hover:text-urbangold-gold transition-colors font-bold text-xs"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleProductDelete(prod.slug)}
                            className="p-1.5 border border-white/5 hover:border-red-500 rounded-lg hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ORDERS TAB --- */}
      {activeTab === 'orders' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-black/60 text-gray-500 border-b border-white/5 uppercase font-bold tracking-wider text-[10px]">
                  <th className="p-4">Pedido</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Destino</th>
                  <th className="p-4">Método</th>
                  <th className="p-4 text-right">Monto</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">{order.order_number}</td>
                    <td className="p-4">
                      <span className="font-bold block">{order.customer_name}</span>
                      <span className="text-[10px] text-gray-500">{order.customer_email}</span>
                    </td>
                    <td className="p-4 text-gray-400 capitalize">{order.customer_city}</td>
                    <td className="p-4 text-xs font-semibold">{order.payment_method}</td>
                    <td className="p-4 text-right font-bold text-urbangold-gold">
                      ${parseFloat(order.total_amount).toLocaleString('es-CO')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        order.status === 'Pendiente' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                        order.status === 'Confirmado' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                        order.status === 'Empacado' ? 'text-purple-500 bg-purple-500/10 border-purple-500/20' :
                        order.status === 'Enviado' ? 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' :
                        order.status === 'Entregado' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
                        'text-red-500 bg-red-500/10 border-red-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="px-2.5 py-1.5 border border-white/10 hover:border-urbangold-gold rounded-lg hover:text-urbangold-gold transition-colors font-bold text-xs inline-flex items-center gap-1"
                      >
                        <Eye size={12} /> Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CUSTOMERS TAB --- */}
      {activeTab === 'customers' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-black/60 text-gray-500 border-b border-white/5 uppercase font-bold tracking-wider text-[10px]">
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Ciudad</th>
                  <th className="p-4 text-right">Pedidos</th>
                  <th className="p-4 text-right">Total Compras</th>
                  <th className="p-4 text-right">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">{c.name}</td>
                    <td className="p-4">
                      <span className="block">{c.email}</span>
                      <span className="text-[10px] text-gray-500">{c.phone}</span>
                    </td>
                    <td className="p-4 text-gray-400 capitalize">{c.city || 'No especificada'}</td>
                    <td className="p-4 text-right font-semibold">{c.orders_count}</td>
                    <td className="p-4 text-right font-bold text-urbangold-gold">
                      ${c.total_spent.toLocaleString('es-CO')}
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={`https://wa.me/${c.phone?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 hover:border-[#25D366] text-[#25D366] rounded-xl transition-all"
                      >
                        <PhoneCall size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SHOP CONFIG TAB --- */}
      {activeTab === 'config' && (
        <form onSubmit={handleConfigUpdate} className="glass-card p-6 rounded-2xl border border-white/5 max-w-xl space-y-6">
          <h2 className="text-xl font-bold tracking-wide text-urbangold-gold border-b border-white/5 pb-2">
            CONFIGURACIÓN GLOBAL
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Número de Nequi
              </label>
              <input 
                type="text"
                required
                value={storeConfig.nequi_number}
                onChange={(e) => setStoreConfig({ ...storeConfig, nequi_number: e.target.value })}
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                WhatsApp de la Tienda
              </label>
              <input 
                type="text"
                required
                value={storeConfig.whatsapp_number}
                onChange={(e) => setStoreConfig({ ...storeConfig, whatsapp_number: e.target.value })}
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Costo fijo de envío (Medellín)
              </label>
              <input 
                type="number"
                required
                value={storeConfig.shipping_cost_medellin}
                onChange={(e) => setStoreConfig({ ...storeConfig, shipping_cost_medellin: e.target.value })}
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 btn-gold rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 text-sm shadow-xl"
          >
            Guardar Configuración
          </button>
        </form>
      )}

      {/* --- PRODUCT EDIT / CREATE MODAL --- */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setProductModalOpen(false)} />
          <div className="relative bg-urbangold-bg border border-urbangold-gold/20 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h2 className="text-xl font-black text-white">
                {editingProduct ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
              </h2>
              <button onClick={() => setProductModalOpen(false)} className="text-gray-500 hover:text-white">Cerrar</button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Nombre</label>
                  <input 
                    type="text" 
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-urbangold-gold text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">SKU</label>
                  <input 
                    type="text" 
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-urbangold-gold text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Categoría</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-urbangold-gold text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Precio Normal ($ COP)</label>
                  <input 
                    type="number" 
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-urbangold-gold text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Precio Promo</label>
                  <input 
                    type="number" 
                    value={productForm.discount_price}
                    onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-urbangold-gold text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Stock Actual</label>
                  <input 
                    type="number" 
                    value={productForm.stock_actual}
                    onChange={(e) => setProductForm({ ...productForm, stock_actual: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-urbangold-gold text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Stock Mínimo</label>
                  <input 
                    type="number" 
                    value={productForm.stock_min}
                    onChange={(e) => setProductForm({ ...productForm, stock_min: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-urbangold-gold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase mb-1">Descripción</label>
                <textarea 
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-urbangold-gold text-white"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={productForm.is_active}
                    onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                    className="rounded border-white/10 bg-black/40 text-urbangold-gold focus:ring-0"
                  />
                  <span>Activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="rounded border-white/10 bg-black/40 text-urbangold-gold focus:ring-0"
                  />
                  <span>Destacar en Home</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={productForm.is_weekly_recommendation}
                    onChange={(e) => setProductForm({ ...productForm, is_weekly_recommendation: e.target.checked })}
                    className="rounded border-white/10 bg-black/40 text-urbangold-gold focus:ring-0"
                  />
                  <span>Recomendado Semanal</span>
                </label>
              </div>

              <button type="submit" className="w-full py-3 btn-gold rounded-xl font-bold mt-4">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ORDER GESTION MODAL --- */}
      {orderModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOrderModalOpen(false)} />
          <div className="relative bg-urbangold-bg border border-urbangold-gold/20 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto z-10 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h2 className="text-xl font-black text-white">PEDIDO: {activeOrder.order_number}</h2>
              <button onClick={() => setOrderModalOpen(false)} className="text-gray-500 hover:text-white">Cerrar</button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Buyer Contact Card */}
              <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2 relative">
                <h4 className="font-bold text-urbangold-gold text-xs uppercase tracking-wider">Detalles de Entrega</h4>
                <p><span className="text-gray-500">Cliente:</span> {activeOrder.customer_name}</p>
                <p><span className="text-gray-500">Correo:</span> {activeOrder.customer_email}</p>
                <p><span className="text-gray-500">Teléfono:</span> {activeOrder.customer_phone}</p>
                <p><span className="text-gray-500">Envío a:</span> {activeOrder.customer_address}, {activeOrder.customer_neighborhood}, {activeOrder.customer_city}</p>
                <p><span className="text-gray-500">Método de pago:</span> {activeOrder.payment_method}</p>
                
                <a
                  href={`https://wa.me/${activeOrder.customer_phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hola ${activeOrder.customer_name}, te contactamos de Urban Gold respecto a tu pedido ${activeOrder.order_number}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-xs"
                >
                  WhatsApp <ExternalLink size={10} />
                </a>
              </div>

              {/* Purchase items */}
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">Artículos comprados</h4>
                <div className="space-y-2">
                  {activeOrder.items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-black/10 p-2 rounded">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span className="font-mono text-urbangold-gold">${parseFloat(item.price).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                  <div className="text-right font-bold text-white pt-2">
                    Total: ${parseFloat(activeOrder.total_amount).toLocaleString('es-CO')} COP
                  </div>
                </div>
              </div>

              {/* Nequi payment receipt checking */}
              {activeOrder.payment_receipt && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">Comprobante de Pago (Nequi)</h4>
                  <a 
                    href={`http://127.0.0.1:8000${activeOrder.payment_receipt}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-32 h-32 rounded border border-white/10 overflow-hidden bg-black hover:opacity-85 transition-opacity"
                  >
                    <img src={`http://127.0.0.1:8000${activeOrder.payment_receipt}`} className="w-full h-full object-cover" />
                  </a>
                </div>
              )}

              {/* Status Update Form */}
              <form onSubmit={handleOrderUpdate} className="space-y-4 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Estado de la Orden</label>
                  <select
                    value={orderForm.status}
                    onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-urbangold-gold text-white"
                  >
                    <option value="Pendiente">Pendiente (Reserva stock)</option>
                    <option value="Confirmado">Confirmado (Descuenta stock)</option>
                    <option value="Empacado">Empacado</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado (Libera stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Número de Guía de Envío</label>
                  <input 
                    type="text" 
                    value={orderForm.tracking_number}
                    onChange={(e) => setOrderForm({ ...orderForm, tracking_number: e.target.value })}
                    placeholder="Servientrega, Envía, Coordinadora..."
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-urbangold-gold text-white"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={handleOrderDelete}
                    className="w-1/3 py-3 bg-red-600/10 hover:bg-red-600/30 text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl font-bold transition-all duration-300"
                  >
                    Eliminar
                  </button>
                  <button type="submit" className="w-2/3 py-3 btn-gold rounded-xl font-bold">
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

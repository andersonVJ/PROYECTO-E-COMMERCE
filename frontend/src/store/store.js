import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Configure Axios defaults to simplify token inclusion
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('ug_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const useStore = create((set, get) => ({
  // --- AUTHENTICATION STATE ---
  user: JSON.parse(localStorage.getItem('ug_user')) || null,
  token: localStorage.getItem('ug_token') || null,
  authError: null,
  authLoading: false,

  login: async (email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, { email, password });
      const { access, user } = response.data;
      
      localStorage.setItem('ug_token', access);
      localStorage.setItem('ug_user', JSON.stringify(user));
      
      set({ token: access, user, authLoading: false });
      return user;
    } catch (error) {
      const message = error.response?.data?.detail || 'Correo o contraseña incorrectos';
      set({ authError: message, authLoading: false });
      throw new Error(message);
    }
  },

  register: async (userData) => {
    set({ authLoading: true, authError: null });
    try {
      await axios.post(`${API_URL}/auth/register/`, userData);
      set({ authLoading: false });
      // Automate login after registering
      return await get().login(userData.email, userData.password);
    } catch (error) {
      let message = 'Error en el registro. Verifica los datos.';
      if (error.response?.data) {
        // Collect errors field by field
        message = Object.entries(error.response.data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
      }
      set({ authError: message, authLoading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('ug_token');
    localStorage.removeItem('ug_user');
    set({ token: null, user: null, authError: null });
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axios.patch(`${API_URL}/auth/profile/`, profileData);
      const updatedUser = response.data;
      localStorage.setItem('ug_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  },

  // --- CART STATE ---
  cart: JSON.parse(localStorage.getItem('ug_cart')) || [],
  cartOpen: false,

  setCartOpen: (open) => set({ cartOpen: open }),

  addToCart: (product, quantity = 1) => {
    const { cart } = get();
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    
    let newCart;
    if (existingIndex > -1) {
      newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart = [...cart, { product, quantity }];
    }

    localStorage.setItem('ug_cart', JSON.stringify(newCart));
    set({ cart: newCart, cartOpen: true }); // Automatically open cart drawer to give immediate feedback
  },

  removeFromCart: (productId) => {
    const { cart } = get();
    const newCart = cart.filter((item) => item.product.id !== productId);
    localStorage.setItem('ug_cart', JSON.stringify(newCart));
    set({ cart: newCart });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const { cart } = get();
    const newCart = cart.map((item) => 
      item.product.id === productId ? { ...item, quantity } : item
    );
    localStorage.setItem('ug_cart', JSON.stringify(newCart));
    set({ cart: newCart });
  },

  clearCart: () => {
    localStorage.removeItem('ug_cart');
    set({ cart: [] });
  },

  // Helper getters
  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => {
      const price = item.product.discount_price || item.product.price;
      return total + (parseFloat(price) * item.quantity);
    }, 0);
  },

  getCartCount: () => {
    const { cart } = get();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },

  // --- STORE CONFIG STATE ---
  config: {
    nequi_number: '3123456789',
    whatsapp_number: '+573123456789',
    shipping_cost_medellin: 12000
  },

  loadConfig: async () => {
    try {
      const response = await axios.get(`${API_URL}/config/`);
      set({ config: response.data });
    } catch (error) {
      console.error('Failed to load store configuration:', error);
    }
  }
}));

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Blog from './pages/Blog';
import BlogPostView from './pages/BlogPostView';
import AdminPanel from './pages/AdminPanel';

import { useStore } from './store/store';

function App() {
  const { loadConfig } = useStore();

  useEffect(() => {
    // Load store-wide configurations (e.g. WhatsApp, Nequi numbers) on startup
    loadConfig();
  }, [loadConfig]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between bg-urbangold-bg text-white selection:bg-urbangold-gold selection:text-urbangold-bg">
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPostView />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
        <Footer />
        <WhatsAppButton />
      </div>
    </Router>
  );
}

export default App;

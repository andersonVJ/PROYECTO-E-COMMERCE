import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Mail, Lock, Phone, MapPin, User as UserIcon, AlertCircle } from 'lucide-react';
import { useStore } from '../store/store';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, user, authLoading, authError } = useStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
  });

  const [error, setError] = useState(null);
  const redirectTarget = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (user) {
      navigate(redirectTarget);
    }
  }, [user, navigate, redirectTarget]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register(formData);
      navigate(redirectTarget);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="glass-card p-8 rounded-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-urbangold-gold/10 rounded-full blur-2xl" />

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-wide text-white">CREAR CUENTA</h1>
          <p className="text-sm text-gray-500">Únete a Urban Gold y disfruta el estilo premium</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <pre className="whitespace-pre-wrap font-sans text-xs">{error}</pre>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                />
                <UserIcon size={16} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Apellido</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                />
                <UserIcon size={16} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</label>
              <div className="relative">
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@urbangold.co"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                />
                <Mail size={16} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Teléfono / Celular</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Ej: 3001234567"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                />
                <Phone size={16} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <input 
                  type="password" 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                />
                <Lock size={16} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ciudad</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ej: Medellín o Bogotá"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                />
                <MapPin size={16} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dirección de Entrega</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Calle, Carrera, Apto..."
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                />
                <MapPin size={16} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* Neighborhood */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Barrio / Comuna</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="neighborhood"
                  required
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
                />
                <MapPin size={16} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={authLoading}
            className="w-full py-3.5 btn-gold rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 text-sm shadow-xl disabled:opacity-50"
          >
            <UserPlus size={18} /> {authLoading ? 'Creando cuenta...' : 'Registrar Cuenta'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-white/5 text-sm text-gray-500">
          ¿Ya tienes una cuenta?{' '}
          <Link to={`/login?redirect=${redirectTarget}`} className="text-urbangold-gold hover:underline font-semibold">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}

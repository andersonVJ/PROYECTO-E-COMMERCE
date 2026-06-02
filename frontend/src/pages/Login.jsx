import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import { useStore } from '../store/store';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user, authLoading, authError } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const redirectTarget = searchParams.get('redirect') || '/';

  useEffect(() => {
    // If user is already logged in, redirect away
    if (user) {
      navigate(redirectTarget);
    }
  }, [user, navigate, redirectTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate(redirectTarget);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="glass-card p-8 rounded-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-urbangold-gold/10 rounded-full blur-2xl" />

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-wide text-white">INICIAR SESIÓN</h1>
          <p className="text-sm text-gray-500">Urban Gold – Accede a tu cuenta premium</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@urbangold.co"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
              />
              <Mail size={16} className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-urbangold-gold text-white"
              />
              <Lock size={16} className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={authLoading}
            className="w-full py-3.5 btn-gold rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 text-sm shadow-xl disabled:opacity-50"
          >
            <LogIn size={18} /> {authLoading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-white/5 text-sm text-gray-500">
          ¿No tienes una cuenta?{' '}
          <Link to={`/register?redirect=${redirectTarget}`} className="text-urbangold-gold hover:underline font-semibold">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useStore } from '../store/store';

export default function Footer() {
  const { config } = useStore();

  return (
    <footer className="bg-black border-t border-urbangold-gold/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Slogan */}
        <div className="space-y-4">
          <h3 className="text-xl font-black tracking-widest text-urbangold-gold">URBAN GOLD</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            "Urban Gold – El estilo que marca la diferencia."
          </p>
          <p className="text-xs text-gray-500">
            Plataforma premium especializada en moda urbana y gorras exclusivas.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-urbangold-gold mb-4">Explorar</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li>
              <Link to="/catalog" className="hover:text-white transition-colors">Catálogo de Gorras</Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-white transition-colors">Blog y Tendencias</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-white transition-colors">Mi Cuenta</Link>
            </li>
          </ul>
        </div>

        {/* Legal Policies */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-urbangold-gold mb-4">Políticas</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Términos y Condiciones</a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Políticas de Envío y Devolución</a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Políticas de Privacidad</a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Tratamiento de Datos</a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3.5 text-sm text-gray-400">
          <h4 className="text-xs font-bold uppercase tracking-wider text-urbangold-gold mb-4">Contacto</h4>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-urbangold-gold" />
            <span>Medellín, Colombia</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-urbangold-gold" />
            <a href={`tel:${config.whatsapp_number}`} className="hover:text-white transition-colors">
              {config.whatsapp_number}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-urbangold-gold" />
            <a href="mailto:soporte@urbangold.com" className="hover:text-white transition-colors">
              soporte@urbangold.com
            </a>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <a href="https://www.instagram.com/urban_gold_caps/" target="_blank" rel="noopener noreferrer" className="p-2 bg-urbangold-gray hover:bg-urbangold-gold hover:text-black rounded-full transition-all text-gray-400" title="Instagram">
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61563883482069" target="_blank" rel="noopener noreferrer" className="p-2 bg-urbangold-gray hover:bg-urbangold-gold hover:text-black rounded-full transition-all text-gray-400" title="Facebook">
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Urban Gold. Todos los derechos reservados.</p>
        <p>Diseño futurista e inmersivo 3D.</p>
      </div>
    </footer>
  );
}

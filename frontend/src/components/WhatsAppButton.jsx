import React from 'react';
import { useStore } from '../store/store';

export default function WhatsAppButton() {
  const { config } = useStore();

  const handleWhatsAppClick = () => {
    // Standard format for WhatsApp link: https://wa.me/number?text=message
    const formattedNumber = config.whatsapp_number.replace(/[^0-9+]/g, '');
    const defaultMessage = encodeURIComponent("Hola, estoy interesado en los productos de Urban Gold.");
    const waUrl = `https://wa.me/${formattedNumber}?text=${defaultMessage}`;
    window.open(waUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-40 p-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group flex items-center justify-center"
      title="Contactar por WhatsApp"
      id="whatsapp-floating-btn"
    >
      {/* WhatsApp SVG logo */}
      <svg
        className="w-6 h-6 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.632 1.971 14.162.946 11.535.946c-5.442 0-9.87 4.372-9.874 9.802-.001 1.65.432 3.262 1.253 4.677L1.875 22.13l6.892-1.796c-1.366-.747-2.083-1.512-2.12-2.18zM17.47 14.39c-.32-.16-1.89-.93-2.18-1.03-.29-.1-.5-.15-.71.15-.21.3-.81 1.03-1 1.24-.19.22-.38.24-.7.08-.31-.16-1.33-.49-2.54-1.57-.94-.84-1.57-1.87-1.75-2.18-.18-.31-.02-.48.14-.64.14-.14.32-.37.48-.56.16-.18.21-.3.32-.51.11-.2.05-.38-.03-.54-.08-.16-.71-1.7-.97-2.33-.26-.63-.52-.54-.71-.55-.19-.01-.4-.01-.6-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.11 3.22 5.11 4.52.71.31 1.27.5 1.7.63.72.23 1.37.2 1.89.12.58-.08 1.8-.73 2.05-1.43.25-.7.25-1.29.18-1.42-.08-.13-.25-.21-.57-.37z" />
      </svg>
      {/* Glowing tooltip */}
      <span className="absolute right-16 scale-0 group-hover:scale-100 bg-urbangold-gray text-urbangold-gold border border-urbangold-gold/20 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl transition-all duration-200">
        ¿Necesitas ayuda?
      </span>
    </button>
  );
}

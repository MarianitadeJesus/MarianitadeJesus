import React from 'react';
import { Mail, MessageCircle, Facebook, Instagram, Send, Heart, Music } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappMessage = encodeURIComponent('Hola 😊👋, qué tal, quisiera saber más información sobre la quinta y me encantaría hacer una reservación');

  return (
    <footer className="relative z-10 backdrop-blur-xl bg-gradient-to-br from-green-900 to-green-800 text-white border-t border-white/10">
      {/* Christmas lights decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-red-500 to-green-500 opacity-50" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-serif text-xl">M</span>
              </div>
              <div>
                <h3 className="font-serif text-xl">Marianita de Jesús</h3>
                <p className="text-sm text-green-200">Quinta Privada</p>
              </div>
            </div>
            <p className="text-green-100 text-sm leading-relaxed">
              Un oasis de tranquilidad y elegancia para tus momentos especiales
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg mb-4">Contacto</h4>
            <div className="space-y-3">
              <a
                href="mailto:reservas.marianitadejesus@proton.me"
                className="flex items-center gap-2 text-green-100 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">reservas.marianitadejesus@proton.me</span>
              </a>
              
              <a
                href={`https://wa.me/593999693683?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-100 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">+593 99 969 3683</span>
              </a>

              <a
                href={`https://wa.me/593981396030?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-100 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">+593 98 139 6030</span>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-serif text-lg mb-4">Redes Sociales</h4>
            <div className="flex gap-3">
              <a
                href="mailto:reservas.marianitadejesus@proton.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>

              <a
                href={`https://wa.me/593999693683?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              <a
                href="https://www.facebook.com/Quinta-recreacional-Marianita-de-Jesus-107005494487735/?ref=page_internal"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>

              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-50">
                <Instagram className="w-5 h-5" />
              </div>

              <a
                href="https://www.tiktok.com/@marianitadejesussantaana?_r=1&_t=ZM-92KR5UBU2IK"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                aria-label="TikTok"
              >
                <Music className="w-5 h-5" />
              </a>

              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-50">
                <Instagram className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-green-200 mt-3">
              Instagram próximamente
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-green-100 text-sm flex items-center justify-center gap-2">
            © {currentYear} Quinta Privada Marianita de Jesús. 
            <span className="flex items-center gap-1">
              Hecho con <Heart className="w-4 h-4 text-red-400 fill-red-400" /> para ti
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

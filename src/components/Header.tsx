import React from 'react';
import { Menu, X, LogIn, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
  onAdminClick?: () => void;
  user: any;
  isAdmin: boolean;
}

export function Header({ onLoginClick, onSignupClick, onLogout, onAdminClick, user, isAdmin }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Inicio', id: 'hero' },
    { label: 'Nosotros', id: 'about' },
    { label: 'Servicios', id: 'services' },
    { label: 'Reservar', id: 'reservations' },
    { label: 'Experiencias', id: 'experiences' },
    { label: 'Galería', id: 'gallery' },
    { label: 'Ubicación', id: 'location' },
    { label: 'Contacto', id: 'contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => scrollToSection('hero')}
              className="flex items-center space-x-3 group"
            >
              <img 
                src="/marianita-logo.svg" 
                alt="Marianita de Jesús Logo" 
                className="h-12 w-12 object-contain"
              />
              <div className="hidden sm:block">
                <div className="font-serif text-green-800 transition-colors text-lg font-bold">
                  MARIANITA
                </div>
                <div className="text-xs text-green-600">DE JESÚS</div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:text-green-700 hover:bg-green-50/50 transition-all"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-50/50">
                  <User className="w-4 h-4 text-green-700" />
                  <span className="text-sm text-green-800">
                    {user.user_metadata?.name || user.email}
                  </span>
                </div>
                {isAdmin && onAdminClick && (
                  <Button
                    onClick={onAdminClick}
                    variant="outline"
                    size="sm"
                    className="border-amber-200 bg-amber-50/50 text-amber-800 hover:bg-amber-100"
                  >
                    Panel Admin
                  </Button>
                )}
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="border-gray-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={onLoginClick}
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Button>
                <Button
                  onClick={onSignupClick}
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md"
                >
                  Crear Cuenta
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-green-50/50 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/20 backdrop-blur-md bg-white/95">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50/50 transition-colors"
              >
                {item.label}
              </button>
            ))}
            
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 bg-green-50/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-green-700" />
                      <span className="text-sm text-green-800">
                        {user.user_metadata?.name || user.email}
                      </span>
                    </div>
                  </div>
                  {isAdmin && onAdminClick && (
                    <Button
                      onClick={() => {
                        onAdminClick();
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full border-amber-200 bg-amber-50/50 text-amber-800"
                    >
                      Panel Admin
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Salir
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      onLoginClick();
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-green-200 text-green-700"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                  <Button
                    onClick={() => {
                      onSignupClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
                  >
                    Crear Cuenta
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

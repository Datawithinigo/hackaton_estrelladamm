import { useState, useEffect } from 'react';
import { Star, Menu, X } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
}

export default function Header({ isLoggedIn }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#como-funciona', label: 'Cómo funciona' },
    { href: '#registro', label: 'Registro' },
    { href: '#mis-estrellas', label: 'Mis Estrellas' },
    { href: '#mapa', label: 'Mapa' },
    { href: '#faq', label: 'FAQ' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative">
              <Star className="w-8 h-8 text-[#C8102E] fill-[#C8102E] transition-transform group-hover:rotate-12" />
              <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37] absolute -top-1 -right-1 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-xl font-bold text-[#C8102E]">Estrella Connect</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#333333] hover:text-[#C8102E] transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            className="md:hidden text-[#333333]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#333333] hover:text-[#C8102E] transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

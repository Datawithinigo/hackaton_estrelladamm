import { Star, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#F5F5F5] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-[#C8102E] fill-[#C8102E]" />
                <span className="text-lg font-bold text-[#C8102E]">Estrella Connect</span>
              </div>
              <p className="text-[#666666] text-sm">
                La forma más divertida de conectar con otros amantes de la buena cerveza
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#333333] mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-[#666666] hover:text-[#C8102E] transition-colors text-sm">
                  Política de Privacidad
                </a>
                <a href="#" className="block text-[#666666] hover:text-[#C8102E] transition-colors text-sm">
                  Términos y Condiciones
                </a>
                <a href="#" className="block text-[#666666] hover:text-[#C8102E] transition-colors text-sm">
                  Política de Cookies
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#333333] mb-4">Contacto</h4>
              <div className="space-y-2">
                <a href="#" className="block text-[#666666] hover:text-[#C8102E] transition-colors text-sm">
                  Soporte
                </a>
                <a href="#" className="block text-[#666666] hover:text-[#C8102E] transition-colors text-sm">
                  Reportar problema
                </a>
                <a href="#" className="block text-[#666666] hover:text-[#C8102E] transition-colors text-sm">
                  Eliminar cuenta
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-[#F5F5F5] pt-8">
            <div className="bg-gradient-to-r from-[#C8102E] to-[#D4AF37] rounded-2xl p-6 text-white text-center mb-8">
              <Heart className="w-8 h-8 mx-auto mb-3 fill-white" />
              <p className="text-xl font-bold mb-2">Bebe con la cabeza, no solo con el corazón</p>
              <p className="text-white/90">Disfruta. No te pases.</p>
            </div>

            <div className="text-center text-sm text-[#999999]">
              <p>© 2024 Estrella Connect. Campaña promocional.</p>
              <p className="mt-2">
                Esta es una experiencia para mayores de edad. Consumo responsable siempre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { ArrowRight, Smartphone, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-white via-[#FFF5F5] to-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-[#333333] leading-tight">
              Conoce a tus{' '}
              <span className="text-[#C8102E]">estrellas</span>.{' '}
              <span className="block mt-2">Las humanas.</span>
            </h1>
            <p className="text-xl text-[#666666] leading-relaxed">
              Escanea tu birra, entra al juego, descubre quién brilla cerca
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#registro"
                className="inline-flex items-center justify-center gap-2 bg-[#C8102E] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#A00D24] transition-all hover:scale-105 shadow-lg"
              >
                Empezar ahora
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#registro"
                className="inline-flex items-center justify-center gap-2 text-[#D4AF37] px-8 py-4 rounded-lg font-bold hover:text-[#B89530] transition-colors border-2 border-[#D4AF37] hover:border-[#B89530]"
              >
                ¿Ya estás dentro? Inicia sesión
              </a>
            </div>
            <p className="text-sm text-[#999999] italic">
              Tú + cerveza + buen rollo (del bueno)
            </p>
          </div>

          <div className="relative animate-float">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-[#C8102E] to-[#8B0A1F] rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
                <Smartphone className="w-full h-96 text-white/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-2xl p-6 shadow-xl max-w-xs w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <Star className="w-8 h-8 text-[#D4AF37] fill-[#D4AF37]" />
                      <div>
                        <p className="font-bold text-[#333333]">Nivel Oro</p>
                        <p className="text-sm text-[#666666]">42 estrellas</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#C8102E] to-[#D4AF37] w-4/5"></div>
                      </div>
                      <p className="text-xs text-[#999999]">12 personas brillando cerca</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#D4AF37] rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#C8102E] rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

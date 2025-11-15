import { QrCode, UserPlus, Star, MessageCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: QrCode,
      title: 'Escanea el QR de tu botella',
      description: 'Cada botella es tu entrada al juego'
    },
    {
      icon: UserPlus,
      title: 'Regístrate',
      description: 'Lo justo, sin rollos'
    },
    {
      icon: Star,
      title: 'Suma tus estrellas Damm',
      description: 'Más botellas, más poder'
    },
    {
      icon: MessageCircle,
      title: 'Desbloquea mensajes',
      description: 'Ve quién hay cerca y conecta'
    }
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-4">
            Cómo funciona
          </h2>
          <p className="text-xl text-[#666666]">
            Colecciona estrellas, desbloquea conversaciones, conoce quién brilla cerca
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-[#F5F5F5] rounded-2xl p-8 hover:bg-[#FFF5F5] transition-all hover:shadow-lg hover:-translate-y-2 group"
            >
              <div className="bg-gradient-to-br from-[#C8102E] to-[#D4AF37] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <div className="relative mb-4">
                <span className="absolute -top-8 -right-4 text-6xl font-bold text-[#D4AF37] opacity-20">
                  {index + 1}
                </span>
                <h3 className="text-xl font-bold text-[#333333] relative z-10">
                  {step.title}
                </h3>
              </div>
              <p className="text-[#666666]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { ChevronDown, Shield, Lock, MapPin, Trash2 } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      icon: Shield,
      question: '¿Por qué pedís mi edad?',
      answer: 'Esta es una experiencia para mayores de edad. Necesitamos verificar que todos los usuarios tienen la edad legal para consumir alcohol en su país. Además, queremos crear un ambiente seguro y responsable.'
    },
    {
      icon: Lock,
      question: '¿Por qué es opcional la orientación sexual?',
      answer: 'Lo pedimos de forma opcional para poder personalizar tu experiencia y mostrarte personas con las que podrías tener más afinidad. Nunca es obligatorio y siempre puedes elegir "Prefiero no decir". Tus datos están protegidos según estándares GDPR.'
    },
    {
      icon: MapPin,
      question: '¿Cómo funciona el mapa?',
      answer: 'El mapa muestra ubicaciones aproximadas (barrio/zona), nunca tu dirección exacta. Es completamente opt-in: solo apareces si activas "Aparecer en el mapa". Puedes desactivarlo en cualquier momento. Solo usuarios verificados pueden ver el mapa.'
    },
    {
      icon: Shield,
      question: '¿Cómo contáis mis estrellas?',
      answer: 'Cada vez que escaneas el código QR de una botella de Estrella Damm verificada, sumas una estrella. Más estrellas = más funciones desbloqueadas. Es nuestra forma de premiar la lealtad a la marca y crear una experiencia gamificada.'
    },
    {
      icon: Trash2,
      question: '¿Puedo borrar mis datos?',
      answer: 'Absolutamente. Puedes solicitar la eliminación completa de tu cuenta y todos tus datos en cualquier momento desde la configuración de tu perfil o contactando con soporte. Cumplimos con todas las regulaciones de protección de datos GDPR.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-xl text-[#666666]">
            Todo lo que necesitas saber, sin rollos
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#F5F5F5] rounded-2xl overflow-hidden hover:bg-[#FFF5F5] transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex items-center gap-4 text-left"
              >
                <div className="bg-gradient-to-br from-[#C8102E] to-[#D4AF37] rounded-xl p-3 flex-shrink-0">
                  <faq.icon className="w-6 h-6 text-white" />
                </div>
                <span className="flex-1 font-bold text-[#333333] text-lg">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-[#666666] transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6 animate-fade-in">
                  <p className="text-[#666666] leading-relaxed pl-16">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-12 bg-gradient-to-br from-[#C8102E] to-[#8B0A1F] rounded-3xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Protección de datos y privacidad</h3>
          <div className="space-y-3 text-white/90">
            <p>✓ Protección de datos según estándares GDPR</p>
            <p>✓ Puedes solicitar eliminación de datos en cualquier momento</p>
            <p>✓ Ubicación aproximada, nunca dirección exacta</p>
            <p>✓ Puedes desactivar tu ubicación cuando quieras</p>
            <p>✓ Verificación de mayoría de edad obligatoria</p>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <a
              href="#"
              className="text-white underline hover:text-[#D4AF37] transition-colors"
            >
              Política de Privacidad completa
            </a>
            <a
              href="#"
              className="text-white underline hover:text-[#D4AF37] transition-colors"
            >
              Términos y Condiciones
            </a>
            <a
              href="#"
              className="text-white underline hover:text-[#D4AF37] transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

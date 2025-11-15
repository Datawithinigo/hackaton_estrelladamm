import { MessageCircle, Send, Star, Shield } from 'lucide-react';

export default function Messaging() {
  const levels = [
    {
      name: 'Bronce',
      stars: '0-10 estrellas',
      messages: '1 mensaje al día',
      features: ['Di hola con clase'],
      color: 'from-[#CD7F32] to-[#8B4513]'
    },
    {
      name: 'Plata',
      stars: '11-30 estrellas',
      messages: '5 mensajes al día',
      features: ['Ver quién visitó tu perfil', 'Respuestas prioritarias'],
      color: 'from-[#C0C0C0] to-[#E8E8E8]',
      popular: true
    },
    {
      name: 'Oro',
      stars: '31+ estrellas',
      messages: 'Mensajes ilimitados',
      features: ['Perfil destacado', 'Funciones premium', 'Badge exclusivo'],
      color: 'from-[#D4AF37] to-[#FFD700]'
    }
  ];

  const mockChats = [
    { name: 'Marina', lastMessage: 'Jajaja me encanta', time: 'Ahora', unread: 2 },
    { name: 'Carlos', lastMessage: '¿Quedamos esta noche?', time: '15 min', unread: 0 },
    { name: 'Lucía', lastMessage: 'Tú: Genial entonces!', time: '1h', unread: 0 }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#F5F5F5] to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-4">
            Desbloquea el poder del chat
          </h2>
          <p className="text-xl text-[#666666]">
            Cuantas más estrellas, más conexiones
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            {levels.map((level, index) => (
              <div
                key={index}
                className={`bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 ${
                  level.popular ? 'ring-4 ring-[#D4AF37]' : ''
                }`}
              >
                {level.popular && (
                  <div className="bg-[#D4AF37] text-white text-center py-2 font-bold text-sm">
                    MÁS POPULAR
                  </div>
                )}
                <div className={`bg-gradient-to-br ${level.color} p-8 text-white`}>
                  <Star className="w-12 h-12 fill-white mb-4" />
                  <h3 className="text-3xl font-bold mb-2">{level.name}</h3>
                  <p className="text-sm opacity-90">{level.stars}</p>
                </div>
                <div className="p-8">
                  <p className="text-2xl font-bold text-[#C8102E] mb-6">{level.messages}</p>
                  <ul className="space-y-3">
                    {level.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <MessageCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                        <span className="text-[#666666]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-[#999999] italic mt-6">
                    {index === 0 && "Di hola con clase"}
                    {index === 1 && "Ya vas soltándote"}
                    {index === 2 && "Nunca pares de decir hola (responsablemente)"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 bg-[#F5F5F5] border-r border-[#E5E5E5]">
                <div className="p-6 border-b border-[#E5E5E5] bg-white">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-[#C0C0C0] to-[#E8E8E8] rounded-full p-2">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                      <p className="font-bold text-[#333333]">Nivel: Plata</p>
                      <p className="text-sm text-[#666666]">3 mensajes hoy</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-[#E5E5E5]">
                  {mockChats.map((chat, idx) => (
                    <button
                      key={idx}
                      className={`w-full p-4 hover:bg-white transition-colors text-left ${
                        idx === 0 ? 'bg-white' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-bold text-[#333333]">{chat.name}</p>
                        <span className="text-xs text-[#999999]">{chat.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[#666666] truncate">{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <span className="bg-[#C8102E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3 flex flex-col">
                <div className="p-6 border-b border-[#E5E5E5] bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8102E] to-[#D4AF37]"></div>
                    <div>
                      <p className="font-bold text-[#333333]">Marina</p>
                      <p className="text-sm text-[#666666]">En línea</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 space-y-4 bg-[#FAFAFA]">
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 max-w-xs shadow-sm">
                      <p className="text-[#333333]">Hola! Vi que también eres cazador de estrellas 😄</p>
                      <p className="text-xs text-[#999999] mt-1">10:32</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-[#C8102E] to-[#D4AF37] text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs shadow-sm">
                      <p>Sí! Acabo de conseguir mi nivel Plata 🌟</p>
                      <p className="text-xs text-white/80 mt-1">10:35</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 max-w-xs shadow-sm">
                      <p className="text-[#333333]">Jajaja me encanta</p>
                      <p className="text-xs text-[#999999] mt-1">10:37</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-[#E5E5E5] bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 px-4 py-3 rounded-full border-2 border-[#F5F5F5] focus:border-[#C8102E] outline-none"
                    />
                    <button className="bg-[#C8102E] text-white p-3 rounded-full hover:bg-[#D4AF37] transition-colors">
                      <Send className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-[#C8102E] text-white rounded-2xl p-6 flex items-start gap-4">
            <Shield className="w-8 h-8 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg mb-2">Política de tolerancia cero</p>
              <p className="text-white/90">
                Cero acoso, cero hate, cero comportamientos creepy. Te echamos más rápido de lo que tardas en acabarte una cerveza.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { MapPin, Star, Eye, EyeOff, Navigation } from 'lucide-react';

export default function Map() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const nearbyUsers = [
    { id: 1, name: 'Lucía', age: 27, level: 'Oro', distance: '3 calles', status: 'Buscando buen rollo', lat: 41.3851, lng: 2.1734 },
    { id: 2, name: 'Carlos', age: 29, level: 'Plata', distance: 'tu barrio', status: 'Estrella nocturna', lat: 41.3871, lng: 2.1694 },
    { id: 3, name: 'Marina', age: 25, level: 'Oro', distance: '5 calles', status: 'Chat y risas', lat: 41.3891, lng: 2.1654 },
    { id: 4, name: 'Javier', age: 31, level: 'Plata', distance: '2 calles', status: 'Charlemos', lat: 41.3831, lng: 2.1774 },
    { id: 5, name: 'Paula', age: 26, level: 'Bronce', distance: '4 calles', status: 'Nueva aquí', lat: 41.3811, lng: 2.1714 }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Oro': return 'text-[#D4AF37]';
      case 'Plata': return 'text-[#C0C0C0]';
      default: return 'text-[#CD7F32]';
    }
  };

  return (
    <section id="mapa" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-4">
            ¿Quién brilla por tu zona?
          </h2>
          <p className="text-xl text-[#666666] mb-6">
            Otros cazadores de estrellas en tu área (solo si quieren ser vistos)
          </p>

          <div className="inline-flex items-center gap-4 bg-[#F5F5F5] rounded-full px-6 py-3">
            <span className="text-sm font-medium text-[#333333]">Aparecer en el mapa</span>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isVisible ? 'bg-[#C8102E]' : 'bg-[#CCCCCC]'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  isVisible ? 'translate-x-7' : ''
                }`}
              >
                {isVisible ? (
                  <Eye className="w-3 h-3 text-[#C8102E] absolute top-1 left-1" />
                ) : (
                  <EyeOff className="w-3 h-3 text-[#999999] absolute top-1 left-1" />
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-[#F5F5F5] rounded-3xl overflow-hidden shadow-xl h-[500px] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/5 to-[#D4AF37]/5">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <Navigation className="w-12 h-12 text-[#C8102E] fill-[#C8102E] animate-pulse" />
                      <div className="absolute inset-0 animate-ping">
                        <div className="w-12 h-12 border-4 border-[#C8102E] rounded-full opacity-75"></div>
                      </div>
                    </div>
                  </div>

                  {nearbyUsers.map((user, index) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user.id)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 ${
                        selectedUser === user.id ? 'scale-125 z-10' : ''
                      }`}
                      style={{
                        top: `${30 + index * 15}%`,
                        left: `${25 + index * 12}%`
                      }}
                    >
                      <MapPin className={`w-8 h-8 ${getLevelColor(user.level)} fill-current drop-shadow-lg`} />
                      {selectedUser === user.id && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-xl shadow-2xl p-4 w-48 animate-fade-in">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className={`w-5 h-5 ${getLevelColor(user.level)} fill-current`} />
                            <div className="text-left">
                              <p className="font-bold text-[#333333]">{user.name}, {user.age}</p>
                              <p className="text-xs text-[#666666]">Nivel {user.level}</p>
                            </div>
                          </div>
                          <p className="text-xs text-[#999999] mb-2">"{user.status}"</p>
                          <p className="text-xs text-[#D4AF37] font-medium">📍 {user.distance}</p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 text-xs text-[#666666]">
                  <p className="font-medium">🔒 Ubicación aproximada, solo visible para usuarios verificados</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-[#333333] mb-4">Cerca de ti</h3>
              {nearbyUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={`w-full bg-[#F5F5F5] hover:bg-[#FFF5F5] rounded-xl p-4 transition-all text-left ${
                    selectedUser === user.id ? 'ring-2 ring-[#C8102E]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-[#333333]">{user.name}, {user.age}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className={`w-4 h-4 ${getLevelColor(user.level)} fill-current`} />
                        <span className="text-sm text-[#666666]">Nivel {user.level}</span>
                      </div>
                    </div>
                    <MapPin className={`w-5 h-5 ${getLevelColor(user.level)}`} />
                  </div>
                  <p className="text-sm text-[#999999] mb-2">"{user.status}"</p>
                  <p className="text-xs text-[#D4AF37] font-medium">a {user.distance}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

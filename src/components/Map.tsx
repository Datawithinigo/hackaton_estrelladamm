import { useState } from 'react';
import { MapPin, Star, Eye, EyeOff, Navigation, MessageCircle, Beer, Filter } from 'lucide-react';
import { User } from '../lib/supabase';
import { useFilters } from '../contexts/FilterContext';
import FilterStatus from './FilterStatus';

interface MapProps {
  users: (User & { id: string })[];
  currentUser?: (User & { id: string }) | null;
  onMessageUser?: (user: User & { id: string }) => void;
  onSendBeer?: (userId: string) => void;
}

/**
 * Map component with global filter integration
 * 
 * This component uses the global filter context to:
 * - Apply age and gender filters to the displayed users
 * - Sync filter changes with all other sections of the app
 * - Persist filter settings across navigation
 * 
 * When filters are changed here, they affect:
 * - UsersList in the "Estrellas" section
 * - Any other components that use the applyFilters function
 */

export default function Map({ users, currentUser, onMessageUser, onSendBeer }: MapProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Use global filters
  const { filters, setAgeRange, setGenderFilter, clearFilters } = useFilters();
  const { ageRange, genderFilter } = filters;

  const filteredUsers = users.filter(u => {
    if (!u.visible_on_map || u.id === currentUser?.id) return false;
    if (u.age !== undefined && (u.age < ageRange[0] || u.age > ageRange[1])) return false;
    if (genderFilter !== 'todos' && u.gender !== genderFilter) return false;
    return true;
  });

  const nearbyUsers = filteredUsers.map((user, index) => ({
    ...user,
    distance: index === 0 ? '3 calles' : index === 1 ? 'tu barrio' : `${index + 2} calles`,
    lat: 41.3851 + index * 0.002,
    lng: 2.1734 + index * 0.002
  }));

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'Oro': return 'text-[#D4AF37]';
      case 'Plata': return 'text-[#C0C0C0]';
      default: return 'text-[#CD7F32]';
    }
  };

  return (
    <section id="mapa" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-4">
            ¿Quién brilla por tu zona?
          </h2>
          <p className="text-xl text-[#666666] mb-6">
            Otras estrellas en tu área (solo si quieren ser vistas)
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
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

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 bg-[#F5F5F5] hover:bg-[#E5E5E5] rounded-full px-6 py-3 transition-colors"
            >
              <Filter className="w-4 h-4 text-[#C8102E]" />
              <span className="text-sm font-medium text-[#333333]">Filtros</span>
            </button>
          </div>

          {showFilters && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-3">Edad</label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-[#666666]">De</span>
                      <input
                        type="number"
                        value={ageRange[0]}
                        onChange={(e) => setAgeRange([Number(e.target.value), ageRange[1]])}
                        min="18"
                        max="99"
                        className="w-20 px-3 py-2 border-2 border-[#F5F5F5] rounded-lg focus:border-[#C8102E] outline-none text-center"
                      />
                      <span className="text-[#666666]">a</span>
                      <input
                        type="number"
                        value={ageRange[1]}
                        onChange={(e) => setAgeRange([ageRange[0], Number(e.target.value)])}
                        min="18"
                        max="99"
                        className="w-20 px-3 py-2 border-2 border-[#F5F5F5] rounded-lg focus:border-[#C8102E] outline-none text-center"
                      />
                      <span className="text-[#666666]">años</span>
                    </div>
                    
                    {/* Dual Range Slider */}
                    <div className="relative">
                      <div className="relative h-2 bg-gray-200 rounded-lg">
                        <div 
                          className="absolute h-2 bg-gradient-to-r from-[#C8102E] to-[#C8102E] rounded-lg pointer-events-none"
                          style={{
                            left: `${((ageRange[0] - 18) / (99 - 18)) * 100}%`,
                            width: `${((ageRange[1] - ageRange[0]) / (99 - 18)) * 100}%`
                          }}
                        ></div>
                      </div>
                      
                      {/* Min range input */}
                      <input
                        type="range"
                        min="18"
                        max="99"
                        value={ageRange[0]}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value <= ageRange[1]) {
                            setAgeRange([value, ageRange[1]]);
                          }
                        }}
                        className="absolute top-0 left-0 w-full h-2 bg-transparent appearance-none cursor-pointer range-slider-thumb pointer-events-auto"
                        style={{ zIndex: ageRange[0] === ageRange[1] ? 2 : 1 }}
                      />
                      
                      {/* Max range input */}
                      <input
                        type="range"
                        min="18"
                        max="99"
                        value={ageRange[1]}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value >= ageRange[0]) {
                            setAgeRange([ageRange[0], value]);
                          }
                        }}
                        className="absolute top-0 left-0 w-full h-2 bg-transparent appearance-none cursor-pointer range-slider-thumb pointer-events-auto"
                        style={{ zIndex: 2 }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-3">Sexo</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGenderFilter('todos')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        genderFilter === 'todos'
                          ? 'bg-gradient-to-r from-[#C8102E] to-[#D4AF37] text-white'
                          : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setGenderFilter('hombre')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        genderFilter === 'hombre'
                          ? 'bg-gradient-to-r from-[#C8102E] to-[#D4AF37] text-white'
                          : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                      }`}
                    >
                      Hombres
                    </button>
                    <button
                      onClick={() => setGenderFilter('mujer')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        genderFilter === 'mujer'
                          ? 'bg-gradient-to-r from-[#C8102E] to-[#D4AF37] text-white'
                          : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                      }`}
                    >
                      Mujeres
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#F5F5F5] flex justify-between items-center">
                <p className="text-sm text-[#666666]">
                  Mostrando <span className="font-bold text-[#C8102E]">{nearbyUsers.length}</span> usuario{nearbyUsers.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => clearFilters()}
                  className="text-sm text-[#C8102E] hover:text-[#D4AF37] font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          <FilterStatus />
          
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
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-xl shadow-2xl p-4 w-56 animate-fade-in">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className={`w-5 h-5 ${getLevelColor(user.level)} fill-current`} />
                            <div className="text-left">
                              <p className="font-bold text-[#333333]">{user.name}, {user.age}</p>
                              <p className="text-xs text-[#666666]">Nivel {user.level}</p>
                            </div>
                          </div>
                          {user.bio && (
                            <p className="text-xs text-[#999999] mb-2">"{user.bio}"</p>
                          )}
                          <p className="text-xs text-[#D4AF37] font-medium mb-3">📍 {user.distance}</p>
                          {currentUser && (
                            <div className="space-y-2">
                              {onMessageUser && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMessageUser(user);
                                  }}
                                  className="w-full bg-gradient-to-r from-[#C8102E] to-[#D4AF37] text-white text-sm font-bold py-2 px-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Enviar mensaje
                                </button>
                              )}
                              {onSendBeer && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSendBeer(user.id);
                                  }}
                                  className="w-full bg-[#FFA500] text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-[#FF8C00] transition-all flex items-center justify-center gap-2"
                                >
                                  <Beer className="w-4 h-4" />
                                  Invitar cerveza
                                </button>
                              )}
                            </div>
                          )}
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
              {nearbyUsers.length === 0 ? (
                <div className="bg-[#F5F5F5] rounded-xl p-6 text-center">
                  <MapPin className="w-12 h-12 text-[#CCCCCC] mx-auto mb-3" />
                  <p className="text-[#666666]">No hay usuarios visibles cerca</p>
                </div>
              ) : (
                nearbyUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`bg-[#F5F5F5] hover:bg-[#FFF5F5] rounded-xl p-4 transition-all ${
                      selectedUser === user.id ? 'ring-2 ring-[#C8102E]' : ''
                    }`}
                  >
                    <button
                      onClick={() => setSelectedUser(user.id)}
                      className="w-full text-left"
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
                      {user.bio && (
                        <p className="text-sm text-[#999999] mb-2">"{user.bio}"</p>
                      )}
                      <p className="text-xs text-[#D4AF37] font-medium">a {user.distance}</p>
                    </button>
                    {currentUser && (
                      <div className="mt-3 space-y-2">
                        {onMessageUser && (
                          <button
                            onClick={() => onMessageUser(user)}
                            className="w-full bg-gradient-to-r from-[#C8102E] to-[#D4AF37] text-white text-sm font-bold py-2 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Enviar mensaje
                          </button>
                        )}
                        {onSendBeer && (
                          <button
                            onClick={() => onSendBeer(user.id)}
                            className="w-full bg-[#FFA500] text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-[#FF8C00] transition-all flex items-center justify-center gap-2"
                          >
                            <Beer className="w-4 h-4" />
                            Invitar cerveza
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Star, QrCode, TrendingUp } from 'lucide-react';

interface DashboardProps {
  userData: {
    name?: string;
    stars?: number;
    level?: string;
  };
  nearbyUsersCount?: number;
  onAddStar: () => void;
}

export default function Dashboard({ userData, nearbyUsersCount = 0, onAddStar }: DashboardProps) {
  const name = userData.name || 'Usuario';
  const stars = userData.stars || 0;
  const level = userData.level || 'Bronce';
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Oro':
        return 'from-[#D4AF37] to-[#FFD700]';
      case 'Plata':
        return 'from-[#C0C0C0] to-[#E8E8E8]';
      default:
        return 'from-[#CD7F32] to-[#8B4513]';
    }
  };

  const getNextLevel = () => {
    if (stars < 11) return { name: 'Plata', starsNeeded: 11 - stars };
    if (stars < 31) return { name: 'Oro', starsNeeded: 31 - stars };
    return { name: 'Máximo', starsNeeded: 0 };
  };

  const getProgress = () => {
    if (stars < 11) return (stars / 11) * 100;
    if (stars < 31) return ((stars - 10) / 21) * 100;
    return 100;
  };

  const nextLevel = getNextLevel();

  return (
    <section id="mis-estrellas" className="py-20 bg-[#F5F5F5]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className={`bg-gradient-to-r ${getLevelColor(level)} p-8 text-white`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-lg opacity-90">Hola, estrella</p>
                  <h2 className="text-4xl font-bold">{name}</h2>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-white" />
                    <span className="text-2xl font-bold">{level}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Star className="w-12 h-12 fill-white animate-pulse" />
                  <div className="text-center">
                    <p className="text-6xl font-bold">{stars}</p>
                    <p className="text-lg opacity-90">Estrellas</p>
                  </div>
                  <Star className="w-12 h-12 fill-white animate-pulse" />
                </div>

                {nextLevel.starsNeeded > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso hacia {nextLevel.name}</span>
                      <span>{nextLevel.starsNeeded} más para subir</span>
                    </div>
                    <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${getProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8">
              <p className="text-center text-[#666666] mb-6 text-lg italic">
                Más botellas, más estrellas, más chances de conocer gente interesante
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={onAddStar}
                  className="flex items-center justify-center gap-3 bg-[#C8102E] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#A00D24] transition-all hover:scale-105 shadow-lg"
                >
                  <QrCode className="w-6 h-6" />
                  Escanear otra botella
                </button>

                <button className="flex items-center justify-center gap-3 border-2 border-[#D4AF37] text-[#D4AF37] px-6 py-4 rounded-xl font-bold hover:bg-[#D4AF37] hover:text-white transition-all">
                  <TrendingUp className="w-6 h-6" />
                  Ver mi progreso
                </button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <p className="text-3xl font-bold text-[#C8102E]">
                    {level === 'Oro' ? '∞' : level === 'Plata' ? '5' : '1'}
                  </p>
                  <p className="text-sm text-[#666666]">Mensajes/día</p>
                </div>
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <p className="text-3xl font-bold text-[#C8102E]">{nearbyUsersCount}</p>
                  <p className="text-sm text-[#666666]">Cerca de ti</p>
                </div>
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <p className="text-3xl font-bold text-[#C8102E]">3</p>
                  <p className="text-sm text-[#666666]">Conexiones</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

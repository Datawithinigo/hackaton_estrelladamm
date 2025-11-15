import { useState } from 'react';
import { Star, QrCode, TrendingUp, Camera, Edit2, Save, X, Gift, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfileAndStarsProps {
  userData: {
    id: string;
    name?: string;
    stars?: number;
    level?: string;
    profile_photo_url?: string;
    bio?: string;
    age?: number;
    gender?: string;
  };
  onAddStar: () => void;
  onPhotoUpload: (file: File) => void;
  onBioUpdate?: (bio: string) => void;
}

export default function ProfileAndStars({ userData, onAddStar, onPhotoUpload, onBioUpdate }: ProfileAndStarsProps) {
  // States del Profile
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(userData.bio || '');
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPromoSuccess, setShowPromoSuccess] = useState(false);

  // Datos
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

  // Handlers del Profile
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        await onPhotoUpload(file);
      } catch (error) {
        console.error('Error uploading photo:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBioSave = () => {
    if (onBioUpdate) {
      onBioUpdate(bio);
      setIsEditing(false);
    }
  };

  const handlePromoCodeSubmit = async () => {
    if (!promoCode.trim()) return;
    
    setPromoLoading(true);
    setPromoMessage('');
    
    try {
      if (promoCode.trim() !== '123456') {
        setPromoMessage('Código promocional no válido');
        setPromoLoading(false);
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data: currentLimit } = await supabase
        .from('daily_message_limits')
        .select('messages_sent')
        .eq('user_id', userData.id)
        .eq('date', today)
        .single();
        
      const currentSent = currentLimit?.messages_sent || 0;
      const newSent = Math.max(0, currentSent - 10);
      
      const { error } = await supabase
        .from('daily_message_limits')
        .upsert({
          user_id: userData.id,
          date: today,
          messages_sent: newSent
        }, {
          onConflict: 'user_id,date'
        });
      
      if (error) {
        console.error('Error applying promo code:', error);
        setPromoMessage('Error al canjear el código');
        return;
      }
      
      setPromoMessage('¡Código canjeado! Has recibido 10 mensajes adicionales');
      setShowPromoSuccess(true);
      setPromoCode('');
      
      setTimeout(() => {
        setShowPromoSuccess(false);
        setPromoMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Unexpected error:', error);
      setPromoMessage('Error inesperado al canjear el código');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePromoCodeSubmit();
    }
  };

  return (
    <section className="py-20 bg-[#F5F5F5]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* SECCIÓN MIS ESTRELLAS CON PERFIL INTEGRADO */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className={`bg-gradient-to-r ${getLevelColor(level)} p-8 text-white`}>
              {/* Header con foto de perfil */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-6">
                  {/* Foto de perfil */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-white/20 overflow-hidden border-3 border-white/30 shadow-xl">
                      {userData.profile_photo_url ? (
                        <img
                          src={userData.profile_photo_url}
                          alt={userData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/20">
                          <span className="text-2xl text-white font-bold">
                            {(userData.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <label className={`absolute bottom-0 right-0 text-white p-1.5 rounded-full cursor-pointer transition-colors shadow-lg ${
                      isLoading 
                        ? 'bg-white/20 cursor-not-allowed' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}>
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        disabled={isLoading}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* Información del usuario */}
                  <div>
                    <p className="text-lg opacity-90">Hola, estrella</p>
                    <h2 className="text-4xl font-bold">{name}</h2>
                    <p className="text-white/80 mt-1">
                      {userData.age && `${userData.age} años`}
                      {userData.age && userData.gender && ` • ${userData.gender}`}
                    </p>
                  </div>
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

              {/* Sección de biografía */}
              <div className="mb-6 p-4 bg-[#F8F9FA] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#333333]">Sobre mí</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 text-[#C8102E] hover:text-[#D4AF37] transition-colors font-medium text-sm"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Cuéntame sobre ti..."
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#F5F5F5] focus:border-[#C8102E] outline-none resize-none h-20 text-sm"
                    />
                    <button
                      onClick={handleBioSave}
                      className="flex items-center justify-center gap-2 bg-[#C8102E] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#A00D24] transition-colors text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Guardar bio
                    </button>
                  </div>
                ) : (
                  <p className="text-[#333333] leading-relaxed text-sm">
                    {bio || 'Aún no hay bio. ¡Cuéntale a otras estrellas quién eres!'}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
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

              {/* Código promocional */}
              <div className="mb-6 p-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-white" />
                  <h3 className="text-white font-bold text-lg">Código Promocional</h3>
                </div>
                <p className="text-white/90 text-sm mb-4">
                  ¡Introduce un código promocional para conseguir mensajes adicionales!
                </p>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
                      placeholder="Introduce tu código"
                      className="flex-1 px-4 py-3 rounded-lg border-0 outline-none text-[#333333] font-medium"
                      disabled={promoLoading}
                    />
                    <button
                      onClick={handlePromoCodeSubmit}
                      disabled={!promoCode.trim() || promoLoading}
                      className="bg-white text-[#D4AF37] px-6 py-3 rounded-lg font-bold hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {promoLoading ? (
                        <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Canjear
                    </button>
                  </div>
                  
                  {promoMessage && (
                    <div className={`p-3 rounded-lg ${
                      showPromoSuccess 
                        ? 'bg-green-500/20 text-white border border-green-300/30' 
                        : 'bg-red-500/20 text-white border border-red-300/30'
                    }`}>
                      <p className="text-sm font-medium">{promoMessage}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <p className="text-3xl font-bold text-[#C8102E]">
                    {level === 'Oro' ? '∞' : level === 'Plata' ? '5' : '1'}
                  </p>
                  <p className="text-sm text-[#666666]">Mensajes/día</p>
                </div>
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <p className="text-3xl font-bold text-[#C8102E]">12</p>
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
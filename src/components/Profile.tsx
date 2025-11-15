import { useState } from 'react';
import { Camera, Star, Edit2, Save, X, Gift, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isValidPhotoUrl, getInitialFromName } from '../lib/imageUtils';

interface ProfileProps {
  userData: {
    id: string;
    name?: string;
    stars?: number;
    level: string;
    profile_photo_url?: string;
    bio?: string;
    age?: number;
    gender?: string;
  };
  onPhotoUpload: (file: File) => void;
  onBioUpdate?: (bio: string) => void;
  isEditable?: boolean;
}

export default function Profile({ userData, onPhotoUpload, onBioUpdate, isEditable = false }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(userData.bio || '');
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPromoSuccess, setShowPromoSuccess] = useState(false);

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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        await onPhotoUpload(file);
      } catch (error) {
        console.error('Error uploading photo:', error);
        // The error is already handled in the parent component with alert()
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
      // Check if code is valid
      if (promoCode.trim() !== '123456') {
        setPromoMessage('Código promocional no válido');
        setPromoLoading(false);
        return;
      }
      
      // Check if already used (simplified check)
      const today = new Date().toISOString().split('T')[0];
      
      // Get current daily message count
      const { data: currentLimit } = await supabase
        .from('daily_message_limits')
        .select('messages_sent')
        .eq('user_id', userData.id)
        .eq('date', today)
        .single();
        
      const currentSent = currentLimit?.messages_sent || 0;
      const newSent = Math.max(0, currentSent - 10); // Add 10 bonus messages
      
      // Update daily limit to give bonus messages
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
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className={`bg-gradient-to-r ${getLevelColor(userData.level)} h-32`}></div>

      <div className="px-6 pb-6 relative">
        <div className="flex flex-col md:flex-row gap-6 -mt-16">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-[#F5F5F5] overflow-hidden border-4 border-white shadow-xl">
              {isValidPhotoUrl(userData.profile_photo_url) ? (
                <img
                  src={userData.profile_photo_url}
                  alt={userData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide the image and show the placeholder if there's an error
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C8102E] to-[#D4AF37]">
                  <span className="text-4xl text-white font-bold">
                    {getInitialFromName(userData.name)}
                  </span>
                </div>
              )}
            </div>
            {isEditable && (
              <label className={`absolute bottom-0 right-0 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#C8102E] hover:bg-[#A00D24]'
              }`}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-5 h-5" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex-1 pt-8">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-3xl font-bold text-[#333333]">{userData.name || 'Usuario'}</h2>
                <p className="text-[#666666]">
                  {userData.age && `${userData.age} años`}
                  {userData.age && userData.gender && ` • ${userData.gender}`}
                </p>
              </div>
              <div className={`bg-gradient-to-br ${getLevelColor(userData.level)} px-4 py-2 rounded-xl text-white font-bold text-center`}>
                <Star className="w-5 h-5 fill-white mx-auto mb-1" />
                {userData.level}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="bg-[#F5F5F5] rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-[#C8102E]">{userData.stars || 0}</p>
                <p className="text-xs text-[#666666]">Estrellas</p>
              </div>
            </div>

            {isEditable && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 text-[#C8102E] hover:text-[#D4AF37] transition-colors font-medium"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing ? 'Cancelar' : 'Editar bio'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          {isEditing && isEditable ? (
            <div className="space-y-3">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuéntame sobre ti..."
                className="w-full px-4 py-3 rounded-lg border-2 border-[#F5F5F5] focus:border-[#C8102E] outline-none resize-none h-24"
              />
              <button
                onClick={handleBioSave}
                className="flex items-center justify-center gap-2 w-full bg-[#C8102E] text-white px-4 py-3 rounded-lg font-bold hover:bg-[#A00D24] transition-colors"
              >
                <Save className="w-4 h-4" />
                Guardar bio
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[#666666] font-medium mb-2">Sobre mí</p>
              <p className="text-[#333333] leading-relaxed">
                {bio || 'Aún no hay bio. ¡Cuéntale a otras estrellas quién eres!'}
              </p>
            </div>
          )}
        </div>

        {isEditable && (
          <div className="mt-6 p-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-xl">
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
        )}
      </div>
    </div>
  );
}

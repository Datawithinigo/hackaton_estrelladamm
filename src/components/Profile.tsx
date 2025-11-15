import { useState } from 'react';
import { Camera, Star, Edit2, Save, X } from 'lucide-react';

interface ProfileProps {
  userData: {
    name: string;
    stars: number;
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

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className={`bg-gradient-to-r ${getLevelColor(userData.level)} h-32`}></div>

      <div className="px-6 pb-6 relative">
        <div className="flex flex-col md:flex-row gap-6 -mt-16">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-[#F5F5F5] overflow-hidden border-4 border-white shadow-xl">
              {userData.profile_photo_url ? (
                <img
                  src={userData.profile_photo_url}
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C8102E] to-[#D4AF37]">
                  <span className="text-4xl text-white font-bold">
                    {userData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {isEditable && (
              <label className="absolute bottom-0 right-0 bg-[#C8102E] text-white p-2 rounded-full cursor-pointer hover:bg-[#A00D24] transition-colors shadow-lg">
                <Camera className="w-5 h-5" />
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
                <h2 className="text-3xl font-bold text-[#333333]">{userData.name}</h2>
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
                <p className="text-2xl font-bold text-[#C8102E]">{userData.stars}</p>
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
                {bio || 'Aún no hay bio. ¡Cuéntale a otros cazadores de estrellas quién eres!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

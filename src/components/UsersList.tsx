import { User } from '../lib/supabase';
import { Star, MessageCircle, Beer } from 'lucide-react';
import { useFilters } from '../contexts/FilterContext';
import { isValidPhotoUrl, getInitialFromName } from '../lib/imageUtils';

interface UsersListProps {
  users: (User & { id: string })[];
  currentUserId: string;
  onSelectUser: (user: User & { id: string }) => void;
  onSendBeer?: (userId: string) => void;
  isLoading?: boolean;
}

export default function UsersList({ users, currentUserId, onSelectUser, onSendBeer, isLoading }: UsersListProps) {
  const { applyFilters } = useFilters();
  
  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'Oro':
        return 'text-[#D4AF37]';
      case 'Plata':
        return 'text-[#C0C0C0]';
      default:
        return 'text-[#CD7F32]';
    }
  };

  // Apply global filters to the user list
  const filteredUsers = applyFilters(users, currentUserId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-[#F5F5F5] border-t-[#C8102E] rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#999999] text-lg">No hay usuarios disponibles</p>
        </div>
      ) : (
        filteredUsers.map((user) => (
          <div
            key={user.id}
            className="w-full bg-[#F5F5F5] hover:bg-[#FFF5F5] rounded-xl p-4 transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex gap-4 items-start">
              {isValidPhotoUrl(user.profile_photo_url) ? (
                <img
                  src={user.profile_photo_url}
                  alt={user.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#C8102E] to-[#D4AF37] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {getInitialFromName(user.name)}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-[#333333] truncate">{user.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className={`w-4 h-4 ${getLevelColor(user.level)} fill-current`} />
                    <span className="text-xs font-bold text-[#666666]">{user.level}</span>
                  </div>
                </div>
                <p className="text-sm text-[#666666] truncate">{user.age} años • {user.gender}</p>
                {user.bio && (
                  <p className="text-xs text-[#999999] truncate mt-1">"{user.bio}"</p>
                )}
                
                {/* Botones de acción */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectUser(user);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#C8102E] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#A00D24] transition-colors text-sm flex-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Conversación
                  </button>
                  
                  {onSendBeer && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendBeer(user.id);
                      }}
                      className="flex items-center justify-center gap-2 bg-[#FFA500] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#FF8C00] transition-colors text-sm flex-1"
                    >
                      <Beer className="w-4 h-4" />
                      Invitar cerveza
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

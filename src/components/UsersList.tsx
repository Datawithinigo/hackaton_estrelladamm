import { User } from '../lib/supabase';
import { Star, MessageCircle } from 'lucide-react';
import { useFilters } from '../contexts/FilterContext';

interface UsersListProps {
  users: (User & { id: string })[];
  currentUserId: string;
  onSelectUser: (user: User & { id: string }) => void;
  isLoading?: boolean;
}

export default function UsersList({ users, currentUserId, onSelectUser, isLoading }: UsersListProps) {
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
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="w-full bg-[#F5F5F5] hover:bg-[#FFF5F5] rounded-xl p-4 transition-all text-left flex gap-4 items-start hover:shadow-lg hover:-translate-y-1"
          >
            {user.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt={user.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#C8102E] to-[#D4AF37] flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || '?'}
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
            </div>

            <MessageCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
          </button>
        ))
      )}
    </div>
  );
}

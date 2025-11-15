import { MessageCircle, Star } from 'lucide-react';
import { User } from '../lib/supabase';
import { useConversations } from '../hooks/useConversations';

interface ConversationsWithLimitsProps {
  currentUser: User & { id: string };
  onSelectUser: (user: User & { id: string }) => void;
}

export default function ConversationsWithLimits({ currentUser, onSelectUser }: ConversationsWithLimitsProps) {
  const { conversations, loading } = useConversations(currentUser.id);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#C8102E] to-[#8B0A1F] p-6">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-white" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Mensajes</h1>
                  <p className="text-white/90">Conecta con otros cazadores de estrellas</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
                <p className="mt-4 text-[#666666]">Cargando conversaciones...</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F5F5F5]">
                {conversations.length === 0 ? (
                  <div className="p-12 text-center">
                    <MessageCircle className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#333333] mb-2">
                      No hay conversaciones aún
                    </h3>
                    <p className="text-[#666666]">
                      Empieza a chatear con otros usuarios desde la sección "Mis Estrellas"
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => onSelectUser(conv.otherUser)}
                      className="w-full p-6 hover:bg-[#F5F5F5] transition-colors text-left flex items-start gap-4"
                    >
                      <div className="relative flex-shrink-0">
                        {conv.otherUser.profile_photo_url ? (
                          <img
                            src={conv.otherUser.profile_photo_url}
                            alt={conv.otherUser.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8102E] to-[#D4AF37] flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                              {conv.otherUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-[#C8102E] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-[#333333] text-lg">
                            {conv.otherUser.name}
                          </h3>
                          {conv.lastMessage && (
                            <span className="text-sm text-[#999999] ml-2">
                              {formatTime(conv.lastMessage.created_at)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                            <span className="text-[#666666]">{conv.otherUser.stars} estrellas</span>
                          </div>
                          <span className="text-[#D4AF37] font-bold text-sm">
                            {conv.otherUser.level}
                          </span>
                        </div>

                        {conv.lastMessage ? (
                          <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-[#333333]' : 'text-[#666666]'}`}>
                            {conv.lastMessage.sender_id === currentUser.id ? 'Tú: ' : ''}
                            {conv.lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-sm text-[#999999] italic">
                            Empieza una conversación
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

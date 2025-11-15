import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Star, AlertCircle } from 'lucide-react';
import { User } from '../lib/supabase';
import { useMessages } from '../hooks/useMessages';
import { useMessageLimits } from '../hooks/useMessageLimits';
import { sendMessageWithLimits, getOrCreateConversation } from '../services/messageService';

interface ChatWithLimitsProps {
  currentUser: User & { id: string };
  otherUser: User & { id: string };
  onBack: () => void;
}

export default function ChatWithLimits({ currentUser, otherUser, onBack }: ChatWithLimitsProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading } = useMessages(conversationId, currentUser.id);
  const { messagesRemaining, canSend, dailyLimit } = useMessageLimits(currentUser.id, currentUser.level);

  useEffect(() => {
    const initConversation = async () => {
      const convId = await getOrCreateConversation(currentUser.id, otherUser.id);
      setConversationId(convId);
    };

    initConversation();
  }, [currentUser.id, otherUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !canSend) return;

    const messageContent = messageInput;
    setMessageInput('');
    setIsSending(true);
    setError(null);

    try {
      const result = await sendMessageWithLimits({
        senderId: currentUser.id,
        recipientId: otherUser.id,
        content: messageContent,
        userLevel: currentUser.level
      });

      if (!result.success) {
        setError(result.error || 'Error al enviar el mensaje');
        setMessageInput(messageContent);
      }
    } catch (err) {
      setError('Error al enviar el mensaje. Por favor, intenta de nuevo.');
      setMessageInput(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getLimitMessage = () => {
    if (dailyLimit === Infinity) {
      return (
        <div className="flex items-center gap-2 text-[#D4AF37] text-sm">
          <Star className="w-4 h-4 fill-[#D4AF37]" />
          <span className="font-bold">Mensajes ilimitados</span>
        </div>
      );
    }

    return (
      <div className="text-sm text-[#666666]">
        Te quedan <span className="font-bold text-[#C8102E]">{messagesRemaining}</span> mensaje{messagesRemaining !== 1 ? 's' : ''} hoy
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-end md:justify-center p-4">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:w-full md:max-w-2xl h-screen md:h-[600px] flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-[#C8102E] to-[#D4AF37] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onBack}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold truncate">{otherUser.name}</h3>
              <div className="flex items-center gap-2">
                <p className="text-white/80 text-sm">Nivel {otherUser.level}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-white fill-white" />
                  <span className="text-white/90 text-sm">{otherUser.stars}</span>
                </div>
              </div>
            </div>
            {otherUser.profile_photo_url ? (
              <img
                src={otherUser.profile_photo_url}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8102E]"></div>
                <p className="text-[#999999] mt-2">Cargando mensajes...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-[#999999] text-lg font-medium mb-2">Sin mensajes aún</p>
                <p className="text-[#CCCCCC] text-sm">¡Sé el primero en decir hola!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === currentUser.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      isOwn
                        ? 'bg-gradient-to-br from-[#C8102E] to-[#D4AF37] text-white rounded-tr-none'
                        : 'bg-white text-[#333333] rounded-tl-none'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-white/70' : 'text-[#999999]'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-[#E5E5E5] bg-white p-4">
          <div className="mb-3">
            {getLimitMessage()}
          </div>

          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={canSend ? "Escribe tu mensaje..." : "Límite alcanzado por hoy"}
              disabled={!canSend || isSending}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-[#F5F5F5] focus:border-[#C8102E] outline-none resize-none max-h-24 disabled:bg-[#F5F5F5] disabled:cursor-not-allowed"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={isSending || !messageInput.trim() || !canSend}
              className="bg-[#C8102E] text-white p-3 rounded-lg hover:bg-[#D4AF37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSending ? (
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {!canSend && (
            <div className="mt-3 text-center">
              <p className="text-sm text-[#999999]">
                {currentUser.level === 'Bronce' && (
                  <>Consigue más estrellas para enviar más mensajes</>
                )}
                {currentUser.level === 'Plata' && (
                  <>Alcanza el nivel Oro para mensajes ilimitados</>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

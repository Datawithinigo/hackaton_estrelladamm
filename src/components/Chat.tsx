import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Image } from 'lucide-react';
import { User, Message } from '../lib/supabase';
import { isValidPhotoUrl, getInitialFromName } from '../lib/imageUtils';

interface ChatProps {
  currentUser: User & { id: string };
  otherUser: User & { id: string };
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onBack: () => void;
}

export default function Chat({ currentUser, otherUser, messages, onSendMessage, onBack }: ChatProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [displayMessages, setDisplayMessages] = useState<Message[]>(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayMessages(messages);
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const messageContent = messageInput;
    setMessageInput('');
    setIsSending(true);

    try {
      await onSendMessage(messageContent);
      setDisplayMessages([
        ...displayMessages,
        {
          id: Date.now().toString(),
          sender_id: currentUser.id,
          recipient_id: otherUser.id,
          content: messageContent,
          read: false,
          created_at: new Date().toISOString()
        }
      ]);
      scrollToBottom();
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
              <p className="text-white/80 text-sm">Nivel {otherUser.level}</p>
            </div>
            {isValidPhotoUrl(otherUser.profile_photo_url) ? (
              <img
                src={otherUser.profile_photo_url}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                {getInitialFromName(otherUser.name)}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA]">
          {displayMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-[#999999] text-lg font-medium mb-2">Sin mensajes aún</p>
                <p className="text-[#CCCCCC] text-sm">¡Sé el primero en decir hola!</p>
              </div>
            </div>
          ) : (
            displayMessages.map((message) => {
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
          <div className="flex gap-2">
            <button className="text-[#C8102E] p-3 hover:bg-[#F5F5F5] rounded-lg transition-colors">
              <Image className="w-5 h-5" />
            </button>
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 rounded-lg border-2 border-[#F5F5F5] focus:border-[#C8102E] outline-none resize-none max-h-24"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={isSending || !messageInput.trim()}
              className="bg-[#C8102E] text-white p-3 rounded-lg hover:bg-[#D4AF37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

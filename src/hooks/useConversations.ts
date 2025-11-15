import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Message } from '../lib/supabase';

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  otherUser: User & { id: string };
  lastMessage?: Message;
  unreadCount: number;
}

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .order('updated_at', { ascending: false });

        if (convError) throw convError;

        if (!convData || convData.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        const conversationsWithDetails = await Promise.all(
          convData.map(async (conv) => {
            const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', otherUserId)
              .single();

            const { data: messagesData } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false });

            const lastMessage = messagesData && messagesData.length > 0 ? messagesData[0] : undefined;

            const unreadCount = messagesData
              ? messagesData.filter(
                  (m: Message) => m.recipient_id === userId && !m.read
                ).length
              : 0;

            return {
              ...conv,
              otherUser: userData as User & { id: string },
              lastMessage,
              unreadCount
            };
          })
        );

        setConversations(conversationsWithDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };

    fetchConversations();

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return { conversations, loading };
};

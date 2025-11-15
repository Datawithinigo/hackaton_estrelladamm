import { supabase } from '../lib/supabase';

const MESSAGE_LIMITS: Record<string, number> = {
  'Bronce': 1,
  'Plata': 5,
  'Oro': Infinity
};

interface SendMessageParams {
  senderId: string;
  recipientId: string;
  content: string;
  userLevel: string;
}

interface SendMessageResult {
  success: boolean;
  error?: string;
  conversationId?: string;
}

export const sendMessageWithLimits = async ({
  senderId,
  recipientId,
  content,
  userLevel
}: SendMessageParams): Promise<SendMessageResult> => {
  try {
    const dailyLimit = MESSAGE_LIMITS[userLevel] || 1;

    const { data: currentCount, error: countError } = await supabase.rpc('get_daily_message_count', {
      p_user_id: senderId
    });

    if (countError) throw countError;

    const messagesSent = currentCount || 0;

    if (dailyLimit !== Infinity && messagesSent >= dailyLimit) {
      return {
        success: false,
        error: `Has alcanzado tu límite de ${dailyLimit} mensaje${dailyLimit > 1 ? 's' : ''} diarios. ${
          userLevel === 'Bronce' ? '¡Consigue más estrellas para enviar más mensajes!' : ''
        }`
      };
    }

    const { data: conversationId, error: convError } = await supabase.rpc('get_or_create_conversation', {
      p_user1_id: senderId,
      p_user2_id: recipientId
    });

    if (convError) throw convError;

    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        recipient_id: recipientId,
        content
      });

    if (messageError) throw messageError;

    const { error: incrementError } = await supabase.rpc('increment_daily_messages', {
      p_user_id: senderId
    });

    if (incrementError) throw incrementError;

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return {
      success: true,
      conversationId
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: 'Error al enviar el mensaje. Por favor, intenta de nuevo.'
    };
  }
};

export const getOrCreateConversation = async (
  user1Id: string,
  user2Id: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      p_user1_id: user1Id,
      p_user2_id: user2Id
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

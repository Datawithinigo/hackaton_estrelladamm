import { supabase } from '../lib/supabase';
import { 
  getOrCreateConversationJS, 
  getDailyMessageCountJS, 
  incrementDailyMessagesJS 
} from '../lib/conversationUtils';

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
    console.log('📤 Sending message:', { senderId, recipientId, userLevel, contentLength: content.length });
    
    // Validate inputs
    if (!senderId || !recipientId || !content.trim()) {
      console.error('❌ Invalid message data');
      return {
        success: false,
        error: 'Datos de mensaje inválidos'
      };
    }

    const dailyLimit = MESSAGE_LIMITS[userLevel] || 1;
    console.log('📊 Daily limit for level', userLevel, ':', dailyLimit);

    // Check current message count with better error handling
    let messagesSent = 0;
    try {
      // Try SQL function first
      const { data: currentCount, error: countError } = await supabase.rpc('get_daily_message_count', {
        p_user_id: senderId
      });

      if (countError) {
        console.log('⚠️ SQL function not available, using JS alternative:', countError.message);
        // Use JS alternative
        messagesSent = await getDailyMessageCountJS(senderId);
      } else {
        messagesSent = currentCount || 0;
      }
    } catch (countErr) {
      console.warn('⚠️ Using JS fallback for message count:', countErr);
      messagesSent = await getDailyMessageCountJS(senderId);
    }

    console.log('📊 Current messages sent today:', messagesSent);

    if (dailyLimit !== Infinity && messagesSent >= dailyLimit) {
      return {
        success: false,
        error: `Has alcanzado tu límite de ${dailyLimit} mensaje${dailyLimit > 1 ? 's' : ''} diarios. ${
          userLevel === 'Bronce' ? '¡Consigue más estrellas para enviar más mensajes!' : ''
        }`
      };
    }

    // Get or create conversation with better error handling
    let conversationId: string;
    try {
      // Try SQL function first
      const { data: convId, error: convError } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: senderId,
        p_user2_id: recipientId
      });

      if (convError) {
        console.log('⚠️ SQL function not available, using JS alternative:', convError.message);
        // Use JS alternative
        conversationId = await getOrCreateConversationJS(senderId, recipientId);
      } else {
        if (!convId) {
          throw new Error('No se pudo crear la conversación');
        }
        conversationId = convId;
      }
      console.log('💬 Conversation ID:', conversationId);
    } catch (convErr) {
      console.log('⚠️ Using JS fallback for conversation creation:', convErr);
      try {
        conversationId = await getOrCreateConversationJS(senderId, recipientId);
        console.log('💬 Conversation ID (JS):', conversationId);
      } catch (jsFallbackErr) {
        console.error('❌ Both SQL and JS conversation creation failed:', jsFallbackErr);
        return {
          success: false,
          error: 'Error al crear la conversación. Por favor, intenta de nuevo.'
        };
      }
    }

    // Send the message
    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          recipient_id: recipientId,
          content: content.trim()
        })
        .select()
        .single();

      if (messageError) {
        console.error('❌ Message insertion error:', messageError);
        throw messageError;
      }

      console.log('✅ Message sent successfully:', messageData.id);
    } catch (msgErr) {
      console.error('❌ Message sending failed:', msgErr);
      const errorMessage = msgErr instanceof Error ? msgErr.message : 'Error desconocido';
      return {
        success: false,
        error: 'Error al enviar el mensaje: ' + errorMessage
      };
    }

    // Increment message count (don't fail the whole operation if this fails)
    try {
      // Try SQL function first
      const { error: incrementError } = await supabase.rpc('increment_daily_messages', {
        p_user_id: senderId
      });

      if (incrementError) {
        console.log('⚠️ SQL function not available, using JS alternative:', incrementError.message);
        // Use JS alternative
        await incrementDailyMessagesJS(senderId);
        console.log('📊 Message count incremented successfully (JS)');
      } else {
        console.log('📊 Message count incremented successfully');
      }
    } catch (incErr) {
      console.log('⚠️ Using JS fallback for incrementing message count:', incErr);
      try {
        await incrementDailyMessagesJS(senderId);
        console.log('📊 Message count incremented successfully (JS fallback)');
      } catch (jsFallbackErr) {
        console.warn('⚠️ Both SQL and JS message count increment failed (non-critical):', jsFallbackErr);
      }
    }

    // Update conversation timestamp (don't fail if this fails)
    try {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      console.log('✅ Conversation timestamp updated');
    } catch (updateErr) {
      console.warn('⚠️ Failed to update conversation timestamp (non-critical):', updateErr);
    }

    return {
      success: true,
      conversationId
    };
  } catch (error) {
    console.error('❌ Error in sendMessageWithLimits:', error);
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
    console.log('💬 Getting/creating conversation between:', user1Id, 'and', user2Id);
    
    if (!user1Id || !user2Id) {
      console.error('❌ Invalid user IDs provided');
      return null;
    }
    
    // Try SQL function first
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: user1Id,
        p_user2_id: user2Id
      });

      if (error) {
        console.log('⚠️ SQL function not available, using JS alternative:', error.message);
        // Use JS alternative
        return await getOrCreateConversationJS(user1Id, user2Id);
      }
      
      if (!data) {
        console.error('❌ No conversation ID returned from SQL function');
        return await getOrCreateConversationJS(user1Id, user2Id);
      }
      
      console.log('✅ Conversation ready (SQL):', data);
      return data;
    } catch (sqlErr) {
      console.log('⚠️ Using JS fallback for conversation:', sqlErr);
      return await getOrCreateConversationJS(user1Id, user2Id);
    }
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    return null;
  }
};

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
    console.log('📤 Sending message:', { senderId, recipientId, content, userLevel });
    
    // Validate inputs
    if (!senderId || !recipientId || !content.trim()) {
      return {
        success: false,
        error: 'Datos de mensaje inválidos'
      };
    }

    const dailyLimit = MESSAGE_LIMITS[userLevel] || 1;
    console.log('📊 Daily limit for level', userLevel, ':', dailyLimit);

    // Check current message count
    let messagesSent = 0;
    try {
      const { data: currentCount, error: countError } = await supabase.rpc('get_daily_message_count', {
        p_user_id: senderId
      });

      if (countError) {
        console.error('❌ Error getting message count:', countError);
        // Continue with count = 0 if function fails
      } else {
        messagesSent = currentCount || 0;
      }
    } catch (countErr) {
      console.error('❌ Message count check failed:', countErr);
      // Continue with count = 0
    }

    console.log('📊 Current messages sent today:', messagesSent);

    // Check if limit is reached
    if (dailyLimit !== Infinity && messagesSent >= dailyLimit) {
      return {
        success: false,
        error: `Has alcanzado tu límite de ${dailyLimit} mensaje${dailyLimit > 1 ? 's' : ''} diarios. ${
          userLevel === 'Bronce' ? '¡Consigue más estrellas para enviar más mensajes!' : ''
        }`
      };
    }

    // Get or create conversation
    let conversationId: string;
    try {
      const { data: convId, error: convError } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: senderId,
        p_user2_id: recipientId
      });

      if (convError) {
        console.error('❌ Conversation creation error:', convError);
        throw new Error('Error al crear la conversación');
      }

      conversationId = convId;
      console.log('💬 Conversation ID:', conversationId);
    } catch (convErr) {
      console.error('❌ Conversation error:', convErr);
      return {
        success: false,
        error: 'Error al crear la conversación'
      };
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
      return {
        success: false,
        error: 'Error al enviar el mensaje. Por favor, intenta de nuevo.'
      };
    }

    // Increment message count (don't fail the whole operation if this fails)
    try {
      const { error: incrementError } = await supabase.rpc('increment_daily_messages', {
        p_user_id: senderId
      });

      if (incrementError) {
        console.warn('⚠️ Failed to increment message count:', incrementError);
      } else {
        console.log('📊 Message count incremented');
      }
    } catch (incErr) {
      console.warn('⚠️ Message count increment error:', incErr);
    }

    // Update conversation timestamp (don't fail if this fails)
    try {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } catch (updateErr) {
      console.warn('⚠️ Failed to update conversation timestamp:', updateErr);
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
    
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      p_user1_id: user1Id,
      p_user2_id: user2Id
    });

    if (error) {
      console.error('❌ Conversation creation error:', error);
      throw error;
    }
    
    console.log('✅ Conversation ready:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    return null;
  }
};

// Enhanced function to get message count with fallback
export const getDailyMessageCount = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('get_daily_message_count', {
      p_user_id: userId
    });

    if (error) {
      console.error('❌ RPC get_daily_message_count error:', error);
      
      // Fallback: count messages directly from database
      const today = new Date().toISOString().split('T')[0];
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('daily_message_limits')
        .select('messages_sent')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (fallbackError && fallbackError.code !== 'PGRST116') {
        console.error('❌ Fallback count error:', fallbackError);
        return 0;
      }

      return fallbackData?.messages_sent || 0;
    }

    return data || 0;
  } catch (error) {
    console.error('❌ Error getting message count:', error);
    return 0;
  }
};

// Function to test messaging system
export const testMessagingSystem = async () => {
  try {
    console.log('🧪 Testing messaging system...');
    
    // Get test users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(2);

    if (usersError || !users || users.length < 2) {
      console.error('❌ Need at least 2 users to test messaging');
      return false;
    }

    const [user1, user2] = users;
    console.log('👥 Testing with users:', user1.name, 'and', user2.name);

    // Test conversation creation
    const convId = await getOrCreateConversation(user1.id, user2.id);
    if (!convId) {
      console.error('❌ Conversation creation failed');
      return false;
    }

    // Test message sending
    const result = await sendMessageWithLimits({
      senderId: user1.id,
      recipientId: user2.id,
      content: 'Test message from debugging',
      userLevel: user1.level
    });

    if (!result.success) {
      console.error('❌ Message sending failed:', result.error);
      return false;
    }

    console.log('✅ Messaging system test passed!');
    return true;
  } catch (error) {
    console.error('❌ Messaging test failed:', error);
    return false;
  }
};
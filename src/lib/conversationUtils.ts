import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que en la app
const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simulando las funciones que no existen
export const getOrCreateConversationJS = async (user1Id: string, user2Id: string): Promise<string> => {
  console.log('🔍 Getting/creating conversation between:', user1Id, 'and', user2Id);
  
  try {
    // Ordenar IDs para consistencia (menor primero)
    const [minId, maxId] = [user1Id, user2Id].sort();
    
    // Buscar conversación existente
    const { data: existingConv, error: searchError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${minId},user2_id.eq.${maxId}),and(user1_id.eq.${maxId},user2_id.eq.${minId})`)
      .maybeSingle();

    if (searchError && searchError.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      console.error('❌ Error searching for conversation:', searchError);
      throw searchError;
    }

    if (existingConv) {
      console.log('✅ Found existing conversation:', existingConv.id);
      return existingConv.id;
    }

    // Crear nueva conversación
    console.log('📝 Creating new conversation...');
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        user1_id: minId,
        user2_id: maxId
      })
      .select('id')
      .single();

    if (createError) {
      console.error('❌ Error creating conversation:', createError);
      throw createError;
    }

    console.log('✅ Created new conversation:', newConv.id);
    return newConv.id;
    
  } catch (error) {
    console.error('❌ Error in getOrCreateConversationJS:', error);
    throw error;
  }
};

export const getDailyMessageCountJS = async (userId: string): Promise<number> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const { data, error } = await supabase
      .from('daily_message_limits')
      .select('messages_sent')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      console.error('❌ Error getting daily count:', error);
      throw error;
    }

    return data?.messages_sent || 0;
  } catch (error) {
    console.error('❌ Error in getDailyMessageCountJS:', error);
    return 0; // Return 0 on error to not block messaging
  }
};

export const incrementDailyMessagesJS = async (userId: string): Promise<number> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Try to get existing record
    const { data: existing, error: getError } = await supabase
      .from('daily_message_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (getError && getError.code !== 'PGRST116') {
      console.error('❌ Error getting existing limit:', getError);
      throw getError;
    }

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('daily_message_limits')
        .update({ messages_sent: existing.messages_sent + 1 })
        .eq('id', existing.id)
        .select('messages_sent')
        .single();

      if (error) {
        console.error('❌ Error updating message count:', error);
        throw error;
      }

      return data.messages_sent;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('daily_message_limits')
        .insert({
          user_id: userId,
          date: today,
          messages_sent: 1
        })
        .select('messages_sent')
        .single();

      if (error) {
        console.error('❌ Error creating message count:', error);
        throw error;
      }

      return data.messages_sent;
    }
  } catch (error) {
    console.error('❌ Error in incrementDailyMessagesJS:', error);
    throw error;
  }
};

console.log('📦 Conversation utilities loaded');
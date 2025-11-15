import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMessageTypes() {
  console.log('🧪 Testing message_type column...');
  
  try {
    // Try to query messages with message_type
    const { data, error } = await supabase
      .from('messages')
      .select('id, content, message_type')
      .limit(1);
      
    if (error) {
      if (error.message.includes('message_type') && error.message.includes('does not exist')) {
        console.log('❌ message_type column not found, needs migration');
        console.log('\n📝 Please run this SQL in your Supabase dashboard:');
        console.log('\n--- Copy this SQL to Supabase SQL Editor ---');
        
        const migrationSQL = fs.readFileSync('./supabase/migrations/20251116000000_add_message_type.sql', 'utf8');
        console.log(migrationSQL);
        console.log('\n--- End of SQL ---\n');
        return false;
      } else {
        console.log('❌ Error testing message_type:', error.message);
        return false;
      }
    } else {
      console.log('✅ message_type column exists!');
      console.log('Sample data:', data);
      return true;
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

// Test sending a beer message
async function testBeerMessage() {
  console.log('\n🍺 Testing beer message functionality...');
  
  try {
    // Get test users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .limit(2);
      
    if (usersError) {
      console.log('❌ Could not fetch users for testing:', usersError.message);
      return;
    }
    
    if (users && users.length >= 2) {
      const sender = users[0];
      const recipient = users[1];
      
      console.log(`Testing beer message from ${sender.name} to ${recipient.name}`);
      
      // Find or create conversation
      let { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${sender.id},user2_id.eq.${recipient.id}),and(user1_id.eq.${recipient.id},user2_id.eq.${sender.id})`)
        .single();

      if (convError && convError.code === 'PGRST116') {
        // Create conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            user1_id: sender.id,
            user2_id: recipient.id
          })
          .select('id')
          .single();

        if (createError) {
          console.log('❌ Failed to create conversation:', createError.message);
          return;
        }
        conversation = newConversation;
      } else if (convError) {
        console.log('❌ Error finding conversation:', convError.message);
        return;
      }
      
      // Send test beer message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: sender.id,
          recipient_id: recipient.id,
          conversation_id: conversation.id,
          content: `🍺 ¡${sender.name} te ha invitado a una cerveza! 🍺`,
          message_type: 'beer_invite'
        })
        .select()
        .single();
        
      if (messageError) {
        console.log('❌ Beer message insertion failed:', messageError.message);
      } else {
        console.log('✅ Beer message sent successfully! ID:', messageData.id);
        
        // Clean up - delete test message
        await supabase.from('messages').delete().eq('id', messageData.id);
        console.log('🧹 Test data cleaned up');
      }
    } else {
      console.log('ℹ️  Need at least 2 users to test beer messages');
    }
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

async function main() {
  const hasMessageType = await testMessageTypes();
  
  if (hasMessageType) {
    await testBeerMessage();
  } else {
    console.log('\n⚠️  Please apply the migration first, then run this script again to test beer messages.');
  }
}

main();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugMessagingSystem() {
  console.log('🔍 Debugging messaging system...');
  
  try {
    // 1. Check database connection
    console.log('\n1. Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return;
    }
    console.log('✅ Database connection successful');

    // 2. Check if required tables exist
    console.log('\n2. Checking required tables...');
    
    const tables = ['users', 'messages', 'conversations', 'daily_message_limits'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.error(`❌ Table ${table} error:`, error.message);
        } else {
          console.log(`✅ Table ${table} exists and accessible`);
        }
      } catch (err) {
        console.error(`❌ Table ${table} not accessible:`, err.message);
      }
    }

    // 3. Check database functions
    console.log('\n3. Testing database functions...');
    
    // Test get_daily_message_count function
    try {
      const testUserId = '00000000-0000-0000-0000-000000000000'; // dummy ID
      const { data, error } = await supabase.rpc('get_daily_message_count', {
        p_user_id: testUserId
      });
      
      if (error) {
        console.error('❌ get_daily_message_count function error:', error);
      } else {
        console.log('✅ get_daily_message_count function works');
      }
    } catch (err) {
      console.error('❌ get_daily_message_count function failed:', err.message);
    }

    // Test get_or_create_conversation function
    try {
      const testUserId1 = '00000000-0000-0000-0000-000000000001';
      const testUserId2 = '00000000-0000-0000-0000-000000000002';
      
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: testUserId1,
        p_user2_id: testUserId2
      });
      
      if (error) {
        console.error('❌ get_or_create_conversation function error:', error);
      } else {
        console.log('✅ get_or_create_conversation function works');
      }
    } catch (err) {
      console.error('❌ get_or_create_conversation function failed:', err.message);
    }

    // 4. Check for test users
    console.log('\n4. Checking for test users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log(`✅ Found ${users.length} users in database`);
      if (users.length > 0) {
        console.log('Sample user:', {
          id: users[0].id,
          name: users[0].name,
          level: users[0].level,
          stars: users[0].stars
        });
      }
    }

    // 5. Test message sending flow
    console.log('\n5. Testing message sending flow...');
    if (users && users.length >= 2) {
      const sender = users[0];
      const recipient = users[1];
      
      console.log(`Testing message from ${sender.name} to ${recipient.name}`);
      
      // Test conversation creation
      try {
        const { data: convId, error: convError } = await supabase.rpc('get_or_create_conversation', {
          p_user1_id: sender.id,
          p_user2_id: recipient.id
        });
        
        if (convError) {
          console.error('❌ Conversation creation failed:', convError);
        } else {
          console.log('✅ Conversation created/found:', convId);
          
          // Test message insertion
          try {
            const { data: message, error: messageError } = await supabase
              .from('messages')
              .insert({
                conversation_id: convId,
                sender_id: sender.id,
                recipient_id: recipient.id,
                content: 'Test message from debug script'
              })
              .select()
              .single();
            
            if (messageError) {
              console.error('❌ Message insertion failed:', messageError);
            } else {
              console.log('✅ Message sent successfully:', message.id);
              
              // Clean up test message
              await supabase.from('messages').delete().eq('id', message.id);
              console.log('✅ Test message cleaned up');
            }
          } catch (msgErr) {
            console.error('❌ Message sending error:', msgErr);
          }
        }
      } catch (convErr) {
        console.error('❌ Conversation error:', convErr);
      }
    } else {
      console.log('⚠️ Not enough users for message testing');
    }

    // 6. Check RLS policies
    console.log('\n6. Testing Row Level Security...');
    try {
      // This will test if RLS is blocking legitimate operations
      const { data: rlsTest, error: rlsError } = await supabase
        .from('conversations')
        .select('*')
        .limit(1);
      
      if (rlsError) {
        if (rlsError.message.includes('row-level security')) {
          console.log('⚠️ RLS might be blocking operations:', rlsError.message);
        } else {
          console.error('❌ RLS test error:', rlsError);
        }
      } else {
        console.log('✅ RLS policies allow operations');
      }
    } catch (rlsErr) {
      console.error('❌ RLS test failed:', rlsErr);
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
}

// Export for use in browser console
window.debugMessaging = debugMessagingSystem;

debugMessagingSystem();
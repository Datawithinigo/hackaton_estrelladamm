import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que en la app
const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseStructure() {
  console.log('🔍 Testing database structure...\n');

  try {
    // Test 1: Check if conversations table exists
    console.log('1️⃣ Testing conversations table...');
    const { data: conversationsTest, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (convError) {
      console.log('❌ Conversations table error:', convError.message);
    } else {
      console.log('✅ Conversations table exists');
      console.log('Columns found:', Object.keys(conversationsTest?.[0] || {}));
    }

    // Test 2: Check if daily_message_limits table exists
    console.log('\n2️⃣ Testing daily_message_limits table...');
    const { data: limitsTest, error: limitsError } = await supabase
      .from('daily_message_limits')
      .select('*')
      .limit(1);
    
    if (limitsError) {
      console.log('❌ Daily message limits table error:', limitsError.message);
    } else {
      console.log('✅ Daily message limits table exists');
      console.log('Columns found:', Object.keys(limitsTest?.[0] || {}));
    }

    // Test 3: Check if messages table has conversation_id column
    console.log('\n3️⃣ Testing messages table structure...');
    const { data: messagesTest, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (msgError) {
      console.log('❌ Messages table error:', msgError.message);
    } else {
      console.log('✅ Messages table exists');
      console.log('Columns found:', Object.keys(messagesTest?.[0] || {}));
    }

    // Test 4: Test get_or_create_conversation function
    console.log('\n4️⃣ Testing get_or_create_conversation function...');
    const { data: funcTest1, error: funcError1 } = await supabase
      .rpc('get_or_create_conversation', {
        p_user1_id: '00000000-0000-0000-0000-000000000001',
        p_user2_id: '00000000-0000-0000-0000-000000000002'
      });
    
    if (funcError1) {
      console.log('❌ get_or_create_conversation function error:', funcError1.message);
    } else {
      console.log('✅ get_or_create_conversation function works');
      console.log('Result:', funcTest1);
    }

    // Test 5: Test get_daily_message_count function
    console.log('\n5️⃣ Testing get_daily_message_count function...');
    const { data: funcTest2, error: funcError2 } = await supabase
      .rpc('get_daily_message_count', {
        p_user_id: '00000000-0000-0000-0000-000000000001'
      });
    
    if (funcError2) {
      console.log('❌ get_daily_message_count function error:', funcError2.message);
    } else {
      console.log('✅ get_daily_message_count function works');
      console.log('Result:', funcTest2);
    }

    // Test 6: Test increment_daily_messages function
    console.log('\n6️⃣ Testing increment_daily_messages function...');
    const { data: funcTest3, error: funcError3 } = await supabase
      .rpc('increment_daily_messages', {
        p_user_id: '00000000-0000-0000-0000-000000000001'
      });
    
    if (funcError3) {
      console.log('❌ increment_daily_messages function error:', funcError3.message);
    } else {
      console.log('✅ increment_daily_messages function works');
      console.log('Result:', funcTest3);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Ejecutar las pruebas
testDatabaseStructure().then(() => {
  console.log('\n🏁 Database structure test completed!');
  process.exit(0);
});
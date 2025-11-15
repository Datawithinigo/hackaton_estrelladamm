// Simple Messaging Test Script
// Copy and paste this entire script into your browser console while on your app

console.log('🧪 Starting messaging system test...');

async function quickMessagingTest() {
  try {
    // Check if supabase is available
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase client not found. Make sure you\'re on the app page.');
      return;
    }

    console.log('✅ Supabase client found');

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
    console.log('✅ Database connected');

    // 2. Get users for testing
    console.log('\n2. Getting test users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, level')
      .limit(2);

    if (usersError) {
      console.error('❌ Failed to get users:', usersError);
      return;
    }

    if (!users || users.length < 2) {
      console.error('❌ Need at least 2 users in database for testing');
      console.log('Current users:', users);
      return;
    }

    console.log('✅ Found users:', users.map(u => `${u.name} (${u.level})`));

    const [sender, recipient] = users;

    // 3. Test get_daily_message_count function
    console.log('\n3. Testing get_daily_message_count function...');
    const { data: count, error: countError } = await supabase.rpc('get_daily_message_count', {
      p_user_id: sender.id
    });

    if (countError) {
      console.error('❌ get_daily_message_count failed:', countError);
      console.log('This might be the cause of your messaging error!');
    } else {
      console.log('✅ get_daily_message_count works. Current count:', count);
    }

    // 4. Test get_or_create_conversation function
    console.log('\n4. Testing get_or_create_conversation function...');
    const { data: convId, error: convError } = await supabase.rpc('get_or_create_conversation', {
      p_user1_id: sender.id,
      p_user2_id: recipient.id
    });

    if (convError) {
      console.error('❌ get_or_create_conversation failed:', convError);
      console.log('This is likely the cause of your messaging error!');
      return;
    } else {
      console.log('✅ get_or_create_conversation works. Conversation ID:', convId);
    }

    // 5. Test message insertion
    console.log('\n5. Testing message insertion...');
    const testMessage = 'Test message - ' + new Date().toISOString();
    
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id: sender.id,
        recipient_id: recipient.id,
        content: testMessage
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Message insertion failed:', messageError);
      console.log('This is the cause of your messaging error!');
      return;
    } else {
      console.log('✅ Message inserted successfully:', message.id);
    }

    // 6. Test increment_daily_messages function
    console.log('\n6. Testing increment_daily_messages function...');
    const { data: newCount, error: incrementError } = await supabase.rpc('increment_daily_messages', {
      p_user_id: sender.id
    });

    if (incrementError) {
      console.error('❌ increment_daily_messages failed:', incrementError);
      console.log('This might cause issues with message limits');
    } else {
      console.log('✅ increment_daily_messages works. New count:', newCount);
    }

    // Clean up test message
    console.log('\n7. Cleaning up test message...');
    await supabase.from('messages').delete().eq('id', message.id);
    console.log('✅ Test message cleaned up');

    console.log('\n🎉 All messaging tests passed! Your messaging system should work.');
    console.log('If you\'re still getting errors, please check your browser network tab for HTTP errors.');

  } catch (error) {
    console.error('❌ Test script failed:', error);
    console.log('This error might give us a clue about the messaging issue.');
  }
}

// Run the test
quickMessagingTest();

// Also expose the function globally so you can run it again
window.testMessaging = quickMessagingTest;
// Debug script for Map messaging issues
// Run this in browser console while on the map page

console.log('🗺️ Debugging Map messaging system...');

async function debugMapMessaging() {
  try {
    // Check if we're on the right page
    if (!window.location.href.includes('mapa') && !window.location.href.includes('map')) {
      console.log('⚠️ Make sure you\'re on the Map page for accurate testing');
    }

    console.log('1. Checking database connection...');
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase client not found');
      return;
    }

    // Test basic connectivity
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, level, visible_on_map')
      .limit(3);

    if (usersError) {
      console.error('❌ Can\'t fetch users:', usersError);
      return;
    }

    console.log('✅ Found users:', users.length);
    const mapUsers = users.filter(u => u.visible_on_map);
    console.log('✅ Users visible on map:', mapUsers.length);

    if (users.length < 2) {
      console.error('❌ Need at least 2 users for testing');
      return;
    }

    // Test beer sending functionality
    console.log('\n2. Testing beer sending...');
    const [sender, recipient] = users;
    
    // Check if beers_sent table exists and is accessible
    try {
      const { data: beerTest, error: beerError } = await supabase
        .from('beers_sent')
        .select('count(*)')
        .limit(1);

      if (beerError) {
        console.error('❌ beers_sent table error:', beerError);
        console.log('This might be why beer sending fails');
      } else {
        console.log('✅ beers_sent table accessible');
      }
    } catch (err) {
      console.error('❌ beers_sent table not accessible:', err);
    }

    // Test beer insertion
    try {
      const { data: beerInsert, error: beerInsertError } = await supabase
        .from('beers_sent')
        .insert({
          sender_id: sender.id,
          recipient_id: recipient.id
        })
        .select()
        .single();

      if (beerInsertError) {
        console.error('❌ Beer insertion failed:', beerInsertError);
        console.log('This is likely the cause of the beer sending error');
      } else {
        console.log('✅ Beer insertion works:', beerInsert.id);
        
        // Clean up test beer
        await supabase.from('beers_sent').delete().eq('id', beerInsert.id);
        console.log('✅ Test beer cleaned up');
      }
    } catch (err) {
      console.error('❌ Beer insertion error:', err);
    }

    // Test daily_message_limits table for bonus messages
    console.log('\n3. Testing daily message limits for beer bonus...');
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: limitTest, error: limitError } = await supabase
        .from('daily_message_limits')
        .select('*')
        .eq('user_id', sender.id)
        .eq('date', today)
        .single();

      if (limitError && limitError.code !== 'PGRST116') {
        console.error('❌ daily_message_limits query error:', limitError);
      } else {
        console.log('✅ daily_message_limits accessible. Current:', limitTest);
      }

      // Test upsert operation
      const { data: upsertTest, error: upsertError } = await supabase
        .from('daily_message_limits')
        .upsert({
          user_id: sender.id,
          date: today,
          messages_sent: 0
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (upsertError) {
        console.error('❌ daily_message_limits upsert error:', upsertError);
        console.log('This might be why beer bonus messages fail');
      } else {
        console.log('✅ daily_message_limits upsert works');
      }

    } catch (err) {
      console.error('❌ daily_message_limits test error:', err);
    }

    // Test messaging functions
    console.log('\n4. Testing core messaging functions...');
    
    // Test conversation creation
    try {
      const { data: convId, error: convError } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: sender.id,
        p_user2_id: recipient.id
      });

      if (convError) {
        console.error('❌ get_or_create_conversation failed:', convError);
        console.log('This will cause message sending to fail');
      } else {
        console.log('✅ get_or_create_conversation works. ID:', convId);
      }
    } catch (err) {
      console.error('❌ get_or_create_conversation error:', err);
    }

    // Test message count function
    try {
      const { data: count, error: countError } = await supabase.rpc('get_daily_message_count', {
        p_user_id: sender.id
      });

      if (countError) {
        console.error('❌ get_daily_message_count failed:', countError);
        console.log('This will cause message limit checking to fail');
      } else {
        console.log('✅ get_daily_message_count works. Count:', count);
      }
    } catch (err) {
      console.error('❌ get_daily_message_count error:', err);
    }

    console.log('\n🎯 Debugging complete. Check above for specific error messages.');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
}

// Test the specific functions used by Map
async function testMapFunctions() {
  console.log('\n🧪 Testing Map-specific functions...');
  
  try {
    // Get current user data if available
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      console.log('⚠️ No current user found in localStorage');
      return;
    }
    
    console.log('Current user ID:', currentUserId);
    
    // Get some test users
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUserId)
      .limit(1);
      
    if (!users || users.length === 0) {
      console.log('❌ No other users found for testing');
      return;
    }
    
    const testRecipient = users[0];
    console.log('Test recipient:', testRecipient.name);
    
    // Simulate the exact handleSendBeer function
    console.log('\nTesting handleSendBeer equivalent...');
    
    try {
      // Send the beer
      const { error } = await supabase
        .from('beers_sent')
        .insert({
          sender_id: currentUserId,
          recipient_id: testRecipient.id
        });

      if (error) {
        console.error('❌ Beer sending failed:', error);
        console.log('This is exactly the error you\'re seeing in the Map!');
      } else {
        console.log('✅ Beer sending works');
        
        // Test the bonus message logic
        const today = new Date().toISOString().split('T')[0];
        
        const { data: currentLimit } = await supabase
          .from('daily_message_limits')
          .select('messages_sent')
          .eq('user_id', currentUserId)
          .eq('date', today)
          .single();
          
        const currentSent = currentLimit?.messages_sent || 0;
        const newSent = Math.max(0, currentSent - 10); // Add 10 bonus messages
        
        // Update daily limit to give bonus messages
        const { error: bonusError } = await supabase
          .from('daily_message_limits')
          .upsert({
            user_id: currentUserId,
            date: today,
            messages_sent: newSent
          }, {
            onConflict: 'user_id,date'
          });

        if (bonusError) {
          console.error('❌ Bonus message logic failed:', bonusError);
        } else {
          console.log('✅ Bonus message logic works');
        }
      }
    } catch (beerError) {
      console.error('❌ handleSendBeer simulation failed:', beerError);
      console.log('This is the exact cause of your Map error!');
    }
    
  } catch (error) {
    console.error('❌ Map function test failed:', error);
  }
}

// Export functions for manual testing
window.debugMapMessaging = debugMapMessaging;
window.testMapFunctions = testMapFunctions;

// Run both tests
debugMapMessaging().then(() => {
  return testMapFunctions();
});
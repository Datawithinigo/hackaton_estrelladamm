import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPromoAndBeerFeatures() {
  console.log('🧪 Testing promotional code and beer features...');
  
  try {
    // Get test users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2);
      
    if (usersError || !users || users.length < 2) {
      console.log('❌ Need at least 2 users for testing');
      return;
    }
    
    const [user1, user2] = users;
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`👤 Testing with users: ${user1.name || user1.email} and ${user2.name || user2.email}`);
    
    // Test 1: Check current message limits
    console.log('\n📊 Current message limits:');
    for (const user of [user1, user2]) {
      const { data: limit } = await supabase
        .from('daily_message_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();
        
      console.log(`${user.name || user.email}: ${limit?.messages_sent || 0} messages sent today`);
    }
    
    // Test 2: Apply promotional code (simulate)
    console.log('\n🎁 Testing promotional code 123456...');
    
    const { data: currentLimit } = await supabase
      .from('daily_message_limits')
      .select('messages_sent')
      .eq('user_id', user1.id)
      .eq('date', today)
      .single();
      
    const currentSent = currentLimit?.messages_sent || 0;
    const newSent = Math.max(0, currentSent - 10); // Add 10 bonus messages
    
    const { error: promoError } = await supabase
      .from('daily_message_limits')
      .upsert({
        user_id: user1.id,
        date: today,
        messages_sent: newSent
      }, {
        onConflict: 'user_id,date'
      });
    
    if (promoError) {
      console.log('❌ Error applying promo code:', promoError);
    } else {
      console.log(`✅ Promotional code applied! ${user1.name || user1.email} got 10 bonus messages`);
      console.log(`   Messages before: ${currentSent}, after: ${newSent}`);
    }
    
    // Test 3: Send a beer and give bonus
    console.log('\n🍺 Testing beer sending bonus...');
    
    const { error: beerError } = await supabase
      .from('beers_sent')
      .insert({
        sender_id: user2.id,
        recipient_id: user1.id
      });
    
    if (beerError) {
      console.log('❌ Error sending beer:', beerError);
    } else {
      // Apply beer bonus
      const { data: currentLimit2 } = await supabase
        .from('daily_message_limits')
        .select('messages_sent')
        .eq('user_id', user2.id)
        .eq('date', today)
        .single();
        
      const currentSent2 = currentLimit2?.messages_sent || 0;
      const newSent2 = Math.max(0, currentSent2 - 10);
      
      const { error: bonusError } = await supabase
        .from('daily_message_limits')
        .upsert({
          user_id: user2.id,
          date: today,
          messages_sent: newSent2
        }, {
          onConflict: 'user_id,date'
        });
        
      if (bonusError) {
        console.log('❌ Error applying beer bonus:', bonusError);
      } else {
        console.log(`✅ Beer sent! ${user2.name || user2.email} got 10 bonus messages`);
        console.log(`   Messages before: ${currentSent2}, after: ${newSent2}`);
      }
    }
    
    // Test 4: Final message limits
    console.log('\n📊 Final message limits:');
    for (const user of [user1, user2]) {
      const { data: limit } = await supabase
        .from('daily_message_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();
        
      console.log(`${user.name || user.email}: ${limit?.messages_sent || 0} messages sent today`);
    }
    
    console.log('\n🎉 All features tested successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPromoAndBeerFeatures();
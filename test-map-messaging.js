import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsersAndMap() {
  console.log('🗺️ Testing users and map visibility...');
  
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (usersError) {
      console.log('❌ Error fetching users:', usersError);
      return;
    }
    
    console.log('👥 Found users:', users.length);
    users.forEach((user, index) => {
      console.log(`User ${index + 1}: ${user.name || 'No name'}, visible_on_map: ${user.visible_on_map}, email: ${user.email}`);
    });
    
    // Set some users visible on map for testing
    if (users.length >= 2) {
      console.log('\n🔧 Making users visible on map...');
      
      for (let i = 0; i < Math.min(2, users.length); i++) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ visible_on_map: true })
          .eq('id', users[i].id);
          
        if (updateError) {
          console.log(`❌ Error updating user ${i + 1}:`, updateError);
        } else {
          console.log(`✅ User ${i + 1} (${users[i].name || users[i].email}) is now visible on map`);
        }
      }
    }
    
    // Test message sending functionality
    if (users.length >= 2) {
      console.log('\n💬 Testing message functionality...');
      const sender = users[0];
      const recipient = users[1];
      
      const testMessage = `Hello from ${sender.name || sender.email}! This is a test message. ${new Date().toLocaleTimeString()}`;
      
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: sender.id,
          recipient_id: recipient.id,
          content: testMessage
        })
        .select()
        .single();
        
      if (messageError) {
        console.log('❌ Error sending test message:', messageError);
      } else {
        console.log('✅ Test message sent successfully!');
        console.log('Message details:', messageData);
      }
    }
    
    console.log('\n🎉 Map and messaging test completed!');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

checkUsersAndMap();
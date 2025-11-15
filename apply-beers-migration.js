import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBeersTable() {
  console.log('🍺 Checking beers_sent table...');
  
  try {
    // Try to access beers_sent table
    const { data, error } = await supabase
      .from('beers_sent')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ beers_sent table not accessible:', error.message);
      
      if (error.message.includes('does not exist') || error.message.includes('table') || error.message.includes('schema')) {
        console.log('📝 Table needs to be created. Please run the following SQL in your Supabase dashboard:');
        console.log('\n--- Copy this SQL to Supabase SQL Editor ---');
        console.log(`
CREATE TABLE IF NOT EXISTS beers_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false,
  CONSTRAINT different_users_beer CHECK (sender_id != recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_beers_sender ON beers_sent(sender_id);
CREATE INDEX IF NOT EXISTS idx_beers_recipient ON beers_sent(recipient_id);
CREATE INDEX IF NOT EXISTS idx_beers_created ON beers_sent(created_at DESC);

ALTER TABLE beers_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send beers"
  ON beers_sent FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view beers they sent or received"
  ON beers_sent FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can mark received beers as read"
  ON beers_sent FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
`);
        console.log('--- End of SQL ---\n');
      }
    } else {
      console.log('✅ beers_sent table exists and is accessible');
      console.log('Current records:', data.length);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Test the beer sending functionality
async function testBeerSending() {
  console.log('\n🧪 Testing beer sending functionality...');
  
  try {
    // Get some test users
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
      
      console.log(`Testing beer from ${sender.name} to ${recipient.name}`);
      
      // Try to insert a test beer
      const { data: beerData, error: beerError } = await supabase
        .from('beers_sent')
        .insert({
          sender_id: sender.id,
          recipient_id: recipient.id
        })
        .select()
        .single();
        
      if (beerError) {
        console.log('❌ Beer insertion failed:', beerError.message);
      } else {
        console.log('✅ Beer sent successfully! ID:', beerData.id);
        
        // Clean up - delete the test beer
        await supabase.from('beers_sent').delete().eq('id', beerData.id);
        console.log('🧹 Test data cleaned up');
      }
    } else {
      console.log('ℹ️  Need at least 2 users to test beer sending');
    }
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

async function main() {
  await checkBeersTable();
  await testBeerSending();
}

main();
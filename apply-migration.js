import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIyMjY1NiwiZXhwIjoyMDc4Nzk4NjU2fQ.gBnwkQS5gJv5rPYT0FW2u0x-IHzKAJXjYA5NnQfGb3I';

// For migration, we'll need to use the service role key to execute SQL directly
async function applyMigrationDirectly() {
  console.log('🔧 Applying bonus messages migration directly...');
  
  try {
    // Since we can't execute SQL directly through the JS client easily,
    // let's create the column using manual queries
    
    const annonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss');
    
    // First, let's create a simple test to verify if bonus_messages column exists
    console.log('Testing database structure...');
    
    try {
      // Try to query daily_message_limits with bonus_messages
      const { data, error } = await annonClient
        .from('daily_message_limits')
        .select('id, user_id, date, messages_sent, bonus_messages')
        .limit(1);
        
      if (error) {
        console.log('⚠️  bonus_messages column not found, migration needed');
        console.log('Error:', error.message);
      } else {
        console.log('✅ bonus_messages column exists!');
      }
    } catch (err) {
      console.log('⚠️  Error checking bonus_messages column:', err.message);
    }
    
    // Test current users and their limits
    console.log('\n🔍 Testing current data structure...');
    
    const { data: users } = await annonClient.from('users').select('*').limit(1);
    if (users && users.length > 0) {
      const testUser = users[0];
      console.log('Test user:', testUser.name || testUser.email);
      
      // Check current daily limits
      const { data: limits, error: limitError } = await annonClient
        .from('daily_message_limits')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('date', new Date().toISOString().split('T')[0]);
        
      if (limitError) {
        console.log('No current limits found for today');
      } else {
        console.log('Current daily limits:', limits);
      }
    }
    
    console.log('\n✅ Database analysis complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Apply the migration SQL manually in Supabase dashboard');
    console.log('2. Or use supabase CLI: supabase db push');
    console.log('3. The migration file is: ./supabase/migrations/20251115210000_add_bonus_messages_column.sql');
    
  } catch (error) {
    console.error('❌ Migration application failed:', error);
  }
}

applyMigrationDirectly();
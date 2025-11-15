import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runBonusMigration() {
  console.log('🔧 Running bonus messages migration...');
  
  try {
    const migrationSQL = fs.readFileSync('./supabase/migrations/20251115210000_add_bonus_messages_column.sql', 'utf8');
    
    // Apply the migration using Supabase CLI (or manual execution)
    console.log('📋 Migration SQL to apply:');
    console.log('========================================');
    console.log(migrationSQL);
    console.log('========================================');
    
    console.log('\n✅ Migration ready to apply!');
    console.log('Please apply this migration to your database.');
    
    // Test the new functionality
    console.log('\n🧪 Testing message status functionality...');
    
    const { data: users } = await supabase.from('users').select('*').limit(1);
    if (users && users.length > 0) {
      const testUser = users[0];
      
      console.log('Testing message status for user:', testUser.name || testUser.email);
      
      // Test getting message status (this will work even if migration isn't applied yet)
      try {
        const { data: status, error } = await supabase.rpc('get_message_status', {
          p_user_id: testUser.id
        });
        
        if (!error && status) {
          console.log('✅ Message status:', status);
        } else {
          console.log('⚠️  Message status function not available yet (migration needed)');
        }
      } catch (err) {
        console.log('⚠️  Message status function not available yet (migration needed)');
      }
      
      // Test promo code redemption
      console.log('\nTesting promo code 123456...');
      
      const { data: result, error } = await supabase.rpc('redeem_promo_code', {
        p_user_id: testUser.id,
        p_promo_code: '123456'
      });
      
      if (error) {
        console.error('❌ Error testing promo code:', error);
      } else {
        console.log('✅ Promo code test result:', result);
      }
    }
    
  } catch (error) {
    console.error('❌ Migration preparation failed:', error);
  }
}

runBonusMigration();
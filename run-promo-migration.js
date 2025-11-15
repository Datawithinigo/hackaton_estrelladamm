import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🔧 Running promotional codes migration...');
  
  try {
    const migrationSQL = fs.readFileSync('./supabase/migrations/20251115182500_add_promo_codes_and_bonus_messages.sql', 'utf8');
    
    // Split the migration by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('Error executing statement:', error);
        }
      }
    }
    
    console.log('✅ Migration completed!');
    
    // Test promotional code functionality
    console.log('\n🧪 Testing promotional code functionality...');
    
    const { data: users } = await supabase.from('users').select('*').limit(1);
    if (users && users.length > 0) {
      const testUser = users[0];
      
      // Test promo code redemption
      console.log('Testing promo code 123456 for user:', testUser.name || testUser.email);
      
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
    console.error('❌ Migration failed:', error);
  }
}

runMigration();
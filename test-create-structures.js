import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que en la app
const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createBasicStructures() {
  console.log('🚀 Creating basic table structures using INSERT operations...\n');

  // We can't create tables from client, but we can test if they exist
  // by trying to insert and catch the error

  try {
    // Test if conversations table exists by attempting a simple operation
    console.log('1️⃣ Testing conversations table...');
    try {
      const { error } = await supabase
        .from('conversations')
        .select('id')
        .limit(0);
        
      if (error) {
        console.log('❌ Conversations table does not exist:', error.message);
        console.log('📋 You need to create the conversations table manually in Supabase.');
        console.log('👉 Go to: https://app.supabase.com/project/wjqwvnsnliacghigteyv/editor');
        console.log('👉 Run the SQL script: supabase-migration.sql');
      } else {
        console.log('✅ Conversations table exists');
      }
    } catch (convErr) {
      console.log('❌ Conversations table error:', convErr);
    }

    console.log('\n2️⃣ Testing daily_message_limits table...');
    try {
      const { error } = await supabase
        .from('daily_message_limits')
        .select('id')
        .limit(0);
        
      if (error) {
        console.log('❌ Daily message limits table does not exist:', error.message);
        console.log('📋 You need to create the daily_message_limits table manually in Supabase.');
      } else {
        console.log('✅ Daily message limits table exists');
      }
    } catch (limitsErr) {
      console.log('❌ Daily message limits table error:', limitsErr);
    }

    console.log('\n3️⃣ Testing functions...');
    try {
      const { error } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: '00000000-0000-0000-0000-000000000001',
        p_user2_id: '00000000-0000-0000-0000-000000000002'
      });
      
      if (error) {
        console.log('❌ Functions do not exist:', error.message);
        console.log('📋 You need to create the functions manually in Supabase.');
      } else {
        console.log('✅ Functions exist and work');
      }
    } catch (funcErr) {
      console.log('❌ Functions error:', funcErr);
    }

    console.log('\n📋 MIGRATION STEPS:');
    console.log('1. Open Supabase SQL Editor: https://app.supabase.com/project/wjqwvnsnliacghigteyv/sql');
    console.log('2. Copy and paste the content of supabase-migration.sql');
    console.log('3. Click "Run" to execute the migration');
    console.log('4. Test your messaging functionality again');

  } catch (error) {
    console.error('❌ Structure test failed:', error);
  }
}

// Ejecutar las pruebas
createBasicStructures().then(() => {
  console.log('\n🏁 Structure test completed!');
  process.exit(0);
});
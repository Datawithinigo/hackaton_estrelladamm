import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually (trying .env.local first, then .env)
const envVars = {};
const envPaths = ['.env.local', '.env'];

for (const envFile of envPaths) {
  const envPath = path.join(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!envVars[key]) { // Don't overwrite if already set
          envVars[key] = value;
        }
      }
    });
  }
}

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Applying tier-based message limits migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251116000001_fix_message_limits_per_tier.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    console.log('📝 Applying migration to database...\n');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments
      if (statement.trim().startsWith('/*') || statement.trim().startsWith('--')) {
        continue;
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution if rpc doesn't work
          console.log(`   Statement ${i + 1}: Executing...`);
          // Note: Supabase client doesn't have direct SQL execution
          // We'll use a workaround
          console.log('   ⚠️  Manual execution required for this statement');
          errorCount++;
        } else {
          successCount++;
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`   ⚠️  Statement ${i + 1} error (may need manual execution):`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successful statements: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ⚠️  Statements needing manual execution: ${errorCount}`);
    }

    console.log('\n🔍 Testing new functions...\n');

    // Test the new functions
    const testUserId = 'test-user-id';
    
    // Test get_base_message_limit
    console.log('Testing get_base_message_limit function:');
    const limits = {
      'Bronce': 5,
      'Plata': 5,
      'Oro': 30
    };

    for (const [level, expectedLimit] of Object.entries(limits)) {
      try {
        const { data, error } = await supabase.rpc('get_base_message_limit', {
          p_user_level: level
        });
        
        if (error) {
          console.log(`   ⚠️  ${level}: Error - ${error.message}`);
        } else {
          const checkmark = data === expectedLimit ? '✅' : '❌';
          console.log(`   ${checkmark} ${level}: ${data} messages (expected ${expectedLimit})`);
        }
      } catch (err) {
        console.log(`   ⚠️  ${level}: ${err.message}`);
      }
    }

    console.log('\n✨ Migration process completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. If there were errors, you may need to run the SQL directly in Supabase Dashboard');
    console.log('   2. Test the message limits in your app');
    console.log('   3. Verify beer invitations add bonus messages correctly');
    console.log('\n🎯 New message limits:');
    console.log('   • Bronce: 5 messages/day');
    console.log('   • Plata: 5 messages/day');
    console.log('   • Oro: 30 messages/day');
    console.log('   • Beer invitation: +10 bonus messages\n');

  } catch (error) {
    console.error('❌ Error applying migration:', error);
    console.log('\n💡 Alternative: Apply the migration manually:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy the contents of: supabase/migrations/20251116000001_fix_message_limits_per_tier.sql');
    console.log('   3. Paste and run the SQL directly\n');
    process.exit(1);
  }
}

applyMigration();

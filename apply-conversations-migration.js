import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que en la app
const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyMigration() {
  console.log('🚀 Applying conversations and message limits migration...\n');

  try {
    // Step 1: Create conversations table
    console.log('1️⃣ Creating conversations table...');
    const createConversationsSQL = `
      CREATE TABLE IF NOT EXISTS conversations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user1_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user2_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id),
        CONSTRAINT different_users CHECK (user1_id != user2_id)
      );
    `;
    
    const { error: convTableError } = await supabase.rpc('exec', { sql: createConversationsSQL });
    if (convTableError) {
      console.log('❌ Error creating conversations table:', convTableError.message);
      throw convTableError;
    }
    console.log('✅ Conversations table created successfully');

    // Step 2: Create daily_message_limits table
    console.log('\n2️⃣ Creating daily_message_limits table...');
    const createLimitsSQL = `
      CREATE TABLE IF NOT EXISTS daily_message_limits (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date date DEFAULT CURRENT_DATE,
        messages_sent integer DEFAULT 0,
        CONSTRAINT unique_user_date UNIQUE (user_id, date)
      );
    `;
    
    const { error: limitsTableError } = await supabase.rpc('exec', { sql: createLimitsSQL });
    if (limitsTableError) {
      console.log('❌ Error creating daily_message_limits table:', limitsTableError.message);
      throw limitsTableError;
    }
    console.log('✅ Daily message limits table created successfully');

    // Step 3: Add conversation_id to messages table
    console.log('\n3️⃣ Adding conversation_id column to messages table...');
    const addConversationIdSQL = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'messages' AND column_name = 'conversation_id'
        ) THEN
          ALTER TABLE messages ADD COLUMN conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `;
    
    const { error: columnError } = await supabase.rpc('exec', { sql: addConversationIdSQL });
    if (columnError) {
      console.log('❌ Error adding conversation_id column:', columnError.message);
      throw columnError;
    }
    console.log('✅ Conversation_id column added successfully');

    // Step 4: Create indexes
    console.log('\n4️⃣ Creating indexes...');
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_daily_limits_user_date ON daily_message_limits(user_id, date);
    `;
    
    const { error: indexError } = await supabase.rpc('exec', { sql: createIndexesSQL });
    if (indexError) {
      console.log('❌ Error creating indexes:', indexError.message);
      throw indexError;
    }
    console.log('✅ Indexes created successfully');

    // Step 5: Enable RLS
    console.log('\n5️⃣ Enabling Row Level Security...');
    const enableRLSSQL = `
      ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE daily_message_limits ENABLE ROW LEVEL SECURITY;
    `;
    
    const { error: rlsError } = await supabase.rpc('exec', { sql: enableRLSSQL });
    if (rlsError) {
      console.log('❌ Error enabling RLS:', rlsError.message);
      throw rlsError;
    }
    console.log('✅ Row Level Security enabled successfully');

    // Step 6: Create RLS policies
    console.log('\n6️⃣ Creating RLS policies...');
    const createPoliciesSQL = `
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
      DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
      DROP POLICY IF EXISTS "Users can view their own limits" ON daily_message_limits;
      DROP POLICY IF EXISTS "Users can update their own limits" ON daily_message_limits;
      DROP POLICY IF EXISTS "Users can modify their limits" ON daily_message_limits;
      
      -- Create new policies
      CREATE POLICY "Users can view their conversations"
        ON conversations FOR SELECT
        TO anon, authenticated
        USING (user1_id IN (SELECT id FROM users) OR user2_id IN (SELECT id FROM users));

      CREATE POLICY "Users can create conversations"
        ON conversations FOR INSERT
        TO anon, authenticated
        WITH CHECK (true);

      CREATE POLICY "Users can view their own limits"
        ON daily_message_limits FOR SELECT
        TO anon, authenticated
        USING (true);

      CREATE POLICY "Users can update their own limits"
        ON daily_message_limits FOR INSERT
        TO anon, authenticated
        WITH CHECK (true);

      CREATE POLICY "Users can modify their limits"
        ON daily_message_limits FOR UPDATE
        TO anon, authenticated
        USING (true)
        WITH CHECK (true);
    `;
    
    const { error: policiesError } = await supabase.rpc('exec', { sql: createPoliciesSQL });
    if (policiesError) {
      console.log('❌ Error creating RLS policies:', policiesError.message);
      throw policiesError;
    }
    console.log('✅ RLS policies created successfully');

    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Ejecutar la migración
applyMigration().then(() => {
  console.log('\n🏁 Migration script completed!');
  process.exit(0);
});
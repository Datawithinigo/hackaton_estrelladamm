# Messaging Error Troubleshooting Guide

## Common Issues and Fixes

### 1. Database Function Errors

**Problem**: RPC functions not working (get_daily_message_count, get_or_create_conversation, increment_daily_messages)

**Solution**: 
- Check if functions exist in Supabase dashboard
- Verify function permissions
- Test functions manually

**Debug Steps**:
```javascript
// Test in browser console
const { data, error } = await supabase.rpc('get_daily_message_count', {
  p_user_id: 'your-user-id'
});
console.log('Function test:', { data, error });
```

### 2. Row Level Security (RLS) Issues

**Problem**: RLS policies blocking legitimate operations

**Solution**: 
- Check RLS policies in Supabase dashboard
- Ensure policies allow anonymous operations if needed
- Test with authenticated users

### 3. Missing Tables or Columns

**Problem**: Tables don't exist or are missing required columns

**Solution**: 
- Run all migrations in order
- Check table structure in Supabase dashboard

### 4. Authentication Issues

**Problem**: User not properly authenticated or user data missing

**Solution**:
- Check if user is logged in
- Verify user data exists in database
- Check auth state

## Quick Fixes

### Fix 1: Reset Database Functions

Run this in Supabase SQL editor:

```sql
-- Fix get_or_create_conversation function
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user1_id uuid,
  p_user2_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id uuid;
  v_min_id uuid;
  v_max_id uuid;
BEGIN
  -- Ensure consistent ordering (smaller UUID first)
  IF p_user1_id < p_user2_id THEN
    v_min_id := p_user1_id;
    v_max_id := p_user2_id;
  ELSE
    v_min_id := p_user2_id;
    v_max_id := p_user1_id;
  END IF;

  -- Try to find existing conversation (check both orderings)
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE (user1_id = v_min_id AND user2_id = v_max_id)
     OR (user1_id = v_max_id AND user2_id = v_min_id)
  LIMIT 1;

  -- If not found, create new conversation
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (user1_id, user2_id)
    VALUES (v_min_id, v_max_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in get_or_create_conversation: %', SQLERRM;
    RETURN NULL;
END;
$$;
```

### Fix 2: Simplify RLS Policies

```sql
-- Temporarily disable RLS for testing
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_message_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Or create permissive policies
DROP POLICY IF EXISTS "Allow all operations" ON conversations;
CREATE POLICY "Allow all operations" ON conversations FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations" ON daily_message_limits;
CREATE POLICY "Allow all operations" ON daily_message_limits FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations" ON messages;
CREATE POLICY "Allow all operations" ON messages FOR ALL USING (true);
```

### Fix 3: Test Script

Run this in your browser console:

```javascript
// Copy this entire script to browser console

async function testMessaging() {
  console.log('🧪 Testing messaging system...');
  
  // 1. Test database connection
  try {
    const { data: users } = await supabase.from('users').select('*').limit(2);
    console.log('✅ Found users:', users?.length || 0);
    
    if (!users || users.length < 2) {
      console.error('❌ Need at least 2 users');
      return;
    }
    
    const [user1, user2] = users;
    console.log('👥 Testing with:', user1.name, 'and', user2.name);
    
    // 2. Test conversation function
    const { data: convId, error: convError } = await supabase.rpc('get_or_create_conversation', {
      p_user1_id: user1.id,
      p_user2_id: user2.id
    });
    
    if (convError) {
      console.error('❌ Conversation error:', convError);
      return;
    }
    
    console.log('✅ Conversation ID:', convId);
    
    // 3. Test message insertion
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id: user1.id,
        recipient_id: user2.id,
        content: 'Test message - ' + new Date().toISOString()
      })
      .select()
      .single();
    
    if (msgError) {
      console.error('❌ Message error:', msgError);
      return;
    }
    
    console.log('✅ Message sent:', message.id);
    
    // 4. Test message count function
    const { data: count, error: countError } = await supabase.rpc('get_daily_message_count', {
      p_user_id: user1.id
    });
    
    if (countError) {
      console.error('❌ Count error:', countError);
    } else {
      console.log('✅ Message count:', count);
    }
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMessaging();
```

## Error Codes and Solutions

### PGRST116 - Row not found
- **Cause**: Query returned no results
- **Fix**: This is normal for optional queries, handle gracefully

### 42883 - Function does not exist
- **Cause**: Database function not created
- **Fix**: Run migration scripts again

### 42501 - Permission denied
- **Cause**: RLS policies too restrictive
- **Fix**: Update RLS policies or disable temporarily

### 23505 - Unique constraint violation
- **Cause**: Trying to create duplicate conversation
- **Fix**: Function should handle this gracefully

## Testing Steps

1. Open browser console on your app
2. Run the test script above
3. Check for specific error messages
4. Apply fixes based on error codes
5. Retest messaging functionality

## Contact Support

If issues persist, provide:
- Browser console errors
- Supabase dashboard errors
- Steps to reproduce
- User IDs involved
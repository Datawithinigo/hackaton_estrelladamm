# Message Limits Fix - Implementation Guide

## 📋 Overview

This update fixes the message limit system to properly reflect tier-based limits and implements a proper beer invitation bonus system.

## 🎯 Changes Made

### New Message Limits per Tier:
- **Bronce**: 5 messages/day (minimum)
- **Plata**: 5 messages/day (minimum)
- **Oro**: 30 messages/day
- **Beer Invitation Bonus**: +10 messages (properly added as bonus_messages)

### Previous System (Incorrect):
- Everyone started with 30 messages/day regardless of tier
- Beer invitations manipulated the `messages_sent` counter (hacky approach)

### New System (Correct):
- Users start with their tier's base limit (5 for Bronce/Plata, 30 for Oro)
- Beer invitations properly add to the `bonus_messages` counter
- Total available = base_limit + bonus_messages

## 🔧 Files Modified

### 1. Database Migration
**File**: `supabase/migrations/20251116000001_fix_message_limits_per_tier.sql`

New functions created:
- `get_base_message_limit(p_user_level)` - Returns base limit for each tier
- `add_beer_bonus_messages(p_user_id, p_bonus_amount)` - Adds bonus messages from beer invitations
- Updated `get_message_status()` - Now uses tier-based limits
- Updated `increment_daily_messages()` - Works with new limit system

### 2. Frontend Hook
**File**: `src/hooks/useMessageLimits.ts`

Changes:
- Now calculates `dailyLimit` based on user level
- Bronce/Plata: 5 messages
- Oro: 30 messages
- Removed old level bonus logic (now in base limit)

### 3. Beer Invitation Logic
**File**: `src/App.tsx`

Changes:
- Now calls `add_beer_bonus_messages()` RPC function
- Properly adds 10 bonus messages to the sender
- No longer manipulates the `messages_sent` counter

## 🚀 How to Apply the Migration

Since the Supabase client requires admin privileges to run SQL directly, you need to apply the migration manually:

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project: https://supabase.com/dashboard
2. Select your project: `wjqwvnsnliacghigteyv`
3. Go to **SQL Editor** (left sidebar)

### Step 2: Copy the Migration SQL
Open the file: `supabase/migrations/20251116000001_fix_message_limits_per_tier.sql`

### Step 3: Run the Migration
1. Click "New Query" in the SQL Editor
2. Paste the entire contents of the migration file
3. Click "Run" or press `Ctrl/Cmd + Enter`
4. Verify that all functions are created successfully

### Step 4: Test the Migration
You can test the new functions by running these queries in the SQL Editor:

```sql
-- Test: Get base limits for each tier
SELECT get_base_message_limit('Bronce') as bronce_limit;  -- Should return 5
SELECT get_base_message_limit('Plata') as plata_limit;    -- Should return 5
SELECT get_base_message_limit('Oro') as oro_limit;        -- Should return 30

-- Test: Check message status for a user (replace with actual user_id)
SELECT get_message_status('YOUR_USER_ID_HERE', 'Bronce');
```

## ✅ Testing the Application

After applying the migration, test these scenarios:

### Test 1: Check Daily Limits
1. Log in with a **Bronce** user
2. Navigate to messages
3. Verify you see "5 messages/day" limit

### Test 2: Beer Invitation Bonus
1. Send a beer invitation to another user
2. Check that you receive a confirmation: "¡Cerveza enviada! Has recibido 10 mensajes adicionales"
3. Your message counter should now show: `Total: 15 (5 base + 10 bonus)`

### Test 3: Level Progression
1. Add stars to upgrade from Bronce to Plata (still 5 messages)
2. Add more stars to reach Oro level
3. Verify Oro users see "30 messages/day" limit

### Test 4: Daily Reset
1. Send all your messages for today
2. Wait until the next day (or manually update the date in database)
3. Verify your limit resets to your tier's base limit
4. Bonus messages from previous day should not carry over

## 📊 Database Schema

The `daily_message_limits` table structure:
```sql
CREATE TABLE daily_message_limits (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  date date DEFAULT CURRENT_DATE,
  messages_sent integer DEFAULT 0,     -- Messages sent today
  bonus_messages integer DEFAULT 0,    -- Bonus messages available
  UNIQUE(user_id, date)
);
```

## 🐛 Troubleshooting

### Issue: Still seeing 30 messages for Bronce users
**Solution**: Clear any cached message limits:
```sql
DELETE FROM daily_message_limits WHERE user_id = 'YOUR_USER_ID';
```
Then refresh the app.

### Issue: Beer bonus not working
**Solution**: Verify the function exists:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'add_beer_bonus_messages';
```

### Issue: Old bonus messages system interfering
**Solution**: Check if old function exists and ensure it's removed:
```sql
DROP FUNCTION IF EXISTS get_level_message_bonus(text);
```

## 📝 Summary

**Before:**
- ❌ Everyone got 30 messages regardless of tier
- ❌ Beer invitations used hacky counter manipulation
- ❌ Confusing "level bonus" that didn't work properly

**After:**
- ✅ Bronce/Plata: 5 messages/day (proper minimum)
- ✅ Oro: 30 messages/day
- ✅ Beer invitations: +10 bonus messages (proper implementation)
- ✅ Clear, maintainable code

## 🎉 Next Steps

1. Apply the migration in Supabase Dashboard
2. Test all scenarios listed above
3. Monitor user feedback
4. Consider adding UI indicators for bonus messages
5. Potentially add more ways to earn bonus messages (referrals, daily login, etc.)

---

**Created**: 2025-11-16
**Author**: Development Team
**Status**: Ready to deploy

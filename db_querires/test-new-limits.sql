-- Test script to verify the new message limits system
-- Execute this after running execute-new-limits.sql

-- Test 1: Get message status for different user levels
SELECT 'Testing Bronce level:' as test_description;
SELECT get_message_status('00000000-0000-0000-0000-000000000001'::uuid, 'Bronce');

SELECT 'Testing Plata level:' as test_description;
SELECT get_message_status('00000000-0000-0000-0000-000000000001'::uuid, 'Plata');

SELECT 'Testing Oro level:' as test_description;
SELECT get_message_status('00000000-0000-0000-0000-000000000001'::uuid, 'Oro');

-- Test 2: Test level bonus function
SELECT 'Level bonuses:' as test_description;
SELECT 'Bronce' as level, get_level_message_bonus('Bronce') as bonus
UNION ALL
SELECT 'Plata' as level, get_level_message_bonus('Plata') as bonus
UNION ALL
SELECT 'Oro' as level, get_level_message_bonus('Oro') as bonus;

-- Test 3: Add some bonus messages and test
SELECT 'Adding 10 bonus messages:' as test_description;
SELECT add_bonus_messages('00000000-0000-0000-0000-000000000001'::uuid, 10, 'promo_test');

SELECT 'Status after adding bonus messages (Bronce):' as test_description;
SELECT get_message_status('00000000-0000-0000-0000-000000000001'::uuid, 'Bronce');

-- Test 4: Test increment function
SELECT 'Incrementing message for Oro user:' as test_description;
SELECT increment_daily_messages('00000000-0000-0000-0000-000000000002'::uuid, 'Oro');

-- Clean up test data
DELETE FROM daily_message_limits 
WHERE user_id IN ('00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid);
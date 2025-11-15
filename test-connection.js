import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test authentication
    console.log('\n🔐 Testing authentication...');
    const testEmail = 'test@example.com';
    const testPassword = 'test123456';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (authError && !authError.message.includes('User already registered')) {
      console.log('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Authentication system working!');
      
      // Try sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        console.log('ℹ️ Sign in info:', signInError.message);
      } else {
        console.log('✅ Sign in working!');
      }
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

testConnection();
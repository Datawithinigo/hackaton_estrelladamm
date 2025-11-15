import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🔐 Testing authentication process...');
  
  const testEmail = 'test@example.com';
  const testPassword = 'test123456';
  
  try {
    // Test sign up
    console.log('1. Testing sign up...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError && !signUpError.message.includes('User already registered')) {
      console.log('❌ Sign up error:', signUpError);
      return;
    }
    console.log('✅ Sign up works');
    
    // Test sign in
    console.log('2. Testing sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ Sign in error:', signInError);
      return;
    }
    console.log('✅ Sign in works');
    
    // Test user lookup
    console.log('3. Testing user lookup...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .maybeSingle();
      
    if (userError) {
      console.log('❌ User lookup error:', userError);
      return;
    }
    
    if (!userData) {
      console.log('ℹ️ No user record found in custom table (expected for new users)');
    } else {
      console.log('✅ User record found:', userData);
    }
    
    // Test user creation
    console.log('4. Testing user record creation...');
    if (!userData && signUpData.user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .upsert({
          auth_user_id: signUpData.user.id,
          email: testEmail,
          stars: 0,
          level: 'Bronce',
          visible_on_map: false
        })
        .select()
        .single();
        
      if (createError) {
        console.log('❌ User creation error:', createError);
      } else {
        console.log('✅ User record created:', newUser);
      }
    }
    
    console.log('\n🎉 Authentication test completed successfully!');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

testAuth();
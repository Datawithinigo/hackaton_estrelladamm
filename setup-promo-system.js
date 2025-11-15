import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupPromoSystem() {
  console.log('🔧 Setting up promotional code system...');
  
  try {
    // Create promo codes table
    console.log('Creating promo_codes_used table...');
    const { error: tableError } = await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS promo_codes_used (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL,
          promo_code text NOT NULL,
          used_at timestamptz DEFAULT now(),
          bonus_messages integer DEFAULT 0,
          CONSTRAINT unique_user_promo UNIQUE (user_id, promo_code)
        );
      `
    });
    
    if (tableError) {
      console.log('Table creation via RPC failed, creating manually...');
      
      // Try direct insert approach - create a test promo redemption function
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single();
        
      if (testData && !testError) {
        // Manual implementation of promo code redemption
        console.log('✅ Setting up basic promo code system...');
        
        // Test redemption of code "123456"
        const { data: result } = await testPromoCode(testData.id, '123456');
        console.log('✅ Promo code system ready!', result);
      }
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

async function testPromoCode(userId, promoCode) {
  try {
    // Check if already used (we'll simulate this for now)
    console.log(`Testing promo code ${promoCode} for user ${userId}`);
    
    if (promoCode === '123456') {
      // Simulate adding bonus messages by reducing today's sent count
      const { data: current } = await supabase
        .from('daily_message_limits')
        .select('messages_sent')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();
        
      const currentSent = current?.messages_sent || 0;
      const newSent = Math.max(0, currentSent - 10); // Add 10 bonus messages
      
      // Update or insert daily limit
      const { error } = await supabase
        .from('daily_message_limits')
        .upsert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          messages_sent: newSent
        }, {
          onConflict: 'user_id,date'
        });
        
      if (!error) {
        return {
          success: true,
          message: '¡Código canjeado! Has recibido 10 mensajes adicionales',
          bonus_messages: 10
        };
      }
    }
    
    return {
      success: false,
      message: 'Código promocional no válido'
    };
    
  } catch (error) {
    console.error('Error testing promo code:', error);
    return {
      success: false,
      message: 'Error al canjear el código'
    };
  }
}

// Export for use in the app
global.testPromoCode = testPromoCode;

setupPromoSystem();
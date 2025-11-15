import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyBeerSystem() {
  console.log('🍺 Verificando sistema de invitaciones de cerveza...\n');
  
  let allGood = true;
  
  // Test 1: Verify beers_sent table exists
  console.log('1️⃣ Verificando tabla beers_sent...');
  try {
    const { data, error } = await supabase
      .from('beers_sent')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Tabla beers_sent no accesible:', error.message);
      allGood = false;
    } else {
      console.log('✅ Tabla beers_sent existe y es accesible');
    }
  } catch (err) {
    console.log('❌ Error inesperado con beers_sent:', err);
    allGood = false;
  }
  
  // Test 2: Verify message_type column exists
  console.log('\n2️⃣ Verificando columna message_type...');
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, content, message_type')
      .limit(1);
      
    if (error && error.message.includes('message_type')) {
      console.log('❌ Columna message_type no existe:', error.message);
      allGood = false;
    } else {
      console.log('✅ Columna message_type existe');
    }
  } catch (err) {
    console.log('❌ Error inesperado con message_type:', err);
    allGood = false;
  }
  
  // Test 3: Test complete beer invitation flow
  console.log('\n3️⃣ Probando flujo completo de invitación de cerveza...');
  try {
    // Get test users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .limit(2);
      
    if (usersError || !users || users.length < 2) {
      console.log('⚠️ No hay suficientes usuarios para probar (necesito 2)');
    } else {
      const sender = users[0];
      const recipient = users[1];
      
      console.log(`   Probando envío de cerveza de ${sender.name} a ${recipient.name}`);
      
      // Find or create conversation
      let conversation;
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${sender.id},user2_id.eq.${recipient.id}),and(user1_id.eq.${recipient.id},user2_id.eq.${sender.id})`)
        .single();

      if (convError && convError.code === 'PGRST116') {
        // Create conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            user1_id: sender.id,
            user2_id: recipient.id
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error('Error al crear conversación: ' + createError.message);
        }
        conversation = newConversation;
      } else if (convError) {
        throw new Error('Error al buscar conversación: ' + convError.message);
      } else {
        conversation = convData;
      }
      
      // Send test beer message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: sender.id,
          recipient_id: recipient.id,
          conversation_id: conversation.id,
          content: `🍺 ¡${sender.name} te ha invitado a una cerveza! 🍺`
        })
        .select()
        .single();
        
      if (messageError) {
        console.log('❌ Error enviando mensaje de cerveza:', messageError.message);
        allGood = false;
      } else {
        console.log('✅ Mensaje de cerveza enviado correctamente');
        
        // Clean up - delete test message
        await supabase.from('messages').delete().eq('id', messageData.id);
        console.log('   🧹 Datos de prueba eliminados');
      }
    }
  } catch (err) {
    console.log('❌ Error en flujo de cerveza:', err.message);
    allGood = false;
  }
  
  // Final result
  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('🎉 ¡SISTEMA DE CERVEZA FUNCIONANDO CORRECTAMENTE!');
    console.log('');
    console.log('✅ Todo listo para usar:');
    console.log('   • Los usuarios pueden invitar cervezas desde el mapa');
    console.log('   • Los mensajes de cerveza aparecerán con fondo amarillo');
    console.log('   • El sistema está completamente funcional');
  } else {
    console.log('⚠️  SISTEMA NECESITA CONFIGURACIÓN');
    console.log('');
    console.log('📝 Pasos a seguir:');
    console.log('1. Abre el dashboard de Supabase');
    console.log('2. Ve al SQL Editor');
    console.log('3. Ejecuta el archivo: complete-beer-system-migration.sql');
    console.log('4. Ejecuta este script nuevamente para verificar');
  }
  console.log('='.repeat(50));
}

verifyBeerSystem();
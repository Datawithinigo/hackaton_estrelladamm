// Script para actualizar todos los usuarios para que aparezcan en el mapa por defecto
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (reemplaza con tus credenciales reales)
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateAllUsersVisibility() {
  console.log('🔄 Iniciando actualización masiva de usuarios...');
  
  try {
    // Actualizar todos los usuarios existentes para que aparezcan en el mapa
    const { data, error } = await supabase
      .from('users')
      .update({ visible_on_map: true })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Actualiza todos excepto registros inválidos
    
    if (error) {
      console.error('❌ Error al actualizar usuarios:', error);
      return;
    }
    
    console.log('✅ Actualización completada exitosamente');
    console.log('📊 Datos actualizados:', data);
    
    // Verificar cuántos usuarios se actualizaron
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('visible_on_map', true);
    
    if (countError) {
      console.error('⚠️ Error al contar usuarios:', countError);
    } else {
      console.log(`📈 Total de usuarios visibles en el mapa: ${count}`);
    }
    
  } catch (error) {
    console.error('💥 Error inesperado:', error);
  }
}

// Ejecutar la actualización
updateAllUsersVisibility();
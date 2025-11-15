import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('👥 Checking users in database...');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
      
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log(`\n📊 Total users: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n👤 Sample users:');
      users.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.age} años, ${user.gender}) - ${user.visible_on_map ? 'Visible' : 'No visible'}`);
      });
      
      const visibleUsers = users.filter(user => user.visible_on_map);
      console.log(`\n🗺️ Users visible on map: ${visibleUsers.length}`);
      
      const ageDistribution = users.reduce((acc, user) => {
        const ageGroup = Math.floor(user.age / 10) * 10;
        acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📈 Age distribution:');
      Object.entries(ageDistribution).forEach(([ageGroup, count]) => {
        console.log(`  ${ageGroup}s: ${count} users`);
      });
      
      const genderDistribution = users.reduce((acc, user) => {
        acc[user.gender] = (acc[user.gender] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n🚻 Gender distribution:');
      Object.entries(genderDistribution).forEach(([gender, count]) => {
        console.log(`  ${gender}: ${count} users`);
      });
    } else {
      console.log('\n📝 No users found. Creating some sample users...');
      await createSampleUsers();
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

async function createSampleUsers() {
  const sampleUsers = [
    { name: 'Ana García', age: 25, gender: 'mujer', email: 'ana@example.com', visible_on_map: true, stars: 15, level: 'Plata' },
    { name: 'Carlos Ruiz', age: 30, gender: 'hombre', email: 'carlos@example.com', visible_on_map: true, stars: 8, level: 'Bronce' },
    { name: 'María López', age: 28, gender: 'mujer', email: 'maria@example.com', visible_on_map: true, stars: 35, level: 'Oro' },
    { name: 'David Martín', age: 32, gender: 'hombre', email: 'david@example.com', visible_on_map: false, stars: 12, level: 'Plata' },
    { name: 'Laura Sánchez', age: 26, gender: 'mujer', email: 'laura@example.com', visible_on_map: true, stars: 22, level: 'Plata' },
    { name: 'Javier Pérez', age: 29, gender: 'hombre', email: 'javier@example.com', visible_on_map: true, stars: 5, level: 'Bronce' },
    { name: 'Sara Fernández', age: 24, gender: 'mujer', email: 'sara@example.com', visible_on_map: true, stars: 18, level: 'Plata' },
    { name: 'Miguel Torres', age: 35, gender: 'hombre', email: 'miguel@example.com', visible_on_map: true, stars: 45, level: 'Oro' },
    { name: 'Elena Díaz', age: 27, gender: 'mujer', email: 'elena@example.com', visible_on_map: false, stars: 9, level: 'Bronce' },
    { name: 'Raúl Moreno', age: 31, gender: 'hombre', email: 'raul@example.com', visible_on_map: true, stars: 28, level: 'Plata' },
    { name: 'Carmen Jiménez', age: 33, gender: 'mujer', email: 'carmen@example.com', visible_on_map: true, stars: 41, level: 'Oro' },
    { name: 'Alberto Romero', age: 28, gender: 'hombre', email: 'alberto@example.com', visible_on_map: true, stars: 7, level: 'Bronce' },
    { name: 'Lucía Vargas', age: 25, gender: 'mujer', email: 'lucia@example.com', visible_on_map: true, stars: 33, level: 'Oro' },
    { name: 'Pablo Herrera', age: 29, gender: 'hombre', email: 'pablo@example.com', visible_on_map: true, stars: 14, level: 'Plata' },
    { name: 'Andrea Castro', age: 26, gender: 'mujer', email: 'andrea@example.com', visible_on_map: false, stars: 19, level: 'Plata' },
  ];
  
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select();
      
    if (error) {
      console.log('❌ Error creating users:', error.message);
      return;
    }
    
    console.log(`✅ Created ${data.length} sample users!`);
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkUsers();
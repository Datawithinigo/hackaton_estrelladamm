-- 1. Actualizar todos los usuarios existentes
UPDATE users 
SET visible_on_map = true 
WHERE visible_on_map IS NULL OR visible_on_map = false;

-- 2. Cambiar el valor por defecto para futuros usuarios
ALTER TABLE users 
ALTER COLUMN visible_on_map SET DEFAULT true;

-- 3. Verificar los cambios
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN visible_on_map = true THEN 1 END) as usuarios_visibles,
  COUNT(CASE WHEN visible_on_map = false THEN 1 END) as usuarios_ocultos
FROM users;


SELECT 
  *
FROM users;

DELETE FROM users
WHERE email = 'katherineddiaz19@gmail.com' and level = 'Bronce';

DELETE FROM users
WHERE name is NULL
-- Migración para actualizar todos los usuarios para que aparezcan en el mapa por defecto
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Actualizar todos los usuarios existentes para que aparezcan en el mapa
UPDATE users 
SET visible_on_map = true 
WHERE visible_on_map IS NULL OR visible_on_map = false;

-- 2. Cambiar el valor por defecto de la columna para futuros usuarios
ALTER TABLE users 
ALTER COLUMN visible_on_map SET DEFAULT true;

-- 3. Verificar los cambios
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN visible_on_map = true THEN 1 END) as usuarios_visibles,
  COUNT(CASE WHEN visible_on_map = false THEN 1 END) as usuarios_ocultos
FROM users;
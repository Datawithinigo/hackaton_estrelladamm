# Instrucciones para actualizar usuarios en Supabase

## 📋 Resumen
Esta actualización hace que todos los usuarios aparezcan en el mapa por defecto, mejorando la experiencia de usuario y aumentando las conexiones en la plataforma.

## 🔧 Pasos para ejecutar la migración

### 1. Abrir Supabase Dashboard
- Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Selecciona tu proyecto hackaton_estrelladamm

### 2. Navegar al SQL Editor
- En el menú lateral, haz clic en "SQL Editor"
- Crea una nueva consulta

### 3. Ejecutar la migración
Copia y pega este código SQL:

```sql
-- Migración: Hacer que todos los usuarios aparezcan en el mapa por defecto

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
```

### 4. Ejecutar y verificar
- Haz clic en "Run" para ejecutar la consulta
- Verifica que la consulta de verificación muestre que todos los usuarios tienen `visible_on_map = true`

## 🎯 Resultados esperados

### Antes de la migración:
- Algunos usuarios tenían `visible_on_map = false` o `null`
- El mapa podía mostrar pocas o ninguna conexión
- Experiencia de usuario inconsistente

### Después de la migración:
- ✅ Todos los usuarios existentes tienen `visible_on_map = true`
- ✅ Los nuevos usuarios tendrán `visible_on_map = true` por defecto
- ✅ El mapa mostrará todas las conexiones disponibles
- ✅ Experiencia de usuario más rica y conectada

## 🚀 Beneficios

1. **Más conexiones visibles**: Los usuarios ven inmediatamente a otras personas disponibles
2. **Mejor experiencia**: Sin frustración por mapas vacíos
3. **Mayor engagement**: Más interacciones desde el primer momento
4. **Consistencia**: Mismas personas en "Conecta con otras Estrellas" y en el mapa

## ⚠️ Notas importantes

- Los usuarios mantienen la opción de desactivar su visibilidad usando el toggle "Aparecer en el mapa"
- Esta migración no afecta ninguna otra funcionalidad
- Es segura de ejecutar en producción
- Se puede revertir si es necesario

## 🔄 Rollback (si necesario)

Si necesitas revertir los cambios:

```sql
-- Revertir a estado anterior
ALTER TABLE users 
ALTER COLUMN visible_on_map SET DEFAULT false;

-- Opcional: ocultar todos los usuarios
-- UPDATE users SET visible_on_map = false;
```

---

**✅ Una vez ejecutado, todos los usuarios aparecerán en el mapa y la experiencia será más rica y conectada.**
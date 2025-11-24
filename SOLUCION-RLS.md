# Solución para Error de Permisos RLS (Row Level Security)

## Problema
Error 42501: "new row violates row-level security policy for table 'posts'"

Este error ocurre cuando las políticas RLS en Supabase están bloqueando la inserción de datos.

## Solución Paso a Paso

### Paso 1: Ejecutar el Script SQL

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor** (Editor SQL)
3. Abre el archivo `fix-rls-policy.sql` de este proyecto
4. Copia TODO el contenido del archivo
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **Run** (Ejecutar) o presiona F5
7. Verifica que no haya errores

### Paso 2: Verificar las Políticas

Después de ejecutar el script, verifica que las políticas estén correctas:

1. En Supabase, ve a **Authentication** → **Policies**
2. O ejecuta en el SQL Editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

Deberías ver 4 políticas:
- Anyone can view posts (SELECT)
- Users can create posts (INSERT)
- Users can update own posts (UPDATE)
- Users can delete own posts (DELETE)

### Paso 3: Verificar la Sesión

Si el problema persiste después de ejecutar el script SQL:

1. **Cierra sesión** en la aplicación
2. **Recarga la página** completamente (Ctrl+F5 o Cmd+Shift+R)
3. **Inicia sesión nuevamente**
4. Intenta crear una publicación

### Paso 4: Verificar el Token JWT

El código ahora verifica que el token esté presente antes de crear la publicación. Si ves el error:

1. Abre la consola del navegador (F12)
2. Busca el mensaje "Token presente: true" cuando intentas crear una publicación
3. Si dice "false", el problema es que el token no se está enviando

### Paso 5: Verificar en Supabase Dashboard

1. Ve a **Authentication** → **Users**
2. Verifica que tu usuario esté listado
3. Verifica que el usuario tenga el estado "Active"

## Verificación Final

Después de seguir estos pasos, deberías poder:
- ✅ Iniciar sesión correctamente
- ✅ Ver tu nombre en la barra superior
- ✅ Crear publicaciones sin errores
- ✅ Ver tus publicaciones en la lista

## Si el Problema Persiste

Si después de todos estos pasos el error continúa:

1. **Verifica las credenciales** en `js/config.js`:
   - Asegúrate de que `SUPABASE_URL` sea correcta
   - Asegúrate de que `SUPABASE_ANON_KEY` sea la clave "anon public", no "service_role"

2. **Verifica que ejecutaste el script SQL completo**:
   - Debe incluir todas las tablas: profiles, posts, likes, reviews
   - Debe incluir todas las políticas RLS

3. **Contacta al soporte** con:
   - El error exacto de la consola
   - Una captura de pantalla de las políticas en Supabase
   - El user_id que aparece en la consola cuando intentas crear una publicación


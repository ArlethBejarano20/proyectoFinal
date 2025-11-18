# Instrucciones Rápidas de Configuración

## Pasos para poner en marcha la aplicación

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración (2-3 minutos)

### 2. Configurar la base de datos
1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Abre el archivo `database-setup.sql` de este proyecto
3. Copia todo el contenido y pégalo en el editor SQL de Supabase
4. Ejecuta el script (botón "Run" o F5)

### 3. Obtener credenciales
1. En Supabase, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public key** (una clave larga que empieza con `eyJ...`)

### 4. Configurar la aplicación
1. Abre el archivo `js/config.js`
2. Reemplaza `TU_SUPABASE_URL` con tu Project URL
3. Reemplaza `TU_SUPABASE_ANON_KEY` con tu anon public key

Ejemplo:
```javascript
const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 5. Probar la aplicación
1. Abre `index.html` en tu navegador
2. Deberías ver la página principal (aunque no haya publicaciones aún)
3. Haz clic en "Iniciar Sesión" → "Regístrate aquí"
4. Crea tu primera cuenta
5. Inicia sesión y agrega tu primera cafetería

## ✅ Verificación

Si todo está configurado correctamente:
- ✅ La página carga sin errores en la consola
- ✅ Puedes registrarte e iniciar sesión
- ✅ Puedes agregar publicaciones
- ✅ Puedes dar likes (después de iniciar sesión)

## 🐛 Solución de Problemas

### Error: "Invalid API key"
- Verifica que copiaste correctamente las credenciales en `js/config.js`
- Asegúrate de usar la clave "anon public", no la "service_role"

### Error: "relation does not exist"
- Verifica que ejecutaste el script SQL completo
- Revisa que todas las tablas se crearon en la pestaña "Table Editor"

### No se pueden crear publicaciones
- Verifica que iniciaste sesión
- Revisa la consola del navegador (F12) para ver errores específicos

### Las imágenes no se muestran
- Asegúrate de usar URLs válidas de imágenes
- Puedes usar servicios como [Imgur](https://imgur.com) o [Cloudinary](https://cloudinary.com) para subir imágenes

## 📝 Notas Importantes

- **No compartas** tus credenciales de Supabase públicamente
- El archivo `config.js` contiene información sensible - no lo subas a repositorios públicos sin usar variables de entorno
- Para producción, considera usar variables de entorno o un archivo de configuración separado

## 🎯 Próximos Pasos

Una vez que la aplicación esté funcionando:
1. Agrega algunas cafeterías de ejemplo
2. Prueba todas las funcionalidades (likes, reseñas, perfil)
3. Personaliza los estilos si lo deseas
4. Agrega más funcionalidades según tus necesidades


# LokaLook - Catálogo de Cafeterías en San Carlos Guaymas

Aplicación web estilo Pinterest para descubrir y compartir cafeterías en San Carlos Guaymas.

## Características

- **Navegación sin registro**: Puedes ver todas las publicaciones sin necesidad de iniciar sesión
- **Sistema de autenticación**: Registro e inicio de sesión
- **Publicaciones**: Agrega cafeterías con imágenes, descripción y dirección
- **Me gusta**: Da like a tus cafeterías favoritas (requiere inicio de sesión)
- **Reseñas**: Escribe reseñas con calificación de estrellas
- **Destacados**: Filtra cafeterías destacadas
- **Perfil de usuario**: Ve tus publicaciones, likes y reseñas

## Requisitos Previos

1. Cuenta en [Supabase](https://supabase.com)
2. Proyecto creado en Supabase

## Configuración de la Base de Datos

Ejecuta estos comandos SQL en el editor SQL de Supabase:

```sql
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de publicaciones (cafeterías)
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    address TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de likes
CREATE TABLE likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Tabla de reseñas
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para posts
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para likes
CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para reviews
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);
```

## Configuración

1. **Obtén tus credenciales de Supabase:**
   - Ve a tu proyecto en Supabase
   - Settings → API
   - Copia la URL del proyecto y la clave anónima (anon key)

2. **Configura las credenciales:**
   - Abre `js/config.js`
   - Reemplaza `TU_SUPABASE_URL` con tu URL de Supabase
   - Reemplaza `TU_SUPABASE_ANON_KEY` con tu clave anónima

```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-clave-anon-key';
```

## Credenciales de Prueba

Después de configurar Supabase y ejecutar el script SQL, puedes crear usuarios de prueba de dos formas:

### Opción 1: Registro desde la aplicación
1. Abre la aplicación en tu navegador
2. Haz clic en "Iniciar Sesión"
3. Haz clic en "Regístrate aquí"
4. Completa el formulario de registro

### Opción 2: Crear usuario desde Supabase
1. Ve a Authentication → Users en tu panel de Supabase
2. Haz clic en "Add User" → "Create new user"
3. Ingresa email y contraseña
4. El perfil se creará automáticamente cuando el usuario inicie sesión por primera vez

**Usuario de ejemplo para pruebas:**
- Email: `demo@lokalook.com`
- Contraseña: `Demo123456`

> **Importante:** Este usuario debe ser creado manualmente. La aplicación no crea usuarios de prueba automáticamente por seguridad.

## Estructura del Proyecto

```
lokalook/
├── index.html          # Página principal
├── profile.html        # Página de perfil
├── css/
│   └── style.css       # Estilos principales
├── js/
│   ├── config.js       # Configuración de Supabase
│   ├── auth.js         # Funciones de autenticación
│   ├── posts.js        # Funciones de publicaciones
│   ├── reviews.js      # Funciones de reseñas
│   ├── app.js          # Lógica principal
│   └── profile.js      # Lógica del perfil
└── README.md           # Este archivo
```

## Uso

1. Abre `index.html` en tu navegador o usa un servidor local
2. Navega por las cafeterías sin necesidad de iniciar sesión
3. Inicia sesión para dar likes y agregar reseñas
4. Agrega nuevas cafeterías desde el botón "Agregar Cafetería"

## Funcionalidades

### Sin Autenticación
- Ver todas las publicaciones
- Ver detalles de cafeterías
- Ver reseñas

### Con Autenticación
- Dar me gusta a publicaciones
- Agregar reseñas con calificación
- Crear nuevas publicaciones
- Ver tu perfil con estadísticas
- Ver tus publicaciones y likes

## Tecnologías

- HTML5
- CSS3
- JavaScript (Vanilla)
- Supabase (Backend as a Service)
- Font Awesome (Iconos)

## Notas

- Las imágenes deben ser URLs válidas
- El sistema de destacados puede ser configurado manualmente en la base de datos
- Las reseñas son únicas por usuario y publicación (se actualizan si ya existe una)

## Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Autenticación manejada por Supabase
- Validación de datos en el frontend y backend

## Licencia

Este proyecto es de código abierto y está disponible para uso personal y comercial.


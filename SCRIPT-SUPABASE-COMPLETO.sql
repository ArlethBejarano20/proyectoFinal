-- =====================================================
-- SCRIPT COMPLETO PARA CORREGIR POLÍTICAS RLS EN SUPABASE
-- =====================================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre el SQL Editor (Editor SQL)
-- 3. Copia TODO este script
-- 4. Pégalo en el editor
-- 5. Haz clic en "Run" o presiona F5
-- 6. Verifica que no haya errores
-- =====================================================

-- PASO 1: Asegurar que RLS esté habilitado en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar TODAS las políticas existentes (empezar limpio)
-- Profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Posts
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Likes
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
DROP POLICY IF EXISTS "Users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
DROP POLICY IF EXISTS "Public likes are viewable by everyone" ON likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;

-- Reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

-- PASO 3: Crear políticas RLS para PROFILES
-- Cualquiera puede ver perfiles
CREATE POLICY "Users can view all profiles" 
ON profiles 
FOR SELECT 
USING (true);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- PASO 4: Crear politicas RLS para POSTS
-- Cualquiera puede ver posts
CREATE POLICY "Anyone can view posts" 
ON posts 
FOR SELECT 
USING (true);

-- Usuarios autenticados pueden crear posts
-- IMPORTANTE: auth.uid() debe coincidir exactamente con user_id
CREATE POLICY "Users can create posts" 
ON posts 
FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
);

-- Usuarios pueden actualizar solo sus propios posts
CREATE POLICY "Users can update own posts" 
ON posts 
FOR UPDATE 
USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
)
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
);

-- Usuarios pueden eliminar solo sus propios posts
CREATE POLICY "Users can delete own posts" 
ON posts 
FOR DELETE 
USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
);

-- PASO 5: Crear políticas RLS para LIKES
-- Cualquiera puede ver likes
CREATE POLICY "Anyone can view likes" 
ON likes 
FOR SELECT 
USING (true);

-- Usuarios autenticados pueden crear likes
CREATE POLICY "Users can create likes" 
ON likes 
FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
);

-- Usuarios pueden eliminar solo sus propios likes
CREATE POLICY "Users can delete own likes" 
ON likes 
FOR DELETE 
USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
);

-- PASO 6: Crear políticas RLS para REVIEWS
-- Cualquiera puede ver reviews
CREATE POLICY "Anyone can view reviews" 
ON reviews 
FOR SELECT 
USING (true);

-- Usuarios autenticados pueden crear reviews
CREATE POLICY "Users can create reviews" 
ON reviews 
FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
);

-- Usuarios pueden actualizar solo sus propias reviews
CREATE POLICY "Users can update own reviews" 
ON reviews 
FOR UPDATE 
USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
)
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
);

-- Usuarios pueden eliminar solo sus propias reviews
CREATE POLICY "Users can delete own reviews" 
ON reviews 
FOR DELETE 
USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
);

-- =====================================================
-- VERIFICACIÓN (opcional - ejecuta esto después para verificar)
-- =====================================================
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd,
--     qual,
--     with_check
-- FROM pg_policies 
-- WHERE tablename IN ('profiles', 'posts', 'likes', 'reviews')
-- ORDER BY tablename, policyname;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Después de ejecutar este script:
-- 1. Cierra sesión en tu aplicación
-- 2. Recarga la página (Ctrl+F5)
-- 3. Inicia sesión nuevamente
-- 4. Intenta crear una publicación
-- =====================================================


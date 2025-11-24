-- Script para corregir las políticas RLS si hay problemas
-- Ejecuta este script en el editor SQL de Supabase
-- IMPORTANTE: Ejecuta este script completo en el SQL Editor de Supabase

-- Paso 1: Verificar que RLS esté habilitado
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Paso 2: Eliminar TODAS las políticas existentes de posts (para empezar limpio)
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Paso 3: Recrear las políticas RLS para posts
-- Política para SELECT (cualquiera puede ver)
CREATE POLICY "Anyone can view posts" 
ON posts 
FOR SELECT 
USING (true);

-- Política para INSERT (usuarios autenticados pueden crear posts)
-- IMPORTANTE: auth.uid() debe coincidir exactamente con user_id
CREATE POLICY "Users can create posts" 
ON posts 
FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
);

-- Política para UPDATE (usuarios solo pueden actualizar sus propios posts)
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

-- Política para DELETE (usuarios solo pueden eliminar sus propios posts)
CREATE POLICY "Users can delete own posts" 
ON posts 
FOR DELETE 
USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
);

-- Paso 4: Verificar las políticas creadas
-- Ejecuta esto para ver las políticas actuales:
-- SELECT * FROM pg_policies WHERE tablename = 'posts';


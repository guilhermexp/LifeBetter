-- Script para configurar Row Level Security nas tabelas principais
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Habilitar RLS em todas as tabelas principais
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_questionnaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS areas ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas para a tabela tasks
-- Permitir que usuários vejam apenas suas próprias tarefas
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks" 
ON tasks FOR SELECT 
USING (auth.uid() = user_id);

-- Permitir que usuários criem suas próprias tarefas
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
CREATE POLICY "Users can insert their own tasks" 
ON tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários atualizem suas próprias tarefas
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks" 
ON tasks FOR UPDATE 
USING (auth.uid() = user_id);

-- Permitir que usuários excluam suas próprias tarefas
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks" 
ON tasks FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Criar políticas para a tabela mood_entries
-- Permitir que usuários vejam apenas seus próprios registros de humor
DROP POLICY IF EXISTS "Users can view their own mood entries" ON mood_entries;
CREATE POLICY "Users can view their own mood entries" 
ON mood_entries FOR SELECT 
USING (auth.uid() = user_id);

-- Permitir que usuários criem seus próprios registros de humor
DROP POLICY IF EXISTS "Users can insert their own mood entries" ON mood_entries;
CREATE POLICY "Users can insert their own mood entries" 
ON mood_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários atualizem seus próprios registros de humor
DROP POLICY IF EXISTS "Users can update their own mood entries" ON mood_entries;
CREATE POLICY "Users can update their own mood entries" 
ON mood_entries FOR UPDATE 
USING (auth.uid() = user_id);

-- Permitir que usuários excluam seus próprios registros de humor
DROP POLICY IF EXISTS "Users can delete their own mood entries" ON mood_entries;
CREATE POLICY "Users can delete their own mood entries" 
ON mood_entries FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Criar políticas para a tabela user_questionnaire
-- Permitir que usuários vejam apenas seus próprios questionários
DROP POLICY IF EXISTS "Users can view their own questionnaires" ON user_questionnaire;
CREATE POLICY "Users can view their own questionnaires" 
ON user_questionnaire FOR SELECT 
USING (auth.uid() = user_id);

-- Permitir que usuários criem seus próprios questionários
DROP POLICY IF EXISTS "Users can insert their own questionnaires" ON user_questionnaire;
CREATE POLICY "Users can insert their own questionnaires" 
ON user_questionnaire FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários atualizem seus próprios questionários
DROP POLICY IF EXISTS "Users can update their own questionnaires" ON user_questionnaire;
CREATE POLICY "Users can update their own questionnaires" 
ON user_questionnaire FOR UPDATE 
USING (auth.uid() = user_id);

-- 5. Criar políticas para a tabela user_profiles
-- Permitir que usuários vejam apenas seus próprios perfis
DROP POLICY IF EXISTS "Users can view their own profiles" ON user_profiles;
CREATE POLICY "Users can view their own profiles" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Permitir que usuários atualizem seus próprios perfis
DROP POLICY IF EXISTS "Users can update their own profiles" ON user_profiles;
CREATE POLICY "Users can update their own profiles" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- 6. Criar políticas para a tabela areas
-- Permitir que usuários vejam apenas suas próprias áreas
DROP POLICY IF EXISTS "Users can view their own areas" ON areas;
CREATE POLICY "Users can view their own areas" 
ON areas FOR SELECT 
USING (auth.uid() = user_id);

-- Permitir que usuários criem suas próprias áreas
DROP POLICY IF EXISTS "Users can insert their own areas" ON areas;
CREATE POLICY "Users can insert their own areas" 
ON areas FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários atualizem suas próprias áreas
DROP POLICY IF EXISTS "Users can update their own areas" ON areas;
CREATE POLICY "Users can update their own areas" 
ON areas FOR UPDATE 
USING (auth.uid() = user_id);

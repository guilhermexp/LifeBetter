-- Script para criar tabelas e configurar Row Level Security
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar schema se não existir
CREATE SCHEMA IF NOT EXISTS public;

-- 1. Criar tabela user_profiles se não existir
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Criar tabela tasks se não existir
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  details TEXT,
  scheduled_date DATE,
  scheduled BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  priority TEXT, -- 'high', 'medium', 'low'
  color TEXT,
  type TEXT, -- 'task', 'meeting', 'habit', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Criar tabela mood_entries se não existir
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_type TEXT NOT NULL, -- 'anxiety', 'anger', 'fatigue', 'sadness', 'vigor', 'happiness'
  intensity INTEGER CHECK (intensity >= 0 AND intensity <= 10),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Criar tabela user_questionnaire se não existir
CREATE TABLE IF NOT EXISTS user_questionnaire (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  results JSONB, -- Estrutura para armazenar resultados dos questionários
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Criar tabela areas se não existir
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  area_type TEXT NOT NULL, -- 'health', 'business', 'growth', 'relationships'
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Após criar as tabelas, configurar Row Level Security (RLS)

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_questionnaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

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

-- Função para inserir perfil de usuário quando um novo usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente quando um novo usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Script para configurar Row Level Security nas tabelas existentes
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, verificar quais tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 1. Habilitar RLS apenas nas tabelas que existem no seu banco de dados
-- Este comando verifica se a tabela existe antes de habilitar RLS
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- Para tabela tasks
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'tasks'
    ) INTO table_exists;
    
    IF table_exists THEN
        EXECUTE 'ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;';
        
        -- Criar políticas para a tabela tasks
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;';
        EXECUTE 'CREATE POLICY "Users can view their own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;';
        EXECUTE 'CREATE POLICY "Users can insert their own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;';
        EXECUTE 'CREATE POLICY "Users can update their own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;';
        EXECUTE 'CREATE POLICY "Users can delete their own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);';
        
        RAISE NOTICE 'Configurações RLS aplicadas para tabela tasks';
    ELSE
        RAISE NOTICE 'Tabela tasks não encontrada';
    END IF;

    -- Para tabela mood_entries
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'mood_entries'
    ) INTO table_exists;
    
    IF table_exists THEN
        EXECUTE 'ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;';
        
        -- Criar políticas para a tabela mood_entries
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own mood entries" ON mood_entries;';
        EXECUTE 'CREATE POLICY "Users can view their own mood entries" ON mood_entries FOR SELECT USING (auth.uid() = user_id);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own mood entries" ON mood_entries;';
        EXECUTE 'CREATE POLICY "Users can insert their own mood entries" ON mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own mood entries" ON mood_entries;';
        EXECUTE 'CREATE POLICY "Users can update their own mood entries" ON mood_entries FOR UPDATE USING (auth.uid() = user_id);';
        
        RAISE NOTICE 'Configurações RLS aplicadas para tabela mood_entries';
    ELSE
        RAISE NOTICE 'Tabela mood_entries não encontrada';
    END IF;

    -- Para tabela user_questionnaire
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_questionnaire'
    ) INTO table_exists;
    
    IF table_exists THEN
        EXECUTE 'ALTER TABLE user_questionnaire ENABLE ROW LEVEL SECURITY;';
        
        -- Criar políticas para a tabela user_questionnaire
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own questionnaires" ON user_questionnaire;';
        EXECUTE 'CREATE POLICY "Users can view their own questionnaires" ON user_questionnaire FOR SELECT USING (auth.uid() = user_id);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own questionnaires" ON user_questionnaire;';
        EXECUTE 'CREATE POLICY "Users can insert their own questionnaires" ON user_questionnaire FOR INSERT WITH CHECK (auth.uid() = user_id);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own questionnaires" ON user_questionnaire;';
        EXECUTE 'CREATE POLICY "Users can update their own questionnaires" ON user_questionnaire FOR UPDATE USING (auth.uid() = user_id);';
        
        RAISE NOTICE 'Configurações RLS aplicadas para tabela user_questionnaire';
    ELSE
        RAISE NOTICE 'Tabela user_questionnaire não encontrada';
    END IF;

    -- Para tabela profiles (geralmente usada pelo Supabase Auth)
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        EXECUTE 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;';
        
        -- Criar políticas para a tabela profiles
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;';
        EXECUTE 'CREATE POLICY "Users can view their own profiles" ON profiles FOR SELECT USING (auth.uid() = id);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;';
        EXECUTE 'CREATE POLICY "Users can update their own profiles" ON profiles FOR UPDATE USING (auth.uid() = id);';
        
        RAISE NOTICE 'Configurações RLS aplicadas para tabela profiles';
    ELSE
        RAISE NOTICE 'Tabela profiles não encontrada';
    END IF;

    -- Para tabela user_profiles (alternativa à profiles)
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        EXECUTE 'ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;';
        
        -- Criar políticas para a tabela user_profiles
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own user profiles" ON user_profiles;';
        EXECUTE 'CREATE POLICY "Users can view their own user profiles" ON user_profiles FOR SELECT USING (auth.uid() = id);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own user profiles" ON user_profiles;';
        EXECUTE 'CREATE POLICY "Users can update their own user profiles" ON user_profiles FOR UPDATE USING (auth.uid() = id);';
        
        RAISE NOTICE 'Configurações RLS aplicadas para tabela user_profiles';
    ELSE
        RAISE NOTICE 'Tabela user_profiles não encontrada';
    END IF;

    -- Para tabela areas
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'areas'
    ) INTO table_exists;
    
    IF table_exists THEN
        EXECUTE 'ALTER TABLE areas ENABLE ROW LEVEL SECURITY;';
        
        -- Criar políticas para a tabela areas
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own areas" ON areas;';
        EXECUTE 'CREATE POLICY "Users can view their own areas" ON areas FOR SELECT USING (auth.uid() = user_id);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own areas" ON areas;';
        EXECUTE 'CREATE POLICY "Users can insert their own areas" ON areas FOR INSERT WITH CHECK (auth.uid() = user_id);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own areas" ON areas;';
        EXECUTE 'CREATE POLICY "Users can update their own areas" ON areas FOR UPDATE USING (auth.uid() = user_id);';
        
        RAISE NOTICE 'Configurações RLS aplicadas para tabela areas';
    ELSE
        RAISE NOTICE 'Tabela areas não encontrada';
    END IF;
END $$;

-- Verificar as políticas criadas
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
ORDER BY tablename;

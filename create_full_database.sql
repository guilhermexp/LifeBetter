-- Script completo para criar e configurar o banco de dados Supabase
-- Esse script irá criar todas as tabelas necessárias, configurar políticas e adicionar dados de exemplo

-- 1. Criar as tabelas principais se não existirem
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
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

CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_type TEXT NOT NULL, -- 'anxiety', 'anger', 'fatigue', 'sadness', 'vigor', 'happiness'
  intensity INTEGER CHECK (intensity >= 0 AND intensity <= 10),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.areas (
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

-- 2. Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

-- 3. Criar função para adicionar perfil quando um novo usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
          COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger para adicionar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Adicionar políticas para permitir acesso público temporário
-- Políticas para profiles
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para tasks
DROP POLICY IF EXISTS "Anyone can read tasks" ON public.tasks;
CREATE POLICY "Anyone can read tasks" ON public.tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert tasks" ON public.tasks;
CREATE POLICY "Anyone can insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update tasks" ON public.tasks;
CREATE POLICY "Anyone can update tasks" ON public.tasks FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete tasks" ON public.tasks;
CREATE POLICY "Anyone can delete tasks" ON public.tasks FOR DELETE USING (true);

-- Políticas para mood_entries
DROP POLICY IF EXISTS "Anyone can read mood_entries" ON public.mood_entries;
CREATE POLICY "Anyone can read mood_entries" ON public.mood_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert mood_entries" ON public.mood_entries;
CREATE POLICY "Anyone can insert mood_entries" ON public.mood_entries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update mood_entries" ON public.mood_entries;
CREATE POLICY "Anyone can update mood_entries" ON public.mood_entries FOR UPDATE USING (true);

-- Políticas para areas
DROP POLICY IF EXISTS "Anyone can read areas" ON public.areas;
CREATE POLICY "Anyone can read areas" ON public.areas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert areas" ON public.areas;
CREATE POLICY "Anyone can insert areas" ON public.areas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update areas" ON public.areas;
CREATE POLICY "Anyone can update areas" ON public.areas FOR UPDATE USING (true);

-- 6. Inserir dados de exemplo para usuários existentes
DO $$
DECLARE
    user_record RECORD;
    user_id uuid;
    task_id uuid;
    current_date date := CURRENT_DATE;
    yesterday date := CURRENT_DATE - INTERVAL '1 day';
    tomorrow date := CURRENT_DATE + INTERVAL '1 day';
BEGIN
    -- Para cada usuário no sistema
    FOR user_record IN SELECT id, email FROM auth.users
    LOOP
        user_id := user_record.id;
        RAISE NOTICE 'Inserindo dados para o usuário % (%)', user_id, user_record.email;
        
        -- Limpar tarefas existentes deste usuário
        EXECUTE 'DELETE FROM tasks WHERE user_id = $1' USING user_id;
        
        -- Tarefa para hoje (pendente)
        INSERT INTO tasks (
            id, user_id, title, details, scheduled_date, 
            scheduled, completed, priority, type
        ) VALUES (
            gen_random_uuid(), user_id, 'Revisar emails', 
            'Responder mensagens pendentes', current_date, 
            true, false, 'high', 'task'
        ) RETURNING id INTO task_id;
        
        -- Tarefa para hoje (concluída)
        INSERT INTO tasks (
            id, user_id, title, details, scheduled_date, 
            scheduled, completed, priority, type
        ) VALUES (
            gen_random_uuid(), user_id, 'Organizar arquivos', 
            'Criar pastas por categorias', current_date, 
            true, true, 'medium', 'task'
        );
        
        -- Tarefa atrasada
        INSERT INTO tasks (
            id, user_id, title, details, scheduled_date, 
            scheduled, completed, priority, type
        ) VALUES (
            gen_random_uuid(), user_id, 'Entrega de relatório', 
            'Finalizar e enviar para o supervisor', yesterday, 
            true, false, 'high', 'task'
        );
        
        -- Tarefa futura
        INSERT INTO tasks (
            id, user_id, title, details, scheduled_date, 
            scheduled, completed, priority, type
        ) VALUES (
            gen_random_uuid(), user_id, 'Reunião com equipe', 
            'Alinhar próximos passos do projeto', tomorrow, 
            true, false, 'medium', 'meeting'
        );
        
        -- Limpar áreas existentes deste usuário
        EXECUTE 'DELETE FROM areas WHERE user_id = $1' USING user_id;
        
        -- Inserir áreas de exemplo
        INSERT INTO areas (
            id, user_id, area_type, name, description, progress
        ) VALUES
            (gen_random_uuid(), user_id, 'health', 'Saúde', 'Exercícios e bem-estar', 40),
            (gen_random_uuid(), user_id, 'business', 'Trabalho', 'Carreira e finanças', 65),
            (gen_random_uuid(), user_id, 'growth', 'Desenvolvimento', 'Aprendizado pessoal', 25),
            (gen_random_uuid(), user_id, 'relationships', 'Relacionamentos', 'Família e amigos', 50);
    END LOOP;
END $$;

-- 7. Verificar configuração final
SELECT 'profiles' as table_name, COUNT(*) FROM public.profiles
UNION ALL
SELECT 'tasks' as table_name, COUNT(*) FROM public.tasks
UNION ALL
SELECT 'mood_entries' as table_name, COUNT(*) FROM public.mood_entries
UNION ALL
SELECT 'areas' as table_name, COUNT(*) FROM public.areas;

-- 8. Listar políticas ativas
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';

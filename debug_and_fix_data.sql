-- Script para diagnóstico e correção de problemas de dados
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar quais tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Verificar políticas existentes
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies;

-- 3. Verificar usuários autenticados
SELECT id, email 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Verificar se existem dados nas tabelas principais
SELECT 'tasks' as tabela, COUNT(*) as registros FROM tasks
UNION ALL
SELECT 'mood_entries' as tabela, COUNT(*) as registros FROM mood_entries
UNION ALL
SELECT 'areas' as tabela, COUNT(*) as registros FROM areas
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'areas');

-- 5. Adicionar políticas com acesso público temporário para depuração
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- Tabela tasks
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'tasks'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Adicionar política permissiva para SELECT
        EXECUTE 'DROP POLICY IF EXISTS "Debug allow all select tasks" ON tasks;';
        EXECUTE 'CREATE POLICY "Debug allow all select tasks" ON tasks FOR SELECT USING (true);';
        
        -- Política para INSERT continua protegida
        EXECUTE 'DROP POLICY IF EXISTS "Debug allow all insert tasks" ON tasks;';
        EXECUTE 'CREATE POLICY "Debug allow all insert tasks" ON tasks FOR INSERT WITH CHECK (true);';
        
        -- Política para UPDATE continua protegida
        EXECUTE 'DROP POLICY IF EXISTS "Debug allow all update tasks" ON tasks;';
        EXECUTE 'CREATE POLICY "Debug allow all update tasks" ON tasks FOR UPDATE USING (true);';
        
        RAISE NOTICE 'Políticas de depuração aplicadas para tasks';
    END IF;
    
    -- Tabela mood_entries
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'mood_entries'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Adicionar política permissiva para SELECT
        EXECUTE 'DROP POLICY IF EXISTS "Debug allow all select mood_entries" ON mood_entries;';
        EXECUTE 'CREATE POLICY "Debug allow all select mood_entries" ON mood_entries FOR SELECT USING (true);';
        
        RAISE NOTICE 'Políticas de depuração aplicadas para mood_entries';
    END IF;
    
    -- Tabela areas
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'areas'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Adicionar política permissiva para SELECT
        EXECUTE 'DROP POLICY IF EXISTS "Debug allow all select areas" ON areas;';
        EXECUTE 'CREATE POLICY "Debug allow all select areas" ON areas FOR SELECT USING (true);';
        
        RAISE NOTICE 'Políticas de depuração aplicadas para areas';
    END IF;
END $$;

-- 6. Inserir tarefas de exemplo para o usuário (substitua USER_ID pelo valor do seu usuário)
DO $$
DECLARE
    user_id uuid;
    task_id uuid;
    current_date date := CURRENT_DATE;
    yesterday date := CURRENT_DATE - INTERVAL '1 day';
    tomorrow date := CURRENT_DATE + INTERVAL '1 day';
    table_exists boolean;
BEGIN
    -- Obter o ID do usuário atual (usando o email correto)
    SELECT id INTO user_id FROM auth.users WHERE email = 'guilherme-varela@hotmail.com' LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'Usuário não encontrado. Verifique o email.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Inserindo dados para o usuário %', user_id;
    
    -- Verificar se a tabela tasks existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'tasks'
    ) INTO table_exists;
    
    IF table_exists THEN
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
        
        RAISE NOTICE 'Tarefa 1 criada: %', task_id;
        
        -- Tarefa para hoje (concluída)
        INSERT INTO tasks (
            id, user_id, title, details, scheduled_date, 
            scheduled, completed, priority, type
        ) VALUES (
            gen_random_uuid(), user_id, 'Organizar arquivos', 
            'Criar pastas por categorias', current_date, 
            true, true, 'medium', 'task'
        ) RETURNING id INTO task_id;
        
        RAISE NOTICE 'Tarefa 2 criada: %', task_id;
        
        -- Tarefa atrasada
        INSERT INTO tasks (
            id, user_id, title, details, scheduled_date, 
            scheduled, completed, priority, type
        ) VALUES (
            gen_random_uuid(), user_id, 'Entrega de relatório', 
            'Finalizar e enviar para o supervisor', yesterday, 
            true, false, 'high', 'task'
        ) RETURNING id INTO task_id;
        
        RAISE NOTICE 'Tarefa 3 criada: %', task_id;
        
        -- Tarefa futura
        INSERT INTO tasks (
            id, user_id, title, details, scheduled_date, 
            scheduled, completed, priority, type
        ) VALUES (
            gen_random_uuid(), user_id, 'Reunião com equipe', 
            'Alinhar próximos passos do projeto', tomorrow, 
            true, false, 'medium', 'meeting'
        ) RETURNING id INTO task_id;
        
        RAISE NOTICE 'Tarefa 4 criada: %', task_id;
        
        RAISE NOTICE 'Tarefas de exemplo inseridas com sucesso';
    ELSE
        RAISE NOTICE 'A tabela tasks não existe';
    END IF;
    
    -- Verificar se a tabela areas existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'areas'
    ) INTO table_exists;
    
    IF table_exists THEN
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
            
        RAISE NOTICE 'Áreas de exemplo inseridas com sucesso';
    ELSE
        RAISE NOTICE 'A tabela areas não existe';
    END IF;
    
END $$;

-- 7. Contar registros inseridos para o usuário
DO $$
DECLARE
    user_id uuid;
    task_count integer;
    area_count integer;
    table_exists boolean;
BEGIN
    -- Obter o ID do usuário atual
    SELECT id INTO user_id FROM auth.users WHERE email = 'guilherme-varela@hotmail.com' LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'Usuário não encontrado';
        RETURN;
    END IF;
    
    -- Contar tarefas do usuário
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'tasks'
    ) INTO table_exists;
    
    IF table_exists THEN
        EXECUTE 'SELECT COUNT(*) FROM tasks WHERE user_id = $1' INTO task_count USING user_id;
        RAISE NOTICE 'Tarefas do usuário %: %', user_id, task_count;
    END IF;
    
    -- Contar áreas do usuário
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'areas'
    ) INTO table_exists;
    
    IF table_exists THEN
        EXECUTE 'SELECT COUNT(*) FROM areas WHERE user_id = $1' INTO area_count USING user_id;
        RAISE NOTICE 'Áreas do usuário %: %', user_id, area_count;
    END IF;
END $$;

-- 8. Verificar as políticas atualizadas
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies;

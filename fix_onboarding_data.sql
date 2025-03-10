-- Script para corrigir problemas no fluxo de onboarding
-- Este script garante que todos os usuários tenham os registros necessários

-- 1. Garante que a tabela user_profiles tenha o campo onboarding_completed
ALTER TABLE IF EXISTS public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 2. Garante que a tabela user_questionnaire tenha o campo completed
ALTER TABLE IF EXISTS public.user_questionnaire 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- 3. Se o usuário específico estiver em loop (substitua USER_ID pelo ID do usuário com problema)
-- UPDATE public.user_profiles SET onboarding_completed = true WHERE id = 'USER_ID';

-- 4. Cria registros que podem estar faltando para usuários existentes
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Para cada usuário no sistema
  FOR user_record IN SELECT id FROM auth.users LOOP
    
    -- Verifica se o usuário tem um registro de perfil
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_record.id) THEN
      -- Cria um perfil para o usuário que não tem
      INSERT INTO public.user_profiles (id, onboarding_completed)
      VALUES (user_record.id, true);
    END IF;
    
    -- Verifica se o usuário tem um registro de questionário
    IF NOT EXISTS (SELECT 1 FROM public.user_questionnaire WHERE user_id = user_record.id) THEN
      -- Cria um registro de questionário vazio
      INSERT INTO public.user_questionnaire (user_id, results, completed)
      VALUES (user_record.id, '{}', false);
    END IF;
    
  END LOOP;
END $$;

-- 5. Correção de emergência: Marca todos os usuários como tendo completado o onboarding
-- ATENÇÃO: Use apenas se precisar desbloquear todos os usuários imediatamente
-- UPDATE public.user_profiles SET onboarding_completed = true;

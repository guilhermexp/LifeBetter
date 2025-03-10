-- Adicionar o campo onboarding_completed à tabela user_profiles
ALTER TABLE IF EXISTS public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Atualizar o trigger handle_new_user para inicializar o campo onboarding_completed
-- Função para inserir perfil de usuário quando um novo usuário é criado, incluindo 
-- inicialização do campo onboarding_completed como false
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Criar perfil do usuário
  INSERT INTO public.user_profiles (id, email, username, onboarding_completed)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', false);
  
  -- Criar registro de questionário vazio para o usuário
  INSERT INTO public.user_questionnaire (user_id, results, completed)
  VALUES (new.id, '{}', false);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Manter o trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

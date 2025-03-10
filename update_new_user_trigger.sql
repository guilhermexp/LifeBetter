-- Atualiza a função handle_new_user para também criar um registro na tabela user_questionnaire
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Criar perfil do usuário
  INSERT INTO public.user_profiles (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
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

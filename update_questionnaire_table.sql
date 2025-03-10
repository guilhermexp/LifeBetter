-- Atualiza a tabela de questionário do usuário para armazenar os resultados corretamente

-- 1. Verifica se a tabela já existe, se não, cria-a
CREATE TABLE IF NOT EXISTS public.user_questionnaire (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    results JSONB DEFAULT '{}',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Adiciona políticas RLS para a tabela
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_questionnaire' AND policyname = 'Users can read their own questionnaire') THEN
        CREATE POLICY "Users can read their own questionnaire" ON public.user_questionnaire
        FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_questionnaire' AND policyname = 'Users can insert their own questionnaire') THEN
        CREATE POLICY "Users can insert their own questionnaire" ON public.user_questionnaire
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_questionnaire' AND policyname = 'Users can update their own questionnaire') THEN
        CREATE POLICY "Users can update their own questionnaire" ON public.user_questionnaire
        FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 3. Ativar RLS
ALTER TABLE public.user_questionnaire ENABLE ROW LEVEL SECURITY;

-- 4. Verifica se a coluna results existe, se não, adiciona-a
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                 WHERE table_schema='public' AND table_name='user_questionnaire' AND column_name='results') THEN
        ALTER TABLE public.user_questionnaire ADD COLUMN results JSONB DEFAULT '{}';
    END IF;
END
$$;

-- 5. Verifica se a coluna completed existe, se não, adiciona-a
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                 WHERE table_schema='public' AND table_name='user_questionnaire' AND column_name='completed') THEN
        ALTER TABLE public.user_questionnaire ADD COLUMN completed BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- 6. Insert function for automatically creating a questionnaire record for new users (if one doesn't exist)
CREATE OR REPLACE FUNCTION public.create_user_questionnaire_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Create a questionnaire record if one doesn't exist
    IF NOT EXISTS (SELECT 1 FROM public.user_questionnaire WHERE user_id = NEW.id) THEN
        INSERT INTO public.user_questionnaire (user_id, results, completed)
        VALUES (NEW.id, '{}', FALSE);
    END IF;
    RETURN NEW;
END;
$$;

-- 7. Check if the trigger already exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'create_questionnaire_on_signup') THEN
        CREATE TRIGGER create_questionnaire_on_signup
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.create_user_questionnaire_on_signup();
    END IF;
END
$$;

-- 8. Create a migration function to convert old questionnaire data to the new format if needed
CREATE OR REPLACE FUNCTION public.migrate_questionnaire_data()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    questionnaire_record RECORD;
BEGIN
    FOR questionnaire_record IN SELECT * FROM public.user_questionnaire WHERE results IS NULL OR results = '{}'::jsonb
    LOOP
        -- Create a basic default structure for each area with a default score of 0
        UPDATE public.user_questionnaire
        SET results = jsonb_build_object(
            'health', jsonb_build_object('overall', 0),
            'career_finance', jsonb_build_object('overall', 0),
            'personal_growth', jsonb_build_object('overall', 0), 
            'relationships', jsonb_build_object('overall', 0),
            'impact', jsonb_build_object('overall', 0)
        )
        WHERE id = questionnaire_record.id;
    END LOOP;
END;
$$;

-- 9. Run the migration function
SELECT public.migrate_questionnaire_data();

-- 10. Create a function to add missing fields to existing questionnaire records
CREATE OR REPLACE FUNCTION public.ensure_all_questionnaire_fields()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    questionnaire_record RECORD;
    current_results JSONB;
BEGIN
    FOR questionnaire_record IN SELECT * FROM public.user_questionnaire
    LOOP
        current_results := questionnaire_record.results;
        
        -- Ensure all pillars exist in the results
        IF NOT current_results ? 'health' THEN
            current_results := current_results || jsonb_build_object('health', jsonb_build_object('overall', 0));
        END IF;
        
        IF NOT current_results ? 'career_finance' THEN
            current_results := current_results || jsonb_build_object('career_finance', jsonb_build_object('overall', 0));
        END IF;
        
        IF NOT current_results ? 'personal_growth' THEN
            current_results := current_results || jsonb_build_object('personal_growth', jsonb_build_object('overall', 0));
        END IF;
        
        IF NOT current_results ? 'relationships' THEN
            current_results := current_results || jsonb_build_object('relationships', jsonb_build_object('overall', 0));
        END IF;
        
        IF NOT current_results ? 'impact' THEN
            current_results := current_results || jsonb_build_object('impact', jsonb_build_object('overall', 0));
        END IF;

        -- Update with the guaranteed structure
        UPDATE public.user_questionnaire
        SET results = current_results
        WHERE id = questionnaire_record.id;
    END LOOP;
END;
$$;

-- 11. Run the function to ensure all fields are present
SELECT public.ensure_all_questionnaire_fields();
